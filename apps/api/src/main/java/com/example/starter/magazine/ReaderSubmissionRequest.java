package com.example.starter.magazine;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

public class ReaderSubmissionRequest {
    @NotBlank
    private String authorName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String title;

    @NotBlank
    private String category;

    @NotBlank
    private String body;

    private String imageUrl;

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
