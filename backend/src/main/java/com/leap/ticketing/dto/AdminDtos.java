package com.leap.ticketing.dto;

import com.leap.ticketing.model.Role;
import jakarta.validation.constraints.*;

public class AdminDtos {
  public record CreateUserRequest(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Email @Size(max = 190) String email,
      @NotBlank @Size(min = 6, max = 100) String password,
      @NotNull Role role
  ) {}
  public record UpdateRoleRequest(@NotNull Role role) {}
}
