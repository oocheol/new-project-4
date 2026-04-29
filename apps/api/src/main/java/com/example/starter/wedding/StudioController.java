package com.example.starter.wedding;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class StudioController {

  private final PhotographerRepository photographerRepository;
  private final PortfolioPhotoRepository portfolioPhotoRepository;
  private final BookingInquiryRepository bookingInquiryRepository;

  public StudioController(
      PhotographerRepository photographerRepository,
      PortfolioPhotoRepository portfolioPhotoRepository,
      BookingInquiryRepository bookingInquiryRepository) {
    this.photographerRepository = photographerRepository;
    this.portfolioPhotoRepository = portfolioPhotoRepository;
    this.bookingInquiryRepository = bookingInquiryRepository;
  }

  @GetMapping("/studio")
  public Map<String, Object> studio() {
    return Map.of(
        "photographers", photographerRepository.findAllByOrderByNameAsc(),
        "photos", portfolioPhotoRepository.findAllByOrderByFeaturedDescIdAsc());
  }

  @GetMapping("/photographers")
  public List<Photographer> photographers() {
    return photographerRepository.findAllByOrderByNameAsc();
  }

  @GetMapping("/portfolio")
  public List<PortfolioPhoto> portfolio() {
    return portfolioPhotoRepository.findAllByOrderByFeaturedDescIdAsc();
  }

  @PostMapping("/portfolio")
  @ResponseStatus(HttpStatus.CREATED)
  public PortfolioPhoto createPortfolioPhoto(@Valid @RequestBody PortfolioPhotoRequest request) {
    Photographer photographer = photographerRepository.findById(request.getPhotographerId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photographer not found"));

    PortfolioPhoto photo = new PortfolioPhoto(
        request.getTitle(),
        request.getMood(),
        request.getVenue(),
        request.getSeason(),
        request.getImageUrl(),
        Boolean.TRUE.equals(request.getFeatured()),
        photographer);

    return portfolioPhotoRepository.save(photo);
  }

  @GetMapping("/inquiries")
  public List<BookingInquiry> inquiries() {
    return bookingInquiryRepository.findAllByOrderByCreatedAtDesc();
  }

  @PostMapping("/inquiries")
  @ResponseStatus(HttpStatus.CREATED)
  public BookingInquiry createInquiry(@Valid @RequestBody BookingInquiryRequest request) {
    Photographer photographer = photographerRepository.findById(request.getPhotographerId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photographer not found"));

    BookingInquiry inquiry = new BookingInquiry(
        request.getCoupleName(),
        request.getPhone(),
        request.getEmail(),
        request.getWeddingDate(),
        request.getPreferredMood(),
        request.getMessage(),
        photographer);

    return bookingInquiryRepository.save(inquiry);
  }

  @GetMapping("/photographers/{id}/photos")
  public List<PortfolioPhoto> photographerPhotos(@PathVariable Long id) {
    Photographer photographer = photographerRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photographer not found"));

    return portfolioPhotoRepository.findAllByOrderByFeaturedDescIdAsc().stream()
        .filter(photo -> photo.getPhotographer().getId().equals(photographer.getId()))
        .collect(Collectors.toList());
  }
}
