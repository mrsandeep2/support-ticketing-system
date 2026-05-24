package com.leap.ticketing.dto;

import com.leap.ticketing.model.Priority;
import com.leap.ticketing.model.Status;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public class TicketDtos {
  public record CreateTicketRequest(
      @NotBlank @Size(max = 200) String subject,
      @NotBlank String description,
      Priority priority
  ) {}
  public record UpdateTicketRequest(
      Status status,
      Priority priority,
      Long assigneeId
  ) {}
  public record UserSummary(Long id, String name, String email, String role) {}
  public record CommentResponse(Long id, String body, UserSummary author, Instant createdAt) {}
  public record AttachmentResponse(Long id, String filename, String contentType, Long size, Instant createdAt, UserSummary uploader) {}
  public record RatingResponse(Short stars, String feedback, Instant createdAt) {}
  public record TicketResponse(
      Long id, String subject, String description,
      Status status, Priority priority,
      UserSummary owner, UserSummary assignee,
      Instant createdAt, Instant updatedAt, Instant resolvedAt,
      List<CommentResponse> comments,
      List<AttachmentResponse> attachments,
      RatingResponse rating
  ) {}
  public record TicketListItem(
      Long id, String subject,
      Status status, Priority priority,
      UserSummary owner, UserSummary assignee,
      Instant createdAt, Instant updatedAt
  ) {}
  public record CreateCommentRequest(@NotBlank String body) {}
  public record CreateRatingRequest(@Min(1) @Max(5) int stars, String feedback) {}
}
