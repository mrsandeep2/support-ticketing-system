package com.leap.ticketing.repository;
import com.leap.ticketing.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RatingRepository extends JpaRepository<Rating, Long> {
  Optional<Rating> findByTicketId(Long ticketId);
}
