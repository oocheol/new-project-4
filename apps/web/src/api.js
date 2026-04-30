const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("API 주소가 설정되지 않았습니다. VITE_API_BASE_URL에 Render API 주소를 설정해주세요.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      "API가 JSON이 아닌 응답을 반환했습니다. VITE_API_BASE_URL이 프론트 주소가 아니라 Render API 주소인지 확인해주세요."
    );
  }

  return body ? JSON.parse(body) : null;
}

export function getHealth() {
  return request("/api/health");
}

export function getStudio() {
  return request("/api/studio");
}

export function listInquiries() {
  return request("/api/inquiries");
}

export function createInquiry(inquiry) {
  return request("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiry)
  });
}

export function createPortfolioPhoto(photo) {
  return request("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(photo)
  });
}

export function recordPhotoView(photoId) {
  return request(`/api/portfolio/${photoId}/views`, {
    method: "POST"
  });
}

export function recommendPhoto(photoId) {
  return request(`/api/portfolio/${photoId}/recommendations`, {
    method: "POST"
  });
}
