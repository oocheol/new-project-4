package com.example.starter.magazine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/magazine")
@CrossOrigin
public class MagazineController {
    private final MagazineEntryRepository entries;
    private final PhotoPageRepository photoPages;
    private final ReaderSubmissionRepository submissions;
    private final AuthService authService;

    public MagazineController(
            MagazineEntryRepository entries,
            PhotoPageRepository photoPages,
            ReaderSubmissionRepository submissions,
            AuthService authService) {
        this.entries = entries;
        this.photoPages = photoPages;
        this.submissions = submissions;
        this.authService = authService;
    }

    @PostMapping("/auth/signup")
    public AuthResponse signup(@Valid @RequestBody AuthRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/auth/me")
    public AuthResponse.UserProfile me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.profile(authorization);
    }

    @PatchMapping("/auth/me/profile-image")
    public AuthResponse.UserProfile updateProfileImage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ProfileImageRequest request) {
        return authService.updateProfileImage(authorization, request);
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("brand", "무제 (Untitled)");
        body.put("tagline", "빈 책 위에 사진과 글을 채워가는 온라인 잡지");
        body.put("menus", List.of("Home", "Photo book", "Submit", "About"));
        body.put("issues", List.of(
                Map.of("number", "Issue 00", "title", "Blank Book", "theme", "시작 전의 페이지"),
                Map.of("number", "Issue 01", "title", "Rooms of Light", "theme", "사진과 짧은 산문")));
        body.put("stories", entries.findAllByOrderByCreatedAtDesc());
        body.put("photoPages", photoPages.findAllByOrderByPageNumberAsc());
        return body;
    }

    @GetMapping("/stories")
    public List<MagazineEntry> stories() {
        return entries.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/stories")
    public MagazineEntry createStory(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody MagazineEntryRequest request) {
        MagazineUser user = authService.requireUser(authorization);
        MagazineEntry entry = new MagazineEntry();
        applyStoryRequest(entry, request);
        entry.setAuthorName(user.getNickname());
        entry.setOwnerId(user.getId());
        entry.setOwnerNickname(user.getNickname());
        entry.setOwnerProfileImageUrl(user.getProfileImageUrl());
        entry.setSeeded(false);
        return entries.save(entry);
    }

    @PutMapping("/stories/{id}")
    public ResponseEntity<MagazineEntry> updateStory(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @Valid @RequestBody MagazineEntryRequest request) {
        MagazineUser user = authService.requireUser(authorization);
        return entries.findById(id)
                .map(entry -> {
                    requireOwner(entry.getOwnerId(), user);
                    applyStoryRequest(entry, request);
                    entry.setOwnerNickname(user.getNickname());
                    entry.setOwnerProfileImageUrl(user.getProfileImageUrl());
                    return ResponseEntity.ok(entries.save(entry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/stories/{id}")
    public ResponseEntity<Void> deleteStory(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        MagazineUser user = authService.requireUser(authorization);
        return entries.findById(id)
                .map(entry -> {
                    requireOwner(entry.getOwnerId(), user);
                    entries.delete(entry);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void applyStoryRequest(MagazineEntry entry, MagazineEntryRequest request) {
        entry.setTitle(request.getTitle());
        entry.setCategory(request.getCategory());
        entry.setExcerpt(request.getExcerpt());
        entry.setBody(request.getBody());
        entry.setCoverImageUrl(request.getCoverImageUrl());
        entry.setLayoutMode(request.getLayoutMode());
    }

    @PostMapping("/stories/{id}/view")
    public ResponseEntity<MagazineEntry> viewStory(@PathVariable Long id) {
        return entries.findById(id)
                .map(entry -> {
                    entry.incrementViews();
                    return ResponseEntity.ok(entries.save(entry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/stories/{id}/like")
    public ResponseEntity<MagazineEntry> likeStory(@PathVariable Long id) {
        return entries.findById(id)
                .map(entry -> {
                    entry.incrementLikes();
                    return ResponseEntity.ok(entries.save(entry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/photo-pages")
    public List<PhotoPage> photoPages() {
        return photoPages.findAllByOrderByPageNumberAsc();
    }

    @PostMapping("/photo-pages")
    public PhotoPage createPhotoPage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody PhotoPageRequest request) {
        MagazineUser user = authService.requireUser(authorization);
        PhotoPage page = new PhotoPage();
        applyPhotoRequest(page, request);
        page.setPhotographer(user.getNickname());
        page.setOwnerId(user.getId());
        page.setOwnerNickname(user.getNickname());
        page.setOwnerProfileImageUrl(user.getProfileImageUrl());
        page.setSeeded(false);
        return photoPages.save(page);
    }

    @PutMapping("/photo-pages/{id}")
    public ResponseEntity<PhotoPage> updatePhotoPage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @Valid @RequestBody PhotoPageRequest request) {
        MagazineUser user = authService.requireUser(authorization);
        return photoPages.findById(id)
                .map(page -> {
                    requireOwner(page.getOwnerId(), user);
                    applyPhotoRequest(page, request);
                    page.setPhotographer(user.getNickname());
                    page.setOwnerNickname(user.getNickname());
                    page.setOwnerProfileImageUrl(user.getProfileImageUrl());
                    return ResponseEntity.ok(photoPages.save(page));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/photo-pages/{id}")
    public ResponseEntity<Void> deletePhotoPage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        MagazineUser user = authService.requireUser(authorization);
        return photoPages.findById(id)
                .map(page -> {
                    requireOwner(page.getOwnerId(), user);
                    photoPages.delete(page);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/photo-pages/{id}/representative-image")
    public ResponseEntity<AuthResponse.UserProfile> setRepresentativeImage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        MagazineUser user = authService.requireUser(authorization);
        return photoPages.findById(id)
                .map(page -> {
                    requireOwner(page.getOwnerId(), user);
                    ProfileImageRequest request = new ProfileImageRequest();
                    request.setProfileImageUrl(page.getImageUrl());
                    return ResponseEntity.ok(authService.updateProfileImage(authorization, request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void applyPhotoRequest(PhotoPage page, PhotoPageRequest request) {
        page.setTitle(request.getTitle());
        page.setCaption(request.getCaption());
        page.setImageUrl(request.getImageUrl());
        page.setStoryText(request.getStoryText());
        page.setPageNumber(request.getPageNumber());
    }

    @PostMapping("/photo-pages/{id}/view")
    public ResponseEntity<PhotoPage> viewPhotoPage(@PathVariable Long id) {
        return photoPages.findById(id)
                .map(page -> {
                    page.incrementViews();
                    return ResponseEntity.ok(photoPages.save(page));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/photo-pages/{id}/like")
    public ResponseEntity<PhotoPage> likePhotoPage(@PathVariable Long id) {
        return photoPages.findById(id)
                .map(page -> {
                    page.incrementLikes();
                    return ResponseEntity.ok(photoPages.save(page));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/submissions")
    public List<ReaderSubmission> submissions() {
        return submissions.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/submissions")
    public ReaderSubmission createSubmission(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ReaderSubmissionRequest request) {
        authService.requireUser(authorization);
        ReaderSubmission submission = new ReaderSubmission();
        submission.setAuthorName(request.getAuthorName());
        submission.setEmail(request.getEmail());
        submission.setTitle(request.getTitle());
        submission.setCategory(request.getCategory());
        submission.setBody(request.getBody());
        submission.setImageUrl(request.getImageUrl());
        return submissions.save(submission);
    }

    private void requireOwner(Long ownerId, MagazineUser user) {
        if (ownerId == null || !ownerId.equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "내 게시물만 수정하거나 삭제할 수 있습니다.");
        }
    }
}
