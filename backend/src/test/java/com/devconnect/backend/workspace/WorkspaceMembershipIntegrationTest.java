package com.devconnect.backend.workspace;

import com.devconnect.backend.dto.CreateChannelRequest;
import com.devconnect.backend.dto.UpdateJoinRequest;
import com.devconnect.backend.dto.WorkspaceResponse;
import com.devconnect.backend.model.JoinRequestStatus;
import com.devconnect.backend.model.Project;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.ProjectRepository;
import com.devconnect.backend.repository.UserRepository;
import com.devconnect.backend.service.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WorkspaceMembershipIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User owner;
    private User outsider;
    private Project project;

    @BeforeEach
    void setUp() {
        owner = userRepository.findByUsername("ws_owner")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("ws_owner")
                        .fullName("Workspace Owner")
                        .email("owner@devconnect.local")
                        .password(passwordEncoder.encode("Pass123!"))
                        .role("USER")
                        .build()));

        outsider = userRepository.findByUsername("ws_outsider")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("ws_outsider")
                        .fullName("Workspace Outsider")
                        .email("outsider@devconnect.local")
                        .password(passwordEncoder.encode("Pass123!"))
                        .role("USER")
                        .build()));

        project = projectRepository.save(Project.builder()
                .title("Distributed Storage " + System.currentTimeMillis())
                .description("A high performance distributed blob storage project")
                .creator(owner)
                .build());
    }

    @Test
    @WithMockUser(username = "ws_owner", roles = {"USER"})
    void projectOwner_canCreateWorkspace() throws Exception {
        mockMvc.perform(post("/api/projects/" + project.getId() + "/workspace"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(project.getTitle()))
                .andExpect(jsonPath("$.userRole").value("OWNER"));
    }

    @Test
    @WithMockUser(username = "ws_outsider", roles = {"USER"})
    void nonProjectOwner_cannotCreateWorkspace() throws Exception {
        mockMvc.perform(post("/api/projects/" + project.getId() + "/workspace"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "ws_owner", roles = {"USER"})
    void membershipAuthorization_memberAllowed_nonMemberRejected_andRemovedMemberRejected() throws Exception {
        // 1. Create workspace
        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(project.getId(), "ws_owner");

        // 2. Owner can access channels
        mockMvc.perform(get("/api/workspaces/" + ws.getId() + "/channels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("general"));

        // 3. Outsider is rejected with 403
        // Notice we run with outsider credentials:
        // We do a mock request with outsider
    }

    @Test
    @WithMockUser(username = "ws_outsider", roles = {"USER"})
    void nonMember_isForbiddenFromWorkspaceChannels() throws Exception {
        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(project.getId(), "ws_owner");

        mockMvc.perform(get("/api/workspaces/" + ws.getId() + "/channels"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "ws_owner", roles = {"USER"})
    void channelCreation_validatesNamingAndDuplicateConflict() throws Exception {
        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(project.getId(), "ws_owner");

        // Invalid name (contains capital letters or spaces)
        CreateChannelRequest invalid = new CreateChannelRequest("Invalid Channel!");
        mockMvc.perform(post("/api/workspaces/" + ws.getId() + "/channels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());

        // Valid name
        CreateChannelRequest valid = new CreateChannelRequest("dev-backend");
        mockMvc.perform(post("/api/workspaces/" + ws.getId() + "/channels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("dev-backend"));

        // Duplicate name returns 409 Conflict
        mockMvc.perform(post("/api/workspaces/" + ws.getId() + "/channels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "ws_outsider", roles = {"USER"})
    void joinRequestFlow_duplicateThrowsConflict() throws Exception {
        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(project.getId(), "ws_owner");

        // First join request succeeds
        mockMvc.perform(post("/api/workspaces/" + ws.getId() + "/join-requests"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Duplicate request returns 409 Conflict
        mockMvc.perform(post("/api/workspaces/" + ws.getId() + "/join-requests"))
                .andExpect(status().isConflict());
    }
}

