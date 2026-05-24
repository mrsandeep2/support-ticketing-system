package com.leap.ticketing.repository;
import com.leap.ticketing.model.Role;
import com.leap.ticketing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
  List<User> findByRole(Role role);
}
