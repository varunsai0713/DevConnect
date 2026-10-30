package com.devconnect.backend.repository;

import com.devconnect.backend.model.WorkspaceMember;
import com.devconnect.backend.model.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    List<WorkspaceMember> findByWorkspaceIdOrderByJoinedAtAsc(Long workspaceId);
    long countByWorkspaceId(Long workspaceId);
    void deleteByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}

