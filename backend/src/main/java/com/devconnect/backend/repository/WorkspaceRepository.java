package com.devconnect.backend.repository;

import com.devconnect.backend.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Optional<Workspace> findByProjectId(Long projectId);
    boolean existsByProjectId(Long projectId);

    @Query("SELECT wm.workspace FROM WorkspaceMember wm WHERE wm.user.id = :userId ORDER BY wm.workspace.createdAt DESC")
    List<Workspace> findWorkspacesByUserId(@Param("userId") Long userId);
}

