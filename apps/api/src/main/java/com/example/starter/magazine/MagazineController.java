package com.example.starter.magazine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/magazine")
@CrossOrigin
public class MagazineController {
    private final MagazineEntryRepository entries;
    private final PhotoPageRepository photoPages;
    private final ReaderSubmissionRepository submissions;

    public MagazineController(
            MagazineEntryRepository entries,
            PhotoPageRepository photoPages,
            ReaderSubmissionRepository submissions) {
        this.entries = entries;
        this.photoPages = photoPages;
        this.submissions = submissions;
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("brand", "무제 (Untitled)");
        body.put("tagline", "빈 책 위에 사진과 글을 채워가는 온라인 잡지");
        body.put("menus", List.of("Home", "Issues", "Stories", "Photo book", "Submit", "About", "Contact"));
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
    public MagazineEntry createStory(@Valid @RequestBody MagazineEntryRequest request) {
        MagazineEntry entry = new MagazineEntry();
        entry.setTitle(request.getTitle());
        entry.setAuthorName(request.getAuthorName());
        entry.setCategory(request.getCategory());
        entry.setExcerpt(request.getExcerpt());
        entry.setBody(request.getBody());
        entry.setCoverImageUrl(request.getCoverImageUrl());
        entry.setLayoutMode(request.getLayoutMode());
        return entries.save(entry);
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
    public PhotoPage createPhotoPage(@Valid @RequestBody PhotoPageRequest request) {
        PhotoPage page = new PhotoPage();
        page.setTitle(request.getTitle());
        page.setPhotographer(request.getPhotographer());
        page.setCaption(request.getCaption());
        page.setImageUrl(request.getImageUrl());
        page.setStoryText(request.getStoryText());
        page.setPageNumber(request.getPageNumber());
        return photoPages.save(page);
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
    public ReaderSubmission createSubmission(@Valid @RequestBody ReaderSubmissionRequest request) {
        ReaderSubmission submission = new ReaderSubmission();
        submission.setAuthorName(request.getAuthorName());
        submission.setEmail(request.getEmail());
        submission.setTitle(request.getTitle());
        submission.setCategory(request.getCategory());
        submission.setBody(request.getBody());
        submission.setImageUrl(request.getImageUrl());
        return submissions.save(submission);
    }
}
