package com.example.starter.magazine;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final long TOKEN_TTL_SECONDS = 60L * 60L * 24L * 30L;

    private final MagazineUserRepository users;
    private final SecureRandom random = new SecureRandom();
    private final String tokenSecret;

    public AuthService(
            MagazineUserRepository users,
            @Value("${app.auth.token-secret:${APP_AUTH_TOKEN_SECRET:untitled-local-secret}}") String tokenSecret) {
        this.users = users;
        this.tokenSecret = tokenSecret;
    }

    public AuthResponse signup(AuthRequest request) {
        String nickname = requireText(request.getNickname(), "닉네임을 입력해주세요.");
        String loginId = normalizeLoginId(request.getLoginId());
        String password = requireText(request.getPassword(), "비밀번호를 입력해주세요.");
        if (users.existsByLoginId(loginId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }

        String salt = randomToken(18);
        MagazineUser user = new MagazineUser();
        user.setNickname(nickname);
        user.setLoginId(loginId);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hashPassword(password, salt));
        user.setProfileImageUrl(blankToNull(request.getProfileImageUrl()));
        MagazineUser saved = users.save(user);
        return new AuthResponse(createToken(saved), saved);
    }

    public AuthResponse login(AuthRequest request) {
        String loginId = normalizeLoginId(request.getLoginId());
        String password = requireText(request.getPassword(), "비밀번호를 입력해주세요.");
        MagazineUser user = users.findByLoginId(loginId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 맞지 않습니다."));
        if (!MessageDigest.isEqual(
                hashPassword(password, user.getPasswordSalt()).getBytes(StandardCharsets.UTF_8),
                user.getPasswordHash().getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 맞지 않습니다.");
        }
        return new AuthResponse(createToken(user), user);
    }

    public MagazineUser requireUser(String authorization) {
        return readUser(authorization);
    }

    public AuthResponse.UserProfile profile(String authorization) {
        return new AuthResponse.UserProfile(readUser(authorization));
    }

    public AuthResponse.UserProfile updateProfileImage(String authorization, ProfileImageRequest request) {
        MagazineUser user = readUser(authorization);
        user.setProfileImageUrl(blankToNull(request.getProfileImageUrl()));
        return new AuthResponse.UserProfile(users.save(user));
    }

    private MagazineUser readUser(String authorization) {
        String token = extractBearer(authorization);
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "다시 로그인해주세요.");
        }
        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        String signature = sign(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "다시 로그인해주세요.");
        }
        String[] payloadParts = payload.split(":");
        if (payloadParts.length != 2) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "다시 로그인해주세요.");
        }
        long expiresAt = Long.parseLong(payloadParts[1]);
        if (Instant.now().getEpochSecond() > expiresAt) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다.");
        }
        Long userId = Long.valueOf(payloadParts[0]);
        return users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
    }

    private String createToken(MagazineUser user) {
        long expiresAt = Instant.now().plusSeconds(TOKEN_TTL_SECONDS).getEpochSecond();
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString((user.getId() + ":" + expiresAt).getBytes(StandardCharsets.UTF_8));
        String nonce = randomToken(12);
        return payload + "." + nonce + "." + sign(payload + "." + nonce);
    }

    private String hashPassword(String password, String salt) {
        return digest(salt + ":" + password);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign token", exception);
        }
    }

    private String digest(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not hash password", exception);
        }
    }

    private String randomToken(int bytes) {
        byte[] value = new byte[bytes];
        random.nextBytes(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String extractBearer(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return authorization.substring("Bearer ".length()).trim();
    }

    private String normalizeLoginId(String loginId) {
        return requireText(loginId, "아이디를 입력해주세요.").trim().toLowerCase();
    }

    private String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
