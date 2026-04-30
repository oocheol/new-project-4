import {
  createInquiry,
  createPortfolioPhoto,
  getHealth,
  getStudio,
  listInquiries,
  recommendPhoto,
  recordPhotoView
} from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin1234";

const state = {
  health: "checking",
  screen: "feed",
  photographers: [],
  photos: [],
  inquiries: [],
  selectedPhotoId: null,
  selectedPhotographerId: null,
  adminAuthed: sessionStorage.getItem("adminAuthed") === "true",
  likedPhotoIds: new Set(JSON.parse(localStorage.getItem("likedPhotoIds") || "[]")),
  message: "",
  error: ""
};

const fallbackPhotographers = [
  {
    id: 1,
    name: "한유나",
    role: "Lead Photographer",
    bio: "부드러운 자연광과 작은 표정을 오래 남기는 작가입니다.",
    style: "Natural Light",
    location: "서울 / 경기",
    experienceYears: 9,
    startingPrice: 850000,
    portraitUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "서민준",
    role: "Editorial Photographer",
    bio: "영화적인 구도와 차분한 컬러로 한 장면 같은 웨딩을 만듭니다.",
    style: "Editorial",
    location: "전국 출장",
    experienceYears: 7,
    startingPrice: 980000,
    portraitUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "정하은",
    role: "Film Mood Photographer",
    bio: "필름 질감, 우드톤 공간, 담백한 포즈를 좋아하는 커플에게 잘 맞습니다.",
    style: "Film Mood",
    location: "서울 / 제주",
    experienceYears: 6,
    startingPrice: 780000,
    portraitUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"
  }
];

const fallbackPhotos = [
  {
    id: 1,
    title: "오전의 우드 스튜디오",
    mood: "calm",
    venue: "Han Studio Room A",
    season: "Spring",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=82",
    featured: true,
    viewCount: 128,
    recommendationCount: 32,
    photographer: fallbackPhotographers[0]
  },
  {
    id: 2,
    title: "창가의 베일",
    mood: "soft",
    venue: "Han Studio Window Hall",
    season: "Winter",
    imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=82",
    featured: true,
    viewCount: 92,
    recommendationCount: 24,
    photographer: fallbackPhotographers[2]
  },
  {
    id: 3,
    title: "도시의 늦은 오후",
    mood: "editorial",
    venue: "Seoul City Walk",
    season: "Autumn",
    imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1400&q=82",
    featured: false,
    viewCount: 74,
    recommendationCount: 18,
    photographer: fallbackPhotographers[1]
  }
];

function render() {
  app.innerHTML = `
    <div class="mobile-app">
      ${renderTopbar()}
      <main class="screen">
        ${renderStatus()}
        ${renderScreen()}
      </main>
      ${renderBottomNav()}
    </div>
  `;

  bindEvents();
}

function renderTopbar() {
  return `
    <header class="topbar">
      <button class="icon-button" data-screen="feed" type="button" aria-label="홈">H</button>
      <div>
        <strong>Han Studio</strong>
        <span>Wedding photo feed</span>
      </div>
      <button class="admin-link" data-screen="admin" type="button">관리자</button>
    </header>
  `;
}

function renderStatus() {
  return `
    <div class="notice-row">
      <span class="status status-${state.health}">API ${state.health}</span>
      ${state.message ? `<span class="success">${escapeHtml(state.message)}</span>` : ""}
      ${state.error ? `<span class="error">${escapeHtml(state.error)}</span>` : ""}
    </div>
  `;
}

function renderScreen() {
  if (state.screen === "detail") {
    return renderPhotoDetail();
  }

  if (state.screen === "booking") {
    return renderBooking();
  }

  if (state.screen === "admin") {
    return state.adminAuthed ? renderAdmin() : renderAdminLogin();
  }

  return renderFeed();
}

function renderFeed() {
  return `
    <section class="feed">
      <div class="feed-heading">
        <h1>사진으로 고르는 웨딩 작가</h1>
        <p>마음에 드는 사진을 누르면 촬영한 작가 프로필과 예약 문의를 바로 볼 수 있습니다.</p>
      </div>
      <div class="photo-feed">
        ${state.photos.map((photo) => `
          <article class="feed-card">
            <button class="photo-open" data-photo-id="${photo.id}" type="button">
              <img src="${photo.imageUrl}" alt="${escapeHtml(photo.title)}" />
            </button>
            <div class="feed-card-meta">
              <button class="artist-chip" data-photo-id="${photo.id}" type="button">
                <img src="${photo.photographer.portraitUrl}" alt="" />
                <span>
                  <strong>${escapeHtml(photo.photographer.name)}</strong>
                  <small>${escapeHtml(photo.photographer.style)}</small>
                </span>
              </button>
              <button class="recommend small-action ${state.likedPhotoIds.has(photo.id) ? "active" : ""}" data-recommend-id="${photo.id}" type="button">
                추천 ${count(photo.recommendationCount)}
              </button>
            </div>
            <div class="metric-row">
              <span>조회 ${count(photo.viewCount)}</span>
              <span>${escapeHtml(photo.venue)}</span>
              <span>${escapeHtml(photo.mood)}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPhotoDetail() {
  const photo = getSelectedPhoto();
  if (!photo) {
    return `<section class="empty-panel"><p>사진을 찾을 수 없습니다.</p></section>`;
  }

  return `
    <section class="detail-view">
      <button class="back-button" data-screen="feed" type="button">← 피드로</button>
      <article class="detail-photo">
        <img src="${photo.imageUrl}" alt="${escapeHtml(photo.title)}" />
        <div class="detail-actions">
          <button class="recommend ${state.likedPhotoIds.has(photo.id) ? "active" : ""}" data-recommend-id="${photo.id}" type="button">
            추천하기
          </button>
          <button class="primary-action" data-screen="booking" data-photographer-id="${photo.photographer.id}" type="button">
            이 작가 예약 문의
          </button>
        </div>
      </article>

      <section class="photo-copy">
        <h1>${escapeHtml(photo.title)}</h1>
        <div class="metric-row">
          <span>조회 ${count(photo.viewCount)}</span>
          <span>추천 ${count(photo.recommendationCount)}</span>
          <span>${escapeHtml(photo.season)}</span>
        </div>
      </section>

      ${renderPhotographerProfile(photo.photographer)}
    </section>
  `;
}

function renderPhotographerProfile(photographer) {
  return `
    <section class="profile-card">
      <img src="${photographer.portraitUrl}" alt="${escapeHtml(photographer.name)} 프로필" />
      <div>
        <strong>${escapeHtml(photographer.name)}</strong>
        <span>${escapeHtml(photographer.role)}</span>
        <p>${escapeHtml(photographer.bio)}</p>
        <div class="profile-facts">
          <span>${escapeHtml(photographer.location)}</span>
          <span>${photographer.experienceYears}년</span>
          <span>${formatPrice(photographer.startingPrice)}부터</span>
        </div>
      </div>
    </section>
  `;
}

function renderBooking() {
  const photographer = getSelectedPhotographer();
  return `
    <section class="form-page">
      <button class="back-button" data-screen="${state.selectedPhotoId ? "detail" : "feed"}" type="button">← 돌아가기</button>
      <h1>예약 문의</h1>
      ${photographer ? renderPhotographerProfile(photographer) : `<p>작가를 먼저 선택해주세요.</p>`}
      <form class="stack-form" id="booking-form">
        <input type="hidden" name="photographerId" value="${photographer ? photographer.id : ""}" />
        <label>
          <span>두 분 성함</span>
          <input name="coupleName" placeholder="예: 김하나 & 이도윤" required />
        </label>
        <label>
          <span>연락처</span>
          <input name="phone" placeholder="010-0000-0000" required />
        </label>
        <label>
          <span>이메일</span>
          <input name="email" type="email" placeholder="hello@example.com" required />
        </label>
        <label>
          <span>희망 촬영일</span>
          <input name="weddingDate" type="date" required />
        </label>
        <label>
          <span>원하는 무드</span>
          <select name="preferredMood" required>
            <option value="Natural Light">Natural Light</option>
            <option value="Editorial">Editorial</option>
            <option value="Film Mood">Film Mood</option>
            <option value="Classic">Classic</option>
          </select>
        </label>
        <label>
          <span>문의 내용</span>
          <textarea name="message" rows="5" placeholder="좋아하는 사진, 예산, 원하는 촬영 분위기를 알려주세요." required></textarea>
        </label>
        <button class="primary-action full" type="submit" ${photographer ? "" : "disabled"}>예약 문의 저장</button>
      </form>
    </section>
  `;
}

function renderAdminLogin() {
  return `
    <section class="form-page">
      <h1>관리자 로그인</h1>
      <p class="helper">관리자는 예약 내역을 확인하고 작가 포트폴리오 사진을 추가할 수 있습니다.</p>
      <form class="stack-form" id="admin-login-form">
        <label>
          <span>관리자 비밀번호</span>
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="primary-action full" type="submit">로그인</button>
      </form>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="admin-page">
      <div class="admin-heading">
        <div>
          <h1>관리자</h1>
          <p>예약 내역을 확인하고 작가들의 사진을 등록합니다.</p>
        </div>
        <button class="small-action" id="logout-admin" type="button">로그아웃</button>
      </div>

      <section class="admin-panel">
        <h2>예약 내역</h2>
        <button class="small-action" id="refresh-inquiries" type="button">새로고침</button>
        <div class="inquiry-list">
          ${state.inquiries.length ? state.inquiries.map((inquiry) => `
            <article class="inquiry-card">
              <strong>${escapeHtml(inquiry.coupleName)}</strong>
              <span>${escapeHtml(inquiry.photographer.name)} / ${escapeHtml(inquiry.weddingDate)}</span>
              <small>${escapeHtml(inquiry.phone)} · ${escapeHtml(inquiry.email)}</small>
              <p>${escapeHtml(inquiry.message)}</p>
            </article>
          `).join("") : `<p class="empty-panel">예약 내역이 아직 없습니다.</p>`}
        </div>
      </section>

      <section class="admin-panel">
        <h2>사진 추가 등록</h2>
        <form class="stack-form" id="photo-form">
          <label>
            <span>사진 제목</span>
            <input name="title" required />
          </label>
          <label>
            <span>담당 작가</span>
            <select name="photographerId" required>
              ${state.photographers.map((photographer) => `
                <option value="${photographer.id}">${escapeHtml(photographer.name)} / ${escapeHtml(photographer.style)}</option>
              `).join("")}
            </select>
          </label>
          <label>
            <span>무드</span>
            <input name="mood" placeholder="예: natural" required />
          </label>
          <label>
            <span>촬영 장소</span>
            <input name="venue" required />
          </label>
          <label>
            <span>시즌</span>
            <input name="season" required />
          </label>
          <label class="file-field">
            <span>사진 파일</span>
            <input name="imageFile" type="file" accept="image/*" required />
            <small>8MB 이하 이미지를 화면용 JPEG로 압축해 저장합니다.</small>
          </label>
          <label class="checkbox">
            <input name="featured" type="checkbox" />
            <span>대표 사진</span>
          </label>
          <button class="primary-action full" type="submit">사진 저장</button>
        </form>
      </section>
    </section>
  `;
}

function renderBottomNav() {
  return `
    <nav class="bottom-nav" aria-label="앱 이동">
      <button class="${state.screen === "feed" ? "active" : ""}" data-screen="feed" type="button">피드</button>
      <button data-screen="booking" type="button">예약</button>
      <button class="${state.screen === "admin" ? "active" : ""}" data-screen="admin" type="button">관리자</button>
    </nav>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextScreen = button.dataset.screen;
      if (button.dataset.photographerId) {
        state.selectedPhotographerId = Number(button.dataset.photographerId);
      }
      changeScreen(nextScreen);
    });
  });

  document.querySelectorAll("[data-photo-id]").forEach((button) => {
    button.addEventListener("click", () => openPhoto(Number(button.dataset.photoId)));
  });

  document.querySelectorAll("[data-recommend-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      recommend(Number(button.dataset.recommendId));
    });
  });

  document.querySelector("#booking-form")?.addEventListener("submit", handleBookingSubmit);
  document.querySelector("#admin-login-form")?.addEventListener("submit", handleAdminLogin);
  document.querySelector("#photo-form")?.addEventListener("submit", handlePhotoSubmit);
  document.querySelector("#refresh-inquiries")?.addEventListener("click", loadInquiries);
  document.querySelector("#logout-admin")?.addEventListener("click", () => {
    state.adminAuthed = false;
    sessionStorage.removeItem("adminAuthed");
    changeScreen("feed");
  });
}

async function boot() {
  try {
    const health = await getHealth();
    state.health = health.status || "online";
    const studio = await getStudio();
    state.photographers = studio.photographers || [];
    state.photos = normalizePhotos(studio.photos || []);
  } catch (error) {
    state.health = "offline";
    state.photographers = fallbackPhotographers;
    state.photos = fallbackPhotos;
    state.error = "백엔드 연결 전이라 미리보기 데이터로 표시 중입니다.";
  }

  state.selectedPhotographerId = state.photographers[0]?.id || null;
  render();
}

function changeScreen(screen) {
  state.screen = screen;
  state.message = "";
  state.error = "";
  if (screen === "admin" && state.adminAuthed) {
    loadInquiries();
    return;
  }
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function openPhoto(photoId) {
  state.selectedPhotoId = photoId;
  const photo = getSelectedPhoto();
  state.selectedPhotographerId = photo?.photographer.id || state.selectedPhotographerId;
  state.screen = "detail";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    const updatedPhoto = await recordPhotoView(photoId);
    replacePhoto(updatedPhoto);
    render();
  } catch {
    bumpLocalPhoto(photoId, "viewCount");
    render();
  }
}

async function recommend(photoId) {
  if (state.likedPhotoIds.has(photoId)) {
    state.message = "이미 추천한 사진입니다.";
    render();
    return;
  }

  state.likedPhotoIds.add(photoId);
  persistLikes();

  try {
    const updatedPhoto = await recommendPhoto(photoId);
    replacePhoto(updatedPhoto);
  } catch {
    bumpLocalPhoto(photoId, "recommendationCount");
  }

  state.message = "추천이 반영되었습니다.";
  render();
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const photographerId = Number(form.get("photographerId"));

  if (!photographerId) {
    state.error = "예약 문의할 작가를 먼저 선택해주세요.";
    render();
    return;
  }

  try {
    const inquiry = await createInquiry({
      coupleName: form.get("coupleName"),
      phone: form.get("phone"),
      email: form.get("email"),
      weddingDate: form.get("weddingDate"),
      preferredMood: form.get("preferredMood"),
      message: form.get("message"),
      photographerId
    });
    state.message = `${inquiry.coupleName}님의 예약 문의가 저장되었습니다.`;
    state.error = "";
    changeScreen("feed");
  } catch (error) {
    state.error = error.message;
    render();
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (form.get("password") !== ADMIN_PASSWORD) {
    state.error = "관리자 비밀번호가 맞지 않습니다.";
    render();
    return;
  }

  state.adminAuthed = true;
  sessionStorage.setItem("adminAuthed", "true");
  state.error = "";
  loadInquiries();
}

async function loadInquiries() {
  try {
    state.inquiries = await listInquiries();
    state.error = "";
  } catch (error) {
    state.error = error.message;
  }
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handlePhotoSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const imageFile = form.get("imageFile");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    state.error = "업로드할 사진 파일을 선택해주세요.";
    render();
    return;
  }

  try {
    const imageUrl = await imageFileToDataUrl(imageFile);
    const photo = await createPortfolioPhoto({
      title: form.get("title"),
      mood: form.get("mood"),
      venue: form.get("venue"),
      season: form.get("season"),
      imageUrl,
      featured: form.get("featured") === "on",
      photographerId: Number(form.get("photographerId"))
    });
    state.photos = [normalizePhoto(photo), ...state.photos];
    state.selectedPhotoId = photo.id;
    state.selectedPhotographerId = photo.photographer?.id || state.selectedPhotographerId;
    state.message = `${photo.title} 사진이 등록되었습니다.`;
    state.error = "";
    changeScreen("detail");
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function imageFileToDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("사진 파일은 8MB 이하로 선택해주세요.");
  }

  const image = await loadImage(file);
  const maxSize = 1400;
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.82);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("사진 파일을 읽을 수 없습니다."));
    };
    image.src = objectUrl;
  });
}

function getSelectedPhoto() {
  return state.photos.find((photo) => photo.id === state.selectedPhotoId);
}

function getSelectedPhotographer() {
  return state.photographers.find((photographer) => photographer.id === state.selectedPhotographerId);
}

function replacePhoto(updatedPhoto) {
  const normalized = normalizePhoto(updatedPhoto);
  state.photos = state.photos.map((photo) => (photo.id === normalized.id ? normalized : photo));
}

function bumpLocalPhoto(photoId, key) {
  state.photos = state.photos.map((photo) => photo.id === photoId
    ? { ...photo, [key]: count(photo[key]) + 1 }
    : photo);
}

function normalizePhotos(photos) {
  return photos.map(normalizePhoto);
}

function normalizePhoto(photo) {
  return {
    ...photo,
    viewCount: count(photo.viewCount),
    recommendationCount: count(photo.recommendationCount)
  };
}

function persistLikes() {
  localStorage.setItem("likedPhotoIds", JSON.stringify([...state.likedPhotoIds]));
}

function count(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function formatPrice(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
boot();
