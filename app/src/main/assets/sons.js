/* Lyham Life — sons.js : tout est synthétisé avec la Web Audio API (aucun fichier audio) */
(function () {
  'use strict';
  var LL = window.LyhamLife;
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, sfxBus, musBus, ambBus, analyser, noiseBuf = null, anaData = null;
  var A = LL.audio = { ready: false, musicStyle: null, lastErr: null, played: {} };

  function S() { return LL.S; }
  function vol() {
    if (!ctx) return;
    var st = S().settings, t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); if (st.muted) { master.gain.setValueAtTime(0, t); master.gain.value = 0; } else master.gain.setTargetAtTime(1, t, 0.02);
    sfxBus.gain.setTargetAtTime(st.sfx, t, 0.02);
    ambBus.gain.setTargetAtTime(st.sfx * 0.5, t, 0.05);
    musBus.gain.setTargetAtTime(st.mus * 0.6, t, 0.02);
  }
  LL.audioVolumes = vol;

  /* Démarrage après le premier toucher (politique des navigateurs) */
  LL.audioUnlock = function () {
    if (!AC) { A.lastErr = 'Web Audio indisponible'; return false; }
    try {
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain(); master.connect(ctx.destination);
        var comp = ctx.createDynamicsCompressor(); comp.connect(master);
        sfxBus = ctx.createGain(); sfxBus.connect(comp);
        ambBus = ctx.createGain(); ambBus.connect(comp);
        musBus = ctx.createGain(); analyser = ctx.createAnalyser(); analyser.fftSize = 64; anaData = new Uint8Array(analyser.frequencyBinCount);
        musBus.connect(analyser); analyser.connect(comp);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var dd = noiseBuf.getChannelData(0); for (var i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
        A.ready = true; vol();
      }
      if (ctx.state === 'suspended' && !A.paused) ctx.resume();
      return true;
    } catch (e) { A.lastErr = String(e); return false; }
  };

  /* --------- Briques de synthèse --------- */
  function env(g, t, a, peak, dur, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.setValueAtTime(Math.max(peak, 0.0002), t + Math.max(a, dur)); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a, dur) + (rel || 0.08)); }
  function tone(o) { // {f, f2, type, t, dur, v, a, rel, out, det, filter}
    var t = o.t != null ? o.t : ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain(), last = g;
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t); if (o.det) osc.detune.value = o.det;
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(o.f2, 1), t + (o.slide || o.dur));
    osc.connect(g);
    if (o.filter) { var bq = ctx.createBiquadFilter(); bq.type = o.filter.type || 'lowpass'; bq.frequency.value = o.filter.f; bq.Q.value = o.filter.q || 1; g.connect(bq); last = bq; }
    last.connect(o.out || sfxBus);
    env(g, t, o.a || 0.005, o.v || 0.2, o.dur || 0.1, o.rel || 0.08);
    osc.start(t); osc.stop(t + (o.dur || 0.1) + (o.rel || 0.08) + 0.05);
  }
  function noise(o) { // {t, dur, v, type, f, q, out, f2}
    var t = o.t != null ? o.t : ctx.currentTime, src = ctx.createBufferSource(), bq = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; bq.type = o.type || 'bandpass'; bq.frequency.setValueAtTime(o.f || 1000, t); bq.Q.value = o.q || 1;
    if (o.f2) bq.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    src.connect(bq); bq.connect(g); g.connect(o.out || sfxBus); env(g, t, o.a || 0.005, o.v || 0.2, o.dur || 0.1, o.rel || 0.05);
    src.start(t, Math.random()); src.stop(t + (o.dur || 0.1) + (o.rel || 0.05) + 0.05);
  }
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  A.midi = midi;
  function pluck(n, t, v, out) { tone({ f: midi(n), type: 'triangle', t: t, dur: 0.02, v: v || 0.18, rel: 0.6, out: out, filter: { f: 2400 } }); tone({ f: midi(n) * 2, type: 'sine', t: t, dur: 0.01, v: (v || 0.18) * 0.3, rel: 0.3, out: out }); }
  function pianoNote(n, t, v, out) { tone({ f: midi(n), type: 'triangle', t: t, dur: 0.05, v: v || 0.2, rel: 0.9, out: out }); tone({ f: midi(n) * 2, type: 'sine', t: t, dur: 0.03, v: (v || 0.2) * 0.25, rel: 0.5, out: out }); tone({ f: midi(n) * 3, type: 'sine', t: t, dur: 0.02, v: (v || 0.2) * 0.08, rel: 0.3, out: out }); }

  /* --------- Table des effets sonores (extensible : une entrée = un son) --------- */
  var SFX = {
    click: function (t) { tone({ f: 900, f2: 600, type: 'square', t: t, dur: 0.03, v: 0.06, filter: { f: 3000 } }); },
    ok: function (t) { [72, 76, 79, 84].forEach(function (n, i) { tone({ f: midi(n), type: 'triangle', t: t + i * 0.07, dur: 0.08, v: 0.15 }); }); },
    ko: function (t) { tone({ f: 330, f2: 180, type: 'sawtooth', t: t, dur: 0.25, v: 0.08, filter: { f: 900 } }); },
    coin: function (t) { tone({ f: 988, type: 'square', t: t, dur: 0.06, v: 0.07 }); tone({ f: 1319, type: 'square', t: t + 0.06, dur: 0.18, v: 0.07 }); },
    skill: function (t) { [60, 64, 67, 72, 76].forEach(function (n, i) { tone({ f: midi(n), type: 'sine', t: t + i * 0.05, dur: 0.1, v: 0.12 }); }); },
    lettre: function (t) { tone({ f: 1046, type: 'sine', t: t, dur: 0.15, v: 0.15 }); tone({ f: 1568, type: 'sine', t: t + 0.12, dur: 0.3, v: 0.12 }); },
    fanfare: function (t) { [[67, 0], [67, .15], [72, .3], [76, .55], [72, .75], [76, .9], [79, 1.1]].forEach(function (p) { tone({ f: midi(p[0]), type: 'sawtooth', t: t + p[1], dur: 0.14, v: 0.08, filter: { f: 2200 } }); tone({ f: midi(p[0] - 12), type: 'square', t: t + p[1], dur: 0.14, v: 0.04, filter: { f: 1200 } }); }); },
    carillon: function (t) { [84, 79, 76, 72].forEach(function (n, i) { tone({ f: midi(n), type: 'sine', t: t + i * 0.25, dur: 0.05, v: 0.15, rel: 1 }); }); },
    pas_parquet: function (t) { noise({ t: t, dur: 0.03, v: 0.12, type: 'bandpass', f: 500, q: 2 }); tone({ f: 120, f2: 80, t: t, dur: 0.03, v: 0.08 }); },
    pas_carrelage: function (t) { noise({ t: t, dur: 0.02, v: 0.1, type: 'highpass', f: 2500 }); tone({ f: 900, f2: 600, t: t, dur: 0.02, v: 0.03 }); },
    pas_herbe: function (t) { noise({ t: t, dur: 0.06, v: 0.06, type: 'highpass', f: 3500 }); },
    pas_sable: function (t) { noise({ t: t, dur: 0.08, v: 0.05, type: 'bandpass', f: 1800, q: 0.5 }); },
    pas_neige: function (t) { noise({ t: t, dur: 0.07, v: 0.08, type: 'lowpass', f: 1200 }); },
    porte: function (t) { tone({ f: 180, f2: 140, type: 'sawtooth', t: t, dur: 0.25, v: 0.03, filter: { f: 600 } }); noise({ t: t + 0.25, dur: 0.05, v: 0.2, type: 'lowpass', f: 400 }); },
    miaou: function (t) { tone({ f: 600, f2: 900, type: 'sawtooth', t: t, dur: 0.15, slide: 0.12, v: 0.05, filter: { f: 1800, q: 4 } }); tone({ f: 900, f2: 500, type: 'sawtooth', t: t + 0.15, dur: 0.25, v: 0.05, filter: { f: 1600, q: 4 } }); },
    ronron: function (t) { for (var i = 0; i < 6; i++) noise({ t: t + i * 0.22, dur: 0.12, v: 0.12, type: 'lowpass', f: 160, q: 3 }); },
    rebond: function (t) { tone({ f: 260, f2: 140, t: t, dur: 0.06, v: 0.15 }); },
    kick: function (t) { tone({ f: 180, f2: 60, t: t, dur: 0.08, v: 0.25 }); noise({ t: t, dur: 0.02, v: 0.1, type: 'highpass', f: 2000 }); },
    casserole: function (t) { tone({ f: 523, type: 'triangle', t: t, dur: 0.02, v: 0.12, rel: 0.4 }); tone({ f: 1390, type: 'sine', t: t, dur: 0.02, v: 0.06, rel: 0.3 }); noise({ t: t, dur: 0.03, v: 0.1, type: 'highpass', f: 3000 }); },
    gresille: function (t) { for (var i = 0; i < 12; i++) noise({ t: t + i * 0.09 + Math.random() * 0.04, dur: 0.02, v: 0.05, type: 'highpass', f: 5000 }); noise({ t: t, dur: 1, v: 0.03, type: 'highpass', f: 6000 }); },
    robinet: function (t) { noise({ t: t, dur: 1.2, v: 0.08, type: 'bandpass', f: 1500, q: 0.7 }); },
    douche: function (t) { noise({ t: t, dur: 2, v: 0.09, type: 'highpass', f: 1800 }); },
    frigo: function (t) { noise({ t: t, dur: 0.12, v: 0.12, type: 'lowpass', f: 300 }); tone({ f: 110, t: t + 0.1, dur: 0.6, v: 0.03, type: 'sawtooth', filter: { f: 200 } }); },
    lampe: function (t) { noise({ t: t, dur: 0.01, v: 0.2, type: 'highpass', f: 3000 }); tone({ f: 2200, t: t, dur: 0.01, v: 0.05 }); },
    clavier: function (t) { for (var i = 0; i < 8; i++) noise({ t: t + i * 0.08 + Math.random() * 0.03, dur: 0.015, v: 0.08, type: 'bandpass', f: 3000 + Math.random() * 1500, q: 3 }); },
    visio: function (t) { tone({ f: 660, t: t, dur: 0.1, v: 0.08 }); tone({ f: 880, t: t + 0.12, dur: 0.15, v: 0.08 }); },
    telephone: function (t) { for (var i = 0; i < 2; i++) { tone({ f: 1200, type: 'square', t: t + i * 0.3, dur: 0.2, v: 0.03 }); tone({ f: 1500, type: 'square', t: t + i * 0.3 + 0.05, dur: 0.15, v: 0.02 }); } },
    zap: function (t) { noise({ t: t, dur: 0.12, v: 0.1, type: 'bandpass', f: 4000, f2: 300 }); },
    zzz: function (t) { tone({ f: 220, f2: 180, t: t, dur: 0.6, v: 0.04, type: 'sine' }); },
    splash: function (t) { noise({ t: t, dur: 0.4, v: 0.15, type: 'lowpass', f: 2500, f2: 400 }); },
    bulles: function (t) { for (var i = 0; i < 6; i++) tone({ f: 600 + Math.random() * 700, f2: 1400, t: t + i * 0.07, dur: 0.04, v: 0.05 }); },
    flash: function (t) { tone({ f: 2000, f2: 4000, t: t, dur: 0.15, v: 0.05 }); noise({ t: t + 0.1, dur: 0.05, v: 0.1, type: 'highpass', f: 4000 }); },
    coeur: function (t) { tone({ f: 784, t: t, dur: 0.08, v: 0.1 }); tone({ f: 1046, t: t + 0.09, dur: 0.15, v: 0.1 }); },
    pop: function (t) { tone({ f: 400, f2: 900, t: t, dur: 0.05, v: 0.12 }); },
    swoosh: function (t) { noise({ t: t, dur: 0.25, v: 0.08, type: 'bandpass', f: 600, f2: 3000, q: 1.5 }); },
    page: function (t) { noise({ t: t, dur: 0.15, v: 0.07, type: 'highpass', f: 2500 }); },
    eau: function (t) { for (var i = 0; i < 5; i++) tone({ f: 1200 + Math.random() * 800, f2: 600, t: t + i * 0.1, dur: 0.03, v: 0.05 }); noise({ t: t, dur: 0.7, v: 0.04, type: 'bandpass', f: 2500 }); },
    canard: function (t) { [0, 0.2].forEach(function (d) { tone({ f: 380, f2: 300, type: 'sawtooth', t: t + d, dur: 0.12, v: 0.06, filter: { f: 1200, q: 6 } }); }); },
    oiseau: function (t) { var b = 2400 + Math.random() * 1200; for (var i = 0; i < 3; i++) tone({ f: b, f2: b * 1.4, t: t + i * 0.09, dur: 0.05, v: 0.04 }); },
    vent: function (t) { noise({ t: t, dur: 1.2, v: 0.05, type: 'bandpass', f: 400, f2: 900, q: 0.6 }); },
    croque: function (t) { for (var i = 0; i < 3; i++) noise({ t: t + i * 0.12, dur: 0.04, v: 0.12, type: 'highpass', f: 1800 }); },
    papier: function (t) { noise({ t: t, dur: 0.3, v: 0.06, type: 'highpass', f: 3000 }); },
    toc: function (t) { [0, 0.18, 0.36].forEach(function (d) { tone({ f: 160, f2: 100, t: t + d, dur: 0.04, v: 0.25 }); noise({ t: t + d, dur: 0.02, v: 0.1, type: 'lowpass', f: 800 }); }); },
    ding: function (t) { tone({ f: 1760, t: t, dur: 0.02, v: 0.1, rel: 0.8 }); },
    patin: function (t) { noise({ t: t, dur: 0.35, v: 0.06, type: 'highpass', f: 5000, f2: 7000 }); },
    applause: function (t) { for (var i = 0; i < 30; i++) noise({ t: t + Math.random() * 1.2, dur: 0.02, v: 0.08, type: 'bandpass', f: 1500 + Math.random() * 1500, q: 1 }); },
    cloche: function (t) { [72, 76, 79].forEach(function (n, i) { tone({ f: midi(n), t: t + i * 0.4, dur: 0.03, v: 0.12, rel: 1.2 }); }); },
    sifflet: function (t) { tone({ f: 2600, f2: 2800, type: 'square', t: t, dur: 0.35, v: 0.03, filter: { f: 4000 } }); },
    cuillere: function (t) { tone({ f: 2400, t: t, dur: 0.01, v: 0.05, rel: 0.2 }); tone({ f: 2400, t: t + 0.3, dur: 0.01, v: 0.05, rel: 0.2 }); },
    ecrire: function (t) { for (var i = 0; i < 5; i++) noise({ t: t + i * 0.12, dur: 0.08, v: 0.04, type: 'highpass', f: 4000 }); },
    tv1: function (t) { [72, 74, 76, 79, 76].forEach(function (n, i) { tone({ f: midi(n), type: 'square', t: t + i * 0.1, dur: 0.08, v: 0.05 }); }); },
    tv2: function (t) { [60, 67, 72].forEach(function (n, i) { tone({ f: midi(n), t: t + i * 0.2, dur: 0.2, v: 0.08, rel: 0.6 }); }); },
    tv3: function (t) { [0, .12, .24, .36].forEach(function (d, i) { tone({ f: 60, f2: 40, t: t + d, dur: 0.06, v: 0.2 }); tone({ f: midi(64 + i * 3), type: 'sawtooth', t: t + d, dur: 0.1, v: 0.04, filter: { f: 1500 } }); }); },
    tv4: function (t) { SFX.sifflet(t); [67, 72].forEach(function (n, i) { tone({ f: midi(n), type: 'sawtooth', t: t + 0.4 + i * 0.15, dur: 0.12, v: 0.05, filter: { f: 2000 } }); }); },
    tv5: function (t) { [76, 79, 84].forEach(function (n, i) { tone({ f: midi(n), type: 'triangle', t: t + i * 0.12, dur: 0.1, v: 0.08 }); }); SFX.gresille(t + 0.3); },
    tv6: function (t) { tone({ f: 200, f2: 1200, t: t, dur: 0.8, v: 0.05, type: 'sawtooth', filter: { f: 1500 } }); },
    tv7: function (t) { [69, 72, 76, 72].forEach(function (n, i) { tone({ f: midi(n), type: 'square', t: t + i * 0.15, dur: 0.1, v: 0.04 }); tone({ f: 55, f2: 40, t: t + i * 0.15, dur: 0.05, v: 0.15 }); }); },
    tv8: function (t) { [76, 76, 79, 72].forEach(function (n, i) { tone({ f: midi(n), type: 'square', t: t + i * 0.13, dur: 0.1, v: 0.05 }); }); },
    tv9: function (t) { [67, 72, 76, 72, 79].forEach(function (n, i) { tone({ f: midi(n), type: 'triangle', t: t + i * 0.11, dur: 0.09, v: 0.08 }); }); }
  };
  A.SFX = SFX;
  var CAPTIONS = { lettre: '📬 Ding ! Une lettre de Lisa est arrivée', fanfare: '🎺 Fanfare de fête !', carillon: '🔔 Carillon du réveil', toc: '🚪 Toc toc toc', telephone: '📞 Le téléphone sonne', miaou: '🐱 « Miaou ! »', ko: '❌ Mauvaise réponse', ok: '✅ Bonne réponse', skill: '⭐ Nouvelle compétence !', cloche: '🔔 La sonnerie retentit', sifflet: '📣 Coup de sifflet', applause: '👏 Applaudissements' };

  LL.son = function (name, delay) {
    if (!ctx || !A.ready) { if (CAPTIONS[name] && LL.caption) LL.caption(CAPTIONS[name]); return false; }
    var t = ctx.currentTime + (delay || 0);
    // Limiteur : au plus 24 sons par demi-seconde (évite de saturer le moteur audio sur les téléphones modestes)
    if (ctx.currentTime - (A.win || 0) > 0.5) { A.win = ctx.currentTime; A.count = 0; }
    if (++A.count > 24) { A.dropped = (A.dropped || 0) + 1; if (CAPTIONS[name] && LL.caption) LL.caption(CAPTIONS[name]); return true; }
    try {
      if (name.indexOf('note_') === 0) pianoNote(+name.slice(5), t);
      else if (name.indexOf('guitare_') === 0) pluck(+name.slice(8), t, 0.22);
      else if (name.indexOf('voix_') === 0) voice(name.slice(5), t);
      else if (SFX[name]) SFX[name](t);
      else return false;
      A.played[name] = (A.played[name] || 0) + 1;
      if (CAPTIONS[name] && LL.caption) LL.caption(CAPTIONS[name]);
      return true;
    } catch (e) { A.lastErr = String(e); return false; }
  };
  /* « Blablas » mélodiques des voix : chaque personnage a son timbre */
  var VOICES = { lyham: [74, 'triangle'], casimir: [52, 'sawtooth'], tania: [69, 'triangle'], daryl: [55, 'square'], cataleya: [76, 'triangle'], elynn: [72, 'sine'], noah: [60, 'square'], lopez: [67, 'sine'], prof: [57, 'sawtooth'], vendeur: [62, 'triangle'], lisa: [77, 'sine'] };
  function voice(who, t) {
    var v = VOICES[who] || VOICES.vendeur, n = 3 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) tone({ f: midi(v[0] + [0, 2, 4, 7, 5, -3][Math.floor(Math.random() * 6)]), type: v[1], t: t + i * 0.085, dur: 0.06, v: 0.035, filter: { f: 1400, q: 2 } });
  }

  /* --------- Ambiances par lieu --------- */
  var amb = { lieu: null, loops: [], next: 0 };
  function loopNoise(o) { var src = ctx.createBufferSource(), bq = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = noiseBuf; src.loop = true; bq.type = o.type; bq.frequency.value = o.f; bq.Q.value = o.q || 0.7; g.gain.value = 0; src.connect(bq); bq.connect(g); g.connect(ambBus); src.start(); g.gain.setTargetAtTime(o.v, ctx.currentTime, 0.5); var lfo = null; if (o.lfo) { lfo = ctx.createOscillator(); var lg = ctx.createGain(); lfo.frequency.value = o.lfo; lg.gain.value = o.v * 0.8; lfo.connect(lg); lg.connect(g.gain); lfo.start(); } amb.loops.push({ src: src, g: g, lfo: lfo }); }
  LL.ambiance = function (lieu) {
    amb.lieu = lieu;
    if (!ctx) return;
    amb.loops.forEach(function (l) { try { l.g.gain.setTargetAtTime(0, ctx.currentTime, 0.2); l.src.stop(ctx.currentTime + 1); if (l.lfo) l.lfo.stop(ctx.currentTime + 1); } catch (e) { } });
    amb.loops = [];
    var w = LL.weather(S().day), out = LL.PLACES && LL.PLACES[lieu] && LL.PLACES[lieu].out;
    if (lieu === 'plage') loopNoise({ type: 'lowpass', f: 700, v: 0.35, lfo: 0.12 });
    if (lieu === 'cour' || lieu === 'cantine' || lieu === 'foyer') loopNoise({ type: 'bandpass', f: 900, q: 0.8, v: 0.12, lfo: 0.3 });
    if (lieu === 'piscine') loopNoise({ type: 'bandpass', f: 1600, q: 0.6, v: 0.08, lfo: 0.2 });
    if (w === 'pluie') loopNoise({ type: 'highpass', f: out ? 1200 : 2500, v: out ? 0.25 : 0.07 });
  };
  function ambTick() {
    if (!ctx || !amb.lieu || A.paused) return;
    var t = ctx.currentTime; if (t < amb.next) return;
    var l = amb.lieu, h = S().min / 60, night = h < 6.5 || h > 21;
    if ((l === 'jardin' || l === 'parc' || l === 'chez_elynn') && !night) { birdOn(t); amb.next = t + 1.5 + Math.random() * 3; }
    else if (l === 'cour') { voice(['noah', 'cataleya', 'elynn', 'vendeur'][Math.floor(Math.random() * 4)], t); amb.next = t + 0.6 + Math.random() * 1.2; }
    else if (l === 'cafe') { [0, 4, 7, 11].forEach(function (k, i) { tone({ f: midi(57 + k + (Math.random() < .5 ? 0 : 5)), type: 'sine', t: t + i * 0.35, dur: 0.2, v: 0.03, rel: 0.8, out: ambBus }); }); amb.next = t + 1.6; }
    else if (l === 'bureau' && LL.papaAuBureau && LL.papaAuBureau()) { SFX.clavier(t); amb.next = t + 3 + Math.random() * 4; }
    else if (l === 'plage') { tone({ f: 1800, f2: 1300, t: t, dur: 0.3, v: 0.02, type: 'sawtooth', filter: { f: 2000 }, out: ambBus }); amb.next = t + 6 + Math.random() * 6; }
    else amb.next = t + 2;
  }
  function birdOn(t) { var b = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 4); for (var i = 0; i < n; i++) tone({ f: b * (1 + Math.random() * 0.2), f2: b * 1.5, t: t + i * 0.11, dur: 0.05, v: 0.03, out: ambBus }); }

  /* --------- Musique générative (mélodies originales) --------- */
  var STYLES = {
    pop: { nom: 'Pop', bpm: 112, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 5, 3, 4], lead: 'square', light: '#ff7ac6' },
    dance: { nom: 'Dance', bpm: 124, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6], lead: 'sawtooth', light: '#7af0ff' },
    chill: { nom: 'Chill / lo-fi', bpm: 78, root: 62, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 6, 2], lead: 'triangle', light: '#ffc28a' },
    piano: { nom: 'Piano doux', bpm: 70, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3], lead: 'piano', light: '#ffe9b3' },
    rock: { nom: 'Rock', bpm: 132, root: 52, scale: [0, 3, 5, 7, 10], prog: [0, 3, 4, 3], lead: 'sawtooth', light: '#ff5d5d' },
    monde: { nom: 'Musique du monde', bpm: 100, root: 62, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 1, 0, 6], lead: 'triangle', light: '#9dff8a' }
  };
  A.STYLES = STYLES;
  var mus = { style: null, list: null, li: 0, step: 0, next: 0, seed: 1, motif: null, bars: 0 };
  function srand() { mus.seed = (mus.seed * 16807) % 2147483647; return (mus.seed - 1) / 2147483646; }
  function newMotif(st) { var m = [], p = 2; for (var i = 0; i < 8; i++) { p = Math.max(0, Math.min(6, p + Math.floor(srand() * 5) - 2)); m.push(srand() < 0.2 ? -1 : p); } return m; }
  LL.musique = function (style) {
    if (style === 'playlist') { mus.list = Object.keys(STYLES); mus.li = 0; style = mus.list[0]; } else if (!STYLES[style]) return false; else mus.list = null;
    mus.style = style; mus.step = 0; mus.bars = 0; mus.seed = 1 + Math.floor(Math.random() * 99999); mus.motif = newMotif(STYLES[style]);
    A.musicStyle = style; if (ctx) mus.next = ctx.currentTime + 0.1; return true;
  };
  LL.musiqueSuivante = function () { var k = Object.keys(STYLES); if (mus.list) { mus.li = (mus.li + 1) % k.length; var keep = mus.list; LL.musique(k[mus.li]); mus.list = keep; } else LL.musique(k[(k.indexOf(mus.style) + 1) % k.length] || 'pop'); };
  LL.stopMusique = function () { mus.style = null; mus.list = null; A.musicStyle = null; };
  LL.musiqueLevel = function () { if (!analyser || !mus.style) return 0; analyser.getByteFrequencyData(anaData); var s = 0; for (var i = 0; i < 8; i++) s += anaData[i]; return s / (8 * 255); };
  function musTick() {
    if (!ctx || !mus.style || A.paused) return;
    var st = STYLES[mus.style], spb = 60 / st.bpm / 2; // croches
    if (mus.next < ctx.currentTime - 0.5) mus.next = ctx.currentTime + 0.05;
    while (mus.next < ctx.currentTime + 0.25) {
      var s = mus.step % 8, bar = Math.floor(mus.step / 8), deg = st.prog[bar % 4], t = mus.next, o = musBus;
      var chord = [0, 2, 4].map(function (k) { var i = deg + k; return st.root + st.scale[i % st.scale.length] + 12 * Math.floor(i / st.scale.length); });
      if (s === 0) chord.forEach(function (n) { if (st.lead === 'piano') pianoNote(n - 12, t, 0.07, o); else tone({ f: midi(n - 12), type: mus.style === 'chill' ? 'sine' : 'triangle', t: t, dur: spb * 7, v: 0.035, a: 0.05, rel: 0.3, out: o }); });
      tone({ f: midi(chord[0] - 24), type: mus.style === 'rock' ? 'sawtooth' : 'triangle', t: t, dur: spb * 0.8, v: (s % 2 === 0) ? 0.09 : 0.04, filter: { f: 500 }, out: o });
      if (mus.style !== 'piano' && mus.style !== 'chill' || s % 4 === 0) { if (s % 4 === 0) tone({ f: 150, f2: 45, t: t, dur: 0.08, v: mus.style === 'chill' ? 0.12 : 0.25, out: o }); }
      if ((mus.style === 'dance' || mus.style === 'pop' || mus.style === 'rock') && s % 2 === 1) noise({ t: t, dur: 0.02, v: 0.05, type: 'highpass', f: 7000, out: o });
      if (s === 4 && mus.style !== 'piano') noise({ t: t, dur: 0.08, v: mus.style === 'chill' ? 0.04 : 0.1, type: 'bandpass', f: 1800, out: o });
      if (mus.style === 'chill' && s === 0) noise({ t: t, dur: spb * 8, v: 0.008, type: 'highpass', f: 3000, out: o }); // craquement vinyle
      var m = mus.motif[s]; if (bar % 4 === 3 && s > 3) m = -1;
      if (m >= 0) { var n = st.root + 12 + st.scale[(m + deg) % st.scale.length]; if (st.lead === 'piano') pianoNote(n, t, 0.12, o); else if (mus.style === 'monde') pluck(n, t, 0.12, o); else tone({ f: midi(n), type: st.lead, t: t, dur: spb * 0.7, v: mus.style === 'rock' ? 0.035 : 0.045, filter: { f: 2600 }, out: o }); }
      mus.step++; mus.next += spb;
      if (s === 7 && bar % 4 === 3) { mus.bars++; if (srand() < 0.5) mus.motif = newMotif(st); if (mus.list && mus.bars % 4 === 0) { mus.li = (mus.li + 1) % mus.list.length; mus.style = mus.list[mus.li]; A.musicStyle = mus.style; } }
    }
  }
  /* Appelé par la boucle principale (pas de minuterie séparée) */
  LL.audioTick = function () { if (!ctx) return; try { musTick(); ambTick(); } catch (e) { A.lastErr = String(e); } };

  LL.toggleMute = function () { var s = S().settings; s.muted = !s.muted; vol(); if (LL.save) LL.save(); return s.muted; };
  window.onPauseJeu = function () { A.paused = true; if (ctx && ctx.state === 'running') ctx.suspend(); if (LL.save) LL.save(); };
  window.onRepriseJeu = function () { A.paused = false; if (ctx && ctx.state === 'suspended') ctx.resume(); };
  document.addEventListener('visibilitychange', function () { if (document.hidden) window.onPauseJeu(); else window.onRepriseJeu(); });
  A.state = function () { return ctx ? ctx.state : 'none'; };
  A.gainNow = function () { return master ? master.gain.value : 0; };
})();
