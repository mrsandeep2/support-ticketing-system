package com.leap.ticketing.controller;

import com.leap.ticketing.dto.AuthDtos.UserResponse;
import com.leap.ticketing.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService users;
  public UserController(UserService users) { this.users = users; }

  @GetMapping("/agents")
  @PreAuthorize("hasAnyRole('AGENT','ADMIN','USER')")
  public List<UserResponse> agents() { return users.agents(); }
}
