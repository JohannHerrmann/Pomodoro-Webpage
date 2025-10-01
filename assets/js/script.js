(function(){
  // ————————————————————————————————
  // Shortcuts
  // ————————————————————————————————
  const $ = (s)=>document.querySelector(s);
  const timeEl=$('#time');
  const ringEl=$('#ringProgress');
  const phaseTitle=$('#phaseTitle');
  const caption=$('#centerCaption');
  const cycleInfoEl=$('#cycleInfo');

  const startBtn=$('#startBtn');
  const pauseBtn=$('#pauseBtn');
  const resetBtn=$('#resetBtn');

  // Controls
  const speakToggle=$('#speakToggle');
  const focusMinutesEl=$('#focusMinutes');
  const breakMinutesEl=$('#breakMinutes');
  const longBreakMinutesEl=$('#longBreakMinutes');
  const focusRange=$('#focusRange');
  const breakRange=$('#breakRange');
  const focusSoundEl=$('#focusSound');
  const breakSoundEl=$('#breakSound');
  const endSignalEl=$('#endSignal');
  const duckingEl=$('#ducking');
  const cyclesCountEl=$('#cyclesCount');
  const masterVolEl=$('#masterVol');
  const langSel=$('#lang');
  const themeSel=$('#theme');

  const repeatDialog=$('#repeatDialog');
  const repeatYes=$('#repeatYes');
  const repeatNo=$('#repeatNo');

  // Neu: Sprache merken/holen
  const LS_KEY = 'lang';
  function getLang() {
    return localStorage.getItem(LS_KEY) || 'de';
  }
  function setLang(v) {
    localStorage.setItem(LS_KEY, v);
  }

  // Ersetzt: updateOptions – robustere Aktualisierung
  function updateOptions(selectEl, map){
    if(!selectEl || !map) return;

    // Aktuellen value zwischenspeichern, damit Auswahl erhalten bleibt
    const currentVal = selectEl.value;

    // Jedes <option> sowohl textContent, label als auch innerText setzen
    // Manche Browser (iOS/Safari) zeigen sonst alte Texte an.
    const opts = Array.from(selectEl.options);
    for (const opt of opts) {
      const val = (opt.value ?? '').toString();
      if (map[val] !== undefined) {
        const newLabel = map[val];
        opt.textContent = newLabel;  // sichtbarer Text
        opt.label = newLabel;        // explizites Label
        // Fallback (ältere UAs)
        if (typeof opt.innerText !== 'undefined') {
          opt.innerText = newLabel;
        }
      }
    }

    // Force-Reflow für zickige Browser: kurz value resetten
    // (nur wenn sich der Text geändert hat)
    const needsRefresh = true;
    if (needsRefresh) {
      const tmp = currentVal;
      selectEl.value = '';       // invalidate
      selectEl.value = tmp;      // restore selection
    }
  }

  function applyLang(){
    const t=i18n[LANG];
    document.documentElement.lang = (LANG==='de'?'de':'en');
    document.title = t.title;

    // Kopf/Labels/Buttons
    $('#title').textContent=t.title;
    $('#labelLanguage').textContent=t.langLabel;
    $('#labelTheme').textContent=t.themeLabel;
    $('#phaseTitle').textContent = currentPhase==='focus'?t.focus : currentPhase==='break'?t.break : t.ready;
    if (caption) caption.textContent = currentPhase==='focus'?t.focusCap : currentPhase==='break'?t.breakCap : t.ready;
    if (startBtn) startBtn.textContent=t.start;
    if (resetBtn) resetBtn.textContent=t.reset;
    setPauseButtonState();

    // Panel-Labels
    $('#labelSpeak').textContent=t.speak;
    $('#labelFocusMin').textContent=t.focusMin;
    $('#labelBreakMin').textContent=t.breakMin;
    $('#labelLongBreak').textContent=t.longBreak;
    $('#labelFocusSound').textContent=t.focusSound;
    $('#labelBreakSound').textContent=t.breakSound;
    $('#labelEndSignal').textContent=t.endSignal;
    $('#labelDucking').textContent=t.ducking;
    $('#labelCycles').textContent=t.cycles;
    $('#labelVol').textContent=t.volume;

    // Dev/Test & Footer
    $('#testsSummary').textContent=t.testsSummary;
    $('#testsHint').textContent=t.testsHint;
    $('#footerNote').innerHTML=t.footer;

    // Modal
    $('#modalTitle').textContent=t.modalTitle;
    $('#modalQuestion').textContent=t.modalQuestion;
    if (repeatYes) repeatYes.textContent=t.yes;
    if (repeatNo) repeatNo.textContent=t.no;

    // Beschreibung (dezent)
    $('#infoTitle').textContent = t.descTitle;
    $('#pomDesc').textContent = t.descText;

    // Footer-Navigation
    $('#navImprint').textContent = t.navImprint;
    $('#navPrivacy').textContent = t.navPrivacy;

    // **Wichtig**: Optionen updaten (jetzt robust)
    updateOptions(focusSoundEl, t.opt.focusSound);
    updateOptions(breakSoundEl, t.opt.breakSound);
    updateOptions(endSignalEl, t.opt.endSignal);
    updateOptions(duckingEl, t.opt.ducking);
    updateOptions(themeSel, t.opt.theme);
    updateOptions(langSel, t.opt.lang);

    setCycleInfo();
  }

  // Events / Initialisierung – Sprache aus LocalStorage ziehen
  const saved = getLang();
  $('#lang').value = saved;
  let LANG = saved;

  $('#lang').addEventListener('change', (e)=>{
    LANG = e.target.value;
    setLang(LANG);
    applyLang();
  });

  // ... (der Rest deiner Datei: Audio, Timer, etc. unverändert)

  // Initial UI
  applyLang();
  updateInitialTime();
})();
