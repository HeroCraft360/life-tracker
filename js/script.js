// Life Tracker — age + DOB validation, countdown, clouds, pixel avatar, local save/load
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
  const ageLabel = document.getElementById("ageLabel");
  const bdayLabel = document.getElementById("bdayLabel");
  const daysLeftEl = document.getElementById("daysLeft");

  const bgCanvas = document.getElementById("bgCanvas");
  const bgCtx = bgCanvas.getContext("2d");
  const charCanvas = document.getElementById("characterCanvas");
  const chCtx = charCanvas.getContext("2d");

  /* ============ PERSISTENCE (guest/local) ============ */
  const STORAGE_KEY = "lifeTracker:v1";
  function saveState(age, dobStr) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ age: Number(age), dob: dobStr, savedAt: Date.now() })
      );
    } catch {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

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

  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.classList.remove("hidden");
  }
  function hideError() {
    errorMsg.classList.add("hidden");
  }

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

  // "real age" in years given DOB and "today"
  function computeAgeFromDOB(dob, now = new Date()) {
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
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

  // Checks if entered age is compatible with DOB.
  // Allow ±1 year because birthday might not have happened yet this year.
  function ageDobMakesSense(enteredAge, dob) {
    const now = new Date();
    const dobMidnight = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dobMidnight > todayMidnight) return false; // born in the future

    const computed = computeAgeFromDOB(dob, now);
    const diff = Math.abs(computed - enteredAge);

    return diff <= 1; // tolerance
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

  /* ============ PIXEL AVATAR (16x16 grid) ============ */
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

    // elder extras
    if (group === "elder") {
      [[6,2],[9,2]].forEach(([x,y]) => drawBlock(ctx, x, y, "#6b6b6b", scale));
      [[13,11],[13,12]].forEach(([x,y]) => drawBlock(ctx, x, y, "#6b5b4b", scale));
    }

    ctx.restore();

    // bob once
    if (!drawCharacterForAge._bob) {
      let t = 0;
      function bob() {
        t += 0.04;
        charCanvas.style.transform = `translateY(${Math.sin(t) * 2}px)`;
        requestAnimationFrame(bob);
      }
      drawCharacterForAge._bob = true;
      requestAnimationFrame(bob);
    }
  }

  /* ============ SCENE LABEL HELPERS ============ */
  function fillScene(age, dobStr) {
    ageBadge.textContent = `Age — ${age}`;
    ageLabel.textContent = `Age: ${age}`;
    bdayLabel.textContent = `Birthdate: ${dobStr}`;
    const dob = parseDOB(dobStr);
    if (dob) daysLeftEl.textContent = String(daysUntilNextBirthday(dob));
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

    // New logic: age + DOB must match reality-ish
    if (!ageDobMakesSense(age, dob)) {
      showError("That doesn’t make sense stop lying");
      return;
    }

    fillScene(age, dobStr);
    goToScene();
    drawCharacterForAge(chCtx, age);
    saveState(age, dobStr);
  });

  backBtn.addEventListener("click", () => {
    backToWelcome();
  });

  /* ============ AUTO-LOAD (Resume) ============ */
  const saved = loadState();
  if (saved && typeof saved.age === "number" && saved.dob) {
    ageInput.value = saved.age;
    bdayInput.value = saved.dob;
  }

  /* ============ INITIAL PREVIEW ============ */
  drawCharacterForAge(chCtx, 18);
});
