package com.leap.ticketing.repository;
import com.leap.ticketing.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CommentRepository extends JpaRepository<Comment, Long> {
  List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
