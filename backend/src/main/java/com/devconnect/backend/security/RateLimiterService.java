package com.devconnect.backend.security;

import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static final int MAX_MESSAGES = 20;
    private static final long WINDOW_MS = 10_000; // 10 seconds

    private final ConcurrentHashMap<String, Deque<Long>> userTimestamps = new ConcurrentHashMap<>();

    public synchronized boolean isAllowed(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }

        long now = System.currentTimeMillis();
        Deque<Long> timestamps = userTimestamps.computeIfAbsent(username, k -> new ArrayDeque<>());

        // Evict expired timestamps older than 10 seconds
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_MESSAGES) {
            return false;
        }

        timestamps.addLast(now);
        return true;
    }

    public synchronized void reset(String username) {
        userTimestamps.remove(username);
    }
}

