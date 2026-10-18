package com.devconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // e.g., ROLE_USER

    private String experience;
    
    private String location;
    
    private String avatar;
    
    @Column(length = 1000)
    private String bio;
    
    @ElementCollection
    private java.util.List<String> skills;

    private String githubUrl;
    
    private String linkedinUrl;
    
    private String portfolioUrl;
}
