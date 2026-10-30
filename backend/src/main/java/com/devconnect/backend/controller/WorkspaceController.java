package com.devconnect.backend.controller;

import com.devconnect.backend.dto.*;
import com.devconnect.backend.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping("/projects/{projectId}/workspace")
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        WorkspaceResponse response = workspaceService.createWorkspaceForProject(projectId, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/workspaces")
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces(
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(principal.getUsername()));
    }

    @GetMapping("/workspaces/{id}")
    public ResponseEntity<WorkspaceDetailResponse> getWorkspaceDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.getWorkspaceDetails(id, principal.getUsername()));
    }

    @GetMapping("/workspaces/{id}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> getWorkspaceMembers(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.getWorkspaceMembers(id, principal.getUsername()));
    }

    @DeleteMapping("/workspaces/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        workspaceService.removeMember(id, userId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/workspaces/{id}/join-requests")
    public ResponseEntity<JoinRequestResponse> createJoinRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        JoinRequestResponse response = workspaceService.createJoinRequest(id, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/workspaces/{id}/join-requests")
    public ResponseEntity<List<JoinRequestResponse>> getPendingJoinRequests(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.getPendingJoinRequests(id, principal.getUsername()));
    }

    @PutMapping("/join-requests/{id}")
    public ResponseEntity<JoinRequestResponse> updateJoinRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJoinRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.updateJoinRequest(id, request.getStatus(), principal.getUsername()));
    }

    @GetMapping("/workspaces/{id}/channels")
    public ResponseEntity<List<ChannelResponse>> getWorkspaceChannels(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(workspaceService.getWorkspaceChannels(id, principal.getUsername()));
    }

    @PostMapping("/workspaces/{id}/channels")
    public ResponseEntity<ChannelResponse> createChannel(
            @PathVariable Long id,
            @Valid @RequestBody CreateChannelRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        ChannelResponse response = workspaceService.createChannel(id, request.getName(), principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

