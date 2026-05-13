import {
  createPhotoPage,
  createStory,
  createSubmission,
  deletePhotoPage,
  deleteStory,
  getHealth,
  getMagazineHome,
  likePhotoPage,
  likeStory,
  login,
  setRepresentativePhoto,
  signup,
  updatePhotoPage,
  updateStory,
  viewPhotoPage,
  viewStory
} from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");
const AUTH_TOKEN_KEY = "untitled_auth_token";
const AUTH_USER_KEY = "untitled_auth_user";

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
  authMode: "login",
  authDraft: {
    nickname: "",
    loginId: "",
    password: ""
  },
  user: readStoredUser(),
  photoPreview: "",
  storyPreview: "",
  profilePreview: "",
  editingStoryId: null,
  editingPhotoId: null,
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
      ${renderUserChip()}
      <button class="menu-button" data-toggle-menu type="button" aria-expanded="${state.mobileMenuOpen}">
        <span></span><span></span>
      </button>
      ${state.mobileMenuOpen ? `
        <nav class="mobile-nav" aria-label="Mobile">
          ${navItems.map(renderNavButton).join("")}
          ${state.user ? `<button data-logout type="button">Logout</button>` : `<button data-view="submit" type="button">Login</button>`}
        </nav>
      ` : ""}
    </header>
  `;
}

function renderNavButton(item) {
  return `<button class="${state.view === item.view ? "active" : ""}" data-view="${item.view}" type="button">${item.label}</button>`;
}

function renderUserChip() {
  if (!state.user) {
    return `<button class="user-chip guest" data-view="submit" type="button">${avatarImage(null)}<span>Login</span></button>`;
  }

  return `
    <div class="user-chip">
      ${avatarImage(state.user.profileImageUrl)}
      <span>${escapeHtml(state.user.nickname)}</span>
      <button class="text-button" data-logout type="button">Logout</button>
    </div>
  `;
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
          <img src="${storyImage(leadStory)}" alt="${escapeHtml(leadStory.title)}" />
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
  const owned = isMine(page);
  return `
    <article class="book-text-page">
      <p class="page-meta author-line">${avatarImage(page.ownerProfileImageUrl)}${escapeHtml(page.ownerNickname || page.photographer)}</p>
      <h2>${escapeHtml(page.title)}</h2>
      ${paragraphs(page.storyText)}
      <div class="book-actions">
        <button class="secondary-button" data-like-photo="${page.id}" type="button">추천 ${page.likeCount}</button>
        <span>조회 ${page.viewCount}</span>
        ${owned ? `
          <button class="secondary-button" data-edit-photo="${page.id}" type="button">수정</button>
          <button class="secondary-button" data-delete-photo="${page.id}" type="button">삭제</button>
          <button class="secondary-button" data-representative-photo="${page.id}" type="button">대표사진</button>
        ` : ""}
      </div>
    </article>
  `;
}

function renderSubmit() {
  if (!state.user) {
    return renderAuthGate();
  }

  return `
    <section class="submit-page">
      <div class="submit-intro">
        <h1>Submit</h1>
        <p>${escapeHtml(state.user.nickname)}님, 무제의 다음 페이지를 채워주세요.</p>
      </div>

      <div class="submit-tabs" role="tablist" aria-label="Submit type">
        <button class="${state.submitMode === "photo" ? "active" : ""}" data-submit-mode="photo" type="button">사진</button>
        <button class="${state.submitMode === "story" ? "active" : ""}" data-submit-mode="story" type="button">글</button>
      </div>

      ${state.submitMode === "photo" ? renderPhotoForm() : renderStoryForm()}
    </section>
  `;
}

function renderAuthGate() {
  const isSignup = state.authMode === "signup";
  return `
    <section class="submit-page auth-page">
      <div class="submit-intro">
        <h1>${isSignup ? "Join" : "Login"}</h1>
        <p>업로드는 로그인 후 가능합니다. 닉네임은 게시물과 프로필 옆에 표시됩니다.</p>
      </div>
      <div class="submit-tabs" role="tablist" aria-label="Auth type">
        <button class="${!isSignup ? "active" : ""}" data-auth-mode="login" type="button">로그인</button>
        <button class="${isSignup ? "active" : ""}" data-auth-mode="signup" type="button">회원가입</button>
      </div>
      <form class="editor-form compact-form" data-auth-form>
        ${isSignup ? `<label><span>닉네임</span><input name="nickname" value="${escapeAttribute(state.authDraft.nickname)}" required /></label>` : ""}
        <label><span>아이디</span><input name="loginId" value="${escapeAttribute(state.authDraft.loginId)}" autocomplete="username" required /></label>
        <label><span>비밀번호</span><input name="password" value="${escapeAttribute(state.authDraft.password)}" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" required /></label>
        ${isSignup ? `
          <label class="file-drop">
            <input name="profileImageFile" type="file" accept="image/*" />
            ${state.profilePreview ? `<img src="${state.profilePreview}" alt="선택한 프로필 이미지" />` : `<strong>프로필 사진 선택</strong><small>선택하지 않으면 기본 이미지로 표시됩니다.</small>`}
          </label>
        ` : ""}
        <button class="primary-button" type="submit">${isSignup ? "회원가입" : "로그인"}</button>
      </form>
    </section>
  `;
}

function renderPhotoForm() {
  const editing = currentEditingPhoto();
  return `
    <form class="editor-form compact-form" data-photo-form>
      <label><span>제목</span><input name="title" value="${escapeAttribute(editing?.title || "")}" required /></label>
      <label><span>캡션</span><input name="caption" value="${escapeAttribute(editing?.caption || "")}" required /></label>
      <label><span>페이지</span><input name="pageNumber" type="number" min="1" value="${editing?.pageNumber || sortedPhotos().length + 1}" required /></label>
      <label class="file-drop">
        <input name="imageFile" type="file" accept="image/*" />
        ${state.photoPreview || editing?.imageUrl ? `<img src="${state.photoPreview || editing.imageUrl}" alt="선택한 사진" />` : `<strong>사진 선택</strong><small>모바일에서는 바로 촬영할 수 있습니다.</small>`}
      </label>
      <label><span>이미지 URL</span><input name="imageUrl" placeholder="파일 대신 URL도 가능" /></label>
      <label><span>짧은 글</span><textarea name="storyText" rows="6" required>${escapeHtml(editing?.storyText || "")}</textarea></label>
      <button class="primary-button" type="submit">${editing ? "사진 페이지 수정" : "사진 페이지 저장"}</button>
      ${editing ? `<button class="secondary-button" data-cancel-edit type="button">수정 취소</button>` : ""}
    </form>
  `;
}

function renderStoryForm() {
  const editing = currentEditingStory();
  return `
    <form class="editor-form compact-form" data-story-form>
      <label><span>제목</span><input name="title" value="${escapeAttribute(editing?.title || "")}" required /></label>
      ${editing ? "" : `<label><span>이메일</span><input name="email" type="email" required /></label>`}
      <label><span>분류</span><input name="category" value="${escapeAttribute(editing?.category || "Essay")}" required /></label>
      <label class="file-drop">
        <input name="storyImageFile" type="file" accept="image/*" />
        ${state.storyPreview || editing?.coverImageUrl ? `<img src="${state.storyPreview || editing.coverImageUrl}" alt="선택한 대표 이미지" />` : `<strong>대표 이미지 선택</strong><small>선택하지 않아도 글을 저장할 수 있습니다.</small>`}
      </label>
      <label><span>요약</span><textarea name="excerpt" rows="3" required>${escapeHtml(editing?.excerpt || "")}</textarea></label>
      <label><span>본문</span><textarea name="body" rows="8" required>${escapeHtml(editing?.body || "")}</textarea></label>
      <button class="primary-button" type="submit">${editing ? "글 수정" : "글 저장"}</button>
      ${editing ? `<button class="secondary-button" data-cancel-edit type="button">수정 취소</button>` : ""}
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
  const owned = isMine(story);

  return `
    <aside class="story-dialog" data-story-dialog>
      <button class="dialog-close" data-close-story type="button" aria-label="Close">${closeIcon()}</button>
      <img src="${storyImage(story)}" alt="${escapeHtml(story.title)}" />
      <article>
        <p class="author-line">${avatarImage(story.ownerProfileImageUrl)}${escapeHtml(story.ownerNickname || story.authorName)} · ${formatDate(story.createdAt)}</p>
        <h2>${escapeHtml(story.title)}</h2>
        ${paragraphs(story.body)}
        <div class="book-actions">
          <button class="secondary-button" data-like-story="${story.id}" type="button">추천 ${story.likeCount}</button>
          <span>조회 ${story.viewCount}</span>
          ${owned ? `
            <button class="secondary-button" data-edit-story="${story.id}" type="button">수정</button>
            <button class="secondary-button" data-delete-story="${story.id}" type="button">삭제</button>
          ` : ""}
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
      if (state.view !== "submit") {
        clearEditState();
      }
      clearNotice();
      render();
      scrollToTop();
    });
  });

  document.querySelector("[data-toggle-menu]")?.addEventListener("click", () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", handleLogout);
  });

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      state.profilePreview = "";
      clearNotice();
      render();
    });
  });

  document.querySelector("[data-auth-form]")?.addEventListener("submit", handleAuthSubmit);
  document.querySelector("input[name='profileImageFile']")?.addEventListener("change", handleProfileFile);

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
  document.querySelector("input[name='storyImageFile']")?.addEventListener("change", handleStoryFile);

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

  document.querySelectorAll("[data-edit-story]").forEach((button) => {
    button.addEventListener("click", () => startEditStory(Number(button.dataset.editStory)));
  });

  document.querySelectorAll("[data-delete-story]").forEach((button) => {
    button.addEventListener("click", () => handleDeleteStory(Number(button.dataset.deleteStory)));
  });

  document.querySelectorAll("[data-edit-photo]").forEach((button) => {
    button.addEventListener("click", () => startEditPhoto(Number(button.dataset.editPhoto)));
  });

  document.querySelectorAll("[data-delete-photo]").forEach((button) => {
    button.addEventListener("click", () => handleDeletePhoto(Number(button.dataset.deletePhoto)));
  });

  document.querySelectorAll("[data-representative-photo]").forEach((button) => {
    button.addEventListener("click", () => handleRepresentativePhoto(Number(button.dataset.representativePhoto)));
  });

  document.querySelector("[data-cancel-edit]")?.addEventListener("click", () => {
    clearEditState();
    render();
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

  document.querySelectorAll("[data-edit-story]").forEach((button) => {
    button.addEventListener("click", () => startEditStory(Number(button.dataset.editStory)));
  });

  document.querySelectorAll("[data-delete-story]").forEach((button) => {
    button.addEventListener("click", () => handleDeleteStory(Number(button.dataset.deleteStory)));
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

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearNotice();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());

  try {
    const response = state.authMode === "signup"
      ? await signup({
          nickname: payload.nickname,
          loginId: payload.loginId,
          password: payload.password,
          profileImageUrl: state.profilePreview
        })
      : await login({
          loginId: payload.loginId,
          password: payload.password
        });
    setAuth(response);
    state.profilePreview = "";
    state.message = state.authMode === "signup" ? "회원가입되었습니다." : "로그인되었습니다.";
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

function handleLogout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  state.user = null;
  clearEditState();
  state.view = "home";
  state.message = "로그아웃되었습니다.";
  render();
}

async function handleProfileFile(event) {
  captureAuthDraft(event.target.form);
  const file = event.target.files?.[0];
  state.profilePreview = file ? await fileToDataUrl(file, 600, 0.82) : "";
  render();
}

function setAuth(response) {
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  state.user = response.user;
  state.authDraft = { nickname: "", loginId: "", password: "" };
}

function captureAuthDraft(form) {
  if (!form) return;
  const data = new FormData(form);
  state.authDraft = {
    nickname: String(data.get("nickname") || ""),
    loginId: String(data.get("loginId") || ""),
    password: String(data.get("password") || "")
  };
}

async function handleStorySubmit(event) {
  event.preventDefault();
  clearNotice();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());
  const editing = currentEditingStory();
  const coverImageUrl = state.storyPreview || editing?.coverImageUrl || "";

  state.loading = true;

  try {
    const request = {
      title: payload.title,
      authorName: state.user.nickname,
      category: payload.category,
      excerpt: payload.excerpt,
      body: payload.body,
      coverImageUrl,
      layoutMode: "essay"
    };
    const story = editing ? await updateStory(editing.id, request) : await createStory(request);
    if (!editing) {
      await createSubmission({
        authorName: state.user.nickname,
        email: payload.email,
        title: payload.title,
        category: payload.category,
        body: payload.body,
        imageUrl: coverImageUrl
      });
    }
    await refreshHome();
    state.storyPreview = "";
    state.editingStoryId = null;
    state.selectedStoryId = story.id;
    state.view = "home";
    state.message = editing ? "글이 수정되었습니다." : "글이 저장되었습니다.";
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
  const editing = currentEditingPhoto();
  const imageUrl = state.photoPreview || payload.imageUrl || editing?.imageUrl;

  if (!imageUrl) {
    state.error = "사진 파일이나 이미지 URL이 필요합니다.";
    render();
    return;
  }

  try {
    const request = {
      title: payload.title,
      photographer: state.user.nickname,
      caption: payload.caption,
      pageNumber: Number(payload.pageNumber),
      imageUrl,
      storyText: payload.storyText
    };
    const page = editing ? await updatePhotoPage(editing.id, request) : await createPhotoPage(request);
    state.photoPreview = "";
    state.editingPhotoId = null;
    await refreshHome();
    state.selectedPhotoIndex = Math.max(0, sortedPhotos().findIndex((item) => item.id === page.id));
    state.view = "photoBook";
    state.message = editing ? "사진 페이지가 수정되었습니다." : "사진 페이지가 저장되었습니다.";
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

async function handleStoryFile(event) {
  const file = event.target.files?.[0];
  state.storyPreview = file ? await fileToDataUrl(file, 1400, 0.84) : "";
  render();
}

function startEditStory(id) {
  const story = state.home.stories.find((item) => item.id === id);
  if (!story || !isMine(story)) return;
  state.editingStoryId = id;
  state.editingPhotoId = null;
  state.selectedStoryId = null;
  state.submitMode = "story";
  state.view = "submit";
  state.storyPreview = "";
  clearNotice();
  render();
  scrollToTop();
}

function startEditPhoto(id) {
  const photo = state.home.photoPages.find((item) => item.id === id);
  if (!photo || !isMine(photo)) return;
  state.editingPhotoId = id;
  state.editingStoryId = null;
  state.submitMode = "photo";
  state.view = "submit";
  state.photoPreview = "";
  clearNotice();
  render();
  scrollToTop();
}

async function handleDeleteStory(id) {
  if (!window.confirm("이 글을 삭제할까요?")) return;
  try {
    await deleteStory(id);
    await refreshHome();
    state.selectedStoryId = null;
    state.message = "글이 삭제되었습니다.";
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function handleDeletePhoto(id) {
  if (!window.confirm("이 사진 페이지를 삭제할까요?")) return;
  try {
    await deletePhotoPage(id);
    await refreshHome();
    state.selectedPhotoIndex = Math.max(0, Math.min(state.selectedPhotoIndex, sortedPhotos().length - 1));
    state.message = "사진 페이지가 삭제되었습니다.";
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function handleRepresentativePhoto(id) {
  try {
    const user = await setRepresentativePhoto(id);
    state.user = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    state.message = "대표사진이 설정되었습니다.";
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
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

function currentEditingStory() {
  return state.home.stories.find((story) => story.id === state.editingStoryId);
}

function currentEditingPhoto() {
  return state.home.photoPages.find((photo) => photo.id === state.editingPhotoId);
}

function clearEditState() {
  state.editingStoryId = null;
  state.editingPhotoId = null;
  state.photoPreview = "";
  state.storyPreview = "";
}

function isMine(item) {
  return Boolean(state.user && item.ownerId && item.ownerId === state.user.id);
}

function storyImage(story) {
  return story.coverImageUrl || story.ownerProfileImageUrl || defaultHeroImage();
}

function avatarImage(value) {
  const src = value || defaultAvatarImage();
  return `<img class="avatar" src="${src}" alt="" />`;
}

function readStoredUser() {
  try {
    const value = localStorage.getItem(AUTH_USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
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

function escapeAttribute(value) {
  return escapeHtml(value);
}

function defaultAvatarImage() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='40' fill='%2320201e'/%3E%3Ccircle cx='40' cy='31' r='13' fill='%23f7f7f3'/%3E%3Cpath d='M18 68c4-14 14-21 22-21s18 7 22 21' fill='%23f7f7f3'/%3E%3C/svg%3E";
}
