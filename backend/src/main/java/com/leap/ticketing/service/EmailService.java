package com.leap.ticketing.service;

import com.leap.ticketing.model.Ticket;
import com.leap.ticketing.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private final JavaMailSender sender;
  private final boolean enabled;
  private final String from;
  private final String frontend;

  public EmailService(JavaMailSender sender,
                      @Value("${app.mail.enabled:false}") boolean enabled,
                      @Value("${app.mail.from:no-reply@example.com}") String from,
                      @Value("${app.frontend-url}") String frontend) {
    this.sender = sender; this.enabled = enabled; this.from = from; this.frontend = frontend;
  }

  @Async
  public void send(String to, String subject, String body) {
    if (!enabled || to == null || to.isBlank()) {
      System.out.println("[mail-skip] to=" + to + " subj=" + subject);
      return;
    }
    try {
      SimpleMailMessage msg = new SimpleMailMessage();
      msg.setFrom(from);
      msg.setTo(to);
      msg.setSubject(subject);
      msg.setText(body);
      sender.send(msg);
    } catch (Exception e) {
      System.err.println("[mail-fail] " + e.getMessage());
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
