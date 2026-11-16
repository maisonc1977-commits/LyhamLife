/* Lyham Life — monde.js : moteur de scène (déplacements, personnages, Moka, ballon, télé, PNJ, bulles, particules, lumière) */
(function () {
  'use strict';
  var LL = window.LyhamLife, K = LL.K, W = 960, H = 600, GY0 = 470, GY1 = 590, SPEED = 340;
  var M = LL.M = { parts: [], npcs: [], bubbles: [], speech: [], anim: null, queue: [], fade: 0, tv: { on: false, ch: 1, since: 0 }, tvXp: 0, title: '', titleT: 0, flash: 0, instant: false, t: 0, frames: 0, errors: 0 };
  var cv, g, dpr = 1, cache = {}, lastTs = 0, loopOn = false, env = {};
  var rr = K.rr, lg = K.lg, rg = K.rg, sh = K.shade;

  /* ================= Personnages : apparence constante ================= */
  var CHARS = M.CHARS = {
    lyham: { nom: 'Lyham', skin: '#b07150', hair: '#3b2416', style: 'pony', acc: '#ff6fa8', h: 1, girl: 1, eyes: '#2b1a10' },
    casimir: { nom: 'Papa', full: 'Casimir', skin: '#8a5a3c', hair: '#1f1712', style: 'short', top: '#4a6fa5', bottom: '#3a3f55', h: 1.17, beard: 1, glasses: 1, voice: 'casimir' },
    tania: { nom: 'Maman', full: 'Tania', skin: '#e2b08c', hair: '#5a3418', style: 'long', top: '#e47aa8', bottom: '#5a4a7a', h: 1.1, girl: 1, voice: 'tania' },
    daryl: { nom: 'Daryl', skin: '#a06a48', hair: '#1f1712', style: 'curly', top: '#2a9d8f', bottom: '#2b2d42', h: 1.2, beard: 1, cap: '#e63946', voice: 'daryl' },
    cataleya: { nom: 'Cataleya', skin: '#c88a64', hair: '#2b1810', style: 'braids', acc: '#ffd166', top: '#ffb703', bottom: '#3d5a80', h: 0.98, girl: 1, voice: 'cataleya' },
    elynn: { nom: 'Elynn', skin: '#f1c9a5', hair: '#b5651d', style: 'bun', acc: '#7af0ff', top: '#80ed99', bottom: '#6d597a', h: 1.0, girl: 1, freckles: 1, voice: 'elynn' },
    noah: { nom: 'Noah', skin: '#d9a07b', hair: '#6b4a2b', style: 'short', top: '#ef476f', bottom: '#3d405b', h: 1.02, voice: 'noah' },
    lopez: { nom: 'Mme Lopez', skin: '#d8a47f', hair: '#2b1810', style: 'bun', acc: '#c77dff', top: '#2b2340', bottom: '#2b2340', h: 1.12, girl: 1, voice: 'lopez' },
    prof_maths: { nom: 'M. Martin', skin: '#e8c0a0', hair: '#8a8a8a', style: 'short', top: '#6d597a', bottom: '#3a3f55', h: 1.15, glasses: 1, voice: 'prof', prof: 'maths' },
    prof_fr: { nom: 'Mme Dubois', skin: '#f0caa8', hair: '#a0522d', style: 'long', top: '#2a9d8f', bottom: '#3d405b', h: 1.1, girl: 1, glasses: 1, voice: 'prof', prof: 'francais' },
    prof_ang: { nom: 'Mrs Clarke', skin: '#f5d0b5', hair: '#e8c06a', style: 'bun', acc: '#e63946', top: '#c2185b', bottom: '#2b2d42', h: 1.1, girl: 1, voice: 'prof', prof: 'anglais' },
    prof_hg: { nom: 'M. Benali', skin: '#b98260', hair: '#1f1712', style: 'short', top: '#f4a261', bottom: '#3a3f55', h: 1.16, beard: 1, voice: 'prof', prof: 'histoire' },
    prof_sc: { nom: 'Mme Nguyen', skin: '#efcfa8', hair: '#111', style: 'long', top: '#fff', bottom: '#3d5a80', h: 1.08, girl: 1, glasses: 1, voice: 'prof', prof: 'sciences' },
    prof_philo: { nom: 'M. Laurent', skin: '#e3b896', hair: '#555', style: 'short', top: '#3d5a80', bottom: '#2b2d42', h: 1.15, beard: 1, glasses: 1, voice: 'prof', prof: 'philo' },
    vendeur: { nom: 'Le vendeur', skin: '#d9a07b', hair: '#3b2416', style: 'short', top: '#fff', bottom: '#3a3f55', h: 1.12, voice: 'vendeur', apron: '#e63946' },
    vendeuse: { nom: 'La vendeuse', skin: '#c88a64', hair: '#5a3418', style: 'bun', acc: '#fff', top: '#ffd1e3', bottom: '#5a4a7a', h: 1.08, girl: 1, voice: 'vendeur', apron: '#c77dff' }
  };
  M.CHARS = CHARS;

  /* ================= drawPerson(x, y, options) ================= */
  function drawHeld(g, item, x, y, t) {
    g.save(); g.translate(x, y);
    switch (item) {
      case 'book': g.fillStyle = '#c2185b'; g.fillRect(-12, -10, 24, 18); g.fillStyle = '#fff'; g.fillRect(-10, -8, 9, 14); g.fillRect(1, -8, 9, 14); g.fillStyle = '#ccc'; for (var i = 0; i < 4; i++) { g.fillRect(-9, -6 + i * 3, 7, 1); g.fillRect(2, -6 + i * 3, 7, 1); } break;
      case 'plate': g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, 16, 5, 0, 0, 6.283); g.fill(); g.fillStyle = '#f4a261'; g.beginPath(); g.ellipse(0, -2, 9, 4, 0, 0, 6.283); g.fill(); break;
      case 'remote': g.fillStyle = '#333'; rr(g, -4, -10, 8, 20, 3); g.fill(); g.fillStyle = '#e63946'; g.fillRect(-2, -8, 4, 3); break;
      case 'pan': K.pan(g, 8, 0, 0.7); break;
      case 'ball': g.fillStyle = '#e63946'; g.beginPath(); g.arc(0, 0, 7, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(-2, -2, 2, 0, 6.283); g.fill(); break;
      case 'football': drawFoot(g, 0, 0, 8, t); break;
      case 'brush': g.fillStyle = '#c77dff'; g.fillRect(-2, -14, 4, 18); g.fillStyle = '#333'; g.fillRect(-5, -18, 10, 6); break;
      case 'yaourt': g.fillStyle = '#fff'; rr(g, -6, -10, 12, 14, 2); g.fill(); g.fillStyle = '#ff9ccc'; g.fillRect(-6, -10, 12, 4); break;
      case 'phone': g.fillStyle = '#222'; rr(g, -5, -10, 10, 18, 2); g.fill(); g.fillStyle = '#9ad1ff'; g.fillRect(-4, -8, 8, 13); break;
      case 'cupcake': g.fillStyle = '#c99a5b'; g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 0); g.lineTo(5, 9); g.lineTo(-5, 9); g.fill(); g.fillStyle = '#ff9ccc'; g.beginPath(); g.arc(0, -2, 8, 3.14, 6.283); g.fill(); g.fillStyle = '#e63946'; g.beginPath(); g.arc(0, -9, 2.5, 0, 6.283); g.fill(); break;
      case 'flower': g.strokeStyle = '#3f8f5a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -8); g.stroke(); K.flower(g, 0, -10, 5, '#ff7aa8'); break;
      case 'bread': g.fillStyle = '#e0a050'; g.save(); g.rotate(-0.5); g.beginPath(); g.ellipse(0, 0, 18, 5, 0, 0, 6.283); g.fill(); g.restore(); break;
      case 'can': g.fillStyle = '#4cc9f0'; g.fillRect(-10, -6, 16, 12); g.strokeStyle = '#4cc9f0'; g.lineWidth = 3; g.beginPath(); g.moveTo(6, -4); g.lineTo(16, -10); g.stroke(); break;
      case 'cards': for (var c = 0; c < 3; c++) { g.save(); g.rotate(-0.3 + c * 0.3); g.fillStyle = '#fff'; g.fillRect(-4, -14, 9, 13); g.strokeStyle = '#999'; g.strokeRect(-4, -14, 9, 13); g.fillStyle = c % 2 ? '#e63946' : '#222'; g.fillRect(-1, -10, 3, 3); g.restore(); } break;
      case 'mug': g.fillStyle = '#fff'; rr(g, -6, -8, 12, 12, 2); g.fill(); g.fillStyle = '#6b3e1e'; g.fillRect(-5, -7, 10, 3); break;
      case 'pen': g.fillStyle = '#3d5a80'; g.save(); g.rotate(0.6); g.fillRect(-1, -10, 3, 14); g.restore(); break;
      case 'guitar': g.fillStyle = lg(g, -18, 0, 18, 0, ['#c0623f', '#ef9a5a', '#c0623f']); g.beginPath(); g.ellipse(-6, 4, 16, 12, 0.3, 0, 6.283); g.fill(); g.fillStyle = '#5a3d22'; g.save(); g.rotate(-0.4); g.fillRect(4, -3, 42, 5); g.restore(); g.fillStyle = '#3b2416'; g.beginPath(); g.arc(-4, 2, 4, 0, 6.283); g.fill(); break;
      case 'watering': g.fillStyle = '#4cc9f0'; rr(g, -10, -6, 18, 14, 3); g.fill(); g.strokeStyle = '#4cc9f0'; g.lineWidth = 3; g.beginPath(); g.moveTo(8, -2); g.lineTo(18, -10); g.stroke(); break;
      case 'shovel': g.fillStyle = '#ff7aa8'; g.fillRect(-1, -14, 3, 16); g.beginPath(); g.moveTo(-5, 2); g.lineTo(6, 2); g.lineTo(0, 10); g.fill(); break;
      case 'letter': g.fillStyle = '#fff'; g.fillRect(-9, -7, 18, 13); g.strokeStyle = '#c77dff'; g.beginPath(); g.moveTo(-9, -7); g.lineTo(0, 0); g.lineTo(9, -7); g.stroke(); break;
      case 'mic': g.fillStyle = '#555'; g.fillRect(-1.5, -4, 3, 12); g.fillStyle = '#333'; g.beginPath(); g.arc(0, -6, 4, 0, 6.283); g.fill(); break;
      case 'diploma': g.fillStyle = '#fff8e0'; g.fillRect(-14, -4, 28, 8); g.fillStyle = '#e63946'; g.fillRect(-2, -5, 4, 10); break;
    }
    g.restore();
  }
  M.drawHeld = drawHeld;
  function drawFoot(g, x, y, r, t) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.fillStyle = '#222'; g.save(); g.translate(x, y); g.rotate(t || 0); for (var i = 0; i < 5; i++) { var a = i * 1.2566; g.beginPath(); g.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.25, 0, 6.283); g.fill(); } g.beginPath(); g.arc(0, 0, r * 0.28, 0, 6.283); g.fill(); g.restore(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); }
  M.drawFoot = drawFoot;

  function outfitOf(id, c) { if (id === 'lyham') { var o = LL.OUTFITS[LL.S.outfit] || LL.OUTFITS.jean; return o; } return { top: c.top, bottom: c.bottom, dress: c.dress }; }
  /* options : dir (-1/1), walk (phase), pose (stand/sit/lie), hold, arm (up/out/stir/hug/wave/phone/read/play), dance (phase), talk, wave, scale, expr, name */
  function drawPerson(g, x, y, o) {
    o = o || {}; var c = CHARS[o.who || 'lyham'], s = (o.scale || 1) * (c.h || 1), dir = o.dir || 1, t = M.t, of = outfitOf(o.who || 'lyham', c);
    var walk = o.walk || 0, sw = Math.sin(walk) * (o.walk ? 1 : 0), bob = o.walk ? Math.abs(Math.cos(walk)) * 3 : Math.sin(t * 2 + x) * 0.8;
    var dance = o.dance != null ? o.dance : null; if (dance != null) bob = Math.abs(Math.sin(dance * 2)) * 6;
    g.save(); g.translate(x, y);
    if (!o.noShadow) K.shadow(g, 0, 0, 34 * s, 8 * s, 0.32);
    if (o.pose === 'lie') { g.rotate(-Math.PI / 2 * dir); g.translate(0, -10); }
    g.scale(s, s); g.translate(0, -bob);
    var sit = o.pose === 'sit', skin = c.skin, top = of.top, bot = of.bottom, sk2 = sh(skin, -0.18);
    var hy = -128; // centre de la tête
    // jambes
    var legL = sit ? 0 : sw * 0.45, legR = sit ? 0 : -sw * 0.45;
    if (dance != null) { legL = Math.sin(dance * 2) * 0.35; legR = -Math.sin(dance * 2 + 1) * 0.35; }
    function leg(off, a) { g.save(); g.translate(off, -58); if (sit) { g.fillStyle = bot; rr(g, -7, -4, 30 * (dir > 0 ? 1 : 1), 14, 6); g.fill(); g.translate(22, 6); g.fillStyle = sh(bot, -0.1); rr(g, -7, 0, 13, 34, 5); g.fill(); g.fillStyle = skin; g.fillRect(-5, 26, 9, 6); g.fillStyle = '#fff'; rr(g, -8, 30, 18, 8, 4); g.fill(); g.restore(); return; } g.rotate(a); g.fillStyle = of.dress ? skin : lg(g, -7, 0, 7, 0, [sh(bot, 0.1), bot, sh(bot, -0.15)]); rr(g, -7, 0, 14, 52, 6); g.fill(); if (of.dress) { g.fillStyle = sk2; g.fillRect(-7, 0, 2, 52); } g.fillStyle = o.who === 'lyham' && LL.S.outfit === 'danse' ? '#ffb3d9' : '#fff'; rr(g, -9, 48, 20, 10, 5); g.fill(); g.fillStyle = o.who === 'lyham' ? '#ff6fa8' : '#555'; g.fillRect(-9, 54, 20, 3); g.restore(); }
    leg(-8, legL); leg(8, legR);
    // corps
    var bodyTop = -98, sway = dance != null ? Math.sin(dance) * 0.12 : 0;
    g.save(); g.rotate(sway);
    if (of.dress) { g.fillStyle = lg(g, -30, 0, 30, 0, [sh(top, -0.1), top, sh(top, 0.15), top]); g.beginPath(); g.moveTo(-15, bodyTop); g.lineTo(15, bodyTop); g.quadraticCurveTo(18, -70, 30 + (of.dress > 1 ? 8 : 0) + Math.sin(t * 3) * 2, of.dress > 1 ? -8 : -40); g.lineTo(-30 - (of.dress > 1 ? 8 : 0) - Math.sin(t * 3) * 2, of.dress > 1 ? -8 : -40); g.quadraticCurveTo(-18, -70, -15, bodyTop); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-26, of.dress > 1 ? -14 : -44); g.quadraticCurveTo(0, of.dress > 1 ? -6 : -38, 26, of.dress > 1 ? -14 : -44); g.stroke(); }
    else { g.fillStyle = lg(g, -20, 0, 20, 0, [sh(top, -0.12), top, sh(top, 0.15), sh(top, -0.05)]); rr(g, -17, bodyTop, 34, 46, 12); g.fill(); g.fillStyle = sh(bot, 0.05); rr(g, -16, -60, 32, 10, 4); g.fill(); if (c.apron) { g.fillStyle = c.apron; rr(g, -13, -88, 26, 40, 4); g.fill(); } if (o.who === 'lyham' && LL.S.outfit === 'uniforme') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-6, bodyTop); g.lineTo(0, bodyTop + 10); g.lineTo(6, bodyTop); g.fill(); } if (o.who === 'lyham' && LL.S.outfit === 'sweat') { g.fillStyle = 'rgba(255,255,255,.8)'; K.heart(g, 0, -80, 5); } }
    // bras
    function arm(side, mode) {
      g.save(); g.translate(side * 16, bodyTop + 6); var a = side * 0.12 - side * sw * 0.4, el = 0.1;
      if (dance != null) { a = side * (0.6 + Math.sin(dance * 2 + side) * 0.9); el = -0.6; }
      if (mode === 'up') { a = side * 2.6; el = 0; } else if (mode === 'out') { a = side * 1.2 * (side === dir ? 1 : 0.2); el = -0.3; } else if (mode === 'stir') { a = side === dir ? side * (0.9 + Math.sin(t * 8) * 0.25) : side * 0.15; el = side === dir ? -1 : 0.1; } else if (mode === 'hug') { a = side * 1.3; el = -side * 1.4; } else if (mode === 'wave') { a = side === dir ? side * (2.5 + Math.sin(t * 12) * 0.35) : side * 0.12; el = 0; } else if (mode === 'phone') { a = side === dir ? side * 0.4 : side * 0.1; el = side === dir ? -side * 2.4 : 0; } else if (mode === 'read' || mode === 'hold2') { a = side * 0.35; el = -side * 1.3; } else if (mode === 'play') { a = side * (0.5 + Math.sin(t * 10 + side) * 0.15); el = -side * 1.2; } else if (mode === 'throw') { a = side === dir ? side * (2.4 - (o.armK || 0) * 2.2) : side * 0.12; el = 0; } else if (mode === 'brush') { a = side === dir ? side * (2.3 + Math.sin(t * 10) * 0.25) : side * 0.12; el = -side * 0.6; } else if (mode === 'water') { a = side === dir ? side * 1.0 : side * 0.12; el = side === dir ? side * 0.4 : 0; }
      g.rotate(a); g.fillStyle = of.dress && of.dress < 2 ? skin : lg(g, -5, 0, 5, 0, [sh(top, 0.08), top, sh(top, -0.18)]); rr(g, -5.5, 0, 11, 24, 5); g.fill(); g.translate(0, 22); g.rotate(el); g.fillStyle = skin; rr(g, -4.5, 0, 9, 22, 4); g.fill(); g.fillStyle = sh(skin, 0.05); g.beginPath(); g.arc(0, 24, 5.5, 0, 6.283); g.fill();
      if (o.hold && side === (o.holdSide || dir)) drawHeld(g, o.hold, 0, 28, t);
      g.restore();
    }
    var mode = o.arm || (o.wave ? 'wave' : o.hold && !o.arm ? 'out' : null);
    arm(-dir, mode === 'out' || mode === 'stir' || mode === 'wave' || mode === 'phone' || mode === 'throw' || mode === 'brush' || mode === 'water' ? null : mode); arm(dir, mode);
    // cou + tête
    g.fillStyle = sk2; g.fillRect(-5, bodyTop - 10, 10, 12);
    var hx = dir * 2, headTilt = o.headBob ? Math.sin(t * 5) * 0.12 : 0;
    g.save(); g.translate(hx, hy + 20); g.rotate(headTilt); g.translate(0, -20);
    // cheveux arrière
    var hair = c.hair, hairG = lg(g, -26, -30, 26, 20, [sh(hair, 0.25), hair, sh(hair, -0.2)]);
    g.fillStyle = hairG;
    if (c.style === 'long') { rr(g, -27, -20, 54, 70, 20); g.fill(); }
    if (c.style === 'braids') { for (var b = -1; b <= 1; b += 2) { for (var k = 0; k < 6; k++) { g.beginPath(); g.ellipse(b * 22 + Math.sin(t * 2 + k) * (k * 0.3), 4 + k * 10, 6, 6.5, 0, 0, 6.283); g.fill(); } g.fillStyle = c.acc; g.fillRect(b * 22 - 4, 62, 8, 4); g.fillStyle = hairG; } }
    if (c.style === 'pony') { var swing = Math.sin(t * 3 + walk) * (o.walk ? 0.35 : 0.12) + (dance != null ? Math.sin(dance * 2) * 0.5 : 0); g.save(); g.translate(-dir * 16, -18); g.rotate(-dir * 0.5 + swing); g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-dir * 18, 25, -dir * 6, 50); g.quadraticCurveTo(0, 30, 8, 2); g.fill(); g.strokeStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.moveTo(-2, 4); g.quadraticCurveTo(-dir * 10, 25, -dir * 3, 44); g.stroke(); g.fillStyle = c.acc; g.beginPath(); g.ellipse(0, 0, 8, 5.5, 0.3, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(-2, -2, 2, 0, 6.283); g.fill(); g.restore(); }
    // tête
    g.fillStyle = rg(g, -6, -8, 4, 30, [sh(skin, 0.12), skin, sh(skin, -0.1)]); g.beginPath(); g.ellipse(0, 0, 24, 26, 0, 0, 6.283); g.fill();
    g.fillStyle = sh(skin, -0.05); g.beginPath(); g.ellipse(-23, 3, 5, 7, 0, 0, 6.283); g.ellipse(23, 3, 5, 7, 0, 0, 6.283); g.fill();
    if (c.girl && o.who !== 'lopez') { g.fillStyle = '#ffd166'; g.beginPath(); g.arc(-24, 10, 2, 0, 6.283); g.arc(24, 10, 2, 0, 6.283); g.fill(); }
    // visage
    var fx = dir * 4, blink = (Math.floor(t * 10 + x) % 37 === 0) || o.eyesClosed, ex = o.expr || (o.talk ? 'joie' : null);
    g.save(); g.translate(fx, 4);
    if (blink || ex === 'rire') { g.strokeStyle = '#2b1a10'; g.lineWidth = 2.5; g.beginPath(); g.arc(-9, -2, 5, ex === 'rire' ? 3.4 : 0.2, ex === 'rire' ? 6 : 2.9); g.moveTo(14, -2); g.arc(9, -2, 5, ex === 'rire' ? 3.4 : 0.2, ex === 'rire' ? 6 : 2.9); g.stroke(); }
    else { var er = ex === 'surprise' ? 6.5 : 5.5; [-9, 9].forEach(function (ex2) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex2, -2, er, er + 1.5, 0, 0, 6.283); g.fill(); g.fillStyle = c.eyes || '#3b2416'; g.beginPath(); g.arc(ex2 + dir * 1, -1, er * 0.72, 0, 6.283); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(ex2 + dir * 1, -1, er * 0.38, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex2 + dir * 1 - 1.8, -3.5, 1.8, 0, 6.283); g.arc(ex2 + dir * 1 + 1.5, 0.5, 0.9, 0, 6.283); g.fill(); if (c.girl) { g.strokeStyle = '#2b1a10'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ex2 - er, -4); g.lineTo(ex2 - er - 2.5, -7); g.moveTo(ex2 + er, -4); g.lineTo(ex2 + er + 2.5, -7); g.stroke(); } }); }
    // sourcils
    g.strokeStyle = sh(hair, -0.1); g.lineWidth = 2.4; g.lineCap = 'round'; var bro = ex === 'triste' ? 1 : ex === 'surprise' ? -3 : ex === 'concentre' ? 2 : 0;
    g.beginPath(); g.moveTo(-14, -12 + bro + (ex === 'triste' ? -2 : 0)); g.lineTo(-5, -13 - (ex === 'concentre' ? -2 : 0) + bro); g.moveTo(5, -13 - (ex === 'concentre' ? -2 : 0) + bro); g.lineTo(14, -12 + bro + (ex === 'triste' ? -2 : 0)); g.stroke();
    if (c.glasses) { g.strokeStyle = '#333'; g.lineWidth = 1.8; g.beginPath(); g.arc(-9, -2, 8, 0, 6.283); g.moveTo(17, -2); g.arc(9, -2, 8, 0, 6.283); g.moveTo(-1, -2); g.lineTo(1, -2); g.stroke(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(-11, -4, 4, 0, 6.283); g.fill(); }
    // joues roses
    g.fillStyle = 'rgba(255,120,150,' + (c.girl ? 0.45 : 0.25) + ')'; g.beginPath(); g.ellipse(-14, 8, 5, 3, 0, 0, 6.283); g.ellipse(14, 8, 5, 3, 0, 0, 6.283); g.fill();
    if (c.freckles) { g.fillStyle = 'rgba(150,80,40,.5)'; [[-12, 5], [-15, 7], [12, 5], [15, 7], [-10, 8], [10, 8]].forEach(function (p) { g.fillRect(p[0], p[1], 1.5, 1.5); }); }
    // nez + bouche
    g.fillStyle = sh(skin, -0.15); g.beginPath(); g.ellipse(dir * 1, 5, 2, 1.5, 0, 0, 6.283); g.fill();
    var talking = o.talk && Math.sin(t * 18) > -0.2;
    if (c.beard) { g.fillStyle = 'rgba(30,20,15,.55)'; g.beginPath(); g.ellipse(0, 15, 14, 8, 0, 0, 3.14); g.fill(); }
    if (talking || ex === 'surprise') { g.fillStyle = '#8a2040'; g.beginPath(); g.ellipse(0, 13, 4.5, talking ? 2 + Math.abs(Math.sin(t * 18)) * 3 : 4, 0, 0, 6.283); g.fill(); g.fillStyle = '#ff8fab'; g.beginPath(); g.ellipse(0, 15, 2.5, 1.2, 0, 0, 6.283); g.fill(); }
    else if (ex === 'triste') { g.strokeStyle = '#8a2040'; g.lineWidth = 2; g.beginPath(); g.arc(0, 17, 5, 3.6, 5.8); g.stroke(); }
    else if (ex === 'rire') { g.fillStyle = '#8a2040'; g.beginPath(); g.arc(0, 11, 7, 0, 3.14); g.fill(); g.fillStyle = '#fff'; g.fillRect(-5, 11, 10, 2); }
    else if (ex === 'concentre') { g.strokeStyle = '#8a2040'; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, 13); g.lineTo(4, 12); g.stroke(); }
    else { g.strokeStyle = '#8a2040'; g.lineWidth = 2; g.beginPath(); g.arc(0, 9, 6, 0.35, 2.8); g.stroke(); }
    g.restore();
    // cheveux avant
    g.fillStyle = hairG;
    if (c.style === 'pony' || c.style === 'long' || c.style === 'braids') { g.beginPath(); g.moveTo(-25, 2); g.quadraticCurveTo(-28, -26, 0, -28); g.quadraticCurveTo(28, -26, 25, 2); g.quadraticCurveTo(18, -14, 4 * dir, -16); g.quadraticCurveTo(-14, -14, -25, 2); g.fill(); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.arc(-4, -16, 14, 3.6, 4.6); g.stroke(); if (c.style === 'long') { g.beginPath(); g.moveTo(-25, 0); g.quadraticCurveTo(-30, 30, -22, 45); g.lineTo(-18, 10); g.fill(); g.beginPath(); g.moveTo(25, 0); g.quadraticCurveTo(30, 30, 22, 45); g.lineTo(18, 10); g.fill(); } }
    else if (c.style === 'bun') { g.beginPath(); g.moveTo(-25, 0); g.quadraticCurveTo(-27, -27, 0, -28); g.quadraticCurveTo(27, -27, 25, 0); g.quadraticCurveTo(10, -18, -25, 0); g.fill(); g.beginPath(); g.arc(0, -32, 12, 0, 6.283); g.fill(); g.fillStyle = c.acc || '#fff'; g.fillRect(-10, -24, 20, 4); }
    else if (c.style === 'curly') { for (var q = 0; q < 9; q++) { g.beginPath(); g.arc(-22 + q * 5.5, -18 - Math.sin(q * 0.4) * 9, 8, 0, 6.283); g.fill(); } }
    else { g.beginPath(); g.moveTo(-25, -2); g.quadraticCurveTo(-26, -28, 0, -28); g.quadraticCurveTo(26, -28, 25, -2); g.quadraticCurveTo(22, -16, 0, -18); g.quadraticCurveTo(-20, -16, -25, -2); g.fill(); }
    if (c.cap) { g.fillStyle = c.cap; g.beginPath(); g.arc(0, -14, 25, 3.14, 6.283); g.fill(); g.fillRect(dir > 0 ? 0 : -36, -16, 36, 6); }
    if (o.who === 'lyham' && LL.S.outfit === 'toge') { g.fillStyle = '#1b1838'; g.fillRect(-26, -34, 52, 8); g.beginPath(); g.moveTo(-30, -34); g.lineTo(0, -46); g.lineTo(30, -34); g.lineTo(0, -26); g.fill(); g.strokeStyle = '#ffd166'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -36); g.lineTo(20, -30); g.lineTo(22, -12); g.stroke(); }
    g.restore();
    g.restore(); // sway
    g.restore();
    if (o.name) { g.save(); g.font = 'bold 13px system-ui, sans-serif'; var tw = g.measureText(o.name).width + 14; g.fillStyle = 'rgba(60,30,90,.62)'; rr(g, x - tw / 2, y + 6, tw, 18, 9); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.name, x, y + 15.5); g.restore(); }
  }
  M.drawPerson = LL.drawPerson = drawPerson;

  /* Moka, le chat roux */
  function drawCat(g, c) {
    var x = c.x, y = c.y, d = c.dir, t = M.t, run = c.state === 'run' || c.state === 'fetch' || c.state === 'back', leg = run ? Math.sin(t * 16) * 6 : 0;
    K.shadow(g, x, y, 30, 6, 0.3); g.save(); g.translate(x, y); g.scale(d, 1);
    var o1 = '#f08a3c', o2 = '#d96a1f', cream = '#ffe0bd';
    // queue
    g.strokeStyle = o1; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-22, -20); g.quadraticCurveTo(-40, -30 + Math.sin(t * 3) * 8, -36, -52 + Math.sin(t * 2) * 6); g.stroke(); g.strokeStyle = o2; g.lineWidth = 3; g.beginPath(); g.moveTo(-34, -40); g.lineTo(-36, -50); g.stroke();
    if (c.state === 'sit' || c.state === 'eat') { g.fillStyle = lg(g, 0, -40, 0, 0, [o1, o2]); g.beginPath(); g.ellipse(-4, -18, 20, 18, 0, 0, 6.283); g.fill(); g.fillStyle = cream; g.beginPath(); g.ellipse(6, -14, 9, 12, 0, 0, 6.283); g.fill(); }
    else { [[-16, leg], [-8, -leg], [10, -leg], [18, leg]].forEach(function (l) { g.fillStyle = o2; rr(g, l[0] - 3, -14 + (l[1] > 0 ? -2 : 0), 7, 15, 3); g.fill(); g.fillStyle = cream; g.beginPath(); g.ellipse(l[0] + 1, 0, 4.5, 2.5, 0, 0, 6.283); g.fill(); }); g.fillStyle = lg(g, 0, -34, 0, -8, [o1, o2]); g.beginPath(); g.ellipse(0, -20, 26, 13, 0, 0, 6.283); g.fill(); g.strokeStyle = o2; g.lineWidth = 2; for (var s = 0; s < 3; s++) { g.beginPath(); g.moveTo(-12 + s * 8, -32); g.lineTo(-10 + s * 8, -24); g.stroke(); } }
    // tête
    var hy = c.state === 'sit' ? -38 : c.state === 'eat' ? -14 : -30, hx = c.state === 'eat' ? 18 : 20;
    g.fillStyle = rg(g, hx - 3, hy - 3, 2, 16, [sh(o1, 0.2), o1]); g.beginPath(); g.arc(hx, hy, 14, 0, 6.283); g.fill();
    g.beginPath(); g.moveTo(hx - 12, hy - 6); g.lineTo(hx - 9, hy - 22); g.lineTo(hx - 1, hy - 12); g.moveTo(hx + 12, hy - 6); g.lineTo(hx + 9, hy - 22); g.lineTo(hx + 1, hy - 12); g.fill(); g.fillStyle = '#ffb3c7'; g.beginPath(); g.moveTo(hx - 9, hy - 9); g.lineTo(hx - 8, hy - 17); g.lineTo(hx - 4, hy - 12); g.moveTo(hx + 9, hy - 9); g.lineTo(hx + 8, hy - 17); g.lineTo(hx + 4, hy - 12); g.fill();
    g.fillStyle = cream; g.beginPath(); g.ellipse(hx + 2, hy + 6, 7, 5, 0, 0, 6.283); g.fill();
    if (c.purr > 0 || Math.floor(t * 8 + 5) % 41 === 0) { g.strokeStyle = '#3b2416'; g.lineWidth = 1.8; g.beginPath(); g.arc(hx - 5, hy - 1, 3, 3.4, 6); g.moveTo(hx + 10, hy - 1); g.arc(hx + 7, hy - 1, 3, 3.4, 6); g.stroke(); }
    else { g.fillStyle = '#8fd14f'; g.beginPath(); g.ellipse(hx - 5, hy - 1, 3.2, 4, 0, 0, 6.283); g.ellipse(hx + 7, hy - 1, 3.2, 4, 0, 0, 6.283); g.fill(); g.fillStyle = '#111'; g.fillRect(hx - 5.6, hy - 4, 1.4, 6); g.fillRect(hx + 6.4, hy - 4, 1.4, 6); }
    g.fillStyle = '#ff7aa8'; g.beginPath(); g.moveTo(hx + 1, hy + 3); g.lineTo(hx + 4, hy + 3); g.lineTo(hx + 2.5, hy + 5); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(hx + 8, hy + 5); g.lineTo(hx + 20, hy + 3); g.moveTo(hx + 8, hy + 7); g.lineTo(hx + 20, hy + 8); g.stroke();
    if (c.hasBall) { g.fillStyle = '#e63946'; g.beginPath(); g.arc(hx + 12, hy + 10, 6, 0, 6.283); g.fill(); }
    g.restore();
  }

  /* ================= Télévision : 9 chaînes animées ================= */
  M.CHAINES = [
    { n: 1, nom: 'Dessins animés', edu: null }, { n: 2, nom: 'Nature & océans', edu: 'sciences' }, { n: 3, nom: 'Musique', edu: 'musique' },
    { n: 4, nom: 'Sport', edu: 'sport' }, { n: 5, nom: 'Cuisine', edu: 'cuisine' }, { n: 6, nom: 'Sciences & espace', edu: 'sciences' },
    { n: 7, nom: 'Danse', edu: 'danse' }, { n: 8, nom: 'Infos & météo', edu: 'histoire' }, { n: 9, nom: 'English Kids', edu: 'anglais' }
  ];
  var EN_WORDS = [['apple', '🍎', 'pomme'], ['house', '🏠', 'maison'], ['cat', '🐱', 'chat'], ['rainbow', '🌈', 'arc-en-ciel'], ['friend', '🤝', 'ami(e)'], ['book', '📖', 'livre'], ['sun', '☀️', 'soleil'], ['heart', '❤️', 'cœur']];
  function drawTVScreen(g, ch, t, x, y, w, h) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    var cx = x + w / 2, cy = y + h / 2;
    switch (ch) {
      case 1: g.fillStyle = lg(g, 0, y, 0, y + h, ['#8fd3ff', '#d6f5ff']); g.fillRect(x, y, w, h); g.fillStyle = '#7cc56b'; g.beginPath(); g.ellipse(cx - 40, y + h, 90, 30, 0, 0, 6.283); g.ellipse(cx + 60, y + h + 5, 80, 30, 0, 0, 6.283); g.fill(); var bx = x + 30 + ((t * 50) % (w - 60)), by = y + h - 38 - Math.abs(Math.sin(t * 4)) * 30; g.fillStyle = '#ff7aa8'; g.beginPath(); g.ellipse(bx, by, 16, 14 + Math.sin(t * 8) * 2, 0, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(bx - 5, by - 3, 4, 0, 6.283); g.arc(bx + 5, by - 3, 4, 0, 6.283); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(bx - 4, by - 3, 2, 0, 6.283); g.arc(bx + 6, by - 3, 2, 0, 6.283); g.fill(); K.cloudShape(g, x + ((t * 15) % w), y + 18, 0.5, 0.9); break;
      case 2: g.fillStyle = lg(g, 0, y, 0, y + h, ['#1e88c8', '#0b3d6b']); g.fillRect(x, y, w, h); for (var f = 0; f < 5; f++) { var fx = x + ((t * (20 + f * 8) + f * 60) % (w + 40)) - 20, fy = y + 20 + f * 18 + Math.sin(t * 2 + f) * 5; g.fillStyle = ['#ffb703', '#ff7aa8', '#7af0ff', '#ffd166', '#f77f00'][f]; g.beginPath(); g.ellipse(fx, fy, 10, 6, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(fx - 9, fy); g.lineTo(fx - 17, fy - 6); g.lineTo(fx - 17, fy + 6); g.fill(); g.fillStyle = '#000'; g.fillRect(fx + 5, fy - 2, 2, 2); } g.strokeStyle = '#2a9d8f'; g.lineWidth = 4; for (var s = 0; s < 6; s++) { g.beginPath(); g.moveTo(x + 15 + s * 35, y + h); g.quadraticCurveTo(x + 15 + s * 35 + Math.sin(t * 2 + s) * 10, y + h - 25, x + 15 + s * 35, y + h - 45); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.6)'; for (var b = 0; b < 6; b++) { g.beginPath(); g.arc(x + 30 + b * 30, y + h - ((t * 30 + b * 20) % h), 2.5, 0, 6.283); g.fill(); } break;
      case 3: g.fillStyle = '#16102e'; g.fillRect(x, y, w, h); var lv = LL.musiqueLevel ? LL.musiqueLevel() : 0; for (var e = 0; e < 14; e++) { var bh = (0.25 + 0.75 * Math.abs(Math.sin(t * 3 + e * 0.7) * Math.cos(t * 1.7 + e))) * (h - 20) * (0.7 + lv); g.fillStyle = lg(g, 0, y + h, 0, y + h - bh, ['#ff3cac', '#784ba0', '#2b86c5']); g.fillRect(x + 8 + e * (w - 16) / 14, y + h - bh, (w - 16) / 14 - 3, bh); } break;
      case 4: g.fillStyle = '#3a9d3a'; g.fillRect(x, y, w, h); for (var st = 0; st < 6; st++) { g.fillStyle = st % 2 ? '#43a843' : '#3a9d3a'; g.fillRect(x + st * w / 6, y, w / 6, h); } g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + 6, y + 6, w - 12, h - 12); g.beginPath(); g.moveTo(cx, y + 6); g.lineTo(cx, y + h - 6); g.stroke(); g.beginPath(); g.arc(cx, cy, 16, 0, 6.283); g.stroke(); var px = cx + Math.sin(t * 1.3) * (w * 0.35), py = cy + Math.sin(t * 2.1) * (h * 0.3); drawFoot(g, px, py, 5, t * 5); var sc = Math.floor(t / 9) % 4; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x + 6, y + 6, 88, 18); K.text(g, 'LYO ' + (1 + (sc > 1)) + ' - ' + (sc % 2) + ' PSG', x + 50, y + 15, 11, '#fff'); break;
      case 5: g.fillStyle = '#fff3e0'; g.fillRect(x, y, w, h); g.fillStyle = '#ffd1a8'; g.fillRect(x, y + h - 30, w, 30); K.pan(g, cx, y + h - 40, 1.2); g.fillStyle = '#e63946'; for (var v = 0; v < 4; v++) { g.beginPath(); g.arc(cx - 10 + v * 6, y + h - 44 - (v % 2) * 3, 3, 0, 6.283); g.fill(); } for (var sm = 0; sm < 3; sm++) { var p = (t * 0.7 + sm / 3) % 1; g.strokeStyle = 'rgba(180,180,180,' + (1 - p) + ')'; g.beginPath(); g.moveTo(cx - 8 + sm * 8, y + h - 50 - p * 40); g.quadraticCurveTo(cx + Math.sin(t * 3 + sm) * 8, y + h - 60 - p * 40, cx - 4 + sm * 8, y + h - 70 - p * 40); g.stroke(); } g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 40, y + 28, 14, 0, 6.283); g.arc(x + 52, y + 24, 12, 0, 6.283); g.arc(x + 28, y + 24, 12, 0, 6.283); g.fill(); g.fillRect(x + 28, y + 32, 26, 12); break;
      case 6: g.fillStyle = '#05051a'; g.fillRect(x, y, w, h); var R = K.seeded(5); g.fillStyle = '#fff'; for (var s2 = 0; s2 < 40; s2++) g.fillRect(x + R() * w, y + R() * h, 1.5, 1.5); g.fillStyle = rg(g, x + w - 40, y + 35, 3, 26, ['#ff9b71', '#c1440e']); g.beginPath(); g.arc(x + w - 40, y + 35, 24, 0, 6.283); g.fill(); var k = (t * 0.15) % 1, rx = x + 20 + k * (w - 80), ry = y + h - 20 - k * (h - 50); g.save(); g.translate(rx, ry); g.rotate(-0.6); g.fillStyle = '#eee'; rr(g, -6, -18, 12, 30, 6); g.fill(); g.fillStyle = '#e63946'; g.beginPath(); g.moveTo(-6, -12); g.lineTo(0, -26); g.lineTo(6, -12); g.fill(); g.fillStyle = '#ffb703'; g.beginPath(); g.moveTo(-5, 12); g.lineTo(0, 22 + Math.sin(t * 30) * 4); g.lineTo(5, 12); g.fill(); g.restore(); break;
      case 7: g.fillStyle = '#2b1055'; g.fillRect(x, y, w, h); for (var l = 0; l < 3; l++) { g.fillStyle = ['rgba(255,60,172,.3)', 'rgba(120,240,255,.3)', 'rgba(255,209,102,.3)'][l]; g.beginPath(); g.moveTo(cx + (l - 1) * 50, y); g.lineTo(cx + (l - 1) * 50 + Math.sin(t * 2 + l) * 60 - 30, y + h); g.lineTo(cx + (l - 1) * 50 + Math.sin(t * 2 + l) * 60 + 30, y + h); g.fill(); } for (var d = 0; d < 3; d++) { var dx = x + 40 + d * (w - 80) / 2, ph = t * 4 + d; g.fillStyle = '#111'; g.beginPath(); g.arc(dx, y + h - 50 - Math.abs(Math.sin(ph)) * 6, 7, 0, 6.283); g.fill(); g.fillRect(dx - 5, y + h - 44 - Math.abs(Math.sin(ph)) * 6, 10, 22); g.save(); g.translate(dx, y + h - 40); g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(-4, -2); g.lineTo(-14, -12 + Math.sin(ph) * 10); g.moveTo(4, -2); g.lineTo(14, -12 - Math.sin(ph) * 10); g.moveTo(-3, 18); g.lineTo(-8, 34); g.moveTo(3, 18); g.lineTo(8 + Math.sin(ph) * 4, 34); g.stroke(); g.restore(); } break;
      case 8: g.fillStyle = '#1d3557'; g.fillRect(x, y, w, h); g.fillStyle = '#a8dadc'; g.beginPath(); g.ellipse(cx + 30, cy - 5, 50, 40, 0.3, 0, 6.283); g.fill(); [['☀️', -10, -20], ['🌧️', 40, 0], ['⛅', 20, -30]].forEach(function (m) { g.font = '16px system-ui'; g.textAlign = 'center'; g.fillStyle = '#ffd166'; g.fillText(LL.glyph(m[0]), cx + 30 + m[1], cy + m[2]); }); g.fillStyle = '#f1c9a5'; g.beginPath(); g.arc(x + 35, cy - 10, 12, 0, 6.283); g.fill(); g.fillStyle = '#3d5a80'; g.fillRect(x + 20, cy + 2, 30, 30); g.fillStyle = '#e63946'; g.fillRect(x, y + h - 20, w, 20); g.save(); g.beginPath(); g.rect(x, y + h - 20, w, 20); g.clip(); g.font = 'bold 11px system-ui'; g.textAlign = 'left'; g.fillStyle = '#fff'; var msg = 'INFOS • Météo : ' + (LL.weather(LL.S.day)) + ' aujourd\'hui • Les élèves préparent la rentrée • Exposition sur l\'espace au musée • '; var tx = x + w - ((t * 50) % (g.measureText(msg).width + w)); g.fillText(msg, tx, y + h - 7); g.restore(); break;
      case 9: g.fillStyle = lg(g, x, y, x + w, y + h, ['#ffe066', '#ff9ccc']); g.fillRect(x, y, w, h); var wd = EN_WORDS[Math.floor(t / 3) % EN_WORDS.length]; g.font = Math.round(h * 0.38) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#c2185b'; g.fillText(LL.glyph(wd[1]), cx, cy - 12); K.text(g, wd[0].toUpperCase(), cx, y + h - 22, Math.round(h * 0.16), '#3d2a8a'); K.text(g, '(' + wd[2] + ')', cx, y + h - 8, Math.round(h * 0.09), '#5a3d6a', 'center', '600'); break;
    }
    g.restore();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.45, y); g.lineTo(x, y + h * 0.7); g.fill();
  }
  M.drawTVScreen = LL.drawTVScreen = drawTVScreen;

  /* ================= Présence des PNJ selon heure, jour et vacances ================= */
  LL.papaJour = function (d) { return !LL.isWeekend(d) && !LL.isFerie(d) && !(LL.md(d)[0] === 8 && LL.md(d)[1] < 22); }; // en congé du 1er au 21 août
  LL.papaAuBureau = function () { var S = LL.S, m = S.min; return LL.papaJour(S.day) && ((m >= 540 && m < 720) || (m >= 780 && m < 1080)); };
  LL.papaEnVisio = function () { var m = LL.S.min, w = LL.dow(LL.S.day); return LL.papaAuBureau() && ((m >= 600 && m < 660) || (m >= 870 && m < 930 && w !== 5)); };
  LL.papaEnPause = function () { var m = LL.S.min; return LL.papaAuBureau() && ((m >= 645 && m < 660) || (m >= 960 && m < 975)); };
  LL.darylVisitDay = function (d) { var t = LL.dateOf(d); return t.getUTCDay() === 6 && t.getUTCDate() <= 7; }; // 1er samedi du mois
  function presence(lieu) {
    var S = LL.S, d = S.day, m = S.min, wk = LL.isWeekend(d), vac = LL.isVacances(d) || LL.isFerie(d), rain = LL.weather(d) === 'pluie' || LL.weather(d) === 'neige', out = [];
    var night = m >= 1410 || m < 390;
    // Casimir
    var pc = null;
    if (!night) {
      if (LL.papaJour(d)) { if (m < 540) pc = 'cuisine'; else if (m < 720) pc = 'bureau'; else if (m < 780) pc = 'cuisine'; else if (m < 1080) pc = 'bureau'; else if (m < 1110) pc = 'jardin'; else if (m < 1200) pc = 'cuisine'; else pc = 'salon'; if (pc === 'jardin' && rain) pc = 'salon'; }
      else { if (m < 600) pc = 'cuisine'; else if (m < 720) pc = rain ? 'salon' : 'jardin'; else if (m < 810) pc = 'cuisine'; else if (m < 1110) pc = rain ? 'salon' : 'jardin'; else if (m < 1200) pc = 'cuisine'; else pc = 'salon'; }
    }
    if (pc === lieu) out.push('casimir');
    // Tania : le soir et le week-end
    var pt = null; if (!night) { if (wk || vac && LL.md(d)[0] === 8) { pt = m < 600 ? 'cuisine' : m < 1140 ? (rain ? 'salon' : (m < 900 ? 'jardin' : 'salon')) : m < 1200 ? 'cuisine' : 'salon'; } else if (m >= 1110) pt = m < 1200 ? 'cuisine' : 'salon'; else if (m < 470) pt = 'cuisine'; }
    if (pt === lieu) out.push('tania');
    // Daryl : visite mensuelle (1er samedi), sinon chez lui le week-end
    if (LL.darylVisitDay(d) && m >= 660 && m < 1110 && lieu === (rain ? 'salon' : (m < 840 ? 'cuisine' : 'jardin'))) out.push('daryl');
    if (lieu === 'chez_daryl') out.push('daryl');
    // École
    if (LL.ZONES.ecole.indexOf(lieu) >= 0 && LL.isSchoolDay(d)) {
      var n = LL.niveauIdx(d);
      var profs = { salle_maths: 'prof_maths', salle_fr: n >= 4 ? 'prof_philo' : 'prof_fr', salle_ang: 'prof_ang', salle_hg: 'prof_hg', gymnase: null, salle_arts: null, salle_musique: null, cdi: null };
      if (profs[lieu]) out.push(profs[lieu]); if (lieu === 'cdi' || lieu === 'salle_arts' || lieu === 'gymnase') out.push('prof_sc');
      if (lieu !== 'cdi' || m >= 720) { out.push('cataleya'); out.push('elynn'); }
      if (lieu === 'cour' || lieu === 'salle_maths' || lieu === 'gymnase' || lieu === 'cantine' || lieu === 'foyer' || lieu === 'salle_hg') out.push('noah');
    }
    // Ville : les amies le soir, le week-end et en vacances
    var free = wk || vac || m >= 1020;
    if (free && m < 1260 && ['parc', 'cafe', 'plage', 'patinoire', 'cinema', 'piscine'].indexOf(lieu) >= 0) { var r = LL.rndDay(d * 7 + ['parc', 'cafe', 'plage', 'patinoire', 'cinema', 'piscine'].indexOf(lieu)); if (r < 0.75) out.push('cataleya'); if (r > 0.2) out.push('elynn'); if (r > 0.6 && lieu === 'parc') out.push('noah'); }
    if (lieu === 'chez_elynn') out.push('elynn');
    if (lieu === 'danse') { out.push('lopez'); out.push('cataleya'); out.push('elynn'); }
    if (['boulangerie', 'marche', 'boutiques', 'cinema'].indexOf(lieu) >= 0) out.push(lieu === 'boutiques' || lieu === 'cinema' ? 'vendeuse' : 'vendeur');
    if (lieu === 'cafe' || lieu === 'piscine' || lieu === 'patinoire') out.push('vendeur');
    return out;
  }
  M.presence = LL.presence = presence;
  LL.mokaHere = function (lieu) { var m = LL.S.min, rain = LL.weather(LL.S.day) === 'pluie' || LL.weather(LL.S.day) === 'neige'; if (m >= 1320 || m < 420) return lieu === 'chambre'; if (lieu === 'jardin') return !rain && m >= 600 && m < 1080; return lieu === 'salon' || (lieu === 'cuisine' && (m % 240) < 30); };

  /* ================= Entités ================= */
  var L = M.L = { x: 480, y: 540, tx: 480, ty: 540, dir: 1, walk: 0, moving: false, cb: null, pose: 'stand', hold: null, arm: null, expr: null, talk: 0, dance: null };
  var cat = M.moka = { x: 600, y: 560, tx: 600, ty: 560, dir: -1, state: 'idle', timer: 2, purr: 0, hasBall: false, here: false };
  var ball = M.ball = { on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rot: 0, kind: 'foot', owner: null };
  var fly = M.fly = { on: false, x: 300, y: 380, t: 0 };

  M.walkTo = function (x, y, cb) {
    x = LL.clamp(x, 40, 920); y = LL.clamp(y == null ? L.y : y, GY0, GY1);
    L.tx = x; L.ty = y; L.cb = cb || null; L.pose = 'stand'; L.dance = null;
    if (M.instant || (Math.abs(L.x - x) < 2 && Math.abs(L.y - y) < 2)) { L.x = x; L.y = y; L.moving = false; var c = L.cb; L.cb = null; if (c) c(); return; }
    L.moving = true;
  };
  var stepAcc = 0;
  function updateLyham(dt) {
    if (!L.moving) return;
    var dx = L.tx - L.x, dy = L.ty - L.y, d = Math.sqrt(dx * dx + dy * dy), sp = SPEED * dt;
    if (Math.abs(dx) > 1) L.dir = dx > 0 ? 1 : -1;
    if (d <= sp) { L.x = L.tx; L.y = L.ty; L.moving = false; L.walk = 0; var c = L.cb; L.cb = null; if (c) c(); return; }
    L.x += dx / d * sp; L.y += dy / d * sp; L.walk += dt * 12;
    stepAcc += sp; if (stepAcc > 46) { stepAcc = 0; var s = LL.PLACES[LL.S.place].sol, w = LL.weather(LL.S.day); LL.son(s === 'herbe' || s === 'pave' && LL.PLACES[LL.S.place].out ? (w === 'neige' ? 'pas_neige' : s === 'herbe' ? 'pas_herbe' : 'pas_carrelage') : s === 'sable' ? 'pas_sable' : s === 'carrelage' || s === 'damier' || s === 'lino' || s === 'glace' ? 'pas_carrelage' : 'pas_parquet'); }
  }
  function updateNPCs(dt) {
    M.npcs.forEach(function (n) {
      n.talkT = Math.max(0, n.talkT - dt); n.waveT = Math.max(0, n.waveT - dt);
      if (n.busy) { if (n.tx != null && Math.abs(n.tx - n.x) > 2) { var s0 = Math.sign(n.tx - n.x); n.x += s0 * Math.min(Math.abs(n.tx - n.x), 160 * dt); n.dir = s0; n.walk += dt * 10; } else n.walk = 0; return; }
      var dl = Math.abs(L.x - n.x);
      if (dl < 150 && !L.moving) { n.dir = L.x > n.x ? 1 : -1; n.walk = 0; if (!n.greeted) { n.greeted = true; n.waveT = 1.4; M.say(n.id, greet(n.id), 2); } return; }
      if (n.stay) return;
      n.timer -= dt; if (n.timer <= 0) { n.tx = LL.clamp(n.x + (Math.random() - 0.5) * 300, 80, 880); n.timer = 3 + Math.random() * 5; }
      if (Math.abs(n.tx - n.x) > 2) { var s = Math.sign(n.tx - n.x); n.x += s * Math.min(Math.abs(n.tx - n.x), 70 * dt); n.dir = s; n.walk += dt * 8; } else n.walk = 0;
    });
  }
  function greet(id) {
    var S = LL.S, h = S.min / 60, soir = h >= 18;
    var G = { casimir: ['Coucou ma chérie !', 'Hey ma grande ! 😄', soir ? 'Bonne soirée ma puce !' : 'Ça roule, championne ?'], tania: ['Coucou ma chérie !', 'Ma grande fille ! 💕', 'Tu as passé une bonne journée ?'], daryl: ['Yo petite sœur !', 'Salut la miss ! Revanche à la console ?', 'Hé, la future bachelière !'], cataleya: ['Lyhaaam ! 💛', 'Coucou ma belle !', 'Enfin te voilà !'], elynn: ['Hey Lyham ! 🌿', 'Coucou toi !', 'Tu m\'as manqué !'], noah: ['Salut Lyham !', 'Yo !'], lopez: ['Bonsoir les filles ! Échauffement !', 'Bonsoir Lyham, en place !'], vendeur: ['Bonjour mademoiselle !', 'Bonjour ! Qu\'est-ce qui vous ferait plaisir ?'], vendeuse: ['Bonjour ! Je peux vous aider ?'] };
    var arr = G[id] || ['Bonjour Lyham !']; return arr[Math.floor(Math.random() * arr.length)];
  }
  function updateCat(dt) {
    if (!cat.here) return; var c = cat; c.timer -= dt; c.purr = Math.max(0, c.purr - dt);
    function moveTo(tx, ty, sp) { var dx = tx - c.x, dy = ty - c.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 4) return true; c.x += dx / d * Math.min(d, sp * dt); c.y += dy / d * Math.min(d, sp * dt); if (Math.abs(dx) > 2) c.dir = dx > 0 ? 1 : -1; return false; }
    if (c.state === 'fetch') { if (ball.on && ball.z <= 0.5 && Math.abs(ball.vx) < 30) { if (moveTo(ball.x, ball.y, 300)) { ball.on = false; c.hasBall = true; c.state = 'back'; LL.son('miaou'); } } else moveTo(ball.x, ball.y, 300); return; }
    if (c.state === 'back') { if (moveTo(L.x + L.dir * 50, L.y + 4, 260)) { c.hasBall = false; c.state = 'sit'; c.purr = 3; c.timer = 3; LL.son('ronron'); M.burst(c.x, c.y - 50, '💕', 5); if (c.onBack) { var f = c.onBack; c.onBack = null; f(); } } return; }
    if (c.state === 'goEat') { if (moveTo(c.tx, c.ty, 200)) { c.state = 'eat'; c.timer = 3; LL.son('croque'); } return; }
    if (c.state === 'chase' && ball.on) { moveTo(ball.x, ball.y, 280); if (Math.abs(ball.x - c.x) < 22 && ball.z < 10) { ball.vx += c.dir * 260; ball.vz = 120; LL.son('rebond'); } if (c.timer <= 0) c.state = 'idle'; return; }
    if (c.state === 'run') { if (moveTo(c.tx, c.ty, 220)) { c.state = 'idle'; c.timer = 2 + Math.random() * 4; } return; }
    if (c.timer <= 0) { if (ball.on && LL.PLACES[LL.S.place].out) { c.state = 'chase'; c.timer = 5; return; } var r = Math.random(); if (r < 0.45) { c.state = 'run'; c.tx = 80 + Math.random() * 800; c.ty = GY0 + 10 + Math.random() * 100; } else { c.state = r < 0.8 ? 'sit' : 'idle'; c.timer = 3 + Math.random() * 4; if (Math.random() < 0.2) LL.son('miaou'); } }
  }
  function updateBall(dt) {
    if (!ball.on) return; var b = ball;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= 900 * dt; b.rot += b.vx * dt * 0.08;
    if (b.z <= 0) { b.z = 0; if (b.vz < -80) { b.vz = -b.vz * 0.55; LL.son('rebond'); } else b.vz = 0; b.vx *= Math.pow(0.35, dt); b.vy *= Math.pow(0.35, dt); }
    if (b.x < 30) { b.x = 30; b.vx = Math.abs(b.vx) * 0.7; } if (b.x > 930) { b.x = 930; b.vx = -Math.abs(b.vx) * 0.7; } if (b.y < GY0) { b.y = GY0; b.vy = Math.abs(b.vy) * 0.6; } if (b.y > GY1) { b.y = GY1; b.vy = -Math.abs(b.vy) * 0.6; }
    if (b.kind === 'foot') { // Lyham et les amies font des passes
      if (b.z < 12 && Math.abs(L.x - b.x) < 26 && Math.abs(L.y - b.y) < 22 && Math.abs(b.vx) < 400) { kickTo(b, M.npcs.length ? M.npcs[Math.floor(Math.random() * M.npcs.length)].x : 960 - L.x, 'Lyham'); }
      M.npcs.forEach(function (n) { if (n.player) { if (!n.busy) n.tx = LL.clamp(b.x + (n.x < b.x ? -20 : 20), 60, 900); if (b.z < 12 && Math.abs(n.x - b.x) < 24 && Math.abs(n.y - b.y) < 30 && n.kickCD <= 0) { n.kickCD = 0.8; kickTo(b, L.x, n.id); } n.kickCD -= dt; if (Math.abs(n.tx - n.x) > 4) { n.x += Math.sign(n.tx - n.x) * Math.min(Math.abs(n.tx - n.x), 190 * dt); n.dir = Math.sign(n.tx - n.x) || n.dir; n.walk += dt * 12; } } });
    }
  }
  function kickTo(b, tx, who) { var dx = tx - b.x; b.vx = LL.clamp(dx * 1.6, -520, 520); b.vy = (Math.random() - 0.5) * 120; b.vz = 160 + Math.random() * 120; LL.son('kick'); M.passes = (M.passes || 0) + 1; }
  M.kickTo = kickTo;

  /* ================= Particules (150 max), bulles de dialogue ================= */
  M.burst = function (x, y, txt, n, o) { o = o || {}; if (LL.S.settings.reduce) n = Math.min(n, 2); for (var i = 0; i < n; i++) { if (M.parts.length >= 150) M.parts.shift(); M.parts.push({ x: x + (Math.random() - 0.5) * (o.spread || 30), y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * (o.vx || 60), vy: -(o.vy || 50) - Math.random() * 40, life: o.life || 1.6, max: o.life || 1.6, txt: txt.length > 1 || txt.charCodeAt(0) > 0x2000 ? LL.glyph(txt) : txt, size: o.size || 20, g: o.grav || 0 }); } };
  function updateParts(dt) { for (var i = M.parts.length - 1; i >= 0; i--) { var p = M.parts[i]; p.life -= dt; if (p.life <= 0) { M.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; } }
  function drawParts(g) { g.textAlign = 'center'; g.textBaseline = 'middle'; M.parts.forEach(function (p) { var a = Math.min(1, p.life / p.max * 1.6); g.globalAlpha = a; if (p.txt === 'o') { g.strokeStyle = 'rgba(255,255,255,.9)'; g.fillStyle = 'rgba(200,240,255,.3)'; g.beginPath(); g.arc(p.x, p.y, p.size * 0.3, 0, 6.283); g.fill(); g.stroke(); } else if (p.txt === '~') { g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(p.x + 8, p.y - 10, p.x, p.y - 20); g.stroke(); } else if (p.txt === '.') { g.fillStyle = '#7fc8ff'; g.beginPath(); g.ellipse(p.x, p.y, 2.5, 4, 0, 0, 6.283); g.fill(); } else { g.font = p.size + 'px system-ui, sans-serif'; g.fillStyle = '#c2185b'; g.fillText(p.txt, p.x, p.y); } }); g.globalAlpha = 1; }
  M.say = function (who, text, dur) { M.speech = M.speech.filter(function (s) { return s.who !== who; }); M.speech.push({ who: who, text: LL.cleanEmoji(text), t: dur || Math.max(1.8, text.length * 0.05) }); LL.son('voix_' + (CHARS[who] && CHARS[who].voice || who)); if (LL.caption && who !== 'lyham') LL.caption((CHARS[who] ? CHARS[who].nom : who) + ' : ' + text, true); };
  function posOf(who) { if (who === 'lyham') return L; for (var i = 0; i < M.npcs.length; i++) if (M.npcs[i].id === who) return M.npcs[i]; return null; }
  function wrap(g, text, maxW) { var words = text.split(' '), lines = [], cur = ''; words.forEach(function (w) { var test = cur ? cur + ' ' + w : w; if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }); if (cur) lines.push(cur); return lines; }
  M.wrap = wrap;
  function drawSpeech(g, dt) {
    M.speech = M.speech.filter(function (s) { s.t -= dt; return s.t > 0; });
    M.speech.forEach(function (s) { var p = posOf(s.who); if (!p) return; var hgt = 170 * ((CHARS[s.who] || {}).h || 1); g.font = '600 15px system-ui, sans-serif'; var lines = wrap(g, s.text, 220), w = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; })) + 22, h = lines.length * 19 + 14; var x = LL.clamp(p.x - w / 2, 6, W - w - 6), y = Math.max(6, p.y - hgt - h - 8); g.fillStyle = 'rgba(80,40,110,.18)'; rr(g, x + 3, y + 4, w, h, 14); g.fill(); g.fillStyle = s.who === 'lyham' ? '#fff0f7' : '#ffffff'; rr(g, x, y, w, h, 14); g.fill(); g.strokeStyle = s.who === 'lyham' ? '#ff6fa8' : '#9b6bd6'; g.lineWidth = 2; g.stroke(); g.fillStyle = s.who === 'lyham' ? '#fff0f7' : '#fff'; g.beginPath(); g.moveTo(LL.clamp(p.x - 8, x + 10, x + w - 20), y + h - 1); g.lineTo(LL.clamp(p.x, x + 16, x + w - 12), y + h + 10); g.lineTo(LL.clamp(p.x + 8, x + 22, x + w - 4), y + h - 1); g.fill(); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#3a2350'; lines.forEach(function (l, i) { g.fillText(l, x + 11, y + 16 + i * 19); }); });
  }
  M.talking = function (who) { return M.speech.some(function (s) { return s.who === who; }); };

  /* Dialogue séquentiel en bulles : [[qui, texte], …] puis cb */
  M.dialog = function (lines, cb) { var i = 0; function next() { if (i >= lines.length) { if (cb) cb(); return; } var l = lines[i++]; if (!l) return next(); M.say(l[0], l[1], l[2]); M.wait(M.instant ? 0 : Math.max(1.5, l[1].length * 0.045), next); } next(); };
  var waits = []; M.wait = function (sec, fn) { if (M.instant || sec <= 0) { fn(); return; } waits.push({ t: sec, fn: fn }); };
  function updateWaits(dt) { for (var i = waits.length - 1; i >= 0; i--) { waits[i].t -= dt; if (waits[i].t <= 0) { var f = waits[i].fn; waits.splice(i, 1); f(); } } }
  M.skipWaits = function () { var w = waits.slice(); waits.length = 0; w.forEach(function (x) { x.fn(); }); };

  /* ================= Animations d'actions : {type, dur, step(), overlay(), end()} ================= */
  M.play = function (a) {
    if (M.anim && M.anim.end) { var prev = M.anim; M.anim = null; try { prev.end(); } catch (e) { LL.reportError(e); } }
    a.k = 0; a.el = 0; a.dur = M.instant ? 0 : (LL.S.settings.reduce ? Math.min(a.dur || 2, 1.5) : (a.dur || 2)); M.anim = a;
    if (a.start) a.start();
    if (a.dur <= 0) finishAnim();
  };
  function finishAnim() { var a = M.anim; if (!a) return; M.anim = null; L.arm = null; L.expr = null; L.dance = null; L.headBob = false; if (!a.keepPose) { L.pose = 'stand'; L.hold = null; } try { if (a.end) a.end(); } catch (e) { LL.reportError(e); } M.title = ''; }
  function updateAnim(dt) { var a = M.anim; if (!a) return; a.el += dt; a.k = Math.min(1, a.el / a.dur); if (a.step) try { a.step(dt, a.k); } catch (e) { LL.reportError(e); } if (a.k >= 1) finishAnim(); }
  M.busy = function () { return !!M.anim || L.moving || M.dialogBusy; };
  M.setTitle = function (t) { M.title = t; M.titleT = 0; };

  /* ================= Entrée dans un lieu ================= */
  M.enterPlace = function (id, from) {
    var S = LL.S; M.fade = M.instant ? 0 : 1; M.parts.length = 0; M.speech.length = 0; ball.on = false; fly.on = false; M.tv.on = id === 'salon' && M.tv.on;
    var side = from === 'right' ? 920 : 40; L.x = side; L.y = 540; L.pose = 'stand'; L.hold = null; L.moving = false; M.walkTo(side === 40 ? 160 : 800, 540);
    var ids = presence(id); M.npcs = ids.map(function (who, i) { var x = 160 + ((i * 263 + 120) % 680); return { id: who, x: x, y: 520 + (i % 3) * 22, tx: x, dir: -1, walk: 0, timer: 1 + i, talkT: 0, waveT: 0, greeted: false, stay: /^prof|vendeu|lopez/.test(who) || (who === 'casimir' && (id === 'bureau' || id === 'cuisine')), busy: false, kickCD: 0 }; });
    M.npcs.forEach(function (n) { if (n.id === 'casimir' && id === 'bureau') { n.x = 420; n.y = 500; n.atDesk = true; } if (n.id === 'casimir' && id === 'cuisine') { n.x = 380; n.y = 490; n.cooking = true; } if (/^prof/.test(n.id)) { n.x = 280; n.y = 480; } if (/^vendeu/.test(n.id)) { n.x = 700; n.y = 490; } if (n.id === 'lopez') { n.x = 800; n.y = 488; } });
    cat.here = LL.mokaHere(id); if (cat.here) { cat.x = 600; cat.y = 560; cat.state = 'idle'; cat.timer = 1; cat.hasBall = false; }
    if (S.place !== 'chambre' && LL.audio.musicStyle) LL.stopMusique();
    if (LL.ambiance) LL.ambiance(id);
    LL.son('porte');
  };

  /* ================= Rendu ================= */
  function buildEnv(t) { var S = LL.S; env = { h: S.min / 60, day: S.day, season: LL.season(S.day), weather: LL.weather(S.day), t: t, reduce: S.settings.reduce }; return env; }
  function staticFor(id) {
    var pl = LL.PLACES[id], key = id + '|' + env.season + '|' + env.weather + '|' + LL.niveauIdx(env.day) + '|' + dpr;
    if (cache[id] && cache[id].key === key) return cache[id].cv;
    var c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr; var gg = c.getContext('2d'); gg.scale(dpr, dpr); pl.wins = [];
    pl.draw(gg, env, pl); cache[id] = { key: key, cv: c }; return c;
  }
  M.clearCache = function () { cache = {}; };
  var orderBuf = [];
  function render(dt) {
    var S = LL.S, pl = LL.PLACES[S.place]; if (!pl) { S.place = 'chambre'; pl = LL.PLACES.chambre; }
    buildEnv(M.t); var stat = staticFor(S.place);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    var par = (L.x - 480) * -0.06, kind = pl.out || (pl.zone === 'maison' ? 'jardin' : 'ville');
    pl.wins.forEach(function (r) { g.save(); g.beginPath(); g.rect(r[0] - 2, r[1] - 2, r[2] + 4, r[3] + 4); g.clip(); LL.drawSky(g, r[0], r[1], r[2], r[3], env, kind, par); g.restore(); });
    if (S.flags.fenetreOuverte && S.place === 'chambre') { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(402, 72, 30, 176); }
    LL.drawWeather(g, env, pl.wins, false);
    g.drawImage(stat, 0, 0, W, H);
    if (pl.anim) pl.anim(g, env, pl);
    dynamicProps(g, pl);
    // entités triées par y (profondeur)
    orderBuf.length = 0;
    orderBuf.push({ y: L.y, f: function () { drawLyham(g, pl); } });
    M.npcs.forEach(function (n) { orderBuf.push({ y: n.y, f: function () { drawNPC(g, n, pl); } }); });
    if (cat.here) orderBuf.push({ y: cat.y, f: function () { drawCat(g, cat); } });
    if (ball.on) orderBuf.push({ y: ball.y, f: function () { K.shadow(g, ball.x, ball.y, 10, 3, 0.3); if (ball.kind === 'foot') drawFoot(g, ball.x, ball.y - 9 - ball.z, 9, ball.rot); else { g.fillStyle = '#e63946'; g.beginPath(); g.arc(ball.x, ball.y - 6 - ball.z, 6, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(ball.x - 2, ball.y - 8 - ball.z, 2, 0, 6.283); g.fill(); } } });
    orderBuf.sort(function (a, b) { return a.y - b.y; }); orderBuf.forEach(function (o) { o.f(); });
    if (fly.on) drawButterfly(g);
    if (M.anim && M.anim.overlay) try { M.anim.overlay(g, M.anim.k); } catch (e) { LL.reportError(e); }
    drawParts(g);
    if (pl.out) { LL.drawWeather(g, env, [[0, 0, W, H]], true); outdoorLife(g, pl); }
    lighting(g, pl);
    drawBubbles(g); drawSpeech(g, dt);
    if (M.title) { g.font = 'bold 20px system-ui, sans-serif'; var tw = g.measureText(LL.cleanEmoji(M.title)).width + 36; g.fillStyle = 'rgba(155,60,180,.85)'; rr(g, W / 2 - tw / 2, 10, tw, 38, 19); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(LL.cleanEmoji(M.title), W / 2, 30); if (M.anim) { g.fillStyle = 'rgba(255,255,255,.4)'; rr(g, W / 2 - tw / 2 + 14, 42, (tw - 28), 4, 2); g.fill(); g.fillStyle = '#ffd166'; rr(g, W / 2 - tw / 2 + 14, 42, (tw - 28) * M.anim.k, 4, 2); g.fill(); } }
    if (M.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(1, M.flash * 2) + ')'; g.fillRect(0, 0, W, H); M.flash -= dt; }
    if (M.fade > 0) { g.fillStyle = 'rgba(40,20,60,' + M.fade + ')'; g.fillRect(0, 0, W, H); M.fade = Math.max(0, M.fade - dt * 2.5); }
  }
  function drawLyham(g, pl) {
    var musicIdle = LL.S.place === 'chambre' && LL.audio.musicStyle && !M.anim && !L.moving; if (musicIdle && !LL.S.settings.reduce && Math.random() < 0.012) M.burst(L.x + 14 * L.dir, L.y - 175, '♪', 1, { vy: 30, life: 1.6, size: 18 });
    var o = { who: 'lyham', dir: L.dir, walk: L.moving ? L.walk : 0, pose: L.pose, hold: L.hold, arm: L.arm, expr: L.expr || (musicIdle ? 'joie' : null), talk: M.talking('lyham') || (musicIdle && Math.sin(M.t * 1.3) > 0.6), dance: L.dance, name: 'Lyham', headBob: L.headBob || musicIdle, armK: L.armK, eyesClosed: L.eyesClosed };
    if (/carrelage|damier|glace/.test(pl.sol) && L.pose !== 'lie') { g.save(); g.globalAlpha = 0.13; g.translate(0, L.y * 2); g.scale(1, -1); drawPerson(g, L.x, L.y, Object.assign({}, o, { name: null, noShadow: true })); g.restore(); }
    drawPerson(g, L.x, L.y, o);
  }
  function drawNPC(g, n, pl) {
    if (n.hidden) return;
    var o = { who: n.id, dir: n.dir, walk: n.walk, talk: M.talking(n.id), wave: n.waveT > 0, name: CHARS[n.id].nom, pose: n.pose, hold: n.hold, arm: n.arm, dance: n.dance, expr: n.expr };
    if (n.atDesk && LL.papaAuBureau() && !n.busy) { // papa au travail : tape, visio avec casque, téléphone, fait les cent pas
      var ph = Math.floor(M.t / 8) % 4; if (LL.papaEnVisio()) { o.arm = 'play'; o.talk = Math.sin(M.t * 1.3) > 0; o.dir = -1; o.pose = 'sit'; } else if (ph === 1) { o.arm = 'phone'; o.hold = 'phone'; o.talk = true; } else if (ph === 3) { n.x = 420 + Math.sin(M.t * 0.8) * 120; o.walk = M.t * 8; o.dir = Math.cos(M.t * 0.8) > 0 ? 1 : -1; } else { o.arm = 'play'; o.dir = -1; o.expr = 'concentre'; o.pose = 'sit'; }
      drawPerson(g, n.x, n.y, o);
      if (LL.papaEnVisio()) { var hs = 1.17, hx0 = n.x - 2, hy0 = n.y - 128 * hs; g.strokeStyle = '#222'; g.lineWidth = 5; g.beginPath(); g.arc(hx0, hy0, 30 * hs, 3.3, 6.1); g.stroke(); g.fillStyle = '#e63946'; g.beginPath(); g.ellipse(hx0 - 29 * hs, hy0 + 2, 7, 11, 0, 0, 6.283); g.ellipse(hx0 + 27 * hs, hy0 + 2, 7, 11, 0, 0, 6.283); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(hx0 - 29 * hs, hy0 + 10); g.quadraticCurveTo(hx0 - 24 * hs, hy0 + 28, hx0 - 6, hy0 + 26); g.stroke(); g.fillStyle = '#333'; g.beginPath(); g.arc(hx0 - 6, hy0 + 26, 3, 0, 6.283); g.fill(); }
      return;
    }
    if (n.cooking && !n.busy) { o.arm = 'stir'; o.hold = null; o.dir = 1; }
    drawPerson(g, n.x, n.y, o);
  }
  function dynamicProps(g, pl) {
    var S = LL.S, t = M.t;
    if (S.place === 'salon' && pl.tv) { var s = pl.tv; if (M.tv.on) { drawTVScreen(g, M.tv.ch, t - M.tv.since, s[0], s[1], s[2], s[3]); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(s[0] + s[2] - 26, s[1] + 4, 22, 16); K.text(g, String(M.tv.ch), s[0] + s[2] - 15, s[1] + 12, 12, '#fff'); } else { g.fillStyle = lg(g, s[0], s[1], s[0] + s[2], s[1] + s[3], ['#20202c', '#2c2c3c']); g.fillRect(s[0], s[1], s[2], s[3]); g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[0] + s[2] * 0.5, s[1]); g.lineTo(s[0], s[1] + s[3] * 0.8); g.fill(); } }
    if (S.place === 'chambre') { var lv = LL.audio.musicStyle ? 0.4 + (LL.musiqueLevel() || 0.3) : 0; var st = LL.audio.musicStyle && LL.audio.STYLES[LL.audio.musicStyle]; var pulse = lv ? 1 + Math.sin(t * 12) * 0.08 * lv * 2 : 1; g.fillStyle = '#111'; g.beginPath(); g.arc(542, 435, 16 * pulse, 0, 6.283); g.fill(); g.strokeStyle = st ? st.light : '#444'; g.lineWidth = 2; g.beginPath(); g.arc(542, 435, 9 * pulse, 0, 6.283); g.stroke(); if (st) { g.fillStyle = st.light; g.beginPath(); g.arc(556, 370, 3, 0, 6.283); g.fill(); if (!S.settings.reduce && Math.random() < 0.06) M.burst(542, 360, ['♪', '♫', '♬'][Math.floor(Math.random() * 3)], 1, { vy: 40, life: 2.2, size: 22 }); } }
    if (S.place === 'cuisine') { var bowl = M.mokaBowl; g.fillStyle = '#ff7aa8'; g.beginPath(); g.ellipse(560, 580, 22, 7, 0, 0, 6.283); g.fill(); g.fillStyle = '#c0623f'; if (S.daily.mokaBowl === S.day) { g.beginPath(); g.ellipse(560, 576, 15, 4, 0, 0, 6.283); g.fill(); } var papaCuisine = M.npcs.some(function (n) { return n.id === 'casimir' && n.cooking && !n.busy; }); if (papaCuisine) { K.pan(g, 415, 340, 1.1); g.fillStyle = '#e9c46a'; for (var pc = 0; pc < 5; pc++) { g.beginPath(); g.arc(408 + pc * 4, 337 + Math.sin(t * 6 + pc) * 1.2, 2.2, 0, 6.283); g.fill(); } if (!S.settings.reduce && Math.random() < 0.12) M.burst(415, 320, '~', 1, { vy: 35, life: 1.4, spread: 16 }); if (Math.random() < 0.004) LL.son('gresille'); }
      if (M.stoveOn || papaCuisine) { pl.stove.forEach(function (p, ip) { if (!M.stoveOn && ip === 0) return; g.fillStyle = rg(g, p[0], p[1], 2, 28, [[0, 'rgba(255,80,40,.95)'], [1, 'rgba(255,80,40,0)']]); g.beginPath(); g.ellipse(p[0], p[1], 26, 7, 0, 0, 6.283); g.fill(); }); } if (M.fridgeOpen) { g.fillStyle = '#fefefe'; g.fillRect(842, 152, 106, 316); g.fillStyle = 'rgba(255,255,220,.9)'; g.fillRect(848, 160, 94, 300); g.fillStyle = '#ccd'; for (var sh2 = 0; sh2 < 4; sh2++) g.fillRect(848, 220 + sh2 * 60, 94, 3); ['#ff9ccc', '#fff', '#80ed99', '#ffd166', '#e63946', '#4cc9f0'].forEach(function (c, i) { g.fillStyle = c; rr(g, 856 + (i % 3) * 28, 196 + Math.floor(i / 3) * 60, 20, 24, 3); g.fill(); }); g.fillStyle = '#e0e8f0'; g.save(); g.translate(840, 150); g.transform(-0.3, 0.1, 0, 1, 0, 0); g.fillRect(0, 0, 110, 320); g.restore(); } }
    if (S.place === 'chambre' && S.flags.lampe) { g.fillStyle = 'rgba(255,240,180,.95)'; g.beginPath(); g.moveTo(362, 290); g.lineTo(386, 302); g.lineTo(376, 314); g.fill(); }
  }
  function outdoorLife(g, pl) {
    if (env.reduce) return; var t = M.t, R = K.seeded(3);
    if (env.season === 'automne' && env.weather !== 'neige') for (var i = 0; i < 12; i++) { var x = (R() * W + t * 30 + Math.sin(t + i) * 30) % W, y = (R() * H + t * (40 + R() * 20)) % H; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillStyle = ['#e07a2f', '#d94f2b', '#f2b84b'][i % 3]; g.beginPath(); g.ellipse(0, 0, 6, 3, 0, 0, 6.283); g.fill(); g.restore(); }
    if ((env.season === 'printemps' || env.season === 'été') && env.weather === 'soleil' && env.h > 8 && env.h < 19 && !fly.on && (pl.id === 'jardin' || pl.id === 'parc')) { var bx = 200 + Math.sin(t * 0.5) * 300 + 300, by = 380 + Math.sin(t * 1.3) * 40; drawButterflyAt(g, bx, by, t); }
    if (env.h > 7 && env.h < 20 && env.weather !== 'pluie' && pl.sky) for (var b = 0; b < 3; b++) { var ox = ((t * (40 + b * 10) + b * 300) % (W + 100)) - 50, oy = 80 + b * 30 + Math.sin(t * 3 + b) * 6, wg = Math.sin(t * 10 + b) * 5; g.strokeStyle = '#3a2a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox - 8, oy - wg); g.quadraticCurveTo(ox - 4, oy - 3, ox, oy); g.quadraticCurveTo(ox + 4, oy - 3, ox + 8, oy - wg); g.stroke(); }
    if (pl.id === 'plage' && M.castle) { var cx = 730, cy = 500, k = M.castle; g.fillStyle = '#e0b870'; for (var tw2 = 0; tw2 < Math.ceil(k * 4); tw2++) { var tx = cx - 45 + tw2 * 30; g.fillRect(tx, cy - 26 - (tw2 % 2) * 12, 22, 26 + (tw2 % 2) * 12); g.fillStyle = '#d4a85a'; for (var cr = 0; cr < 3; cr++) g.fillRect(tx + cr * 8, cy - 32 - (tw2 % 2) * 12, 6, 6); g.fillStyle = '#e0b870'; } if (k >= 1) { g.fillStyle = '#e63946'; g.beginPath(); g.moveTo(cx + 8, cy - 70); g.lineTo(cx + 26, cy - 63); g.lineTo(cx + 8, cy - 56); g.fill(); g.fillStyle = '#555'; g.fillRect(cx + 6, cy - 70, 2, 32); } }
  }
  function drawButterflyAt(g, x, y, t) { var f = Math.abs(Math.sin(t * 14)); g.save(); g.translate(x, y); g.fillStyle = '#c77dff'; g.beginPath(); g.ellipse(-6 * f - 2, -2, 7 * f + 1, 9, -0.4, 0, 6.283); g.ellipse(6 * f + 2, -2, 7 * f + 1, 9, 0.4, 0, 6.283); g.fill(); g.fillStyle = '#ff7aa8'; g.beginPath(); g.ellipse(-5 * f - 1, 6, 5 * f + 1, 5, -0.4, 0, 6.283); g.ellipse(5 * f + 1, 6, 5 * f + 1, 5, 0.4, 0, 6.283); g.fill(); g.fillStyle = '#3a2a4a'; g.fillRect(-1, -8, 2, 16); g.restore(); }
  function drawButterfly(g) { fly.t += 0.016; fly.x += Math.sin(fly.t * 2) * 3 + (fly.vx || 0) * 0.016; fly.y = 360 + Math.sin(fly.t * 3) * 50; if (fly.x < 60 || fly.x > 900) fly.vx = -(fly.vx || 60); drawButterflyAt(g, fly.x, fly.y, M.t); }
  function lighting(g, pl) {
    var n = LL.nightness(env.h), h = env.h, inside = !pl.out;
    if (!inside || n < 0.5) { // rayons de soleil par les fenêtres
      if (inside && n < 0.3 && env.weather !== 'pluie' && env.weather !== 'neige') { g.save(); g.globalCompositeOperation = 'lighter'; var sl = (h - 13) * 18; pl.wins.forEach(function (r) { if (r[2] > 300) return; g.fillStyle = lg(g, 0, r[1], 0, 590, ['rgba(255,240,190,.16)', 'rgba(255,240,190,0)']); g.beginPath(); g.moveTo(r[0], r[1] + r[3]); g.lineTo(r[0] + r[2], r[1] + r[3]); g.lineTo(r[0] + r[2] + sl + 120, 590); g.lineTo(r[0] + sl - 40, 590); g.fill(); }); g.restore(); }
    }
    var tint = null; if (h >= 6 && h < 9) tint = 'rgba(255,190,110,' + (0.16 * (1 - Math.abs(h - 7.5) / 1.5)) + ')'; else if (h >= 17.5 && h < 20.5) tint = 'rgba(255,120,60,' + (0.2 * (1 - Math.abs(h - 19) / 1.5)) + ')';
    if (tint) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = tint; g.fillRect(0, 0, W, H); g.restore(); }
    if (n > 0) { g.save(); g.globalCompositeOperation = 'multiply'; var k = n * (inside ? 0.55 : 0.75); g.fillStyle = 'rgb(' + Math.round(255 - 175 * k) + ',' + Math.round(255 - 160 * k) + ',' + Math.round(255 - 70 * k) + ')'; g.fillRect(0, 0, W, H); g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; (pl.lamps || []).forEach(function (lp) { var on = lp[3] ? !!LL.S.flags[lp[3] === 'chambre_lampe' ? 'lampe' : lp[3]] || lp[3] === 'bureau_lampe' && LL.papaAuBureau() : true; if (!on) return; g.fillStyle = rg(g, lp[0], lp[1], 4, lp[2] * 1.6, [[0, 'rgba(255,200,120,' + (0.38 * n) + ')'], [1, 'rgba(255,200,120,0)']]); g.beginPath(); g.arc(lp[0], lp[1], lp[2] * 1.6, 0, 6.283); g.fill(); }); g.restore(); }
    else if (LL.S.flags.lampe && pl.id === 'chambre') { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, 362, 300, 4, 140, [[0, 'rgba(255,210,140,.25)'], [1, 'rgba(255,210,140,0)']]); g.beginPath(); g.arc(362, 300, 140, 0, 6.283); g.fill(); g.restore(); }
  }

  /* ================= Bulles d'action (positions SPOT ou réparties) ================= */
  function layoutBubbles() {
    var acts = LL.actsHere ? LL.actsHere() : [], spots = LL.SPOT[LL.S.place] || [], used = {}, free = [];
    M.bubbles = acts.map(function (a) { var sp = null; for (var i = 0; i < spots.length; i++) if (!used[i] && a.label.toLowerCase().indexOf(spots[i][0].toLowerCase()) >= 0) { sp = spots[i]; used[i] = 1; break; } var b = { a: a, x: 0, y: 0, lx: 480, ly: 530, dir: 1, sp: !!sp }; if (sp) { b.x = sp[1]; b.y = sp[2]; b.lx = sp[3]; b.ly = sp[4]; b.dir = sp[5]; } else free.push(b); return b; });
    // répartition automatique des actions sans emplacement
    free.forEach(function (b, i) { var cols = Math.min(free.length, 9), row = Math.floor(i / cols); b.x = 90 + (i % cols) * (780 / Math.max(1, cols - 1 || 1)); b.y = 84 + row * 58; b.lx = LL.clamp(b.x, 80, 880); b.ly = 520; b.dir = 1; });
    // éviter les chevauchements
    for (var i = 0; i < M.bubbles.length; i++) for (var j = 0; j < i; j++) { var A = M.bubbles[i], B = M.bubbles[j]; if (Math.abs(A.x - B.x) < 46 && Math.abs(A.y - B.y) < 46) { A.x += 48; if (A.x > 930) { A.x = 60; A.y += 50; } } }
  }
  M.layoutBubbles = layoutBubbles;
  function drawBubbles(g) {
    if (M.busy() && M.anim) return;
    var t = M.t; M.bubbles.forEach(function (b, i) {
      var en = b.a.ok === true, bob = LL.S.settings.reduce ? 0 : Math.sin(t * 2.4 + i) * 3, x = b.x, y = b.y + bob;
      g.globalAlpha = en ? 1 : 0.5; g.fillStyle = 'rgba(80,30,110,.25)'; g.beginPath(); g.arc(x + 2, y + 3, 22, 0, 6.283); g.fill();
      g.fillStyle = en ? rg(g, x - 6, y - 8, 2, 24, ['#ffffff', '#ffe6f3']) : '#ddd'; g.beginPath(); g.arc(x, y, 22, 0, 6.283); g.fill(); g.strokeStyle = en ? '#ff6fa8' : '#999'; g.lineWidth = 2.5; g.stroke();
      g.beginPath(); g.moveTo(x - 6, y + 19); g.lineTo(x, y + 30); g.lineTo(x + 6, y + 19); g.fillStyle = en ? '#ffe6f3' : '#ddd'; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle'; if (LL.emojiOK(b.a.emoji)) { g.font = '22px system-ui, sans-serif'; g.fillStyle = '#000'; g.fillText(b.a.emoji, x, y + 1); } else { var ini = (b.a.label.replace(/^\S+\s*/, '').charAt(0) || '?').toUpperCase(); g.fillStyle = K.lg(g, x, y - 16, x, y + 16, ['#b07cf0', '#7b3fd1']); g.beginPath(); g.arc(x, y, 16, 0, 6.283); g.fill(); g.font = 'bold 18px system-ui, sans-serif'; g.fillStyle = '#fff'; g.fillText(ini, x, y + 1); }
      if (!en) { g.fillStyle = '#7a6a8a'; g.beginPath(); g.arc(x + 15, y - 15, 8, 0, 6.283); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 11, y - 15); g.lineTo(x + 19, y - 15); g.stroke(); }
      g.globalAlpha = 1;
    });
  }

  /* ================= Entrées tactiles ================= */
  function toLogical(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H }; }
  M.tap = function (x, y) {
    if (LL.audioUnlock) LL.audioUnlock();
    if (M.dialogBusy) { M.skipWaits(); return 'skip'; }
    if (M.anim) { if (M.anim.tap) M.anim.tap(x, y); return 'anim'; }
    for (var i = M.bubbles.length - 1; i >= 0; i--) { var b = M.bubbles[i]; if ((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y) < 30 * 30) { LL.son('click'); LL.act(b.a.i); return 'act'; } }
    for (var k = 0; k < M.npcs.length; k++) { var n = M.npcs[k], hh = 175 * (CHARS[n.id].h || 1); if (!n.hidden && Math.abs(x - n.x) < 34 && y < n.y + 10 && y > n.y - hh) { LL.son('click'); if (LL.ui && LL.ui.personMenu) LL.ui.personMenu(n.id); return 'npc'; } }
    if (cat.here && Math.abs(x - cat.x) < 34 && Math.abs(y - (cat.y - 20)) < 30) { var idx = LL.findAct && LL.findAct('Caresser Moka'); if (idx != null && idx >= 0) { LL.act(idx); return 'cat'; } }
    if (y >= GY0 - 30) { M.walkTo(x, Math.max(GY0, y)); return 'walk'; }
    return 'none';
  };
  var inputBound = false;
  function bindInput() { if (inputBound) return; inputBound = true; cv.addEventListener('pointerdown', function (ev) { ev.preventDefault(); var p = toLogical(ev); try { M.tap(p.x, p.y); } catch (e) { LL.reportError(e); } }); }

  /* ================= Boucle principale (une seule) ================= */
  function resize() { if (!cv) return; var r = cv.getBoundingClientRect(), nd = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * (r.width / W || 1))); nd = Math.round(nd * 4) / 4; if (nd !== dpr || cv.width !== Math.round(W * nd)) { dpr = nd; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cache = {}; } }
  M.resize = resize;
  M.step = function (dt) {
    dt = +dt; if (!isFinite(dt) || dt < 0) dt = 0; if (dt > 0.05) dt = 0.05;
    M.t += dt; M.frames++;
    if (L.freeDance && L.dance != null) L.dance += dt * 4; M.npcs.forEach(function (n) { if (n.freeDance && n.dance != null) n.dance += dt * 4; });
    updateLyham(dt); updateNPCs(dt); updateCat(dt); updateBall(dt); updateParts(dt); updateWaits(dt); updateAnim(dt);
    if (LL.tickGame) LL.tickGame(dt);
    if (LL.audioTick) LL.audioTick();
  };
  function frame(ts) {
    if (!loopOn) return;
    var dt = lastTs ? (ts - lastTs) / 1000 : 0.016; lastTs = ts;
    try { M.step(dt); if (!document.hidden) { render(LL.clamp(dt, 0, 0.05)); if (LL.ui && LL.ui.isOpen && LL.ui.isOpen()) LL.ui.tick(); } } catch (e) { LL.reportError(e); }
    requestAnimationFrame(frame);
  }
  M.renderNow = function () { try { render(0.016); } catch (e) { LL.reportError(e); } };
  M.start = function () {
    if (loopOn) return; cv = document.getElementById('scene'); g = cv.getContext('2d'); resize(); bindInput();
    window.addEventListener('resize', resize); window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
    loopOn = true; lastTs = 0; requestAnimationFrame(frame);
  };
})();

/* ================= Interactions avec les personnages : KINDS (menu) et TALK (dialogues) ================= */
(function () {
  'use strict';
  var LL = window.LyhamLife, M = LL.M;
  function S() { return LL.S; }
  function niv() { return LL.niveau(S().day); }
  /* Dialogues : chaque personnage garde sa voix ; les lignes tiennent compte du vécu (drapeaux, niveau, saison) */
  var TALK = M.TALK = {
    casimir: [
      function () { return 'Tu sais pourquoi les crêpes sont mes meilleures amies ? Parce qu\'elles ne me retournent jamais… enfin, presque ! 🥞'; },
      function () { return 'Alors, la ' + niv() + ' ? Raconte-moi un truc que tu as appris aujourd\'hui.'; },
      function () { return 'Ce soir je tente une crêpe en forme de chat. Si elle ressemble à Moka, je la vends au musée.'; },
      function (s) { return s.flags.cadeau_papa ? 'J\'utilise encore ton cadeau d\'anniversaire, tu sais. Tous les jours.' : null; },
      function () { return 'Mes collègues en visio ont vu Moka passer derrière moi. Il est plus célèbre que moi maintenant !'; },
      function (s) { return s.flags.dispute_ecran_ok ? 'Merci d\'avoir tenu parole pour les écrans. Ça compte pour moi.' : null; },
      function () { return 'Le secret d\'une bonne sauce ? La patience. Et un peu de musique. Surtout la musique.'; },
      function (s) { return LL.niveauIdx(s.day) >= 4 ? 'La philo… J\'ai eu 9 au bac, moi. Tu feras mieux, j\'en suis sûr !' : 'Profite de ces années, ma grande, elles passent tellement vite.'; },
      function () { return 'Si tu as besoin d\'aide pour tes devoirs, passe à ma pause, d\'accord ?'; }
    ],
    tania: [
      function () { return 'Ma chérie ! Tu as vu le dernier épisode de ma série ? Non ? Ne me spoile rien, alors 🤫'; },
      function () { return 'Je suis tellement fière de toi, tu sais. Même les jours où tout est difficile.'; },
      function (s) { return s.flags.anniv_maman_surprise ? 'Je repense encore à ma surprise d\'anniversaire… Tu m\'as fait pleurer de joie !' : null; },
      function () { return 'On se fait une soirée plaid-chocolat-série vendredi ? Rien que nous deux.'; },
      function () { return 'Si quelque chose te tracasse, tu peux tout me dire. Tout, hein.'; },
      function (s) { return 'Tu as l\'air ' + (s.g.energie < 30 ? 'fatiguée, va te coucher tôt ce soir.' : 'en forme ! Ça fait plaisir.'); },
      function () { return 'Ton père a encore mis du sel dans le café ce matin. Ne lui dis pas que je te l\'ai dit 😂'; },
      function (s) { return s.rel.lisa > 30 ? 'Comment va Lisa, ta correspondante ? Ton anglais a fait des progrès fous !' : null; }
    ],
    daryl: [
      function () { return 'Yo ! Tu as progressé à la console ou je dois encore t\'apprendre la vie ? 🎮'; },
      function () { return 'Mon appart est trop calme sans vous. Même les ronflements de Moka me manquent.'; },
      function (s) { return 'Alors, la ' + niv() + ' ? Quand j\'étais à ta place, je dormais en cours d\'histoire. Ne fais pas comme moi.'; },
      function (s) { return s.flags.daryl_secret ? 'Merci d\'avoir gardé mon secret, sœurette. T\'es la meilleure.' : null; },
      function () { return 'Papa m\'a encore appelé pour me demander comment on fait une capture d\'écran. Trois fois.'; },
      function () { return 'Un jour je t\'emmène voir un vrai match au stade. Promis.'; }
    ],
    cataleya: [
      function () { return 'Tu as vu la nouvelle chorée de Mme Lopez ? Je vais me faire une entorse au cerveau 😵'; },
      function () { return 'J\'ai écrit une chanson ! Enfin, deux lignes. Mais elles sont incroyables.'; },
      function (s) { return s.flags.amitie_ep2_verite ? 'Merci d\'avoir été honnête l\'autre fois. C\'est pour ça que t\'es ma meilleure amie.' : null; },
      function () { return 'On révise ensemble au CDI ? Je ramène les gâteaux, tu ramènes ton cerveau.'; },
      function () { return 'Mon petit frère a dessiné sur mon cahier de maths. Le prof a cru que c\'était de l\'art abstrait.'; },
      function (s) { return LL.niveauIdx(s.day) >= 2 ? 'Le lycée c\'est grand, mais tant qu\'on est ensemble, tout va bien.' : 'Plus que quelques années et on est au lycée, tu te rends compte ?'; },
      function () { return 'Si je deviens célèbre, tu seras ma manager. C\'est décidé.'; }
    ],
    elynn: [
      function () { return 'Tu te souviens quand on avait 4 ans et qu\'on faisait des cabanes avec les coussins ? 🛋️'; },
      function () { return 'J\'ai planté des tournesols chez moi. Ils sont plus grands que moi maintenant 🌻'; },
      function (s) { return s.flags.elynn_cabane_promesse ? 'Notre promesse de la cabane tient toujours, hein ? Pour toujours.' : null; },
      function () { return 'Je lis un livre sur les étoiles. Tu savais qu\'on est faits de poussière d\'étoile ? ✨'; },
      function () { return 'Le trio, c\'est sacré. Même quand Cataleya chante faux. Surtout quand elle chante faux.'; },
      function (s) { return 'Ma mère dit que tu es ' + (s.rel.elynn > 75 ? 'comme une deuxième fille pour elle.' : 'toujours la bienvenue chez nous.'); }
    ],
    noah: [function () { return 'Tu as compris l\'exercice 3 ? Moi j\'ai compris l\'exercice… 1.'; }, function () { return 'Foot à la récré ? Je suis gardien, je ne laisse rien passer ! (sauf tout)'; }, function () { return 'J\'ai vu un documentaire sur les pieuvres. Elles ont trois cœurs ! 🐙'; }],
    lopez: [function () { return 'La danse, c\'est 10 % de talent et 90 % de travail. Et 100 % de plaisir !'; }, function () { return 'Garde les épaules basses et le regard loin, Lyham.'; }, function () { return 'Le gala de fin d\'année approche, je compte sur le trio !'; }],
    vendeur: [function () { return 'Aujourd\'hui, les fraises sont à tomber par terre ! 🍓'; }, function () { return 'Bonjour mademoiselle ! Comme d\'habitude ?'; }],
    vendeuse: [function () { return 'Nous avons reçu de nouvelles robes, elles vous iraient à merveille !'; }, function () { return 'Bonne journée, et revenez nous voir !'; }]
  };
  ['prof_maths', 'prof_fr', 'prof_ang', 'prof_hg', 'prof_sc', 'prof_philo'].forEach(function (p) { TALK[p] = [function () { return LL.profLine(p); }]; });
  LL.profLine = function (p) { var n = LL.niveauIdx(S().day), L2 = {
      prof_maths: ['Aujourd\'hui : les puissances. 10³ = 1 000 !', 'Le théorème de Thalès, c\'est une histoire de proportionnalité.', 'Une fonction associe à chaque x une unique image f(x).', 'La dérivée mesure la vitesse de variation d\'une fonction.', 'Le logarithme népérien est la réciproque de l\'exponentielle.'][n],
      prof_fr: ['Le narrateur n\'est pas l\'auteur, ne l\'oubliez jamais !', 'Une thèse, des arguments, des exemples : c\'est la base.', 'Analysons ce poème de Baudelaire ensemble.', 'Pour le bac de français : méthode, méthode, méthode !', 'Commençons notre chapitre.'][n],
      prof_philo: ['', '', '', '', 'Problématiser, c\'est montrer qu\'une question ne va pas de soi.'][n] || 'Pensons ensemble.',
      prof_ang: ['Today: the present perfect. "I have lived here for 3 years."', 'Let\'s practise the "th" sound: think, this, three!', 'Linking words: however, moreover, whereas.', 'Debate time: for or against social media?', 'Write a thesis, then defend it with examples.'][n],
      prof_hg: ['Le siècle des Lumières : la raison contre l\'arbitraire.', 'La Première Guerre mondiale : une guerre totale.', 'La Méditerranée, carrefour de civilisations.', 'La Révolution française et l\'Empire : un nouvel ordre politique.', 'La guerre froide : deux blocs, deux modèles.'][n],
      prof_sc: ['Les états de la matière : solide, liquide, gaz.', 'La cellule, unité du vivant.', 'L\'atome : noyau et électrons.', 'L\'ADN porte l\'information génétique.', 'La radioactivité et ses applications.'][n] }; return L2[p] || 'Bonjour à tous !'; };
  var lastIdx = {};
  LL.talkLine = function (who) {
    var arr = TALK[who] || TALK.vendeur, s = S(), tries = 0, i = (s.day * 7 + (lastIdx[who] || 0) + 1) % arr.length, out = null;
    while (tries++ < arr.length * 2) { var r = arr[i](s); if (r && i !== lastIdx[who]) { out = r; break; } i = (i + 1) % arr.length; }
    lastIdx[who] = i; return out || arr[0](s) || 'Coucou !';
  };
  var FRIENDS = ['cataleya', 'elynn', 'noah'], FAMILY = ['casimir', 'tania', 'daryl'];
  /* KINDS : libellé, durée, gains, bonus de lien quotidien, condition */
  M.KINDS = {
    discuter: { lbl: '💬 Discuter', dur: 15, gain: { social: 12, fun: 4 }, rel: 2, ok: function () { return true; } },
    calin: { lbl: '🤗 Câlin', dur: 2, gain: { social: 8, fun: 4 }, rel: 3, ok: function (w) { return FAMILY.concat(['cataleya', 'elynn']).indexOf(w) >= 0; } },
    check: { lbl: '✋ Check', dur: 1, gain: { social: 6, fun: 5 }, rel: 1, ok: function (w) { return FRIENDS.concat(FAMILY).indexOf(w) >= 0; } },
    danser: { lbl: '💃 Danser ensemble', dur: 15, gain: { fun: 14, social: 8, energie: -5 }, rel: 2, xp: ['danse', 3], ok: function (w) { return ['cataleya', 'elynn', 'tania', 'casimir', 'lopez'].indexOf(w) >= 0; } },
    blague: { lbl: '😂 Blague', dur: 5, gain: { fun: 12, social: 6 }, rel: 2, xp: ['charisme', 1], ok: function (w) { return !/^prof|vendeu|lopez/.test(w); } },
    selfie: { lbl: '🤳 Selfie', dur: 5, gain: { fun: 10, social: 6 }, rel: 1, ok: function (w) { return FRIENDS.concat(FAMILY).indexOf(w) >= 0; } },
    cupcake: { lbl: '🧁 Offrir un cupcake', dur: 5, gain: { social: 10 }, rel: 5, ok: function (w) { return LL.hasItem('cupcake') ? true : 'Tu n\'as pas de cupcake (cuisine-en ou achète-en à la boulangerie).'; } },
    cuisiner: { lbl: '🍳 Aider papa à cuisiner', dur: 45, gain: { faim: 50, social: 10, fun: 8 }, rel: 3, xp: ['cuisine', 6], ok: function (w) { return w === 'casimir' && LL.S.place === 'cuisine' ? true : w === 'casimir' ? 'Papa cuisine dans la cuisine, vers 12 h et 18 h 30.' : false; } },
    cartes: { lbl: '🃏 Partie de cartes', dur: 30, gain: { fun: 14, social: 10 }, rel: 2, ok: function (w) { return FAMILY.indexOf(w) >= 0 ? (LL.S.place === 'salon' ? true : 'Les cartes, c\'est au salon !') : false; } },
    jardiner: { lbl: '🌱 Jardiner ensemble', dur: 30, gain: { fun: 8, social: 8, hygiene: -5 }, rel: 2, xp: ['jardinage', 5], ok: function (w) { return FAMILY.indexOf(w) >= 0 && LL.S.place === 'jardin' ? true : false; } },
    question: { lbl: '❓ Poser une question', dur: 10, gain: { social: 3 }, rel: 0, ok: function (w) { return /^prof/.test(w); } },
    conseil: { lbl: '🩰 Demander un conseil', dur: 10, gain: { fun: 4 }, rel: 2, xp: ['danse', 4], ok: function (w) { return w === 'lopez'; } }
  };
  LL.kindsFor = function (who) { var out = []; Object.keys(M.KINDS).forEach(function (k) { var r = M.KINDS[k].ok(who); if (r === false) return; if ((k === 'question' || k === 'conseil') !== (/^prof/.test(who) || who === 'lopez') && (k === 'question' || k === 'conseil')) return; out.push({ k: k, lbl: M.KINDS[k].lbl, ok: r }); }); if (/vendeu/.test(who)) out = out.filter(function (o) { return o.k === 'discuter'; }); return out; };
  var QA = { prof_maths: [['Pourquoi (−2)×(−3) = 6 ?', 'Multiplier par un négatif inverse le sens : on inverse deux fois, donc on revient au positif !']], prof_fr: [['C\'est quoi une métaphore ?', 'Une comparaison sans outil de comparaison : « Cette fille est un rayon de soleil ».']], prof_ang: [['How do I say « je suis impatiente » ?', '« I\'m looking forward to it! » — and remember: to + -ing!']], prof_hg: [['Pourquoi étudier l\'histoire ?', 'Pour comprendre d\'où viennent les choses d\'aujourd\'hui, et exercer son esprit critique.']], prof_sc: [['Pourquoi le ciel est bleu ?', 'La lumière bleue est davantage diffusée par l\'air : c\'est la diffusion de Rayleigh.']], prof_philo: [['À quoi sert la philosophie ?', 'À apprendre à penser par soi-même : ne rien tenir pour vrai sans l\'avoir examiné.']] };
  LL.interact = function (who, kind) {
    var K = M.KINDS[kind]; if (!K) return false; var r = K.ok(who); if (r !== true) { LL.toast(typeof r === 'string' ? r : 'Impossible maintenant.'); return false; }
    var n = M.npcs.filter(function (x) { return x.id === who; })[0]; if (!n) { LL.toast('Cette personne n\'est pas ici.'); return false; }
    if (M.busy() && !M.instant) { LL.toast('Lyham est occupée… ⏳'); return false; }
    if (who === 'casimir' && LL.S.place === 'bureau' && LL.papaEnVisio()) { M.say('casimir', 'Chut, je suis en réunion ! 🤫', 2); LL.toast('Chut… papa est en visio dans son bureau, reviens à sa pause !'); return false; }
    if (kind === 'cuisiner') { var i = LL.findAct('Aider papa'); if (i >= 0) return LL.act(i); }
    var L = M.L, side = L.x < n.x ? -1 : 1; n.busy = true; n.tx = null;
    var finish = function () { var s = S(); LL.add(K.gain); if (K.xp) LL.xp(K.xp[0], K.xp[1]); if (K.rel && s.daily['rel_' + who + '_' + kind] !== s.day) { s.daily['rel_' + who + '_' + kind] = s.day; LL.rel(who, K.rel); } LL.pass(K.dur); LL.log(K.lbl.replace(/^\S+\s/, '') + ' avec ' + M.CHARS[who].nom); n.busy = false; n.arm = null; n.dance = null; n.freeDance = false; n.expr = null; L.arm = null; L.dance = null; L.freeDance = false; L.hold = null; L.expr = null; M.dialogBusy = false; M.title = ''; if (LL.render) LL.render(); if (LL.checkStory) LL.checkStory(); };
    M.setTitle(K.lbl);
    M.walkTo(n.x + side * 70, n.y, function () {
      L.dir = -side; n.dir = side; M.dialogBusy = true;
      var lines;
      switch (kind) {
        case 'discuter': lines = [['lyham', ['Hey ! Ça va ?', 'Tu as deux minutes ?', 'Devine ce qui m\'est arrivé aujourd\'hui !', 'J\'ai un truc à te raconter !'][S().day % 4]], [who, LL.talkLine(who), 3]]; break;
        case 'calin': L.arm = 'hug'; n.arm = 'hug'; M.burst((L.x + n.x) / 2, L.y - 150, '💕', 6); LL.son('coeur'); lines = [[who, who === 'daryl' ? 'Bon, ok, un câlin… mais vite fait ! 😅' : 'Oh, ça fait du bien ! 💕']]; break;
        case 'check': L.arm = 'out'; n.arm = 'out'; M.burst((L.x + n.x) / 2, L.y - 110, '✨', 8, { spread: 10, vx: 160, vy: 80 }); LL.son('pop'); lines = [[who, ['Check ! ✋', 'Yeah !', 'Trop forte !'][S().day % 3]]]; break;
        case 'danser': L.dance = 0; n.dance = 0; L.freeDance = true; n.freeDance = true; LL.son('tv7'); lines = [[who, 'Allez, on danse ! 💃'], ['lyham', 'Et un tour ! ✨']]; break;
        case 'blague': var J = [['Pourquoi les plongeurs plongent-ils en arrière ?', 'Parce que sinon ils tombent dans le bateau ! 😂'], ['Que dit un escargot sur le dos d\'une tortue ?', 'Waouh, ça va vite ! 🐌'], ['Quel est le comble pour un électricien ?', 'De ne pas être au courant ! ⚡'], ['Pourquoi les poissons détestent l\'ordinateur ?', 'À cause du net ! 🐟']][S().day % 4]; L.expr = 'rire'; lines = [['lyham', J[0]], [who, J[1]]]; n.expr = 'rire'; LL.son('pop'); break;
        case 'selfie': L.hold = 'phone'; L.arm = 'up'; lines = [['lyham', 'Selfie ! Souriiiire ! 📸']]; M.wait(1.2, function () { M.flash = 0.5; LL.son('flash'); }); break;
        case 'cupcake': LL.takeItem('cupcake'); L.hold = 'cupcake'; L.arm = 'out'; M.burst(n.x, n.y - 150, '🧁', 3); lines = [['lyham', 'Tiens, c\'est pour toi ! 🧁'], [who, who === 'daryl' ? 'Un cupcake ? T\'es la meilleure sœur du monde (ne le répète pas).' : 'Oh merci, il a l\'air délicieux ! 💕']]; break;
        case 'cartes': L.hold = 'cards'; L.arm = 'out'; n.hold = 'cards'; n.arm = 'out'; var win = Math.random() < 0.5; lines = [[who, 'Bataille ! Prépare-toi…'], ['lyham', win ? 'J\'ai gagné ! 🃏🏆' : 'Grrr, revanche !'], [who, win ? 'Pfff, tu triches, c\'est sûr 😂' : 'Le champion reste le champion !']]; break;
        case 'jardiner': L.hold = 'shovel'; L.arm = 'stir'; n.arm = 'stir'; M.burst(L.x, L.y - 80, '🌱', 4); lines = [[who, 'On plante les tomates ici, au soleil.'], ['lyham', 'Et des fraises à côté ! 🍓']]; break;
        case 'question': var qa = (QA[who] || QA.prof_maths)[0]; L.arm = 'up'; lines = [['lyham', qa[0]], [who, qa[1], 4]]; LL.xp(M.CHARS[who].prof || 'maths', 3); break;
        case 'conseil': lines = [['lyham', 'Madame, comment je réussis mes pirouettes ?'], ['lopez', ['Fixe un point devant toi et tourne la tête en dernier. On appelle ça « piquer » le regard !', 'Le centre, Lyham ! Gaine ton ventre, et le reste suivra.'][S().day % 2], 4]]; break;
      }
      M.dialog(lines, function () { M.wait(0.4, finish); });
    });
    return true;
  };
})();
