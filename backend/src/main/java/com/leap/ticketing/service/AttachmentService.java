package com.leap.ticketing.service;

import com.leap.ticketing.exception.ApiException;
import com.leap.ticketing.model.*;
import com.leap.ticketing.repository.AttachmentRepository;
import com.leap.ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class AttachmentService {
  private final AttachmentRepository repo;
  private final TicketRepository tickets;
  private final TicketService ticketService;
  private final Path uploadRoot;

  public AttachmentService(AttachmentRepository repo, TicketRepository tickets,
                           TicketService ticketService,
                           @Value("${app.upload-dir}") String uploadDir) throws IOException {
    this.repo = repo; this.tickets = tickets; this.ticketService = ticketService;
    this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(this.uploadRoot);
  }

  public Attachment upload(User me, Long ticketId, MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) throw ApiException.badRequest("Empty file");
    if (file.getSize() > 20L * 1024 * 1024) throw ApiException.badRequest("File too large (max 20MB)");
    Ticket t = tickets.findById(ticketId).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!ticketService.canComment(me, t)) throw ApiException.forbidden("Cannot attach to this ticket");

    String original = file.getOriginalFilename() == null ? "file" : Paths.get(file.getOriginalFilename()).getFileName().toString();
    String safe = original.replaceAll("[^a-zA-Z0-9._-]", "_");
    String stored = UUID.randomUUID() + "_" + safe;
    Path target = uploadRoot.resolve("ticket-" + ticketId).resolve(stored).normalize();
    if (!target.startsWith(uploadRoot)) throw ApiException.badRequest("Invalid path");
    Files.createDirectories(target.getParent());
    file.transferTo(target.toFile());

    return repo.save(Attachment.builder()
        .ticket(t).uploader(me)
        .filename(original)
        .contentType(file.getContentType())
        .size(file.getSize())
        .storagePath(target.toString())
        .build());
  }

  public Attachment getForDownload(User me, Long ticketId, Long attId) {
    Ticket t = tickets.findById(ticketId).orElseThrow(() -> ApiException.notFound("Ticket not found"));
    if (!ticketService.canView(me, t)) throw ApiException.forbidden("Cannot access");
    Attachment a = repo.findById(attId).orElseThrow(() -> ApiException.notFound("Attachment not found"));
    if (!a.getTicket().getId().equals(ticketId)) throw ApiException.notFound("Attachment not found");
    return a;
  }

  public Resource asResource(Attachment a) {
    return new FileSystemResource(a.getStoragePath());
  }
}
