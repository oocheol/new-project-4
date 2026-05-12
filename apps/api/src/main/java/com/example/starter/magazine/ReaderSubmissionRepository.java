package com.example.starter.magazine;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReaderSubmissionRepository extends JpaRepository<ReaderSubmission, Long> {
    List<ReaderSubmission> findAllByOrderByCreatedAtDesc();
}
