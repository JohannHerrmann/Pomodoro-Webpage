(function () {
  const storageKey = "lang";
  const langSelect = document.getElementById("langSelect");

  // Übersetzungen
  const t = {
    de: {
      "title.app": "Pomodoro Timer",
      "brand": "Pomodoro",
      "label.language": "Sprache",
      "title.controls": "Einstellungen",

      "label.nature": "Naturklang",
      "option.nature.none": "Kein Ton",
      "option.nature.rain": "Regen",
      "option.nature.forest": "Wald",
      "option.nature.waves": "Meeresrauschen",

      "label.focus": "Fokus",
      "option.focus.standard": "Standard",
      "option.focus.deep": "Deep Focus",

      "btn.start": "Start",
      "btn.pause": "Pause",
      "btn.reset": "Reset",

      "summary.whatIs": "Was ist das Pomodoro-Prinzip?",
      "desc.pomodoro":
        "Mit dem Pomodoro-Prinzip steigerst du deine Produktivität in kleinen, konzentrierten Einheiten. Du arbeitest 25 Minuten fokussiert und machst dann 5 Minuten Pause. Nach vier Runden gibt’s eine längere Pause – so bleibst du frisch und effektiv.",

      "nav.impressum": "Impressum",
      "nav.privacy": "Datenschutz",

      // Meta (nur als Platzhalter – wird in <meta name=description> geschrieben)
      "meta.description":
        "Produktiv arbeiten mit dem Pomodoro-Prinzip: 25 Minuten Fokus, 5 Minuten Pause."
    },
    en: {
      "title.app": "Pomodoro Timer",
      "brand": "Pomodoro",
      "label.language": "Language",
      "title.controls": "Settings",

      "label.nature": "Nature sound",
      "option.nature.none": "No sound",
      "option.nature.rain": "Rain",
      "option.nature.forest": "Forest",
      "option.nature.waves": "Ocean waves",

      "label.focus": "Focus",
      "option.focus.standard": "Standard",
      "option.focus.deep": "Deep Focus",

      "btn.start": "Start",
      "btn.pause": "Pause",
      "btn.reset": "Reset",

      "summary.whatIs": "What is the Pomodoro Technique?",
      "desc.pomodoro":
        "The Pomodoro Technique boosts productivity by working in short, focused bursts. Work for 25 minutes, then take a 5-minute break. After four rounds, take a longer break to stay fresh and effective.",

      "nav.impressum": "Imprint",
      "nav.privacy": "Privacy",

      "meta.description":
        "Work productively with the Pomodoro Technique: 25 minutes focus, 5 minutes break."
    }
  };

  // Hilfsfunktionen
  function getLang() {
    return localStorage.getItem(storageKey) || (navigator.language?.startsWith("de") ? "de" : "en");
  }

  function setLang(lang) {
    localStorage.setItem(storageKey, lang);
    document.documentElement.setAttribute("lang", lang);

    // 1) Normale Textelemente mit data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const str = t[lang][key];
      if (str) el.textContent = str;
    });

    // 2) <title> separat (falls data-i18n gesetzt)
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) {
      const key = titleEl.getAttribute("data-i18n");
      const str = t[lang][key];
      if (str) document.title = str;
    }

    // 3) Meta Description (falls data-i18n-placeholder gesetzt)
    const metaDesc = document.querySelector('meta[name="description"][data-i18n-placeholder="meta.description"]');
    if (metaDesc) {
      const str = t[lang]["meta.description"];
      if (str) metaDesc.setAttribute("content", str);
    }

    // 4) Optionen in <select> aktualisieren
    // Für alle <option data-i18n="...">
    document.querySelectorAll("option[data-i18n]").forEach((opt) => {
      const key = opt.getAttribute("data-i18n");
      const str = t[lang][key];
      if (str) opt.textContent = str;
    });
  }

  // Init
  const initial = getLang();
  if (langSelect) langSelect.value = initial;
  setLang(initial);

  // Events
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      const newLang = e.target.value;
      setLang(newLang);
    });
  }

  // (Optional) Beispiel-Logik für Timer Buttons – hier nur Platzhalter
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const display = document.querySelector(".timer-display");

  let seconds = 25 * 60;
  let timerId = null;

  function render() {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    if (display) display.textContent = `${m}:${s}`;
  }
  function tick() {
    if (seconds > 0) {
      seconds -= 1;
      render();
    } else {
      clearInterval(timerId);
      timerId = null;
      // hier könntest du einen Sound triggern (natureSelect.value)
    }
  }

  if (startBtn) startBtn.addEventListener("click", () => { if (!timerId) timerId = setInterval(tick, 1000); });
  if (pauseBtn) pauseBtn.addEventListener("click", () => { clearInterval(timerId); timerId = null; });
  if (resetBtn) resetBtn.addEventListener("click", () => { seconds = 25 * 60; render(); });

  render();
})();

