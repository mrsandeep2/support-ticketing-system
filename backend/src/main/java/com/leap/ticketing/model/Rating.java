package com.leap.ticketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "ratings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rating {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "ticket_id", nullable = false, unique = true)
  private Ticket ticket;

  @Column(nullable = false)
  private Short stars;

  @Column(columnDefinition = "TEXT")
  private String feedback;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
