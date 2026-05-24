package com.leap.ticketing.config;

import com.leap.ticketing.model.Role;
import com.leap.ticketing.model.User;
import com.leap.ticketing.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  public DataSeeder(UserRepository users, PasswordEncoder encoder) {
    this.users = users; this.encoder = encoder;
  }
  @Override
  public void run(String... args) {
    if (users.findByEmail("admin@example.com").isEmpty()) {
      users.save(User.builder()
          .name("System Admin")
          .email("admin@example.com")
          .passwordHash(encoder.encode("Admin@123"))
          .role(Role.ADMIN)
          .build());
      System.out.println("[seed] Created admin@example.com / Admin@123");
    }
    if (users.findByEmail("agent@example.com").isEmpty()) {
      users.save(User.builder()
          .name("Support Agent")
          .email("agent@example.com")
          .passwordHash(encoder.encode("Agent@123"))
          .role(Role.AGENT)
          .build());
      System.out.println("[seed] Created agent@example.com / Agent@123");
    }
    if (users.findByEmail("user@example.com").isEmpty()) {
      users.save(User.builder()
          .name("Demo User")
          .email("user@example.com")
          .passwordHash(encoder.encode("User@123"))
          .role(Role.USER)
          .build());
      System.out.println("[seed] Created user@example.com / User@123");
    }
  }
}
