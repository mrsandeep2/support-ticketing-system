package com.leap.ticketing.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class)
  public ResponseEntity<?> handle(ApiException ex) {
    return ResponseEntity.status(ex.getStatus()).body(Map.of("error", ex.getMessage()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(f -> f.getField(), f -> f.getDefaultMessage() == null ? "invalid" : f.getDefaultMessage(), (a, b) -> a));
    Map<String, Object> body = new HashMap<>();
    body.put("error", "Validation failed");
    body.put("fields", errors);
    return ResponseEntity.badRequest().body(body);
  }
  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<?> badCreds(BadCredentialsException ex) {
    return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
  }
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<?> denied(AccessDeniedException ex) {
    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
  }
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> any(Exception ex) {
    ex.printStackTrace();
    return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
  }
}
