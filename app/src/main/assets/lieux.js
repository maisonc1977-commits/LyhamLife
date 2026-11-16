/* Lyham Life — lieux.js : PLACES, NOMS, UNLOCK, SPOT et décors détaillés dessinés en Canvas 2D */
(function () {
  'use strict';
  var LL = window.LyhamLife, W = 960, H = 600, FY = 400; // FY : bas du mur / début du sol visuel

  /* ================= Boîte à outils de dessin ================= */
  var K = LL.K = {};
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  K.seeded = seeded;
  K.rr = function (g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  K.lg = function (g, x0, y0, x1, y1, stops) { var gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s, i) { gr.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s); }); return gr; };
  K.rg = function (g, x, y, r0, r1, stops) { var gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(function (s, i) { gr.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s); }); return gr; };
  K.shade = function (hex, p) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function f(c) { return Math.round(p < 0 ? c * (1 + p) : c + (255 - c) * p); } return 'rgb(' + f(r) + ',' + f(gg) + ',' + f(b) + ')'; };
  var rr = K.rr, lg = K.lg, rg = K.rg, sh = K.shade;
  K.box = function (g, x, y, w, h, c, r) { g.fillStyle = lg(g, x, y, x, y + h, [sh(c, 0.12), c, sh(c, -0.15)]); rr(g, x, y, w, h, r || 4); g.fill(); g.strokeStyle = sh(c, -0.35); g.lineWidth = 1.2; g.stroke(); };
  K.shadow = function (g, cx, cy, rx, ry, a) { g.fillStyle = rg(g, cx, cy, 0, rx, [[0, 'rgba(40,20,50,' + (a || 0.28) + ')'], [1, 'rgba(40,20,50,0)']]); g.save(); g.translate(cx, cy); g.scale(1, ry / rx); g.beginPath(); g.arc(0, 0, rx, 0, 6.283); g.fill(); g.restore(); };
  K.text = function (g, t, x, y, size, col, align, weight) { g.font = (weight || 'bold') + ' ' + size + 'px system-ui, sans-serif'; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(LL.cleanEmoji ? LL.cleanEmoji(t) : t, x, y); };

  /* Murs avec papiers peints à motifs */
  K.wall = function (g, base, pat, acc, y1) {
    y1 = y1 || FY; g.fillStyle = lg(g, 0, 0, 0, y1, [sh(base, 0.1), base, sh(base, -0.08)]); g.fillRect(0, 0, W, y1);
    var R = seeded(7); g.save(); g.beginPath(); g.rect(0, 0, W, y1); g.clip();
    if (pat === 'stripes') { for (var x = 0; x < W; x += 36) { g.fillStyle = acc; g.globalAlpha = 0.18; g.fillRect(x, 0, 14, y1); } }
    else if (pat === 'dots' || pat === 'hearts') { g.fillStyle = acc; g.globalAlpha = 0.25; for (var yy = 18; yy < y1; yy += 34) for (var xx = (yy / 34 % 2) * 20; xx < W; xx += 40) { if (pat === 'hearts') heart(g, xx, yy, 5); else { g.beginPath(); g.arc(xx, yy, 3, 0, 6.283); g.fill(); } } }
    else if (pat === 'flowers') { g.globalAlpha = 0.22; for (var y2 = 24; y2 < y1; y2 += 52) for (var x2 = (y2 / 52 % 2) * 30; x2 < W; x2 += 60) flower(g, x2, y2, 7, acc); }
    else if (pat === 'diamonds') { g.strokeStyle = acc; g.globalAlpha = 0.2; g.lineWidth = 1.5; for (var d = -y1; d < W; d += 44) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + y1, y1); g.moveTo(d + y1, 0); g.lineTo(d, y1); g.stroke(); } }
    else if (pat === 'bricks') { g.globalAlpha = 1; for (var by = 0; by < y1; by += 22) for (var bx = (by / 22 % 2) * -25; bx < W; bx += 50) { g.fillStyle = sh(base, (R() - 0.5) * 0.18); g.fillRect(bx + 1, by + 1, 48, 20); } g.fillStyle = 'rgba(0,0,0,.12)'; for (var b2 = 0; b2 < y1; b2 += 22) g.fillRect(0, b2, W, 1.5); }
    else if (pat === 'panels') { g.globalAlpha = 0.5; g.strokeStyle = sh(base, -0.2); g.lineWidth = 2; for (var px = 20; px < W; px += 120) { rr(g, px, y1 - 150, 100, 120, 6); g.stroke(); } }
    else if (pat === 'tiles') { g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.lineWidth = 1.5; for (var ty = 0; ty < y1; ty += 30) { g.beginPath(); g.moveTo(0, ty); g.lineTo(W, ty); g.stroke(); } for (var tx = 0; tx < W; tx += 30) { g.beginPath(); g.moveTo(tx, 0); g.lineTo(tx, y1); g.stroke(); } }
    g.restore();
    // Plinthe
    g.fillStyle = lg(g, 0, y1 - 14, 0, y1, ['#fff', '#e6dbe9']); g.fillRect(0, y1 - 14, W, 14); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, y1, W, 3);
  };
  function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.3, x, y - s * 0.4); g.bezierCurveTo(x + s * 0.6, y - s * 1.3, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); g.fill(); }
  K.heart = heart;
  function flower(g, x, y, r, c) { g.fillStyle = c; for (var i = 0; i < 5; i++) { var a = i * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.55, 0, 6.283); g.fill(); } g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(x, y, r * 0.4, 0, 6.283); g.fill(); }
  K.flower = flower;

  /* Sols : parquet veiné, carrelage avec joints et reflets, herbe, sable, lino, tapis */
  K.floor = function (g, type, c1, c2, y0) {
    y0 = y0 || FY; var R = seeded(31), h = H - y0;
    if (type === 'parquet' || type === 'gym') {
      g.fillStyle = lg(g, 0, y0, 0, H, [sh(c1, 0.08), c1, sh(c1, -0.1)]); g.fillRect(0, y0, W, h);
      for (var y = y0, row = 0; y < H; row++) { var rh = 14 + row * 2.2; for (var x = -(row * 57 % 160); x < W; x += 160) { g.fillStyle = sh(c1, (R() - 0.5) * 0.14); g.fillRect(x + 1, y + 1, 158, rh - 1.5); g.strokeStyle = sh(c1, -0.12); g.globalAlpha = 0.45; g.lineWidth = 0.8; for (var k = 0; k < 3; k++) { g.beginPath(); var vy = y + 3 + R() * (rh - 6); g.moveTo(x + 5, vy); g.bezierCurveTo(x + 50, vy + R() * 4 - 2, x + 100, vy + R() * 4 - 2, x + 155, vy); g.stroke(); } g.globalAlpha = 1; } g.fillStyle = sh(c1, -0.3); g.fillRect(0, y, W, 1.2); y += rh; }
      if (type === 'gym') { g.strokeStyle = c2 || '#e94f64'; g.lineWidth = 3; g.beginPath(); g.ellipse(480, 520, 150, 45, 0, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(480, y0); g.lineTo(480, H); g.stroke(); }
    } else if (type === 'carrelage' || type === 'damier') {
      g.fillStyle = c1; g.fillRect(0, y0, W, h);
      for (var r2 = 0, yy = y0; yy < H; r2++) { var th = 18 + r2 * 4; for (var xx = -(r2 % 2) * 30, i = 0; xx < W; xx += 60, i++) { g.fillStyle = type === 'damier' && (i + r2) % 2 ? c2 : sh(c1, (R() - 0.5) * 0.06); g.fillRect(xx + 1, yy + 1, 58, th - 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(xx + 3, yy + 2, 30, 2); } g.fillStyle = 'rgba(80,60,80,.25)'; g.fillRect(0, yy, W, 1.5); yy += th; }
      g.fillStyle = lg(g, 0, y0, 0, y0 + 60, ['rgba(255,255,255,.25)', 'rgba(255,255,255,0)']); g.fillRect(0, y0, W, 60);
    } else if (type === 'herbe') {
      g.fillStyle = lg(g, 0, y0, 0, H, [c1, sh(c1, -0.18)]); g.fillRect(0, y0, W, h);
      for (var n = 0; n < 900; n++) { var gx = R() * W, gy = y0 + R() * h, gl = 4 + (gy - y0) / h * 9; g.strokeStyle = sh(c1, (R() - 0.4) * 0.35); g.lineWidth = 1.3; g.beginPath(); g.moveTo(gx, gy); g.quadraticCurveTo(gx + 2, gy - gl * 0.6, gx + (R() - 0.5) * 5, gy - gl); g.stroke(); }
    } else if (type === 'sable') {
      g.fillStyle = lg(g, 0, y0, 0, H, [c1, sh(c1, -0.1)]); g.fillRect(0, y0, W, h);
      for (var s = 0; s < 1500; s++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.35)' : 'rgba(150,110,60,.25)'; g.fillRect(R() * W, y0 + R() * h, 1.5, 1.5); }
      g.strokeStyle = 'rgba(160,120,70,.25)'; g.lineWidth = 2; for (var q = 0; q < 8; q++) { g.beginPath(); var sy = y0 + 20 + q * 22; g.moveTo(0, sy); for (var sx = 0; sx < W; sx += 40) g.quadraticCurveTo(sx + 20, sy - 4, sx + 40, sy); g.stroke(); }
    } else if (type === 'lino') {
      g.fillStyle = lg(g, 0, y0, 0, H, [sh(c1, 0.1), c1]); g.fillRect(0, y0, W, h); g.fillStyle = 'rgba(255,255,255,.1)'; for (var l = 0; l < 300; l++) g.fillRect(R() * W, y0 + R() * h, 3, 1);
      g.fillStyle = lg(g, 0, y0, 0, y0 + 80, ['rgba(255,255,255,.3)', 'rgba(255,255,255,0)']); g.fillRect(0, y0, W, 80);
    } else if (type === 'moquette') {
      g.fillStyle = c1; g.fillRect(0, y0, W, h); for (var m = 0; m < 2500; m++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; g.fillRect(R() * W, y0 + R() * h, 2, 2); }
    } else if (type === 'glace') {
      g.fillStyle = lg(g, 0, y0, 0, H, ['#eaf6ff', '#bfe0f5']); g.fillRect(0, y0, W, h); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1; for (var c = 0; c < 40; c++) { g.beginPath(); var cx = R() * W, cy = y0 + R() * h; g.ellipse(cx, cy, 40 + R() * 80, 8 + R() * 10, R() * 0.4 - 0.2, 0, 3); g.stroke(); }
    } else if (type === 'pave') {
      g.fillStyle = c1; g.fillRect(0, y0, W, h); for (var py = y0, pr = 0; py < H; pr++) { var ph = 12 + pr * 2; for (var px = -(pr % 2) * 18; px < W; px += 36) { g.fillStyle = sh(c1, (R() - 0.5) * 0.2); rr(g, px + 1, py + 1, 34, ph - 2, 3); g.fill(); } py += ph; }
    }
  };
  K.rug = function (g, cx, cy, rx, ry, c1, c2) { K.shadow(g, cx, cy + 4, rx + 6, ry + 4, 0.18); g.fillStyle = c1; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.fill(); g.strokeStyle = c2; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy, rx * 0.82, ry * 0.75, 0, 0, 6.283); g.stroke(); g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.ellipse(cx, cy, rx * 0.6, ry * 0.5, 0, 0, 6.283); g.stroke(); g.setLineDash([]); };

  /* Fenêtre : le trou est rendu transparent dans le cache, le ciel est dessiné dynamiquement dessous */
  K.windowFrame = function (g, x, y, w, h, curtain, place) {
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(x, y, w, h); g.restore();
    g.strokeStyle = '#fff'; g.lineWidth = 10; g.strokeRect(x, y, w, h); g.lineWidth = 6; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * 0.45); g.lineTo(x + w, y + h * 0.45); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.strokeRect(x - 5, y - 5, w + 10, h + 10);
    g.fillStyle = lg(g, 0, y + h, 0, y + h + 14, ['#fff', '#d9cfe0']); rr(g, x - 16, y + h + 4, w + 32, 12, 3); g.fill();
    if (curtain) { [[x - 34, 1], [x + w + 34, -1]].forEach(function (c) { var cx = c[0]; g.fillStyle = lg(g, cx - 26, 0, cx + 26, 0, [sh(curtain, -0.2), curtain, sh(curtain, 0.2), curtain, sh(curtain, -0.2)]); g.beginPath(); g.moveTo(cx - 24, y - 18); g.lineTo(cx + 24, y - 18); g.quadraticCurveTo(cx + 10 * c[1], y + h * 0.6, cx + 26, y + h + 30); g.lineTo(cx - 26, y + h + 30); g.quadraticCurveTo(cx - 10 * c[1], y + h * 0.6, cx - 24, y - 18); g.fill(); g.fillStyle = sh(curtain, -0.3); g.fillRect(cx - 14, y + h * 0.55, 28, 5); }); g.fillStyle = '#b08a5a'; rr(g, x - 70, y - 26, w + 140, 8, 4); g.fill(); g.fillStyle = '#8a6a40'; g.beginPath(); g.arc(x - 70, y - 22, 7, 0, 6.283); g.arc(x + w + 70, y - 22, 7, 0, 6.283); g.fill(); }
    if (place) place.wins.push([x, y, w, h]);
  };
  K.books = function (g, x, y, w, seed, hmax) { var R = seeded(seed || 3), cols = ['#e05a7a', '#5a7ae0', '#f2b84b', '#6cc08b', '#9b6bd6', '#ef8354', '#3fa7b5', '#d94f9b']; var cx = x; while (cx < x + w - 8) { var bw = 7 + R() * 7, bh = (hmax || 34) * (0.7 + R() * 0.3), c = cols[Math.floor(R() * cols.length)]; if (R() < 0.08) { g.save(); g.translate(cx, y); g.rotate(-0.25); g.fillStyle = c; g.fillRect(0, -bh, bw, bh); g.restore(); cx += bw + 8; continue; } g.fillStyle = lg(g, cx, 0, cx + bw, 0, [sh(c, 0.15), c, sh(c, -0.25)]); g.fillRect(cx, y - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(cx + 1, y - bh + 5, bw - 2, 2); g.fillRect(cx + 1, y - 9, bw - 2, 2); cx += bw + 1; } };
  K.shelf = function (g, x, y, w, seed, extra) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + 4, y + 8, w, 6); K.box(g, x, y, w, 9, '#c8955e', 2); K.books(g, x + 6, y, w * 0.6, seed); if (extra !== false) { K.plant(g, x + w * 0.75, y, 0.55, 'succulent'); g.fillStyle = '#ffd166'; g.beginPath(); g.moveTo(x + w * 0.9, y); g.lineTo(x + w * 0.9 - 8, y - 20); g.lineTo(x + w * 0.9 + 8, y - 20); g.fill(); g.fillStyle = '#f2b84b'; g.beginPath(); g.arc(x + w * 0.9, y - 24, 8, 0, 6.283); g.fill(); } };
  K.frame = function (g, x, y, w, h, kind, seed) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 4, y + 5, w, h); K.box(g, x, y, w, h, '#c99a5b', 2); var ix = x + 6, iy = y + 6, iw = w - 12, ih = h - 12; g.save(); rr(g, ix, iy, iw, ih, 1); g.clip();
    if (kind === 'landscape') { g.fillStyle = lg(g, 0, iy, 0, iy + ih, ['#9fd8ff', '#ffe1f0']); g.fillRect(ix, iy, iw, ih); g.fillStyle = '#7cc68d'; g.beginPath(); g.moveTo(ix, iy + ih); g.quadraticCurveTo(ix + iw * 0.3, iy + ih * 0.4, ix + iw * 0.6, iy + ih * 0.75); g.quadraticCurveTo(ix + iw * 0.8, iy + ih * 0.5, ix + iw, iy + ih * 0.7); g.lineTo(ix + iw, iy + ih); g.fill(); g.fillStyle = '#ffd166'; g.beginPath(); g.arc(ix + iw * 0.75, iy + ih * 0.3, ih * 0.12, 0, 6.283); g.fill(); }
    else if (kind === 'family') { g.fillStyle = lg(g, 0, iy, 0, iy + ih, ['#ffe8d6', '#f7c6d9']); g.fillRect(ix, iy, iw, ih); var cs = ['#4a3020', '#3b2416', '#6b4a2b', '#3b2416'], sk = ['#c68a64', '#d9a07b', '#a86e4b', '#b07150']; for (var i = 0; i < 4; i++) { var px = ix + iw * (0.18 + i * 0.22), ps = ih * (i === 3 ? 0.16 : 0.2); g.fillStyle = ['#7a9cd6', '#e47aa8', '#5bb98c', '#ff8fc0'][i]; g.beginPath(); g.ellipse(px, iy + ih, ps * 1.2, ps * 1.7, 0, 3.14, 6.283); g.fill(); g.fillStyle = sk[i]; g.beginPath(); g.arc(px, iy + ih - ps * 1.9, ps, 0, 6.283); g.fill(); g.fillStyle = cs[i]; g.beginPath(); g.arc(px, iy + ih - ps * 2.2, ps, 3.14, 6.283); g.fill(); } }
    else if (kind === 'abstract') { var R = seeded(seed || 9); g.fillStyle = '#fff6ee'; g.fillRect(ix, iy, iw, ih); for (var k = 0; k < 5; k++) { g.fillStyle = ['#ff7aa8', '#7b6cf6', '#ffd166', '#4cc9f0', '#80ed99'][k]; g.globalAlpha = 0.8; g.beginPath(); g.arc(ix + R() * iw, iy + R() * ih, 6 + R() * ih * 0.3, 0, 6.283); g.fill(); } g.globalAlpha = 1; }
    else if (kind === 'heart') { g.fillStyle = '#ffe4ef'; g.fillRect(ix, iy, iw, ih); g.fillStyle = '#ff5c9a'; heart(g, ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.25); }
    else if (kind === 'cat') { g.fillStyle = '#e8f4ff'; g.fillRect(ix, iy, iw, ih); g.fillStyle = '#f08a3c'; g.beginPath(); g.arc(ix + iw / 2, iy + ih * 0.6, ih * 0.28, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(ix + iw / 2 - ih * 0.25, iy + ih * 0.45); g.lineTo(ix + iw / 2 - ih * 0.15, iy + ih * 0.2); g.lineTo(ix + iw / 2 - ih * 0.05, iy + ih * 0.4); g.moveTo(ix + iw / 2 + ih * 0.25, iy + ih * 0.45); g.lineTo(ix + iw / 2 + ih * 0.15, iy + ih * 0.2); g.lineTo(ix + iw / 2 + ih * 0.05, iy + ih * 0.4); g.fill(); g.fillStyle = '#222'; g.fillRect(ix + iw / 2 - 8, iy + ih * 0.55, 3, 4); g.fillRect(ix + iw / 2 + 5, iy + ih * 0.55, 3, 4); }
    else if (kind === 'map') { g.fillStyle = '#bfe3f7'; g.fillRect(ix, iy, iw, ih); g.fillStyle = '#8fcf7e'; var R2 = seeded(seed || 4); for (var c = 0; c < 6; c++) { g.beginPath(); g.ellipse(ix + R2() * iw, iy + R2() * ih, 10 + R2() * iw * 0.15, 8 + R2() * ih * 0.15, R2() * 3, 0, 6.283); g.fill(); } g.strokeStyle = 'rgba(0,0,0,.15)'; for (var gl = 0; gl < iw; gl += 20) { g.beginPath(); g.moveTo(ix + gl, iy); g.lineTo(ix + gl, iy + ih); g.stroke(); } }
    else if (kind === 'poster') { g.fillStyle = lg(g, ix, iy, ix + iw, iy + ih, ['#7b2ff7', '#f107a3']); g.fillRect(ix, iy, iw, ih); g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(iw / 6) + 'px system-ui'; g.textAlign = 'center'; g.fillText('★', ix + iw / 2, iy + ih * 0.45); g.fillRect(ix + iw * 0.2, iy + ih * 0.7, iw * 0.6, 3); g.fillRect(ix + iw * 0.3, iy + ih * 0.8, iw * 0.4, 3); }
    g.restore(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(ix, iy); g.lineTo(ix + iw * 0.4, iy); g.lineTo(ix, iy + ih * 0.5); g.fill();
  };
  K.plant = function (g, x, y, s, kind) {
    s = s || 1; g.save(); g.translate(x, y); g.scale(s, s);
    K.shadow(g, 0, 2, 26, 6, 0.2); g.fillStyle = lg(g, -18, 0, 18, 0, ['#c0623f', '#e07a52', '#b0522f']); g.beginPath(); g.moveTo(-18, -34); g.lineTo(18, -34); g.lineTo(13, 0); g.lineTo(-13, 0); g.fill(); g.fillStyle = '#a64d2c'; g.fillRect(-20, -38, 40, 7);
    if (kind === 'cactus' || kind === 'succulent') { g.fillStyle = '#5cae6b'; if (kind === 'cactus') { rr(g, -8, -95, 16, 62, 8); g.fill(); rr(g, 6, -75, 18, 10, 5); g.fill(); rr(g, 16, -90, 9, 24, 5); g.fill(); g.fillStyle = '#ff7aa8'; g.beginPath(); g.arc(0, -96, 5, 0, 6.283); g.fill(); } else { for (var i = 0; i < 7; i++) { g.save(); g.translate(0, -38); g.rotate(-1.4 + i * 0.47); g.fillStyle = i % 2 ? '#6cc08b' : '#4e9e6a'; g.beginPath(); g.ellipse(0, -14, 6, 15, 0, 0, 6.283); g.fill(); g.restore(); } } }
    else { var cols = kind === 'flower' ? ['#4e9e6a', '#6cc08b'] : ['#3f8f5a', '#5cae6b', '#2f7a4a']; for (var j = 0; j < 9; j++) { g.save(); g.translate(0, -36); g.rotate(-1.3 + j * 0.33); g.fillStyle = lg(g, 0, 0, 0, -60, [cols[j % cols.length], sh(cols[j % cols.length], 0.25)]); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(22, -30, 0, -62 - (j % 3) * 8); g.quadraticCurveTo(-22, -30, 0, 0); g.fill(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -55); g.stroke(); g.restore(); } if (kind === 'flower') for (var f = 0; f < 4; f++) flower(g, -18 + f * 12, -80 + (f % 2) * 14, 6, ['#ff7aa8', '#ffd166', '#c77dff', '#ff9b71'][f]); }
    g.restore();
  };
  K.lampFloor = function (g, x, y, c) { K.shadow(g, x, y + 2, 22, 5); g.fillStyle = '#6b5a4a'; g.fillRect(x - 2, y - 150, 4, 150); g.fillStyle = '#5a4a3a'; g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, 6.283); g.fill(); g.fillStyle = lg(g, x - 30, 0, x + 30, 0, [sh(c, -0.15), c, sh(c, 0.2), c]); g.beginPath(); g.moveTo(x - 18, y - 190); g.lineTo(x + 18, y - 190); g.lineTo(x + 30, y - 148); g.lineTo(x - 30, y - 148); g.fill(); };
  K.lampDesk = function (g, x, y, c) { g.fillStyle = '#555'; g.beginPath(); g.ellipse(x, y, 14, 4, 0, 0, 6.283); g.fill(); g.strokeStyle = '#666'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y - 30); g.lineTo(x + 8, y - 50); g.stroke(); g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 58); g.lineTo(x + 24, y - 46); g.lineTo(x + 14, y - 34); g.closePath(); g.fill(); };
  K.sofa = function (g, x, y, w, c) { K.shadow(g, x + w / 2, y + 4, w * 0.55, 12); K.box(g, x, y - 110, w, 70, sh(c, -0.05), 14); K.box(g, x - 12, y - 70, w + 24, 50, c, 12); K.box(g, x - 18, y - 92, 30, 74, sh(c, -0.1), 12); K.box(g, x + w - 12, y - 92, 30, 74, sh(c, -0.1), 12); for (var i = 0; i < 3; i++) { K.box(g, x + 14 + i * (w - 28) / 3, y - 78, (w - 28) / 3 - 6, 22, sh(c, 0.12), 8); } g.fillStyle = '#5a3d2b'; g.fillRect(x - 6, y - 20, 8, 20); g.fillRect(x + w - 2, y - 20, 8, 20); K.box(g, x + 22, y - 112, 44, 38, '#ffd1e3', 12); K.box(g, x + w - 70, y - 110, 44, 36, '#c5b3ff', 12); };
  K.table = function (g, x, y, w, h, c, legs) { K.shadow(g, x + w / 2, y + h + 2, w * 0.55, 10); g.fillStyle = sh(c, -0.25); var lh = h; g.fillRect(x + 8, y, 8, lh); g.fillRect(x + w - 16, y, 8, lh); K.box(g, x, y - 12, w, 14, c, 3); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 4, y - 10, w - 8, 3); };
  K.chair = function (g, x, y, c) { K.shadow(g, x, y + 2, 22, 5); g.fillStyle = sh(c, -0.3); g.fillRect(x - 16, y - 40, 5, 40); g.fillRect(x + 11, y - 40, 5, 40); K.box(g, x - 20, y - 46, 40, 9, c, 3); K.box(g, x - 18, y - 95, 36, 48, c, 6); g.fillStyle = sh(c, 0.2); rr(g, x - 12, y - 88, 24, 30, 4); g.fill(); };
  K.clock = function (g, x, y, r) { K.shadow(g, x + 3, y + 3, r, r, 0.15); g.fillStyle = '#fff'; g.strokeStyle = '#6b4a8a'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#6b4a8a'; for (var i = 0; i < 12; i++) { var a = i * 0.5236; g.fillRect(x + Math.cos(a) * (r - 6) - 1, y + Math.sin(a) * (r - 6) - 1, 2.5, 2.5); } };
  K.board = function (g, x, y, w, h, kind, content) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 5, y + 6, w, h); g.fillStyle = '#b48a5a'; g.fillRect(x - 6, y - 6, w + 12, h + 12); g.fillStyle = kind === 'white' ? lg(g, x, y, x + w, y + h, ['#ffffff', '#eef2f7']) : lg(g, x, y, x + w, y + h, ['#2f5d4a', '#244a3b']); g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.3, y); g.lineTo(x, y + h * 0.6); g.fill(); g.fillStyle = '#9a7650'; g.fillRect(x - 2, y + h + 4, w + 4, 6); var col = kind === 'white' ? '#3355aa' : '#f5f5ee'; (content || []).forEach(function (l, i) { K.text(g, l, x + 20, y + 28 + i * 30, 20, i === 0 ? (kind === 'white' ? '#c2185b' : '#ffe08a') : col, 'left', i === 0 ? 'bold' : '600'); }); };
  K.schoolDesk = function (g, x, y, c) { K.shadow(g, x, y + 2, 46, 8); g.fillStyle = '#7a8aa0'; g.fillRect(x - 36, y - 46, 4, 46); g.fillRect(x + 32, y - 46, 4, 46); K.box(g, x - 44, y - 54, 88, 10, c || '#e9c58f', 2); g.fillStyle = '#fff'; g.save(); g.translate(x - 10, y - 57); g.rotate(-0.08); g.fillRect(-14, -3, 28, 4); g.restore(); };
  K.locker = function (g, x, y, w, h, c) { for (var i = 0; i < w / 40; i++) { K.box(g, x + i * 40, y, 38, h, sh(c, (i % 3) * 0.05), 2); g.fillStyle = 'rgba(0,0,0,.25)'; for (var v = 0; v < 4; v++) g.fillRect(x + i * 40 + 10, y + 14 + v * 5, 18, 2); g.fillStyle = '#ddd'; g.fillRect(x + i * 40 + 30, y + h / 2, 3, 10); } };
  K.tree = function (g, x, y, s, season, kind) {
    s = s || 1; g.save(); g.translate(x, y); g.scale(s, s); K.shadow(g, 0, 2, 60, 12, 0.25);
    g.fillStyle = lg(g, -14, 0, 14, 0, ['#6b4a2b', '#8a6038', '#5a3d22']); g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-8, -60, -6, -120); g.lineTo(6, -120); g.quadraticCurveTo(8, -60, 14, 0); g.fill();
    g.strokeStyle = '#6b4a2b'; g.lineWidth = 6; g.beginPath(); g.moveTo(-3, -90); g.quadraticCurveTo(-30, -110, -45, -130); g.moveTo(3, -100); g.quadraticCurveTo(30, -120, 40, -150); g.stroke();
    if (kind === 'sapin') { for (var k = 0; k < 4; k++) { g.fillStyle = sh('#2f7a4a', k * 0.06); g.beginPath(); g.moveTo(0, -230 + k * 30); g.lineTo(-60 + k * 6 - 20, -100 + k * 10 - 0); g.lineTo(80 - k * 6, -100 + k * 10); g.fill(); } if (season === 'hiver') { g.fillStyle = '#fff'; g.globalAlpha = .8; g.beginPath(); g.moveTo(0, -230); g.lineTo(-20, -190); g.lineTo(20, -190); g.fill(); g.globalAlpha = 1; } g.restore(); return; }
    var cols = season === 'automne' ? ['#e07a2f', '#d94f2b', '#f2b84b', '#c2571a'] : season === 'hiver' ? null : season === 'printemps' ? ['#6cc08b', '#8fd694', '#5cae6b'] : ['#3f8f5a', '#4e9e6a', '#2f7a4a'];
    if (cols) { var R = seeded(Math.round(x)); var blobs = [[0, -170, 62], [-48, -140, 46], [48, -140, 48], [-25, -205, 42], [30, -200, 44], [0, -130, 50]]; blobs.forEach(function (b, i) { g.fillStyle = rg(g, b[0] - 12, b[1] - 14, 4, b[2], [sh(cols[i % cols.length], 0.25), cols[i % cols.length], sh(cols[i % cols.length], -0.2)]); g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.283); g.fill(); }); if (season === 'printemps') for (var p = 0; p < 26; p++) flower(g, -70 + R() * 140, -240 + R() * 130, 4, R() < 0.5 ? '#ffc8dd' : '#fff'); if (season === 'été') for (var a = 0; a < 6; a++) { g.fillStyle = '#e63946'; g.beginPath(); g.arc(-50 + R() * 100, -200 + R() * 90, 5, 0, 6.283); g.fill(); } }
    else { g.strokeStyle = '#6b4a2b'; g.lineWidth = 3; for (var bb = 0; bb < 7; bb++) { g.beginPath(); g.moveTo(0, -110 - bb * 8); g.lineTo(-60 + bb * 20, -180 - (bb % 3) * 20); g.stroke(); } g.fillStyle = '#fff'; g.globalAlpha = 0.85; for (var sn = 0; sn < 7; sn++) { g.beginPath(); g.ellipse(-60 + sn * 20, -182 - (sn % 3) * 20, 10, 4, 0, 0, 6.283); g.fill(); } g.globalAlpha = 1; }
    g.restore();
  };
  K.bush = function (g, x, y, s, season) { var c = season === 'automne' ? '#b5793a' : season === 'hiver' ? '#7a8a7a' : '#4e9e6a'; [[-20, -14, 22], [12, -16, 24], [-2, -28, 22]].forEach(function (b) { g.fillStyle = rg(g, x + b[0] * s - 6, y + b[1] * s - 6, 2, b[2] * s, [sh(c, 0.25), c, sh(c, -0.2)]); g.beginPath(); g.arc(x + b[0] * s, y + b[1] * s, b[2] * s, 0, 6.283); g.fill(); }); if (season === 'printemps' || season === 'été') for (var i = 0; i < 5; i++) flower(g, x - 25 * s + i * 12 * s, y - 20 * s - (i % 2) * 14 * s, 3.5 * s, ['#ff7aa8', '#fff', '#ffd166'][i % 3]); if (season === 'hiver') { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(x, y - 44 * s, 28 * s, 8 * s, 0, 0, 6.283); g.fill(); } };
  K.fence = function (g, y, c) { g.fillStyle = c || '#fff8f0'; for (var x = 0; x < W; x += 28) { g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 4, y - 60); g.lineTo(x + 12, y - 70); g.lineTo(x + 20, y - 60); g.lineTo(x + 20, y); g.fill(); } g.fillRect(0, y - 50, W, 7); g.fillRect(0, y - 22, W, 7); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y - 43, W, 3); };
  K.facade = function (g, x, y, w, h, c, roof, seed) { var R = seeded(seed || 5); g.fillStyle = lg(g, x, y, x + w, y, [sh(c, -0.08), c, sh(c, 0.05)]); g.fillRect(x, y, w, h); if (roof) { g.fillStyle = roof; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + w / 2, y - h * 0.25); g.lineTo(x + w + 10, y); g.fill(); } for (var wy = y + 18; wy < y + h - 40; wy += 52) for (var wx = x + 14; wx < x + w - 30; wx += 46) { g.fillStyle = R() < 0.35 ? '#ffe9a8' : '#a8c8e8'; g.fillRect(wx, wy, 26, 32); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(wx, wy, 26, 32); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(wx - 3, wy + 32, 32, 4); } };
  K.awning = function (g, x, y, w, c1, c2) { for (var i = 0; i < w / 24; i++) { g.fillStyle = i % 2 ? c1 : c2; g.beginPath(); g.moveTo(x + i * 24, y); g.lineTo(x + i * 24 + 24, y); g.lineTo(x + i * 24 + 24, y + 30); g.quadraticCurveTo(x + i * 24 + 12, y + 40, x + i * 24, y + 30); g.fill(); } g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, y + 34, w, 6); };
  K.sign = function (g, x, y, w, h, txt, bg, fg) { g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, x + 3, y + 4, w, h, 8); g.fill(); g.fillStyle = bg; rr(g, x, y, w, h, 8); g.fill(); g.strokeStyle = sh(bg, -0.3); g.lineWidth = 2; g.stroke(); K.text(g, txt, x + w / 2, y + h / 2 + 1, Math.min(h * 0.55, 26), fg); };
  K.bench = function (g, x, y, c) { K.shadow(g, x, y + 2, 60, 8); g.fillStyle = '#555'; g.fillRect(x - 50, y - 30, 5, 30); g.fillRect(x + 45, y - 30, 5, 30); for (var i = 0; i < 3; i++) K.box(g, x - 58, y - 36 - i * 16 - (i ? 10 : 0), 116, 8, c || '#c8955e', 2); };
  K.lamppost = function (g, x, y) { g.fillStyle = '#3d3d55'; g.fillRect(x - 3, y - 190, 6, 190); g.beginPath(); g.ellipse(x, y, 12, 4, 0, 0, 6.283); g.fill(); g.fillStyle = '#3d3d55'; rr(g, x - 12, y - 215, 24, 28, 4); g.fill(); g.fillStyle = '#fff3c4'; g.fillRect(x - 8, y - 210, 16, 18); };
  K.cloudShape = function (g, x, y, s, a) { g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.beginPath(); g.arc(x, y, 18 * s, 0, 6.283); g.arc(x + 20 * s, y - 8 * s, 22 * s, 0, 6.283); g.arc(x + 44 * s, y, 18 * s, 0, 6.283); g.arc(x + 22 * s, y + 6 * s, 18 * s, 0, 6.283); g.fill(); };
  K.mirror = function (g, x, y, w, h) { K.box(g, x - 6, y - 6, w + 12, h + 12, '#e8c46a', 10); g.fillStyle = lg(g, x, y, x + w, y + h, ['#dff3ff', '#a9c9e6', '#e8f6ff']); rr(g, x, y, w, h, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(x + 8, y + h * 0.7); g.lineTo(x + w * 0.5, y + 8); g.lineTo(x + w * 0.7, y + 8); g.lineTo(x + 8, y + h * 0.9); g.fill(); };
  K.fairyLights = function (g, x0, x1, y, sag) { g.strokeStyle = '#555'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); g.stroke(); };
  K.pan = function (g, x, y, s, c) { s = s || 1; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#2b2b33'; g.fillRect(14, -3, 26, 6); g.fillStyle = lg(g, -16, 0, 16, 0, ['#555b6e', '#9aa3b5', '#4a5060']); g.beginPath(); g.ellipse(0, 0, 18, 7, 0, 0, 6.283); g.fill(); g.fillStyle = '#3a3f4d'; g.beginPath(); g.ellipse(0, -1, 14, 4.5, 0, 0, 6.283); g.fill(); g.restore(); };

  /* ================= Ciel, extérieur vu par les fenêtres (dynamique) ================= */
  LL.skyColors = function (h) { if (h < 5) return ['#0b1033', '#1f2a5c']; if (h < 7) return ['#3b3f86', '#ff9e7a']; if (h < 9) return ['#7fc4ff', '#ffd6a8']; if (h < 17.5) return ['#5eb5ff', '#bfe6ff']; if (h < 19.5) return ['#6f7fd6', '#ffb07a']; if (h < 21) return ['#2c2f6e', '#c06c8a']; return ['#0b1033', '#1f2a5c']; };
  LL.nightness = function (h) { if (h < 5.5 || h >= 21.5) return 1; if (h < 7.5) return 1 - (h - 5.5) / 2; if (h > 19) return (h - 19) / 2.5; return 0; };
  LL.drawSky = function (g, x, y, w, h, env, out, par) {
    var c = LL.skyColors(env.h), n = LL.nightness(env.h), R = seeded(env.day + 3), t = env.t;
    if (env.weather === 'pluie' || env.weather === 'neige') c = [sh(c[0], -0.25 + n * 0.1), sh(c[1], -0.2)];
    g.fillStyle = lg(g, 0, y, 0, y + h, c); g.fillRect(x, y, w, h);
    par = par || 0;
    if (n > 0.3) { g.fillStyle = '#fff'; for (var i = 0; i < 60; i++) { var sx = R() * W, sy = R() * 300, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); g.globalAlpha = n * (0.4 + tw * 0.6); g.fillRect(sx + par * 0.2, sy, 2, 2); } g.globalAlpha = n; g.fillStyle = '#fff8d6'; g.beginPath(); g.arc(780 + par * 0.3, 70, 22, 0, 6.283); g.fill(); g.fillStyle = c[0]; g.beginPath(); g.arc(790 + par * 0.3, 64, 20, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    if (n < 0.8 && env.weather !== 'pluie' && env.weather !== 'neige') { var p = LL.clamp((env.h - 6) / 14, 0, 1), sx2 = 80 + p * 800, sy2 = 220 - Math.sin(p * Math.PI) * 180; g.fillStyle = rg(g, sx2, sy2, 10, 70, [[0, 'rgba(255,250,210,.9)'], [0.3, 'rgba(255,220,130,.35)'], [1, 'rgba(255,220,130,0)']]); g.beginPath(); g.arc(sx2, sy2, 70, 0, 6.283); g.fill(); g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(sx2, sy2, 22, 0, 6.283); g.fill(); }
    var nc = env.weather === 'soleil' ? 4 : env.weather === 'nuageux' ? 9 : 12, ca = env.weather === 'pluie' || env.weather === 'neige' ? 0.75 : 0.9;
    for (var k = 0; k < nc; k++) { var cx = ((R() * 1300 + t * (6 + k % 3 * 4)) % 1300) - 200 + par * 0.4, cy = 30 + R() * 150; K.cloudShape(g, cx, cy, 0.8 + R() * 1.2, ca * (1 - n * 0.6)); }
    if (out === 'ville') { for (var b = 0; b < 12; b++) { var bh = 60 + R() * 120; g.fillStyle = sh('#8a8fbf', -n * 0.5 - R() * 0.1); g.fillRect(b * 85 + par * 0.6 - 20, y + h - bh, 70, bh); g.fillStyle = n > 0.4 ? 'rgba(255,230,140,.9)' : 'rgba(255,255,255,.35)'; for (var wy = y + h - bh + 10; wy < y + h - 10; wy += 18) for (var wx = 0; wx < 3; wx++) if (R() < 0.6) g.fillRect(b * 85 + par * 0.6 - 12 + wx * 20, wy, 8, 10); } }
    else if (out === 'jardin') { g.fillStyle = sh('#6cbf7a', -n * 0.6); g.beginPath(); g.moveTo(x, y + h); for (var hx = 0; hx <= W; hx += 60) g.lineTo(hx + par * 0.5, y + h - 40 - Math.sin(hx * 0.01) * 20); g.lineTo(W, y + h); g.fill(); for (var tr = 0; tr < 8; tr++) { g.fillStyle = sh(env.season === 'automne' ? '#d9822b' : env.season === 'hiver' ? '#c8d2dc' : '#3f8f5a', -n * 0.6); g.beginPath(); g.arc(tr * 130 + 30 + par * 0.5, y + h - 50, 30, 0, 6.283); g.fill(); } }
  };
  LL.drawWeather = function (g, env, rects, full) {
    var t = env.t, R = seeded(9);
    if (env.reduce) return;
    rects.forEach(function (r) {
      g.save(); g.beginPath(); g.rect(r[0], r[1], r[2], r[3]); g.clip();
      if (env.weather === 'pluie') { g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = 1.2; g.beginPath(); var nn = full ? 160 : 40; for (var i = 0; i < nn; i++) { var x = (R() * W + t * 40) % W, y = (R() * H + t * (500 + R() * 200)) % H; g.moveTo(x, y); g.lineTo(x - 4, y + 14); } g.stroke(); }
      if (env.weather === 'neige') { g.fillStyle = 'rgba(255,255,255,.9)'; for (var j = 0; j < (full ? 120 : 30); j++) { var sx = (R() * W + Math.sin(t + j) * 20) % W, sy = (R() * H + t * (30 + R() * 30)) % H; g.beginPath(); g.arc(sx, sy, 1.5 + R() * 2, 0, 6.283); g.fill(); } }
      g.restore();
    });
  };

  /* ================= Définition des lieux ================= */
  var P = LL.PLACES = {};
  function place(id, o) { o.id = id; o.wins = []; P[id] = o; return o; }
  // Mobilier et décors : chaque draw(g, env, pl) est rendu dans un canvas hors écran (cache) ; anim(g, env) est dessiné à chaque image.
  place('chambre', { nom: 'Ma chambre', zone: 'maison', sol: 'parquet', icon: '🛏️', lamps: [[355, 268, 140, 'chambre_lampe'], [480, 40, 90]],
    draw: function (g, e, pl) {
      K.wall(g, '#f9d7ea', 'hearts', '#e86aa6'); K.floor(g, 'parquet', '#d7a676');
      K.windowFrame(g, 400, 70, 160, 180, '#c77dff', pl);
      // guirlande + cadres au-dessus du lit
      K.frame(g, 70, 110, 90, 70, 'heart'); K.frame(g, 180, 95, 70, 90, 'poster'); K.frame(g, 270, 120, 60, 60, 'cat');
      // guitare murale
      g.save(); g.translate(590, 210); g.rotate(-0.15); g.fillStyle = '#5a3d22'; g.fillRect(-4, -110, 8, 90); g.fillStyle = lg(g, -30, 0, 30, 0, ['#c0623f', '#ef9a5a', '#c0623f']); g.beginPath(); g.ellipse(0, 0, 26, 32, 0, 0, 6.283); g.ellipse(0, -30, 20, 22, 0, 0, 6.283); g.fill(); g.fillStyle = '#3b2416'; g.beginPath(); g.arc(0, -8, 8, 0, 6.283); g.fill(); g.strokeStyle = '#eee'; g.lineWidth = 0.6; for (var s = -3; s <= 3; s += 2) { g.beginPath(); g.moveTo(s, -110); g.lineTo(s, 20); g.stroke(); } g.restore();
      // étagère
      K.shelf(g, 640, 130, 210, 11); K.shelf(g, 660, 200, 170, 23, false); g.fillStyle = '#ffb3d9'; g.beginPath(); g.arc(800, 186, 12, 0, 6.283); g.fill();
      // lit
      K.shadow(g, 175, 470, 170, 16); K.box(g, 30, 250, 22, 220, '#b07fd0', 8); K.box(g, 40, 380, 290, 70, '#c8955e', 6); g.fillStyle = '#fff'; rr(g, 46, 352, 280, 34, 10); g.fill();
      g.fillStyle = lg(g, 0, 345, 0, 420, ['#ff9ccc', '#f06aa8']); rr(g, 110, 348, 222, 66, 16); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; for (var hx = 130; hx < 320; hx += 34) for (var hy = 365; hy < 410; hy += 22) heart(g, hx, hy, 5);
      K.box(g, 52, 330, 70, 40, '#fff', 14); K.box(g, 60, 318, 56, 30, '#e0d0ff', 12);
      // table de chevet + lampe
      K.table(g, 336, 360, 60, 110, '#d8b07c'); K.lampDesk(g, 362, 348, '#ff9ccc');
      // bureau
      K.table(g, 640, 360, 220, 110, '#e0b98a'); g.fillStyle = '#333a4a'; rr(g, 690, 300, 80, 54, 4); g.fill(); g.fillStyle = '#9ad1ff'; g.fillRect(695, 305, 70, 44); g.fillStyle = '#c9ced8'; g.beginPath(); g.moveTo(680, 352); g.lineTo(780, 352); g.lineTo(790, 358); g.lineTo(670, 358); g.fill();
      g.fillStyle = '#fff'; g.save(); g.translate(812, 346); g.rotate(0.1); g.fillRect(-20, -4, 40, 8); g.fillStyle = '#9b6bd6'; g.fillRect(-20, -12, 40, 8); g.restore(); g.fillStyle = '#ff7aa8'; g.fillRect(840, 322, 10, 26); g.fillStyle = '#ffd166'; g.fillRect(852, 330, 5, 18);
      K.chair(g, 745, 470, '#c77dff');
      // dressing + miroir
      K.box(g, 882, 160, 74, 310, '#efe3f7', 6); g.fillStyle = '#d7c3e8'; g.fillRect(918, 170, 2, 290); K.mirror(g, 890, 180, 22, 200); g.fillStyle = '#c8955e'; g.beginPath(); g.arc(928, 320, 4, 0, 6.283); g.fill();
      // enceinte hi-fi
      K.box(g, 520, 360, 44, 110, '#3a3350', 6); g.fillStyle = '#222'; g.beginPath(); g.arc(542, 390, 13, 0, 6.283); g.arc(542, 435, 16, 0, 6.283); g.fill();
      K.rug(g, 470, 530, 170, 38, '#d9c2ff', '#fff'); K.plant(g, 440, 470, 0.7, 'flower');
    },
    anim: function (g, e) { // guirlande lumineuse qui scintille + écran du portable
      for (var i = 0; i < 14; i++) { var x = 60 + i * 20, y = 92 + Math.sin(i / 13 * Math.PI) * 14; var on = e.reduce ? 1 : 0.5 + 0.5 * Math.sin(e.t * 3 + i * 1.7); g.fillStyle = ['#ff7aa8', '#ffd166', '#7af0ff', '#c77dff'][i % 4]; g.globalAlpha = 0.4 + on * 0.6; g.beginPath(); g.arc(x, y, 4, 0, 6.283); g.fill(); g.globalAlpha = on * 0.25; g.beginPath(); g.arc(x, y, 10, 0, 6.283); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(700, 312 + (e.t * 8 % 30), 40, 3);
      if (LL.S.flags.fenetreOuverte) { // rideaux au vent et battants ouverts
        g.save(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.fillStyle = 'rgba(230,240,255,.45)'; g.fillRect(388, 70, 14, 180); g.strokeRect(388, 70, 14, 180); g.fillRect(558, 70, 14, 180); g.strokeRect(558, 70, 14, 180);
        [[366, 1], [594, -1]].forEach(function (c, i) { var sw = e.reduce ? 6 : Math.sin(e.t * 2.2 + i) * 14 + 10; g.fillStyle = 'rgba(199,125,255,.9)'; g.beginPath(); g.moveTo(c[0] - 22, 52); g.lineTo(c[0] + 22, 52); g.quadraticCurveTo(c[0] + 22 + sw * c[1], 180, c[0] + 26 + sw * 1.6 * c[1], 280); g.lineTo(c[0] - 26 + sw * 1.2 * c[1], 280); g.quadraticCurveTo(c[0] - 22 + sw * 0.6 * c[1], 180, c[0] - 22, 52); g.fill(); });
        g.restore(); }
    } });
  place('salon', { nom: 'Le salon', zone: 'maison', sol: 'parquet', icon: '🛋️', lamps: [[90, 260, 160]],
    draw: function (g, e, pl) {
      K.wall(g, '#fbe7d6', 'stripes', '#e8b28a'); K.floor(g, 'parquet', '#c8925f');
      K.windowFrame(g, 360, 60, 200, 190, '#9b6bd6', pl);
      K.frame(g, 150, 110, 120, 90, 'landscape'); K.frame(g, 640, 120, 80, 60, 'family'); K.frame(g, 740, 100, 60, 80, 'abstract', 3); K.clock(g, 300, 90, 24);
      // meuble télé + télé
      K.box(g, 600, 380, 300, 70, '#a87850', 6); g.fillStyle = '#7a5530'; g.fillRect(620, 400, 120, 36); g.fillRect(760, 400, 120, 36); K.books(g, 630, 432, 100, 5, 26);
      g.fillStyle = '#1b1b25'; rr(g, 640, 232, 220, 140, 8); g.fill(); g.fillStyle = '#2a2a36'; g.fillRect(740, 370, 20, 12); pl.tv = [652, 244, 196, 116];
      // canapé
      K.sofa(g, 140, 480, 300, '#9b6bd6');
      // piano
      K.box(g, 880, 260, 70, 200, '#3b2a3a', 4); g.fillStyle = '#fff'; g.fillRect(884, 330, 62, 12); g.fillStyle = '#111'; for (var k = 0; k < 7; k++) g.fillRect(887 + k * 9, 330, 4, 7);
      K.lampFloor(g, 90, 430, '#ffd9a8'); K.plant(g, 580, 470, 1, 'monstera');
      // album de famille sur table basse
      g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(612, 382, 22, 5, 0, 0, 6.283); g.fill(); pl.bowl = [612, 352];
      K.rug(g, 300, 540, 220, 40, '#f4c7d9', '#c77dff'); K.table(g, 230, 515, 150, 40, '#d8b07c'); g.fillStyle = '#c2185b'; g.fillRect(260, 494, 46, 8); g.fillStyle = '#7b2ff7'; g.fillRect(320, 497, 30, 5);
      // panier de Moka
      g.fillStyle = '#b5793a'; g.beginPath(); g.ellipse(520, 560, 46, 18, 0, 0, 6.283); g.fill(); g.fillStyle = '#ffd1e3'; g.beginPath(); g.ellipse(520, 555, 36, 11, 0, 0, 6.283); g.fill();
    } });
  LL.PLACES.salon.anim = function (g, e, pl) { // aquarium (bocal) avec poissons et bulles
    var x = 612, y = 352, t = e.t; g.save(); g.fillStyle = 'rgba(160,220,255,.45)'; g.beginPath(); g.arc(x, y, 24, 0, 6.283); g.fill(); g.clip(); g.fillStyle = 'rgba(70,160,220,.55)'; g.fillRect(x - 26, y - 12 + Math.sin(t * 2) * 1.5, 52, 40);
    for (var i = 0; i < 2; i++) { var fx = x + Math.sin(t * (0.9 + i * 0.4) + i * 2) * 13, fy = y + 4 + i * 7, d = Math.cos(t * (0.9 + i * 0.4) + i * 2) > 0 ? 1 : -1; g.fillStyle = i ? '#ffb703' : '#ff7aa8'; g.beginPath(); g.ellipse(fx, fy, 5, 3.2, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(fx - 4 * d, fy); g.lineTo(fx - 8 * d, fy - 3); g.lineTo(fx - 8 * d, fy + 3); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.8)'; for (var b = 0; b < 3; b++) { g.beginPath(); g.arc(x - 6 + b * 6, y + 18 - ((t * 14 + b * 9) % 30), 1.6, 0, 6.283); g.fill(); }
    g.fillStyle = '#4e9e6a'; g.fillRect(x - 10, y + 12, 3, 10); g.fillRect(x + 8, y + 10, 3, 12); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, 6.283); g.stroke(); g.beginPath(); g.arc(x - 8, y - 8, 10, 3.5, 4.6); g.stroke(); };
  place('cuisine', { nom: 'La cuisine', zone: 'maison', sol: 'damier', icon: '🍳', lamps: [[480, 30, 200]],
    draw: function (g, e, pl) {
      K.wall(g, '#fff2df', 'tiles', '#fff'); K.floor(g, 'damier', '#f4efe8', '#d7cde0');
      K.windowFrame(g, 420, 60, 150, 140, '#ffb3c7', pl);
      // crédence carrelée
      g.fillStyle = '#d6f0ef'; g.fillRect(150, 240, 660, 110); g.strokeStyle = 'rgba(255,255,255,.8)'; for (var x = 150; x < 810; x += 22) { g.beginPath(); g.moveTo(x, 240); g.lineTo(x, 350); g.stroke(); } for (var y = 240; y < 350; y += 22) { g.beginPath(); g.moveTo(150, y); g.lineTo(810, y); g.stroke(); }
      // placards hauts
      [60, 230, 640, 760].forEach(function (x) { K.box(g, x, 60, 110, 120, '#f6c9dc', 6); g.fillStyle = '#c99a5b'; g.fillRect(x + 50, 150, 10, 4); });
      // casseroles accrochées (barre)
      g.fillStyle = '#9aa3b5'; g.fillRect(170, 200, 200, 5); for (var i = 0; i < 4; i++) { g.strokeStyle = '#666'; g.beginPath(); g.moveTo(200 + i * 45, 205); g.lineTo(200 + i * 45, 214); g.stroke(); if (i !== 1) K.pan(g, 200 + i * 45, 226, 0.8); }
      // plan de travail + évier
      K.box(g, 140, 350, 680, 22, '#e9e2d6', 3); K.box(g, 150, 372, 660, 98, '#9b6bd6', 4); for (var c = 0; c < 6; c++) { g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(160 + c * 108, 380, 100, 84); g.fillStyle = '#e6d3ff'; g.fillRect(200 + c * 108, 392, 20, 4); }
      g.fillStyle = '#b8c4d4'; rr(g, 560, 346, 120, 14, 4); g.fill(); g.strokeStyle = '#8894a8'; g.lineWidth = 5; g.beginPath(); g.moveTo(620, 350); g.lineTo(620, 310); g.quadraticCurveTo(620, 298, 640, 300); g.stroke(); pl.sink = [620, 350];
      // cuisinière
      K.box(g, 300, 336, 150, 20, '#3a3f4d', 3); g.fillStyle = '#222'; [[335, 346], [415, 346]].forEach(function (p) { g.beginPath(); g.ellipse(p[0], p[1], 26, 6, 0, 0, 6.283); g.fill(); }); pl.stove = [[335, 346], [415, 346]];
      // frigo
      K.box(g, 840, 150, 110, 320, '#eef3f8', 10); g.fillStyle = '#c8d2dc'; g.fillRect(840, 270, 110, 4); g.fillRect(852, 180, 6, 60); g.fillRect(852, 290, 6, 80); g.fillStyle = '#ff7aa8'; g.beginPath(); g.arc(900, 200, 8, 0, 6.283); g.fill(); g.fillStyle = '#ffd166'; g.fillRect(890, 220, 22, 16);
      // table à manger
      K.table(g, 40, 500, 200, 70, '#c8955e'); K.chair(g, 70, 570, '#ff9ccc'); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(140, 487, 22, 7, 0, 0, 6.283); g.fill(); K.plant(g, 200, 488, 0.4, 'flower');
      // fruits
      g.fillStyle = '#c2a079'; g.beginPath(); g.ellipse(720, 345, 34, 9, 0, 0, 3.14); g.fill(); ['#e63946', '#ffb703', '#8ac926', '#e63946'].forEach(function (cc, j) { g.fillStyle = cc; g.beginPath(); g.arc(700 + j * 13, 338 - (j % 2) * 6, 8, 0, 6.283); g.fill(); });
    } });
  place('sdb', { nom: 'La salle de bain', zone: 'maison', sol: 'carrelage', icon: '🛁', lamps: [[480, 40, 160]],
    draw: function (g, e, pl) {
      K.wall(g, '#d8f1f5', 'tiles', '#fff'); K.floor(g, 'carrelage', '#e8eef6');
      K.windowFrame(g, 440, 60, 90, 110, '#9fd8ff', pl);
      // baignoire avec rideau
      K.shadow(g, 190, 470, 160, 12); g.fillStyle = lg(g, 0, 360, 0, 470, ['#ffffff', '#dfe7f0']); rr(g, 40, 360, 300, 110, 30); g.fill(); g.strokeStyle = '#c4d0dc'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#9fd8ff'; rr(g, 52, 368, 276, 18, 8); g.fill();
      g.fillStyle = '#9aa3b5'; g.fillRect(40, 120, 300, 5); g.fillStyle = 'rgba(255,170,210,.75)'; g.beginPath(); g.moveTo(40, 125); for (var i = 0; i <= 6; i++) g.quadraticCurveTo(40 + i * 15 + 7, 250, 40 + i * 15, 362); g.lineTo(40, 362); g.fill();
      g.strokeStyle = '#9aa3b5'; g.lineWidth = 4; g.beginPath(); g.moveTo(300, 360); g.lineTo(300, 170); g.lineTo(270, 170); g.stroke(); g.fillStyle = '#9aa3b5'; g.beginPath(); g.ellipse(266, 176, 14, 6, 0, 0, 6.283); g.fill(); pl.shower = [266, 180];
      // lavabo + miroir
      K.mirror(g, 600, 120, 140, 150); g.fillStyle = '#fff'; rr(g, 590, 300, 160, 30, 12); g.fill(); g.fillStyle = '#c8b8e8'; g.fillRect(620, 330, 100, 140); g.strokeStyle = 'rgba(0,0,0,.15)'; g.strokeRect(620, 330, 100, 140);
      g.fillStyle = '#ff7aa8'; g.fillRect(760, 280, 14, 26); g.fillStyle = '#7af0ff'; g.fillRect(778, 286, 12, 20);
      // serviettes
      g.fillStyle = '#9aa3b5'; g.fillRect(820, 200, 110, 5); g.fillStyle = '#ff9ccc'; g.fillRect(830, 205, 40, 120); g.fillStyle = '#c77dff'; g.fillRect(878, 205, 40, 100); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(830, 300, 40, 6); g.fillRect(878, 280, 40, 6);
      K.rug(g, 480, 540, 110, 26, '#b5e8f0', '#fff'); K.plant(g, 900, 470, 0.7, 'fern');
    },
    anim: function (g, e) { var b = Math.sin(e.t * 2) * 3; g.fillStyle = '#ffd166'; g.beginPath(); g.ellipse(150, 366 + b, 12, 9, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(160, 356 + b, 7, 0, 6.283); g.fill(); g.fillStyle = '#ff8c42'; g.beginPath(); g.moveTo(166, 356 + b); g.lineTo(174, 358 + b); g.lineTo(166, 360 + b); g.fill(); g.fillStyle = '#222'; g.fillRect(161, 353 + b, 2, 2); } });
  place('jardin', { nom: 'Le jardin', zone: 'maison', sol: 'herbe', out: 'jardin', sky: 330, icon: '🌳',
    draw: function (g, e, pl) {
      g.clearRect(0, 0, W, 330); pl.wins.push([0, 0, W, 330]);
      g.fillStyle = '#e8d6c0'; g.fillRect(0, 90, 140, 290); g.fillStyle = '#b5523b'; g.beginPath(); g.moveTo(-10, 95); g.lineTo(70, 40); g.lineTo(150, 95); g.fill(); g.fillStyle = '#9fd8ff'; g.fillRect(30, 150, 60, 70); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(30, 150, 60, 70); g.fillStyle = '#8a5a3a'; g.fillRect(40, 260, 50, 120);
      K.floor(g, 'herbe', e.season === 'hiver' ? '#9fb5a0' : e.season === 'automne' ? '#8fae5a' : '#7cc56b', 0, 330);
      if (e.weather === 'neige') { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(0, 330, W, 270); }
      K.fence(g, 360, '#fff8f0'); K.tree(g, 820, 400, 1.1, e.season); K.bush(g, 200, 400, 1.2, e.season); K.bush(g, 640, 395, 1, e.season);
      // potager / massif de fleurs
      g.fillStyle = '#7a5230'; rr(g, 260, 420, 220, 40, 8); g.fill(); var R = seeded(4); if (e.season !== 'hiver') for (var i = 0; i < 12; i++) { g.strokeStyle = '#3f8f5a'; g.lineWidth = 2; var fx = 275 + i * 17, fy = 425; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy - 20 - R() * 12); g.stroke(); flower(g, fx, fy - 24 - R() * 10, 6, ['#ff7aa8', '#ffd166', '#c77dff', '#ff9b71'][i % 4]); }
      // balançoire
      g.strokeStyle = '#8a6038'; g.lineWidth = 8; g.beginPath(); g.moveTo(560, 470); g.lineTo(600, 300); g.lineTo(640, 470); g.moveTo(700, 470); g.lineTo(740, 300); g.lineTo(780, 470); g.moveTo(596, 300); g.lineTo(744, 300); g.stroke(); pl.swing = [670, 300];
      if (e.weather === 'pluie') { g.fillStyle = 'rgba(120,150,200,.35)'; [[300, 540, 50], [700, 570, 70]].forEach(function (f) { g.beginPath(); g.ellipse(f[0], f[1], f[2], 8, 0, 0, 6.283); g.fill(); }); }
    } });
  place('bureau', { nom: 'Le bureau de papa', zone: 'maison', sol: 'parquet', icon: '💼', lamps: [[300, 300, 150, 'bureau_lampe']],
    draw: function (g, e, pl) {
      K.wall(g, '#e3e8d8', 'panels', '#a9b59a'); K.floor(g, 'parquet', '#a8774c');
      K.windowFrame(g, 80, 70, 150, 170, '#7a9cd6', pl);
      // étagères de classeurs
      for (var r = 0; r < 3; r++) { K.box(g, 660, 110 + r * 80, 260, 10, '#8a6038', 2); for (var b = 0; b < 9; b++) { var c = ['#3d5a80', '#e63946', '#2a9d8f', '#f4a261', '#6d597a'][(b + r) % 5]; K.box(g, 668 + b * 27, 60 + r * 80, 24, 50, c, 2); g.fillStyle = '#fff'; g.fillRect(674 + b * 27, 72 + r * 80, 12, 16); g.fillStyle = '#ccc'; g.beginPath(); g.arc(680 + b * 27, 100 + r * 80, 3, 0, 6.283); g.fill(); } }
      K.frame(g, 300, 110, 90, 70, 'family'); K.frame(g, 410, 120, 60, 50, 'family'); K.frame(g, 490, 100, 70, 90, 'landscape');
      // bureau en bois massif
      K.shadow(g, 420, 470, 220, 14); K.box(g, 220, 360, 400, 20, '#8a5a32', 3); K.box(g, 230, 378, 110, 92, '#7a4e2a', 3); K.box(g, 500, 378, 110, 92, '#7a4e2a', 3); for (var d = 0; d < 3; d++) { g.fillStyle = '#c99a5b'; g.fillRect(270, 395 + d * 26, 30, 4); g.fillRect(540, 395 + d * 26, 30, 4); }
      // double écran
      [[330, 240], [450, 240]].forEach(function (s) { g.fillStyle = '#222'; rr(g, s[0], s[1], 110, 76, 5); g.fill(); g.fillStyle = '#444'; g.fillRect(s[0] + 50, s[1] + 76, 10, 24); g.fillRect(s[0] + 35, s[1] + 98, 40, 5); }); pl.screens = [[335, 245, 100, 66], [455, 245, 100, 66]];
      g.fillStyle = '#ddd'; rr(g, 390, 344, 110, 12, 3); g.fill(); g.fillStyle = '#bbb'; g.beginPath(); g.ellipse(530, 350, 10, 6, 0, 0, 6.283); g.fill();
      K.lampDesk(g, 260, 360, '#3d5a80');
      // fauteuil
      g.fillStyle = '#333'; g.fillRect(418, 470, 6, 20); g.beginPath(); g.ellipse(420, 496, 34, 6, 0, 0, 6.283); g.fill(); K.box(g, 380, 330, 80, 120, '#2b2d42', 18); K.box(g, 372, 430, 96, 26, '#3d405b', 10);
      K.plant(g, 640, 470, 1.1, 'monstera'); K.rug(g, 420, 540, 230, 34, '#cbb89a', '#8a6038');
      pl.mug = [580, 352];
      g.fillStyle = '#fff'; rr(g, 568, 330, 24, 24, 4); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(594, 341, 6, -1.4, 1.4); g.stroke(); g.fillStyle = '#6b3e1e'; g.fillRect(570, 332, 20, 4);
    },
    anim: function (g, e, pl) { // écrans qui défilent + vapeur du café
      var busy = LL.papaAuBureau && LL.papaAuBureau();
      pl.screens.forEach(function (s, i) { g.fillStyle = busy ? '#e9f3ff' : '#1a2340'; g.fillRect(s[0], s[1], s[2], s[3]); if (busy) { g.save(); g.beginPath(); g.rect(s[0], s[1], s[2], s[3]); g.clip(); if (i === 0) { for (var l = 0; l < 10; l++) { var y = s[1] + ((l * 9 - e.t * 14) % 90 + 90) % 90; g.fillStyle = ['#3d5a80', '#98c1d9', '#e0fbfc'][l % 3]; g.fillRect(s[0] + 6, y, 30 + (l * 37 % 55), 4); } } else { g.fillStyle = '#c8e1ff'; for (var v = 0; v < 4; v++) { g.fillRect(s[0] + 4 + (v % 2) * 48, s[1] + 4 + Math.floor(v / 2) * 31, 44, 28); g.fillStyle = ['#ffb3c7', '#b5e48c', '#ffd166', '#a0c4ff'][v]; g.beginPath(); g.arc(s[0] + 26 + (v % 2) * 48, s[1] + 16 + Math.floor(v / 2) * 31, 7 + Math.sin(e.t * 4 + v) * 0.6, 0, 6.283); g.fill(); g.fillStyle = '#c8e1ff'; } } g.restore(); } else { g.fillStyle = 'rgba(155,107,214,.5)'; g.beginPath(); g.arc(s[0] + 50, s[1] + 33, 12 + Math.sin(e.t) * 3, 0, 6.283); g.fill(); } });
      if (!e.reduce) for (var k = 0; k < 3; k++) { var p = (e.t * 0.6 + k / 3) % 1; g.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - p)) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(pl.mug[0] - 4 + k * 4, pl.mug[1] - 24 - p * 30); g.quadraticCurveTo(pl.mug[0] + 6 * Math.sin(e.t * 3 + k), pl.mug[1] - 34 - p * 30, pl.mug[0] - 2 + k * 4, pl.mug[1] - 44 - p * 30); g.stroke(); }
    } });

  /* ---------- Collège / lycée ---------- */
  function classroom(id, nom, wallc, boardTitle, boardLines, extra, icon) {
    place(id, { nom: nom, zone: 'ecole', sol: 'lino', icon: icon, lamps: [[300, 20, 140], [660, 20, 140]],
      draw: function (g, e, pl) {
        K.wall(g, wallc, 'plain'); K.floor(g, 'lino', '#c9d3c0');
        K.windowFrame(g, 40, 70, 120, 200, null, pl); K.windowFrame(g, 820, 70, 110, 200, null, pl);
        var lines = typeof boardLines === 'function' ? boardLines(e) : boardLines;
        K.board(g, 250, 70, 460, 200, id === 'salle_ang' ? 'white' : 'green', [boardTitle].concat(lines)); K.clock(g, 760, 60, 20);
        if (extra) extra(g, e, pl);
        K.box(g, 200, 340, 160, 22, '#a87850', 3); K.box(g, 210, 360, 140, 110, '#8a6038', 3); g.fillStyle = '#e63946'; g.beginPath(); g.arc(320, 330, 9, 0, 6.283); g.fill(); g.fillStyle = '#ffd166'; g.fillRect(230, 328, 50, 10);
        for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) K.schoolDesk(g, 160 + c * 220 + r * 40, 510 + r * 70);
      } });
  }
  function boardFor(m) { return function (e) { var n = LL.niveauIdx(e.day); var B = { maths: [['(a+b)² = a²+2ab+b²', 'Pythagore : AB²+AC²=BC²'], ['Thalès : AM/AB = AN/AC', 'f(x) = 3x − 2'], ['Δ = b² − 4ac', 'Vecteurs : AB→ + BC→ = AC→'], ["f'(x) = 2x + 3", 'uₙ₊₁ = uₙ + r'], ['ln(ab) = ln a + ln b', '∫ f(x) dx']], fr: [['Le récit à la 1re personne', 'Figures de style : la métaphore'], ['Argumenter : thèse / arguments', 'Le subjonctif présent'], ['La poésie du XIXe siècle', 'Le roman et le récit'], ['Commentaire : axes de lecture', 'La dissertation'], ['Philosophie : la conscience', 'Problématiser un sujet']], hg: [['Les Lumières (XVIIIe s.)', 'La Révolution française'], ['La Première Guerre mondiale', 'Les institutions de la Ve Rép.'], ['La Méditerranée médiévale', 'Sociétés et environnements'], ['La Révolution industrielle', 'La France : 1814-1848'], ['La guerre froide', 'La mondialisation']] }; return B[m][n]; }; }
  classroom('salle_maths', 'Salle de maths', '#e6f0ff', '📐 Mathématiques', boardFor('maths'), function (g) { K.frame(g, 860 - 60, 300, 70, 50, 'abstract', 12); g.strokeStyle = '#3d5a80'; g.lineWidth = 3; g.beginPath(); g.moveTo(735, 150); g.lineTo(730, 250); g.lineTo(700, 250); g.closePath(); g.stroke(); }, '📐');
  classroom('salle_fr', 'Salle de français', '#fff0e6', '📘 Français', boardFor('fr'), function (g) { K.shelf(g, 40, 330, 150, 17, false); K.frame(g, 730, 140, 60, 80, 'poster'); }, '📘');
  classroom('salle_ang', "Salle d'anglais", '#ffeef3', '🇬🇧 English class', function (e) { return [['Present perfect: I have lived…', 'Vocabulary: hobbies'], ['Modals: must / should / might', 'Reported speech'], ['Linking words: however, whereas', 'Phonetics: /θ/ /ð/'], ['Debate: For and against', 'Passive voice'], ['Essay: Thesis + arguments', 'Fiction & realities']][LL.niveauIdx(e.day)]; }, function (g) { g.fillStyle = '#012169'; g.fillRect(730, 150, 66, 40); g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.moveTo(730, 150); g.lineTo(796, 190); g.moveTo(796, 150); g.lineTo(730, 190); g.stroke(); g.strokeStyle = '#c8102e'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#fff'; g.fillRect(756, 150, 14, 40); g.fillRect(730, 163, 66, 14); g.fillStyle = '#c8102e'; g.fillRect(759, 150, 8, 40); g.fillRect(730, 166, 66, 8); }, '🇬🇧');
  classroom('salle_hg', "Salle d'histoire-géo", '#f2f7e6', '🌍 Histoire-Géographie', boardFor('hg'), function (g) { K.frame(g, 40, 300, 130, 90, 'map', 7); g.fillStyle = '#3d5a80'; g.beginPath(); g.arc(750, 300, 26, 0, 6.283); g.fill(); g.fillStyle = '#8fcf7e'; g.beginPath(); g.ellipse(744, 294, 10, 14, 0.4, 0, 6.283); g.fill(); g.fillStyle = '#8a6038'; g.fillRect(746, 326, 8, 30); g.fillRect(730, 354, 40, 6); }, '🌍');
  place('cour', { nom: 'La cour', zone: 'ecole', sol: 'pave', out: 'ville', sky: 300, icon: '🏫',
    draw: function (g, e, pl) {
      g.clearRect(0, 0, W, 300); pl.wins.push([0, 0, W, 300]);
      K.facade(g, 0, 120, 960, 280, '#f2dcc8', null, 8); g.fillStyle = '#b5523b'; g.fillRect(0, 105, 960, 20); K.sign(g, 360, 140, 240, 44, LL.ecole(e.day) === 'lycée' ? 'LYCÉE VICTOR-HUGO' : 'COLLÈGE JEAN-MOULIN', '#9b6bd6', '#fff');
      g.fillStyle = '#7a5a8a'; rr(g, 430, 300, 100, 100, 6); g.fill(); g.fillStyle = '#5a3d6a'; g.fillRect(478, 300, 4, 100);
      K.floor(g, 'pave', '#c9c0b4', 0, 400); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(60, 440, 260, 120); g.beginPath(); g.arc(190, 500, 30, 0, 6.283); g.stroke();
      K.tree(g, 860, 420, 1, e.season); K.bench(g, 650, 470, '#c77dff'); K.bench(g, 120, 590, '#ff9ccc');
      g.fillStyle = '#555'; g.fillRect(380, 360, 6, 100); g.fillStyle = '#e63946'; g.fillRect(386, 362, 40, 26); g.fillStyle = '#fff'; g.fillRect(386, 370, 40, 8);
    } });
  place('cdi', { nom: 'Le CDI', zone: 'ecole', sol: 'moquette', icon: '📚', lamps: [[480, 30, 200]],
    draw: function (g, e, pl) {
      K.wall(g, '#efe6ff', 'plain'); K.floor(g, 'moquette', '#7d8fc9');
      K.windowFrame(g, 410, 60, 140, 170, null, pl);
      for (var s = 0; s < 2; s++) { var x0 = s ? 600 : 40; K.box(g, x0, 80, 320, 320, '#a87850', 4); for (var r = 0; r < 5; r++) { g.fillStyle = '#7a5530'; g.fillRect(x0 + 8, 92 + r * 62, 304, 54); K.books(g, x0 + 12, 144 + r * 62, 296, 11 + s * 7 + r, 46); } }
      K.sign(g, 400, 250, 160, 36, '📚 SILENCE', '#ffd166', '#5a3d6a');
      K.table(g, 300, 500, 360, 70, '#d8b07c'); g.fillStyle = '#333'; rr(g, 340, 440, 70, 46, 4); g.fill(); g.fillStyle = '#9ad1ff'; g.fillRect(345, 445, 60, 36); g.fillStyle = '#fff'; g.fillRect(470, 478, 40, 10); g.fillStyle = '#e05a7a'; g.fillRect(530, 474, 30, 14);
      K.plant(g, 640, 470, 0.8, 'fern');
    } });
  place('cantine', { nom: 'La cantine', zone: 'ecole', sol: 'carrelage', icon: '🍽️', lamps: [[480, 30, 200]],
    draw: function (g, e, pl) {
      K.wall(g, '#fff4d6', 'stripes', '#ffb3c7'); K.floor(g, 'carrelage', '#e7e2da');
      K.windowFrame(g, 60, 60, 140, 160, '#ffd166', pl); K.windowFrame(g, 760, 60, 140, 160, '#ffd166', pl);
      K.box(g, 280, 240, 420, 40, '#cfd8e3', 4); K.box(g, 280, 280, 420, 120, '#9aa3b5', 4); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(290, 245, 400, 6);
      ['#e9c46a', '#e76f51', '#8ac926', '#f4a261', '#ffffff'].forEach(function (c, i) { g.fillStyle = '#ddd'; rr(g, 300 + i * 80, 252, 64, 22, 4); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(332 + i * 80, 262, 24, 7, 0, 0, 6.283); g.fill(); });
      K.sign(g, 400, 120, 180, 50, '🍽️ Menu', '#fff', '#c2185b'); K.text(g, 'Poisson • Riz • Yaourt', 490, 190, 16, '#5a3d6a');
      for (var t = 0; t < 2; t++) { K.table(g, 120 + t * 480, 520, 240, 60, '#ffb3c7'); for (var p = 0; p < 3; p++) { g.fillStyle = '#9aa3b5'; rr(g, 140 + t * 480 + p * 75, 502, 56, 10, 3); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(168 + t * 480 + p * 75, 503, 16, 4, 0, 0, 6.283); g.fill(); } }
    } });
  place('foyer', { nom: 'Le foyer des élèves', zone: 'ecole', sol: 'parquet', icon: '🛋️', lamps: [[200, 260, 140], [760, 40, 150]],
    draw: function (g, e, pl) {
      K.wall(g, '#ffe0ec', 'diamonds', '#c77dff'); K.floor(g, 'parquet', '#b98a5a');
      K.windowFrame(g, 380, 60, 200, 160, '#7af0ff', pl);
      K.frame(g, 80, 100, 100, 130, 'poster'); K.frame(g, 700, 110, 80, 60, 'abstract', 21);
      K.sofa(g, 70, 480, 260, '#ff8fc0');
      // baby-foot
      K.shadow(g, 620, 470, 120, 10); K.box(g, 520, 380, 200, 60, '#2a9d8f', 6); g.fillStyle = '#7cc56b'; g.fillRect(530, 388, 180, 44); g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(620, 388); g.lineTo(620, 432); g.stroke(); g.fillStyle = '#ccc'; for (var b = 0; b < 4; b++) g.fillRect(510, 395 + b * 10, 220, 3); g.fillStyle = '#5a3d22'; g.fillRect(530, 440, 10, 30); g.fillRect(700, 440, 10, 30);
      // distributeur
      K.box(g, 830, 190, 110, 280, '#e63946', 8); g.fillStyle = '#cde'; g.fillRect(845, 210, 80, 150); for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) { g.fillStyle = ['#ffd166', '#06d6a0', '#ef476f', '#118ab2'][(r + c) % 4]; g.fillRect(852 + c * 25, 218 + r * 36, 18, 26); }
    } });
  place('gymnase', { nom: 'Le gymnase', zone: 'ecole', sol: 'gym', icon: '🏀', lamps: [[240, 20, 180], [720, 20, 180]],
    draw: function (g, e, pl) {
      K.wall(g, '#dfe7ef', 'bricks', '#fff'); K.floor(g, 'gym', '#e2b07a', '#e94f64');
      for (var w = 0; w < 5; w++) K.windowFrame(g, 60 + w * 190, 40, 120, 60, null, pl);
      g.fillStyle = '#fff'; g.fillRect(410, 150, 140, 90); g.strokeStyle = '#e94f64'; g.lineWidth = 3; g.strokeRect(450, 190, 60, 40); g.strokeStyle = '#ff7a00'; g.lineWidth = 4; g.beginPath(); g.ellipse(480, 245, 24, 6, 0, 0, 6.283); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1; for (var n = 0; n < 6; n++) { g.beginPath(); g.moveTo(458 + n * 9, 248); g.lineTo(464 + n * 6, 275); g.stroke(); }
      g.strokeStyle = '#c8a26a'; g.lineWidth = 6; for (var e2 = 0; e2 < 8; e2++) { g.beginPath(); g.moveTo(40, 140 + e2 * 32); g.lineTo(150, 140 + e2 * 32); g.stroke(); } g.fillStyle = '#c8a26a'; g.fillRect(36, 130, 6, 270); g.fillRect(148, 130, 6, 270);
      K.box(g, 720, 420, 200, 40, '#3d5a80', 6); K.box(g, 740, 390, 160, 34, '#2a9d8f', 6);
      g.strokeStyle = '#a07040'; g.lineWidth = 4; g.beginPath(); g.moveTo(640, 110); g.lineTo(640, 360); g.stroke(); g.beginPath(); g.moveTo(670, 110); g.lineTo(675, 330); g.stroke();
    } });
  place('salle_arts', { nom: "Salle d'arts plastiques", zone: 'ecole', sol: 'lino', icon: '🎨', lamps: [[480, 30, 200]],
    draw: function (g, e, pl) {
      K.wall(g, '#fffbe6', 'plain'); K.floor(g, 'lino', '#d8cfc0'); var R = seeded(66); for (var s = 0; s < 40; s++) { g.fillStyle = ['#ff7aa8', '#4cc9f0', '#ffd166', '#80ed99', '#c77dff'][s % 5]; g.globalAlpha = 0.5; g.beginPath(); g.arc(R() * W, 410 + R() * 190, 2 + R() * 5, 0, 6.283); g.fill(); } g.globalAlpha = 1;
      K.windowFrame(g, 420, 50, 160, 160, '#80ed99', pl);
      for (var f = 0; f < 6; f++) K.frame(g, 40 + f * 75 + (f > 2 ? 330 : 0), 90 + (f % 2) * 70, 60, 50, f % 2 ? 'abstract' : 'landscape', f + 30);
      [[260, 470], [700, 470]].forEach(function (p, i) { g.strokeStyle = '#8a6038'; g.lineWidth = 6; g.beginPath(); g.moveTo(p[0] - 40, p[1]); g.lineTo(p[0], p[1] - 230); g.lineTo(p[0] + 40, p[1]); g.moveTo(p[0], p[1] - 230); g.lineTo(p[0], p[1]); g.stroke(); K.frame(g, p[0] - 55, p[1] - 200, 110, 90, i ? 'abstract' : 'landscape', 44 + i); });
      K.table(g, 380, 520, 200, 50, '#e0b98a'); ['#ff7aa8', '#4cc9f0', '#ffd166', '#80ed99'].forEach(function (c, i) { g.fillStyle = '#fff'; g.fillRect(400 + i * 40, 486, 26, 22); g.fillStyle = c; g.fillRect(402 + i * 40, 488, 22, 8); });
    } });
  place('salle_musique', { nom: 'Salle de musique', zone: 'ecole', sol: 'parquet', icon: '🎼', lamps: [[480, 30, 200]],
    draw: function (g, e, pl) {
      K.wall(g, '#ece6ff', 'stripes', '#b9a6f2'); K.floor(g, 'parquet', '#c8925f');
      K.windowFrame(g, 700, 60, 150, 150, '#9b6bd6', pl);
      g.fillStyle = '#fff'; g.fillRect(60, 80, 520, 150); g.strokeStyle = '#333'; g.lineWidth = 1.5; for (var l = 0; l < 5; l++) { g.beginPath(); g.moveTo(80, 120 + l * 12); g.lineTo(560, 120 + l * 12); g.stroke(); } K.text(g, '𝄞', 100, 150, 64, '#333'); var notes = [3, 5, 2, 4, 6, 1, 3, 5, 4, 2]; notes.forEach(function (n, i) { g.fillStyle = '#333'; g.beginPath(); g.ellipse(170 + i * 38, 168 - n * 6, 7, 5, -0.3, 0, 6.283); g.fill(); g.fillRect(176 + i * 38, 138 - n * 6, 2, 30); });
      // piano droit, batterie, xylophone
      K.box(g, 60, 290, 190, 180, '#2b2233', 5); g.fillStyle = '#fff'; g.fillRect(66, 360, 178, 16); g.fillStyle = '#111'; for (var k = 0; k < 16; k++) if (k % 7 !== 2 && k % 7 !== 6) g.fillRect(74 + k * 11, 360, 5, 9);
      g.fillStyle = '#e63946'; g.beginPath(); g.ellipse(640, 440, 50, 30, 0, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(640, 420, 46, 12, 0, 0, 6.283); g.fill(); g.fillStyle = '#d4a017'; g.beginPath(); g.ellipse(560, 340, 30, 6, 0, 0, 6.283); g.ellipse(730, 330, 30, 6, 0, 0, 6.283); g.fill(); g.strokeStyle = '#888'; g.lineWidth = 3; g.beginPath(); g.moveTo(560, 340); g.lineTo(560, 470); g.moveTo(730, 330); g.lineTo(730, 470); g.stroke();
      ['#e63946', '#f4a261', '#ffd166', '#80ed99', '#4cc9f0', '#c77dff'].forEach(function (c, i) { g.fillStyle = c; rr(g, 340 + i * 26, 410 - i * 2, 22, 50 - i * 4, 3); g.fill(); });
    } });

  /* ---------- Ville ---------- */
  function outdoor(id, nom, icon, ground, gc, skyKind, fn, extra) { place(id, Object.assign({ nom: nom, zone: 'ville', sol: ground, out: skyKind, sky: 330, icon: icon, draw: function (g, e, pl) { g.clearRect(0, 0, W, 330); pl.wins.push([0, 0, W, 330]); K.floor(g, ground, typeof gc === 'function' ? gc(e) : gc, 0, 330); if (e.weather === 'neige' && ground !== 'sable') { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(0, 330, W, 270); } if (e.weather === 'pluie') { g.fillStyle = 'rgba(120,150,200,.3)'; [[250, 520, 60], [700, 560, 80], [480, 470, 40]].forEach(function (f) { g.beginPath(); g.ellipse(f[0], f[1], f[2], 8, 0, 0, 6.283); g.fill(); }); } fn(g, e, pl); } }, extra || {})); }
  function grassC(e) { return e.season === 'hiver' ? '#9fb5a0' : e.season === 'automne' ? '#8fae5a' : '#7cc56b'; }
  outdoor('parc', 'Le parc', '🌳', 'herbe', grassC, 'jardin', function (g, e, pl) {
    K.tree(g, 120, 400, 1.2, e.season); K.tree(g, 900, 380, 1, e.season); K.tree(g, 640, 360, 0.7, e.season, 'sapin');
    g.fillStyle = '#d7c3a0'; g.beginPath(); g.moveTo(0, 470); g.bezierCurveTo(300, 430, 600, 520, 960, 460); g.lineTo(960, 500); g.bezierCurveTo(600, 560, 300, 470, 0, 510); g.fill();
    // étang
    g.fillStyle = lg(g, 0, 520, 0, 600, ['#7fc8e8', '#4a9cc8']); g.beginPath(); g.ellipse(700, 560, 170, 40, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(700, 560, 120, 25, 0, 3.4, 5.6); g.stroke(); pl.pond = [700, 560];
    K.bench(g, 330, 450, '#c8955e'); K.lamppost(g, 480, 440); K.bush(g, 40, 470, 1, e.season);
  }, { anim: function (g, e) { for (var i = 0; i < 2; i++) { var x = 640 + i * 90 + Math.sin(e.t * 0.5 + i * 2) * 40, y = 560 + i * 8; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, 16, 9, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(x + 12, y - 10, 7, 0, 6.283); g.fill(); g.fillStyle = '#ff8c42'; g.beginPath(); g.moveTo(x + 18, y - 11); g.lineTo(x + 26, y - 9); g.lineTo(x + 18, y - 7); g.fill(); g.fillStyle = '#222'; g.fillRect(x + 13, y - 13, 2, 2); } } });
  outdoor('cafe', 'Le café « Le Lilas »', '☕', 'pave', '#d9c9b8', 'ville', function (g, e, pl) {
    K.facade(g, 160, 100, 640, 300, '#f6e3ef', null, 3); g.fillStyle = '#5a3d6a'; g.fillRect(160, 240, 640, 160); g.fillStyle = 'rgba(255,240,200,.85)'; g.fillRect(190, 260, 250, 120); g.fillRect(520, 260, 250, 120); g.fillStyle = '#7a5a8a'; g.fillRect(450, 270, 60, 130);
    K.awning(g, 160, 220, 648, '#c77dff', '#fff'); K.sign(g, 360, 140, 240, 50, '☕ Le Lilas', '#fff', '#9b6bd6');
    [[230, 520], [520, 540], [800, 510]].forEach(function (t) { K.table(g, t[0] - 45, t[1], 90, 60, '#fff'); K.chair(g, t[0] - 60, t[1] + 50, '#c77dff'); K.chair(g, t[0] + 60, t[1] + 50, '#ff9ccc'); g.fillStyle = '#fff'; rr(g, t[0] - 8, t[1] - 28, 16, 14, 3); g.fill(); });
    g.fillStyle = '#e63946'; g.beginPath(); g.moveTo(800, 330); g.lineTo(700, 380); g.lineTo(900, 380); g.fill(); g.fillStyle = '#555'; g.fillRect(798, 330, 4, 180);
  }, { lamps: [[315, 320, 160], [645, 320, 160]] });
  outdoor('plage', 'La plage', '🏖️', 'sable', '#f3dfb0', 'mer', function (g, e, pl) {
    g.fillStyle = lg(g, 0, 250, 0, 340, ['#3fa7d6', '#7fd1e8']); g.fillRect(0, 250, W, 90); pl.sea = 1;
    g.fillStyle = '#e63946'; g.beginPath(); g.moveTo(180, 330); g.quadraticCurveTo(250, 270, 320, 330); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(215, 312); g.quadraticCurveTo(250, 280, 285, 312); g.lineTo(250, 330); g.fill(); g.fillStyle = '#ddd'; g.fillRect(248, 320, 4, 150);
    g.fillStyle = '#ff9ccc'; g.save(); g.translate(330, 500); g.rotate(-0.08); rr(g, -60, -14, 140, 28, 6); g.fill(); g.fillStyle = '#fff'; for (var s = 0; s < 4; s++) g.fillRect(-50 + s * 34, -14, 12, 28); g.restore();
    for (var c = 0; c < 6; c++) { g.fillStyle = ['#ffd1e3', '#fff', '#ffe5b4'][c % 3]; g.beginPath(); g.arc(80 + c * 150, 560 + (c % 2) * 20, 6, 3.14, 6.283); g.fill(); }
    g.fillStyle = '#e8c27a'; g.fillRect(700, 470, 60, 20);
  }, { anim: function (g, e) { var t = e.t; for (var l = 0; l < 3; l++) { g.strokeStyle = 'rgba(255,255,255,' + (0.7 - l * 0.2) + ')'; g.lineWidth = 3; g.beginPath(); for (var x = 0; x <= W; x += 20) { var y = 300 + l * 14 + Math.sin(x * 0.03 + t * 1.5 + l) * 4; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); } var fx = 330 + Math.sin(t * 0.8) * 30; g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(fx, 340, 200 + Math.sin(t) * 30, 6, 0, 0, 6.283); g.fill(); } });
  place('piscine', { nom: 'La piscine', zone: 'ville', sol: 'carrelage', icon: '🏊', lamps: [[480, 30, 220]],
    draw: function (g, e, pl) { K.wall(g, '#e0f4ff', 'tiles', '#fff', 300); K.floor(g, 'carrelage', '#e7f1f6', 0, 300); for (var w = 0; w < 4; w++) K.windowFrame(g, 70 + w * 230, 50, 150, 120, null, pl); g.fillStyle = '#2a9d8f'; g.fillRect(0, 380, W, 140); pl.pool = [0, 380, W, 140]; for (var l = 1; l < 4; l++) { for (var b = 0; b < W; b += 30) { g.fillStyle = b / 30 % 2 ? '#e63946' : '#fff'; g.beginPath(); g.arc(b, 380 + l * 35, 5, 0, 6.283); g.fill(); } } K.sign(g, 380, 210, 200, 40, '🏊 Piscine municipale', '#4cc9f0', '#fff'); g.strokeStyle = '#ccc'; g.lineWidth = 5; g.beginPath(); g.moveTo(860, 380); g.lineTo(860, 300); g.quadraticCurveTo(860, 285, 880, 290); g.moveTo(900, 380); g.lineTo(900, 300); g.stroke(); },
    anim: function (g, e) { g.save(); g.beginPath(); g.rect(0, 380, W, 140); g.clip(); g.fillStyle = lg(g, 0, 380, 0, 520, ['rgba(120,220,255,.75)', 'rgba(40,140,200,.85)']); g.fillRect(0, 380, W, 140); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (var i = 0; i < 22; i++) { var x = (i * 47 + Math.sin(e.t + i) * 12) % W, y = 390 + (i * 31) % 120; g.beginPath(); g.ellipse(x, y, 18 + Math.sin(e.t * 2 + i) * 4, 4, 0, 0, 6.283); g.stroke(); } for (var l = 1; l < 4; l++) for (var b = 0; b < W; b += 30) { g.fillStyle = b / 30 % 2 ? '#e63946' : '#fff'; g.beginPath(); g.arc(b, 380 + l * 35 + Math.sin(e.t * 2 + b) * 1.5, 5, 0, 6.283); g.fill(); } g.restore(); } });
  place('patinoire', { nom: 'La patinoire', zone: 'ville', sol: 'glace', icon: '⛸️', lamps: [[240, 20, 200], [720, 20, 200]],
    draw: function (g, e, pl) { K.wall(g, '#2b3a67', 'plain'); g.fillStyle = 'rgba(255,255,255,.08)'; for (var s = 0; s < 6; s++) { g.beginPath(); g.moveTo(s * 180, 0); g.lineTo(s * 180 + 60, 0); g.lineTo(s * 180 + 160, 380); g.lineTo(s * 180 + 100, 380); g.fill(); } K.floor(g, 'glace'); g.fillStyle = '#fff'; g.fillRect(0, 380, W, 26); for (var b = 0; b < W; b += 120) { g.fillStyle = ['#e63946', '#4cc9f0', '#ffd166'][b / 120 % 3]; g.fillRect(b + 10, 384, 100, 18); } K.sign(g, 360, 120, 240, 50, '⛸️ PATINOIRE', '#4cc9f0', '#fff'); for (var f = 0; f < 10; f++) { g.fillStyle = ['#ff7aa8', '#ffd166', '#7af0ff', '#c77dff'][f % 4]; g.fillRect(40 + f * 92, 60, 30, 20); } } });
  outdoor('cinema', 'Le cinéma', '🎬', 'pave', '#bfb6c8', 'ville', function (g, e, pl) { K.facade(g, 120, 60, 720, 340, '#4a2c5a', null, 9); g.fillStyle = '#2b1838'; g.fillRect(120, 230, 720, 170); K.box(g, 220, 140, 520, 70, '#ffd166', 8); K.text(g, 'CINÉ ÉTOILE', 480, 175, 36, '#9b2c5a'); for (var p = 0; p < 3; p++) { K.frame(g, 170 + p * 230, 250, 160, 110, ['poster', 'abstract', 'landscape'][p], 70 + p); } g.fillStyle = '#c2185b'; g.fillRect(420, 360, 120, 40); }, { anim: function (g, e) { for (var i = 0; i < 26; i++) { var x = 222 + i * 20, on = (Math.floor(e.t * 4) + i) % 3 === 0; g.fillStyle = on ? '#fff8c4' : '#c98a2a'; g.beginPath(); g.arc(x, 136, 4, 0, 6.283); g.arc(x, 214, 4, 0, 6.283); g.fill(); } }, lamps: [[480, 175, 260]] });
  outdoor('boutiques', 'Les boutiques', '🛍️', 'pave', '#d6cfc6', 'ville', function (g, e, pl) { [[20, '#ffd1e3', '👗 Mode Lila', '#c2185b'], [340, '#d6f0ff', '📚 Librairie', '#3d5a80'], [660, '#fff2c4', '🎁 Cadeaux', '#e76f51']].forEach(function (s, i) { K.facade(g, s[0], 90, 290, 310, s[1], null, 20 + i); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(s[0] + 20, 250, 250, 130); K.awning(g, s[0], 215, 290, s[3], '#fff'); K.sign(g, s[0] + 40, 120, 210, 46, s[2], '#fff', s[3]); if (i === 0) { for (var m = 0; m < 3; m++) { g.fillStyle = ['#ff8fc0', '#c77dff', '#ffd166'][m]; g.beginPath(); g.moveTo(s[0] + 60 + m * 70, 270); g.lineTo(s[0] + 85 + m * 70, 270); g.lineTo(s[0] + 100 + m * 70, 370); g.lineTo(s[0] + 45 + m * 70, 370); g.fill(); } } else if (i === 1) K.books(g, s[0] + 30, 370, 230, 41, 60); else { for (var c = 0; c < 5; c++) { g.fillStyle = ['#e63946', '#4cc9f0', '#80ed99', '#ffd166', '#c77dff'][c]; g.fillRect(s[0] + 35 + c * 45, 330 - (c % 2) * 20, 34, 40 + (c % 2) * 20); g.fillStyle = '#fff'; g.fillRect(s[0] + 50 + c * 45, 330 - (c % 2) * 20, 4, 40 + (c % 2) * 20); } } }); });
  outdoor('boulangerie', 'La boulangerie', '🥖', 'pave', '#d9cbbb', 'ville', function (g, e, pl) { K.facade(g, 140, 80, 680, 320, '#f7e1c0', null, 31); K.awning(g, 140, 200, 680, '#c0623f', '#fff3e0'); K.sign(g, 330, 110, 300, 56, '🥖 Boulangerie Dorée', '#fff', '#a0522d'); g.fillStyle = 'rgba(255,248,230,.95)'; g.fillRect(180, 250, 600, 140); for (var r = 0; r < 2; r++) { g.fillStyle = '#c99a5b'; g.fillRect(190, 300 + r * 50, 580, 5); for (var b = 0; b < 9; b++) { var x = 210 + b * 63, y = 296 + r * 50; if ((b + r) % 3 === 0) { g.fillStyle = lg(g, x, y - 20, x, y, ['#f0b25a', '#c8782a']); g.beginPath(); g.ellipse(x + 20, y - 10, 26, 8, -0.1, 0, 6.283); g.fill(); g.strokeStyle = '#ffe2a8'; g.beginPath(); g.moveTo(x + 6, y - 12); g.lineTo(x + 12, y - 8); g.moveTo(x + 18, y - 13); g.lineTo(x + 24, y - 9); g.stroke(); } else if ((b + r) % 3 === 1) { g.fillStyle = '#e8a64a'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 30, x + 40, y); g.fill(); } else { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + 20, y - 6, 18, 6, 0, 0, 6.283); g.fill(); g.fillStyle = '#ff7aa8'; g.beginPath(); g.ellipse(x + 20, y - 12, 14, 8, 0, 0, 6.283); g.fill(); } } } });
  outdoor('marche', 'Le marché', '🧺', 'pave', '#cfc6ba', 'ville', function (g, e, pl) { [[40, '#e63946', '🍎 Fruits'], [340, '#2a9d8f', '🥕 Légumes'], [640, '#9b6bd6', '💐 Fleurs']].forEach(function (s, i) { g.fillStyle = '#8a6038'; g.fillRect(s[0] + 10, 230, 8, 220); g.fillRect(s[0] + 262, 230, 8, 220); K.awning(g, s[0] - 10, 210, 300, s[1], '#fff'); K.sign(g, s[0] + 70, 160, 140, 40, s[2], '#fff', s[1]); K.box(g, s[0], 380, 280, 70, '#c8955e', 4); var R = seeded(80 + i); for (var k = 0; k < 40; k++) { var cols = i === 0 ? ['#e63946', '#ffb703', '#8ac926', '#ff006e'] : i === 1 ? ['#f77f00', '#55a630', '#d62828', '#fcbf49'] : ['#ff7aa8', '#c77dff', '#ffd166', '#fff']; if (i === 2) flower(g, s[0] + 20 + R() * 240, 350 + R() * 30, 6, cols[k % 4]); else { g.fillStyle = cols[k % 4]; g.beginPath(); g.arc(s[0] + 20 + R() * 240, 365 + R() * 20, 8, 0, 6.283); g.fill(); } } }); });
  place('danse', { nom: 'École de danse', zone: 'ville', sol: 'parquet', icon: '🩰', lamps: [[240, 20, 180], [720, 20, 180]],
    draw: function (g, e, pl) { K.wall(g, '#fde2f0', 'plain'); K.floor(g, 'parquet', '#d9a46a'); K.mirror(g, 60, 70, 840, 280); g.fillStyle = 'rgba(255,255,255,.2)'; for (var s = 0; s < 6; s++) { g.beginPath(); g.moveTo(100 + s * 150, 75); g.lineTo(140 + s * 150, 75); g.lineTo(80 + s * 150, 345); g.lineTo(60 + s * 150, 345); g.fill(); } g.fillStyle = '#c8955e'; rr(g, 40, 330, 880, 10, 5); g.fill(); for (var b = 0; b < 5; b++) g.fillRect(80 + b * 200, 330, 6, 70); K.sign(g, 360, 18, 240, 40, '🩰 Studio Lopez', '#c77dff', '#fff'); g.fillStyle = '#3a3350'; rr(g, 860, 400, 70, 60, 6); g.fill(); } });
  place('chez_elynn', { nom: 'Chez Elynn', zone: 'ville', sol: 'herbe', out: 'jardin', sky: 330, icon: '🏡',
    draw: function (g, e, pl) { g.clearRect(0, 0, W, 330); pl.wins.push([0, 0, W, 330]); K.floor(g, 'herbe', grassC(e), 0, 330); if (e.weather === 'neige') { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(0, 330, W, 270); }
      g.fillStyle = '#ffe5b4'; g.fillRect(560, 140, 380, 260); g.fillStyle = '#7a5a8a'; g.beginPath(); g.moveTo(540, 145); g.lineTo(750, 40); g.lineTo(960, 145); g.fill(); g.fillStyle = '#9fd8ff'; g.fillRect(600, 190, 80, 70); g.fillRect(820, 190, 80, 70); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(600, 190, 80, 70); g.strokeRect(820, 190, 80, 70); g.fillStyle = '#c2185b'; g.fillRect(720, 280, 60, 120);
      // la cabane dans l'arbre (souvenirs d'enfance)
      K.tree(g, 230, 420, 1.35, e.season); g.fillStyle = '#a0703a'; g.fillRect(150, 230, 160, 70); g.fillStyle = '#8a5a2a'; g.beginPath(); g.moveTo(140, 232); g.lineTo(230, 180); g.lineTo(320, 232); g.fill(); g.fillStyle = '#4a3020'; g.fillRect(210, 250, 34, 50); g.strokeStyle = '#7a5530'; g.lineWidth = 3; for (var r = 0; r < 6; r++) { g.beginPath(); g.moveTo(160, 300 + r * 20); g.lineTo(190, 300 + r * 20); g.stroke(); } g.beginPath(); g.moveTo(160, 300); g.lineTo(160, 420); g.moveTo(190, 300); g.lineTo(190, 420); g.stroke(); K.sign(g, 160, 205, 70, 22, 'C+E+L', '#ffd166', '#7a3d00');
      K.bush(g, 480, 410, 1, e.season); K.fence(g, 360); } });
  place('chez_daryl', { nom: 'Chez Daryl', zone: 'ville', sol: 'parquet', icon: '🎮', lamps: [[480, 380, 220], [120, 260, 120]],
    draw: function (g, e, pl) { K.wall(g, '#2f3550', 'bricks', '#fff'); g.fillStyle = 'rgba(30,30,60,.35)'; g.fillRect(0, 0, W, 400); K.floor(g, 'parquet', '#8a6a4a'); K.windowFrame(g, 60, 70, 160, 170, '#3d5a80', pl);
      K.frame(g, 280, 90, 90, 120, 'poster'); K.frame(g, 760, 100, 120, 80, 'abstract', 91);
      g.fillStyle = '#111'; rr(g, 380, 190, 260, 150, 6); g.fill(); pl.tv = [390, 200, 240, 130]; K.box(g, 360, 350, 300, 50, '#222', 6); g.fillStyle = '#444'; g.fillRect(470, 360, 80, 22); g.fillStyle = '#7af0ff'; g.fillRect(480, 368, 6, 6);
      K.sofa(g, 330, 540, 360, '#3d5a80'); K.plant(g, 760, 470, 0.9, 'cactus'); K.lampFloor(g, 120, 440, '#ffd166');
      g.fillStyle = '#1b1b25'; rr(g, 820, 380, 120, 90, 8); g.fill(); g.fillStyle = '#e63946'; g.fillRect(830, 395, 100, 6); } ,
    anim: function (g, e, pl) { var t = e.t, s = pl.tv; g.save(); g.beginPath(); g.rect(s[0], s[1], s[2], s[3]); g.clip(); g.fillStyle = lg(g, 0, s[1], 0, s[1] + s[3], ['#2b1055', '#7597de']); g.fillRect(s[0], s[1], s[2], s[3]); g.fillStyle = '#80ed99'; g.fillRect(s[0], s[1] + s[3] - 20, s[2], 20); var cx = s[0] + 40 + ((t * 60) % (s[2] - 60)); g.fillStyle = '#e63946'; g.fillRect(cx, s[1] + s[3] - 44 - Math.abs(Math.sin(t * 4)) * 20, 18, 24); g.fillStyle = '#ffd166'; for (var c = 0; c < 4; c++) { g.beginPath(); g.arc(s[0] + ((c * 70 - t * 40) % s[2] + s[2]) % s[2], s[1] + 50, 6, 0, 6.283); g.fill(); } g.restore(); } });

  /* Noms, zones, liaisons */
  LL.NOMS = {}; Object.keys(P).forEach(function (k) { LL.NOMS[k] = P[k].nom; });
  LL.ZONES = { maison: ['chambre', 'salon', 'cuisine', 'sdb', 'jardin', 'bureau'], ecole: ['cour', 'salle_maths', 'salle_fr', 'salle_ang', 'salle_hg', 'cdi', 'cantine', 'foyer', 'gymnase', 'salle_arts', 'salle_musique'], ville: ['parc', 'cafe', 'plage', 'piscine', 'patinoire', 'cinema', 'boutiques', 'boulangerie', 'marche', 'danse', 'chez_elynn', 'chez_daryl'] };
  LL.travelMin = function (from, to) { var a = P[from] ? P[from].zone : 'maison', b = P[to].zone; if (a === b) return a === 'ville' ? 10 : 2; if (to === 'plage') return 40; return 20; };
  /* Conditions d'accès (true ou message explicite) */
  LL.UNLOCK = {};
  function U(ids, fn) { ids.forEach(function (i) { LL.UNLOCK[i] = fn; }); }
  U(LL.ZONES.ecole, function (S) { if (!LL.isSchoolDay(S.day)) return LL.isWeekend(S.day) ? 'Le ' + LL.ecole(S.day) + ' est fermé le week-end 😴' : 'Le ' + LL.ecole(S.day) + ' est fermé (vacances ou jour férié) 🎉'; if (S.min < 480 || S.min >= 1050) return 'Le ' + LL.ecole(S.day) + ' ouvre de 8 h à 17 h 30.'; return true; });
  U(['parc', 'cafe', 'boutiques', 'boulangerie', 'marche', 'cinema', 'piscine', 'patinoire', 'chez_elynn', 'plage'], function (S) { if (LL.isSchoolTime(S.day, S.min)) return 'Pas maintenant : tu as cours ! 📚 Rendez-vous au ' + LL.ecole(S.day) + '.'; if (S.min >= 1320 || S.min < 420) return 'Il est trop tard pour sortir, papa et maman préfèrent que tu restes à la maison 🌙'; return true; });
  LL.UNLOCK.boulangerie = function (S) { var r = LL.UNLOCK.parc(S); if (r !== true) return r; return S.min >= 420 && S.min < 1170 ? true : 'La boulangerie est ouverte de 7 h à 19 h 30.'; };
  LL.UNLOCK.marche = function (S) { var r = LL.UNLOCK.parc(S); if (r !== true) return r; var w = LL.dow(S.day); return (w === 0 || w === 3 || w === 6) && S.min < 780 ? true : 'Le marché a lieu le mercredi, le samedi et le dimanche matin (jusqu\'à 13 h).'; };
  LL.UNLOCK.plage = function (S) { var r = LL.UNLOCK.parc(S); if (r !== true) return r; return LL.isWeekend(S.day) || LL.isVacances(S.day) ? true : 'La plage, c\'est pour le week-end ou les vacances 🏖️'; };
  LL.UNLOCK.cinema = function (S) { var r = LL.UNLOCK.parc(S); if (r !== true) return r; return S.min >= 600 ? true : 'Le cinéma ouvre à 10 h.'; };
  LL.UNLOCK.danse = function (S) { if (LL.dow(S.day) === 2 && S.min >= 1020 && S.min < 1200 && !LL.isVacances(S.day)) return true; return 'Le cours de danse, c\'est le mardi soir (17 h – 20 h) 🩰'; };
  LL.UNLOCK.chez_daryl = function (S) { var r = LL.UNLOCK.parc(S); if (r !== true) return r; return LL.isWeekend(S.day) || LL.isVacances(S.day) ? (S.min < 1140 ? true : 'Daryl dîne avec ses amis ce soir, passe un autre jour !') : 'Daryl travaille en semaine : passe le voir le week-end ou pendant les vacances.'; };
  LL.UNLOCK.bureau = function () { return true; };
  LL.canGo = function (id) { var f = LL.UNLOCK[id]; return f ? f(LL.S) : true; };

  /* SPOT[lieu] : motif du libellé → position de bulle, point d'arrivée de Lyham, direction */
  LL.SPOT = {
    chambre: [['Dormir', 180, 300, 300, 520, -1], ['Sieste', 120, 300, 260, 520, -1], ['Devoirs', 700, 270, 740, 500, -1], ['Quiz', 760, 250, 760, 505, -1], ['Prononciation', 820, 280, 800, 505, -1], ['Lisa', 650, 300, 700, 505, -1], ['Brevet', 700, 230, 740, 500, -1], ['Révisions', 740, 220, 740, 500, -1], ['Lire', 700, 110, 700, 495, -1], ['coiffer', 900, 150, 880, 500, 1], ['Dressing', 925, 120, 880, 505, 1], ['Lampe', 362, 260, 400, 500, -1], ['peluche', 280, 320, 330, 520, -1], ['fenêtre', 480, 60, 480, 490, -1], ['Guitare', 600, 120, 600, 500, -1], ['Musique', 542, 330, 560, 510, -1], ['Téléphone', 400, 380, 440, 540, 1], ['Danser', 470, 420, 470, 540, 1]],
    salon: [['Télé', 750, 210, 290, 470, 1], ['Piano', 915, 240, 880, 520, 1], ['Moka', 520, 520, 470, 545, 1], ['balle', 420, 460, 380, 540, 1], ['gamelle', 120, 540, 160, 550, -1], ['plante', 580, 330, 560, 510, 1], ['album', 290, 470, 300, 560, -1], ['Lampe', 90, 220, 140, 500, -1], ['Caresser', 560, 520, 470, 545, 1], ['Cartes', 380, 440, 360, 520, 1]],
    cuisine: [['Cuisiner', 375, 300, 375, 490, -1], ['Pâtes', 335, 280, 375, 490, -1], ['Omelette', 415, 280, 375, 490, -1], ['Crêpes', 375, 250, 375, 490, -1], ['Pâtisserie', 455, 250, 400, 490, -1], ['Frigo', 895, 140, 820, 500, 1], ['Yaourt', 895, 110, 820, 500, 1], ['Vaisselle', 620, 290, 620, 490, -1], ['Tartine', 720, 300, 720, 490, -1], ['Manger', 140, 450, 120, 560, 1], ['Aider papa', 260, 240, 280, 490, 1]],
    sdb: [['Douche', 250, 160, 200, 520, -1], ['Bain', 150, 330, 200, 520, -1], ['grimaces', 670, 110, 670, 500, -1], ['Dents', 720, 260, 680, 500, -1], ['canard', 160, 340, 220, 520, -1]],
    jardin: [['Arroser', 370, 390, 370, 480, -1], ['Jardiner', 300, 380, 330, 480, -1], ['fleurs', 430, 380, 430, 480, -1], ['papillon', 520, 420, 520, 520, 1], ['ballon', 480, 470, 480, 540, 1], ['Balançoire', 670, 300, 670, 470, 1], ['Moka', 560, 530, 560, 550, 1], ['Lire', 820, 300, 780, 520, 1]],
    bureau: [['Frapper', 120, 380, 140, 520, 1], ['café', 580, 300, 560, 500, 1], ['bon résultat', 340, 220, 360, 510, 1], ['Aide aux devoirs', 450, 220, 480, 510, 1], ['Câlin', 420, 300, 470, 520, 1], ['ordinateur', 390, 200, 420, 520, 1]],
    parc: [['canards', 700, 500, 600, 520, 1], ['papillon', 400, 380, 400, 520, 1], ['ballon', 300, 520, 300, 540, 1], ['fleurs', 60, 420, 80, 520, 1], ['Courir', 520, 420, 520, 520, 1], ['banc', 330, 380, 330, 500, 1], ['Pique-nique', 200, 520, 200, 560, 1]],
    plage: [['château', 730, 440, 700, 520, -1], ['Baigner', 480, 320, 480, 480, 1], ['Bronzer', 330, 460, 330, 520, 1], ['coquillages', 150, 540, 150, 560, 1], ['ballon', 560, 520, 560, 540, 1]]
  };
})();
