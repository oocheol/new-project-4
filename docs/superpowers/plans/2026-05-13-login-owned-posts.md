# Login Owned Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add login/signup, require login for uploads, and let users edit/delete their own magazine posts.

**Architecture:** The API will use a small first-party auth layer with hashed passwords and signed bearer tokens. Magazine entries and photo pages will carry owner metadata plus a `seeded` flag so examples stay while user-created content can be cleaned.

**Tech Stack:** Spring Boot 2.7, JPA, Java 11, Vite vanilla JS, browser localStorage.

---

### Task 1: Backend Auth And Ownership

**Files:**
- Create: `apps/api/src/main/java/com/example/starter/magazine/MagazineUser.java`
- Create: `apps/api/src/main/java/com/example/starter/magazine/MagazineUserRepository.java`
- Create: `apps/api/src/main/java/com/example/starter/magazine/AuthRequest.java`
- Create: `apps/api/src/main/java/com/example/starter/magazine/AuthResponse.java`
- Create: `apps/api/src/main/java/com/example/starter/magazine/AuthService.java`
- Modify: `apps/api/src/main/java/com/example/starter/magazine/MagazineEntry.java`
- Modify: `apps/api/src/main/java/com/example/starter/magazine/PhotoPage.java`
- Modify: `apps/api/src/main/java/com/example/starter/magazine/MagazineController.java`
- Modify: `apps/api/src/main/java/com/example/starter/magazine/MagazineDataSeeder.java`

- [ ] Add user entity and repository.
- [ ] Add password hashing and signed bearer token helpers.
- [ ] Add signup/login/me/profile endpoints.
- [ ] Mark seed content as `seeded=true`.
- [ ] Delete non-seeded entries/photo pages/submissions on startup.
- [ ] Require auth for create/update/delete.
- [ ] Add owner-only checks for edit/delete and profile representative image.

### Task 2: Frontend Auth And Forms

**Files:**
- Modify: `apps/web/src/api.js`
- Modify: `apps/web/src/main.js`
- Modify: `apps/web/src/styles.css`

- [ ] Store auth token/user in localStorage.
- [ ] Add login/signup UI with nickname, id, password, optional profile image.
- [ ] Hide upload forms when logged out.
- [ ] Make story cover image optional.
- [ ] Show profile avatar beside nickname.
- [ ] Show edit/delete/representative-image controls on owned posts.
- [ ] Send bearer token for protected API calls.

### Task 3: Verification And Deployment

- [ ] Run API tests/build.
- [ ] Run frontend build.
- [ ] Run browser smoke checks.
- [ ] Commit and push master.
- [ ] Deploy API to Oracle and frontend to Vercel.
- [ ] Verify production health and protected flows.
