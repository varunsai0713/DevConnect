package com.devconnect.backend.repository;

import com.devconnect.backend.model.JoinRequest;
import com.devconnect.backend.model.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    Optional<JoinRequest> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    List<JoinRequest> findByWorkspaceIdAndStatusOrderByCreatedAtDesc(Long workspaceId, JoinRequestStatus status);
    List<JoinRequest> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
}

