package com.devconnect.backend.controller;

import com.devconnect.backend.dto.AdminWorkspaceResponse;
import com.devconnect.backend.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/workspaces")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWorkspaceController {

    private final WorkspaceService workspaceService;

    public AdminWorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<List<AdminWorkspaceResponse>> listAllWorkspaces() {
        return ResponseEntity.ok(workspaceService.getAllWorkspacesForAdmin());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspaceByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}

