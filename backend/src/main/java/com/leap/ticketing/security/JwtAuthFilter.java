package com.leap.ticketing.security;

import com.leap.ticketing.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtUtil jwt;
  private final UserRepository users;
  public JwtAuthFilter(JwtUtil jwt, UserRepository users) { this.jwt = jwt; this.users = users; }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String header = req.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        Claims claims = jwt.parse(token);
        Long userId = Long.valueOf(claims.getSubject());
        users.findById(userId).ifPresent(u -> {
          AppUserPrincipal p = new AppUserPrincipal(u);
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities());
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
          SecurityContextHolder.getContext().setAuthentication(auth);
        });
      } catch (Exception ignored) { /* invalid token -> anonymous */ }
    }
    chain.doFilter(req, res);
  }
}
