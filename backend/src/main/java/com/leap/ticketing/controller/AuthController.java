package com.leap.ticketing.controller;

import com.leap.ticketing.dto.AuthDtos.*;
import com.leap.ticketing.security.AppUserPrincipal;
import com.leap.ticketing.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService auth;
  public AuthController(AuthService auth) { this.auth = auth; }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.ok(auth.register(req));
  }
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    return ResponseEntity.ok(auth.login(req));
  }
  @GetMapping("/me")
  public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AppUserPrincipal me) {
    var u = me.getUser();
    return ResponseEntity.ok(new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()));
  }
}
