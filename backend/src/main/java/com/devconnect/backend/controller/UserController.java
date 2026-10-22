package com.devconnect.backend.controller;

import com.devconnect.backend.dto.UserProfileRequest;
import com.devconnect.backend.dto.UserProfileResponse;
import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetails principal) {
        return userRepository.findByUsername(principal.getUsername())
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<UserProfileResponse> updateCurrentUser(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UserProfileRequest profile) {
        return userRepository.findByUsername(principal.getUsername())
                .map(user -> {
                    if (profile.getFullName() != null) user.setFullName(profile.getFullName());
                    if (profile.getRole() != null) user.setRole(profile.getRole());
                    user.setExperience(profile.getExperience());
                    user.setLocation(profile.getLocation());
                    user.setAvatar(profile.getAvatar());
                    user.setBio(profile.getBio());
                    user.setSkills(profile.getSkills() == null ? List.of() : profile.getSkills());
                    user.setGithubUrl(profile.getGithubUrl());
                    user.setLinkedinUrl(profile.getLinkedinUrl());
                    user.setPortfolioUrl(profile.getPortfolioUrl());
                    return ResponseEntity.ok(toResponse(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElseGet(() -> ResponseEntity.<UserProfileResponse>notFound().build());
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<UserProfileResponse> updateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UserProfileRequest profile) {
        return userRepository.findById(id)
                .map(user -> {
                    if (!user.getUsername().equals(principal.getUsername())) {
                        return ResponseEntity.status(403).<UserProfileResponse>build();
                    }
                    if (profile.getFullName() != null) user.setFullName(profile.getFullName());
                    if (profile.getRole() != null) user.setRole(profile.getRole());
                    user.setExperience(profile.getExperience());
                    user.setLocation(profile.getLocation());
                    user.setAvatar(profile.getAvatar());
                    user.setBio(profile.getBio());
                    user.setSkills(profile.getSkills() == null ? List.of() : profile.getSkills());
                    user.setGithubUrl(profile.getGithubUrl());
                    user.setLinkedinUrl(profile.getLinkedinUrl());
                    user.setPortfolioUrl(profile.getPortfolioUrl());
                    return ResponseEntity.ok(toResponse(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.<UserProfileResponse>notFound().build());
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getExperience(),
                user.getLocation(),
                user.getAvatar(),
                user.getBio(),
                user.getSkills() == null ? List.of() : user.getSkills(),
                user.getGithubUrl(),
                user.getLinkedinUrl(),
                user.getPortfolioUrl());
    }
}
