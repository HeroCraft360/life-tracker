document.addEventListener("DOMContentLoaded", () => {
  /* ========= DOM ========= */
  const welcome = document.getElementById("welcome");
  const scene = document.getElementById("scene");
  const sceneContent = document.querySelector(".scene-content");
  const profileForm = document.getElementById("profileForm");
  const statusBadge = document.getElementById("statusBadge");
  const sceneStatusBadge = document.getElementById("sceneStatusBadge");

  const startBtn = document.getElementById("startBtn");
  const clearBtn = document.getElementById("clearBtn");
  const backBtn = document.getElementById("backBtn");

  const bdayInput = document.getElementById("bdayInput");
  const errorMsg = document.getElementById("errorMsg");

  const ageBadge = document.getElementById("ageBadge");
  const ageLabel = document.getElementById("ageLabel");
  const bdayLabel = document.getElementById("bdayLabel");
  const daysLeftEl = document.getElementById("daysLeft");
  const dayWordEl = document.getElementById("dayWord");
  const countdownMessage = document.getElementById("countdownMessage");

  const nextBirthdayAge = document.getElementById("nextBirthdayAge");
  const statsGrid = document.getElementById("statsGrid");
  const milestoneSummary = document.getElementById("milestoneSummary");
  const milestoneList = document.getElementById("milestoneList");
  const progressSummary = document.getElementById("progressSummary");
  const yearGrid = document.getElementById("yearGrid");
  const lifeGrid = document.getElementById("lifeGrid");
  const progressButtons = document.querySelectorAll("[data-progress-mode]");

  const moodDate = document.getElementById("moodDate");
  const moodChoices = document.getElementById("moodChoices");
  const moodNote = document.getElementById("moodNote");
  const saveMoodBtn = document.getElementById("saveMoodBtn");
  const recentMoods = document.getElementById("recentMoods");

  const avatarColorChoices = document.getElementById("avatarColorChoices");
  const cheekColorChoices = document.getElementById("cheekColorChoices");
  const avatarSizeInput = document.getElementById("avatarSizeInput");
  const avatarSizeValue = document.getElementById("avatarSizeValue");
  const accessorySelect = document.getElementById("accessorySelect");
  const themeSelect = document.getElementById("themeSelect");
  const themeSummary = document.getElementById("themeSummary");

  const noCloudsToggle = document.getElementById("noCloudsToggle");
  const muteToggle = document.getElementById("muteToggle");
  const dataSummary = document.getElementById("dataSummary");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  const settingsMessage = document.getElementById("settingsMessage");

  const collectibleLayer = document.getElementById("collectibleLayer");
  const questToggle = document.getElementById("questToggle");
  const questTracker = document.getElementById("questTracker");
  const portalToggle = document.getElementById("portalToggle");
  const portalDock = document.getElementById("portalDock");
  const achievementToast = document.getElementById("achievementToast");

  const bgCanvas = document.getElementById("bgCanvas");
  const bgCtx = bgCanvas.getContext("2d");

  const fxCanvas = document.getElementById("fxCanvas");
  const fxCtx = fxCanvas.getContext("2d");

  const charCanvas = document.getElementById("characterCanvas");
  const chCtx = charCanvas.getContext("2d");

  /* ========= CONSTANTS ========= */
  const STORAGE_KEY = "lifeTrackerDataV2";
  const LEGACY_BIRTHDATE_KEY = "lifeTrackerBirthdate";
  const MAX_AGE = 130;
  const LIFE_EXPECTANCY_YEARS = 90;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const BODY_COLORS = ["#63b5ff", "#78c9be", "#f1b47c", "#ef8ea5", "#9e94d9", "#8dcf8d"];
  const CHEEK_COLORS = ["#ff8caa", "#f1b47c", "#e6a1d4", "#f4c86a", "#92c7ff", "#b6d889"];
  const MOODS = ["Great", "Good", "Okay", "Low", "Focused"];
  const MILESTONE_AGES = [10, 13, 16, 18, 21, 25, 30, 40, 50, 65, 75, 90];
  const EYE_ACCESORY_TYPES = ["glasses", "visor"];
  const PLATFORM_SELECTOR = [
    ".panel",
    ".metric",
    ".milestone-item",
    ".recent-item",
    ".mood-btn",
    ".secondary-btn",
    ".toggle",
    ".countdown-box",
    ".age-label"
  ].join(",");
  const PORTALS = [
    { id: "stats", label: "Stats", selector: ".stats-panel" },
    { id: "milestones", label: "Milestones", selector: ".milestones-panel" },
    { id: "progress", label: "Progress", selector: ".progress-panel" },
    { id: "today", label: "Today", selector: ".mood-panel" },
    { id: "avatar", label: "Avatar", selector: ".customize-panel" },
    { id: "settings", label: "Settings", selector: ".settings-panel" }
  ];
  const ACHIEVEMENTS = [
    { id: "first-step", name: "First Landing", desc: "Discover one dashboard panel." },
    { id: "collector", name: "Pocket Star", desc: "Collect your first coin." },
    { id: "treasure-run", name: "Treasure Run", desc: "Collect every daily coin." },
    { id: "daily-note", name: "Tiny Journal", desc: "Save a mood check-in." },
    { id: "explorer", name: "Panel Explorer", desc: "Discover all dashboard panels." }
  ];

  const DEFAULT_DATA = {
    version: 2,
    profile: {
      birthdate: "",
      avatarColor: BODY_COLORS[0],
      cheekColor: CHEEK_COLORS[0],
      avatarSize: 18,
      accessory: "none",
      theme: "auto",
      noClouds: false,
      muted: false,
      progressMode: "year"
    },
    moods: [],
    game: {
      coins: 0,
      joy: 62,
      energy: 72,
      collectibleDate: "",
      collected: [],
      discoveredPanels: [],
      achievements: []
    }
  };

  const THEME_PALETTES = {
    day: {
      skyTop: "#cfeeff",
      skyBottom: "#f7fdff",
      hill: "#b8e0bb",
      hillDark: "#91caa5",
      cloud: "rgba(255, 255, 255, 0.98)",
      cloudShade: "rgba(120, 170, 200, 0.24)",
      star: null
    },
    dusk: {
      skyTop: "#ffd6a2",
      skyBottom: "#f5e9ff",
      hill: "#e8c58d",
      hillDark: "#d99aa0",
      cloud: "rgba(255, 247, 229, 0.95)",
      cloudShade: "rgba(197, 116, 158, 0.22)",
      star: null
    },
    night: {
      skyTop: "#142339",
      skyBottom: "#273a5a",
      hill: "#33516b",
      hillDark: "#24384c",
      cloud: "rgba(217, 234, 245, 0.62)",
      cloudShade: "rgba(130, 160, 205, 0.26)",
      star: "#f6e7a6"
    },
    meadow: {
      skyTop: "#c9f0d2",
      skyBottom: "#f8ffe9",
      hill: "#a8d98e",
      hillDark: "#78b986",
      cloud: "rgba(255, 255, 255, 0.96)",
      cloudShade: "rgba(107, 183, 200, 0.2)",
      star: null
    },
    winter: {
      skyTop: "#d8f4ff",
      skyBottom: "#ffffff",
      hill: "#d8edf4",
      hillDark: "#b7d4df",
      cloud: "rgba(255, 255, 255, 0.98)",
      cloudShade: "rgba(140, 180, 205, 0.16)",
      star: null
    },
    aurora: {
      skyTop: "#12233f",
      skyBottom: "#25456b",
      hill: "#315a70",
      hillDark: "#22394d",
      cloud: "rgba(204, 240, 245, 0.7)",
      cloudShade: "rgba(109, 214, 188, 0.22)",
      star: "#d9fff3"
    },
    candy: {
      skyTop: "#ffd3ea",
      skyBottom: "#d7f7ff",
      hill: "#b7e7d9",
      hillDark: "#f0aeca",
      cloud: "rgba(255, 255, 255, 0.96)",
      cloudShade: "rgba(239, 142, 165, 0.2)",
      star: null
    },
    storm: {
      skyTop: "#243044",
      skyBottom: "#5d7184",
      hill: "#617f86",
      hillDark: "#364a59",
      cloud: "rgba(206, 219, 228, 0.78)",
      cloudShade: "rgba(88, 108, 130, 0.34)",
      star: "#f7df7d"
    },
    space: {
      skyTop: "#0b1430",
      skyBottom: "#241d4b",
      hill: "#2e3c68",
      hillDark: "#161f3d",
      cloud: "rgba(181, 200, 238, 0.54)",
      cloudShade: "rgba(123, 108, 202, 0.22)",
      star: "#fff4b8"
    },
    sunrise: {
      skyTop: "#ffbc8b",
      skyBottom: "#fff1c4",
      hill: "#d7c985",
      hillDark: "#f08d86",
      cloud: "rgba(255, 246, 222, 0.94)",
      cloudShade: "rgba(238, 145, 104, 0.2)",
      star: null
    },
    birthday: {
      skyTop: "#ffe6a6",
      skyBottom: "#e8fbff",
      hill: "#b7e2a5",
      hillDark: "#f0b0bd",
      cloud: "rgba(255, 255, 255, 0.98)",
      cloudShade: "rgba(239, 142, 165, 0.2)",
      star: null
    }
  };

  /* ========= STATE ========= */
  let appData = loadData();
  let selectedMood = "";
  let activeDob = parseBirthdate(appData.profile.birthdate);
  let currentTheme = "day";
  let isBirthdayMode = false;
  let settingsTimer = 0;

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const clouds = [];
  const confetti = [];
  const stars = [];
  const avatar = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    vx: 0,
    vy: 0,
    r: 18,
    facing: 1,
    onGround: false,
    platform: null,
    dropUntil: 0
  };
  const keys = {
    left: false,
    right: false,
    down: false,
    jumpQueued: false
  };

  let bgFrameId = 0;
  let charFrameId = 0;
  let lastBgT = 0;
  let lastChT = 0;
  let audioContext = null;
  let soundReady = false;

  /* ========= DATA ========= */
  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function normalizeData(raw) {
    const data = cloneDefaults();

    if (!raw || typeof raw !== "object") return data;

    if (raw.profile && typeof raw.profile === "object") {
      data.profile = { ...data.profile, ...raw.profile };
    }

    if (typeof raw.birthdate === "string") {
      data.profile.birthdate = raw.birthdate;
    }

    if (Array.isArray(raw.moods)) {
      data.moods = raw.moods
        .filter((entry) => entry && typeof entry.date === "string" && typeof entry.mood === "string")
        .map((entry) => ({
          date: entry.date,
          mood: entry.mood,
          note: typeof entry.note === "string" ? entry.note.slice(0, 90) : "",
          createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString()
        }))
        .slice(0, 400);
    }

    if (raw.game && typeof raw.game === "object") {
      data.game = { ...data.game, ...raw.game };
    }

    if (!BODY_COLORS.includes(data.profile.avatarColor)) data.profile.avatarColor = BODY_COLORS[0];
    if (!CHEEK_COLORS.includes(data.profile.cheekColor)) data.profile.cheekColor = CHEEK_COLORS[0];
    data.profile.avatarSize = Math.max(10, Math.min(50, Number(data.profile.avatarSize) || 18));
    if (![
      "none",
      "crown",
      "cap",
      "bow",
      "halo",
      "horns",
      "headphones",
      "earpods",
      "bonnet",
      "flower",
      "star",
      "scarf",
      "antenna",
      "beret",
      "party"
    ].includes(data.profile.accessory)) data.profile.accessory = "none";
    if (![
      "auto",
      "day",
      "dusk",
      "night",
      "meadow",
      "winter",
      "aurora",
      "candy",
      "storm",
      "space",
      "sunrise"
    ].includes(data.profile.theme)) data.profile.theme = "auto";
    if (!["year", "life"].includes(data.profile.progressMode)) data.profile.progressMode = "year";

    data.profile.noClouds = Boolean(data.profile.noClouds);
    data.profile.muted = Boolean(data.profile.muted);
    data.game.coins = Math.max(0, Math.floor(Number(data.game.coins) || 0));
    data.game.joy = Math.max(0, Math.min(100, Number(data.game.joy) || 62));
    data.game.energy = Math.max(0, Math.min(100, Number(data.game.energy) || 72));
    data.game.collectibleDate = typeof data.game.collectibleDate === "string" ? data.game.collectibleDate : "";
    data.game.collected = Array.isArray(data.game.collected) ? [...new Set(data.game.collected.filter(Boolean))] : [];
    data.game.discoveredPanels = Array.isArray(data.game.discoveredPanels) ? [...new Set(data.game.discoveredPanels.filter(Boolean))] : [];
    data.game.achievements = Array.isArray(data.game.achievements) ? [...new Set(data.game.achievements.filter(Boolean))] : [];
    data.version = 2;

    return data;
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeData(JSON.parse(saved));
    } catch {
      return cloneDefaults();
    }

    const migrated = cloneDefaults();
    const legacyBirthdate = localStorage.getItem(LEGACY_BIRTHDATE_KEY);
    if (legacyBirthdate) migrated.profile.birthdate = legacyBirthdate;
    return migrated;
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    localStorage.removeItem(LEGACY_BIRTHDATE_KEY);
    renderStatus();
  }

  /* ========= SCREEN HELPERS ========= */
  function show(el) {
    el.classList.remove("hidden");
  }

  function hide(el) {
    el.classList.add("hidden");
  }

  function resetSceneStartPosition() {
    sceneContent.scrollTop = 0;
    placeAvatarOnStartPlatform();
  }

  function goToScene() {
    scene.classList.add("is-entering");
    show(scene);
    renderDashboard();
    resizeCanvases();
    resetSceneStartPosition();
    startAnimations();
    setTimeout(resetSceneStartPosition, 60);

    welcome.classList.add("is-leaving");
    setTimeout(() => {
      hide(welcome);
      welcome.classList.remove("is-leaving");
      resetSceneStartPosition();

      scene.classList.add("is-active");
      setTimeout(() => {
        scene.classList.remove("is-entering", "is-active");
      }, 20);
    }, 450);
  }

  function backToWelcome() {
    welcome.classList.add("is-entering");
    show(welcome);

    scene.classList.add("is-leaving");
    setTimeout(() => {
      hide(scene);
      stopAnimations();
      scene.classList.remove("is-leaving");

      welcome.classList.add("is-active");
      setTimeout(() => {
        welcome.classList.remove("is-entering", "is-active");
      }, 20);
    }, 450);
  }

  /* ========= ERRORS + MESSAGES ========= */
  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.classList.remove("hidden");
  }

  function hideError() {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }

  function showSettingsMessage(text) {
    window.clearTimeout(settingsTimer);
    settingsMessage.textContent = text;
    settingsTimer = window.setTimeout(() => {
      settingsMessage.textContent = "";
    }, 2600);
  }

  /* ========= DATE + AGE LOGIC ========= */
  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function toInputDateValue(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function makeLocalDate(year, monthIndex, day) {
    const date = new Date(year, monthIndex, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== monthIndex ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  function parseBirthdate(value) {
    if (!value || typeof value !== "string") return null;

    const str = value.trim();
    let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (match) {
      return makeLocalDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str);
    if (match) {
      return makeLocalDate(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
    }

    return null;
  }

  function birthdayInYear(dob, year) {
    const birthday = makeLocalDate(year, dob.getMonth(), dob.getDate());
    if (birthday) return birthday;

    return new Date(year, 1, 28);
  }

  function addMonthsSafe(date, months) {
    const year = date.getFullYear();
    const month = date.getMonth() + months;
    const targetYear = year + Math.floor(month / 12);
    const targetMonth = ((month % 12) + 12) % 12;
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    return new Date(targetYear, targetMonth, Math.min(date.getDate(), lastDay));
  }

  function calcAgeFromDOB(dob, now = new Date()) {
    const today = startOfLocalDay(now);
    let age = today.getFullYear() - dob.getFullYear();
    const birthdayThisYear = birthdayInYear(dob, today.getFullYear());

    if (today < birthdayThisYear) age--;
    return age;
  }

  function calcAgeParts(dob, now = new Date()) {
    const today = startOfLocalDay(now);
    let totalMonths = (today.getFullYear() - dob.getFullYear()) * 12;
    totalMonths += today.getMonth() - dob.getMonth();

    if (addMonthsSafe(dob, totalMonths) > today) totalMonths--;
    totalMonths = Math.max(0, totalMonths);

    const marker = addMonthsSafe(dob, totalMonths);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const days = Math.round((today - marker) / MS_PER_DAY);

    return { years, months, days };
  }

  function daysUntilNextBirthday(dob, now = new Date()) {
    const today = startOfLocalDay(now);
    let nextBirthday = birthdayInYear(dob, today.getFullYear());

    if (nextBirthday < today) {
      nextBirthday = birthdayInYear(dob, today.getFullYear() + 1);
    }

    return Math.round((nextBirthday - today) / MS_PER_DAY);
  }

  function formatDisplayDate(date) {
    return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`;
  }

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((startOfLocalDay(date) - start) / MS_PER_DAY) + 1;
  }

  function daysInYear(year) {
    return Math.round((new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / MS_PER_DAY);
  }

  function validateBirthdate(dob) {
    if (!dob) return "Please enter a valid birthdate.";

    const today = startOfLocalDay(new Date());
    if (dob > today) return "Birthdate cannot be in the future.";

    const age = calcAgeFromDOB(dob, today);
    if (age > MAX_AGE) return `Please enter an age of ${MAX_AGE} or younger.`;

    return "";
  }

  /* ========= THEME ========= */
  function getSeasonTheme(now) {
    const month = now.getMonth();
    const hour = now.getHours();

    if (hour < 6 || hour >= 20) return "night";
    if (month === 11 || month <= 1) return "winter";
    if (month >= 2 && month <= 4) return "meadow";
    if (month >= 8 && month <= 10) return "dusk";
    return "day";
  }

  function resolveTheme() {
    if (isBirthdayMode) return "birthday";
    return appData.profile.theme === "auto" ? getSeasonTheme(new Date()) : appData.profile.theme;
  }

  function applyTheme() {
    currentTheme = resolveTheme();
    document.body.dataset.theme = currentTheme === "birthday" ? "day" : currentTheme;
    document.body.classList.toggle("birthday-mode", isBirthdayMode);
    document.body.classList.toggle("no-clouds", appData.profile.noClouds);

    const label = appData.profile.theme === "auto" ? `Auto: ${currentTheme}` : appData.profile.theme;
    themeSummary.textContent = label.charAt(0).toUpperCase() + label.slice(1);
  }

  /* ========= RENDER ========= */
  function renderStatus() {
    const count = appData.moods.length;
    const label = activeDob ? `Local profile - ${count} check-ins` : "Local profile";
    statusBadge.textContent = label;
    sceneStatusBadge.textContent = label;
    dataSummary.textContent = `${count} check-in${count === 1 ? "" : "s"}`;
  }

  function renderCountdown(dob) {
    const age = calcAgeFromDOB(dob);
    const daysLeft = daysUntilNextBirthday(dob);
    const displayDate = formatDisplayDate(dob);
    const turnAge = daysLeft === 0 ? age : age + 1;

    isBirthdayMode = daysLeft === 0;
    applyTheme();

    ageBadge.textContent = `Age ${age}`;
    ageLabel.textContent = `Age: ${age}`;
    bdayLabel.textContent = `Birthdate: ${displayDate}`;
    daysLeftEl.textContent = String(daysLeft);
    dayWordEl.textContent = daysLeft === 1 ? "day" : "days";
    nextBirthdayAge.textContent = `Turns ${turnAge}`;

    if (isBirthdayMode) {
      countdownMessage.innerHTML = "Happy birthday - today is the big day";
    } else {
      countdownMessage.innerHTML = `<span id="daysLeft">${daysLeft}</span> <span id="dayWord">${daysLeft === 1 ? "day" : "days"}</span> until your birthday`;
    }
  }

  function renderStats(dob) {
    const today = startOfLocalDay(new Date());
    const parts = calcAgeParts(dob, today);
    const daysLived = Math.max(0, Math.round((today - startOfLocalDay(dob)) / MS_PER_DAY));
    const weeksLived = Math.floor(daysLived / 7);
    const totalMonths = parts.years * 12 + parts.months;
    const daysLeft = daysUntilNextBirthday(dob, today);
    const yearPercent = Math.round((dayOfYear(today) / daysInYear(today.getFullYear())) * 100);
    const lifePercent = Math.min(100, Math.round((daysLived / (LIFE_EXPECTANCY_YEARS * 365.2425)) * 1000) / 10);

    const stats = [
      ["Exact age", `${parts.years}y ${parts.months}m ${parts.days}d`],
      ["Days lived", daysLived.toLocaleString()],
      ["Weeks lived", weeksLived.toLocaleString()],
      ["Months lived", totalMonths.toLocaleString()],
      ["Birthday countdown", `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`],
      ["Year progress", `${yearPercent}%`],
      ["Life map", `${lifePercent}% of ${LIFE_EXPECTANCY_YEARS}y`],
      ["Next milestone", getNextMilestoneText(dob, today)],
      ["Check-ins", appData.moods.length.toLocaleString()]
    ];

    statsGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const [label, value] of stats) {
      const item = document.createElement("div");
      item.className = "metric";
      item.innerHTML = `<div class="metric-label">${label}</div><div class="metric-value">${value}</div>`;
      fragment.appendChild(item);
    }

    statsGrid.appendChild(fragment);
  }

  function getMilestones(dob, today = startOfLocalDay(new Date())) {
    return MILESTONE_AGES.map((age) => {
      const date = birthdayInYear(dob, dob.getFullYear() + age);
      const days = Math.round((date - today) / MS_PER_DAY);
      return {
        age,
        date,
        days,
        status: days === 0 ? "today" : days < 0 ? "done" : "upcoming"
      };
    });
  }

  function getNextMilestoneText(dob, today) {
    const next = getMilestones(dob, today).find((milestone) => milestone.days >= 0);
    if (!next) return "All mapped";
    if (next.days === 0) return `Age ${next.age} today`;
    return `Age ${next.age} in ${next.days}d`;
  }

  function renderMilestones(dob) {
    const today = startOfLocalDay(new Date());
    const milestones = getMilestones(dob, today);
    const upcoming = milestones.filter((milestone) => milestone.days >= 0);
    const recentDone = milestones.filter((milestone) => milestone.days < 0).slice(-2);
    const visible = [...recentDone, ...upcoming.slice(0, 5)];

    milestoneSummary.textContent = `${upcoming.length} upcoming`;
    milestoneList.innerHTML = "";

    const fragment = document.createDocumentFragment();
    for (const milestone of visible) {
      const item = document.createElement("div");
      item.className = "milestone-item";

      const statusText = milestone.status === "today"
        ? "Today"
        : milestone.status === "done"
          ? "Done"
          : `${milestone.days}d`;

      item.innerHTML = `
        <div>
          <div class="milestone-name">Age ${milestone.age}</div>
          <div class="milestone-meta">${formatDisplayDate(milestone.date)}</div>
        </div>
        <span class="milestone-pill ${milestone.status}">${statusText}</span>
      `;
      fragment.appendChild(item);
    }

    milestoneList.appendChild(fragment);
  }

  function renderProgress(dob) {
    const today = startOfLocalDay(new Date());
    const yearTotal = daysInYear(today.getFullYear());
    const yearDay = dayOfYear(today);
    const daysLived = Math.max(0, Math.round((today - startOfLocalDay(dob)) / MS_PER_DAY));
    const weeksLived = Math.floor(daysLived / 7);
    const maxWeeks = LIFE_EXPECTANCY_YEARS * 52;

    progressButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.progressMode === appData.profile.progressMode);
    });

    yearGrid.classList.toggle("hidden", appData.profile.progressMode !== "year");
    lifeGrid.classList.toggle("hidden", appData.profile.progressMode !== "life");

    if (appData.profile.progressMode === "year") {
      progressSummary.textContent = `Day ${yearDay} of ${yearTotal}`;
    } else {
      progressSummary.textContent = `${weeksLived.toLocaleString()} weeks lived on a ${LIFE_EXPECTANCY_YEARS}-year map`;
    }

    renderCells(yearGrid, yearTotal, yearDay - 1, yearDay);
    renderCells(lifeGrid, maxWeeks, weeksLived - 1, weeksLived);
  }

  function renderCells(container, total, livedThroughIndex, currentIndex) {
    const existing = container.children.length;
    if (existing !== total) {
      container.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const cell = document.createElement("span");
        cell.className = "progress-cell";
        fragment.appendChild(cell);
      }
      container.appendChild(fragment);
    }

    Array.from(container.children).forEach((cell, index) => {
      cell.className = "progress-cell";
      if (index === currentIndex) cell.classList.add("current");
      else if (index <= livedThroughIndex) cell.classList.add("lived");
      else cell.classList.add("future");
    });
  }

  function renderMood() {
    const todayKey = toInputDateValue(new Date());
    const todayEntry = appData.moods.find((entry) => entry.date === todayKey);

    moodDate.textContent = todayKey;
    selectedMood = todayEntry ? todayEntry.mood : "";
    moodNote.value = todayEntry ? todayEntry.note : "";

    moodChoices.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (const mood of MOODS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mood-btn${mood === selectedMood ? " is-active" : ""}`;
      button.dataset.mood = mood;
      button.textContent = mood;
      fragment.appendChild(button);
    }
    moodChoices.appendChild(fragment);

    renderRecentMoods();
  }

  function renderRecentMoods() {
    const recent = [...appData.moods]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    recentMoods.innerHTML = "";

    if (!recent.length) {
      recentMoods.innerHTML = '<div class="recent-item"><div class="recent-main">No check-ins yet</div><span class="milestone-pill done">New</span></div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of recent) {
      const item = document.createElement("div");
      item.className = "recent-item";
      item.innerHTML = `
        <div>
          <div class="recent-main">${entry.date} - ${entry.mood}</div>
          <div class="recent-note">${entry.note || "No note"}</div>
        </div>
        <span class="milestone-pill">${entry.mood}</span>
      `;
      fragment.appendChild(item);
    }
    recentMoods.appendChild(fragment);
  }

  function renderSwatches() {
    renderSwatchSet(avatarColorChoices, BODY_COLORS, appData.profile.avatarColor, "avatarColor");
    renderSwatchSet(cheekColorChoices, CHEEK_COLORS, appData.profile.cheekColor, "cheekColor");
  }

  function renderSwatchSet(container, colors, activeColor, key) {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const color of colors) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `swatch-btn${color === activeColor ? " is-active" : ""}`;
      button.dataset.profileKey = key;
      button.dataset.color = color;
      button.style.background = color;
      button.setAttribute("aria-label", `${key} ${color}`);
      fragment.appendChild(button);
    }

    container.appendChild(fragment);
  }

  function renderControls() {
    bdayInput.value = appData.profile.birthdate || "";
    clearBtn.classList.toggle("hidden", !appData.profile.birthdate);

    accessorySelect.value = appData.profile.accessory;
    themeSelect.value = appData.profile.theme;
    avatarSizeInput.value = String(appData.profile.avatarSize);
    avatarSizeValue.textContent = `${appData.profile.avatarSize}px`;
    noCloudsToggle.checked = appData.profile.noClouds;
    muteToggle.checked = appData.profile.muted;

    renderSwatches();
    applyTheme();
    renderStatus();
  }

  function renderDashboard() {
    if (!activeDob) return;

    renderCountdown(activeDob);
    renderStats(activeDob);
    renderMilestones(activeDob);
    renderProgress(activeDob);
    renderMood();
    renderControls();
    resetDailyCollectibles();
    renderPanelDiscovery();
    renderCollectibles();
    renderQuestTracker();
    renderPortalDock();
  }

  /* ========= DASHBOARD GAME LAYER ========= */
  function todayKey() {
    return toInputDateValue(new Date());
  }

  function resetDailyCollectibles() {
    const key = todayKey();
    if (appData.game.collectibleDate !== key) {
      appData.game.collectibleDate = key;
      appData.game.collected = [];
      saveData();
    }
  }

  function getPanelId(el) {
    const panel = el && el.closest ? el.closest(".panel") : null;
    if (!panel) return "";
    const portal = PORTALS.find((item) => panel.matches(item.selector));
    return portal ? portal.id : "";
  }

  function unlockAchievement(id) {
    if (appData.game.achievements.includes(id)) return;

    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    appData.game.achievements.push(id);
    appData.game.coins += 12;
    saveData();

    if (achievement) {
      achievementToast.textContent = `Achievement unlocked: ${achievement.name}`;
      achievementToast.classList.remove("hidden");
      window.setTimeout(() => achievementToast.classList.add("hidden"), 2600);
    }
  }

  function discoverPanel(el) {
    const id = getPanelId(el);
    if (!id || appData.game.discoveredPanels.includes(id)) return;

    appData.game.discoveredPanels.push(id);
    appData.game.coins += 5;
    saveData();
    renderPanelDiscovery();
    renderQuestTracker();
    unlockAchievement("first-step");

    if (appData.game.discoveredPanels.length >= PORTALS.length) {
      unlockAchievement("explorer");
    }
  }

  function renderPanelDiscovery() {
    PORTALS.forEach((portal) => {
      const panel = document.querySelector(portal.selector);
      if (panel) panel.classList.toggle("is-discovered", appData.game.discoveredPanels.includes(portal.id));
    });
  }

  function getCollectibleDefs() {
    return PORTALS.map((portal, index) => ({
      id: `${todayKey()}-${portal.id}`,
      portal,
      char: index % 2 === 0 ? "*" : "+"
    }));
  }

  function renderCollectibles() {
    collectibleLayer.innerHTML = "";
    if (!activeDob || !sceneContent || appData.profile.noClouds === "never") return;

    const contentRect = sceneContent.getBoundingClientRect();
    const fragment = document.createDocumentFragment();

    for (const def of getCollectibleDefs()) {
      if (appData.game.collected.includes(def.id)) continue;
      const panel = document.querySelector(def.portal.selector);
      if (!panel) continue;

      const rect = panel.getBoundingClientRect();
      const coin = document.createElement("span");
      coin.className = "collectible";
      coin.dataset.collectibleId = def.id;
      coin.dataset.portalId = def.portal.id;
      coin.textContent = def.char;
      coin.style.left = `${rect.left - contentRect.left + sceneContent.scrollLeft + rect.width * 0.72}px`;
      coin.style.top = `${rect.top - contentRect.top + sceneContent.scrollTop + 42}px`;
      fragment.appendChild(coin);
    }

    collectibleLayer.appendChild(fragment);
  }

  function checkCollectibles() {
    if (!isSceneVisible()) return;

    const radius = getAvatarRadius();
    const coins = Array.from(collectibleLayer.querySelectorAll(".collectible"));
    for (const coin of coins) {
      const rect = coin.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(cx - avatar.x, cy - avatar.y);

      if (distance < radius + 20) {
        appData.game.collected.push(coin.dataset.collectibleId);
        appData.game.coins += 8;
        saveData();
        coin.remove();
        renderQuestTracker();
        unlockAchievement("collector");

        if (appData.game.collected.length >= getCollectibleDefs().length) {
          unlockAchievement("treasure-run");
        }
      }
    }
  }

  function getQuestData() {
    const checkInDone = appData.moods.some((entry) => entry.date === todayKey());
    return [
      {
        id: "visit-stats",
        title: "Land on Life Stats",
        value: appData.game.discoveredPanels.includes("stats") ? 1 : 0,
        max: 1
      },
      {
        id: "collect-three",
        title: "Collect 3 daily stars",
        value: Math.min(3, appData.game.collected.length),
        max: 3
      },
      {
        id: "mood-save",
        title: "Save today's mood",
        value: checkInDone ? 1 : 0,
        max: 1
      }
    ];
  }

  function renderQuestTracker() {
    questTracker.innerHTML = "";
    const fragment = document.createDocumentFragment();

    getQuestData().forEach((quest) => {
      const item = document.createElement("div");
      const done = quest.value >= quest.max;
      item.className = `quest-item${done ? " done" : ""}`;
      item.innerHTML = `
        <div class="quest-title">${done ? "Done" : "Quest"} - ${quest.title}</div>
        <div class="quest-progress"><span style="width:${Math.round((quest.value / quest.max) * 100)}%"></span></div>
      `;
      fragment.appendChild(item);
    });

    questTracker.appendChild(fragment);
  }

  function renderPortalDock() {
    portalDock.innerHTML = "";
    const fragment = document.createDocumentFragment();

    PORTALS.forEach((portal) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "portal-btn";
      button.dataset.portalId = portal.id;
      button.textContent = portal.label;
      fragment.appendChild(button);
    });

    portalDock.appendChild(fragment);
  }

  function setDrawerOpen(drawer, toggle, open) {
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  function teleportToPanel(id) {
    const portal = PORTALS.find((item) => item.id === id);
    const panel = portal ? document.querySelector(portal.selector) : null;
    if (!panel) return;

    const maxScroll = sceneContent.scrollHeight - sceneContent.clientHeight;
    const panelTop = panel.offsetTop;
    sceneContent.scrollTop = Math.max(0, Math.min(maxScroll, panelTop - 120));
    window.setTimeout(() => {
      const rect = panel.getBoundingClientRect();
      const radius = getAvatarRadius();
      avatar.x = Math.min(rect.right - radius * 1.4, Math.max(rect.left + radius * 2.1, rect.left + 66));
      avatar.y = rect.top - getAvatarFeetOffset(radius);
      avatar.vx = 0;
      avatar.vy = 0;
      avatar.onGround = true;
      avatar.platform = panel;
      discoverPanel(panel);
      drawStaticScene();
    }, 80);
  }

  /* ========= CANVAS ========= */
  function resizeCanvases() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;

    bgCanvas.width = Math.round(w * dpr);
    bgCanvas.height = Math.round(h * dpr);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fxCanvas.width = Math.round(w * dpr);
    fxCanvas.height = Math.round(h * dpr);
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    charCanvas.width = Math.round(w * dpr);
    charCanvas.height = Math.round(h * dpr);
    chCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const edge = getAvatarRadius() + 8;
    avatar.x = Math.max(edge, Math.min(w - edge, avatar.x || w * 0.5));
    avatar.y = Math.max(edge, Math.min(h - edge, avatar.y || h * 0.5));
  }

  function makeClouds() {
    clouds.length = 0;
    const count = 26;

    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: 38 + Math.random() * (window.innerHeight * 0.34),
        s: 0.6 + Math.random() * 1.4,
        speed: 12 + Math.random() * 28,
        a: 0.55 + Math.random() * 0.35
      });
    }
  }

  function makeStars() {
    stars.length = 0;
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.55,
        r: 0.8 + Math.random() * 1.8,
        a: 0.4 + Math.random() * 0.55
      });
    }
  }

  function makeConfetti() {
    confetti.length = 0;
    const colors = ["#ef8ea5", "#f4b75f", "#78c9be", "#9e94d9", "#6bb7c8"];
    for (let i = 0; i < 90; i++) {
      confetti.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w: 4 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        speed: 24 + Math.random() * 68,
        spin: Math.random() * Math.PI,
        color: colors[i % colors.length]
      });
    }
  }

  function getCloudBounds(cloud) {
    const s = cloud.s;
    return {
      left: cloud.x - 24 * s,
      right: cloud.x + 74 * s,
      top: cloud.y - 30 * s,
      bottom: cloud.y + 42 * s
    };
  }

  function getCloudDeadzones() {
    return Array.from(document.querySelectorAll(PLATFORM_SELECTOR))
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width > 24 && rect.height > 12 && rect.bottom > 0 && rect.top < window.innerHeight);
  }

  function cloudIntersectsDeadzone(cloud, deadzones) {
    const bounds = getCloudBounds(cloud);
    return deadzones.some((rect) => (
      bounds.right > rect.left &&
      bounds.left < rect.right &&
      bounds.bottom > rect.top &&
      bounds.top < rect.bottom
    ));
  }

  function updateClouds(dt) {
    if (appData.profile.noClouds) return;

    for (const cloud of clouds) {
      cloud.x += cloud.speed * dt;
      if (cloud.x > window.innerWidth + 140) cloud.x = -160;
    }
  }

  function drawBackground(deadzones) {
    const palette = THEME_PALETTES[currentTheme] || THEME_PALETTES.day;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const gradient = bgCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(1, palette.skyBottom);
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, width, height);

    if (palette.star) drawStars(palette);

    if (!appData.profile.noClouds) {
      for (const cloud of clouds) {
        if (cloudIntersectsDeadzone(cloud, deadzones)) {
          drawPuffyCloud(bgCtx, cloud, palette);
        }
      }
    }

    drawHills(palette, width, height);
  }

  function drawForeground(dt, deadzones) {
    const palette = THEME_PALETTES[currentTheme] || THEME_PALETTES.day;

    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!appData.profile.noClouds) {
      for (const cloud of clouds) {
        if (!cloudIntersectsDeadzone(cloud, deadzones)) {
          drawPuffyCloud(fxCtx, cloud, palette);
        }
      }
    }

    if (isBirthdayMode) drawConfetti(dt);
  }

  function drawStars(palette) {
    bgCtx.save();
    bgCtx.fillStyle = palette.star;
    for (const star of stars) {
      bgCtx.globalAlpha = star.a;
      bgCtx.beginPath();
      bgCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      bgCtx.fill();
    }
    bgCtx.restore();
  }

  function drawHills(palette, width, height) {
    bgCtx.fillStyle = palette.hill;
    bgCtx.beginPath();
    bgCtx.moveTo(0, height * 0.82);
    bgCtx.quadraticCurveTo(width * 0.25, height * 0.7, width * 0.52, height * 0.82);
    bgCtx.quadraticCurveTo(width * 0.78, height * 0.94, width, height * 0.78);
    bgCtx.lineTo(width, height);
    bgCtx.lineTo(0, height);
    bgCtx.closePath();
    bgCtx.fill();

    bgCtx.fillStyle = palette.hillDark;
    bgCtx.globalAlpha = 0.58;
    bgCtx.beginPath();
    bgCtx.moveTo(0, height * 0.9);
    bgCtx.quadraticCurveTo(width * 0.34, height * 0.78, width * 0.66, height * 0.91);
    bgCtx.quadraticCurveTo(width * 0.84, height, width, height * 0.88);
    bgCtx.lineTo(width, height);
    bgCtx.lineTo(0, height);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.globalAlpha = 1;
  }

  function drawPuffyCloud(ctx, cloud, palette) {
    ctx.save();
    ctx.globalAlpha = cloud.a;
    ctx.fillStyle = palette.cloud;

    const x = cloud.x;
    const y = cloud.y;
    const s = cloud.s;

    ctx.beginPath();
    ctx.arc(x, y + 6 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 44 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 24 * s, y + 14 * s, 24 * s, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = cloud.a * 0.32;
    ctx.fillStyle = palette.cloudShade;
    ctx.beginPath();
    ctx.arc(x + 18 * s, y + 12 * s, 22 * s, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawConfetti(dt) {
    if (!confetti.length) makeConfetti();

    for (const piece of confetti) {
      piece.y += piece.speed * dt;
      piece.spin += dt * 5;
      if (piece.y > window.innerHeight + 20) {
        piece.y = -20;
        piece.x = Math.random() * window.innerWidth;
      }

      fxCtx.save();
      fxCtx.translate(piece.x, piece.y);
      fxCtx.rotate(piece.spin);
      fxCtx.fillStyle = piece.color;
      fxCtx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      fxCtx.restore();
    }
  }

  function animateBg(t) {
    const now = t || 0;
    const dt = Math.min(0.05, (now - lastBgT) / 1000 || 0.016);
    lastBgT = now;

    updateClouds(dt);
    const deadzones = getCloudDeadzones();
    drawBackground(deadzones);
    drawForeground(dt, deadzones);
    bgFrameId = requestAnimationFrame(animateBg);
  }

  /* ========= AVATAR ========= */
  function hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function getAudioContext() {
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioContext = new AudioCtor();
    }

    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTap() {
    if (appData.profile.muted || !soundReady) return;

    try {
      const ac = getAudioContext();
      if (!ac) return;

      const oscillator = ac.createOscillator();
      const gain = ac.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = isBirthdayMode ? 880 : 740;
      oscillator.connect(gain);
      gain.connect(ac.destination);

      const now = ac.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.01);
      oscillator.frequency.exponentialRampToValueAtTime(isBirthdayMode ? 640 : 520, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      oscillator.start(now);
      oscillator.stop(now + 0.24);
    } catch {
      appData.profile.muted = true;
      muteToggle.checked = true;
      saveData();
    }
  }

  function isSceneVisible() {
    return !scene.classList.contains("hidden");
  }

  function isTypingTarget(target) {
    return Boolean(target && target.closest && target.closest("input, textarea, select"));
  }

  function handleMovementKey(e, isDown) {
    if (!isSceneVisible() || isTypingTarget(e.target)) return;

    const key = e.key.toLowerCase();
    const code = e.code;

    if (key === "a" || key === "arrowleft") {
      keys.left = isDown;
    } else if (key === "d" || key === "arrowright") {
      keys.right = isDown;
    } else if (key === "s" || key === "arrowdown") {
      keys.down = isDown;
    } else if (key === "w" || key === "arrowup" || code === "Space") {
      if (isDown && !e.repeat) keys.jumpQueued = true;
    } else {
      return;
    }

    soundReady = true;
    e.preventDefault();
  }

  function getAvatarRadius() {
    return Math.max(10, Math.min(50, Number(appData.profile.avatarSize) || avatar.r));
  }

  function getAvatarFeetOffset(radius = getAvatarRadius()) {
    return radius * 1.16;
  }

  function getAvatarHalfWidth(radius = getAvatarRadius()) {
    return radius * 0.72;
  }

  function getFallbackFloor() {
    return window.innerHeight - 72;
  }

  function getVisiblePlatforms() {
    return Array.from(document.querySelectorAll(PLATFORM_SELECTOR))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };
      })
      .filter((rect) => (
        rect.width > 24 &&
        rect.height > 12 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      ));
  }

  function landOnSurface(top, platform = null) {
    avatar.y = top - getAvatarFeetOffset();
    if (avatar.vy > 220) playTap();
    avatar.vy = 0;
    avatar.onGround = true;
    avatar.platform = platform;
    if (platform) discoverPanel(platform);
  }

  function resolvePlatformCollision(previousY) {
    const radius = getAvatarRadius();
    const feetOffset = getAvatarFeetOffset(radius);
    const halfWidth = getAvatarHalfWidth(radius);
    const previousBottom = previousY + feetOffset;
    const currentBottom = avatar.y + feetOffset;
    const centerX = avatar.x;
    const now = performance.now();

    avatar.onGround = false;
    avatar.platform = null;

    if (now > avatar.dropUntil) {
      const platforms = getVisiblePlatforms();
      for (const platform of platforms) {
        const horizontalOverlap = centerX + halfWidth > platform.left && centerX - halfWidth < platform.right;
        const crossingTop = previousBottom <= platform.top + 8 && currentBottom >= platform.top;
        const closeEnough = Math.abs(currentBottom - platform.top) < 10 && avatar.vy >= 0;

        if (horizontalOverlap && (crossingTop || closeEnough)) {
          landOnSurface(platform.top, platform.el);
          return;
        }
      }
    }

    const floor = getFallbackFloor();
    if (currentBottom >= floor) {
      landOnSurface(floor, null);
    }
  }

  function keepAvatarInView() {
    const radius = getAvatarRadius();
    const edge = radius + 8;
    const feetOffset = getAvatarFeetOffset(radius);
    const maxX = window.innerWidth - edge;
    const minY = edge;
    const maxY = window.innerHeight - 24;

    avatar.x = Math.max(edge, Math.min(maxX, avatar.x));

    if (avatar.y < minY) {
      const before = sceneContent.scrollTop;
      sceneContent.scrollTop = Math.max(0, sceneContent.scrollTop - (minY - avatar.y));
      avatar.y += before - sceneContent.scrollTop;
    }

    if (avatar.y + feetOffset > maxY) {
      const maxScroll = sceneContent.scrollHeight - sceneContent.clientHeight;
      const before = sceneContent.scrollTop;
      sceneContent.scrollTop = Math.min(maxScroll, sceneContent.scrollTop + (avatar.y + feetOffset - maxY));
      avatar.y -= sceneContent.scrollTop - before;
    }
  }

  function placeAvatarOnStartPlatform() {
    const start = document.querySelector(".stats-panel") || document.querySelector(".panel");
    if (!start) {
      avatar.x = window.innerWidth * 0.5;
      avatar.y = getFallbackFloor() - getAvatarFeetOffset();
      avatar.onGround = true;
      return;
    }

    const rect = start.getBoundingClientRect();
    const radius = getAvatarRadius();
    avatar.x = Math.min(rect.right - radius * 1.4, Math.max(rect.left + radius * 2.1, rect.left + 74));
    avatar.y = rect.top - getAvatarFeetOffset(radius);
    avatar.vx = 0;
    avatar.vy = 0;
    avatar.onGround = true;
    avatar.platform = start;
  }

  const blink = {
    timer: 0,
    next: 2.8 + Math.random() * 3.2,
    phase: 0,
    dur: 0.14
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
    if (blink.timer >= blink.next) blink.phase = 0.0001;
  }

  function blinkAmount() {
    if (blink.phase === 0) return 0;
    const p = blink.phase <= 1 ? blink.phase : 2 - blink.phase;
    return Math.sin(Math.PI * p);
  }

  function drawAccessory(ctx, x, y, r) {
    const type = appData.profile.accessory;
    if (type === "none") return;

    ctx.save();

    if (type === "crown") {
      ctx.fillStyle = "#f4c95d";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.48, y - r * 0.86);
      ctx.lineTo(x - r * 0.26, y - r * 1.22);
      ctx.lineTo(x, y - r * 0.86);
      ctx.lineTo(x + r * 0.28, y - r * 1.22);
      ctx.lineTo(x + r * 0.5, y - r * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x - r * 0.48, y - r * 0.86, r, r * 0.18);
    } else if (type === "cap") {
      ctx.fillStyle = "#7b73d1";
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.88, r * 0.55, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5f59aa";
      ctx.fillRect(x - r * 0.48, y - r * 0.92, r * 0.96, r * 0.2);
      ctx.beginPath();
      ctx.ellipse(x + r * 0.46, y - r * 0.77, r * 0.35, r * 0.1, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "bow") {
      ctx.fillStyle = "#ef8ea5";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.18, y - r * 0.88);
      ctx.lineTo(x - r * 0.68, y - r * 1.08);
      ctx.lineTo(x - r * 0.52, y - r * 0.66);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.06, y - r * 0.88);
      ctx.lineTo(x + r * 0.42, y - r * 1.08);
      ctx.lineTo(x + r * 0.32, y - r * 0.66);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d96f8c";
      ctx.beginPath();
      ctx.arc(x - r * 0.08, y - r * 0.88, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "halo") {
      ctx.strokeStyle = "#f7dc72";
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.ellipse(x, y - r * 1.2, r * 0.58, r * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "horns") {
      ctx.fillStyle = "#fff1c4";
      ctx.strokeStyle = "#d8a65d";
      ctx.lineWidth = Math.max(1, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y - r * 0.78);
      ctx.lineTo(x - r * 0.32, y - r * 1.14);
      ctx.lineTo(x - r * 0.12, y - r * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.5, y - r * 0.78);
      ctx.lineTo(x + r * 0.32, y - r * 1.14);
      ctx.lineTo(x + r * 0.12, y - r * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === "headphones") {
      ctx.strokeStyle = "#33465a";
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.arc(x, y - r * 0.27, r * 0.78, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.fillStyle = "#7cc7d8";
      ctx.beginPath();
      ctx.roundRect(x - r * 0.84, y - r * 0.24, r * 0.22, r * 0.44, r * 0.1);
      ctx.roundRect(x + r * 0.62, y - r * 0.24, r * 0.22, r * 0.44, r * 0.1);
      ctx.fill();
    } else if (type === "earpods") {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#d8e7ee";
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      ctx.ellipse(x - r * 0.63, y - r * 0.16, r * 0.11, r * 0.16, -0.25, 0, Math.PI * 2);
      ctx.ellipse(x + r * 0.63, y - r * 0.16, r * 0.11, r * 0.16, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y - r * 0.02);
      ctx.lineTo(x - r * 0.5, y + r * 0.22);
      ctx.moveTo(x + r * 0.6, y - r * 0.02);
      ctx.lineTo(x + r * 0.5, y + r * 0.22);
      ctx.stroke();
    } else if (type === "bonnet") {
      ctx.fillStyle = "#f0aeca";
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.8, r * 0.72, r * 0.34, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd3ea";
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(x + i * r * 0.18, y - r * 0.83, r * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#d9789d";
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y - r * 0.58);
      ctx.quadraticCurveTo(x, y - r * 0.38, x + r * 0.5, y - r * 0.58);
      ctx.stroke();
    } else if (type === "flower") {
      const cx = x - r * 0.42;
      const cy = y - r * 0.92;
      ctx.fillStyle = "#ef8ea5";
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.16, cy + Math.sin(a) * r * 0.16, r * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f7dc72";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "star") {
      ctx.fillStyle = "#f7dc72";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 === 0 ? r * 0.34 : r * 0.14;
        const px = x + Math.cos(a) * rr;
        const py = y - r * 1.02 + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (type === "scarf") {
      ctx.fillStyle = "#f16f8f";
      ctx.beginPath();
      ctx.roundRect(x - r * 0.52, y + r * 0.34, r * 1.04, r * 0.18, r * 0.06);
      ctx.fill();
      ctx.fillStyle = "#d95779";
      ctx.fillRect(x + r * 0.26, y + r * 0.44, r * 0.18, r * 0.42);
    } else if (type === "antenna") {
      ctx.strokeStyle = "#2b4c5c";
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.2, y - r * 0.82);
      ctx.lineTo(x - r * 0.42, y - r * 1.2);
      ctx.moveTo(x + r * 0.2, y - r * 0.82);
      ctx.lineTo(x + r * 0.42, y - r * 1.2);
      ctx.stroke();
      ctx.fillStyle = "#7cc7d8";
      ctx.beginPath();
      ctx.arc(x - r * 0.42, y - r * 1.2, r * 0.1, 0, Math.PI * 2);
      ctx.arc(x + r * 0.42, y - r * 1.2, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "beret") {
      ctx.fillStyle = "#9e94d9";
      ctx.beginPath();
      ctx.ellipse(x - r * 0.08, y - r * 0.98, r * 0.58, r * 0.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#786fc1";
      ctx.fillRect(x - r * 0.12, y - r * 1.18, r * 0.16, r * 0.18);
    } else if (type === "party") {
      ctx.fillStyle = "#f4c95d";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.38, y - r * 0.88);
      ctx.lineTo(x + r * 0.04, y - r * 1.48);
      ctx.lineTo(x + r * 0.42, y - r * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ef8ea5";
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.18, y - r * 1.08);
      ctx.lineTo(x + r * 0.22, y - r * 1.08);
      ctx.moveTo(x - r * 0.02, y - r * 1.28);
      ctx.lineTo(x + r * 0.12, y - r * 1.28);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawEyeAccesory(ctx, x, y, r, ox, oy) {
    const type = appData.profile.accessory;
    const centerY = y - r * 0.04 + oy;

    ctx.save();
    if (type === "glasses") {
      ctx.strokeStyle = "#151515";
      ctx.lineWidth = Math.max(2, r * 0.08);
      ctx.beginPath();
      ctx.arc(x - r * 0.23 + ox, centerY, r * 0.2, 0, Math.PI * 2);
      ctx.arc(x + r * 0.23 + ox, centerY, r * 0.2, 0, Math.PI * 2);
      ctx.moveTo(x - r * 0.03 + ox, centerY);
      ctx.lineTo(x + r * 0.03 + ox, centerY);
      ctx.stroke();
      ctx.fillStyle = "rgba(124, 199, 216, 0.2)";
      ctx.beginPath();
      ctx.arc(x - r * 0.23 + ox, centerY, r * 0.16, 0, Math.PI * 2);
      ctx.arc(x + r * 0.23 + ox, centerY, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "visor") {
      ctx.fillStyle = "rgba(124, 199, 216, 0.78)";
      ctx.beginPath();
      ctx.roundRect(x - r * 0.5 + ox, centerY - r * 0.13, r, r * 0.26, r * 0.09);
      ctx.fill();
      ctx.strokeStyle = "#244f4b";
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.46)";
      ctx.fillRect(x - r * 0.34 + ox, centerY - r * 0.06, r * 0.2, r * 0.05);
    }
    ctx.restore();
  }

  function drawAvatar(ctx) {
    const x = avatar.x;
    const y = avatar.y;
    const R = getAvatarRadius();

    const body = appData.profile.avatarColor;
    const bodyShade = "rgba(0, 0, 0, 0.06)";
    const face = "#ffffff";
    const cheek = rgba(appData.profile.cheekColor, 0.55);
    const eye = "#151515";
    const eyeShine = "rgba(255, 255, 255, 0.75)";

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(x, y, R * 1.05, R * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyShade;
    ctx.beginPath();
    ctx.ellipse(x + R * 0.15, y + R * 0.25, R * 0.85, R * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(x, y - R * 0.12, R * 0.7, R * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cheek;
    ctx.beginPath();
    ctx.ellipse(x - R * 0.34, y + R * 0.1, R * 0.2, R * 0.13, 0, 0, Math.PI * 2);
    ctx.ellipse(x + R * 0.34, y + R * 0.1, R * 0.2, R * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    const dx = mouse.x - x;
    const dy = mouse.y - (y - R * 0.1);
    const len = Math.hypot(dx, dy) || 1;
    const ox = (dx / len) * Math.min(R * 0.08, len * 0.02);
    const oy = (dy / len) * Math.min(R * 0.08, len * 0.02);

    const b = blinkAmount();
    const eyeScaleY = 1 - 0.92 * b;
    const eyeH = R * 0.42 * eyeScaleY;
    const eyeW = R * 0.16;
    const eyeY = y - R * 0.1 + oy + (R * 0.42 - eyeH) * 0.5;

    if (EYE_ACCESORY_TYPES.includes(appData.profile.accessory)) {
      drawEyeAccesory(ctx, x, y, R, ox, oy);
    } else {
      ctx.fillStyle = eye;
      ctx.beginPath();
      ctx.roundRect(x - R * 0.18 + ox, eyeY, eyeW, Math.max(2, eyeH), R * 0.08);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(x + R * 0.02 + ox, eyeY, eyeW, Math.max(2, eyeH), R * 0.08);
      ctx.fill();

      if (eyeH > 6) {
        ctx.fillStyle = eyeShine;
        ctx.beginPath();
        ctx.roundRect(x - R * 0.13 + ox, eyeY + R * 0.05, R * 0.05, R * 0.12 * eyeScaleY, R * 0.03);
        ctx.roundRect(x + R * 0.07 + ox, eyeY + R * 0.05, R * 0.05, R * 0.12 * eyeScaleY, R * 0.03);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.beginPath();
    ctx.ellipse(x - R * 0.28, y + R * 0.6, R * 0.3, R * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + R * 0.28, y + R * 0.6, R * 0.3, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    drawAccessory(ctx, x, y, R);
  }

  function animateAvatar(t) {
    const now = t || 0;
    const dt = Math.min(0.05, (now - lastChT) / 1000 || 0.016);
    lastChT = now;

    updateBlink(dt);

    const move = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const radius = getAvatarRadius();
    const runSpeed = isBirthdayMode ? 260 : 230;
    const jumpPower = isBirthdayMode ? 660 : 610;
    const gravity = 1700;

    if (move !== 0) avatar.facing = move;
    avatar.vx = move * runSpeed;

    if (keys.jumpQueued && avatar.onGround) {
      avatar.vy = -jumpPower;
      avatar.onGround = false;
      avatar.platform = null;
    }
    keys.jumpQueued = false;

    if (keys.down && avatar.onGround) {
      avatar.dropUntil = performance.now() + 220;
      avatar.onGround = false;
      avatar.platform = null;
      avatar.vy = Math.max(avatar.vy, 160);
    }

    const previousY = avatar.y;
    avatar.x += avatar.vx * dt;
    avatar.vy = Math.min(980, avatar.vy + gravity * dt);
    avatar.y += avatar.vy * dt;

    keepAvatarInView();
    resolvePlatformCollision(previousY);
    avatar.x = Math.max(radius + 8, Math.min(window.innerWidth - radius - 8, avatar.x));
    checkCollectibles();

    chCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawAvatar(chCtx);

    charFrameId = requestAnimationFrame(animateAvatar);
  }

  function drawStaticScene() {
    const deadzones = getCloudDeadzones();
    drawBackground(deadzones);
    drawForeground(0, deadzones);
    chCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawAvatar(chCtx);
  }

  function startAnimations() {
    stopAnimations();
    resizeCanvases();
    makeClouds();
    makeStars();
    if (isBirthdayMode) makeConfetti();

    drawStaticScene();

    lastBgT = performance.now();
    lastChT = performance.now();
    bgFrameId = requestAnimationFrame(animateBg);
    charFrameId = requestAnimationFrame(animateAvatar);
  }

  function stopAnimations() {
    if (bgFrameId) cancelAnimationFrame(bgFrameId);
    if (charFrameId) cancelAnimationFrame(charFrameId);
    bgFrameId = 0;
    charFrameId = 0;
  }

  /* ========= IMPORT / EXPORT ========= */
  function exportData() {
    const payload = JSON.stringify(appData, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `life-tracker-data-${toInputDateValue(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showSettingsMessage("Export ready.");
  }

  function importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const imported = normalizeData(JSON.parse(String(reader.result)));
        appData = imported;
        activeDob = parseBirthdate(appData.profile.birthdate);
        saveData();
        renderControls();
        if (activeDob) renderDashboard();
        showSettingsMessage("Import complete.");
      } catch {
        showSettingsMessage("Import failed. Choose a Life Tracker JSON file.");
      }
    });
    reader.readAsText(file);
  }

  /* ========= EVENTS ========= */
  window.addEventListener("keydown", (e) => {
    handleMovementKey(e, true);
  });

  window.addEventListener("keyup", (e) => {
    handleMovementKey(e, false);
  });

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const dob = parseBirthdate(bdayInput.value);
    const validationError = validateBirthdate(dob);

    if (validationError) {
      showError(validationError);
      bdayInput.focus();
      return;
    }

    appData.profile.birthdate = toInputDateValue(dob);
    activeDob = dob;
    saveData();
    renderControls();
    goToScene();
  });

  bdayInput.addEventListener("input", hideError);

  clearBtn.addEventListener("click", () => {
    appData.profile.birthdate = "";
    activeDob = null;
    bdayInput.value = "";
    hide(clearBtn);
    hideError();
    saveData();
    renderStatus();
    bdayInput.focus();
  });

  backBtn.addEventListener("click", backToWelcome);

  questToggle.addEventListener("click", () => {
    const open = !questTracker.classList.contains("is-open");
    setDrawerOpen(portalDock, portalToggle, false);
    setDrawerOpen(questTracker, questToggle, open);
  });

  portalToggle.addEventListener("click", () => {
    const open = !portalDock.classList.contains("is-open");
    setDrawerOpen(questTracker, questToggle, false);
    setDrawerOpen(portalDock, portalToggle, open);
  });

  portalDock.addEventListener("click", (e) => {
    const button = e.target.closest("[data-portal-id]");
    if (!button) return;
    teleportToPanel(button.dataset.portalId);
  });

  moodChoices.addEventListener("click", (e) => {
    const button = e.target.closest("[data-mood]");
    if (!button) return;

    selectedMood = button.dataset.mood;
    moodChoices.querySelectorAll(".mood-btn").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.mood === selectedMood);
    });
  });

  saveMoodBtn.addEventListener("click", () => {
    if (!selectedMood) {
      showSettingsMessage("Pick a mood first.");
      return;
    }

    const date = toInputDateValue(new Date());
    const existingIndex = appData.moods.findIndex((entry) => entry.date === date);
    const entry = {
      date,
      mood: selectedMood,
      note: moodNote.value.trim().slice(0, 90),
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) appData.moods[existingIndex] = entry;
    else appData.moods.push(entry);

    saveData();
    renderMood();
    renderStats(activeDob);
    renderQuestTracker();
    unlockAchievement("daily-note");
    showSettingsMessage("Check-in saved.");
  });

  avatarColorChoices.addEventListener("click", (e) => {
    const button = e.target.closest("[data-color]");
    if (!button) return;

    appData.profile[button.dataset.profileKey] = button.dataset.color;
    saveData();
    renderSwatches();
    drawStaticScene();
  });

  cheekColorChoices.addEventListener("click", (e) => {
    const button = e.target.closest("[data-color]");
    if (!button) return;

    appData.profile[button.dataset.profileKey] = button.dataset.color;
    saveData();
    renderSwatches();
    drawStaticScene();
  });

  accessorySelect.addEventListener("change", () => {
    appData.profile.accessory = accessorySelect.value;
    saveData();
    drawStaticScene();
  });

  themeSelect.addEventListener("change", () => {
    appData.profile.theme = themeSelect.value;
    saveData();
    applyTheme();
    startAnimations();
  });

  progressButtons.forEach((button) => {
    button.addEventListener("click", () => {
      appData.profile.progressMode = button.dataset.progressMode;
      saveData();
      if (activeDob) renderProgress(activeDob);
    });
  });

  avatarSizeInput.addEventListener("input", () => {
    appData.profile.avatarSize = Math.max(10, Math.min(50, Number(avatarSizeInput.value) || 18));
    avatarSizeValue.textContent = `${appData.profile.avatarSize}px`;
    saveData();
    drawStaticScene();
  });

  noCloudsToggle.addEventListener("change", () => {
    appData.profile.noClouds = noCloudsToggle.checked;
    saveData();
    applyTheme();
    startAnimations();
  });

  muteToggle.addEventListener("change", () => {
    appData.profile.muted = muteToggle.checked;
    saveData();
  });

  exportBtn.addEventListener("click", exportData);

  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", () => {
    importData(importFile.files[0]);
    importFile.value = "";
  });

  window.addEventListener("resize", () => {
    resizeCanvases();
    makeClouds();
    makeStars();
    if (isBirthdayMode) makeConfetti();
    drawStaticScene();
    renderCollectibles();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* ========= INIT ========= */
  bdayInput.max = toInputDateValue(new Date());
  if (activeDob) appData.profile.birthdate = toInputDateValue(activeDob);
  renderControls();
  resizeCanvases();
  makeClouds();
  makeStars();
  drawStaticScene();
});
