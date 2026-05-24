package com.leap.ticketing.service;

import com.leap.ticketing.model.Ticket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private final boolean enabled;
  private final String frontend;

  public EmailService(@Value("${app.mail.enabled:false}") boolean enabled,
                      @Value("${app.frontend-url}") String frontend) {
    this.enabled = enabled;
    this.frontend = frontend;
  }

  private void send(String to, String subject, String body) {
    // Email delivery disabled for this deployment; keep no-op to avoid startup dependency.
    if (enabled && to != null && !to.isBlank()) {
      System.out.println("[mail-disabled] to=" + to + " subj=" + subject);
    }
  }

  public void ticketCreated(Ticket t) {
    String url = frontend + "/tickets/" + t.getId();
    send(t.getOwner().getEmail(),
        "Ticket #" + t.getId() + " created: " + t.getSubject(),
        "Hi " + t.getOwner().getName() + ",\n\nYour ticket has been created.\n\nView: " + url);
  }
  public void ticketAssigned(Ticket t) {
    if (t.getAssignee() == null) return;
    String url = frontend + "/tickets/" + t.getId();
    send(t.getAssignee().getEmail(),
        "Ticket #" + t.getId() + " assigned to you",
        "A ticket has been assigned to you: " + t.getSubject() + "\n\nView: " + url);
  }
  public void statusChanged(Ticket t) {
    String url = frontend + "/tickets/" + t.getId();
    send(t.getOwner().getEmail(),
        "Ticket #" + t.getId() + " status: " + t.getStatus(),
        "The status of your ticket '" + t.getSubject() + "' changed to " + t.getStatus() + ".\n\nView: " + url);
  }
  public void resolved(Ticket t) {
    String url = frontend + "/tickets/" + t.getId();
    send(t.getOwner().getEmail(),
        "Ticket #" + t.getId() + " resolved",
        "Your ticket '" + t.getSubject() + "' has been resolved. Please rate the resolution.\n\nView: " + url);
  }
}
