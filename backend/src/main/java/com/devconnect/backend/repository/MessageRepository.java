package com.devconnect.backend.repository;

import com.devconnect.backend.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChannelIdOrderByIdDesc(Long channelId, Pageable pageable);
    List<Message> findByChannelIdAndIdLessThanOrderByIdDesc(Long channelId, Long beforeId, Pageable pageable);
    boolean existsByChannelIdAndSenderIdAndClientMessageId(Long channelId, Long senderId, String clientMessageId);
    Optional<Message> findByChannelIdAndSenderIdAndClientMessageId(Long channelId, Long senderId, String clientMessageId);
    long countByChannelId(Long channelId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.channel.id = :channelId AND m.id > :lastReadId")
    long countUnreadMessages(@Param("channelId") Long channelId, @Param("lastReadId") Long lastReadId);
}

