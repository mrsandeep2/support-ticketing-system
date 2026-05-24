package com.leap.ticketing.controller;

import com.leap.ticketing.dto.TicketDtos.AttachmentResponse;
import com.leap.ticketing.dto.TicketDtos.UserSummary;
import com.leap.ticketing.model.Attachment;
import com.leap.ticketing.security.AppUserPrincipal;
import com.leap.ticketing.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
public class AttachmentController {
  private final AttachmentService svc;
  public AttachmentController(AttachmentService svc) { this.svc = svc; }

  @PostMapping
  public AttachmentResponse upload(@AuthenticationPrincipal AppUserPrincipal me,
                                   @PathVariable Long ticketId,
                                   @RequestParam("file") MultipartFile file) throws IOException {
    Attachment a = svc.upload(me.getUser(), ticketId, file);
    var u = a.getUploader();
    return new AttachmentResponse(a.getId(), a.getFilename(), a.getContentType(), a.getSize(), a.getCreatedAt(),
        new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole().name()));
  }

  @GetMapping("/{attId}")
  public ResponseEntity<Resource> download(@AuthenticationPrincipal AppUserPrincipal me,
                                           @PathVariable Long ticketId, @PathVariable Long attId) {
    Attachment a = svc.getForDownload(me.getUser(), ticketId, attId);
    Resource r = svc.asResource(a);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + a.getFilename() + "\"")
        .contentType(a.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(a.getContentType()))
        .body(r);
  }
}
