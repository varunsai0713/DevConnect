package com.devconnect.backend.repository;

import com.devconnect.backend.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findByWorkspaceIdOrderByCreatedAtAsc(Long workspaceId);
    Optional<Channel> findByWorkspaceIdAndName(Long workspaceId, String name);
    boolean existsByWorkspaceIdAndName(Long workspaceId, String name);
    long countByWorkspaceId(Long workspaceId);
}

