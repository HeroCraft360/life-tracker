document.addEventListener("DOMContentLoaded", () => {
  /* ========= DOM ========= */
  const welcome = document.getElementById("welcome");
  const scene = document.getElementById("scene");

  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");

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

  /* ========= SCREEN HELPERS ========= */
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function goToScene() {
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

  /* ========= ERRORS ========= */
  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.classList.remove("hidden");
  }
  function hideError() {
    errorMsg.classList.add("hidden");
  }

  /* ========= DOB + AGE LOGIC ========= */
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

  function calcAgeFromDOB(dob, now = new Date()) {
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
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

  /* ========= RESIZE CANVASES (FULL SCREEN) ========= */
  function resizeCanvases() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;

    bgCanvas.width = Math.round(w * dpr);
    bgCanvas.height = Math.round(h * dpr);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    charCanvas.width = Math.round(w * dpr);
    charCanvas.height = Math.round(h * dpr);
    chCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvases();
  window.addEventListener("resize", resizeCanvases);

  /* ========= BACKGROUND: MOVING CLOUDS (SMOOTH) ========= */
  const clouds = [];
  function makeClouds() {
    clouds.length = 0;
    const count = 26;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: 40 + Math.random() * (window.innerHeight * 0.35),
        s: 0.6 + Math.random() * 1.4,
        speed: 12 + Math.random() * 28,
        a: 0.55 + Math.random() * 0.35
      });
    }
  }
  makeClouds();

  function drawPuffyCloud(ctx, c) {
    ctx.save();
    ctx.globalAlpha = c.a;
    ctx.fillStyle = "rgba(255,255,255,0.98)";

    const x = c.x;
    const y = c.y;
    const s = c.s;

    ctx.beginPath();
    ctx.arc(x + 0 * 34 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y + 0 * s, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 44 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 24 * s, y + 14 * s, 24 * s, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // a bit more visible tint
    ctx.globalAlpha = c.a * 0.22;
    ctx.fillStyle = "rgba(120,170,200,1)";
    ctx.beginPath();
    ctx.arc(x + 18 * s, y + 12 * s, 22 * s, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  let lastBgT = 0;
  function animateBg(t) {
    const now = t || 0;
    const dt = Math.min(0.05, (now - lastBgT) / 1000 || 0.016);
    lastBgT = now;

    const g = bgCtx.createLinearGradient(0, 0, 0, window.innerHeight);
    g.addColorStop(0, "#cfeeff");
    g.addColorStop(1, "#f7fdff");
    bgCtx.fillStyle = g;
    bgCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (const c of clouds) {
      c.x += c.speed * dt;
      if (c.x > window.innerWidth + 140) c.x = -160;
      drawPuffyCloud(bgCtx, c);
    }

    requestAnimationFrame(animateBg);
  }
  requestAnimationFrame(animateBg);

  /* ========= AVATAR ========= */
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const avatar = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.74,
    vx: 0,
    vy: 0,
    r: 46,
    groundY() { return window.innerHeight * 0.78; }
  };

  function playTap() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = 740;
      o.connect(g);
      g.connect(ac.destination);
      const now = ac.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      o.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      o.start(now);
      o.stop(now + 0.24);
    } catch {}
  }

  function impulseJump() {
    avatar.vy -= 520; // spam-click stacks (as requested)
  }

  window.addEventListener("pointerdown", () => {
    impulseJump();
  });

  /* ========= BLINKING (human-ish) ========= */
  const blink = {
    timer: 0,
    next: 2.8 + Math.random() * 3.2, // 2.8–6.0 seconds
    phase: 0, // 0 = not blinking, otherwise 0..1..0
    dur: 0.14 // seconds for a full blink
  };

  function updateBlink(dt) {
    if (blink.phase > 0) {
      blink.phase += dt / blink.dur;
      if (blink.phase >= 2) {
        blink.phase = 0;
        blink.timer = 0;
        blink.next = 2.8 + Math.random() * 3.2;
      }
      return;
    }

    blink.timer += dt;
    if (blink.timer >= blink.next) {
      blink.phase = 0.0001; // start blink
    }
  }

  function blinkAmount() {
    if (blink.phase === 0) return 0;
    // phase goes 0..2 where 1 is fully closed
    const p = blink.phase <= 1 ? blink.phase : (2 - blink.phase);
    // smooth close/open
    return Math.sin(Math.PI * p); // 0 -> 1 -> 0
  }

  function drawAvatar(ctx) {
    const x = avatar.x, y = avatar.y;
    const scale = Math.max(0.8, Math.min(1.25, window.innerWidth / 1200));
    const R = avatar.r * scale;

    const body = "#63B5FF";
    const bodyShade = "rgba(0,0,0,0.06)";
    const face = "#FFFFFF";
    const cheek = "rgba(255,140,170,0.55)";
    const eye = "#151515";
    const eyeShine = "rgba(255,255,255,0.75)";

    // shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, avatar.groundY() + R * 0.35, R * 0.85, R * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(x, y, R * 1.05, R * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // body shade
    ctx.fillStyle = bodyShade;
    ctx.beginPath();
    ctx.ellipse(x + R * 0.15, y + R * 0.25, R * 0.85, R * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    /**
     * ✅ REMOVE THE "BLUE CIRCLE / RING"
     * Make the face slightly bigger and drawn on top so it covers any blue border.
     */
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(x, y - R * 0.12, R * 0.70, R * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    // cheeks FIRST
    ctx.fillStyle = cheek;
    ctx.beginPath();
    ctx.ellipse(x - R * 0.34, y + R * 0.10, R * 0.20, R * 0.13, 0, 0, Math.PI * 2);
    ctx.ellipse(x + R * 0.34, y + R * 0.10, R * 0.20, R * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes follow mouse (clamped)
    const dx = mouse.x - x;
    const dy = mouse.y - (y - R * 0.10);
    const len = Math.hypot(dx, dy) || 1;
    const ox = (dx / len) * Math.min(R * 0.08, len * 0.02);
    const oy = (dy / len) * Math.min(R * 0.08, len * 0.02);

    // blinking scale
    const b = blinkAmount();              // 0..1..0
    const eyeScaleY = 1 - 0.92 * b;       // squish almost to 0
    const eyeH = R * 0.42 * eyeScaleY;
    const eyeW = R * 0.16;

    // keep eyes centered while shrinking
    const eyeY = (y - R * 0.10 + oy) + (R * 0.42 - eyeH) * 0.5;

    // eyes ON TOP of cheeks
    ctx.fillStyle = eye;

    // left eye
    ctx.beginPath();
    ctx.roundRect(
      x - R * 0.18 + ox,
      eyeY,
      eyeW,
      Math.max(2, eyeH),
      R * 0.08
    );
    ctx.fill();

    // right eye
    ctx.beginPath();
    ctx.roundRect(
      x + R * 0.02 + ox,
      eyeY,
      eyeW,
      Math.max(2, eyeH),
      R * 0.08
    );
    ctx.fill();

    // eye shine (only if not fully closed)
    if (eyeH > 6) {
      ctx.fillStyle = eyeShine;
      ctx.beginPath();
      ctx.roundRect(x - R * 0.13 + ox, eyeY + R * 0.05, R * 0.05, R * 0.12 * eyeScaleY, R * 0.03);
      ctx.roundRect(x + R * 0.07 + ox, eyeY + R * 0.05, R * 0.05, R * 0.12 * eyeScaleY, R * 0.03);
      ctx.fill();
    }

    // feet blobs
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.ellipse(x - R * 0.28, y + R * 0.60, R * 0.30, R * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + R * 0.28, y + R * 0.60, R * 0.30, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  let lastChT = 0;
  function animateAvatar(t) {
    const now = t || 0;
    const dt = Math.min(0.05, (now - lastChT) / 1000 || 0.016);
    lastChT = now;

    updateBlink(dt);

    avatar.x = Math.max(80, Math.min(window.innerWidth - 80, avatar.x));

    // physics
    const g = 1800;
    avatar.vy += g * dt;
    avatar.y += avatar.vy * dt;

    const floor = avatar.groundY();
    if (avatar.y > floor) {
      avatar.y = floor;

      if (avatar.vy > 220) playTap();

      avatar.vy = -avatar.vy * 0.32;
      if (Math.abs(avatar.vy) < 40) avatar.vy = 0;
    }

    chCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawAvatar(chCtx);

    requestAnimationFrame(animateAvatar);
  }
  requestAnimationFrame(animateAvatar);

  /* ========= BUTTONS ========= */
  startBtn.addEventListener("click", () => {
    hideError();

    const age = parseInt(ageInput.value, 10);
    const dobStr = (bdayInput.value || "").trim();
    const dob = parseDOB(dobStr);

    if (!age || age < 1 || age > 130) {
      showError("Please enter a valid age 1–130");
      return;
    }
    if (!dob) {
      showError("Error enter your Birthdate pls");
      return;
    }

    const calcAge = calcAgeFromDOB(dob);
    if (Math.abs(calcAge - age) >= 2) {
      showError("That doesnt make sense stop lying");
      return;
    }

    fillScene(age, dobStr);
    goToScene();
  });

  backBtn.addEventListener("click", () => {
    backToWelcome();
  });

  // Enter key submits on welcome
  [ageInput, bdayInput].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startBtn.click();
    });
  });
});
