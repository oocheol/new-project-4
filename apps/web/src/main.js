import { createNote, getHealth, listNotes } from "./api.js";
import "./styles.css";

const app = document.querySelector("#app");

const state = {
  health: "checking",
  notes: [],
  error: ""
};

function render() {
  app.innerHTML = `
    <section class="shell">
      <header class="header">
        <div>
          <p class="eyebrow">Vercel + Render + Supabase</p>
          <h1>Java 백엔드와 JS 프론트 스타터</h1>
          <p class="lead">프론트, API, DB 연동을 분리한 무료 배포용 기본 구조입니다.</p>
        </div>
        <span class="status status-${state.health}">
          API ${state.health}
        </span>
      </header>

      <section class="panel">
        <form id="note-form" class="note-form">
          <input id="title" name="title" placeholder="제목" required />
          <textarea id="body" name="body" placeholder="메모 내용" rows="4" required></textarea>
          <button type="submit">샘플 메모 저장</button>
        </form>

        <div class="notes">
          <h2>API 응답</h2>
          ${state.error ? `<p class="error">${state.error}</p>` : ""}
          ${
            state.notes.length
              ? state.notes
                  .map(
                    (note) => `
                      <article class="note">
                        <strong>${escapeHtml(note.title)}</strong>
                        <p>${escapeHtml(note.body)}</p>
                      </article>
                    `
                  )
                  .join("")
              : `<p class="empty">아직 메모가 없습니다.</p>`
          }
        </div>
      </section>
    </section>
  `;

  document.querySelector("#note-form").addEventListener("submit", handleSubmit);
}

async function boot() {
  try {
    const health = await getHealth();
    state.health = health.status || "online";
    state.notes = await listNotes();
  } catch (error) {
    state.health = "offline";
    state.error = error.message;
  }

  render();
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  try {
    state.error = "";
    await createNote(form.get("title"), form.get("body"));
    state.notes = await listNotes();
  } catch (error) {
    state.error = error.message;
  }

  render();
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
