const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(readableError(message) || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function authHeader() {
  const token = localStorage.getItem("untitled_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function readableError(message) {
  if (!message) {
    return "";
  }

  try {
    const parsed = JSON.parse(message);
    return parsed.message || parsed.error || message;
  } catch {
    return message.startsWith("<!DOCTYPE") ? "API host is returning HTML. Check VITE_API_BASE_URL." : message;
  }
}

export function getHealth() {
  return request("/api/health");
}

export function getMagazineHome() {
  return request("/api/magazine/home");
}

export function createStory(payload) {
  return request("/api/magazine/stories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateStory(id, payload) {
  return request(`/api/magazine/stories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteStory(id) {
  return request(`/api/magazine/stories/${id}`, { method: "DELETE" });
}

export function likeStory(id) {
  return request(`/api/magazine/stories/${id}/like`, { method: "POST" });
}

export function viewStory(id) {
  return request(`/api/magazine/stories/${id}/view`, { method: "POST" });
}

export function createPhotoPage(payload) {
  return request("/api/magazine/photo-pages", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePhotoPage(id, payload) {
  return request(`/api/magazine/photo-pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deletePhotoPage(id) {
  return request(`/api/magazine/photo-pages/${id}`, { method: "DELETE" });
}

export function setRepresentativePhoto(id) {
  return request(`/api/magazine/photo-pages/${id}/representative-image`, { method: "POST" });
}

export function likePhotoPage(id) {
  return request(`/api/magazine/photo-pages/${id}/like`, { method: "POST" });
}

export function viewPhotoPage(id) {
  return request(`/api/magazine/photo-pages/${id}/view`, { method: "POST" });
}

export function createSubmission(payload) {
  return request("/api/magazine/submissions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function signup(payload) {
  return request("/api/magazine/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/api/magazine/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request("/api/magazine/auth/me");
}
