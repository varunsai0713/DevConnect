package com.devconnect.backend.controller;

import com.devconnect.backend.model.Project;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.ProjectRepository;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestBody Project project,
            @RequestParam(required = false) Long creatorId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User creator = null;
        if (creatorId != null) {
            creator = userRepository.findById(creatorId).orElse(null);
        } else if (principal != null) {
            creator = userRepository.findByUsername(principal.getUsername()).orElse(null);
        }
        if (creator == null) {
            return ResponseEntity.badRequest().body("Creator could not be determined.");
        }
        project.setCreator(creator);
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Project> likeProject(@PathVariable Long id) {
        return projectRepository.findById(id).map(project -> {
            project.setLikes(project.getLikes() + 1);
            return ResponseEntity.ok(projectRepository.save(project));
        }).orElse(ResponseEntity.notFound().build());
    }
}
