package com.devconnect.backend.controller;

import com.devconnect.backend.dto.*;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.UserRepository;
import com.devconnect.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public ChatController(
            ChatService chatService,
            SimpMessagingTemplate messagingTemplate,
            UserRepository userRepository
    ) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    // --- STOMP WebSocket Message Mapping ---

    @MessageMapping("/channels/{channelId}/send")
    public void sendMessage(
            @DestinationVariable Long channelId,
            @Valid @Payload ChatMessageRequest request,
            Principal principal
    ) {
        // Authenticated principal identity is strictly enforced
        String username = principal.getName();
        ChatMessageResponse savedMessage = chatService.saveMessage(channelId, request, username);

        // Broadcast to all channel subscribers after persistence
        messagingTemplate.convertAndSend("/topic/channels/" + channelId, savedMessage);
    }

    @MessageMapping("/channels/{channelId}/typing")
    public void sendTyping(
            @DestinationVariable Long channelId,
            @Payload TypingEvent typingEvent,
            Principal principal
    ) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return;
        }

        TypingNotification notification = TypingNotification.builder()
                .channelId(channelId)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .typing(typingEvent.isTyping())
                .build();

        // Ephemeral typing event is broadcast and never saved to the database
        messagingTemplate.convertAndSend("/topic/channels/" + channelId + "/typing", notification);
    }

    // --- REST Endpoints for History & Unread Tracking ---

    @GetMapping("/api/channels/{channelId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long channelId,
            @RequestParam(required = false) Long before,
            @RequestParam(defaultValue = "30") int limit,
            @AuthenticationPrincipal UserDetails principal
    ) {
        List<ChatMessageResponse> messages = chatService.getChannelMessages(
                channelId, before, limit, principal.getUsername());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/api/channels/{channelId}/read")
    public ResponseEntity<ChannelReadResponse> markChannelRead(
            @PathVariable Long channelId,
            @Valid @RequestBody MarkChannelReadRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        ChannelReadResponse response = chatService.markChannelAsRead(
                channelId, request.getLastReadMessageId(), principal.getUsername());
        return ResponseEntity.ok(response);
    }
}

