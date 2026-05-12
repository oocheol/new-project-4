package com.example.starter.magazine;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(20)
public class MagazineDataSeeder implements CommandLineRunner {
    private final MagazineEntryRepository entries;
    private final PhotoPageRepository photoPages;

    public MagazineDataSeeder(MagazineEntryRepository entries, PhotoPageRepository photoPages) {
        this.entries = entries;
        this.photoPages = photoPages;
    }

    @Override
    public void run(String... args) {
        if (entries.count() == 0) {
            entries.save(entry(
                    "빈 책의 첫 문장",
                    "Editor",
                    "Essay",
                    "아무것도 정해지지 않은 지면 위에서 사진은 먼저 침묵하고, 문장은 그 침묵을 따라 걷는다.",
                    "무제는 완성된 잡지를 전시하는 곳이 아니라, 비어 있는 책을 함께 채우는 장소다. 한 장의 사진, 짧은 기록, 계절의 색, 아직 제목이 없는 생각들이 페이지가 된다. 독자는 넘기고, 작성자는 남기고, 편집자는 흐름을 묶는다.",
                    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80",
                    "essay"));
            entries.save(entry(
                    "도시의 여백",
                    "Muje Desk",
                    "Photo essay",
                    "창가와 골목, 버스 정류장과 늦은 오후 사이에서 도시가 잠깐 책처럼 펼쳐진다.",
                    "사진은 사건보다 느리다. 그래서 우리가 놓친 장면을 종종 붙잡는다. 이 글은 도시를 빠르게 설명하지 않고, 한 페이지씩 넘겨 보려는 시도다. 빛이 닿은 벽, 비어 있는 의자, 지나가는 발소리가 작은 목차가 된다.",
                    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
                    "feature"));
            entries.save(entry(
                    "읽는 사진, 쓰는 사진",
                    "Untitled Lab",
                    "Interview",
                    "사진을 보는 일과 글을 쓰는 일이 어떻게 같은 페이지 안에서 만나는지 묻는다.",
                    "무제의 인터뷰는 완성된 답을 찾기보다, 아직 편집되지 않은 생각을 책상 위에 올려두는 방식에 가깝다. 사진가는 프레임을 말하고, 작가는 여백을 말한다. 두 사람이 만나는 곳에 독자의 시간이 놓인다.",
                    "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1400&q=80",
                    "interview"));
        }

        if (photoPages.count() == 0) {
            photoPages.save(page(
                    1,
                    "Page 01. 창가",
                    "Lee Noon",
                    "빛이 종이처럼 접히는 오후",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
                    "사진 아래의 문장은 캡션이 아니라 다음 장으로 넘어가기 전의 숨이다."));
            photoPages.save(page(
                    2,
                    "Page 02. 정류장",
                    "Han River",
                    "기다림이 만든 얇은 줄",
                    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
                    "멈춰 있는 사람들 사이에서 풍경은 천천히 편집된다."));
            photoPages.save(page(
                    3,
                    "Page 03. 책상",
                    "Park Page",
                    "아직 쓰이지 않은 쪽",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
                    "빈 책상은 가장 작은 잡지사다. 거기서 모든 호가 시작된다."));
        }
    }

    private MagazineEntry entry(String title, String author, String category, String excerpt, String body, String image, String layout) {
        MagazineEntry entry = new MagazineEntry();
        entry.setTitle(title);
        entry.setAuthorName(author);
        entry.setCategory(category);
        entry.setExcerpt(excerpt);
        entry.setBody(body);
        entry.setCoverImageUrl(image);
        entry.setLayoutMode(layout);
        return entry;
    }

    private PhotoPage page(int pageNumber, String title, String photographer, String caption, String image, String story) {
        PhotoPage page = new PhotoPage();
        page.setPageNumber(pageNumber);
        page.setTitle(title);
        page.setPhotographer(photographer);
        page.setCaption(caption);
        page.setImageUrl(image);
        page.setStoryText(story);
        return page;
    }
}
