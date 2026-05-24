package com.leap.ticketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attachment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "ticket_id", nullable = false)
  private Ticket ticket;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "uploader_id", nullable = false)
  private User uploader;

  @Column(nullable = false) private String filename;
  @Column(name = "content_type", length = 120) private String contentType;
  private Long size;
  @Column(name = "storage_path", nullable = false, length = 500) private String storagePath;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
