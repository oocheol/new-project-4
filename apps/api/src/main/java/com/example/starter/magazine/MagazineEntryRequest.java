package com.example.starter.magazine;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class MagazineEntryRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String authorName;

    @NotBlank
    private String category;

    @NotBlank
    @Size(max = 700)
    private String excerpt;

    @NotBlank
    private String body;

    @NotBlank
    private String coverImageUrl;

    private String layoutMode;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getLayoutMode() {
        return layoutMode;
    }

    public void setLayoutMode(String layoutMode) {
        this.layoutMode = layoutMode;
    }
}
