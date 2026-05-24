package com.leap.ticketing.repository;
import com.leap.ticketing.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
  List<Attachment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
