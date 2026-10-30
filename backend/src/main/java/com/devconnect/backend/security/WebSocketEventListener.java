package com.devconnect.backend.security;

import com.devconnect.backend.dto.PresenceEvent;
import com.devconnect.backend.model.User;
import com.devconnect.backend.model.Workspace;
import com.devconnect.backend.repository.UserRepository;
import com.devconnect.backend.repository.WorkspaceRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Component
public class WebSocketEventListener {

    private final PresenceTracker presenceTracker;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;

    public WebSocketEventListener(
            PresenceTracker presenceTracker,
            SimpMessagingTemplate messagingTemplate,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository
    ) {
        this.presenceTracker = presenceTracker;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        if (principal == null && headerAccessor.getSessionAttributes() != null) {
            principal = (Principal) headerAccessor.getSessionAttributes().get("USER_PRINCIPAL");
        }
        if (principal == null) {
            return;
        }

        String sessionId = headerAccessor.getSessionId();
        String username = principal.getName();

        boolean wasOffline = presenceTracker.addSession(sessionId, username);
        if (wasOffline) {
            broadcastPresence(username, true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String username = presenceTracker.getUsernameForSession(sessionId);

        if (username != null) {
            boolean becameOffline = presenceTracker.removeSession(sessionId);
            if (becameOffline) {
                broadcastPresence(username, false);
            }
        }
    }

    private void broadcastPresence(String username, boolean online) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();

        List<Workspace> userWorkspaces = workspaceRepository.findWorkspacesByUserId(user.getId());
        for (Workspace ws : userWorkspaces) {
            PresenceEvent presenceEvent = PresenceEvent.builder()
                    .workspaceId(ws.getId())
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .online(online)
                    .build();
            messagingTemplate.convertAndSend("/topic/workspaces/" + ws.getId() + "/presence", presenceEvent);
        }
    }
}
