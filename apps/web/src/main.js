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

const fallbackHome = {
  brand: "무제 (Untitled)",
  tagline: "빈 책 위에 사진과 글을 채워가는 온라인 잡지",
  menus: ["Home", "Issues", "Stories", "Photo book", "Submit", "About", "Contact"],
  issues: [
    { number: "Issue 00", title: "Blank Book", theme: "시작 전의 페이지" }
  ],
  stories: [],
  photoPages: []
};

const state = {
  health: "checking",
  view: "home",
  home: fallbackHome,
  selectedStoryId: null,
  selectedPhotoIndex: 0,
  search: "",
  message: "",
  error: "",
  loading: false,
  mobileMenuOpen: false,
  submissionPreview: "",
  photoPreview: ""
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
        ${renderStatus()}
        ${renderCurrentView()}
      </main>
      ${renderFooter()}
    </div>
  `;
  bindEvents();
}

function renderHeader() {
  const menus = ["Home", "Issues", "Stories", "Photo book", "Submit", "About", "Contact"];
  return `
    <header class="masthead">
      <button class="wordmark" data-view="home" type="button">
        <span>무제</span>
        <small>Untitled</small>
      </button>
      <nav class="desktop-nav" aria-label="Main">
        ${menus.map((item) => `<button class="${isActive(item) ? "active" : ""}" data-view="${viewKey(item)}" type="button">${item}</button>`).join("")}
      </nav>
      <div class="header-actions">
        <label class="search-box">
          <span>Search</span>
          <input value="${escapeHtml(state.search)}" placeholder="제목, 작가, 문장" data-search />
        </label>
        <button class="menu-button" data-toggle-menu type="button">Menu</button>
      </div>
      ${state.mobileMenuOpen ? `
        <nav class="mobile-nav" aria-label="Mobile">
          ${menus.map((item) => `<button data-view="${viewKey(item)}" type="button">${item}</button>`).join("")}
        </nav>
      ` : ""}
    </header>
  `;
}

function renderStatus() {
  return `
    <div class="notice-line">
      <span>API ${state.health}</span>
      ${state.message ? `<strong>${escapeHtml(state.message)}</strong>` : ""}
      ${state.error ? `<strong class="error">${escapeHtml(state.error)}</strong>` : ""}
    </div>
  `;
}

function renderCurrentView() {
  if (state.view === "issues") return renderIssues();
  if (state.view === "stories") return renderStories();
  if (state.view === "photoBook") return renderPhotoBook();
  if (state.view === "submit") return renderSubmit();
  if (state.view === "about") return renderAbout();
  if (state.view === "contact") return renderContact();
  return renderHome();
}

function renderHome() {
  const lead = filteredStories()[0] || state.home.stories[0];
  return `
    <section class="hero-book">
      <div class="book-cover">
        <span>Issue 00</span>
        <h1>무제</h1>
        <p>아직 제목이 붙지 않은 사진과 문장을 위한 온라인 잡지.</p>
      </div>
      <div class="book-page">
        <p class="quiet-label">Current note</p>
        <h2>${lead ? escapeHtml(lead.title) : "빈 페이지를 펼칩니다"}</h2>
        <p>${lead ? escapeHtml(lead.excerpt) : escapeHtml(state.home.tagline)}</p>
        <div class="reader-actions">
          <button class="primary-button" data-view="photoBook" type="button">사진 책 읽기</button>
          <button class="secondary-button" data-view="submit" type="button">페이지 쓰기</button>
        </div>
      </div>
    </section>

    <section class="issue-strip">
      <div>
        <p class="quiet-label">Magazine menu</p>
        <h2>읽고, 넘기고, 남기는 지면</h2>
      </div>
      <div class="menu-grid">
        ${state.home.menus.map((menu) => `<button data-view="${viewKey(menu)}" type="button">${escapeHtml(menu)}</button>`).join("")}
      </div>
    </section>

    <section class="story-shelf">
      <div class="section-title">
        <h2>Latest stories</h2>
        <button data-view="stories" type="button">전체 보기</button>
      </div>
      <div class="story-row">
        ${filteredStories().slice(0, 3).map(renderStoryCard).join("") || renderEmpty("아직 글이 없습니다.", "Submit에서 첫 페이지를 작성해보세요.")}
      </div>
    </section>

    <section class="mobile-reader-preview">
      <div class="section-title">
        <h2>Photo book</h2>
        <button data-view="photoBook" type="button">넘겨 보기</button>
      </div>
      <div class="phone-spread">
        ${state.home.photoPages.slice(0, 3).map(renderPhonePage).join("")}
      </div>
    </section>
  `;
}

function renderIssues() {
  return `
    <section class="archive-page">
      <p class="quiet-label">Archive</p>
      <h1>Issues</h1>
      <div class="issue-list">
        ${state.home.issues.map((issue) => `
          <article>
            <span>${escapeHtml(issue.number)}</span>
            <h2>${escapeHtml(issue.title)}</h2>
            <p>${escapeHtml(issue.theme)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStories() {
  const stories = filteredStories();
  return `
    <section class="archive-page">
      <p class="quiet-label">Stories</p>
      <h1>글과 사진의 목차</h1>
      <div class="story-index">
        ${stories.map(renderStoryIndexItem).join("") || renderEmpty("검색 결과가 없습니다.", "다른 단어로 찾아보세요.")}
      </div>
      ${state.selectedStoryId ? renderStoryReader() : ""}
    </section>
  `;
}

function renderStoryReader() {
  const story = state.home.stories.find((item) => item.id === state.selectedStoryId);
  if (!story) return "";
  return `
    <section class="story-reader">
      <img src="${story.coverImageUrl}" alt="${escapeHtml(story.title)}" />
      <article>
        <p class="quiet-label">${escapeHtml(story.category)} · ${formatDate(story.createdAt)}</p>
        <h2>${escapeHtml(story.title)}</h2>
        <p class="byline">by ${escapeHtml(story.authorName)}</p>
        ${paragraphs(story.body)}
        <div class="reader-actions">
          <button class="secondary-button" data-like-story="${story.id}" type="button">추천 ${story.likeCount}</button>
          <span>조회 ${story.viewCount}</span>
        </div>
      </article>
    </section>
  `;
}

function renderPhotoBook() {
  const pages = state.home.photoPages;
  const page = pages[state.selectedPhotoIndex] || pages[0];
  if (!page) {
    return `<section class="archive-page">${renderEmpty("사진 페이지가 없습니다.", "첫 사진과 글을 추가해보세요.")}</section>`;
  }

  return `
    <section class="book-reader">
      <div class="reader-toolbar">
        <div>
          <p class="quiet-label">Photo book</p>
          <h1>${escapeHtml(page.title)}</h1>
        </div>
        <span>${state.selectedPhotoIndex + 1} / ${pages.length}</span>
      </div>
      <div class="spread">
        <figure>
          <img src="${page.imageUrl}" alt="${escapeHtml(page.caption)}" />
          <figcaption>${escapeHtml(page.caption)} · ${escapeHtml(page.photographer)}</figcaption>
        </figure>
        <article>
          <p class="quiet-label">Page ${page.pageNumber}</p>
          <h2>${escapeHtml(page.caption)}</h2>
          ${paragraphs(page.storyText)}
          <div class="reader-actions">
            <button class="secondary-button" data-prev-page type="button">이전</button>
            <button class="primary-button" data-next-page type="button">다음</button>
            <button class="secondary-button" data-like-photo="${page.id}" type="button">추천 ${page.likeCount}</button>
            <span>조회 ${page.viewCount}</span>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderSubmit() {
  return `
    <section class="submit-page">
      <div class="submit-intro">
        <p class="quiet-label">Submit</p>
        <h1>빈 페이지 채우기</h1>
        <p>사진과 글을 올리면 무제의 다음 페이지가 됩니다. 글만 제출하거나, 사진 책에 바로 들어갈 한 장을 만들 수도 있습니다.</p>
      </div>
      <div class="submit-layout">
        <form class="editor-form" data-story-form>
          <h2>글 제출</h2>
          <label><span>제목</span><input name="title" required /></label>
          <label><span>이름</span><input name="authorName" required /></label>
          <label><span>이메일</span><input name="email" type="email" required /></label>
          <label><span>분류</span><input name="category" value="Essay" required /></label>
          <label><span>대표 이미지 URL</span><input name="coverImageUrl" required /></label>
          <label><span>요약</span><textarea name="excerpt" rows="3" required></textarea></label>
          <label><span>본문</span><textarea name="body" rows="8" required></textarea></label>
          <button class="primary-button" type="submit">글 저장</button>
        </form>

        <form class="editor-form" data-photo-form>
          <h2>사진 페이지 추가</h2>
          <label><span>제목</span><input name="title" required /></label>
          <label><span>작가</span><input name="photographer" required /></label>
          <label><span>캡션</span><input name="caption" required /></label>
          <label><span>페이지 번호</span><input name="pageNumber" type="number" min="1" value="${state.home.photoPages.length + 1}" required /></label>
          <label class="file-drop">
            <input name="imageFile" type="file" accept="image/*" />
            ${state.photoPreview ? `<img src="${state.photoPreview}" alt="선택한 사진" />` : `<strong>사진 선택</strong><small>모바일에서도 바로 촬영 가능</small>`}
          </label>
          <label><span>이미지 URL</span><input name="imageUrl" placeholder="파일 대신 URL도 가능" /></label>
          <label><span>짧은 글</span><textarea name="storyText" rows="6" required></textarea></label>
          <button class="primary-button" type="submit">사진 페이지 저장</button>
        </form>
      </div>
    </section>
  `;
}

function renderAbout() {
  return `
    <section class="text-page">
      <p class="quiet-label">About</p>
      <h1>무제는 완성 전의 잡지입니다</h1>
      <p>5ftmag 같은 독립 잡지의 탐색 구조를 참고하되, 무제는 사진과 글이 책장처럼 쌓이는 공간으로 새롭게 설계했습니다.</p>
      <p>Home, Issues, Stories, Photo book, Submit, About, Contact 흐름을 갖고, 모바일에서는 손 안의 작은 책처럼 한 장씩 읽는 경험을 우선합니다.</p>
    </section>
  `;
}

function renderContact() {
  return `
    <section class="text-page">
      <p class="quiet-label">Contact</p>
      <h1>편집실에 보내는 쪽지</h1>
      <p>기고, 사진, 협업 문의는 Submit에서 먼저 페이지를 남겨주세요. 관리자는 제출 목록을 API에서 확인할 수 있습니다.</p>
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

function renderStoryCard(story) {
  return `
    <article class="story-card">
      <button data-open-story="${story.id}" type="button">
        <img src="${story.coverImageUrl}" alt="${escapeHtml(story.title)}" />
        <span>${escapeHtml(story.category)} · ${formatDate(story.createdAt)}</span>
        <h3>${escapeHtml(story.title)}</h3>
        <p>${escapeHtml(story.excerpt)}</p>
      </button>
    </article>
  `;
}

function renderStoryIndexItem(story) {
  return `
    <button class="story-index-item" data-open-story="${story.id}" type="button">
      <img src="${story.coverImageUrl}" alt="${escapeHtml(story.title)}" />
      <span>${escapeHtml(story.category)}</span>
      <strong>${escapeHtml(story.title)}</strong>
      <small>${escapeHtml(story.authorName)} · 조회 ${story.viewCount} · 추천 ${story.likeCount}</small>
    </button>
  `;
}

function renderPhonePage(page) {
  return `
    <button data-view="photoBook" type="button">
      <img src="${page.imageUrl}" alt="${escapeHtml(page.caption)}" />
      <span>Page ${page.pageNumber}</span>
      <strong>${escapeHtml(page.caption)}</strong>
    </button>
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
      clearNotice();
      render();
    });
  });

  document.querySelector("[data-toggle-menu]")?.addEventListener("click", () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
  });

  document.querySelector("[data-search]")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  document.querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.openStory);
      state.view = "stories";
      state.selectedStoryId = id;
      await viewStory(id).catch(() => null);
      await refreshHome();
      render();
    });
  });

  document.querySelector("[data-prev-page]")?.addEventListener("click", () => {
    state.selectedPhotoIndex = Math.max(0, state.selectedPhotoIndex - 1);
    renderPhotoView();
  });

  document.querySelector("[data-next-page]")?.addEventListener("click", () => {
    state.selectedPhotoIndex = Math.min(state.home.photoPages.length - 1, state.selectedPhotoIndex + 1);
    renderPhotoView();
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
    state.view = "stories";
    state.message = "새 글이 무제에 저장되었습니다.";
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
    state.selectedPhotoIndex = state.home.photoPages.length - 1;
    state.view = "photoBook";
    state.message = "사진 페이지가 추가되었습니다.";
  } catch (error) {
    state.error = error.message;
  } finally {
    render();
  }
}

async function handlePhotoFile(event) {
  const file = event.target.files?.[0];
  state.photoPreview = file ? await fileToDataUrl(file, 1200, 0.84) : "";
  render();
}

async function renderPhotoView() {
  const page = state.home.photoPages[state.selectedPhotoIndex];
  if (page) {
    await viewPhotoPage(page.id).catch(() => null);
    await refreshHome();
  }
  render();
}

function filteredStories() {
  const query = state.search.trim().toLowerCase();
  if (!query) return state.home.stories || [];
  return state.home.stories.filter((story) => {
    return [story.title, story.authorName, story.category, story.excerpt, story.body]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function isActive(menu) {
  return state.view === viewKey(menu);
}

function viewKey(menu) {
  const normalized = menu.toLowerCase();
  if (normalized === "photo book") return "photoBook";
  if (normalized === "home") return "home";
  return normalized;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
