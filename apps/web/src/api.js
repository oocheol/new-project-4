const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("ratingAuthToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(cleanError(message) || `요청에 실패했습니다. (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function cleanError(message) {
  if (!message) {
    return "";
  }

  try {
    const parsed = JSON.parse(message);
    return parsed.message || parsed.error || message;
  } catch {
    return message;
  }
}

export function getHealth() {
  return request("/api/health");
}

export function register(payload) {
  return request("/api/rating/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/api/rating/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request("/api/rating/me");
}

export function listPhotos() {
  return request("/api/rating/photos");
}

export function listMyPhotos() {
  return request("/api/rating/photos/mine");
}

export function uploadPhoto(payload) {
  return request("/api/rating/photos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function ratePhoto(photoId, score) {
  return request(`/api/rating/photos/${photoId}/ratings`, {
    method: "POST",
    body: JSON.stringify({ score })
  });
}
