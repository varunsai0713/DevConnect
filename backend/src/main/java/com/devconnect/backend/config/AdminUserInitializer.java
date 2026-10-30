package com.devconnect.backend.config;

import com.devconnect.backend.model.User;
import com.devconnect.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    @Value("${ADMIN_EMAIL:${app.admin.email:}}")
    private String adminEmail;

    @Value("${ADMIN_USERNAME:${app.admin.username:admin}}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:${app.admin.password:}}")
    private String adminPassword;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                user -> {
                    if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
                        user.setRole("ADMIN");
                        userRepository.save(user);
                        log.info("Elevated existing user [{}] to ADMIN role.", user.getUsername());
                    }
                },
                () -> {
                    String username = StringUtils.hasText(adminUsername) ? adminUsername : "admin";
                    if (userRepository.existsByUsername(username)) {
                        username = "admin_" + System.currentTimeMillis() % 1000;
                    }

                    User newAdmin = User.builder()
                            .username(username)
                            .fullName("System Administrator")
                            .email(adminEmail)
                            .password(passwordEncoder.encode(adminPassword))
                            .role("ADMIN")
                            .build();

                    userRepository.save(newAdmin);
                    log.info("Initialized local administrator account with username [{}].", username);
                }
        );
    }
}

