package com.devconnect.backend.security;

import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RbacSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByUsername("regular_user")) {
            userRepository.save(User.builder()
                    .username("regular_user")
                    .fullName("Regular User")
                    .email("regular@devconnect.local")
                    .password(passwordEncoder.encode("Password123!"))
                    .role("USER")
                    .build());
        }

        if (!userRepository.existsByUsername("admin_user")) {
            userRepository.save(User.builder()
                    .username("admin_user")
                    .fullName("Admin User")
                    .email("admin@devconnect.local")
                    .password(passwordEncoder.encode("Password123!"))
                    .role("ADMIN")
                    .build());
        }
    }

    @Test
    void unauthenticatedUser_cannotAccessAdminRoutes() throws Exception {
        mockMvc.perform(get("/api/admin/workspaces"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    void regularUser_isForbiddenFromAdminRoutes() throws Exception {
        mockMvc.perform(get("/api/admin/workspaces"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin_user", roles = {"ADMIN"})
    void adminUser_canAccessAdminRoutes() throws Exception {
        mockMvc.perform(get("/api/admin/workspaces"))
                .andExpect(status().isOk());
    }
}

