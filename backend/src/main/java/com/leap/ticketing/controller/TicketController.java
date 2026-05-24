package com.leap.ticketing.controller;

import com.leap.ticketing.dto.TicketDtos.*;
import com.leap.ticketing.model.*;
import com.leap.ticketing.security.AppUserPrincipal;
import com.leap.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
  private final TicketService tickets;
  public TicketController(TicketService tickets) { this.tickets = tickets; }

  @GetMapping
  public List<TicketListItem> list(@AuthenticationPrincipal AppUserPrincipal me,
                                   @RequestParam(required = false) Status status,
                                   @RequestParam(required = false) Priority priority,
                                   @RequestParam(required = false) Long assigneeId,
                                   @RequestParam(required = false) Long ownerId,
                                   @RequestParam(required = false) String q,
                                   @RequestParam(required = false) String sort) {
    return tickets.list(me.getUser(), status, priority, assigneeId, ownerId, q, sort);
  }

  @PostMapping
  public ResponseEntity<TicketResponse> create(@AuthenticationPrincipal AppUserPrincipal me,
                                               @Valid @RequestBody CreateTicketRequest req) {
    Ticket t = tickets.create(me.getUser(), req);
    return ResponseEntity.ok(tickets.view(me.getUser(), t.getId()));
  }

  @GetMapping("/{id}")
  public TicketResponse get(@AuthenticationPrincipal AppUserPrincipal me, @PathVariable Long id) {
    return tickets.view(me.getUser(), id);
  }

  @PatchMapping("/{id}")
  public TicketResponse update(@AuthenticationPrincipal AppUserPrincipal me,
                               @PathVariable Long id,
                               @RequestBody UpdateTicketRequest req) {
    Ticket t = tickets.update(me.getUser(), id, req);
    return tickets.view(me.getUser(), t.getId());
  }

  @PostMapping("/{id}/comments")
  public TicketResponse comment(@AuthenticationPrincipal AppUserPrincipal me,
                                @PathVariable Long id,
                                @Valid @RequestBody CreateCommentRequest req) {
    tickets.addComment(me.getUser(), id, req.body());
    return tickets.view(me.getUser(), id);
  }

  @PostMapping("/{id}/rating")
  public TicketResponse rate(@AuthenticationPrincipal AppUserPrincipal me,
                             @PathVariable Long id,
                             @Valid @RequestBody CreateRatingRequest req) {
    tickets.rate(me.getUser(), id, req.stars(), req.feedback());
    return tickets.view(me.getUser(), id);
  }
}
