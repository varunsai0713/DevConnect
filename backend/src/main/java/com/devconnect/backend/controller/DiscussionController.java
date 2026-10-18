package com.devconnect.backend.controller;

import com.devconnect.backend.model.Discussion;
import com.devconnect.backend.repository.DiscussionRepository;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DiscussionController {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Discussion> getAllDiscussions() {
        return discussionRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createDiscussion(@RequestBody Discussion discussion, @RequestParam Long authorId) {
        return userRepository.findById(authorId).map(user -> {
            discussion.setAuthor(user);
            return ResponseEntity.ok(discussionRepository.save(discussion));
        }).orElse(ResponseEntity.badRequest().body(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Discussion> getDiscussionById(@PathVariable Long id) {
        return discussionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/upvote")
    public ResponseEntity<Discussion> upvoteDiscussion(@PathVariable Long id) {
        return discussionRepository.findById(id).map(discussion -> {
            discussion.setUpvotes(discussion.getUpvotes() + 1);
            return ResponseEntity.ok(discussionRepository.save(discussion));
        }).orElse(ResponseEntity.notFound().build());
    }
}
