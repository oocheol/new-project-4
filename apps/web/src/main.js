import {
  getHealth,
  getMe,
  listMyPhotos,
  listPhotos,
  login,
  ratePhoto,
  register,
  uploadPhoto
} from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");

const state = {
  health: "checking",
  screen: localStorage.getItem("ratingAuthToken") ? "feed" : "auth",
  authMode: "login",
  user: null,
  photos: [],
  myPhotos: [],
  currentIndex: 0,
  touchStartX: 0,
  touchStartY: 0,
  selectedFile: null,
  previewUrl: "",
  uploadTitle: "",
  message: "",
  error: "",
  loading: false
};

render();
bootstrap();

async function bootstrap() {
  await checkHealth();

  if (localStorage.getItem("ratingAuthToken")) {
    try {
      state.user = await getMe();
      await refreshPhotos();
    } catch {
      localStorage.removeItem("ratingAuthToken");
      state.screen = "auth";
    }
  }

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

function render() {
  app.innerHTML = `
    <div class="app-shell">
      ${renderHeader()}
      <main class="main-view">
        ${renderNotice()}
        ${state.screen === "auth" ? renderAuth() : renderAuthedScreen()}
      </main>
      ${state.user ? renderTabbar() : ""}
    </div>
  `;

  bindEvents();
}

function renderHeader() {
  return `
    <header class="topbar">
      <button class="brand-mark" data-screen="${state.user ? "feed" : "auth"}" type="button" aria-label="홈">R</button>
      <div class="brand-copy">
        <strong>Rate Room</strong>
        <span>${state.user ? `${escapeHtml(state.user.nickname)}님` : "사진 평점 스튜디오"}</span>
      </div>
      ${state.user ? `<button class="ghost-button" data-logout type="button">로그아웃</button>` : ""}
    </header>
  `;
}

function renderNotice() {
  return `
    <div class="notice-row">
      <span class="status status-${state.health}">API ${state.health}</span>
      ${state.message ? `<span class="success">${escapeHtml(state.message)}</span>` : ""}
      ${state.error ? `<span class="error">${escapeHtml(state.error)}</span>` : ""}
    </div>
  `;
}

function renderAuth() {
  const isRegister = state.authMode === "register";
  return `
    <section class="auth-screen">
      <div class="hero-copy">
        <p class="eyebrow">사진을 올리고, 숫자만 받기</p>
        <h1>기분 덜 상하게 받는 사진 평점</h1>
        <p>말 대신 1점부터 5점까지. 내 사진의 평균만 빠르게 확인할 수 있게 만들었습니다.</p>
      </div>

      <form class="panel auth-form" data-auth-form>
        <div class="mode-switch" role="tablist" aria-label="로그인 방식">
          <button class="${!isRegister ? "active" : ""}" data-auth-mode="login" type="button">로그인</button>
          <button class="${isRegister ? "active" : ""}" data-auth-mode="register" type="button">회원가입</button>
        </div>

        <label>
          <span>아이디</span>
          <input name="loginId" autocomplete="username" minlength="3" maxlength="40" required />
        </label>
        <label>
          <span>비밀번호</span>
          <input name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" minlength="4" maxlength="80" required />
        </label>
        ${isRegister ? `
          <label>
            <span>닉네임</span>
            <input name="nickname" autocomplete="nickname" minlength="2" maxlength="30" required />
          </label>
        ` : ""}

        <button class="primary-button" type="submit" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "처리 중" : isRegister ? "가입하고 시작" : "로그인"}
        </button>
      </form>
    </section>
  `;
}

function renderAuthedScreen() {
  if (state.screen === "upload") {
    return renderUpload();
  }

  if (state.screen === "mine") {
    return renderMine();
  }

  return renderFeed();
}

function renderFeed() {
  const queue = getRatingQueue();
  const currentPhoto = queue[state.currentIndex] || null;

  return `
    <section class="feed-screen">
      <div class="section-heading">
        <h1>한 장씩 평가하기</h1>
        <p>사진은 한 장만 보여요. 점수를 남기면 다음 사진으로 넘어갑니다.</p>
      </div>
      ${currentPhoto ? `
        <div class="rating-stage" data-swipe-card>
          <div class="progress-row">
            <span>${state.currentIndex + 1} / ${queue.length}</span>
            <span>스와이프 가능</span>
          </div>
          ${renderPhotoCard(currentPhoto, "feed")}
        </div>
      ` : renderEmpty("평가할 사진이 없습니다.", "새 사진이 올라오면 여기에서 한 장씩 보여드릴게요.")}
    </section>
  `;
}

function renderMine() {
  return `
    <section class="feed-screen">
      <div class="section-heading">
        <h1>내 사진</h1>
        <p>내가 올린 사진과 평균 평점을 모아봅니다.</p>
      </div>
      ${state.myPhotos.length ? `
        <div class="photo-list">
          ${state.myPhotos.map((photo) => renderPhotoCard(photo, "mine")).join("")}
        </div>
      ` : renderEmpty("내 사진이 아직 없습니다.", "업로드 탭에서 첫 사진을 올려보세요.")}
    </section>
  `;
}

function renderUpload() {
  return `
    <section class="upload-screen">
      <div class="section-heading">
        <h1>사진 업로드</h1>
        <p>모바일에서 보기 좋게 자동 압축해서 저장합니다.</p>
      </div>

      <form class="panel upload-form" data-upload-form>
        <label>
          <span>사진 제목</span>
          <input name="title" value="${escapeHtml(state.uploadTitle)}" maxlength="80" placeholder="예: 창가 자연광 테스트" required />
        </label>

        <label class="upload-drop">
          <input name="photo" type="file" accept="image/*" />
          ${state.previewUrl ? `
            <img src="${state.previewUrl}" alt="선택한 사진 미리보기" />
          ` : `
            <strong>사진 선택</strong>
            <small>앨범에서 고르거나 바로 촬영하세요.</small>
          `}
        </label>

        <button class="primary-button" type="submit" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "업로드 중" : "업로드하기"}
        </button>
      </form>
    </section>
  `;
}

function renderPhotoCard(photo, context) {
  const showStats = context === "mine";
  const ratingCount = Number(photo.ratingCount || 0);
  const averageScore = typeof photo.averageScore === "number" ? photo.averageScore.toFixed(1) : "-";

  return `
    <article class="photo-card ${context === "feed" ? "single-card" : ""}">
      <img class="photo-image" src="${photo.imageData}" alt="${escapeHtml(photo.title)}" />
      <div class="photo-body">
        <div class="photo-title-row">
          <div>
            <h2>${escapeHtml(photo.title)}</h2>
            <p>${escapeHtml(photo.owner.nickname)} 작가</p>
          </div>
          ${showStats ? `
            <div class="score-badge">
              <strong>${ratingCount ? averageScore : "-"}</strong>
              <span>${ratingCount}명</span>
            </div>
          ` : `
            <div class="private-badge">
              <strong>비공개</strong>
              <span>평균은 작가만</span>
            </div>
          `}
        </div>
        ${showStats ? `
          <div class="owner-note">이 평점은 내 사진 탭에서만 보입니다.</div>
        ` : `
          <div class="stars" aria-label="평점 선택">
            ${[1, 2, 3, 4, 5].map((score) => `
              <button class="${photo.myScore >= score ? "active" : ""}" data-rate-photo="${photo.id}" data-score="${score}" type="button" aria-label="${score}점">
                ★
              </button>
            `).join("")}
          </div>
        `}
      </div>
    </article>
  `;
}

function renderEmpty(title, copy) {
  return `
    <div class="empty-panel">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(copy)}</p>
    </div>
  `;
}

function renderTabbar() {
  return `
    <nav class="tabbar" aria-label="하단 메뉴">
      <button class="${state.screen === "feed" ? "active" : ""}" data-screen="feed" type="button">피드</button>
      <button class="${state.screen === "upload" ? "active" : ""}" data-screen="upload" type="button">업로드</button>
      <button class="${state.screen === "mine" ? "active" : ""}" data-screen="mine" type="button">내 사진</button>
    </nav>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.screen = button.dataset.screen;
      clearNotice();
      if (state.screen === "mine") {
        await refreshMyPhotos();
      }
      if (state.screen === "feed") {
        await refreshPhotos();
      }
      render();
    });
  });

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      clearNotice();
      render();
    });
  });

  document.querySelector("[data-auth-form]")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-upload-form]")?.addEventListener("submit", handleUpload);
  document.querySelector("input[name='title']")?.addEventListener("input", (e) => {
    state.uploadTitle = e.target.value;
  });
  document.querySelector("input[type='file']")?.addEventListener("change", handleFileChange);
  document.querySelector("[data-logout]")?.addEventListener("click", logout);
  bindSwipeCard();

  document.querySelectorAll("[data-rate-photo]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleRate(Number(button.dataset.ratePhoto), Number(button.dataset.score));
    });
  });
}

async function handleAuth(event) {
  event.preventDefault();
  clearNotice();
  state.loading = true;
  render();

  const form = new FormData(event.target);
  const payload = {
    loginId: form.get("loginId"),
    password: form.get("password"),
    nickname: form.get("nickname")
  };

  try {
    const result = state.authMode === "register" ? await register(payload) : await login(payload);
    localStorage.setItem("ratingAuthToken", result.token);
    state.user = result.user;
    state.screen = "feed";
    state.message = state.authMode === "register" ? "가입이 완료되었습니다." : "로그인되었습니다.";
    await refreshPhotos();
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handleFileChange(event) {
  const file = event.target.files?.[0];
  state.selectedFile = file || null;
  state.previewUrl = file ? await fileToDataUrl(file, 900, 0.82) : "";
  render();
}

async function handleUpload(event) {
  event.preventDefault();
  clearNotice();

  if (!state.previewUrl) {
    state.error = "업로드할 사진을 선택해주세요.";
    render();
    return;
  }

  state.loading = true;
  render();

  const form = new FormData(event.target);
  try {
    await uploadPhoto({
      title: form.get("title"),
      imageData: state.previewUrl
    });
    state.previewUrl = "";
    state.selectedFile = null;
    state.uploadTitle = "";
    state.screen = "mine";
    state.message = "사진이 올라갔습니다.";
    await Promise.all([refreshPhotos(), refreshMyPhotos()]);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handleRate(photoId, score) {
  clearNotice();
  try {
    const updated = await ratePhoto(photoId, score);
    state.photos = state.photos.map((photo) => photo.id === photoId ? updated : photo);
    state.myPhotos = state.myPhotos.map((photo) => photo.id === photoId ? updated : photo);
    state.message = `${score}점을 남겼습니다.`;
    clampCurrentIndex();
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function refreshPhotos() {
  state.photos = await listPhotos();
  clampCurrentIndex();
}

async function refreshMyPhotos() {
  state.myPhotos = await listMyPhotos();
}

function logout() {
  localStorage.removeItem("ratingAuthToken");
  state.user = null;
  state.screen = "auth";
  state.authMode = "login";
  state.photos = [];
  state.myPhotos = [];
  state.currentIndex = 0;
  state.uploadTitle = "";
  clearNotice();
  render();
}

function bindSwipeCard() {
  const card = document.querySelector("[data-swipe-card]");
  if (!card) {
    return;
  }

  card.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    state.touchStartX = touch.clientX;
    state.touchStartY = touch.clientY;
  }, { passive: true });

  card.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - state.touchStartX;
    const deltaY = touch.clientY - state.touchStartY;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      advanceCard();
    } else {
      previousCard();
    }

    clearNotice();
    render();
  }, { passive: true });
}

function getRatingQueue() {
  return state.photos.filter((photo) => photo.myScore == null && photo.owner.id !== state.user?.id);
}

function advanceCard() {
  const queueLength = getRatingQueue().length;
  if (queueLength === 0) {
    state.currentIndex = 0;
    return;
  }
  state.currentIndex = Math.min(state.currentIndex + 1, queueLength - 1);
}

function previousCard() {
  state.currentIndex = Math.max(state.currentIndex - 1, 0);
}

function clampCurrentIndex() {
  const queueLength = getRatingQueue().length;
  state.currentIndex = queueLength === 0 ? 0 : Math.min(state.currentIndex, queueLength - 1);
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
