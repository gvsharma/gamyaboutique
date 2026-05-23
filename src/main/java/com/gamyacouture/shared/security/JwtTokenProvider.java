package com.gamyacouture.shared.security;

import com.gamyacouture.auth.domain.Role;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.shared.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    public String generateAccessToken(UserAccount user) {
        List<String> roles = user.getRoles().stream().map(Role::name).toList();
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.accessTokenExpirationMs());

        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(jwtProperties.issuer())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .requireIssuer(jwtProperties.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }
}
