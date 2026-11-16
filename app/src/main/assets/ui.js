/* Lyham Life — ui.js : barre du haut, jauges, boutons, fenêtre #modal (classe « on »), journal, sauvegarde, démarrage */
(function () {
  'use strict';
  var LL = window.LyhamLife, $ = function (id) { return document.getElementById(id); };
  var UI = LL.ui = {}, sceneIsOpen = false, curModal = null;
  function S() { return LL.S; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  UI.esc = esc;

  /* ================= Erreurs : message compréhensible, le jeu reste utilisable ================= */
  LL.errors = [];
  LL.reportError = function (e) { var msg = (e && (e.message || e)) + ''; LL.errors.push(msg); if (window.console) console.warn('[LyhamLife]', e); if (LL.errors.length < 4) LL.toast('😅 Oups, un petit souci technique — le jeu continue.'); };
  window.addEventListener('error', function (ev) { LL.reportError(ev.error || ev.message); });

  /* ================= Sauvegarde (localStorage, clé lyhamLife_save) ================= */
  LL.save = function () { try { var s = S(); s.saveVersion = LL.SAVE_VERSION; s.lx = LL.M && LL.M.L ? Math.round(LL.M.L.x) : s.lx; localStorage.setItem(LL.SAVE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; } };
  LL.load = function () {
    var raw = null; try { raw = localStorage.getItem(LL.SAVE_KEY); } catch (e) { }
    if (!raw) { LL.S = LL.newState(); return false; }
    try { LL.S = LL.migrate(JSON.parse(raw)); if (!LL.PLACES[LL.S.place]) LL.S.place = 'chambre'; return true; }
    catch (e) { LL.S = LL.newState(); setTimeout(function () { LL.toast('⚠️ Sauvegarde illisible : nouvelle partie démarrée.'); }, 500); return false; }
  };
  LL.newGame = function () { try { localStorage.removeItem(LL.SAVE_KEY); } catch (e) { } LL.S = LL.newState(); LL.M.tv.on = false; LL.stopMusique(); LL.M.clearCache(); LL.go('chambre', true); LL.save(); UI.close(); LL.toast('✨ Nouvelle partie : bienvenue dans la vie de Lyham !'); };

  /* ================= Toasts et sous-titres ================= */
  var toastT = null;
  LL.toast = function (msg) { var t = $('toast'); if (!t) return; t.textContent = LL.cleanEmoji(msg); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600); };
  var capT = null;
  LL.caption = function (msg) { var c = $('caption'); if (!c) return; c.textContent = LL.cleanEmoji(msg); c.classList.add('on'); clearTimeout(capT); capT = setTimeout(function () { c.classList.remove('on'); }, 2200); };

  /* ================= Navigation ================= */
  var leaving = false;
  LL.go = function (lieu, silent) {
    var s = S(); if (!LL.PLACES[lieu]) return false;
    if (!silent && !LL.M.instant && lieu !== s.place && !leaving) {
      if (LL.M.busy()) { LL.toast('Lyham est occupée… ⏳'); return false; } var ok0 = LL.canGo(lieu); if (ok0 !== true) { LL.toast(ok0); LL.son('ko'); return false; }
      var a0 = LL.ZONES[LL.PLACES[s.place].zone] || [], back = LL.PLACES[s.place].zone === LL.PLACES[lieu].zone && a0.indexOf(lieu) < a0.indexOf(s.place);
      leaving = true; LL.M.setTitle('➜ ' + LL.NOMS[lieu]);
      LL.M.walkTo(back ? 20 : 940, LL.M.L.y, function () { leaving = false; LL.M.title = ''; LL.go(lieu, 'sortie'); });
      return true;
    }
    if (silent === 'sortie') silent = false;
    if (!silent) { if (LL.M.busy() && !LL.M.instant && LL.M.L.moving) { LL.toast('Lyham est occupée… ⏳'); return false; } var ok = LL.canGo(lieu); if (ok !== true) { LL.toast(ok); LL.son('ko'); return false; } }
    var from = s.place, fromSide = 'left';
    if (!silent && from !== lieu) { var a = LL.ZONES[LL.PLACES[from].zone] || [], ia = a.indexOf(from), ib = a.indexOf(lieu); fromSide = LL.PLACES[from].zone === LL.PLACES[lieu].zone && ib < ia ? 'right' : 'left'; LL.pass(LL.travelMin(from, lieu)); }
    s.place = lieu; if (lieu !== 'chambre' && LL.audio.musicStyle) LL.stopMusique();
    LL.M.enterPlace(lieu, fromSide);
    if (s.min >= 480 && LL.isSchoolDay(s.day) && LL.PLACES[lieu].zone === 'ecole' && s.outfit === 'pyjama') s.outfit = 'uniforme';
    LL.save(); LL.render(); if (LL.checkStory) setTimeout(LL.checkStory, 700);
    return true;
  };

  /* ================= Rendu de l'interface ================= */
  var zoneTab = null;
  LL.render = function () {
    var s = S(); if (!$('topbar')) return;
    var v = LL.vacance(s.day);
    $('t-date').textContent = LL.dateTxt(s.day);
    $('t-heure').textContent = LL.hhmm(s.min);
    $('t-lieu').textContent = (LL.PLACES[s.place].icon || '') + ' ' + LL.NOMS[s.place];
    $('t-info').textContent = LL.METEO_EMOJI[LL.weather(s.day)] + ' ' + LL.season(s.day) + ' · ' + LL.niveau(s.day) + (v ? ' · vacances de ' + v.nom : LL.isWeekend(s.day) ? ' · week-end' : '') + ' · ' + s.money + ' 💰';
    $('b-mute').textContent = s.settings.muted ? '🔇' : '🔊'; $('b-mute').setAttribute('aria-label', s.settings.muted ? 'Activer le son' : 'Couper le son');
    var gh = ''; LL.GAUGES.forEach(function (k) { var val = Math.round(s.g[k]); gh += '<div class="gauge' + (val < 20 ? ' low' : '') + '" role="meter" aria-valuenow="' + val + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + LL.GAUGE_NOMS[k] + '"><span>' + LL.GAUGE_NOMS[k] + '</span><b>' + val + '</b><i style="width:' + val + '%"></i></div>'; });
    $('gauges').innerHTML = gh;
    // lieux
    var z = zoneTab || LL.PLACES[s.place].zone; var tabs = '';
    [['maison', '🏠 Maison'], ['ecole', LL.ecole(s.day) === 'lycée' ? '🏫 Lycée' : '🏫 Collège'], ['ville', '🏙️ Ville']].forEach(function (t) { tabs += '<button type="button" class="tab' + (t[0] === z ? ' on' : '') + '" data-zone="' + t[0] + '">' + t[1] + '</button>'; });
    $('ztabs').innerHTML = tabs;
    var ph = ''; LL.ZONES[z].forEach(function (id) { var ok = LL.canGo(id), here = id === s.place; ph += '<button type="button" class="pl' + (here ? ' here' : '') + (ok !== true ? ' lock' : '') + '" data-go="' + id + '" title="' + esc(ok === true ? LL.NOMS[id] : ok) + '">' + (LL.PLACES[id].icon || '') + ' ' + esc(LL.NOMS[id]) + (ok !== true ? ' 🔒' : '') + '</button>'; });
    $('places').innerHTML = ph;
    // actions
    var ah = ''; (LL.actsHere ? LL.actsHere() : []).forEach(function (a) { ah += '<button type="button" class="act' + (a.ok === true ? '' : ' off') + '" data-act="' + a.i + '" title="' + esc(a.ok === true ? a.label : a.ok) + '">' + esc(a.label) + (a.meta && a.meta.dur ? ' <small>' + a.meta.dur + ' min</small>' : '') + '</button>'; });
    $('actions').innerHTML = ah || '<p class="muted">Aucune action ici.</p>';
    // personnes
    var ppl = LL.M.npcs || [], peh = ''; ppl.forEach(function (n) { peh += '<button type="button" class="pp" data-person="' + n.id + '">' + esc(LL.M.CHARS[n.id].nom) + ' <small>' + (s.rel[n.id] != null ? Math.round(s.rel[n.id]) + ' %' : '') + '</small></button>'; });
    if (LL.M.moka.here) peh += '<button type="button" class="pp" data-cat="1">🐱 Moka <small>' + Math.round(s.rel.moka) + ' %</small></button>';
    $('people').innerHTML = peh ? '<span class="lbl">Ici :</span>' + peh : '';
    var av = LL.availableScenes ? LL.availableScenes().length : 0; $('b-story').textContent = '📖' + (av ? ' ' + av : ''); $('b-story').classList.toggle('pulse', av > 0);
    var lr = LL.lettresRecues(), unread = 0; for (var n = 1; n <= lr; n++) if (s.lisa.replies['lisa_' + n] == null) unread++; $('b-lisa').style.display = lr ? '' : 'none'; $('b-lisa').textContent = '💌' + (unread ? ' ' + unread : '');
    document.documentElement.style.setProperty('--ts', s.settings.textScale);
    document.body.classList.toggle('reduce', !!s.settings.reduce);
    if (LL.M.layoutBubbles) LL.M.layoutBubbles();
    LL.cleanNode($('app'));
  };

  /* ================= Fenêtre modale ================= */
  UI.open = function (kind, arg) {
    var m = $('modal'), b = $('mbody'); curModal = kind;
    try {
      var k = String(kind), p = k.indexOf(':'), base = p >= 0 ? k.slice(0, p) : k, sub = p >= 0 ? k.slice(p + 1) : arg;
      var fn = VIEWS[base]; if (!fn) { LL.toast('Écran indisponible.'); return; }
      b.innerHTML = ''; $('mtitle').textContent = ''; m.classList.add('on'); fn(b, sub); LL.cleanNode(m);
      setTimeout(function () { var f = m.querySelector('button, input, textarea'); if (f) f.focus(); }, 30);
    } catch (e) { LL.reportError(e); UI.close(); }
  };
  UI.close = function () { $('modal').classList.remove('on'); };
  function onModalClosed() { if (LL.PRONO) LL.PRONO.arreter(); clearChrono(); sceneIsOpen = false; curModal = null; LL.render(); setTimeout(function () { if (LL.checkStory) LL.checkStory(); }, 400); }
  UI.isOpen = function () { return $('modal').classList.contains('on'); };
  UI.sceneOpen = function () { return sceneIsOpen; };
  function title(t) { $('mtitle').textContent = t; }
  function btn(label, fn, cls) { var x = document.createElement('button'); x.type = 'button'; x.className = cls || 'mbtn'; x.innerHTML = label; x.addEventListener('click', function (ev) { ev.stopPropagation(); try { LL.son('click'); fn(ev); } catch (e) { LL.reportError(e); } }); return x; }
  function el(tag, cls, html) { var x = document.createElement(tag); if (cls) x.className = cls; if (html != null) x.innerHTML = html; return x; }
  function shuffled(n, seed) { var a = []; for (var i = 0; i < n; i++) a.push(i); var r = LL.K.seeded(seed || 7); for (var j = n - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t; } return a; }

  /* Portraits animés dans les scènes (drawPerson sur un petit canvas) */
  var portraits = [];
  function portraitCanvas(who, talkFn) { var c = document.createElement('canvas'), d = Math.min(2, window.devicePixelRatio || 1); c.width = 90 * d; c.height = 110 * d; c.className = 'portrait'; c.setAttribute('aria-hidden', 'true'); portraits.push({ c: c, who: who, d: d, talk: talkFn }); return c; }
  function drawPortraits() { portraits = portraits.filter(function (p) { return document.body.contains(p.c); }); portraits.forEach(function (p) { var g = p.c.getContext('2d'); g.setTransform(p.d, 0, 0, p.d, 0, 0); g.clearRect(0, 0, 90, 110); g.fillStyle = 'rgba(255,220,240,.6)'; g.beginPath(); g.arc(45, 60, 42, 0, 6.283); g.fill(); g.save(); g.translate(45, 178); g.scale(0.82, 0.82); LL.drawPerson(g, 0, 0, { who: p.who, dir: 1, talk: p.talk && p.talk(), noShadow: true }); g.restore(); }); }
  UI.tick = drawPortraits;

  /* Chronomètre (mini-épreuves) */
  var chrono = null;
  function clearChrono() { if (chrono) { clearInterval(chrono.id); chrono = null; } }
  function startChrono(sec, elx, onEnd) { clearChrono(); var end = Date.now() + sec * 1000; function tick() { var r = Math.max(0, Math.round((end - Date.now()) / 1000)); elx.textContent = '⏱️ ' + Math.floor(r / 60) + ':' + ('0' + r % 60).slice(-2); elx.classList.toggle('urgent', r < 30); if (r <= 0) { clearChrono(); onEnd(); } } tick(); chrono = { id: setInterval(tick, 500) }; }

  var VIEWS = {};
  /* ---------- Menu d'interaction avec un personnage ---------- */
  UI.personMenu = function (who) {
    UI.open('person', who);
  };
  VIEWS.person = function (b, who) {
    var c = LL.M.CHARS[who]; title(c.nom + (c.full ? ' (' + c.full + ')' : ''));
    var head = el('div', 'row'); head.appendChild(portraitCanvas(who)); head.appendChild(el('p', null, 'Lien : <b>' + (S().rel[who] != null ? Math.round(S().rel[who]) + ' %' : '—') + '</b><br><small>Le lien augmente une fois par jour et par type d\'interaction.</small>')); b.appendChild(head);
    var g = el('div', 'grid'); LL.kindsFor(who).forEach(function (k) { var x = btn(k.lbl, function () { UI.close(); LL.interact(who, k.k); }, 'mbtn' + (k.ok === true ? '' : ' off')); if (k.ok !== true) { x.title = k.ok; x.onclick = null; x.addEventListener('click', function () { LL.toast(k.ok); }); } g.appendChild(x); }); b.appendChild(g);
  };
  /* ---------- Choix préalables (télé, recettes) ---------- */
  UI.ask = function (what, cb) { UI.open('ask', { what: what, cb: cb }); };
  VIEWS.ask = function (b, o) {
    if (o.what === 'tv') { title('📺 Quelle chaîne ?'); var g = el('div', 'grid'); LL.M.CHAINES.forEach(function (c) { g.appendChild(btn(c.n + ' · ' + c.nom + (c.edu ? ' <small>+XP</small>' : ''), function () { UI.close(); o.cb(c.n); })); }); b.appendChild(g); }
    if (o.what === 'recette') { title('🍳 Que cuisiner ?'); var g2 = el('div', 'grid'); [['pates', '🍝 Pâtes'], ['omelette', '🍳 Omelette'], ['crepes', '🥞 Crêpes'], ['patisserie', '🧁 Pâtisserie (cupcakes)']].forEach(function (r) { g2.appendChild(btn(r[1], function () { UI.close(); o.cb(r[0]); })); }); b.appendChild(g2); }
  };
  /* ---------- Musique de la chambre ---------- */
  VIEWS.musique = function (b) {
    title('🎵 Enceinte de la chambre'); var st = LL.audio.STYLES, cur = el('p', 'muted', ''); b.appendChild(cur);
    function upd() { var m = LL.audio.musicStyle; cur.innerHTML = m ? '▶️ En lecture : <b>' + st[m].nom + '</b>' + (m === 'chill' ? ' — petit bonus de concentration pour les devoirs 🧠' : '') : '⏸️ En pause'; }
    var g = el('div', 'grid'); Object.keys(st).forEach(function (k) { g.appendChild(btn(st[k].nom, function () { LL.audioUnlock(); LL.musique(k); LL.add({ fun: 3 }); upd(); })); }); g.appendChild(btn('🔁 Ma playlist', function () { LL.audioUnlock(); LL.musique('playlist'); upd(); })); b.appendChild(g);
    var ctl = el('div', 'row'); ctl.appendChild(btn('⏯️ Lecture / pause', function () { if (LL.audio.musicStyle) LL.stopMusique(); else LL.musique('pop'); upd(); })); ctl.appendChild(btn('⏭️ Suivant', function () { LL.musiqueSuivante(); upd(); })); b.appendChild(ctl);
    b.appendChild(rangeRow('🎚️ Volume musique', S().settings.mus, function (v) { S().settings.mus = v; LL.audioVolumes(); }));
    b.appendChild(el('p', 'muted', 'La musique continue pendant que Lyham fait autre chose dans sa chambre ; elle s\'arrête si elle sort ou se couche. Toutes les mélodies sont générées par le jeu.')); upd();
  };
  function rangeRow(label, val, fn) { var r = el('label', 'range'); r.innerHTML = '<span>' + label + '</span>'; var i = document.createElement('input'); i.type = 'range'; i.min = 0; i.max = 100; i.value = Math.round(val * 100); i.addEventListener('input', function () { fn(i.value / 100); LL.save(); }); r.appendChild(i); return r; }
  /* ---------- Devoirs ---------- */
  VIEWS.devoirs = function (b) {
    title('📚 Devoirs du jour'); b.appendChild(el('p', null, 'Choisis une matière : 5 questions de ton niveau (' + LL.niveau(S().day) + ').' + (LL.audio.musicStyle === 'chill' ? ' 🎧 Musique chill : concentration +1 XP par bonne réponse.' : '')));
    var g = el('div', 'grid'); Object.keys(LL.MATIERES).forEach(function (m) { g.appendChild(btn(LL.MATIERES[m], function () { UI.open('quiz', m); })); }); g.appendChild(btn('🗣️ Prononciation (anglais)', function () { UI.open('prono'); })); b.appendChild(g);
  };
  /* ---------- Quiz ---------- */
  VIEWS.quiz = function (b, mat) {
    var qs = LL.quizPick(mat || null, 5), i = 0, score = 0; title('❓ ' + (mat ? 'Interro : ' + LL.MATIERES[mat] : 'Quiz du jour'));
    function show() {
      b.innerHTML = ''; if (i >= qs.length) return end();
      var q = qs[i]; b.appendChild(el('p', 'muted', 'Question ' + (i + 1) + '/' + qs.length + ' · ' + LL.MATIERES[q.m] + ' · ' + LL.NIV_NOMS[q.n]));
      b.appendChild(el('p', 'q', esc(q.q))); var g = el('div', 'grid1');
      q.c.forEach(function (c, k) { g.appendChild(btn(esc(c), function () { var ok = LL.quizAnswer(q, k); if (ok) score++; Array.prototype.forEach.call(g.children, function (x, j) { x.disabled = true; if (j === q.a) x.classList.add('good'); else if (j === k) x.classList.add('bad'); }); var fb = el('div', 'fb ' + (ok ? 'ok' : 'ko'), (ok ? '✅ Bravo !' : '❌ La bonne réponse était : <b>' + esc(q.c[q.a]) + '</b>') + '<br>' + esc(q.e)); b.appendChild(fb); b.appendChild(btn(i + 1 < qs.length ? 'Question suivante ➜' : 'Voir le résultat', function () { i++; show(); })); LL.render(); })); });
      b.appendChild(g);
    }
    function end() { var s = S(); b.appendChild(el('p', 'q', 'Résultat : <b>' + score + ' / ' + qs.length + '</b> ' + (score >= 4 ? '🌟' : score >= 3 ? '👍' : '💪'))); if (score >= 4) { s.flags.bonResultat = s.day; b.appendChild(el('p', null, '🏆 Excellent ! Tu peux montrer ce résultat à papa dans son bureau.')); } LL.add({ fun: score >= 3 ? 4 : -2, energie: -4 }); LL.pass(20); LL.save(); b.appendChild(btn('Fermer', UI.close)); }
    show();
  };
  /* ---------- Prononciation ---------- */
  VIEWS.prono = function (b) {
    title('🗣️ Prononciation anglaise'); var P = LL.PRONO, niv = LL.niveauIdx(S().day), list = P.pour(niv), themes = {};
    list.forEach(function (e) { (themes[e.theme] = themes[e.theme] || []).push(e); });
    b.appendChild(el('p', 'muted', (P.ecouteDispo() ? '🎤 Reconnaissance vocale disponible.' : '✋ Mode auto-évaluation (micro ou reconnaissance indisponible).') + ' Exercices débloqués jusqu\'au niveau ' + LL.NIV_NOMS[niv] + '.'));
    Object.keys(themes).forEach(function (t) { var d = el('details'); d.appendChild(el('summary', null, P.THEMES[t] + ' (' + themes[t].length + ')')); var g = el('div', 'grid'); themes[t].forEach(function (e) { var st = S().prono.done[e.id] || 0; g.appendChild(btn(esc(e.t) + ' <small>' + (st ? '⭐'.repeat(st) : '') + '</small>', function () { exo(e); })); }); d.appendChild(g); b.appendChild(d); });
    function exo(e) {
      b.innerHTML = ''; title('🗣️ ' + P.THEMES[e.theme]);
      var w = el('div', 'word', esc(e.t)); b.appendChild(w); b.appendChild(el('p', 'phon', esc(e.ph))); b.appendChild(el('p', 'tip', '💡 ' + esc(e.tip)));
      var r = el('div', 'row'); r.appendChild(btn('🔊 Écouter', function () { P.ecouter(e.t, false); LL.caption('🔊 « ' + e.t + ' »'); })); r.appendChild(btn('🐢 Lentement', function () { P.ecouter(e.t, true); LL.caption('🐢 « ' + e.t + ' »'); })); b.appendChild(r);
      var res = el('div', 'fb', ''), act = el('div', 'row'); b.appendChild(act); b.appendChild(res);
      function selfEval(msg) { act.innerHTML = ''; res.className = 'fb'; res.innerHTML = (msg ? esc(msg) + '<br>' : '') + '✋ Écoute, répète à voix haute, puis évalue-toi :'; ['facile', 'moyen', 'difficile'].forEach(function (n) { act.appendChild(btn({ facile: '😀 Facile', moyen: '😐 Moyen', difficile: '😣 Difficile' }[n], function () { var gain = P.autoEval(e.id, n); res.innerHTML = '✅ Noté (' + n + ') : +' + gain + ' XP anglais. ' + (n !== 'facile' ? esc(e.tip) : 'Bravo !'); LL.render(); })); }); }
      if (P.ecouteDispo()) {
        act.appendChild(btn('🎤 Répéter', function () {
          res.className = 'fb'; res.textContent = '⏳ Préparation du micro…';
          P.repeter(function () { res.textContent = '🎤 Parle maintenant !'; LL.caption('🎤 Le micro écoute…'); }, function (list) {
            var sc = P.score(e.t, list), html = ''; var disp = e.t; for (var k = 0; k < disp.length; k++) { var mk = sc.marks[k]; html += mk === false ? '<span class="bad">' + esc(disp[k]) + '</span>' : mk === true ? '<span class="good">' + esc(disp[k]) + '</span>' : esc(disp[k]); }
            var gain = P.valider(e.id, sc.stars); res.className = 'fb ' + (sc.stars >= 2 ? 'ok' : 'ko'); res.innerHTML = '<div class="stars">' + '⭐'.repeat(sc.stars) + '☆'.repeat(3 - sc.stars) + '</div><div class="word sm">' + html + '</div>Compris : « ' + esc(sc.best || '…') + ' » (' + Math.round(sc.sim * 100) + ' %)<br>💡 ' + esc(sc.advice) + '<br><small>+' + gain + ' XP anglais · les lettres en rouge sont à retravailler</small>'; LL.son(sc.stars >= 2 ? 'ok' : 'ko'); LL.render();
          }, function (code) { selfEval(code === 9 ? 'Micro refusé : pas de souci !' : code === -2 ? 'Pas de réponse du micro.' : 'Reconnaissance indisponible.'); });
        }));
        act.appendChild(btn('✋ M\'auto-évaluer', function () { selfEval(''); }));
      } else selfEval('');
      b.appendChild(btn('⬅️ Autres exercices', function () { UI.open('prono'); }, 'mbtn ghost'));
    }
  };
  /* ---------- Lettres de Lisa ---------- */
  VIEWS.lisa = function (b, n) {
    var s = S(), nb = LL.lettresRecues(); title('💌 Correspondance avec Lisa');
    if (!nb) { b.appendChild(el('p', null, 'Aucune lettre pour l\'instant.')); return; }
    if (n) return lettre(+n);
    b.appendChild(el('p', 'muted', nb + ' lettre(s) reçue(s) · Lien avec Lisa : ' + Math.round(s.rel.lisa) + ' %'));
    var g = el('div', 'grid1'); for (var k = nb; k >= Math.max(1, nb - 59); k--) (function (k) { var l = LL.lettre(k), rep = s.lisa.replies[l.id] != null; g.appendChild(btn((rep ? '✉️ ' : '🆕 ') + 'N°' + k + ' — ' + esc(l.titre) + ' <small>' + l.niveau + ' · ' + LL.dateTxt(LL.LISA_START + (k - 1) * 7) + '</small>', function () { lettre(k); })); })(k); b.appendChild(g);
    function lettre(k) {
      b.innerHTML = ''; var l = LL.lettre(k); s.lisa.read[l.id] = 1; title('💌 Lettre n°' + k + ' : ' + l.titre);
      var paper = el('div', 'letter'); var en = l.en + l.cond.filter(function (c) { return s.flags[c[0]]; }).map(function (c) { return ' ' + c[1]; }).join(''); var fr = l.fr + l.cond.filter(function (c) { return s.flags[c[0]]; }).map(function (c) { return ' ' + c[2]; }).join('');
      paper.innerHTML = '<p lang="en">' + esc(en) + '</p><p class="sign">— Lisa ✿</p>'; b.appendChild(paper);
      var help = el('p', 'help', '🇫🇷 ' + esc(fr)); help.style.display = 'none';
      var r = el('div', 'row'); r.appendChild(btn('🇫🇷 Aide en français', function () { help.style.display = help.style.display === 'none' ? '' : 'none'; })); r.appendChild(btn('🔊 Lire à voix haute', function () { LL.PRONO.ecouter(en, false); LL.caption('🔊 Lecture de la lettre de Lisa'); })); b.appendChild(r); b.appendChild(help);
      var done = s.lisa.replies[l.id];
      if (done != null) { var rr = l.replies[done]; b.appendChild(el('div', 'fb ok', '✉️ Ta réponse : « ' + esc(rr.en) + ' »' + (rr.note ? '<br>📝 ' + esc(rr.note) : ''))); }
      else {
        b.appendChild(el('p', 'q', '✍️ Compose ta réponse (choisis une phrase) :')); var order = shuffled(l.replies.length, k * 13), sel = null, news = null; var g2 = el('div', 'grid1');
        order.forEach(function (j) { var rp = l.replies[j]; var x = btn('<span lang="en">' + esc(rp.en) + '</span><br><small>' + esc(rp.fr) + '</small>', function () { sel = j; Array.prototype.forEach.call(g2.children, function (c) { c.classList.remove('sel'); }); x.classList.add('sel'); }); g2.appendChild(x); }); b.appendChild(g2);
        var nl = LL.nouvellesLyham(); b.appendChild(el('p', 'q', '➕ Ajoute une nouvelle de ta vie (facultatif) :')); var g3 = el('div', 'grid1'); nl.forEach(function (nw, j) { var x = btn('<span lang="en">' + esc(nw[0]) + '</span><br><small>' + esc(nw[1]) + '</small>', function () { news = news === j ? null : j; Array.prototype.forEach.call(g3.children, function (c, q) { c.classList.toggle('sel', q === news); }); }); g3.appendChild(x); }); b.appendChild(g3);
        b.appendChild(btn('📮 Envoyer ma lettre', function () { if (sel == null) { LL.toast('Choisis d\'abord une phrase de réponse ✍️'); return; } var rp = LL.repondreLisa(k, sel, news); LL.pass(20); b.innerHTML = ''; b.appendChild(el('div', 'fb ' + (rp.note ? 'ko' : 'ok'), '📮 Lettre envoyée ! ' + (rp.rel >= 4 ? 'Lisa va adorer ta réponse 💕' : rp.rel >= 2 ? 'Réponse correcte.' : 'Réponse un peu maladroite…') + (rp.note ? '<br>📝 ' + esc(rp.note) : ''))); b.appendChild(btn('⬅️ Toutes les lettres', function () { UI.open('lisa'); })); LL.render(); }, 'mbtn main'));
      }
      b.appendChild(btn('⬅️ Toutes les lettres', function () { UI.open('lisa'); }, 'mbtn ghost'));
    }
  };
  /* ---------- Exercices corrigés (brevet / bac) : rendu commun ---------- */
  function renderExercise(b, it, submit, opts) {
    opts = opts || {}; b.innerHTML = '';
    var meta = [it.type ? ({ fiche: '📄 Fiche de rappel', guide: '🧭 Exercice guidé', auto: '💪 Entraînement autonome', chrono: '⏱️ Mini-épreuve chronométrée', bilan: '📊 Bilan', diag: '🔎 Diagnostic', reprise: '🔁 Reprise d\'erreurs', oral: '🎧 Compréhension orale' }[it.type] || '') : '', it.diff ? 'Difficulté ' + '●'.repeat(it.diff) + '○'.repeat(3 - it.diff) : '', it.duree ? '⌛ ' + it.duree + ' min' : '', it.xp ? '+' + it.xp + ' XP' : ''].filter(Boolean).join(' · ');
    b.appendChild(el('p', 'muted', esc(meta))); b.appendChild(el('h3', null, esc(it.titre))); b.appendChild(el('p', 'q', esc(it.consigne)));
    var timerEl = el('div', 'timer', ''); if (it.timer && !opts.review) { b.appendChild(timerEl); }
    if (it.audio) { var ar = el('div', 'row'); ar.appendChild(btn('🔊 Écouter l\'enregistrement', function () { LL.PRONO.ecouter(it.audio, false); LL.caption('🎧 Enregistrement en anglais'); })); ar.appendChild(btn('🐢 Plus lentement', function () { LL.PRONO.ecouter(it.audio, true); })); ar.appendChild(btn('📝 Transcription (si pas de son)', function () { tr.style.display = ''; })); b.appendChild(ar); var tr = el('p', 'help', '<span lang="en">' + esc(it.audio) + '</span>'); tr.style.display = 'none'; b.appendChild(tr); }
    var zone = el('div'), fbk = el('div'), sent = false; b.appendChild(zone); b.appendChild(fbk);
    function correction(res) {
      sent = true; clearChrono(); zone.querySelectorAll('button,input,textarea').forEach(function (x) { if (!x.classList.contains('keep')) x.disabled = true; });
      fbk.appendChild(el('div', 'fb ' + (res.ok ? 'ok' : 'ko'), (res.invalid ? '⚠️ Réponse illisible (écris un nombre, ex. 0,25). ' : '') + (res.ok ? '✅ Réussi !' : '❌ À retravailler.') + (res.score != null && it.kind !== 'qcm' && it.kind !== 'num' ? ' Score : ' + Math.round(res.score * 100) + ' %' : '') + (res.xp != null ? ' · +' + res.xp + ' XP' : '') + (res.bonus ? ' · bonus de concentration +' + res.bonus : '')));
      if (it.kind === 'qcm') fbk.appendChild(el('p', null, '✔️ Réponse attendue : <b>' + esc(it.options[it.answer]) + '</b>')); if (it.kind === 'num') fbk.appendChild(el('p', null, '✔️ Réponse attendue : <b>' + String(it.answer).replace('.', ',') + '</b>'));
      fbk.appendChild(el('div', 'corr', '<b>📘 Correction détaillée :</b> ' + esc(it.correction) + '<br><b>🧭 Méthode :</b> ' + esc(it.methode) + (it.erreurs ? '<br><b>⚠️ Erreur fréquente :</b> ' + esc(it.erreurs) : '')));
      if (opts.after) fbk.appendChild(opts.after);
    }
    function send(payload) { if (sent) return; var res = submit(payload); correction(res || { ok: false }); LL.render(); }
    if (it.kind === 'qcm') { var g = el('div', 'grid1'); it.options.forEach(function (o, k) { g.appendChild(btn(esc(o), function () { Array.prototype.forEach.call(g.children, function (x, j) { if (j === it.answer) x.classList.add('good'); else if (j === k) x.classList.add('bad'); }); send(k); })); }); zone.appendChild(g); if (it.timer) startChrono(it.timer, timerEl, function () { if (!sent) { LL.toast('⏱️ Temps écoulé !'); send(-1); } }); }
    else if (it.kind === 'num') { var row = el('div', 'row'), inp = document.createElement('input'); inp.type = 'text'; inp.inputMode = 'decimal'; inp.placeholder = 'Ta réponse (ex. 0,25)'; inp.setAttribute('aria-label', 'Ta réponse'); row.appendChild(inp); row.appendChild(btn('Valider', function () { send(inp.value); }, 'mbtn main')); zone.appendChild(row); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(inp.value); } }); if (opts.draft) inp.value = opts.draft; inp.addEventListener('input', function () { if (opts.onDraft) opts.onDraft(inp.value); }); if (it.timer) startChrono(it.timer, timerEl, function () { if (!sent) { LL.toast('⏱️ Temps écoulé !'); send(inp.value); } }); }
    else if (it.kind === 'open') {
      var ta = document.createElement('textarea'); ta.rows = 6; ta.placeholder = it.type === 'bilan' ? 'Note ici tes réflexions (facultatif)…' : 'Rédige ta réponse ici (brouillon conservé)…'; ta.setAttribute('aria-label', 'Ta réponse'); if (opts.draft) ta.value = opts.draft; ta.addEventListener('input', function () { if (opts.onDraft) opts.onDraft(ta.value); hints(); }); zone.appendChild(ta);
      var hint = el('p', 'muted', ''); zone.appendChild(hint);
      function hints() { var t = ta.value, w = t.trim() ? t.trim().split(/\s+/).length : 0, h = [w + ' mot(s)']; if (/\?/.test(t)) h.push('✔️ contient une question'); if (/(cependant|mais|pourtant|however|although|whereas)/i.test(t)) h.push('✔️ connecteur d\'opposition'); if (/(par exemple|ex\.|for example|for instance)/i.test(t)) h.push('✔️ exemple annoncé'); hint.textContent = 'Indices automatiques : ' + h.join(' · '); }
      hints();
      var step2 = btn('➜ J\'ai fini : voir la grille de critères', function () { step2.style.display = 'none'; clearChrono(); grid(); });
      zone.appendChild(step2);
      function grid() { zone.appendChild(el('p', 'q', '📋 Grille d\'évaluation : coche honnêtement chaque critère présent dans ta réponse (il n\'y a pas UNE formulation attendue).')); var boxes = []; it.criteria.forEach(function (c) { var l = el('label', 'crit'), cb = document.createElement('input'); cb.type = 'checkbox'; l.appendChild(cb); l.appendChild(document.createTextNode(' ' + c)); zone.appendChild(l); boxes.push(cb); }); zone.appendChild(el('div', 'corr', '<b>Exemple de réponse possible :</b> ' + esc(it.correction))); zone.appendChild(btn('Valider ma grille', function () { send({ checked: boxes.map(function (x) { return x.checked; }), text: ta.value }); }, 'mbtn main')); }
      if (it.timer) startChrono(it.timer, timerEl, function () { if (!sent && step2.style.display !== 'none') { LL.toast('⏱️ Temps écoulé : passe à la grille !'); step2.style.display = 'none'; grid(); } });
    }
    else if (it.kind === 'prono') {
      var stars = {}; var P = LL.PRONO; it.refs.forEach(function (id) { var e = P.EXOS.filter(function (x) { return x.id === id; })[0]; var box = el('div', 'pbox'); box.appendChild(el('div', 'word sm', esc(e.t))); box.appendChild(el('p', 'phon', esc(e.ph) + ' — ' + esc(e.tip))); var r = el('div', 'row'), out = el('span', 'muted', ''); r.appendChild(btn('🔊', function () { P.ecouter(e.t, false); }, 'mbtn keep')); r.appendChild(btn('🐢', function () { P.ecouter(e.t, true); }, 'mbtn keep'));
        if (P.ecouteDispo()) r.appendChild(btn('🎤 Répéter', function () { out.textContent = '⏳'; P.repeter(function () { out.textContent = '🎤 Parle !'; }, function (l) { var sc = P.score(e.t, l); stars[id] = sc.stars; out.textContent = '⭐'.repeat(sc.stars) + ' « ' + (sc.best || '…') + ' »'; }, function () { out.textContent = 'Indisponible : auto-évalue-toi →'; }); }, 'mbtn keep'));
        ['😀', '😐', '😣'].forEach(function (f, q) { r.appendChild(btn(f, function () { stars[id] = 3 - q; out.textContent = 'Auto-évaluation : ' + '⭐'.repeat(3 - q); }, 'mbtn keep')); });
        r.appendChild(out); box.appendChild(r); zone.appendChild(box); });
      zone.appendChild(el('p', 'muted', '🎤 = reconnaissance vocale ; 😀 / 😐 / 😣 = auto-évaluation (Facile / Moyen / Difficile) si pas de micro.'));
      zone.appendChild(btn('Valider l\'exercice', function () { send({ stars: it.refs.map(function (id) { return stars[id] || 0; }) }); }, 'mbtn main'));
    }
    if (opts.review && opts.prev) fbk.appendChild(el('p', 'muted', 'Déjà fait : ' + (opts.prev.ok ? '✅' : '❌') + ' (' + Math.round((opts.prev.score || 0) * 100) + ' %). Tu peux le refaire : l\'XP n\'est plus donné en entier.'));
  }
  UI.renderExercise = renderExercise;
  /* ---------- Semaine du brevet ---------- */
  VIEWS.brevet = function (b, d) {
    var cur = LL.brevetDay(); d = +d || cur; title('📝 Préparation du brevet — jour ' + d + '/7');
    var tabs = el('div', 'row'); for (var k = 1; k <= 7; k++) (function (k) { var done = LL.brevetItems(k).every(function (x) { return S().brevet.done[x.id]; }); var t = btn('J' + k + (done ? ' ✅' : ''), function () { if (k > cur) { LL.toast('Ce jour n\'est pas encore arrivé 📅'); return; } UI.open('brevet', k); }, 'tab' + (k === d ? ' on' : '') + (k > cur ? ' off' : '')); tabs.appendChild(t); })(k); b.appendChild(tabs);
    b.appendChild(el('p', 'muted', 'Format du brevet (depuis 2026) : français 3 h (compréhension, grammaire, dictée, rédaction) ; maths 2 h (automatismes sans calculatrice, puis problèmes).'));
    var g = el('div', 'grid1'); LL.brevetItems(d).forEach(function (it) { var dn = S().brevet.done[it.id]; g.appendChild(btn((it.mat === 'fr' ? '📘 Français' : '📐 Maths') + ' — ' + esc(it.titre) + (dn ? (dn.ok ? ' ✅' : ' 🔁') : ''), function () { var host = b; host.innerHTML = ''; renderExercise(host, it, function (p) { return LL.brevetSubmit(it, p); }, { review: !!dn, prev: dn, after: btn('⬅️ Retour au jour ' + d, function () { UI.open('brevet', d); }, 'mbtn keep') }); })); }); b.appendChild(g);
    if (d === 7 && LL.brevetItems(7).every(function (x) { return S().brevet.done[x.id]; })) b.appendChild(el('div', 'fb ok', '🎉 Semaine terminée ! Tu es prête pour le brevet. Bonne chance, Lyham !'));
  };
  /* ---------- Révisions du bac : 14 journées ---------- */
  function revWhere() { var p = S().place; return p === 'cdi' ? 'cdi' : p === 'bureau' ? 'papa' : p === 'chez_elynn' ? 'amies' : 'chambre'; }
  VIEWS.bac = function (b, d) {
    var B = S().bacRevision, cur = LL.inBacRevision(S().day) ? S().day - LL.BAC_REV_START + 1 : B.day; d = +d || cur; var day = LL.BAC_REVISION.days[d - 1];
    title('🎓 Révisions du bac — jour ' + d + '/14');
    var gz = el('div', 'prep'); [['philo', '🦉 Philo'], ['anglais', '🇬🇧 Anglais'], ['maths', '📐 Maths']].forEach(function (p) { gz.innerHTML += '<div class="gauge"><span>' + p[1] + '</span><b>' + Math.round(B.prep[p[0]]) + '</b><i style="width:' + B.prep[p[0]] + '%"></i></div>'; }); gz.innerHTML += '<div class="gauge"><span>😌 Confiance</span><b>' + Math.round(B.confiance) + '</b><i style="width:' + B.confiance + '%"></i></div>'; b.appendChild(gz);
    var tabs = el('div', 'row scroll'); for (var k = 1; k <= 14; k++) (function (k) { var pr = LL.bacDayProgress(k); tabs.appendChild(btn('J' + k + (pr.done === pr.total ? '✅' : pr.done ? '·' + pr.done : ''), function () { if (k > cur) { LL.toast('Les journées se jouent dans l\'ordre 📅'); return; } UI.open('bac', k); }, 'tab' + (k === d ? ' on' : '') + (k > cur ? ' off' : ''))); })(k); b.appendChild(tabs);
    b.appendChild(el('p', null, '<b>' + esc(day.theme) + '</b><br><small>Lieu : ' + { chambre: '🛏️ chambre', cdi: '📚 CDI (+1 concentration)', papa: '💼 avec papa (+2 en maths)', amies: '🌳 avec les amies (+confiance)' }[revWhere()] + (LL.audio.musicStyle === 'chill' && S().place === 'chambre' ? ' · 🎧 musique chill : +1 concentration' : '') + '</small>'));
    if (d === 1) b.appendChild(el('div', 'fb', '🗺️ ' + esc(LL.bacPlan())));
    var mats = { philo: '🦉 Philosophie', anglais: '🇬🇧 Anglais', maths: '📐 Mathématiques' };
    Object.keys(mats).forEach(function (m) { b.appendChild(el('h3', null, mats[m])); var g = el('div', 'grid1'); LL.bacDayItems(d).filter(function (a) { return a.mat === m; }).forEach(function (it) { var dn = B.done[it.id]; g.appendChild(btn((dn ? (dn.ok ? '✅ ' : '🔁 ') : '▫️ ') + esc(it.titre) + ' <small>' + (it.timer ? '⏱️ ' : '') + it.duree + ' min · +' + it.xp + ' XP</small>', function () { openItem(it, d); })); }); b.appendChild(g); });
    if (B.errors.length) { b.appendChild(el('h3', null, '🔁 Erreurs à revoir (' + B.errors.length + ')')); var ge = el('div', 'grid1'); B.errors.slice(-12).forEach(function (id) { var it = LL.bacItem(id); if (it && it.day <= cur) ge.appendChild(btn('J' + it.day + ' · ' + esc(it.titre), function () { openItem(it, d); })); }); b.appendChild(ge); }
    var pr = LL.bacDayProgress(d); if (pr.done === pr.total) b.appendChild(btn('📊 Bilan de la journée ' + d, function () { bilan(d); }, 'mbtn main'));
    else b.appendChild(el('p', 'muted', 'Progression du jour : ' + pr.done + '/' + pr.total + ' activités. Ta progression est sauvegardée à chaque exercice.'));
    function openItem(it, d0) { var B2 = S().bacRevision; B2.current = { id: it.id, draft: (B2.current && B2.current.id === it.id) ? B2.current.draft : '' }; LL.save(); b.innerHTML = ''; title('🎓 Jour ' + it.day + ' — ' + mats[it.mat]); renderExercise(b, it, function (p) { var r = LL.bacSubmit(it, p, revWhere()); LL.pass(Math.min(30, it.duree)); return r; }, { review: !!B2.done[it.id], prev: B2.done[it.id], draft: B2.current.draft, onDraft: function (v) { B2.current = { id: it.id, draft: String(v).slice(0, 4000) }; }, after: btn('⬅️ Retour au jour ' + d0, function () { UI.open('bac', d0); }, 'mbtn keep') }); }
    function bilan(d0) { var bl = LL.bacBilan(d0), Bb = S().bacRevision; Bb.bilans[d0] = Bb.bilans[d0] || S().day; b.innerHTML = ''; title('📊 Bilan du jour ' + d0 + (d0 === 7 ? ' — mi-parcours' : d0 === 14 ? ' — final' : ''));
      Object.keys(mats).forEach(function (m) { b.appendChild(el('p', null, mats[m] + ' : ' + bl[m].faits + '/' + bl[m].total + ' activités · réussite ' + Math.round(bl[m].moy * 100) + ' % · préparation ' + Math.round(Bb.prep[m]) + '/100')); });
      b.appendChild(el('p', null, '✔️ Acquis du jour : ' + esc(LL.BAC_REVISION.days[d0 - 1].theme)));
      b.appendChild(el('p', null, bl.erreurs.length ? '🔁 Erreurs à revoir : ' + bl.erreurs.map(function (id) { var it = LL.bacItem(id); return it ? 'J' + it.day + ' ' + esc(it.titre) : ''; }).join(' · ') : '🌟 Aucune erreur en attente !'));
      if (d0 === 7) b.appendChild(el('div', 'fb', '🧭 Mi-parcours : ' + esc(LL.bacPlan()) + ' Le jour 8 reprend tes erreurs en priorité.'));
      if (d0 === 14) { b.appendChild(el('div', 'fb ok', '🌙 Les 14 jours sont terminés. Demain : l\'épreuve de philosophie (4 h, coef. 8). Rappel : l\'anglais est évalué en contrôle continu ; ces révisions consolident ton niveau.')); }
      b.appendChild(btn('⬅️ Retour', function () { UI.open('bac', d0); })); LL.save(); }
  };
  /* ---------- Boutiques ---------- */
  var SHOPS = {
    boutique: [['robe', 'outfit', 25], ['danse', 'outfit', 20], ['ete', 'outfit', 18], ['bal', 'outfit', 60], ['chouchou', 'item', 3], ['livre', 'item', 6], ['carte', 'item', 2]],
    boulangerie: [['croissant', 'item', 1], ['cupcake', 'item', 2], ['bonbons', 'item', 1]],
    marche: [['fruit', 'item', 3], ['fleurs', 'item', 4], ['graines', 'item', 2]]
  };
  VIEWS.shop = function (b, which) {
    var s = S(), list = SHOPS[which] || SHOPS.boutique; title({ boutique: '🛍️ Boutiques', boulangerie: '🥐 Boulangerie Dorée', marche: '🧺 Marché' }[which] || '🛍️ Boutique');
    var info = el('p', 'muted', 'Argent de poche : ' + s.money + ' 💰'); b.appendChild(info); var g = el('div', 'grid1');
    list.forEach(function (it) { var nom = it[1] === 'outfit' ? LL.OUTFITS[it[0]].nom : LL.ITEMS[it[0]], owned = it[1] === 'outfit' && s.outfits.indexOf(it[0]) >= 0; g.appendChild(btn((it[1] === 'outfit' ? '👗 ' : '') + esc(nom) + ' — ' + it[2] + ' 💰' + (owned ? ' (déjà à toi)' : it[1] === 'item' ? ' (stock : ' + (s.inv[it[0]] || 0) + ')' : ''), function () { if (owned) { LL.toast('Tu l\'as déjà !'); return; } if (!LL.money(-it[2])) { LL.toast('Pas assez d\'argent de poche 😕 (services : ranger, vaisselle…)'); LL.son('ko'); return; } if (it[1] === 'outfit') s.outfits.push(it[0]); else LL.giveItem(it[0]); LL.add({ fun: 4 }); LL.pass(10); LL.log('🛍️ Achat : ' + nom); LL.toast('✅ Acheté : ' + nom); UI.open('shop', which); })); });
    b.appendChild(g);
  };
  VIEWS.dressing = function (b) { var s = S(); title('👗 Dressing'); var g = el('div', 'grid'); s.outfits.forEach(function (k) { var o = LL.OUTFITS[k]; g.appendChild(btn('<span class="sw" style="background:' + o.top + '"></span> ' + esc(o.nom) + (s.outfit === k ? ' ✔️' : ''), function () { s.outfit = k; LL.son('swoosh'); LL.M.burst(LL.M.L.x, LL.M.L.y - 100, '✨', 6); LL.save(); UI.open('dressing'); })); }); b.appendChild(g); b.appendChild(el('p', 'muted', 'D\'autres tenues t\'attendent aux boutiques (robe, tenue d\'été, robe de bal…). La toge se débloque après le bac !')); };
  /* ---------- Épisodes, album, journal, stats, réglages ---------- */
  VIEWS.story = function (b) { title('📖 Épisodes à vivre'); var av = LL.availableScenes(), dv = Object.keys(S().events).filter(function (k) { return k.indexOf('daryl_') === 0 && S().events[k] === 'available'; }); if (!av.length && !dv.length) b.appendChild(el('p', null, 'Aucun épisode en attente. Continue à vivre ta vie, d\'autres arriveront ! 🌸')); var g = el('div', 'grid1'); av.forEach(function (s) { g.appendChild(btn(esc(LL.sceneTitre(s)) + ' <small>' + LL.dateTxt(s.from) + (s.lieu ? ' · ' + esc(LL.NOMS[s.lieu]) : '') + '</small>', function () { UI.playScene(s.id); })); }); dv.forEach(function (id) { g.appendChild(btn('🎮 Visite de Daryl', function () { UI.playScene(id); })); }); b.appendChild(g); var c = LL.STATS_HISTOIRE(), done = Object.keys(S().events).filter(function (k) { return S().events[k] === 'done'; }).length; b.appendChild(el('p', 'muted', done + ' épisode(s) vécus · ' + c.famille + ' événements familiaux, ' + c.amitie + ' scènes d\'amitié (dont ' + c.episodes + ' épisodes), ' + c.anniv + ' scènes d\'anniversaire.')); };
  VIEWS.album = function (b) { title('📔 Album de famille'); var sv = (S().flags.souvenirs || []).slice().reverse(); b.appendChild(el('p', 'muted', 'Chaque choix important laisse un souvenir ici.')); if (!sv.length) b.appendChild(el('p', null, 'L\'album est encore vide… Les souvenirs arriveront avec les épisodes. 📷')); var ul = el('ul', 'album'); sv.slice(0, 150).forEach(function (x) { ul.appendChild(el('li', null, '<small>' + LL.dateTxt(x.d) + '</small><br>' + esc(x.t))); }); b.appendChild(ul); };
  VIEWS.journal = function (b) { title('📒 Journal'); var ul = el('ul', 'album'); S().journal.slice(-80).reverse().forEach(function (j) { ul.appendChild(el('li', null, '<small>' + LL.dateTxt(j.d) + ' · ' + LL.hhmm(j.m) + '</small><br>' + esc(j.t))); }); b.appendChild(ul); };
  VIEWS.stats = function (b) { var s = S(); title('⭐ Compétences & liens'); var h = '<h3>Compétences</h3>'; LL.SKILLS.forEach(function (k) { var xp = s.skills[k], lv = LL.level(xp), nx = 12 * lv * lv, pv = 12 * (lv - 1) * (lv - 1), pc = Math.round((xp - pv) / (nx - pv) * 100); h += '<div class="gauge"><span>' + LL.SKILL_NOMS[k] + ' · niv. ' + lv + '</span><b>' + Math.round(xp) + ' XP</b><i style="width:' + pc + '%"></i></div>'; }); h += '<h3>Liens</h3>'; LL.RELS.forEach(function (k) { if (k === 'lisa' && s.day < LL.LISA_START) return; h += '<div class="gauge"><span>' + ({ casimir: '👨 Papa (Casimir)', tania: '👩 Maman (Tania)', daryl: '🎮 Daryl', moka: '🐱 Moka', cataleya: '💛 Cataleya', elynn: '💚 Elynn', lisa: '💌 Lisa', noah: '⚽ Noah', lopez: '🩰 Mme Lopez' }[k]) + '</span><b>' + Math.round(s.rel[k]) + ' %</b><i style="width:' + s.rel[k] + '%"></i></div>'; }); h += '<h3>Inventaire</h3><p>' + (Object.keys(s.inv).length ? Object.keys(s.inv).map(function (k) { return LL.ITEMS[k] + ' ×' + s.inv[k]; }).join(' · ') : 'Inventaire vide.') + '</p>'; b.innerHTML = h; };
  VIEWS.settings = function (b) { var s = S(); title('⚙️ Réglages'); var r1 = el('div', 'row'); r1.appendChild(btn(s.settings.muted ? '🔇 Son coupé — activer' : '🔊 Son activé — couper', function () { LL.toggleMute(); UI.open('settings'); LL.render(); })); b.appendChild(r1);
    b.appendChild(rangeRow('🔔 Volume des effets', s.settings.sfx, function (v) { s.settings.sfx = v; LL.audioVolumes(); })); b.appendChild(rangeRow('🎵 Volume de la musique', s.settings.mus, function (v) { s.settings.mus = v; LL.audioVolumes(); }));
    var r2 = el('div', 'row'); r2.appendChild(btn((s.settings.reduce ? '✅' : '⬜') + ' Réduire les animations', function () { s.settings.reduce = !s.settings.reduce; LL.save(); UI.open('settings'); LL.render(); })); r2.appendChild(btn('🔠 Texte : ' + Math.round(s.settings.textScale * 100) + ' %', function () { s.settings.textScale = s.settings.textScale >= 1.4 ? 0.9 : Math.round((s.settings.textScale + 0.15) * 100) / 100; LL.save(); UI.open('settings'); LL.render(); })); b.appendChild(r2);
    if (s.flags.micRefuse) b.appendChild(btn('🎤 Réessayer le micro (prononciation)', function () { delete s.flags.micRefuse; LL.save(); LL.toast('Le micro sera redemandé au prochain exercice.'); }));
    b.appendChild(el('p', 'muted', 'Le micro sert uniquement aux exercices de prononciation : il s\'active quand tu appuies sur « Répéter » et s\'arrête juste après. Rien n\'est enregistré.'));
    b.appendChild(btn('🗑️ Nouvelle partie', function () { var c = el('div', 'fb ko', 'Effacer la sauvegarde et recommencer en 4e ?'); c.appendChild(btn('Oui, nouvelle partie', LL.newGame, 'mbtn main')); c.appendChild(btn('Annuler', function () { UI.open('settings'); })); b.appendChild(c); }, 'mbtn ghost'));
    b.appendChild(el('p', 'muted', 'Lyham Life 1.0 · sauvegarde automatique toutes les 15 s, à chaque changement de lieu et au coucher.')); };
  VIEWS.menu = function (b) { title('☰ Menu'); var g = el('div', 'grid'); [['📒 Journal', 'journal'], ['⭐ Compétences & liens', 'stats'], ['📖 Épisodes', 'story'], ['📔 Album', 'album'], ['⚙️ Réglages', 'settings'], ['❔ Aide', 'aide']].forEach(function (x) { g.appendChild(btn(x[0], function () { UI.open(x[1]); })); }); b.appendChild(g); };
  VIEWS.aide = function (b) { title('❔ Comment jouer'); b.innerHTML = '<p>👆 Touche le sol pour faire marcher Lyham. Touche une <b>bulle</b> au-dessus d\'un objet pour faire une action, ou utilise les boutons sous la scène.</p><p>👥 Touche un personnage pour discuter, faire un câlin, danser, faire un selfie…</p><p>🕐 Chaque action prend du temps. Les jauges baissent : mange, dors, amuse-toi, vois tes amies, lave-toi !</p><p>📚 Devoirs, quiz et prononciation sont sur le bureau de la chambre. Les lettres de Lisa arrivent chaque lundi à partir de la 3e.</p><p>📖 Les épisodes de l\'histoire se déclenchent selon la date : retrouve-les dans le bouton 📖.</p>'; };
  /* ---------- Lecture d'une scène d'histoire ---------- */
  UI.playScene = function (id) {
    var sc = LL.storyById(id); if (!sc || LL.storyStatus(id) === 'done') return;
    sceneIsOpen = true; UI.open('scene', sc);
  };
  VIEWS.scene = function (b, sc) {
    sceneIsOpen = true; title(LL.sceneTitre(sc)); var cast = ['lyham'].concat(sc.cast || []); var speaking = { who: null };
    var stage = el('div', 'stage'); cast.forEach(function (w) { stage.appendChild(portraitCanvas(w, function () { return speaking.who === w; })); }); b.appendChild(stage);
    var box = el('div', 'dialog'), nameEl = el('b', 'who', ''), txt = el('p', 'say', ''), nav = el('div', 'row'); box.appendChild(nameEl); box.appendChild(txt); b.appendChild(box); b.appendChild(nav);
    var lines = sc.lines.map(function (l) { var t = LL.lineText(l); return t ? [l[0], t] : null; }).filter(Boolean), i = 0;
    function say(l) { speaking.who = l[0]; nameEl.textContent = l[0] === 'lyham' ? 'Lyham' : LL.M.CHARS[l[0]] ? LL.M.CHARS[l[0]].nom : l[0]; txt.textContent = l[1]; LL.son('voix_' + (LL.M.CHARS[l[0]] && LL.M.CHARS[l[0]].voice || l[0])); setTimeout(function () { if (speaking.who === l[0]) speaking.who = null; }, Math.min(2500, 300 + l[1].length * 40)); }
    function next() { nav.innerHTML = ''; if (i < lines.length) { say(lines[i++]); nav.appendChild(btn('Suivant ➜', next, 'mbtn main')); return; } choices(); }
    function choices() { nameEl.textContent = 'À toi de choisir :'; txt.textContent = ''; speaking.who = null; sc.choices.forEach(function (c, k) { nav.appendChild(btn(esc(c[0]), function () { var ch = LL.applyChoice(sc, k); nav.innerHTML = ''; var rl = (ch && ch[2] || []).map(function (l) { var t = LL.lineText(l); return t ? [l[0], t] : null; }).filter(Boolean), j = 0; function rnext() { nav.innerHTML = ''; if (j < rl.length) { say(rl[j++]); nav.appendChild(btn('Suivant ➜', rnext, 'mbtn main')); return; } nameEl.textContent = '📔 Souvenir ajouté à l\'album'; txt.textContent = ch[3] || ''; speaking.who = null; nav.appendChild(btn(sc.final ? 'Voir la fin 🎓' : 'Continuer', function () { sceneIsOpen = false; if (sc.final) { S().ended = true; LL.save(); UI.open('fin'); } else UI.close(); }, 'mbtn main')); LL.render(); } rnext(); }, 'mbtn choice')); }); }
    next();
  };
  VIEWS.fin = function (b) { title('🎓 Fin de l\'histoire'); LL.son('fanfare'); LL.S.outfit = 'toge'; LL.conclusion().forEach(function (p) { b.appendChild(el('p', null, esc(p))); }); var r = el('div', 'row'); r.appendChild(btn('🌸 Continuer à explorer', UI.close, 'mbtn main')); r.appendChild(btn('🔄 Nouvelle partie', LL.newGame)); b.appendChild(r); };

  /* ================= Nouveau jour : lettres de Lisa, rappels ================= */
  var lastLetters = -1;
  LL.onNewDay = function () { var s = S(), n = LL.lettresRecues(); if (lastLetters >= 0 && n > lastLetters) { LL.son('lettre'); LL.toast('💌 Nouvelle lettre de Lisa ! (bureau de ta chambre)'); } lastLetters = n; LL.toast('☀️ ' + LL.dateTxt(s.day) + (LL.isSchoolDay(s.day) ? ' — journée de cours' : '')); if (LL.inBacRevision(s.day) && s.day === LL.BAC_REV_START) LL.toast('🎓 Les 14 jours de révisions du bac commencent ! (bureau de la chambre)'); if (LL.inBrevetWeek(s.day) && s.day === LL.BREVET_PREP) LL.toast('📝 Semaine de préparation du brevet ! (bureau de la chambre)'); LL.render(); if (LL.checkStory) setTimeout(LL.checkStory, 600); };

  /* ================= Démarrage (une seule fois, après DOMContentLoaded) ================= */
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    LL.load(); lastLetters = LL.lettresRecues();
    // lieux de révision supplémentaires (CDI, papa, amies) pendant les révisions
    var base = LL.UNLOCK.cdi; LL.UNLOCK.cdi = function (s) { if (LL.inBacRevision(s.day) && s.min >= 540 && s.min < 1080) return true; return base(s); };
    LL.ACTS.cdi.push(['🎓 Réviser le bac au CDI', function () { UI.open('bac'); }, function (s) { return LL.inBacRevision(s.day) ? true : 'Pendant les révisions du bac seulement.'; }, { id: 'cdi_bac', dur: 0 }]);
    LL.ACTS.bureau.push(['🎓 Réviser avec papa (pause)', function () { UI.open('bac'); }, function (s) { if (!LL.inBacRevision(s.day)) return 'Pendant les révisions du bac seulement.'; if (LL.presence('bureau').indexOf('casimir') < 0) return 'Papa n\'est pas là.'; if (LL.papaAuBureau() && !LL.papaEnPause()) return 'Papa travaille. Sa pause : 10 h 45 – 11 h et 16 h – 16 h 15 ⏰'; return true; }, { id: 'bureau_bac', dur: 0 }]);
    LL.ACTS.chez_elynn.push(['🎓 Réviser avec les amies', function () { UI.open('bac'); }, function (s) { return LL.inBacRevision(s.day) ? true : 'Pendant les révisions du bac seulement.'; }, { id: 'elynn_bac', dur: 0 }]);
    LL.M.start(); LL.M.enterPlace(S().place, 'left'); LL.M.L.x = LL.clamp(S().lx, 60, 900); LL.M.L.moving = false; LL.M.fade = 1;
    // Délégation d'événements : handlers ajoutés une seule fois
    document.body.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('button') : null; if (!t || t.closest('#modal')) return;
      try {
        if (t.dataset.go) { LL.son('click'); zoneTab = null; LL.go(t.dataset.go); }
        else if (t.dataset.zone) { LL.son('click'); zoneTab = t.dataset.zone; LL.render(); }
        else if (t.dataset.act != null) { LL.son('click'); LL.act(+t.dataset.act); }
        else if (t.dataset.person) { LL.son('click'); UI.personMenu(t.dataset.person); }
        else if (t.dataset.cat) { var i = LL.findAct('Caresser Moka'); if (i >= 0) LL.act(i); else LL.toast('😺 Moka ronronne.'); }
        else if (t.id === 'b-mute') { LL.audioUnlock(); LL.toggleMute(); LL.render(); }
        else if (t.id === 'b-menu') UI.open('menu');
        else if (t.id === 'b-story') UI.open('story');
        else if (t.id === 'b-lisa') UI.open('lisa');
        else if (t.id === 'b-stats') UI.open('stats');
      } catch (e) { LL.reportError(e); }
    });
    $('mclose').addEventListener('click', function () { LL.son('click'); UI.close(); });
    $('modal').addEventListener('click', function (ev) { if (ev.target === $('modal') && !sceneIsOpen) UI.close(); });
    new MutationObserver(function () { if (!$('modal').classList.contains('on')) onModalClosed(); }).observe($('modal'), { attributes: true, attributeFilter: ['class'] });
    var cleaning = false; new MutationObserver(function () { if (cleaning) return; cleaning = true; LL.cleanNode($('modal')); cleaning = false; }).observe($('mbody'), { childList: true, subtree: true, characterData: true });
    var unlock = function () { LL.audioUnlock(); LL.audioVolumes(); LL.ambiance(S().place); LL.started = true; };
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.isOpen() && !sceneIsOpen) UI.close(); });
    LL.render(); LL.started = true; setTimeout(LL.checkStory, 1200);
    window.LyhamLife.ready = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
