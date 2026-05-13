import {
  createPhotoPage,
  createStory,
  createSubmission,
  getHealth,
  getMagazineHome,
  likePhotoPage,
  likeStory,
  viewPhotoPage,
  viewStory
} from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");

const navItems = [
  { label: "Home", view: "home" },
  { label: "Photo book", view: "photoBook" },
  { label: "Submit", view: "submit" },
  { label: "About", view: "about" }
];

const fallbackHome = {
  brand: "무제 (Untitled)",
  tagline: "사진과 글로 채워가는 빈 책",
  menus: navItems.map((item) => item.label),
  issues: [],
  stories: [],
  photoPages: []
};

const state = {
  health: "checking",
  view: "home",
  home: fallbackHome,
  selectedStoryId: null,
  selectedPhotoIndex: 0,
  submitMode: "photo",
  message: "",
  error: "",
  loading: false,
  mobileMenuOpen: false,
  photoPreview: "",
  swipeStartX: 0,
  swipeStartY: 0
};

render();
bootstrap();

async function bootstrap() {
  await Promise.all([checkHealth(), refreshHome()]);
  render();
}

async function checkHealth() {
  try {
    await getHealth();
    state.health = "online";
  } catch {
    state.health = "offline";
  }
}

async function refreshHome() {
  try {
    state.home = await getMagazineHome();
  } catch (error) {
    state.error = error.message;
  }
}

function render() {
  app.innerHTML = `
    <div class="site-shell">
      ${renderHeader()}
      <main>
        ${renderNotice()}
        ${renderCurrentView()}
      </main>
      ${renderFooter()}
    </div>
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="masthead">
      <button class="wordmark" data-view="home" type="button" aria-label="Home">
        <span>무제</span>
        <small>Untitled</small>
      </button>
      <nav class="desktop-nav" aria-label="Main">
        ${navItems.map(renderNavButton).join("")}
      </nav>
      <button class="menu-button" data-toggle-menu type="button" aria-expanded="${state.mobileMenuOpen}">
        <span></span><span></span>
      </button>
      ${state.mobileMenuOpen ? `
        <nav class="mobile-nav" aria-label="Mobile">
          ${navItems.map(renderNavButton).join("")}
        </nav>
      ` : ""}
    </header>
  `;
}

function renderNavButton(item) {
  return `<button class="${state.view === item.view ? "active" : ""}" data-view="${item.view}" type="button">${item.label}</button>`;
}

function renderNotice() {
  if (!state.message && !state.error) {
    return "";
  }

  return `
    <div class="notice-line">
      ${state.message ? `<strong>${escapeHtml(state.message)}</strong>` : ""}
      ${state.error ? `<strong class="error">${escapeHtml(state.error)}</strong>` : ""}
    </div>
  `;
}

function renderCurrentView() {
  if (state.view === "photoBook") return renderPhotoBook();
  if (state.view === "submit") return renderSubmit();
  if (state.view === "about") return renderAbout();
  return renderHome();
}

function renderHome() {
  const photos = sortedPhotos();
  const leadPhoto = photos[0];
  const leadStory = latestStories()[0];

  return `
    <section class="home-hero">
      <picture class="hero-media">
        <img src="${leadPhoto ? leadPhoto.imageUrl : defaultHeroImage()}" alt="${leadPhoto ? escapeHtml(leadPhoto.caption) : "무제 포토북"}" />
      </picture>
      <div class="hero-copy">
        <h1>무제</h1>
        <p>${escapeHtml(state.home.tagline || "사진과 글로 채워가는 빈 책")}</p>
        <div class="hero-actions">
          <button class="primary-button" data-view="photoBook" type="button">Photo book 보기</button>
          <button class="secondary-button" data-view="submit" type="button">페이지 남기기</button>
        </div>
      </div>
    </section>

    <section class="photo-grid-section">
      <div class="section-heading">
        <h2>Latest pages</h2>
        <button class="text-button" data-view="photoBook" type="button">모두 보기</button>
      </div>
      <div class="photo-grid">
        ${photos.slice(0, 6).map(renderPhotoTile).join("") || renderEmpty("아직 사진이 없습니다.", "Submit에서 첫 사진을 올려보세요.")}
      </div>
    </section>

    <section class="home-stories">
      <div class="section-heading">
        <h2>Notes</h2>
      </div>
      <div class="story-list">
        ${latestStories().slice(0, 3).map(renderStoryRow).join("") || renderEmpty("아직 글이 없습니다.", "짧은 문장으로 첫 페이지를 열어보세요.")}
      </div>
      ${leadStory ? `
        <article class="selected-story">
          <img src="${leadStory.coverImageUrl}" alt="${escapeHtml(leadStory.title)}" />
          <div>
            <h3>${escapeHtml(leadStory.title)}</h3>
            <p>${escapeHtml(leadStory.excerpt)}</p>
            <button class="secondary-button" data-open-story="${leadStory.id}" type="button">읽기</button>
          </div>
        </article>
      ` : ""}
    </section>
  `;
}

function renderPhotoBook() {
  const pages = sortedPhotos();
  if (!pages.length) {
    return `
      <section class="book-reader empty-book">
        ${renderEmpty("사진 책이 비어 있습니다.", "Submit에서 첫 사진 페이지를 추가해보세요.")}
      </section>
    `;
  }

  const page = pages[state.selectedPhotoIndex] || pages[0];
  const nextPage = pages[state.selectedPhotoIndex + 1] || pages[0];

  return `
    <section class="book-reader">
      <div class="reader-toolbar">
        <div>
          <h1>Photo book</h1>
          <p>${state.selectedPhotoIndex + 1} / ${pages.length}</p>
        </div>
        <div class="reader-controls">
          <button class="icon-button" data-prev-page type="button" aria-label="Previous page">
            ${arrowIcon("left")}
          </button>
          <button class="icon-button" data-next-page type="button" aria-label="Next page">
            ${arrowIcon("right")}
          </button>
        </div>
      </div>

      <div class="book-spread" data-swipe-book>
        ${renderPhotoPage(page, "primary-page")}
        ${renderTextPage(page)}
        ${renderPhotoPage(nextPage, "next-page")}
      </div>

      <div class="page-dots" aria-label="Photo pages">
        ${pages.map((item, index) => `
          <button class="${index === state.selectedPhotoIndex ? "active" : ""}" data-go-page="${index}" type="button" aria-label="Page ${index + 1}"></button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPhotoPage(page, className) {
  return `
    <figure class="book-image-page ${className}">
      <img src="${page.imageUrl}" alt="${escapeHtml(page.caption)}" />
      <figcaption>
        <span>Page ${page.pageNumber}</span>
        <strong>${escapeHtml(page.caption)}</strong>
      </figcaption>
    </figure>
  `;
}

function renderTextPage(page) {
  return `
    <article class="book-text-page">
      <p class="page-meta">${escapeHtml(page.photographer)}</p>
      <h2>${escapeHtml(page.title)}</h2>
      ${paragraphs(page.storyText)}
      <div class="book-actions">
        <button class="secondary-button" data-like-photo="${page.id}" type="button">추천 ${page.likeCount}</button>
        <span>조회 ${page.viewCount}</span>
      </div>
    </article>
  `;
}

function renderSubmit() {
  return `
    <section class="submit-page">
      <div class="submit-intro">
        <h1>Submit</h1>
        <p>사진 한 장, 짧은 글 하나면 충분합니다. 무제의 다음 페이지를 채워주세요.</p>
      </div>

      <div class="submit-tabs" role="tablist" aria-label="Submit type">
        <button class="${state.submitMode === "photo" ? "active" : ""}" data-submit-mode="photo" type="button">사진</button>
        <button class="${state.submitMode === "story" ? "active" : ""}" data-submit-mode="story" type="button">글</button>
      </div>

      ${state.submitMode === "photo" ? renderPhotoForm() : renderStoryForm()}
    </section>
  `;
}

function renderPhotoForm() {
  return `
    <form class="editor-form compact-form" data-photo-form>
      <label><span>제목</span><input name="title" required /></label>
      <label><span>작가</span><input name="photographer" required /></label>
      <label><span>캡션</span><input name="caption" required /></label>
      <label><span>페이지</span><input name="pageNumber" type="number" min="1" value="${sortedPhotos().length + 1}" required /></label>
      <label class="file-drop">
        <input name="imageFile" type="file" accept="image/*" />
        ${state.photoPreview ? `<img src="${state.photoPreview}" alt="선택한 사진" />` : `<strong>사진 선택</strong><small>모바일에서는 바로 촬영할 수 있습니다.</small>`}
      </label>
      <label><span>이미지 URL</span><input name="imageUrl" placeholder="파일 대신 URL도 가능" /></label>
      <label><span>짧은 글</span><textarea name="storyText" rows="6" required></textarea></label>
      <button class="primary-button" type="submit">사진 페이지 저장</button>
    </form>
  `;
}

function renderStoryForm() {
  return `
    <form class="editor-form compact-form" data-story-form>
      <label><span>제목</span><input name="title" required /></label>
      <label><span>이름</span><input name="authorName" required /></label>
      <label><span>이메일</span><input name="email" type="email" required /></label>
      <label><span>분류</span><input name="category" value="Essay" required /></label>
      <label><span>대표 이미지 URL</span><input name="coverImageUrl" required /></label>
      <label><span>요약</span><textarea name="excerpt" rows="3" required></textarea></label>
      <label><span>본문</span><textarea name="body" rows="8" required></textarea></label>
      <button class="primary-button" type="submit">글 저장</button>
    </form>
  `;
}

function renderAbout() {
  return `
    <section class="text-page">
      <h1>About</h1>
      <p>무제는 사진과 글을 한 장씩 모아가는 온라인 책입니다. 완성된 목차보다, 아직 이름 붙지 않은 페이지가 먼저 놓입니다.</p>
      <p>누구나 사진을 올리고 글을 남길 수 있습니다. 읽는 사람은 천천히 넘기고, 쓰는 사람은 빈 페이지 위에 자기 장면을 놓습니다.</p>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <strong>무제 (Untitled)</strong>
      <span>Blank pages for photographs and words.</span>
    </footer>
  `;
}

function renderPhotoTile(page, index) {
  return `
    <button class="photo-tile tile-${index + 1}" data-go-photo="${index}" type="button">
      <img src="${page.imageUrl}" alt="${escapeHtml(page.caption)}" />
      <span>${escapeHtml(page.photographer)}</span>
      <strong>${escapeHtml(page.caption)}</strong>
    </button>
  `;
}

function renderStoryRow(story) {
  return `
    <button class="story-row-item" data-open-story="${story.id}" type="button">
      <span>${escapeHtml(story.category)}</span>
      <strong>${escapeHtml(story.title)}</strong>
      <small>조회 ${story.viewCount} · 추천 ${story.likeCount}</small>
    </button>
  `;
}

function renderStoryDialog() {
  const story = state.home.stories.find((item) => item.id === state.selectedStoryId);
  if (!story) return "";

  return `
    <aside class="story-dialog" data-story-dialog>
      <button class="dialog-close" data-close-story type="button" aria-label="Close">${closeIcon()}</button>
      <img src="${story.coverImageUrl}" alt="${escapeHtml(story.title)}" />
      <article>
        <p>${escapeHtml(story.authorName)} · ${formatDate(story.createdAt)}</p>
        <h2>${escapeHtml(story.title)}</h2>
        ${paragraphs(story.body)}
        <div class="book-actions">
          <button class="secondary-button" data-like-story="${story.id}" type="button">추천 ${story.likeCount}</button>
          <span>조회 ${story.viewCount}</span>
        </div>
      </article>
    </aside>
  `;
}

function renderEmpty(title, copy) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.mobileMenuOpen = false;
      state.selectedStoryId = null;
      clearNotice();
      render();
      scrollToTop();
    });
  });

  document.querySelector("[data-toggle-menu]")?.addEventListener("click", () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
  });

  document.querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.openStory);
      state.selectedStoryId = id;
      await viewStory(id).catch(() => null);
      await refreshHome();
      render();
    });
  });

  document.querySelector("[data-close-story]")?.addEventListener("click", () => {
    state.selectedStoryId = null;
    render();
  });

  document.querySelectorAll("[data-go-photo]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedPhotoIndex = Number(button.dataset.goPhoto);
      state.view = "photoBook";
      await renderPhotoView();
      scrollToTop();
    });
  });

  document.querySelectorAll("[data-go-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedPhotoIndex = Number(button.dataset.goPage);
      await renderPhotoView();
    });
  });

  document.querySelector("[data-prev-page]")?.addEventListener("click", () => movePhotoPage(-1));
  document.querySelector("[data-next-page]")?.addEventListener("click", () => movePhotoPage(1));

  const swipeArea = document.querySelector("[data-swipe-book]");
  swipeArea?.addEventListener("pointerdown", handleSwipeStart);
  swipeArea?.addEventListener("pointerup", handleSwipeEnd);
  swipeArea?.addEventListener("pointercancel", resetSwipe);
  swipeArea?.addEventListener("touchstart", handleSwipeStart, { passive: true });
  swipeArea?.addEventListener("touchend", handleSwipeEnd);

  document.querySelectorAll("[data-submit-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.submitMode = button.dataset.submitMode;
      clearNotice();
      render();
    });
  });

  document.querySelector("[data-story-form]")?.addEventListener("submit", handleStorySubmit);
  document.querySelector("[data-photo-form]")?.addEventListener("submit", handlePhotoSubmit);
  document.querySelector("input[name='imageFile']")?.addEventListener("change", handlePhotoFile);

  document.querySelectorAll("[data-like-story]").forEach((button) => {
    button.addEventListener("click", async () => {
      await likeStory(Number(button.dataset.likeStory));
      await refreshHome();
      render();
    });
  });

  document.querySelectorAll("[data-like-photo]").forEach((button) => {
    button.addEventListener("click", async () => {
      await likePhotoPage(Number(button.dataset.likePhoto));
      await refreshHome();
      render();
    });
  });

  if (state.selectedStoryId) {
    app.insertAdjacentHTML("beforeend", renderStoryDialog());
    bindStoryDialogEvents();
  }
}

function bindStoryDialogEvents() {
  document.querySelector("[data-close-story]")?.addEventListener("click", () => {
    state.selectedStoryId = null;
    render();
  });

  document.querySelectorAll("[data-like-story]").forEach((button) => {
    button.addEventListener("click", async () => {
      await likeStory(Number(button.dataset.likeStory));
      await refreshHome();
      render();
    });
  });
}

async function movePhotoPage(direction) {
  const pages = sortedPhotos();
  if (!pages.length) return;
  state.selectedPhotoIndex = (state.selectedPhotoIndex + direction + pages.length) % pages.length;
  await renderPhotoView();
}

function handleSwipeStart(event) {
  const point = readSwipePoint(event, "start");
  state.swipeStartX = point.x;
  state.swipeStartY = point.y;
}

function handleSwipeEnd(event) {
  const point = readSwipePoint(event, "end");
  const deltaX = point.x - state.swipeStartX;
  const deltaY = point.y - state.swipeStartY;
  if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    movePhotoPage(deltaX < 0 ? 1 : -1);
  }
  resetSwipe();
}

function readSwipePoint(event, phase) {
  const touchList = phase === "end" ? event.changedTouches : event.touches;
  const touch = touchList?.[0];
  return {
    x: touch?.clientX ?? event.clientX ?? 0,
    y: touch?.clientY ?? event.clientY ?? 0
  };
}

function resetSwipe() {
  state.swipeStartX = 0;
  state.swipeStartY = 0;
}

async function handleStorySubmit(event) {
  event.preventDefault();
  clearNotice();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());
  state.loading = true;

  try {
    const story = await createStory({
      title: payload.title,
      authorName: payload.authorName,
      category: payload.category,
      excerpt: payload.excerpt,
      body: payload.body,
      coverImageUrl: payload.coverImageUrl,
      layoutMode: "essay"
    });
    await createSubmission(payload);
    await refreshHome();
    state.selectedStoryId = story.id;
    state.view = "home";
    state.message = "글이 저장되었습니다.";
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handlePhotoSubmit(event) {
  event.preventDefault();
  clearNotice();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());
  const imageUrl = state.photoPreview || payload.imageUrl;

  if (!imageUrl) {
    state.error = "사진 파일이나 이미지 URL이 필요합니다.";
    render();
    return;
  }

  try {
    await createPhotoPage({
      title: payload.title,
      photographer: payload.photographer,
      caption: payload.caption,
      pageNumber: Number(payload.pageNumber),
      imageUrl,
      storyText: payload.storyText
    });
    state.photoPreview = "";
    await refreshHome();
    state.selectedPhotoIndex = sortedPhotos().length - 1;
    state.view = "photoBook";
    state.message = "사진 페이지가 저장되었습니다.";
  } catch (error) {
    state.error = error.message;
  } finally {
    render();
  }
}

async function handlePhotoFile(event) {
  const file = event.target.files?.[0];
  state.photoPreview = file ? await fileToDataUrl(file, 1400, 0.84) : "";
  render();
}

async function renderPhotoView() {
  const page = sortedPhotos()[state.selectedPhotoIndex];
  if (page) {
    await viewPhotoPage(page.id).catch(() => null);
    await refreshHome();
  }
  render();
}

function latestStories() {
  return [...(state.home.stories || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function sortedPhotos() {
  return [...(state.home.photoPages || [])].sort((a, b) => a.pageNumber - b.pageNumber);
}

function paragraphs(value) {
  return String(value || "")
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function formatDate(value) {
  if (!value) return "undated";
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

function clearNotice() {
  state.message = "";
  state.error = "";
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function defaultHeroImage() {
  return "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80";
}

function fileToDataUrl(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("이미지 파일을 확인해주세요."));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function arrowIcon(direction) {
  const path = direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6";
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function closeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
