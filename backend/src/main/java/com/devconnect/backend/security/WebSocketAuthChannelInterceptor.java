package com.devconnect.backend.security;

import com.devconnect.backend.service.ChatService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Pattern CHANNEL_TOPIC_PATTERN = Pattern.compile("^/topic/channels/(\\d+)(/typing)?$");
    private static final Pattern WORKSPACE_PRESENCE_PATTERN = Pattern.compile("^/topic/workspaces/(\\d+)/presence$");
    private static final Pattern CHANNEL_APP_PATTERN = Pattern.compile("^/app/channels/(\\d+)/(send|typing)$");

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final ChatService chatService;
    private final RateLimiterService rateLimiterService;

    public WebSocketAuthChannelInterceptor(
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService,
            ChatService chatService,
            RateLimiterService rateLimiterService
    ) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.chatService = chatService;
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        // Restore authenticated principal from session attributes if already authenticated
        if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
            Principal savedUser = (Principal) accessor.getSessionAttributes().get("USER_PRINCIPAL");
            if (savedUser != null) {
                accessor.setUser(savedUser);
            }
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            handleSend(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor);

        if (!StringUtils.hasText(token) || !jwtUtil.validateJwtToken(token)) {
            throw new AccessDeniedException("Invalid or missing JWT token for WebSocket connection");
        }

        String username = jwtUtil.getUserNameFromJwtToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        accessor.setUser(auth);
        if (accessor.getSessionAttributes() != null) {
            accessor.getSessionAttributes().put("USER_PRINCIPAL", auth);
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new AccessDeniedException("Unauthenticated STOMP subscription");
        }

        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        String username = principal.getName();

        // 1. Channel topic subscribe: /topic/channels/{channelId} or /topic/channels/{channelId}/typing
        Matcher channelMatcher = CHANNEL_TOPIC_PATTERN.matcher(destination);
        if (channelMatcher.matches()) {
            Long channelId = Long.parseLong(channelMatcher.group(1));
            if (!chatService.isUserMemberOfChannelWorkspace(channelId, username)) {
                throw new AccessDeniedException("Forbidden: You are not a member of the workspace for channel " + channelId);
            }
            return;
        }

        // 2. Workspace presence subscribe: /topic/workspaces/{workspaceId}/presence
        Matcher presenceMatcher = WORKSPACE_PRESENCE_PATTERN.matcher(destination);
        if (presenceMatcher.matches()) {
            Long workspaceId = Long.parseLong(presenceMatcher.group(1));
            if (!chatService.isUserMemberOfWorkspace(workspaceId, username)) {
                throw new AccessDeniedException("Forbidden: You are not a member of workspace " + workspaceId);
            }
            return;
        }

        // 3. User personal error queue: /user/queue/errors or other user-specific destinations
        if (destination.startsWith("/user/")) {
            return;
        }
    }

    private void handleSend(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new AccessDeniedException("Unauthenticated STOMP send");
        }

        String username = principal.getName();

        // Per-user rate limit check: max 20 messages per 10 seconds
        if (!rateLimiterService.isAllowed(username)) {
            throw new AccessDeniedException("Rate limit exceeded: maximum 20 messages per 10 seconds");
        }

        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        Matcher appMatcher = CHANNEL_APP_PATTERN.matcher(destination);
        if (appMatcher.matches()) {
            Long channelId = Long.parseLong(appMatcher.group(1));
            if (!chatService.isUserMemberOfChannelWorkspace(channelId, username)) {
                throw new AccessDeniedException("Forbidden: You are not a member of the workspace for channel " + channelId);
            }
        }
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        // Check Authorization header: 'Bearer <token>' or raw token
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (StringUtils.hasText(header)) {
                return header.startsWith("Bearer ") ? header.substring(7).trim() : header.trim();
            }
        }

        // Check fallback 'passcode' or 'token' header
        List<String> tokenHeaders = accessor.getNativeHeader("token");
        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
            return tokenHeaders.get(0).trim();
        }

        List<String> passcodeHeaders = accessor.getNativeHeader("passcode");
        if (passcodeHeaders != null && !passcodeHeaders.isEmpty()) {
            return passcodeHeaders.get(0).trim();
        }

        return null;
    }
}
