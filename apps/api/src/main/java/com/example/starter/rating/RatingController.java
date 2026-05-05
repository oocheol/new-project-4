package com.example.starter.rating;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/rating")
public class RatingController {

  private final PhotoUserRepository userRepository;
  private final RatingPhotoRepository photoRepository;
  private final PhotoRatingRepository ratingRepository;
  private final PasswordHasher passwordHasher;
  private final SecureRandom secureRandom = new SecureRandom();

  public RatingController(
      PhotoUserRepository userRepository,
      RatingPhotoRepository photoRepository,
      PhotoRatingRepository ratingRepository,
      PasswordHasher passwordHasher) {
    this.userRepository = userRepository;
    this.photoRepository = photoRepository;
    this.ratingRepository = ratingRepository;
    this.passwordHasher = passwordHasher;
  }

  @PostMapping("/auth/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody AuthRequest request) {
    String loginId = clean(request.getLoginId());
    String nickname = clean(request.getNickname());

    if (nickname == null || nickname.length() < 2) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "닉네임을 2자 이상 입력해주세요.");
    }

    if (userRepository.existsByLoginIdIgnoreCase(loginId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
    }

    if (userRepository.existsByNicknameIgnoreCase(nickname)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
    }

    PhotoUser user = new PhotoUser(loginId, nickname, passwordHasher.hash(request.getPassword()));
    user.setSessionToken(issueToken());
    return new AuthResponse(user.getSessionToken(), userRepository.save(user));
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody AuthRequest request) {
    PhotoUser user = userRepository.findByLoginIdIgnoreCase(clean(request.getLoginId()))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 맞지 않습니다."));

    if (!passwordHasher.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 맞지 않습니다.");
    }

    user.setSessionToken(issueToken());
    return new AuthResponse(user.getSessionToken(), userRepository.save(user));
  }

  @GetMapping("/me")
  public PhotoUserSummary me(@RequestHeader(name = "Authorization", required = false) String authorization) {
    return PhotoUserSummary.from(requireUser(authorization));
  }

  @GetMapping("/photos")
  public List<RatingPhotoResponse> photos(
      @RequestHeader(name = "Authorization", required = false) String authorization) {
    Optional<PhotoUser> currentUser = findUser(authorization);
    return photoRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(photo -> toResponse(photo, currentUser.orElse(null), false))
        .collect(Collectors.toList());
  }

  @GetMapping("/photos/mine")
  public List<RatingPhotoResponse> myPhotos(
      @RequestHeader(name = "Authorization", required = false) String authorization) {
    PhotoUser user = requireUser(authorization);
    return photoRepository.findAllByOwnerIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(photo -> toResponse(photo, user, true))
        .collect(Collectors.toList());
  }

  @PostMapping("/photos")
  @ResponseStatus(HttpStatus.CREATED)
  public RatingPhotoResponse createPhoto(
      @RequestHeader(name = "Authorization", required = false) String authorization,
      @Valid @RequestBody RatingPhotoRequest request) {
    PhotoUser user = requireUser(authorization);
    String imageData = request.getImageData();

    if (!imageData.startsWith("data:image/")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일만 업로드할 수 있습니다.");
    }

    if (imageData.length() > 2_800_000) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지는 2MB 이하로 압축해서 올려주세요.");
    }

    RatingPhoto photo = photoRepository.save(new RatingPhoto(clean(request.getTitle()), imageData, user));
    return toResponse(photo, user, true);
  }

  @PostMapping("/photos/{photoId}/ratings")
  public RatingPhotoResponse ratePhoto(
      @RequestHeader(name = "Authorization", required = false) String authorization,
      @PathVariable Long photoId,
      @Valid @RequestBody ScoreRequest request) {
    PhotoUser user = requireUser(authorization);
    RatingPhoto photo = photoRepository.findById(photoId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다."));

    PhotoRating rating = ratingRepository.findByPhotoIdAndRaterId(photoId, user.getId())
        .orElseGet(() -> new PhotoRating(photo, user, request.getScore()));
    rating.setScore(request.getScore());
    ratingRepository.save(rating);

    return toResponse(photo, user, false);
  }

  private RatingPhotoResponse toResponse(RatingPhoto photo, PhotoUser currentUser, boolean includeStats) {
    List<PhotoRating> ratings = ratingRepository.findAllByPhotoId(photo.getId());
    double average = ratings.stream().mapToInt(PhotoRating::getScore).average().orElse(0);
    Integer myScore = currentUser == null ? null : ratings.stream()
        .filter(rating -> rating.getRaterEntity().getId().equals(currentUser.getId()))
        .map(PhotoRating::getScore)
        .findFirst()
        .orElse(null);

    Double visibleAverage = includeStats ? Math.round(average * 10.0) / 10.0 : null;
    Integer visibleCount = includeStats ? ratings.size() : null;

    return new RatingPhotoResponse(photo, visibleAverage, visibleCount, myScore);
  }

  private Optional<PhotoUser> findUser(String authorization) {
    String token = parseBearerToken(authorization);
    return token == null ? Optional.empty() : userRepository.findBySessionToken(token);
  }

  private PhotoUser requireUser(String authorization) {
    return findUser(authorization)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
  }

  private String parseBearerToken(String authorization) {
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      return null;
    }
    return authorization.substring("Bearer ".length()).trim();
  }

  private String issueToken() {
    byte[] token = new byte[32];
    secureRandom.nextBytes(token);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(token);
  }

  private String clean(String value) {
    return value == null ? null : value.trim();
  }
}
