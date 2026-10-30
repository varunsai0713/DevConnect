package com.devconnect.backend.security;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PresenceTracker {

    // sessionId -> username
    private final ConcurrentHashMap<String, String> sessionToUser = new ConcurrentHashMap<>();

    // username -> Set of sessionIds
    private final ConcurrentHashMap<String, Set<String>> userToSessions = new ConcurrentHashMap<>();

    public synchronized boolean addSession(String sessionId, String username) {
        sessionToUser.put(sessionId, username);
        Set<String> sessions = userToSessions.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet());
        boolean wasOffline = sessions.isEmpty();
        sessions.add(sessionId);
        return wasOffline;
    }

    public synchronized boolean removeSession(String sessionId) {
        String username = sessionToUser.remove(sessionId);
        if (username == null) {
            return false;
        }

        Set<String> sessions = userToSessions.get(username);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userToSessions.remove(username);
                return true; // became offline
            }
        }
        return false;
    }

    public String getUsernameForSession(String sessionId) {
        return sessionToUser.get(sessionId);
    }

    public boolean isUserOnline(String username) {
        Set<String> sessions = userToSessions.get(username);
        return sessions != null && !sessions.isEmpty();
    }

    public Set<String> getOnlineUsers() {
        return Collections.unmodifiableSet(userToSessions.keySet());
    }
}

