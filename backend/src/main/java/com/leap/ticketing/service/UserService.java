package com.leap.ticketing.service;

import com.leap.ticketing.dto.AdminDtos;
import com.leap.ticketing.dto.AuthDtos.UserResponse;
import com.leap.ticketing.exception.ApiException;
import com.leap.ticketing.model.Role;
import com.leap.ticketing.model.User;
import com.leap.ticketing.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
  private final UserRepository repo;
  private final PasswordEncoder encoder;
  public UserService(UserRepository repo, PasswordEncoder encoder) {
    this.repo = repo; this.encoder = encoder;
  }

  public List<UserResponse> all() {
    return repo.findAll().stream()
        .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
        .toList();
  }
  public List<UserResponse> agents() {
    return repo.findByRole(Role.AGENT).stream()
        .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
        .toList();
  }
  public UserResponse create(AdminDtos.CreateUserRequest req) {
    if (repo.existsByEmail(req.email())) throw ApiException.conflict("Email already in use");
    User u = repo.save(User.builder()
        .name(req.name()).email(req.email())
        .passwordHash(encoder.encode(req.password()))
        .role(req.role())
        .build());
    return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole());
  }
  public UserResponse updateRole(Long id, Role role) {
    User u = repo.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    u.setRole(role);
    repo.save(u);
    return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole());
  }
  public void delete(Long id, Long requesterId) {
    if (id.equals(requesterId)) throw ApiException.badRequest("Cannot delete yourself");
    if (!repo.existsById(id)) throw ApiException.notFound("User not found");
    repo.deleteById(id);
  }
}
