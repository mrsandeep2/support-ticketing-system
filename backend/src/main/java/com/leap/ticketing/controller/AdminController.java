package com.leap.ticketing.controller;

import com.leap.ticketing.dto.AdminDtos.*;
import com.leap.ticketing.dto.AuthDtos.UserResponse;
import com.leap.ticketing.security.AppUserPrincipal;
import com.leap.ticketing.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
  private final UserService users;
  public AdminController(UserService users) { this.users = users; }

  @GetMapping("/users")
  public List<UserResponse> list() { return users.all(); }

  @PostMapping("/users")
  public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
    return users.create(req);
  }

  @PatchMapping("/users/{id}/role")
  public UserResponse role(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest req) {
    return users.updateRole(id, req.role());
  }

  @DeleteMapping("/users/{id}")
  public Map<String, Object> delete(@PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
    users.delete(id, me.getId());
    return Map.of("ok", true);
  }
}
