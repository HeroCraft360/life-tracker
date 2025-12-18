// Life Tracker — Smooth screens + validation + countdown + clouds + "bean" avatar (eyes follow mouse + click jump)
document.addEventListener("DOMContentLoaded", () => {
  /* ============ DOM HOOKS ============ */
  const screens = {
    welcome: document.getElementById("welcome"),
    scene: document.getElementById("scene"),
  };

  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");

  const ageInput = document.getElementById("ageInput");
  const bdayInput = document.getElementById("bdayInput");
  const errorMsg = document.getElementById("errorMsg");

  const ageBadge = document.getElementById("ageBadge");
  const ageLabel = document.getElementById("ageLabel");   // "Age: —"
  const bdayLabel = document.getElementById("bdayLabel"); // "Birthdate: —"
  const daysLeftEl = document.getElementById("daysLeft");

  const bgCanvas = document.getElementById("bgCanvas");
  const bgCtx = bgCanvas.getContext("2d");

  const charCanvas = document.getElementById("characterCanvas");
  const chCtx = charCanvas.getContext("2d");

  /* ============ SCREEN TRANSITIONS ============ */
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function goToScene() {
    const welcome = screens.welcome, scene = screens.scene;

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
    const welcome = screens.welcome, scene = screens.scene;

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

  /* ============ VALIDATION + DATE HELPERS ============ */
  const DOB_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/; // MM/DD/YYYY

  function parseDOB(str) {
    if (!str) return null;
    const m = DOB_REGEX.exec(str.trim());
    if (!m) return null;
    const mm = parseInt(m[1], 10);
    const dd = parseInt(m[2], 10);
    const yyyy = parseInt(m[3], 10);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== (mm - 1) || d.getDate() !== dd) return null;
    return d;
  }

  function daysUntilNextBirthday(dob, now = new Date()) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const m = dob.getMonth();
    const d = dob.getDate();
    let next = new Date(today.getFullYear(), m, d);
    if (next < today) next = new Date(today.getFullYear() + 1, m, d);
    const MS = 24 * 60 * 60 * 1000;
    return Math.ceil((next - today) / MS);
  }

  // Computes "real" age from DOB based on today's date
  function ageFromDOB(dob, now = new Date()) {
    let age = now.getFullYear() - dob.getFullYear();
    const thisYearsBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (now < thisYearsBirthday) age -= 1;
    return age;
  }

  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.classList.remove("hidden");
  }
  function hideError() {
    errorMsg.classList.add("hidden");
  }

  /* ============ SCENE LABEL HELPERS ============ */
  function fillScene(age, dobStr) {
    ageBadge.textContent = `Age — ${age}`;
    if (ageLabel) ageLabel.textContent = `Age: ${age}`;
    if (bdayLabel) bdayLabel.textContent = `Birthdate: ${dobStr}`;
    const dob = parseDOB(dobStr);
    if (dob && daysLeftEl) daysLeftEl.textContent = String(daysUntilNextBirthday(dob));
  }

  /* ============ SKY: PASTEL CLOUDS ============ */
  function sizeBgToCSSPixels() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = bgCanvas.getBoundingClientRect();
    bgCanvas.width = Math.round(rect.width * dpr);
    bgCanvas.height = Math.round(rect.height * dpr);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeBgToCSSPixels();
  window.addEventListener("resize", sizeBgToCSSPixels);

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

  /* ============================================================
     "BEAN" AVATAR (Fall-Guys-ish vibe) + Mouse eyes + Click jump
     ============================================================ */

  // HiDPI for character canvas
  function sizeCharToCSSPixels() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = charCanvas.getBoundingClientRect();
    // if CSS not set, fallback to attribute
    const cssW = rect.width || charCanvas.width;
    const cssH = rect.height || charCanvas.height;

    charCanvas.width = Math.round(cssW * dpr);
    charCanvas.height = Math.round(cssH * dpr);
    chCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCharToCSSPixels();
  window.addEventListener("resize", sizeCharToCSSPixels);

  const avatar = {
    age: 18,
    // mouse tracking
    mouseX: null,
    mouseY: null,
    // jump physics
    y: 0,
    vy: 0,
    // idle bob
    t: 0,
    // eye target offset
    eyeOX: 0,
    eyeOY: 0,
    eyeTX: 0,
    eyeTY: 0,
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function beanPaletteByAge(age) {
    const group = age <= 12 ? "child" : age <= 19 ? "teen" : age <= 59 ? "adult" : "elder";
    // suit + accents
    if (group === "child") return { suit: "#ff7aa2", shade: "#e65f8a", accent: "#ffffff" };
    if (group === "teen") return { suit: "#7bd7c9", shade: "#5cc2b3", accent: "#ffffff" };
    if (group === "adult") return { suit: "#7ec8ff", shade: "#5aaeea", accent: "#ffffff" };
    return { suit: "#c9c9c9", shade: "#aeb1b6", accent: "#ffffff" };
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function renderBean() {
    const ctx = chCtx;
    const W = charCanvas.getBoundingClientRect().width || 240;
    const H = charCanvas.getBoundingClientRect().height || 240;

    ctx.clearRect(0, 0, W, H);

    // layout
    const cx = W / 2;
    const groundY = H * 0.86;

    // physics update
    avatar.t += 0.03;

    // gravity + floor
    avatar.vy += 0.55;
    avatar.y += avatar.vy;
    if (avatar.y > 0) {
      avatar.y = 0;
      avatar.vy *= -0.12; // tiny settle bounce
      if (Math.abs(avatar.vy) < 0.2) avatar.vy = 0;
    }

    // idle bob (only when not jumping much)
    const idleBob = (Math.abs(avatar.vy) < 0.25) ? Math.sin(avatar.t) * 2.5 : 0;

    const yOffset = idleBob + avatar.y; // avatar.y is negative when jumping

    // size by age (subtle)
    const sizeMul = avatar.age <= 12 ? 0.92 : avatar.age >= 60 ? 1.04 : 1.0;

    const bodyW = 118 * sizeMul;
    const bodyH = 150 * sizeMul;

    const bodyX = cx - bodyW / 2;
    const bodyY = groundY - bodyH + yOffset;

    const { suit, shade } = beanPaletteByAge(avatar.age);

    // shadow
    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = "#000";
    drawRoundedRect(ctx, cx - bodyW * 0.36, groundY - 12, bodyW * 0.72, 18, 10);
    ctx.fill();
    ctx.restore();

    // body gradient (fake 3D)
    const grad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
    grad.addColorStop(0.0, shade);
    grad.addColorStop(0.35, suit);
    grad.addColorStop(1.0, shade);

    ctx.fillStyle = grad;
    drawRoundedRect(ctx, bodyX, bodyY, bodyW, bodyH, bodyW * 0.48);
    ctx.fill();

    // soft highlight
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#fff";
    drawRoundedRect(ctx, bodyX + bodyW * 0.16, bodyY + bodyH * 0.16, bodyW * 0.22, bodyH * 0.58, bodyW * 0.22);
    ctx.fill();
    ctx.restore();

    // arms (simple blobs)
    ctx.save();
    ctx.fillStyle = shade;
    drawRoundedRect(ctx, bodyX - bodyW * 0.20, bodyY + bodyH * 0.36, bodyW * 0.32, bodyH * 0.34, 26);
    ctx.fill();
    drawRoundedRect(ctx, bodyX + bodyW * 0.88, bodyY + bodyH * 0.36, bodyW * 0.32, bodyH * 0.34, 26);
    ctx.fill();
    ctx.restore();

    // feet
    ctx.fillStyle = shade;
    drawRoundedRect(ctx, cx - bodyW * 0.30, groundY - 28 + yOffset, bodyW * 0.26, 26, 12);
    ctx.fill();
    drawRoundedRect(ctx, cx + bodyW * 0.04, groundY - 28 + yOffset, bodyW * 0.26, 26, 12);
    ctx.fill();

    // face window
    const faceW = bodyW * 0.58;
    const faceH = bodyH * 0.40;
    const faceX = cx - faceW / 2;
    const faceY = bodyY + bodyH * 0.12;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, faceX, faceY, faceW, faceH, 26);
    ctx.fill();

    // Compute eye tracking (toward mouse)
    const faceCX = cx;
    const faceCY = faceY + faceH * 0.52;

    if (avatar.mouseX != null && avatar.mouseY != null) {
      const dx = avatar.mouseX - faceCX;
      const dy = avatar.mouseY - faceCY;
      const len = Math.hypot(dx, dy) || 1;
      // eye offset target (small)
      avatar.eyeTX = clamp((dx / len) * 6, -6, 6);
      avatar.eyeTY = clamp((dy / len) * 4, -4, 4);
    } else {
      avatar.eyeTX = 0;
      avatar.eyeTY = 0;
    }

    // smooth follow
    avatar.eyeOX += (avatar.eyeTX - avatar.eyeOX) * 0.12;
    avatar.eyeOY += (avatar.eyeTY - avatar.eyeOY) * 0.12;

    // eyes
    const eyeGap = faceW * 0.18;
    const eyeW = faceW * 0.12;
    const eyeH = faceH * 0.28;

    function drawEye(ex) {
      ctx.fillStyle = "#111";
      drawRoundedRect(
        ctx,
        ex - eyeW / 2 + avatar.eyeOX,
        faceCY - eyeH / 2 + avatar.eyeOY,
        eyeW,
        eyeH,
        eyeW / 2
      );
      ctx.fill();

      // tiny highlight
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#fff";
      drawRoundedRect(
        ctx,
        ex - eyeW * 0.18 + avatar.eyeOX,
        faceCY - eyeH * 0.18 + avatar.eyeOY,
        eyeW * 0.22,
        eyeH * 0.18,
        3
      );
      ctx.fill();
      ctx.restore();
    }

    drawEye(faceCX - eyeGap);
    drawEye(faceCX + eyeGap);

    requestAnimationFrame(renderBean);
  }

  // Start animation loop once
  requestAnimationFrame(renderBean);

  // Mouse tracking over the whole stage (including canvas)
  function setMouseFromEvent(e) {
    const rect = charCanvas.getBoundingClientRect();
    avatar.mouseX = (e.clientX - rect.left) * (rect.width ? (rect.width / rect.width) : 1);
    avatar.mouseY = (e.clientY - rect.top) * (rect.height ? (rect.height / rect.height) : 1);
    // NOTE: Since we render in CSS pixels (transform), we can use rect-relative pixels directly.
    // If your canvas CSS size changes drastically, this still tracks fine visually.
  }

  charCanvas.addEventListener("mousemove", (e) => setMouseFromEvent(e));
  charCanvas.addEventListener("mouseleave", () => {
    avatar.mouseX = null;
    avatar.mouseY = null;
  });

  // Click → jump + sound
  function boing() {
    try {
      const AC = new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = "sine";
      o.connect(g);
      g.connect(AC.destination);

      const now = AC.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.14, now + 0.01);
      o.frequency.setValueAtTime(260, now);
      o.frequency.exponentialRampToValueAtTime(520, now + 0.08);
      o.frequency.exponentialRampToValueAtTime(220, now + 0.20);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

      o.start(now);
      o.stop(now + 0.28);
    } catch {}
  }

  charCanvas.addEventListener("click", () => {
    // impulse upward (negative y is up)
    avatar.vy = -9.5;
    boing();
  });

  // Change current age used by avatar look
  function setAvatarAge(age) {
    avatar.age = Number(age) || 18;
  }

  /* ============ BUTTON EVENTS ============ */
  startBtn.addEventListener("click", () => {
    hideError();

    const age = parseInt(ageInput.value, 10);
    const dobStr = (bdayInput?.value || "").trim();
    const dob = parseDOB(dobStr);

    if (!age || age < 1 || age > 130) {
      showError("Please enter a valid age 1–130");
      return;
    }
    if (!dob) {
      showError("Error enter your Birthdate pls");
      return;
    }

    // If DOB is in the future -> invalid
    const now = new Date();
    if (dob > now) {
      showError("That doesn't make sense stop lying");
      return;
    }

    // "Stop lying" check: age must match DOB age (allow 1 year wiggle for timezone / rounding)
    const realAge = ageFromDOB(dob, now);
    if (Math.abs(realAge - age) > 1) {
      showError("That doesn't make sense stop lying");
      return;
    }

    fillScene(age, dobStr);
    setAvatarAge(age);
    goToScene();
  });

  backBtn.addEventListener("click", () => {
    backToWelcome();
    // optional: keep avatar age preview in welcome if you want
  });

  // Initial preview age
  setAvatarAge(18);
});
