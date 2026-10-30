package com.devconnect.backend.chat;

import com.devconnect.backend.dto.ChatMessageRequest;
import com.devconnect.backend.dto.ChatMessageResponse;
import com.devconnect.backend.dto.MarkChannelReadRequest;
import com.devconnect.backend.dto.WorkspaceResponse;
import com.devconnect.backend.model.Project;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.MessageRepository;
import com.devconnect.backend.repository.ProjectRepository;
import com.devconnect.backend.repository.UserRepository;
import com.devconnect.backend.security.RateLimiterService;
import com.devconnect.backend.service.ChatService;
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

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ChatAndRateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User chatUser;
    private Long generalChannelId;

    @BeforeEach
    void setUp() {
        chatUser = userRepository.findByUsername("chat_member")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("chat_member")
                        .fullName("Chat Member")
                        .email("chat_member@devconnect.local")
                        .password(passwordEncoder.encode("Pass123!"))
                        .role("USER")
                        .build()));

        Project chatProject = projectRepository.save(Project.builder()
                .title("Reactive Chat Kernel " + System.currentTimeMillis())
                .description("Real-time messaging kernel")
                .creator(chatUser)
                .build());

        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(chatProject.getId(), "chat_member");
        generalChannelId = workspaceService.getWorkspaceChannels(ws.getId(), "chat_member").get(0).getId();
    }

    @Test
    @WithMockUser(username = "chat_member", roles = {"USER"})
    void duplicateClientMessageId_isIgnoredAndReturnsExisting() throws Exception {
        String clientMsgId = UUID.randomUUID().toString();
        ChatMessageRequest request = ChatMessageRequest.builder()
                .content("Hello World from DevConnect")
                .clientMessageId(clientMsgId)
                .build();

        long countBefore = messageRepository.count();

        // 1. Send first message
        ChatMessageResponse first = chatService.saveMessage(generalChannelId, request, "chat_member");
        assertNotNull(first.getId());
        assertEquals("Hello World from DevConnect", first.getContent());
        assertEquals(countBefore + 1, messageRepository.count());

        // 2. Resend same clientMessageId (e.g. client network retry)
        ChatMessageResponse second = chatService.saveMessage(generalChannelId, request, "chat_member");
        assertEquals(first.getId(), second.getId(), "Duplicate clientMessageId must return existing message ID");
        assertEquals(countBefore + 1, messageRepository.count(), "Database message count must NOT increase on duplicate resend");
    }

    @Test
    @WithMockUser(username = "chat_member", roles = {"USER"})
    void cursorPagination_isStableWithNoDuplicates() throws Exception {
        // Send 5 distinct messages
        for (int i = 1; i <= 5; i++) {
            chatService.saveMessage(generalChannelId, ChatMessageRequest.builder()
                    .content("Message #" + i)
                    .clientMessageId(UUID.randomUUID().toString())
                    .build(), "chat_member");
        }

        // Fetch page 1 (limit 2, newest first)
        String page1Json = mockMvc.perform(get("/api/channels/" + generalChannelId + "/messages")
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        List<ChatMessageResponse> page1 = objectMapper.readValue(
                page1Json,
                objectMapper.getTypeFactory().constructCollectionType(List.class, ChatMessageResponse.class)
        );

        Long oldestIdPage1 = page1.get(page1.size() - 1).getId();

        // Fetch page 2 before oldestIdPage1
        String page2Json = mockMvc.perform(get("/api/channels/" + generalChannelId + "/messages")
                        .param("before", String.valueOf(oldestIdPage1))
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        List<ChatMessageResponse> page2 = objectMapper.readValue(
                page2Json,
                objectMapper.getTypeFactory().constructCollectionType(List.class, ChatMessageResponse.class)
        );

        // Verify no overlapping message IDs between pages
        for (ChatMessageResponse m1 : page1) {
            for (ChatMessageResponse m2 : page2) {
                assertNotEquals(m1.getId(), m2.getId(), "Cursor pagination must not produce duplicate messages across pages");
            }
        }
    }

    @Test
    void rateLimit_enforcesMaximumTwentyMessagesPerTenSeconds() {
        String testUser = "ratelimit_user_" + System.currentTimeMillis();
        rateLimiterService.reset(testUser);

        // First 20 messages within 10 seconds must be permitted
        for (int i = 0; i < 20; i++) {
            assertTrue(rateLimiterService.isAllowed(testUser), "Message " + (i + 1) + " must be allowed");
        }

        // 21st message within 10 seconds must be rejected by rate limiter
        assertFalse(rateLimiterService.isAllowed(testUser), "21st message within 10 seconds must be rate limited");
    }

    @Test
    @WithMockUser(username = "chat_member", roles = {"USER"})
    void unreadTracking_markReadUpdatesLastReadId() throws Exception {
        ChatMessageResponse msg = chatService.saveMessage(generalChannelId, ChatMessageRequest.builder()
                .content("Unread test message")
                .clientMessageId(UUID.randomUUID().toString())
                .build(), "chat_member");

        // Mark channel as read up to msg.getId()
        MarkChannelReadRequest readReq = new MarkChannelReadRequest(msg.getId());

        mockMvc.perform(post("/api/channels/" + generalChannelId + "/read")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(readReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastReadMessageId").value(msg.getId()))
                .andExpect(jsonPath("$.unreadCount").value(0));
    }
}

