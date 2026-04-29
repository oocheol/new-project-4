package com.example.starter.wedding;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingInquiryRepository extends JpaRepository<BookingInquiry, Long> {

  List<BookingInquiry> findAllByOrderByCreatedAtDesc();
}
