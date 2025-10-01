(function () {
  // ---------- Helpers ----------
  const $ = (s) => document.querySelector(s);
  const LS_KEY = "lang";
  function getLang() {
    const v = localStorage.getItem(LS_KEY);
    if (v === "de" || v === "en") return v;
    return (navigator.language || "").toLowerCase().startsWith("de") ? "de" : "en";
  }
  function setLang(v) {
    localStorage.setItem(LS_KEY, v);
  }

  // ---------- Element refs ----------
  const timeEl = $("#time");
  const ringEl = $("#ringProgress");
  const phaseTitle = $("#phaseTitle");
  const caption = $("#centerCaption");
  const cycleInfoEl = $("#cycleInfo");

  const startBtn = $("#startBtn");
  const pauseBtn = $("#pauseBtn");
  const resetBtn = $("#resetBtn");

  // Controls
  const speakToggle = $("#speakToggle");
  const focusMinutesEl = $("#focusMinutes");
  const breakMinutesEl = $("#breakMinutes");
  const longBreakMinutesEl = $("#longBreakMinutes");
  const focusRange = $("#focusRange");
  const breakRange = $("#breakRange");
  const focusSoundEl = $("#focusSound");
  const breakSoundEl = $("#breakSound");
  const endSignalEl = $("#endSignal");
  const duckingEl = $("#ducking");
  const cyclesCountEl = $("#cyclesCount");
  const masterVolEl = $("#masterVol");
  const langSel = $("#lang");
  const themeSel = $("#theme");

  const repeatDialog = $("#repeatDialog");
  const repeatYes = $("#repeatYes");
  const repeatNo = $("#repeatNo");

  // ---------- i18n ----------
  let LANG = getLang();

  const i18n = {
    de: {
      title: "Pomodoro Fokus Timer",
      start: "Zyklus starten",
      pause: "Pausieren",
      resume: "Fortsetzen",
      reset: "Zurücksetzen",
      speak: "Ansagen per Sprachausgabe",
      focusMin: "Dauer Konzentrationsphase (Min)",
      breakMin: "Dauer Pausenphase (Min)",
      longBreak: "Langer Break (Min, alle 4 Zyklen)",
      focusSound: "Naturklang – Konzentrationsphase",
      breakSound: "Klang – Pausenphase",
      endSignal: "Signal am Phasenende",
      ducking: "Sanftes Aus-/Einblenden",
      cycles: "Anzahl Zyklen",
      volume: "Lautstärke (gesamt)",
      testsSummary: "Tests (schnelle Überprüfung)",
      testsHint: "Setzt kurze Zeiten & startet automatisch.",
      footer:
        'Hinweis: Diese Seite nutzt die <em>Web Audio API</em> und die <em>Sprachausgabe</em> des Browsers. Auf Mobilgeräten muss die Audiowiedergabe mit einem Button gestartet werden (erledigt durch „Zyklus starten“).',
      ready: "Bereit",
      focus: "Konzentrationsphase",
      break: "Pausenphase",
      focusCap: "Fokus!",
      breakCap: "Pause",
      langLabel: "Sprache",
      themeLabel: "Theme",
      dark: "Dunkel",
      light: "Hell",
      modalTitle: "Der Zyklus ist beendet",
      modalQuestion: "Möchtest du einen weiteren starten?",
      yes: "Ja, weiter",
      no: "Nein, stoppen",
      descTitle: "Was ist das Pomodoro-Prinzip?",
      descText:
        "Mit dem Pomodoro-Prinzip steigerst du deine Produktivität in kleinen, konzentrierten Einheiten. Du arbeitest 25 Minuten fokussiert und machst dann 5 Minuten Pause. Nach vier Runden gibt’s eine längere Pause – so bleibst du frisch und effektiv.",
      navImprint: "Impressum",
      navPrivacy: "Datenschutz",
      metaDesc:
        "Produktiv arbeiten mit dem Pomodoro-Prinzip: 25 Minuten Fokus, 5 Minuten Pause.",
      speech: {
        start_break: "Nun beginnt deine Pause",
        long_break: "Nun beginnt deine lange Pause",
        next_focus: "Die nächste Konzentrationsphase beginnt!",
        cycle_end:
          "Der Zyklus ist beendet, möchtest du einen weiteren starten?",
      },
      opt: {
        focusSound: {
          rain: "Regen",
          ocean: "Meeresrauschen",
          forest: "Wald / Wind",
          stream: "Bachlauf",
          fire: "Kaminfeuer",
          crickets: "Grillen",
          brown: "Brown Noise",
          silence: "Stille",
        },
        breakSound: {
          ambient: "Ambient Pad",
          chimes: "Leises Glockenspiel",
          softbells: "Weiche Bells",
          ocean: "Meeresrauschen",
          silence: "Stille",
        },
        endSignal: { none: "Keins", gong: "Gong", bowl: "Klangschale" },
        ducking: { true: "Aktiv", false: "Deaktiviert" },
        theme: { dark: "Dunkel", light: "Hell" },
        lang: { de: "Deutsch", en: "English" },
      },
    },
    en: {
      title: "Pomodoro Focus Timer",
      start: "Start cycle",
      pause: "Pause",
      resume: "Resume",
      reset: "Reset",
      speak: "Voice announcements",
      focusMin: "Focus duration (min)",
      breakMin: "Break duration (min)",
      longBreak: "Long break (min, every 4 cycles)",
      focusSound: "Nature sound – Focus",
      breakSound: "Sound – Break",
      endSignal: "End-of-phase signal",
      ducking: "Smooth fade in/out",
      cycles: "Number of cycles",
      volume: "Master volume",
      testsSummary: "Tests (quick)",
      testsHint: "Sets short times & auto-starts.",
      footer:
        "Note: This page uses the Web Audio API and the browser's speech synthesis. On mobile, audio must be started by a user gesture (the “Start cycle” button).",
      ready: "Ready",
      focus: "Focus session",
      break: "Break session",
      focusCap: "Focus!",
      breakCap: "Break",
      langLabel: "Language",
      themeLabel: "Theme",
      dark: "Dark",
      light: "Light",
      modalTitle: "Cycle finished",
      modalQuestion: "Do you want to start another one?",
      yes: "Yes",
      no: "No",
      descTitle: "What is the Pomodoro Technique?",
      descText:
        "The Pomodoro Technique boosts productivity by working in short, focused bursts. Work for 25 minutes, then take a 5-minute break. After four rounds, take a longer break to stay fresh and effective.",
      navImprint: "Imprint",
      navPrivacy: "Privacy",
      metaDesc:
        "Work productively with the Pomodoro Technique: 25 minutes focus, 5 minutes break.",
      speech: {
        start_break: "Your break starts now",
        long_break: "Your long break starts now",
        next_focus: "The next focus session is starting!",
        cycle_end:
          "The cycle has finished. Do you want to start another one?",
      },
      opt: {
        focusSound: {
          rain: "Rain",
          ocean: "Ocean waves",
          forest: "Forest / Wind",
          stream: "Stream",
          fire: "Fireplace",
          crickets: "Crickets",
          brown: "Brown noise",
          silence: "Silence",
        },
        breakSound: {
          ambient: "Ambient pad",
          chimes: "Soft chimes",
          softbells: "Soft bells",
          ocean: "Ocean waves",
          silence: "Silence",
        },
        endSignal: { none: "None", gong: "Gong", bowl: "Singing bowl" },
        ducking: { true: "Enabled", false: "Disabled" },
        theme: { dark: "Dark", light: "Light" },
        lang: { de: "Deutsch", en: "English" },
      },
    },
  };

  // ---------- Utils ----------
  function setPauseButtonState() {
    if (!pauseBtn) return;
    const running = (window.ctx && window.ctx.state === "running");
    pauseBtn.textContent = running ? i18n[LANG].pause : i18n[LANG].resume;
  }

  function rebuildSelectOptions(selectEl, map) {
    if (!selectEl || !map) return;
    const current = selectEl.value;
    const order = Array.from(selectEl.options).map(
      (o) => (o.value ?? "").toString()
    );
    const frag = document.createDocumentFragment();

    // Behalte Reihenfolge der vorhandenen Optionen
    (order.length ? order : Object.keys(map)).forEach((val) => {
      if (map[val] === undefined) return;
      const opt = document.createElement("option");
      opt.value = val;
      opt.text = map[val];
      opt.label = map[val];
      if (val === current) opt.selected = true;
      frag.appendChild(opt);
    });

    selectEl.innerHTML = "";
    selectEl.appendChild(frag);
    // Auswahl wiederherstellen
    if (current) selectEl.value = current;
  }

  function applyLang() {
    const t = i18n[LANG];
    document.documentElement.lang = LANG === "de" ? "de" : "en";

    // Title + meta description
    document.title = t.title;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t.metaDesc);

    // Kopf / Labels / Buttons
    const setText = (sel, val, html = false) => {
      const el = $(sel);
      if (!el) return;
      html ? (el.innerHTML = val) : (el.textContent = val);
    };

    setText("#title", t.title);
    setText("#labelLanguage", t.langLabel);
    setText("#labelTheme", t.themeLabel);

    if (phaseTitle)
      phaseTitle.textContent =
        window.currentPhase === "focus"
          ? t.focus
          : window.currentPhase === "break"
          ? t.break
          : t.ready;
    if (caption)
      caption.textContent =
        window.currentPhase === "focus"
          ? t.focusCap
          : window.currentPhase === "break"
          ? t.breakCap
          : t.ready;
    if (startBtn) startBtn.textContent = t.start;
    if (resetBtn) resetBtn.textContent = t.reset;
    setPauseButtonState();

    // Panel-Labels
    setText("#labelSpeak", t.speak);
    setText("#labelFocusMin", t.focusMin);
    setText("#labelBreakMin", t.breakMin);
    setText("#labelLongBreak", t.longBreak);
    setText("#labelFocusSound", t.focusSound);
    setText("#labelBreakSound", t.breakSound);
    setText("#labelEndSignal", t.endSignal);
    setText("#labelDucking", t.ducking);
    setText("#labelCycles", t.cycles);
    setText("#labelVol", t.volume);

    // Dev/Test & Footer
    setText("#testsSummary", t.testsSummary);
    setText("#testsHint", t.testsHint);
    setText("#footerNote", t.footer, true);

    // Modal
    setText("#modalTitle", t.modalTitle);
    setText("#modalQuestion", t.modalQuestion);
    if (repeatYes) repeatYes.textContent = t.yes;
    if (repeatNo) repeatNo.textContent = t.no;

    // Beschreibung
    setText("#infoTitle", t.descTitle);
    setText("#pomDesc", t.descText);

    // Footer-Navigation
    setText("#navImprint", t.navImprint);
    setText("#navPrivacy", t.navPrivacy);

    // Selects neu aufbauen (sicher für Safari/iOS)
    rebuildSelectOptions(focusSoundEl, t.opt.focusSound);
    rebuildSelectOptions(breakSoundEl, t.opt.breakSound);
    rebuildSelectOptions(endSignalEl, t.opt.endSignal);
    rebuildSelectOptions(duckingEl, t.opt.ducking);
    rebuildSelectOptions(themeSel, t.opt.theme);
    rebuildSelectOptions(langSel, t.opt.lang);

    setCycleInfo();
  }

  // ---------- Number <-> Range sync ----------
  function bindRange(num, range) {
    if (!num || !range) return;
    num.addEventListener("input", () => {
      range.value = num.value;
    });
    range.addEventListener("input", () => {
      num.value = range.value;
      updateInitialTime();
    });
  }
  bindRange(focusMinutesEl, focusRange);
  bindRange(breakMinutesEl, breakRange);

  // ---------- Audio + Timer (dein vorhandener Code; minimal nötig hier) ----------
  // Exponiere ein paar Variablen am window, damit applyLang drauf zugreifen kann:
  window.currentPhase = "idle";
  let ticker = null;
  let remaining = 0;
  let totalPhase = 0;
  let totalCycles = 1,
    cyclesDone = 0,
    currentCycle = 0;
  let stopCurrentSound = null;

  function fmt(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function setCycleInfo() {
    if (!cycleInfoEl) return;
    const configured = Math.max(1, parseInt(cyclesCountEl.value || "1", 10));
    const total = window.currentPhase === "idle" ? configured : totalCycles;
    cycleInfoEl.textContent =
      total <= 1
        ? LANG === "de"
          ? "Einzelzyklus"
          : "Single cycle"
        : `${LANG === "de" ? "Zyklus" : "Cycle"} ${currentCycle}/${total}`;
  }

  function updateRing() {
    if (!ringEl) return;
    const CIRC = 2 * Math.PI * 45;
    const done = totalPhase > 0 ? 1 - remaining / totalPhase : 0;
    ringEl.setAttribute("stroke-dasharray", CIRC.toFixed(1));
    ringEl.setAttribute("stroke-dashoffset", (CIRC * (1 - done)).toFixed(1));
  }

  function updateUI() {
    if (timeEl) timeEl.textContent = fmt(Math.max(0, remaining));
    if (caption)
      caption.textContent =
        window.currentPhase === "focus"
          ? i18n[LANG].focusCap
          : window.currentPhase === "break"
          ? i18n[LANG].breakCap
          : i18n[LANG].ready;
    if (phaseTitle)
      phaseTitle.textContent =
        window.currentPhase === "focus"
          ? i18n[LANG].focus
          : window.currentPhase === "break"
          ? i18n[LANG].break
          : i18n[LANG].ready;
    if (pauseBtn) pauseBtn.disabled = window.currentPhase === "idle";
    if (resetBtn) resetBtn.disabled = window.currentPhase === "idle";
    setCycleInfo();
    updateRing();
  }

  function updateInitialTime() {
    remaining = parseFloat(focusMinutesEl?.value || "25") * 60;
    totalPhase = remaining;
    updateUI();
  }

  // ---------- Events ----------
  if (langSel) {
    langSel.value = LANG;
    langSel.addEventListener("change", (e) => {
      LANG = e.target.value;
      setLang(LANG);
      applyLang();
    });
  }

  if (themeSel) {
    themeSel.addEventListener("change", () => {
      document.body.classList.toggle("light", themeSel.value === "light");
    });
  }

  // ---------- Init ----------
  applyLang();
  updateInitialTime();
})();
