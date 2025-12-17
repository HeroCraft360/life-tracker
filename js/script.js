// Life Tracker — Google Sign-in + Cloud Save (Firestore) + Guest fallback
document.addEventListener("DOMContentLoaded", () => {
  /* ========= Firebase handles (from index.html) ========= */
  const auth = window.auth;
  const db = window.db;
  const googleProvider = window.googleProvider;

  if (!auth || !db || !googleProvider) {
    console.error("Firebase not initialized. Check firebaseConfig in index.html.");
    return;
  }

  /* ========= DOM ========= */
  const modal = document.getElementById("authModal");
  const googleBtn = document.getElementById("googleBtn");
  const guestBtn = document.getElementById("guestBtn");
  const guestWarn = document.getElementById("guestWarn");
  const authError = document.getElementById("authError");

  const screens = {
    welcome: document.getElementById("welcome"),
    scene: document.getElementById("scene"),
  };

  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const userBox = document.getElementById("userBox");
  const userName = document.getElementById("userName");

  const ageInput = document.getElementById("ageInput");
  const bdayInput = document.getElementById("bdayInput");
  const errorMsg = document.getElementById("errorMsg");

  const ageBadge = document.getElementById("ageBadge");
  const ageLabel = document.getElementById("ageLabel");
  const bdayLabel = document.getElementById("bdayLabel");
  const daysLeftEl = document.getElementById("daysLeft");

  const bgCanvas = document.getElementById("bgCanvas");
  const bgCtx = bgCanvas.getContext("2d");
  const charCanvas = document.getElementById("characterCanvas");
  const chCtx = charCanvas.getContext("2d");

  /* ========= State ========= */
  let currentUser = null;
  const LS_KEY = "lifeTracker:v1";

  /* ========= UI helpers ========= */
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function showError(t) { errorMsg.textContent = t; errorMsg.classList.remove("hidden"); }
  function hideError() { errorMsg.classList.add("hidden"); }

  function showAuthError(t) {
    if (!authError) return;
    authError.textContent = t;
    authError.classList.remove("hidden");
  }
  function clearAuthError() {
    if (!authError) return;
    authError.textContent = "";
    authError.classList.add("hidden");
  }

  function openModal() {
    show(modal);
    hide(screens.welcome);
    hide(screens.scene);
  }
  function openWelcome() {
    hide(modal);
    show(screens.welcome);
    hide(screens.scene);
  }
  function isSceneVisible() {
    return !screens.scene.classList.contains("hidden");
  }

  /* ========= Screen transitions ========= */
  function goToScene() {
    if (isSceneVisible()) return;

    const welcome = screens.welcome;
    const scene = screens.scene;

    scene.classList.add("is-entering");
    show(scene);

    welcome.classList.add("is-leaving");
    setTimeout(() => {
      hide(welcome);
      welcome.classList.remove("is-leaving");

      scene.classList.add("is-active");
      setTimeout(() => {
        scene.classList.remove("is-entering");
        scene.classList.remove("is-active");
      }, 20);
    }, 450);
  }

  function backToWelcome() {
    const welcome = screens.welcome;
    const scene = screens.scene;

    welcome.classList.add("is-entering");
    show(welcome);

    scene.classList.add("is-leaving");
    setTimeout(() => {
      hide(scene);
      scene.classList.remove("is-leaving");

      welcome.classList.add("is-active");
      setTimeout(() => {
        welcome.classList.remove("is-entering");
        welcome.classList.remove("is-active");
      }, 20);
    }, 450);
  }

  /* ========= DOB parsing + countdown ========= */
  const DOB_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  function parseDOB(str) {
    if (!str) return null;
    const m = DOB_REGEX.exec(str.trim());
    if (!m) return null;

    const mm = +m[1], dd = +m[2], yyyy = +m[3];
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== (mm - 1) || d.getDate() !== dd) return null;
    return d;
  }

  function daysUntilNextBirthday(dob, now = new Date()) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
    const MS = 24 * 60 * 60 * 1000;
    return Math.ceil((next - today) / MS);
  }

  function fillScene(age, dobStr) {
    ageBadge.textContent = `Age — ${age}`;
    ageLabel.textContent = `Age: ${age}`;
    bdayLabel.textContent = `Birthdate: ${dobStr}`;

    const dob = parseDOB(dobStr);
    if (dob) daysLeftEl.textContent = String(daysUntilNextBirthday(dob));
  }

  /* ========= Persistence ========= */
  async function saveProgress(age, dobStr) {
    if (currentUser) {
      await db.collection("users").doc(currentUser.uid).set(
        { age: Number(age), dob: dobStr, updatedAt: Date.now() },
        { merge: true }
      );
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify({ age: Number(age), dob: dobStr, updatedAt: Date.now() }));
    }
  }

  async function loadProgress() {
    if (currentUser) {
      const doc = await db.collection("users").doc(currentUser.uid).get();
      return doc.exists ? doc.data() : null;
    } else {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  }

  /* ========= Sky / clouds ========= */
  function sizeBgToCSSPixels() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = bgCanvas.getBoundingClientRect();
    bgCanvas.width = Math.round(rect.width * dpr);
    bgCanvas.height = Math.round(rect.height * dpr);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  sizeBgToCSSPixels();
  window.addEventListener("resize", sizeBgToCSSPixels); // ✅ FIXED

  const clouds = Array.from({ length: 6 }).map((_, i) => ({
    x: Math.random() * 900,
    y: 30 + i * 30,
    w: 60 + Math.random() * 70,
    h: 24 + Math.random() * 10,
    speed: 0.2 + Math.random() * 0.25,
    a: 0.9 - i * 0.1,
  }));

  function drawCloud(c) {
    bgCtx.save();
    bgCtx.globalAlpha = c.a;
    bgCtx.fillStyle = "#ffffff";
    for (let ix = -Math.floor(c.w / 6); ix <= Math.floor(c.w / 6); ix++) {
      const yy = Math.sin((ix + c.x) * 0.1) * 3;
      bgCtx.fillRect(Math.round(c.x + ix * 6), Math.round(c.y + yy), 6, c.h);
    }
    bgCtx.restore();
  }

  function animateSky() {
    const g = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    g.addColorStop(0, "#dbeffb");
    g.addColorStop(1, "#f7fdfd");
    bgCtx.fillStyle = g;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    clouds.forEach((c) => {
      c.x += c.speed;
      if (c.x - c.w > bgCanvas.width) c.x = -c.w - 40;
      drawCloud(c);
    });

    requestAnimationFrame(animateSky);
  }
  requestAnimationFrame(animateSky);

  /* ========= Pixel avatar ========= */
  function drawBlock(ctx, gx, gy, color, scale) {
    ctx.fillStyle = color;
    ctx.fillRect(gx * scale, gy * scale, scale, scale);
  }

  function drawCharacterForAge(ctx, age) {
    const W = 16, H = 16;
    const scale = Math.floor(Math.min(ctx.canvas.width, ctx.canvas.height) / H / 1.6);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    const pxW = W * scale, pxH = H * scale;
    ctx.translate((ctx.canvas.width - pxW) / 2, (ctx.canvas.height - pxH) / 2);

    const group = age <= 12 ? "child" : age <= 19 ? "teen" : age <= 59 ? "adult" : "elder";
    let shirt = "#ffd6a5", pants = "#7ec8ff", hair = "#6b3bff", skin = "#ffe6cc";
    if (group === "teen") { shirt = "#9be7d9"; pants = "#3b7f9e"; hair = "#222831"; skin = "#ffd6b3"; }
    if (group === "adult") { shirt = "#8fd3c7"; pants = "#3c6e71"; hair = "#2e2a26"; skin = "#ffd8b3"; }
    if (group === "elder") { shirt = "#f0e5d8"; pants = "#8b9aa3"; hair = "#c9c9c9"; skin = "#ffdfc8"; }

    // head
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) drawBlock(ctx, 6 + x, 1 + y, skin, scale);

    // hair
    if (group !== "adult") [[6,0],[7,0],[8,0],[9,0],[5,1],[10,1]].forEach(([x,y]) => drawBlock(ctx, x, y, hair, scale));
    else [[7,0],[8,0],[6,1],[9,1]].forEach(([x,y]) => drawBlock(ctx, x, y, hair, scale));

    // eyes
    drawBlock(ctx, 7, 2, "#201f1f", scale);
    drawBlock(ctx, 8, 2, "#201f1f", scale);

    // torso
    for (let y = 0; y < 5; y++) for (let x = 0; x < 8; x++) drawBlock(ctx, 4 + x, 5 + y, shirt, scale);

    // pants
    for (let y = 0; y < 4; y++) {
      for (let x = 2; x < 14; x++) {
        if ((x === 7 || x === 8) && y > 0) continue;
        drawBlock(ctx, x, 10 + y, pants, scale);
      }
    }

    // shoes
    [[3,14],[4,14],[11,14],[12,14]].forEach(([x,y]) => drawBlock(ctx, x, y, "#2b2b2b", scale));

    ctx.restore();

    // gentle bob (start once)
    if (!drawCharacterForAge._bob) {
      let t = 0;
      (function bob() {
        t += 0.04;
        charCanvas.style.transform = `translateY(${Math.sin(t) * 2}px)`;
        requestAnimationFrame(bob);
      })();
      drawCharacterForAge._bob = true;
    }
  }

  /* ========= Sound ========= */
  function ding() {
    try {
      const AC = new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = 880;
      o.connect(g); g.connect(AC.destination);
      const now = AC.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      o.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o.start(now); o.stop(now + 0.26);
    } catch {}
  }

  /* ========= Auth buttons ========= */
  guestBtn.addEventListener("click", async () => {
    clearAuthError();
    guestWarn.classList.remove("hidden");
    openWelcome();

    // guest auto-resume if local data exists
    const saved = await loadProgress();
    if (saved?.age && saved?.dob) {
      ageInput.value = saved.age;
      bdayInput.value = saved.dob;
      fillScene(saved.age, saved.dob);
      goToScene();
      drawCharacterForAge(chCtx, saved.age);
    }
  });

  googleBtn.addEventListener("click", async () => {
    clearAuthError();
    googleBtn.disabled = true;

    try {
      // keep signed in across refresh
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

      // popup sign-in
      await auth.signInWithPopup(googleProvider);
      // auth state callback will run after this
    } catch (e) {
      console.warn(e);

      const code = e?.code || "";
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        showAuthError("Popup blocked — switching to redirect sign-in...");
        try {
          await auth.signInWithRedirect(googleProvider);
          return;
        } catch (e2) {
          console.warn(e2);
        }
      }

      if (code === "auth/unauthorized-domain") {
        showAuthError("Unauthorized domain. Add your Netlify domain in Firebase → Auth → Settings → Authorized domains.");
      } else {
        showAuthError("Google sign-in failed. Check Firebase Auth + Authorized domains.");
      }
    } finally {
      googleBtn.disabled = false;
    }
  });

  signOutBtn.addEventListener("click", async () => {
    await auth.signOut();
    currentUser = null;
    userBox.classList.add("hidden");
    backToWelcome();
    openModal();
  });

  /* ========= Auth state ========= */
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;

    if (!user) {
      userBox.classList.add("hidden");
      openModal();
      return;
    }

    // signed in
    userName.textContent = user.displayName || user.email || "Signed in";
    userBox.classList.remove("hidden");
    guestWarn.classList.add("hidden");
    clearAuthError();

    // If user already saved progress in Firestore, auto-resume and skip form
    const saved = await loadProgress();
    openWelcome();

    if (saved?.age && saved?.dob) {
      ageInput.value = saved.age;
      bdayInput.value = saved.dob;

      fillScene(saved.age, saved.dob);
      goToScene();
      drawCharacterForAge(chCtx, saved.age);
    }
  });

  /* ========= Start button ========= */
  startBtn.addEventListener("click", async () => {
    hideError();

    const age = parseInt(ageInput.value, 10);
    const dobStr = (bdayInput?.value || "").trim();
    const dob = parseDOB(dobStr);

    if (!age || age < 1 || age > 130) { showError("Please enter a valid age 1–130"); return; }
    if (!dob) { showError("Error enter your Birthdate pls"); return; }

    fillScene(age, dobStr);
    goToScene();
    drawCharacterForAge(chCtx, age);
    ding();

    await saveProgress(age, dobStr);
  });

  backBtn.addEventListener("click", () => backToWelcome());

  /* ========= Initial preview ========= */
  drawCharacterForAge(chCtx, 18);
});
