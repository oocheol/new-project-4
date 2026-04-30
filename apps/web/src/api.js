const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
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

  return response.json();
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
