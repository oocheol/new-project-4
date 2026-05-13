package com.example.starter.magazine;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MagazineUserRepository extends JpaRepository<MagazineUser, Long> {
    Optional<MagazineUser> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);
}
