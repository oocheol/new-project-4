import { createInquiry, createPortfolioPhoto, getHealth, getStudio } from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");

const state = {
  health: "checking",
  photographers: [],
  photos: [],
  selectedPhotographerId: null,
  selectedMood: "all",
  inquiryStatus: "",
  photoStatus: "",
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
    photographer: fallbackPhotographers[1]
  },
  {
    id: 4,
    title: "화이트 드레스 포트레이트",
    mood: "classic",
    venue: "Han Studio White Room",
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=82",
    featured: false,
    photographer: fallbackPhotographers[0]
  },
  {
    id: 5,
    title: "필름 컬러 세레모니",
    mood: "film",
    venue: "Jeju Garden",
    season: "Spring",
    imageUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=82",
    featured: false,
    photographer: fallbackPhotographers[2]
  },
  {
    id: 6,
    title: "나무 테이블 위 부케",
    mood: "detail",
    venue: "Han Studio Lounge",
    season: "Autumn",
    imageUrl: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=82",
    featured: false,
    photographer: fallbackPhotographers[1]
  }
];

function render() {
  const selectedPhotographer = getSelectedPhotographer();
  const moods = ["all", ...new Set(state.photos.map((photo) => photo.mood))];
  const filteredPhotos = state.selectedMood === "all"
    ? state.photos
    : state.photos.filter((photo) => photo.mood === state.selectedMood);

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Han Studio home">
          <span class="brand-mark">H</span>
          <span>Han Studio</span>
        </a>
        <nav class="nav" aria-label="Primary navigation">
          <a href="#portfolio">Portfolio</a>
          <a href="#artists">Artists</a>
          <a href="#booking">Booking</a>
          <a href="#studio-admin">Admin</a>
        </nav>
        <span class="status status-${state.health}">API ${state.health}</span>
      </header>

      <main>
        <section class="hero">
          <div class="hero-copy">
            <h1>사진을 보고, 마음에 맞는 작가를 고르는 웨딩 스튜디오</h1>
            <p>한 스튜디오의 실제 포트폴리오를 둘러보고 원하는 무드의 사진과 작가를 선택해 촬영 상담을 남겨보세요.</p>
            <div class="hero-actions">
              <a class="button primary" href="#portfolio">사진 둘러보기</a>
              <a class="button secondary" href="#booking">상담 남기기</a>
            </div>
          </div>
          <div class="hero-board" aria-label="Featured wedding portfolio">
            ${state.photos.slice(0, 3).map((photo, index) => `
              <figure class="hero-photo hero-photo-${index + 1}">
                <img src="${photo.imageUrl}" alt="${escapeHtml(photo.title)}" />
                <figcaption>
                  <strong>${escapeHtml(photo.title)}</strong>
                  <span>${escapeHtml(photo.photographer.name)}</span>
                </figcaption>
              </figure>
            `).join("")}
          </div>
        </section>

        <section class="section-grid" id="portfolio">
          <div class="section-heading">
            <h2>Studio Portfolio</h2>
            <p>화이트 우드 톤의 실내, 자연광, 필름 무드, 도심 로케이션까지 원하는 분위기로 좁혀보세요.</p>
          </div>
          <div class="mood-tabs" role="tablist" aria-label="Filter portfolio by mood">
            ${moods.map((mood) => `
              <button class="tab ${state.selectedMood === mood ? "active" : ""}" data-mood="${escapeHtml(mood)}" type="button">
                ${moodLabel(mood)}
              </button>
            `).join("")}
          </div>
          <div class="portfolio-grid">
            ${filteredPhotos.length ? filteredPhotos.map((photo) => `
                <article class="photo-card ${state.selectedPhotographerId === photo.photographer.id ? "selected" : ""}">
                  <button class="photo-select" type="button" data-photographer-id="${photo.photographer.id}" aria-label="${escapeHtml(photo.photographer.name)} 작가 선택">
                    <img src="${photo.imageUrl}" alt="${escapeHtml(photo.title)}" />
                    <span class="photo-meta">
                      <strong>${escapeHtml(photo.title)}</strong>
                      <small>${escapeHtml(photo.venue)} / ${escapeHtml(photo.season)}</small>
                    </span>
                    <span class="photo-artist">${escapeHtml(photo.photographer.name)}</span>
                  </button>
                </article>
              `).join("")
              : `<p class="empty-state">이 무드에 등록된 사진이 아직 없습니다.</p>`}
          </div>
        </section>

        <section class="artists" id="artists">
          <div class="section-heading">
            <h2>Photographers</h2>
            <p>포트폴리오에서 마음에 든 사진을 누르면 해당 작가가 선택됩니다.</p>
          </div>
          <div class="artist-list">
            ${state.photographers.map((photographer) => `
              <article class="artist ${state.selectedPhotographerId === photographer.id ? "active" : ""}">
                <button class="artist-button" type="button" data-photographer-id="${photographer.id}">
                  <img src="${photographer.portraitUrl}" alt="${escapeHtml(photographer.name)} portrait" />
                  <span class="artist-copy">
                    <strong>${escapeHtml(photographer.name)}</strong>
                    <small>${escapeHtml(photographer.role)}</small>
                    <span>${escapeHtml(photographer.bio)}</span>
                  </span>
                  <span class="artist-facts">
                    <span>${escapeHtml(photographer.style)}</span>
                    <span>${photographer.experienceYears}년</span>
                    <span>${formatPrice(photographer.startingPrice)}부터</span>
                  </span>
                </button>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="booking" id="booking">
          <div class="booking-summary">
            <h2>Booking Inquiry</h2>
            <p>선택한 작가에게 촬영 상담 요청을 남기면 DB에 저장됩니다.</p>
            <div class="selected-artist">
              ${selectedPhotographer ? `
                <img src="${selectedPhotographer.portraitUrl}" alt="${escapeHtml(selectedPhotographer.name)} portrait" />
                <div>
                  <strong>${escapeHtml(selectedPhotographer.name)}</strong>
                  <span>${escapeHtml(selectedPhotographer.style)} / ${escapeHtml(selectedPhotographer.location)}</span>
                </div>
              ` : `<span>작가를 선택해주세요.</span>`}
            </div>
            ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
            ${state.inquiryStatus ? `<p class="success">${escapeHtml(state.inquiryStatus)}</p>` : ""}
          </div>

          <form class="booking-form" id="booking-form">
            <input type="hidden" name="photographerId" value="${selectedPhotographer ? selectedPhotographer.id : ""}" />
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
              <input name="email" type="email" placeholder="hello@hanstudio.kr" required />
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
            <label class="full">
              <span>남기고 싶은 이야기</span>
              <textarea name="message" rows="5" placeholder="좋아하는 사진, 장소, 예산, 두 분의 분위기를 알려주세요." required></textarea>
            </label>
            <button class="submit" type="submit" ${selectedPhotographer ? "" : "disabled"}>상담 요청 저장</button>
          </form>
        </section>

        <section class="admin" id="studio-admin">
          <div class="section-heading">
            <h2>Studio Admin</h2>
            <p>촬영한 신혼부부 사진 파일을 선택하면 포트폴리오 DB에 저장되고 화면에 바로 반영됩니다.</p>
          </div>
          ${state.photoStatus ? `<p class="success admin-status">${escapeHtml(state.photoStatus)}</p>` : ""}
          <form class="admin-form" id="photo-form">
            <label>
              <span>사진 제목</span>
              <input name="title" placeholder="예: 햇살 아래 첫 춤" required />
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
              <input name="venue" placeholder="예: Han Studio Room B" required />
            </label>
            <label>
              <span>시즌</span>
              <input name="season" placeholder="예: Spring" required />
            </label>
            <label class="file-field full">
              <span>사진 파일</span>
              <input name="imageFile" type="file" accept="image/*" required />
              <small>JPG, PNG, WebP 이미지를 선택하면 저장 전에 화면용 크기로 자동 압축됩니다.</small>
            </label>
            <label class="checkbox full">
              <input name="featured" type="checkbox" />
              <span>대표 사진으로 표시</span>
            </label>
            <button class="submit" type="submit">포트폴리오 사진 저장</button>
          </form>
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll("[data-photographer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPhotographerId = Number(button.dataset.photographerId);
      state.inquiryStatus = "";
      render();
      document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMood = button.dataset.mood;
      render();
    });
  });

  document.querySelector("#booking-form").addEventListener("submit", handleSubmit);
  document.querySelector("#photo-form").addEventListener("submit", handlePhotoSubmit);
}

async function boot() {
  try {
    const health = await getHealth();
    state.health = health.status || "online";
    const studio = await getStudio();
    state.photographers = studio.photographers || [];
    state.photos = studio.photos || [];
    state.selectedPhotographerId = state.photographers[0]?.id || null;
  } catch (error) {
    state.health = "offline";
    state.photographers = fallbackPhotographers;
    state.photos = fallbackPhotos;
    state.selectedPhotographerId = fallbackPhotographers[0].id;
    state.error = "백엔드 연결 전이라 미리보기 데이터로 표시 중입니다.";
  }

  render();
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const photographerId = Number(form.get("photographerId"));

  if (!photographerId) {
    state.error = "상담을 요청할 작가를 먼저 선택해주세요.";
    render();
    return;
  }

  try {
    state.error = "";
    state.inquiryStatus = "";
    const inquiry = await createInquiry({
      coupleName: form.get("coupleName"),
      phone: form.get("phone"),
      email: form.get("email"),
      weddingDate: form.get("weddingDate"),
      preferredMood: form.get("preferredMood"),
      message: form.get("message"),
      photographerId
    });
    state.inquiryStatus = `${inquiry.coupleName}님의 상담 요청이 저장되었습니다.`;
  } catch (error) {
    state.error = error.message;
  }

  render();
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
    state.error = "";
    state.photoStatus = "";
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
    state.photos = [photo, ...state.photos];
    state.selectedMood = "all";
    state.selectedPhotographerId = photo.photographer?.id || state.selectedPhotographerId;
    state.photoStatus = `${photo.title} 사진이 포트폴리오 맨 앞에 저장되었습니다.`;
    event.currentTarget.reset();
  } catch (error) {
    state.error = error.message;
  }

  render();
  if (state.photoStatus) {
    document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

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

function getSelectedPhotographer() {
  return state.photographers.find((photographer) => photographer.id === state.selectedPhotographerId);
}

function moodLabel(mood) {
  const labels = {
    all: "All",
    calm: "Calm",
    soft: "Soft",
    editorial: "Editorial",
    classic: "Classic",
    film: "Film",
    detail: "Details"
  };

  return labels[mood] || mood;
}

function formatPrice(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
boot();
