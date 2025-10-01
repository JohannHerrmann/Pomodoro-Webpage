(function () {
  // ---------- Helpers ----------
  const $ = (s) => document.querySelector(s);
  const LS_KEY = "lang";
  function getLang() {
    const v = localStorage.getItem(LS_KEY);
    if (v === "de" || v === "en") return v;
    return (navigator.language || "").toLowerCase().startsWith("de") ? "de" : "en";
  }
  function setLang(v) { localStorage.setItem(LS_KEY, v); }

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
    de:{title:'Pomodoro Fokus Timer', start:'Zyklus starten', pause:'Pausieren', resume:'Fortsetzen', reset:'Zurücksetzen',
        speak:'Ansagen per Sprachausgabe', focusMin:'Dauer Konzentrationsphase (Min)', breakMin:'Dauer Pausenphase (Min)', longBreak:'Langer Break (Min, alle 4 Zyklen)',
        focusSound:'Naturklang – Konzentrationsphase', breakSound:'Klang – Pausenphase', endSignal:'Signal am Phasenende', ducking:'Sanftes Aus-/Einblenden', cycles:'Anzahl Zyklen', volume:'Lautstärke (gesamt)',
        testsSummary:'Tests (schnelle Überprüfung)', testsHint:'Setzt kurze Zeiten & startet automatisch.',
        footer:'Hinweis: Diese Seite nutzt die <em>Web Audio API</em> und die <em>Sprachausgabe</em> des Browsers. Auf Mobilgeräten muss die Audiowiedergabe mit einem Button gestartet werden (erledigt durch „Zyklus starten“).',
        ready:'Bereit', focus:'Konzentrationsphase', break:'Pausenphase', focusCap:'Fokus!', breakCap:'Pause',
        langLabel:'Sprache', themeLabel:'Theme', dark:'Dunkel', light:'Hell',
        modalTitle:'Der Zyklus ist beendet', modalQuestion:'Möchtest du einen weiteren starten?', yes:'Ja, weiter', no:'Nein, stoppen',
        descTitle:'Was ist das Pomodoro-Prinzip?', descText:'Mit dem Pomodoro-Prinzip steigerst du deine Produktivität in kleinen, konzentrierten Einheiten. Du arbeitest 25 Minuten fokussiert und machst dann 5 Minuten Pause. Nach vier Runden gibt’s eine längere Pause – so bleibst du frisch und effektiv.',
        navImprint:'Impressum', navPrivacy:'Datenschutz',
        metaDesc:'Produktiv arbeiten mit dem Pomodoro-Prinzip: 25 Minuten Fokus, 5 Minuten Pause.',
        speech:{start_break:'Nun beginnt deine Pause', long_break:'Nun beginnt deine lange Pause', next_focus:'Die nächste Konzentrationsphase beginnt!', cycle_end:'Der Zyklus ist beendet, möchtest du einen weiteren starten?'},
        opt:{
          focusSound:{rain:'Regen', ocean:'Meeresrauschen', forest:'Wald / Wind', stream:'Bachlauf', fire:'Kaminfeuer', crickets:'Grillen', brown:'Brown Noise', silence:'Stille'},
          breakSound:{ambient:'Ambient Pad', chimes:'Leises Glockenspiel', softbells:'Weiche Bells', ocean:'Meeresrauschen', silence:'Stille'},
          endSignal:{none:'Keins', gong:'Gong', bowl:'Klangschale'},
          ducking:{true:'Aktiv', false:'Deaktiviert'},
          theme:{dark:'Dunkel', light:'Hell'},
          lang:{de:'Deutsch', en:'English'}
        }},
    en:{title:'Pomodoro Focus Timer', start:'Start cycle', pause:'Pause', resume:'Resume', reset:'Reset',
        speak:'Voice announcements', focusMin:'Focus duration (min)', breakMin:'Break duration (min)', longBreak:'Long break (min, every 4 cycles)',
        focusSound:'Nature sound – Focus', breakSound:'Sound – Break', endSignal:'End-of-phase signal', ducking:'Smooth fade in/out', cycles:'Number of cycles', volume:'Master volume',
        testsSummary:'Tests (quick)', testsHint:'Sets short times & auto-starts.',
        footer:'Note: This page uses the Web Audio API and the browser\'s speech synthesis. On mobile, audio must be started by a user gesture (the “Start cycle” button).',
        ready:'Ready', focus:'Focus session', break:'Break session', focusCap:'Focus!', breakCap:'Break',
        langLabel:'Language', themeLabel:'Theme', dark:'Dark', light:'Light',
        modalTitle:'Cycle finished', modalQuestion:'Do you want to start another one?', yes:'Yes', no:'No',
        descTitle:'What is the Pomodoro Technique?', descText:'The Pomodoro Technique boosts productivity by working in short, focused bursts. Work for 25 minutes, then take a 5-minute break. After four rounds, take a longer break to stay fresh and effective.',
        navImprint:'Imprint', navPrivacy:'Privacy',
        metaDesc:'Work productively with the Pomodoro Technique: 25 minutes focus, 5 minutes break.',
        speech:{start_break:'Your break starts now', long_break:'Your long break starts now', next_focus:'The next focus session is starting!', cycle_end:'The cycle has finished. Do you want to start another one?'},
        opt:{
          focusSound:{rain:'Rain', ocean:'Ocean waves', forest:'Forest / Wind', stream:'Stream', fire:'Fireplace', crickets:'Crickets', brown:'Brown noise', silence:'Silence'},
          breakSound:{ambient:'Ambient pad', chimes:'Soft chimes', softbells:'Soft bells', ocean:'Ocean waves', silence:'Silence'},
          endSignal:{none:'None', gong:'Gong', bowl:'Singing bowl'},
          ducking:{true:'Enabled', false:'Disabled'},
          theme:{dark:'Dark', light:'Light'},
          lang:{de:'Deutsch', en:'English'}
        }}
  };

  // ---------- Timer/Audio state ----------
  let ctx, masterGain;
  let ticker = null;
  let remaining = 0;
  let totalPhase = 0;
  let currentPhase = "idle";
  let stopCurrentSound = null;
  let totalCycles = 1, cyclesDone = 0, currentCycle = 0;

  // ---------- UI Helpers ----------
  function setPauseButtonState(){ if (pauseBtn) pauseBtn.textContent = (ctx && ctx.state==='running') ? i18n[LANG].pause : i18n[LANG].resume; }
  function fmt(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function setCycleInfo(){
    if (!cycleInfoEl) return;
    const configured=Math.max(1,parseInt(cyclesCountEl.value||'1',10));
    const total=(currentPhase==='idle')?configured:totalCycles;
    cycleInfoEl.textContent = (total<=1) ? (LANG==='de'?'Einzelzyklus':'Single cycle') : `${(LANG==='de')?'Zyklus':'Cycle'} ${currentCycle}/${total}`;
  }
  function updateRing(){ if(!ringEl) return; const CIRC=2*Math.PI*45; const done=(totalPhase>0? (1-remaining/totalPhase):0); ringEl.setAttribute('stroke-dasharray', CIRC.toFixed(1)); ringEl.setAttribute('stroke-dashoffset', (CIRC*(1-done)).toFixed(1)); }
  function updateUI(){
    if(timeEl) timeEl.textContent=fmt(Math.max(0,remaining));
    if(caption) caption.textContent= currentPhase==='focus' ? i18n[LANG].focusCap : currentPhase==='break' ? i18n[LANG].breakCap : i18n[LANG].ready;
    if(phaseTitle) phaseTitle.textContent= currentPhase==='focus' ? i18n[LANG].focus : currentPhase==='break' ? i18n[LANG].break : i18n[LANG].ready;
    if(pauseBtn) pauseBtn.disabled=(currentPhase==='idle');
    if(resetBtn) resetBtn.disabled=(currentPhase==='idle');
    setCycleInfo(); updateRing();
  }

  // ---------- Sound fade helpers ----------
  function rampGain(g,value,time=0.7){ const now=ctx.currentTime; g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(value, now+time); }
  function rampSound(g, to = 1, dur = 0.8) { if (duckingEl && duckingEl.value === 'true') rampGain(g, to, dur); else g.gain.value = to; }
  function stopSound(unit, g) {
    if (duckingEl && duckingEl.value === 'true') {
      rampGain(g, 0.0, 0.8);
      setTimeout(() => { try{unit.stop();}catch{} try{g.disconnect();}catch{} }, 850);
    } else { try{unit.stop();}catch{} try{g.disconnect();}catch{} }
  }

  // ---------- Number <-> Range sync ----------
  function bindRange(num, range){
    if(!num || !range) return;
    num.addEventListener('input',()=>{ range.value=num.value; });
    range.addEventListener('input',()=>{ num.value=range.value; updateInitialTime(); });
  }
  bindRange(focusMinutesEl, focusRange);
  bindRange(breakMinutesEl, breakRange);

  // ---------- Audio Engine ----------
  function ensureAudio(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      masterGain=ctx.createGain();
      masterGain.gain.value=parseFloat(masterVolEl.value || '0.6');
      masterGain.connect(ctx.destination);
    }
    if(ctx.state==='suspended') ctx.resume();
  }
  masterVolEl && masterVolEl.addEventListener('input',()=>{ if(masterGain) masterGain.gain.value=parseFloat(masterVolEl.value || '0.6'); });

  // ===== File Loop Engine (Crossfade) =====
  const PREFERRED_AUDIO_EXT = (() => {
    const a = document.createElement('audio');
    if (a.canPlayType('audio/ogg; codecs="vorbis"')) return 'ogg';
    return 'mp3';
  })();
  const _bufferCache = new Map();
  async function loadAudioBuffer(urlBase){
    ensureAudio();
    const url = `${urlBase}.${PREFERRED_AUDIO_EXT}`;
    if (_bufferCache.has(url)) return _bufferCache.get(url);
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(ab);
    _bufferCache.set(url, buf);
    return buf;
  }
  function makeFileLoop(urlBase, fadeSec = 0.9){
    ensureAudio();
    const out = ctx.createGain(); out.gain.value = 1.0;
    let stopped = false, pending = false;
    function playOnce(buffer){
      const src = ctx.createBufferSource(); src.buffer = buffer; src.loop = false;
      const g = ctx.createGain(); g.gain.value = 0.0;
      src.connect(g).connect(out);
      const now = ctx.currentTime;
      src.start(now);
      g.gain.setValueAtTime(0.0, now);
      g.gain.linearRampToValueAtTime(1.0, now + fadeSec);
      return { src, g, startTime: now, duration: buffer.duration };
    }
    async function run(){
      if (pending) return; pending = true;
      const buffer = await loadAudioBuffer(urlBase);
      if (stopped) return;
      let cur = playOnce(buffer);
      (function scheduleNext(){
        if (stopped) return;
        const beforeEnd = Math.max(0.1, cur.duration - fadeSec);
        const target = cur.startTime + beforeEnd;
        const delayMs = Math.max(0, (target - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (stopped) return;
          const next = playOnce(buffer);
          const n = ctx.currentTime;
          cur.g.gain.setValueAtTime(cur.g.gain.value, n);
          cur.g.gain.linearRampToValueAtTime(0.0, n + fadeSec);
          cur = next;
          scheduleNext();
        }, delayMs);
      })();
    }
    return { start(){ stopped=false; run().catch(()=>{}); }, stop(){ stopped=true; try{out.disconnect();}catch{} }, node: out };
  }

  // ===== Nature generators (File-based) =====
  function makeRainNode(){    return makeFileLoop('assets/audio/rain',     0.9); }
  function makeOceanNode(){   return makeFileLoop('assets/audio/ocean',    0.9); }
  function makeForestNode(){  return makeFileLoop('assets/audio/forest',   0.9); }
  function makeStreamNode(){  return makeFileLoop('assets/audio/stream',   0.9); } // lege stream.ogg/mp3 an oder mappe auf forest
  function makeFireNode(){    return makeFileLoop('assets/audio/fire',     0.7); }
  function makeCricketsNode(){return makeFileLoop('assets/audio/crickets', 0.6); }
  function makeBrownNoiseNode(){return makeFileLoop('assets/audio/brown',  0.5); }

  // ===== Break sounds (File-based) =====
  function makeAmbientPad(){  return makeFileLoop('assets/audio/ambient',  0.9); }
  function makeChimes(){      return makeFileLoop('assets/audio/chimes',   0.7); }
  function makeSoftBells(){   return makeFileLoop('assets/audio/softbells',0.7); }

  // Start/Stop Wrapper
  function startNature(kind){
    ensureAudio();
    const maker = {
      rain: makeRainNode, ocean: makeOceanNode, forest: makeForestNode, stream: makeStreamNode,
      fire: makeFireNode, crickets: makeCricketsNode, brown: makeBrownNoiseNode,
      silence: () => ({ start(){}, stop(){}, node: ctx.createGain() })
    }[kind] || makeRainNode;
    const unit = maker(); const g = ctx.createGain(); g.gain.value = 0.0;
    unit.node.connect(g).connect(masterGain);
    unit.start(); rampSound(g, 1.0, 1.0);
    return () => stopSound(unit, g);
  }
  function startBreakSound(kind){
    ensureAudio();
    const maker = { ambient: makeAmbientPad, chimes: makeChimes, softbells: makeSoftBells, ocean: makeOceanNode,
      silence: () => ({ start(){}, stop(){}, node: ctx.createGain() })
    }[kind] || makeAmbientPad;
    const unit = maker(); const g = ctx.createGain(); g.gain.value = 0.0;
    unit.node.connect(g).connect(masterGain);
    unit.start(); rampSound(g, 1.0, 1.0);
    return () => stopSound(unit, g);
  }

  // End-of-phase chime (Synth beibehalten)
  function playChime(kind){
    ensureAudio(); if(kind==='none') return;
    const out=ctx.createGain(); out.gain.value=0.0; out.connect(masterGain); const now=ctx.currentTime;
    const envDur = (kind==='gong')?3.8:2.8;
    const partials = (kind==='gong')? [180, 240, 320, 420, 520] : [440, 660, 880, 990];
    const gains    = (kind==='gong')? [0.9, 0.6, 0.45, 0.3, 0.22] : [0.8, 0.35, 0.25, 0.15];
    for(let i=0;i<partials.length;i++){
      const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=partials[i];
      const g=ctx.createGain(); g.gain.value=0.0001; o.connect(g).connect(out);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gains[i], now+0.02+i*0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now+envDur*(1 - i*0.06));
      o.start(now); o.stop(now+envDur+0.2);
    }
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(0.9, now+0.01);
    out.gain.exponentialRampToValueAtTime(0.0001, now+envDur+0.25);
    setTimeout(()=>{ try{out.disconnect();}catch{} }, (envDur+0.3)*1000);
  }

  // ---------- Timer Logic ----------
  function clearTicker(){ if(ticker){ clearInterval(ticker); ticker=null; } }
  function startPhase(name, seconds){
    currentPhase=name; remaining=seconds; totalPhase=seconds; updateUI();
    clearTicker(); ticker=setInterval(()=>{ remaining-=1; updateUI(); if(remaining<=0){ clearTicker(); onPhaseEnd(); } },1000);
  }
  const LONG_BREAK_EVERY = 4;
  function onPhaseEnd(){
    if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; }
    playChime(endSignalEl ? endSignalEl.value : 'none');
    if(currentPhase==='focus'){
      const useLong = (currentCycle % LONG_BREAK_EVERY === 0);
      const brkMin=parseFloat(useLong? (longBreakMinutesEl?.value ?? 15) : (breakMinutesEl?.value ?? 5)) || 5;
      const brkSec=Math.max(1, brkMin)*60;
      speakMsg(useLong?'long_break':'start_break');
      stopCurrentSound=startBreakSound(breakSoundEl ? breakSoundEl.value : 'ambient');
      startPhase('break', brkSec);
    } else if(currentPhase==='break'){
      cyclesDone+=1;
      if(cyclesDone<totalCycles){ speakMsg('next_focus'); startCycle(); }
      else {
        const ask=()=>{ repeatDialog && repeatDialog.showModal && repeatDialog.showModal(); };
        speakMsg('cycle_end'); setTimeout(ask, 250);
        currentPhase='idle'; updateUI(); if(startBtn) startBtn.disabled=false; if(pauseBtn) pauseBtn.disabled=true;
      }
    }
  }
  function startCycle(){
    ensureAudio(); clearTicker(); if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; }
    currentCycle=cyclesDone+1; const focSec=Math.max(1, parseFloat(focusMinutesEl?.value ?? 25))*60;
    stopCurrentSound=startNature(focusSoundEl ? focusSoundEl.value : 'rain');
    startPhase('focus', focSec);
    if(startBtn) startBtn.disabled=true; if(pauseBtn) pauseBtn.disabled=false; if(resetBtn) resetBtn.disabled=false;
  }
  function startRun(){ totalCycles=Math.max(1, parseInt(cyclesCountEl?.value ?? '1',10) || 1); cyclesDone=0; currentCycle=0; startCycle(); }

  // ---------- Speech ----------
  function speakMsg(key){
    if(!speakToggle || !speakToggle.checked) return;
    try{ const u=new SpeechSynthesisUtterance(i18n[LANG].speech[key]); u.lang = (LANG==='de'?'de-DE':'en-US'); speechSynthesis.cancel(); speechSynthesis.speak(u);}catch(e){}
  }

  // ---------- Events ----------
  startBtn && startBtn.addEventListener('click', ()=> startRun());
  pauseBtn && pauseBtn.addEventListener('click', ()=>{
    if(!ctx) return;
    if(ctx.state==='running'){ ctx.suspend(); clearTicker(); setPauseButtonState(); }
    else { ctx.resume(); clearTicker(); ticker=setInterval(()=>{ remaining-=1; updateUI(); if(remaining<=0){ clearTicker(); onPhaseEnd(); } },1000); setPauseButtonState(); }
  });
  resetBtn && resetBtn.addEventListener('click', ()=>{
    clearTicker(); if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; }
    currentPhase='idle'; remaining=parseFloat(focusMinutesEl?.value ?? 25)*60; totalPhase=remaining;
    totalCycles=Math.max(1, parseInt(cyclesCountEl?.value ?? '1',10) || 1); cyclesDone=0; currentCycle=0; updateUI();
    if(startBtn) startBtn.disabled=false; if(pauseBtn){ pauseBtn.disabled=true; setPauseButtonState(); } if(resetBtn) resetBtn.disabled=true;
    if(ctx && ctx.state==='suspended') ctx.resume();
  });
  repeatYes && repeatYes.addEventListener('click', ()=>{ repeatDialog && repeatDialog.close && repeatDialog.close(); speakMsg('next_focus'); setTimeout(()=> startRun(), 300); });
  repeatNo  && repeatNo .addEventListener('click', ()=>{ repeatDialog && repeatDialog.close && repeatDialog.close(); });

  // Tests
  const t1=$('#test1'), t2=$('#test2'), t3=$('#test3');
  t1 && t1.addEventListener('click', ()=>{ focusMinutesEl.value=0.1; focusRange.value=0.1; breakMinutesEl.value=0.05; breakRange.value=0.05; cyclesCountEl.value=2; longBreakMinutesEl.value=0.2; updateInitialTime(); startRun(); });
  t2 && t2.addEventListener('click', ()=>{ focusMinutesEl.value=0.2; focusRange.value=0.2; breakMinutesEl.value=0.1; breakRange.value=0.1; cyclesCountEl.value=3; longBreakMinutesEl.value=0.25; updateInitialTime(); startRun(); });
  t3 && t3.addEventListener('click', ()=>{ focusMinutesEl.value=0.05; focusRange.value=0.05; breakMinutesEl.value=0.03; breakRange.value=0.03; longBreakMinutesEl.value=0.08; cyclesCountEl.value=4; updateInitialTime(); startRun(); });

  function updateInitialTime(){ remaining=parseFloat(focusMinutesEl?.value ?? 25)*60; totalPhase=remaining; updateUI(); }

  // ---------- i18n apply ----------
  function rebuildSelectOptions(selectEl, map){
    if(!selectEl || !map) return;
    const current = selectEl.value;
    const order = Array.from(selectEl.options).map(o => (o.value ?? '').toString());
    const frag = document.createDocumentFragment();
    (order.length?order:Object.keys(map)).forEach(val=>{
      if(map[val]===undefined) return;
      const opt=document.createElement('option');
      opt.value=val; opt.text=map[val]; opt.label=map[val];
      if(val===current) opt.selected=true;
      frag.appendChild(opt);
    });
    selectEl.innerHTML=''; selectEl.appendChild(frag);
    if(current) selectEl.value=current;
  }
  function applyLang(){
    const t=i18n[LANG];
    document.documentElement.lang = (LANG==='de'?'de':'en');
    document.title = t.title;
    const md=document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', t.metaDesc);
    const setText=(sel,val,html=false)=>{ const el=$(sel); if(!el) return; html? el.innerHTML=val : el.textContent=val; };
    setText('#title', t.title); setText('#labelLanguage', t.langLabel); setText('#labelTheme', t.themeLabel);
    if(phaseTitle) phaseTitle.textContent = currentPhase==='focus'?t.focus : currentPhase==='break'?t.break : t.ready;
    if(caption) caption.textContent = currentPhase==='focus'?t.focusCap : currentPhase==='break'?t.breakCap : t.ready;
    if(startBtn) startBtn.textContent=t.start; if(resetBtn) resetBtn.textContent=t.reset; setPauseButtonState();
    setText('#labelSpeak', t.speak); setText('#labelFocusMin', t.focusMin); setText('#labelBreakMin', t.breakMin);
    setText('#labelLongBreak', t.longBreak); setText('#labelFocusSound', t.focusSound); setText('#labelBreakSound', t.breakSound);
    setText('#labelEndSignal', t.endSignal); setText('#labelDucking', t.ducking); setText('#labelCycles', t.cycles); setText('#labelVol', t.volume);
    setText('#testsSummary', t.testsSummary); setText('#testsHint', t.testsHint); setText('#footerNote', t.footer, true);
    setText('#modalTitle', t.modalTitle); setText('#modalQuestion', t.modalQuestion);
    if (repeatYes) repeatYes.textContent=t.yes; if (repeatNo) repeatNo.textContent=t.no;
    setText('#infoTitle', t.descTitle); setText('#pomDesc', t.descText);
    setText('#navImprint', t.navImprint); setText('#navPrivacy', t.navPrivacy);
    rebuildSelectOptions(focusSoundEl, t.opt.focusSound);
    rebuildSelectOptions(breakSoundEl, t.opt.breakSound);
    rebuildSelectOptions(endSignalEl, t.opt.endSignal);
    rebuildSelectOptions(duckingEl, t.opt.ducking);
    rebuildSelectOptions(themeSel, t.opt.theme);
    rebuildSelectOptions(langSel, t.opt.lang);
    setCycleInfo();
  }

  // ---------- Init ----------
  if (langSel) {
    langSel.value = LANG;
    langSel.addEventListener('change', (e)=>{ LANG = e.target.value; setLang(LANG); applyLang(); });
  }
  themeSel && themeSel.addEventListener('change', ()=>{ document.body.classList.toggle('light', themeSel.value==='light'); });
  applyLang();
  updateInitialTime();
})();
