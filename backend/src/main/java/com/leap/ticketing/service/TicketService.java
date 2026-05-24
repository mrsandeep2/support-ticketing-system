package com.leap.ticketing.service;

import com.leap.ticketing.dto.TicketDtos.*;
import com.leap.ticketing.exception.ApiException;
import com.leap.ticketing.model.*;
import com.leap.ticketing.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {
  private final TicketRepository tickets;
  private final UserRepository users;
  private final CommentRepository comments;
  private final AttachmentRepository attachments;
  private final RatingRepository ratings;
  private final EmailService email;

  public TicketService(TicketRepository tickets, UserRepository users,
                       CommentRepository comments, AttachmentRepository attachments,
                       RatingRepository ratings, EmailService email) {
    this.tickets = tickets; this.users = users;
    this.comments = comments; this.attachments = attachments;
    this.ratings = ratings; this.email = email;
  }

  private UserSummary sum(User u) {
    if (u == null) return null;
    return new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
  }

  public boolean canView(User user, Ticket t) {
    if (user.getRole() == Role.ADMIN) return true;
    if (t.getOwner().getId().equals(user.getId())) return true;
    if (user.getRole() == Role.AGENT) {
      return t.getAssignee() != null && t.getAssignee().getId().equals(user.getId())
          || t.getStatus() == Status.OPEN; // agents can see unassigned/open queue
    }
    return false;
  }

  public boolean canModify(User user, Ticket t) {
    if (user.getRole() == Role.ADMIN) return true;
    if (user.getRole() == Role.AGENT
        && t.getAssignee() != null
        && t.getAssignee().getId().equals(user.getId())) return true;
    return false;
  }

  public boolean canComment(User user, Ticket t) {
    if (user.getRole() == Role.ADMIN) return true;
    if (t.getOwner().getId().equals(user.getId())) return true;
    if (user.getRole() == Role.AGENT
        && t.getAssignee() != null
        && t.getAssignee().getId().equals(user.getId())) return true;
    return false;
  }

  public Ticket create(User owner, CreateTicketRequest req) {
    Ticket t = Ticket.builder()
        .subject(req.subject())
        .description(req.description())
        .priority(req.priority() == null ? Priority.MEDIUM : req.priority())
        .status(Status.OPEN)
        .owner(owner)
        .build();
    Ticket saved = tickets.save(t);
    email.ticketCreated(saved);
    return saved;
  }

  public List<TicketListItem> list(User me, Status status, Priority priority,
                                   Long assigneeId, Long ownerId, String q, String sort) {
    Specification<Ticket> spec = (root, cq, cb) -> {
      List<Predicate> ps = new ArrayList<>();
      if (status != null) ps.add(cb.equal(root.get("status"), status));
      if (priority != null) ps.add(cb.equal(root.get("priority"), priority));
      if (assigneeId != null) ps.add(cb.equal(root.get("assignee").get("id"), assigneeId));
      if (ownerId != null) ps.add(cb.equal(root.get("owner").get("id"), ownerId));
      if (q != null && !q.isBlank())
        ps.add(cb.like(cb.lower(root.get("subject")), "%" + q.toLowerCase() + "%"));

      if (me.getRole() == Role.USER) {
        ps.add(cb.equal(root.get("owner").get("id"), me.getId()));
      } else if (me.getRole() == Role.AGENT) {
        ps.add(cb.or(
            cb.equal(root.get("assignee").get("id"), me.getId()),
            cb.equal(root.get("status"), Status.OPEN)
        ));
      }
      return cb.and(ps.toArray(new Predicate[0]));
    };
    Sort s = Sort.by(Sort.Direction.DESC, "createdAt");
    if ("priority".equalsIgnoreCase(sort)) s = Sort.by(Sort.Direction.DESC, "priority").and(Sort.by(Sort.Direction.DESC, "createdAt"));
    else if ("updated".equalsIgnoreCase(sort)) s = Sort.by(Sort.Direction.DESC, "updatedAt");
    return tickets.findAll(spec, s).stream()
        .map(t -> new TicketListItem(t.getId(), t.getSubject(), t.getStatus(), t.getPriority(),
            sum(t.getOwner()), sum(t.getAssignee()), t.getCreatedAt(), t.getUpdatedAt()))
        .toList();
  }

  public TicketResponse view(User me, Long id) {
    Ticket t = tickets.findById(id).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!canView(me, t)) throw ApiException.forbidden("You cannot view this ticket");
    List<CommentResponse> cs = comments.findByTicketIdOrderByCreatedAtAsc(id).stream()
        .map(c -> new CommentResponse(c.getId(), c.getBody(), sum(c.getAuthor()), c.getCreatedAt()))
        .toList();
    List<AttachmentResponse> as = attachments.findByTicketIdOrderByCreatedAtAsc(id).stream()
        .map(a -> new AttachmentResponse(a.getId(), a.getFilename(), a.getContentType(), a.getSize(), a.getCreatedAt(), sum(a.getUploader())))
        .toList();
    RatingResponse r = ratings.findByTicketId(id)
        .map(rr -> new RatingResponse(rr.getStars(), rr.getFeedback(), rr.getCreatedAt()))
        .orElse(null);
    return new TicketResponse(
        t.getId(), t.getSubject(), t.getDescription(), t.getStatus(), t.getPriority(),
        sum(t.getOwner()), sum(t.getAssignee()),
        t.getCreatedAt(), t.getUpdatedAt(), t.getResolvedAt(),
        cs, as, r);
  }

  public Ticket update(User me, Long id, UpdateTicketRequest req) {
    Ticket t = tickets.findById(id).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!canModify(me, t)) throw ApiException.forbidden("You cannot modify this ticket");

    boolean statusChanged = false, assigneeChanged = false, resolved = false;
    if (req.priority() != null && req.priority() != t.getPriority()) {
      t.setPriority(req.priority());
    }
    if (req.status() != null && req.status() != t.getStatus()) {
      t.setStatus(req.status());
      statusChanged = true;
      if (req.status() == Status.RESOLVED) {
        t.setResolvedAt(Instant.now());
        resolved = true;
      }
    }
    if (req.assigneeId() != null) {
      User a = users.findById(req.assigneeId()).orElseThrow(() -> ApiException.notFound("Assignee not found"));
      if (a.getRole() != Role.AGENT && a.getRole() != Role.ADMIN)
        throw ApiException.badRequest("Assignee must be AGENT or ADMIN");
      if (t.getAssignee() == null || !t.getAssignee().getId().equals(a.getId())) {
        t.setAssignee(a);
        assigneeChanged = true;
        if (t.getStatus() == Status.OPEN) { t.setStatus(Status.IN_PROGRESS); statusChanged = true; }
      }
    }
    Ticket saved = tickets.save(t);
    if (assigneeChanged) email.ticketAssigned(saved);
    if (statusChanged && !resolved) email.statusChanged(saved);
    if (resolved) email.resolved(saved);
    return saved;
  }

  public Comment addComment(User me, Long ticketId, String body) {
    Ticket t = tickets.findById(ticketId).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!canComment(me, t)) throw ApiException.forbidden("You cannot comment on this ticket");
    return comments.save(Comment.builder().ticket(t).author(me).body(body).build());
  }

  public Rating rate(User me, Long ticketId, int stars, String feedback) {
    Ticket t = tickets.findById(ticketId).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!t.getOwner().getId().equals(me.getId()))
      throw ApiException.forbidden("Only the ticket owner can rate");
    if (t.getStatus() != Status.RESOLVED && t.getStatus() != Status.CLOSED)
      throw ApiException.badRequest("Ticket must be resolved before rating");
    Rating existing = ratings.findByTicketId(ticketId).orElse(null);
    if (existing == null) {
      return ratings.save(Rating.builder().ticket(t).stars((short) stars).feedback(feedback).build());
    } else {
      existing.setStars((short) stars);
      existing.setFeedback(feedback);
      return ratings.save(existing);
    }
  }
}
