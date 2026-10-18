package com.devconnect.backend.controller;

import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setBio(userDetails.getBio());
            user.setExperience(userDetails.getExperience());
            user.setLocation(userDetails.getLocation());
            user.setAvatar(userDetails.getAvatar());
            user.setSkills(userDetails.getSkills());
            user.setGithubUrl(userDetails.getGithubUrl());
            user.setLinkedinUrl(userDetails.getLinkedinUrl());
            user.setPortfolioUrl(userDetails.getPortfolioUrl());
            
            // Only update these if not null
            if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
            
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
