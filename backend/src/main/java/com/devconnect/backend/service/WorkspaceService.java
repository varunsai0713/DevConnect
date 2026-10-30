package com.devconnect.backend.service;

import com.devconnect.backend.dto.*;
import com.devconnect.backend.model.*;
import com.devconnect.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class WorkspaceService {

    private static final Pattern CHANNEL_NAME_PATTERN = Pattern.compile("^[a-z0-9-]+$");

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ChannelRepository channelRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MessageRepository messageRepository;
    private final ChannelReadRepository channelReadRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ChannelRepository channelRepository,
            JoinRequestRepository joinRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            MessageRepository messageRepository,
            ChannelReadRepository channelReadRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.channelRepository = channelRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.messageRepository = messageRepository;
        this.channelReadRepository = channelReadRepository;
    }

    @Transactional
    public WorkspaceResponse createWorkspaceForProject(Long projectId, String username) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        User caller = getUserByUsername(username);

        if (!project.getCreator().getId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can create a workspace");
        }

        if (workspaceRepository.existsByProjectId(projectId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A workspace already exists for this project");
        }

        Workspace workspace = Workspace.builder()
                .project(project)
                .name(project.getTitle())
                .createdBy(caller)
                .build();
        workspace = workspaceRepository.save(workspace);

        // Add owner to members
        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .id(new WorkspaceMemberId(workspace.getId(), caller.getId()))
                .workspace(workspace)
                .user(caller)
                .role(WorkspaceRole.OWNER)
                .build();
        workspaceMemberRepository.save(ownerMember);

        // Create default 'general' channel
        Channel generalChannel = Channel.builder()
                .workspace(workspace)
                .name("general")
                .createdBy(caller)
                .build();
        channelRepository.save(generalChannel);

        return toWorkspaceResponse(workspace, WorkspaceRole.OWNER, 0, 1, 1);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getUserWorkspaces(String username) {
        User caller = getUserByUsername(username);
        List<Workspace> workspaces = workspaceRepository.findWorkspacesByUserId(caller.getId());

        return workspaces.stream().map(ws -> {
            WorkspaceRole role = workspaceMemberRepository
                    .findByWorkspaceIdAndUserId(ws.getId(), caller.getId())
                    .map(WorkspaceMember::getRole)
                    .orElse(WorkspaceRole.MEMBER);
            long membersCount = workspaceMemberRepository.countByWorkspaceId(ws.getId());
            List<Channel> channels = channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(ws.getId());
            long totalUnread = 0;
            for (Channel ch : channels) {
                Long lastReadId = channelReadRepository.findByChannelIdAndUserId(ch.getId(), caller.getId())
                        .map(ChannelRead::getLastReadMessageId).orElse(0L);
                totalUnread += messageRepository.countUnreadMessages(ch.getId(), lastReadId);
            }
            return toWorkspaceResponse(ws, role, totalUnread, membersCount, channels.size());
        }).toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceDetailResponse getWorkspaceDetails(Long workspaceId, String username) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, caller.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace"));

        List<ChannelResponse> channels = channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId)
                .stream()
                .map(ch -> {
                    Long lastReadId = channelReadRepository.findByChannelIdAndUserId(ch.getId(), caller.getId())
                            .map(ChannelRead::getLastReadMessageId).orElse(0L);
                    long unreadCount = messageRepository.countUnreadMessages(ch.getId(), lastReadId);
                    return ChannelResponse.builder()
                            .id(ch.getId())
                            .workspaceId(ch.getWorkspace().getId())
                            .name(ch.getName())
                            .createdAt(ch.getCreatedAt())
                            .unreadCount(unreadCount)
                            .build();
                })
                .toList();

        long membersCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);

        return WorkspaceDetailResponse.builder()
                .id(workspace.getId())
                .projectId(workspace.getProject().getId())
                .name(workspace.getName())
                .createdBy(workspace.getCreatedBy().getUsername())
                .createdAt(workspace.getCreatedAt())
                .userRole(member.getRole())
                .channels(channels)
                .membersCount(membersCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId, String username) {
        getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace");
        }

        return workspaceMemberRepository.findByWorkspaceIdOrderByJoinedAtAsc(workspaceId)
                .stream()
                .map(m -> WorkspaceMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .fullName(m.getUser().getFullName())
                        .avatar(m.getUser().getAvatar())
                        .role(m.getRole())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void removeMember(Long workspaceId, Long targetUserId, String username) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        WorkspaceMember callerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, caller.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace"));

        WorkspaceMember targetMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user is not a member of this workspace"));

        boolean isSelfLeaving = caller.getId().equals(targetUserId);
        boolean isOwner = callerMember.getRole() == WorkspaceRole.OWNER;

        if (!isSelfLeaving && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only workspace owners can remove other members");
        }

        workspaceMemberRepository.deleteByWorkspaceIdAndUserId(workspaceId, targetUserId);

        // Notify member if removed by owner
        if (!isSelfLeaving) {
            notificationService.createNotification(
                    targetMember.getUser(),
                    "WORKSPACE_REMOVED",
                    "You were removed from workspace \"" + workspace.getName() + "\"."
            );
        }
    }

    @Transactional
    public JoinRequestResponse createJoinRequest(Long workspaceId, String username) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, caller.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are already a member of this workspace");
        }

        if (joinRequestRepository.existsByWorkspaceIdAndUserId(workspaceId, caller.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A join request already exists for this workspace");
        }

        JoinRequest request = JoinRequest.builder()
                .workspace(workspace)
                .user(caller)
                .status(JoinRequestStatus.PENDING)
                .build();
        request = joinRequestRepository.save(request);

        // Notify workspace owner
        notificationService.createNotification(
                workspace.getCreatedBy(),
                "JOIN_REQUEST_RECEIVED",
                caller.getFullName() + " requested to join workspace \"" + workspace.getName() + "\"."
        );

        return toJoinRequestResponse(request);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getPendingJoinRequests(Long workspaceId, String username) {
        getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, caller.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the workspace owner can view join requests");
        }

        return joinRequestRepository.findByWorkspaceIdAndStatusOrderByCreatedAtDesc(workspaceId, JoinRequestStatus.PENDING)
                .stream()
                .map(this::toJoinRequestResponse)
                .toList();
    }

    @Transactional
    public JoinRequestResponse updateJoinRequest(Long requestId, JoinRequestStatus newStatus, String username) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join request not found"));

        Workspace workspace = request.getWorkspace();
        User caller = getUserByUsername(username);

        WorkspaceMember callerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), caller.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace"));

        if (callerMember.getRole() != WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the workspace owner can accept or decline requests");
        }

        request.setStatus(newStatus);
        request = joinRequestRepository.save(request);

        if (newStatus == JoinRequestStatus.ACCEPTED) {
            if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), request.getUser().getId())) {
                WorkspaceMember newMember = WorkspaceMember.builder()
                        .id(new WorkspaceMemberId(workspace.getId(), request.getUser().getId()))
                        .workspace(workspace)
                        .user(request.getUser())
                        .role(WorkspaceRole.MEMBER)
                        .build();
                workspaceMemberRepository.save(newMember);
            }

            notificationService.createNotification(
                    request.getUser(),
                    "JOIN_REQUEST_ACCEPTED",
                    "Your request to join workspace \"" + workspace.getName() + "\" was accepted."
            );
        } else if (newStatus == JoinRequestStatus.DECLINED) {
            notificationService.createNotification(
                    request.getUser(),
                    "JOIN_REQUEST_DECLINED",
                    "Your request to join workspace \"" + workspace.getName() + "\" was declined."
            );
        }

        return toJoinRequestResponse(request);
    }

    @Transactional(readOnly = true)
    public List<ChannelResponse> getWorkspaceChannels(Long workspaceId, String username) {
        getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace");
        }

        return channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId)
                .stream()
                .map(ch -> {
                    Long lastReadId = channelReadRepository.findByChannelIdAndUserId(ch.getId(), caller.getId())
                            .map(ChannelRead::getLastReadMessageId).orElse(0L);
                    long unreadCount = messageRepository.countUnreadMessages(ch.getId(), lastReadId);
                    return ChannelResponse.builder()
                            .id(ch.getId())
                            .workspaceId(ch.getWorkspace().getId())
                            .name(ch.getName())
                            .createdAt(ch.getCreatedAt())
                            .unreadCount(unreadCount)
                            .build();
                })
                .toList();
    }

    @Transactional
    public ChannelResponse createChannel(Long workspaceId, String channelName, String username) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User caller = getUserByUsername(username);

        WorkspaceMember callerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, caller.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace"));

        if (callerMember.getRole() != WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the workspace owner can create channels");
        }

        String normalizedName = channelName == null ? "" : channelName.trim().toLowerCase();
        if (normalizedName.length() < 2 || normalizedName.length() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel name must be between 2 and 30 characters");
        }

        if (!CHANNEL_NAME_PATTERN.matcher(normalizedName).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel name must contain only lowercase letters, numbers, and hyphens");
        }

        if (channelRepository.existsByWorkspaceIdAndName(workspaceId, normalizedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Channel name already exists in this workspace");
        }

        Channel channel = Channel.builder()
                .workspace(workspace)
                .name(normalizedName)
                .createdBy(caller)
                .build();
        channel = channelRepository.save(channel);

        return ChannelResponse.builder()
                .id(channel.getId())
                .workspaceId(workspaceId)
                .name(channel.getName())
                .createdAt(channel.getCreatedAt())
                .unreadCount(0)
                .build();
    }

    // Admin Operations
    @Transactional(readOnly = true)
    public List<AdminWorkspaceResponse> getAllWorkspacesForAdmin() {
        return workspaceRepository.findAll().stream().map(ws -> AdminWorkspaceResponse.builder()
                .id(ws.getId())
                .projectId(ws.getProject().getId())
                .projectTitle(ws.getProject().getTitle())
                .name(ws.getName())
                .createdByUsername(ws.getCreatedBy().getUsername())
                .createdByEmail(ws.getCreatedBy().getEmail())
                .createdAt(ws.getCreatedAt())
                .membersCount(workspaceMemberRepository.countByWorkspaceId(ws.getId()))
                .channelsCount(channelRepository.countByWorkspaceId(ws.getId()))
                .build()
        ).toList();
    }

    @Transactional
    public void deleteWorkspaceByAdmin(Long workspaceId) {
        Workspace workspace = getWorkspaceById(workspaceId);

        // Delete associated records
        joinRequestRepository.deleteAll(joinRequestRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId));
        channelRepository.deleteAll(channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId));
        workspaceMemberRepository.deleteAll(workspaceMemberRepository.findByWorkspaceIdOrderByJoinedAtAsc(workspaceId));
        workspaceRepository.delete(workspace);
    }

    // Helper methods
    private Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private WorkspaceResponse toWorkspaceResponse(
            Workspace ws,
            WorkspaceRole role,
            long totalUnread,
            long membersCount,
            long channelsCount
    ) {
        return WorkspaceResponse.builder()
                .id(ws.getId())
                .projectId(ws.getProject().getId())
                .name(ws.getName())
                .createdBy(ws.getCreatedBy().getUsername())
                .createdAt(ws.getCreatedAt())
                .userRole(role)
                .totalUnread(totalUnread)
                .membersCount(membersCount)
                .channelsCount(channelsCount)
                .build();
    }

    private JoinRequestResponse toJoinRequestResponse(JoinRequest r) {
        return JoinRequestResponse.builder()
                .id(r.getId())
                .workspaceId(r.getWorkspace().getId())
                .workspaceName(r.getWorkspace().getName())
                .userId(r.getUser().getId())
                .username(r.getUser().getUsername())
                .fullName(r.getUser().getFullName())
                .avatar(r.getUser().getAvatar())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

