package com.devconnect.backend.repository;

import com.devconnect.backend.model.ChannelRead;
import com.devconnect.backend.model.ChannelReadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChannelReadRepository extends JpaRepository<ChannelRead, ChannelReadId> {
    Optional<ChannelRead> findByChannelIdAndUserId(Long channelId, Long userId);
}

