package com.leap.ticketing.dto;

import com.leap.ticketing.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Email @Size(max = 190) String email,
      @NotBlank @Size(min = 6, max = 100) String password
  ) {}
  public record LoginRequest(
      @NotBlank @Email String email,
      @NotBlank String password
  ) {}
  public record UserResponse(Long id, String name, String email, Role role) {}
  public record AuthResponse(String token, UserResponse user) {}
}
