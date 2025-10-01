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

  
  // i18n
  let LANG='de';
  const i18n={
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
        speech:{start_break:'Nun beginnt deine Pause', long_break:'Nun beginnt deine lange Pause', next_focus:'Die nächste Konzentrationsphase beginnt!', cycle_end:'Der Zyklus ist beendet, möchtest du einen weiteren starten?'},
        opt:{
          focusSound:{rain:'Regen', ocean:'Meeresrauschen', forest:'Wald / Wind', stream:'Bachlauf', fire:'Kaminfeuer', crickets:'Grillen', brown:'Brown Noise', silence:'Stille'},
          breakSound:{ambient:'Ambient Pad', chimes:'Leises Glockenspiel', softbells:'Weiche Bells', ocean:'Meeresrauschen', silence:'Stille'},
          endSignal:{none:'Keins', gong:'Gong', bowl:'Klangschale'},
          ducking:{true:'Aktiv', false:'Deaktiviert'},
          theme:{dark:'Dunkel', light:'Hell'},
          lang:{de:'Deutsch', en:'English'}
        }
    },
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
        speech:{start_break:'Your break starts now', long_break:'Your long break starts now', next_focus:'The next focus session is starting!', cycle_end:'The cycle has finished. Do you want to start another one?'},
        opt:{
          focusSound:{rain:'Rain', ocean:'Ocean waves', forest:'Forest / Wind', stream:'Stream', fire:'Fireplace', crickets:'Crickets', brown:'Brown noise', silence:'Silence'},
          breakSound:{ambient:'Ambient pad', chimes:'Soft chimes', softbells:'Soft bells', ocean:'Ocean waves', silence:'Silence'},
          endSignal:{none:'None', gong:'Gong', bowl:'Singing bowl'},
          ducking:{true:'Enabled', false:'Disabled'},
          theme:{dark:'Dark', light:'Light'},
          lang:{de:'Deutsch', en:'English'}
        }
    }
  };

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

    // 1) Select-Optionen: Focus-Sound
    updateOptions(focusSoundEl, t.opt.focusSound);
    // 2) Select-Optionen: Break-Sound
    updateOptions(breakSoundEl, t.opt.breakSound);
    // 3) Select-Optionen: End-Signal
    updateOptions(endSignalEl, t.opt.endSignal);
    // 4) Select-Optionen: Ducking
    updateOptions(duckingEl, t.opt.ducking);
    // 5) Select-Optionen: Theme
    updateOptions(themeSel, t.opt.theme);
    // 6) Select-Optionen: Language (Labels)
    updateOptions(langSel, t.opt.lang);

    setCycleInfo();
  }

  function updateOptions(selectEl, map){
    if(!selectEl || !map) return;
    [...selectEl.options].forEach(opt=>{
      const val = (opt.value ?? '').toString();
      if(map[val]!==undefined){ opt.textContent = map[val]; }
    });
  }

  function setPauseButtonState(){ pauseBtn.textContent = (ctx && ctx.state==='running') ? i18n[LANG].pause : i18n[LANG].resume; }

  // Keep number inputs & ranges in sync
  function bindRange(num,range){
    num.addEventListener('input',()=>{ range.value=num.value; });
    range.addEventListener('input',()=>{ num.value=range.value; updateInitialTime(); });
  }
  bindRange(focusMinutesEl, focusRange);
  bindRange(breakMinutesEl, breakRange);

  function fmt(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

  function speakMsg(key){ if(!speakToggle.checked) return; try{ const u=new SpeechSynthesisUtterance(i18n[LANG].speech[key]); u.lang = (LANG==='de'?'de-DE':'en-US'); speechSynthesis.cancel(); speechSynthesis.speak(u);}catch(e){} }

  function setCycleInfo(){
    const configured=Math.max(1,parseInt(cyclesCountEl.value||'1',10));
    const total=(currentPhase==='idle')?configured:totalCycles;
    if(total<=1) cycleInfoEl.textContent=(LANG==='de')?'Einzelzyklus':'Single cycle'; else cycleInfoEl.textContent=`${(LANG==='de')?'Zyklus':'Cycle'} ${currentCycle}/${total}`;
  }

  // ————————————————————————————————
  // Audio Engine
  // ————————————————————————————————
  let ctx, masterGain;
  function ensureAudio(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      masterGain=ctx.createGain();
      masterGain.gain.value=parseFloat(masterVolEl.value);
      masterGain.connect(ctx.destination);
    }
    if(ctx.state==='suspended') ctx.resume();
  }
  masterVolEl.addEventListener('input',()=>{ if(masterGain) masterGain.gain.value=parseFloat(masterVolEl.value); });

  function rampGain(g,value,time=0.7){ const now=ctx.currentTime; g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(value, now+time); }
  function createNoiseBuffer(seconds=2){ const rate=ctx.sampleRate; const b=ctx.createBuffer(1,seconds*rate,rate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++){ d[i]=Math.random()*2-1; } return b; }

  // Nature generators
  function makeRainNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=700; bp.Q.value=.6; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=200; const delay=ctx.createDelay(1.0); delay.delayTime.value=.25; const feedback=ctx.createGain(); feedback.gain.value=.2; const wet=ctx.createGain(); wet.gain.value=.35; const out=ctx.createGain(); out.gain.value=.8; src.connect(bp); bp.connect(hp); hp.connect(out); hp.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(out); return {start(){src.start();}, stop(){try{src.stop();}catch{}}, node:out}; }
  function makeOceanNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=800; const lfo=ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=.12; const lfoG=ctx.createGain(); lfoG.gain.value=350; const out=ctx.createGain(); out.gain.value=.8; lfo.connect(lfoG); lfoG.connect(lp.frequency); src.connect(lp); lp.connect(out); return {start(){src.start(); lfo.start();}, stop(){try{src.stop();}catch{} try{lfo.stop();}catch{}}, node:out}; }
  function makeForestNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=120; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1500; const lfo=ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=.07; const lfoG=ctx.createGain(); lfoG.gain.value=100; lfo.connect(lfoG); lfoG.connect(hp.frequency); const out=ctx.createGain(); out.gain.value=.75; src.connect(hp); hp.connect(lp); lp.connect(out); return {start(){src.start(); lfo.start();}, stop(){try{src.stop();}catch{} try{lfo.stop();}catch{}}, node:out}; }
  function makeStreamNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=450; bp.Q.value=0.7; const lfo=ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.2; const lfoG=ctx.createGain(); lfoG.gain.value=120; lfo.connect(lfoG); lfoG.connect(bp.frequency); const out=ctx.createGain(); out.gain.value=.8; src.connect(bp); bp.connect(out); return {start(){src.start(); lfo.start();}, stop(){try{src.stop();}catch{} try{lfo.stop();}catch{}}, node:out}; }
  function makeFireNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=400; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3000; const out=ctx.createGain(); out.gain.value=.7; src.connect(hp); hp.connect(lp); lp.connect(out); let id; function crackle(){ const o=ctx.createOscillator(); o.type='square'; o.frequency.value= Math.random()*2000+1200; const g=ctx.createGain(); g.gain.value=0.0001; o.connect(g).connect(out); const now=ctx.currentTime; g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.4, now+0.005); g.gain.exponentialRampToValueAtTime(0.0001, now+0.06); o.start(now); o.stop(now+0.08);} return {start(){ id=setInterval(()=>{ if(Math.random()<0.7) crackle(); }, 120); src.start(); }, stop(){ try{src.stop();}catch{} if(id) clearInterval(id); }, node:out}; }
  function makeCricketsNode(){ const out=ctx.createGain(); out.gain.value=.6; let id; function chirp(){ const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=4200+Math.random()*600; const g=ctx.createGain(); g.gain.value=0.0001; o.connect(g).connect(out); const now=ctx.currentTime; g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.3, now+0.02); g.gain.exponentialRampToValueAtTime(0.0001, now+0.2); o.start(now); o.stop(now+0.22);} return {start(){ id=setInterval(()=>{ chirp(); if(Math.random()<0.5) setTimeout(chirp, 80); }, 900); }, stop(){ if(id) clearInterval(id); }, node:out}; }
  function makeBrownNoiseNode(){ const src=ctx.createBufferSource(); src.buffer=createNoiseBuffer(2); src.loop=true; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=600; const out=ctx.createGain(); out.gain.value=.7; src.connect(lp); lp.connect(out); return {start(){src.start();}, stop(){try{src.stop();}catch{}}, node:out}; }

  function startNature(kind){ ensureAudio(); const maker={rain:makeRainNode,ocean:makeOceanNode,forest:makeForestNode,stream:makeStreamNode,fire:makeFireNode,crickets:makeCricketsNode,brown:makeBrownNoiseNode,silence:()=>({start(){},stop(){},node:ctx.createGain()})}[kind]||makeRainNode; const unit=maker(); const g=ctx.createGain(); g.gain.value=0.0; unit.node.connect(g).connect(masterGain); unit.start(); if(duckingEl.value==='true') rampGain(g,1.0,1.0); else g.gain.value=1.0; return ()=>{ if(duckingEl.value==='true'){ rampGain(g,0.0,0.8); setTimeout(()=>{unit.stop(); g.disconnect();},850);} else { try{unit.stop();}catch{} g.disconnect(); } }; }

  // Break sounds
  function makeAmbientPad(){ const out=ctx.createGain(); out.gain.value=.8; const notes=[220,277.18,329.63,440]; const oscs=notes.map((f,i)=>{ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=f; const g=ctx.createGain(); g.gain.value=0.15 - i*0.02; o.connect(g).connect(out); return o; }); const lfo=ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=.08; const lfoG=ctx.createGain(); lfoG.gain.value=.25; lfo.connect(lfoG); lfoG.connect(out.gain); return {start(){oscs.forEach(o=>o.start()); lfo.start();}, stop(){oscs.forEach(o=>{try{o.stop();}catch{}}); try{lfo.stop();}catch{}}, node:out}; }
  function makeChimes(){ const out=ctx.createGain(); out.gain.value=.8; let id; function note(f,d=.9){ const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=f; const g=ctx.createGain(); g.gain.value=.0001; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3000; o.connect(lp).connect(g).connect(out); const now=ctx.currentTime; g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.35,now+.04); g.gain.exponentialRampToValueAtTime(.0001,now+d); o.start(); o.stop(now+d+.02);} return {start(){ const scale=[523.25,587.33,659.25,783.99,880.00]; let i=0; id=setInterval(()=>{ note(scale[i%scale.length]*(Math.random()<0.4?2:1)); i++; },1200); }, stop(){ if(id) clearInterval(id); }, node:out}; }
  function makeSoftBells(){ const out=ctx.createGain(); out.gain.value=.7; let id; function bell(){ const f=440*Math.pow(2, Math.floor(Math.random()*5)/12); const o=ctx.createOscillator(); o.type='sine'; const g=ctx.createGain(); g.gain.value=0.0001; o.connect(g).connect(out); const now=ctx.currentTime; g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.25, now+0.03); g.gain.exponentialRampToValueAtTime(0.0001, now+1.2); o.start(now); o.stop(now+1.3);} return {start(){ id=setInterval(bell, 1400); }, stop(){ if(id) clearInterval(id); }, node:out}; }

  function startBreakSound(kind){ ensureAudio(); const maker={ambient:makeAmbientPad,chimes:makeChimes,softbells:makeSoftBells,ocean:makeOceanNode,silence:()=>({start(){},stop(){},node:ctx.createGain()})}[kind]||makeAmbientPad; const unit=maker(); const g=ctx.createGain(); g.gain.value=0.0; unit.node.connect(g).connect(masterGain); unit.start(); if(duckingEl.value==='true') rampGain(g,1.0,1.0); else g.gain.value=1.0; return ()=>{ if(duckingEl.value==='true'){ rampGain(g,0.0,0.8); setTimeout(()=>{unit.stop(); g.disconnect();},850);} else { try{unit.stop();}catch{} g.disconnect(); } }; }

  // End-of-phase chimes
  function playChime(kind){ ensureAudio(); if(kind==='none') return; const out=ctx.createGain(); out.gain.value=0.0; out.connect(masterGain); const now=ctx.currentTime; const envDur = (kind==='gong')?3.8:2.8; const partials = (kind==='gong')? [180, 240, 320, 420, 520] : [440, 660, 880, 990]; const gains = (kind==='gong')? [0.9, 0.6, 0.45, 0.3, 0.22] : [0.8, 0.35, 0.25, 0.15]; const oscs=[]; for(let i=0;i<partials.length;i++){ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=partials[i]; const g=ctx.createGain(); g.gain.value = 0.0001; o.connect(g).connect(out); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(gains[i], now+0.02+i*0.005); g.gain.exponentialRampToValueAtTime(0.0001, now+envDur*(1 - i*0.06)); o.start(now); o.stop(now+envDur+0.2); oscs.push(o);} // ramp master chime
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.9, now+0.01); out.gain.exponentialRampToValueAtTime(0.0001, now+envDur+0.25);
    setTimeout(()=>{ try{out.disconnect();}catch{} }, (envDur+0.3)*1000);
  }

  // ————————————————————————————————
  // Timer Logic
  // ————————————————————————————————
  let ticker=null; let remaining=0; let totalPhase=0; let currentPhase='idle'; let stopCurrentSound=null; let totalCycles=1, cyclesDone=0, currentCycle=0;

  function updateRing(){ const CIRC=2*Math.PI*45; const done=(totalPhase>0? (1-remaining/totalPhase):0); ringEl.setAttribute('stroke-dasharray', CIRC.toFixed(1)); ringEl.setAttribute('stroke-dashoffset', (CIRC*(1-done)).toFixed(1)); }

  function updateUI(){ timeEl.textContent=fmt(Math.max(0,remaining)); caption && (caption.textContent= currentPhase==='focus' ? i18n[LANG].focusCap : currentPhase==='break' ? i18n[LANG].breakCap : i18n[LANG].ready); phaseTitle.textContent= currentPhase==='focus' ? i18n[LANG].focus : currentPhase==='break' ? i18n[LANG].break : i18n[LANG].ready; pauseBtn.disabled=(currentPhase==='idle'); resetBtn.disabled=(currentPhase==='idle'); setCycleInfo(); updateRing(); }

  function clearTicker(){ if(ticker){ clearInterval(ticker); ticker=null; } }

  const LONG_BREAK_EVERY = 4;
  function startPhase(name, seconds){ currentPhase=name; remaining=seconds; totalPhase=seconds; updateUI(); clearTicker(); ticker=setInterval(()=>{ remaining-=1; updateUI(); if(remaining<=0){ clearTicker(); onPhaseEnd(); } },1000); }

  function onPhaseEnd(){ if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; } playChime(endSignalEl.value); if(currentPhase==='focus'){ const useLong = (currentCycle % LONG_BREAK_EVERY === 0); const brkMin=parseFloat(useLong? longBreakMinutesEl.value : breakMinutesEl.value) || 5; const brkSec=Math.max(1, brkMin)*60; speakMsg(useLong?'long_break':'start_break'); stopCurrentSound=startBreakSound(breakSoundEl.value); startPhase('break', brkSec); } else if(currentPhase==='break'){ cyclesDone+=1; if(cyclesDone<totalCycles){ speakMsg('next_focus'); startCycle(); } else { const ask=()=>{ repeatDialog.showModal(); }; speakMsg('cycle_end'); setTimeout(ask, 250); currentPhase='idle'; updateUI(); startBtn.disabled=false; pauseBtn.disabled=true; } } }

  function startCycle(){ ensureAudio(); clearTicker(); if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; } currentCycle=cyclesDone+1; const focSec=Math.max(1, parseFloat(focusMinutesEl.value)||25)*60; stopCurrentSound=startNature(focusSoundEl.value); startPhase('focus', focSec); startBtn.disabled=true; pauseBtn.disabled=false; resetBtn.disabled=false; }

  function startRun(){ totalCycles=Math.max(1, parseInt(cyclesCountEl.value,10) || 1); cyclesDone=0; currentCycle=0; startCycle(); }

  function resume(){ if(ctx && ctx.state==='suspended'){ ctx.resume(); } }

  // ————————————————————————————————
  // Events
  // ————————————————————————————————
  startBtn.addEventListener('click', ()=> startRun());

  pauseBtn.addEventListener('click', ()=>{
    if(!ctx) return;
    if(ctx.state==='running'){
      ctx.suspend(); clearTicker(); setPauseButtonState();
    } else {
      ctx.resume(); clearTicker(); ticker=setInterval(()=>{ remaining-=1; updateUI(); if(remaining<=0){ clearTicker(); onPhaseEnd(); } },1000); setPauseButtonState();
    }
  });

  resetBtn.addEventListener('click', ()=>{
    clearTicker(); if(stopCurrentSound){ stopCurrentSound(); stopCurrentSound=null; }
    currentPhase='idle'; remaining=parseFloat(focusMinutesEl.value)*60 || 1500; totalPhase=remaining; totalCycles=Math.max(1, parseInt(cyclesCountEl.value,10) || 1); cyclesDone=0; currentCycle=0; updateUI(); startBtn.disabled=false; pauseBtn.disabled=true; setPauseButtonState(); resetBtn.disabled=true; if(ctx && ctx.state==='suspended') ctx.resume();
  });

  repeatYes && repeatYes.addEventListener('click', ()=>{ repeatDialog.close(); speakMsg('next_focus'); setTimeout(()=> startRun(), 300); });
  repeatNo && repeatNo.addEventListener('click', ()=> repeatDialog.close());

  // Test buttons
  const t1=$('#test1'), t2=$('#test2'), t3=$('#test3');
  if(t1){ t1.addEventListener('click', ()=>{ focusMinutesEl.value=0.1; focusRange.value=0.1; breakMinutesEl.value=0.05; breakRange.value=0.05; cyclesCountEl.value=2; longBreakMinutesEl.value=0.2; updateInitialTime(); startRun(); }); }
  if(t2){ t2.addEventListener('click', ()=>{ focusMinutesEl.value=0.2; focusRange.value=0.2; breakMinutesEl.value=0.1; breakRange.value=0.1; cyclesCountEl.value=3; longBreakMinutesEl.value=0.25; updateInitialTime(); startRun(); }); }
  if(t3){ t3.addEventListener('click', ()=>{ focusMinutesEl.value=0.05; focusRange.value=0.05; breakMinutesEl.value=0.03; breakRange.value=0.03; longBreakMinutesEl.value=0.08; cyclesCountEl.value=4; updateInitialTime(); startRun(); }); }

  function updateInitialTime(){ remaining=parseFloat(focusMinutesEl.value)*60; totalPhase=remaining; updateUI(); }

  // Language & Theme switchers
  langSel.addEventListener('change', ()=>{ LANG=langSel.value; applyLang(); });
  themeSel.addEventListener('change', ()=>{ const v=themeSel.value; document.body.classList.toggle('light', v==='light'); });

  // Initial UI
  applyLang();
  updateInitialTime();
})();
