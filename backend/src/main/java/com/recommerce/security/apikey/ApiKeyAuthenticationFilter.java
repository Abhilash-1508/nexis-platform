package com.recommerce.security.apikey;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-KEY";

    @Autowired
    private ApiKeyService apiKeyService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Target internal/scripting routes
        if (path.startsWith("/api/internal/") || path.startsWith("/api/admin/scripts/")) {
            String providedKey = request.getHeader(API_KEY_HEADER);

            if (providedKey == null || !apiKeyService.isValidApiKey(providedKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or Missing API Key\"}");
                return;
            }

            // Expose a hardcoded ROLE_INTERNAL context to bypass generic JWT checks downstream
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("INTERNAL_SERVICE", null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL")))
            );
        }

        filterChain.doFilter(request, response);
    }
}
