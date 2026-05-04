package com.example.starter.rating;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.stereotype.Component;

@Component
public class PasswordHasher {

  private static final int ITERATIONS = 120_000;
  private static final int KEY_LENGTH = 256;
  private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
  private final SecureRandom secureRandom = new SecureRandom();

  public String hash(String password) {
    byte[] salt = new byte[16];
    secureRandom.nextBytes(salt);
    byte[] hash = pbkdf2(password.toCharArray(), salt);
    return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":"
        + Base64.getEncoder().encodeToString(hash);
  }

  public boolean matches(String password, String storedHash) {
    if (password == null || storedHash == null) {
      return false;
    }

    String[] parts = storedHash.split(":");
    if (parts.length != 3) {
      return false;
    }

    int iterations = Integer.parseInt(parts[0]);
    byte[] salt = Base64.getDecoder().decode(parts[1]);
    byte[] expected = Base64.getDecoder().decode(parts[2]);
    byte[] actual = pbkdf2(password.toCharArray(), salt, iterations);

    if (actual.length != expected.length) {
      return false;
    }

    int diff = 0;
    for (int i = 0; i < actual.length; i++) {
      diff |= actual[i] ^ expected[i];
    }
    return diff == 0;
  }

  private byte[] pbkdf2(char[] password, byte[] salt) {
    return pbkdf2(password, salt, ITERATIONS);
  }

  private byte[] pbkdf2(char[] password, byte[] salt, int iterations) {
    try {
      PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, KEY_LENGTH);
      return SecretKeyFactory.getInstance(ALGORITHM).generateSecret(spec).getEncoded();
    } catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
      throw new IllegalStateException("Password hashing failed", exception);
    }
  }
}
