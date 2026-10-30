package com.devconnect.backend.chat;

import com.devconnect.backend.dto.ChatMessageRequest;
import com.devconnect.backend.dto.ChatMessageResponse;
import com.devconnect.backend.dto.WorkspaceResponse;
import com.devconnect.backend.model.Project;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.ProjectRepository;
import com.devconnect.backend.repository.UserRepository;
import com.devconnect.backend.security.JwtUtil;
import com.devconnect.backend.service.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User wsUser;
    private Long channelId;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        wsUser = userRepository.findByUsername("ws_chat_tester")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("ws_chat_tester")
                        .fullName("WS Chat Tester")
                        .email("ws_tester@devconnect.local")
                        .password(passwordEncoder.encode("Pass123!"))
                        .role("USER")
                        .build()));

        Project wsProject = projectRepository.save(Project.builder()
                .title("WebSocket Test Project " + System.currentTimeMillis())
                .description("Realtime integration testing")
                .creator(wsUser)
                .build());

        WorkspaceResponse ws = workspaceService.createWorkspaceForProject(wsProject.getId(), "ws_chat_tester");
        channelId = workspaceService.getWorkspaceChannels(ws.getId(), "ws_chat_tester").get(0).getId();

        // Generate valid JWT token for authenticated STOMP connection
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                new org.springframework.security.core.userdetails.User(
                        wsUser.getUsername(),
                        wsUser.getPassword(),
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                ),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        jwtToken = jwtUtil.generateJwtToken(auth);
    }

    @Test
    void webSocket_canConnectSubscribeAndReceiveBroadcastedMessage() throws Exception {
        WebSocketStompClient stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        stompClient.setMessageConverter(converter);

        StompHeaders connectHeaders = new StompHeaders();
        connectHeaders.add("Authorization", "Bearer " + jwtToken);

        CompletableFuture<ChatMessageResponse> subscribeFuture = new CompletableFuture<>();

        StompSessionHandler sessionHandler = new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                // Subscribe to the channel topic
                session.subscribe("/topic/channels/" + channelId, new StompFrameHandler() {
                    @Override
                    public Type getPayloadType(StompHeaders headers) {
                        return ChatMessageResponse.class;
                    }

                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        subscribeFuture.complete((ChatMessageResponse) payload);
                    }
                });

                // Send a test message via /app/channels/{channelId}/send after a short delay to ensure subscription is active
                CompletableFuture.runAsync(() -> {
                    try {
                        Thread.sleep(500);
                        ChatMessageRequest request = ChatMessageRequest.builder()
                                .content("Realtime WebSocket Verification")
                                .clientMessageId(UUID.randomUUID().toString())
                                .build();
                        session.send("/app/channels/" + channelId + "/send", request);
                    } catch (Exception e) {
                        subscribeFuture.completeExceptionally(e);
                    }
                });
            }

            @Override
            public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
                String errorMsg = payload != null ? new String(payload) : "No payload";
                System.err.println("STOMP Session Exception: " + errorMsg + ", command=" + command + ", headers=" + headers);
                subscribeFuture.completeExceptionally(new RuntimeException("STOMP Error: " + errorMsg, exception));
            }

            @Override
            public void handleTransportError(StompSession session, Throwable exception) {
                System.err.println("STOMP Transport Error: " + exception.getMessage());
                subscribeFuture.completeExceptionally(exception);
            }
        };

        String wsUrl = "ws://localhost:" + port + "/ws";
        StompSession session = stompClient.connectAsync(wsUrl, new WebSocketHttpHeaders(), connectHeaders, sessionHandler)
                .get(10, TimeUnit.SECONDS);

        assertNotNull(session, "STOMP session must be established");

        // Await the broadcasted message from the subscription
        ChatMessageResponse received = subscribeFuture.get(10, TimeUnit.SECONDS);

        assertNotNull(received);
        assertEquals(channelId, received.getChannelId());
        assertEquals("Realtime WebSocket Verification", received.getContent());
        assertEquals("ws_chat_tester", received.getSenderUsername());

        session.disconnect();
    }
}
