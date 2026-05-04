package com.example.starter.rating;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoUserRepository extends JpaRepository<PhotoUser, Long> {

  boolean existsByLoginIdIgnoreCase(String loginId);

  boolean existsByNicknameIgnoreCase(String nickname);

  Optional<PhotoUser> findByLoginIdIgnoreCase(String loginId);

  Optional<PhotoUser> findBySessionToken(String sessionToken);
}
