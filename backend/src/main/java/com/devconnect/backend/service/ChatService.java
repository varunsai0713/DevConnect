package com.devconnect.backend.service;

import com.devconnect.backend.dto.ChatMessageRequest;
import com.devconnect.backend.dto.ChatMessageResponse;
import com.devconnect.backend.dto.ChannelReadResponse;
import com.devconnect.backend.model.*;
import com.devconnect.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ChannelReadRepository channelReadRepository;
    private final UserRepository userRepository;

    public ChatService(
            MessageRepository messageRepository,
            ChannelRepository channelRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ChannelReadRepository channelReadRepository,
            UserRepository userRepository
    ) {
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.channelReadRepository = channelReadRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChatMessageResponse saveMessage(Long channelId, ChatMessageRequest request, String username) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        // Check if user is a member of the workspace
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(channel.getWorkspace().getId(), sender.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace");
        }

        // Validate content
        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }
        if (content.length() > 4000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot exceed 4000 characters");
        }

        // Sanitize to plain text (strip tags / never HTML)
        String plainTextContent = stripHtmlTags(content);
        if (plainTextContent.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }

        String clientMessageId = request.getClientMessageId();
        if (clientMessageId == null || clientMessageId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientMessageId is required");
        }

        // Deduplication: if duplicate clientMessageId exists for this channel and sender, return existing
        Optional<Message> existing = messageRepository.findByChannelIdAndSenderIdAndClientMessageId(
                channelId, sender.getId(), clientMessageId.trim());
        if (existing.isPresent()) {
            return toChatMessageResponse(existing.get());
        }

        // Persist message in PostgreSQL BEFORE returning for broadcast
        Message message = Message.builder()
                .channel(channel)
                .sender(sender)
                .content(plainTextContent)
                .clientMessageId(clientMessageId.trim())
                .build();
        message = messageRepository.save(message);

        return toChatMessageResponse(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChannelMessages(Long channelId, Long beforeId, int limit, String username) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        User caller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(channel.getWorkspace().getId(), caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace");
        }

        int pageSize = Math.min(Math.max(limit, 1), 50);
        Pageable pageable = PageRequest.of(0, pageSize);

        List<Message> messages;
        if (beforeId != null && beforeId > 0) {
            messages = messageRepository.findByChannelIdAndIdLessThanOrderByIdDesc(channelId, beforeId, pageable);
        } else {
            messages = messageRepository.findByChannelIdOrderByIdDesc(channelId, pageable);
        }

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    @Transactional
    public ChannelReadResponse markChannelAsRead(Long channelId, Long lastReadMessageId, String username) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        User caller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(channel.getWorkspace().getId(), caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this workspace");
        }

        ChannelReadId readId = new ChannelReadId(channelId, caller.getId());
        ChannelRead channelRead = channelReadRepository.findById(readId)
                .orElseGet(() -> ChannelRead.builder()
                        .id(readId)
                        .channel(channel)
                        .user(caller)
                        .lastReadMessageId(0L)
                        .build());

        if (lastReadMessageId != null && lastReadMessageId > channelRead.getLastReadMessageId()) {
            channelRead.setLastReadMessageId(lastReadMessageId);
        }
        channelReadRepository.save(channelRead);

        long unreadCount = messageRepository.countUnreadMessages(channelId, channelRead.getLastReadMessageId());

        return ChannelReadResponse.builder()
                .channelId(channelId)
                .userId(caller.getId())
                .lastReadMessageId(channelRead.getLastReadMessageId())
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional(readOnly = true)
    public long getChannelUnreadCount(Long channelId, Long userId) {
        Optional<ChannelRead> readOpt = channelReadRepository.findByChannelIdAndUserId(channelId, userId);
        Long lastReadId = readOpt.map(ChannelRead::getLastReadMessageId).orElse(0L);
        return messageRepository.countUnreadMessages(channelId, lastReadId);
    }

    @Transactional(readOnly = true)
    public long getWorkspaceTotalUnread(Long workspaceId, Long userId) {
        List<Channel> channels = channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId);
        long total = 0;
        for (Channel channel : channels) {
            total += getChannelUnreadCount(channel.getId(), userId);
        }
        return total;
    }

    @Transactional(readOnly = true)
    public boolean isUserMemberOfChannelWorkspace(Long channelId, String username) {
        Optional<Channel> channelOpt = channelRepository.findById(channelId);
        if (channelOpt.isEmpty()) return false;
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        return workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                channelOpt.get().getWorkspace().getId(), userOpt.get().getId());
    }

    @Transactional(readOnly = true)
    public boolean isUserMemberOfWorkspace(Long workspaceId, String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        return workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userOpt.get().getId());
    }

    public ChatMessageResponse toChatMessageResponse(Message m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .channelId(m.getChannel().getId())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSender().getUsername())
                .senderFullName(m.getSender().getFullName())
                .senderAvatar(m.getSender().getAvatar())
                .content(m.getContent())
                .clientMessageId(m.getClientMessageId())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private String stripHtmlTags(String input) {
        if (input == null) return "";
        return input.replaceAll("<[^>]*>", "").trim();
    }
}

