package com.leap.ticketing.service;

import com.leap.ticketing.dto.AuthDtos.*;
import com.leap.ticketing.exception.ApiException;
import com.leap.ticketing.model.Role;
import com.leap.ticketing.model.User;
import com.leap.ticketing.repository.UserRepository;
import com.leap.ticketing.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;
  public AuthService(UserRepository users, PasswordEncoder encoder, JwtUtil jwt) {
    this.users = users; this.encoder = encoder; this.jwt = jwt;
  }
  public AuthResponse register(RegisterRequest req) {
    if (users.existsByEmail(req.email())) throw ApiException.conflict("Email already registered");
    User u = users.save(User.builder()
        .name(req.name()).email(req.email())
        .passwordHash(encoder.encode(req.password()))
        .role(Role.USER).build());
    String token = jwt.generate(u.getId(), u.getEmail(), u.getRole().name());
    return new AuthResponse(token, new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()));
  }
  public AuthResponse login(LoginRequest req) {
    User u = users.findByEmail(req.email())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
    if (!encoder.matches(req.password(), u.getPasswordHash()))
      throw new BadCredentialsException("Invalid email or password");
    String token = jwt.generate(u.getId(), u.getEmail(), u.getRole().name());
    return new AuthResponse(token, new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()));
  }
}
