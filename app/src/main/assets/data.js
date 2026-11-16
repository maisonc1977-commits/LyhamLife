/* Lyham Life — data.js : état initial S, calendrier scolaire (zone C, académie de Versailles), anniversaires, migration */
(function () {
  'use strict';
  var LL = window.LyhamLife = window.LyhamLife || {};
  LL.SAVE_KEY = 'lyhamLife_save';
  LL.SAVE_VERSION = 3;
  LL.W = 960; LL.H = 600;
  LL.clamp = function (v, a, b) { v = +v; if (!isFinite(v)) v = a; return v < a ? a : v > b ? b : v; };

  /* ---------- Calendrier ---------- */
  var START = Date.UTC(2026, 8, 1); // jour 0 = mardi 1er septembre 2026 (rentrée 4e)
  LL.START = START;
  LL.dateOf = function (d) { return new Date(START + d * 864e5); };
  LL.di = function (iso) { var p = iso.split('-'); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - START) / 864e5); };
  LL.JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  LL.MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  LL.dow = function (d) { return LL.dateOf(d).getUTCDay(); };
  LL.dateTxt = function (d) { var t = LL.dateOf(d); return LL.JOURS[t.getUTCDay()] + ' ' + t.getUTCDate() + ' ' + LL.MOIS[t.getUTCMonth()] + ' ' + t.getUTCFullYear(); };
  LL.md = function (d) { var t = LL.dateOf(d); return [t.getUTCMonth() + 1, t.getUTCDate()]; };
  LL.year = function (d) { return LL.dateOf(d).getUTCFullYear(); };

  /* Vacances zone C : [premier jour sans cours, jour de reprise]. Sources : arrêtés du 22/10/2025 (2026-27) et du 21/07/2026 (2027-28).
     2028-2031 : dates ESTIMÉES selon le schéma habituel (calendriers non publiés) — voir RAPPORT_TESTS.md */
  var VAC = [
    ['2026-10-17', '2026-11-02', 'Toussaint'], ['2026-12-19', '2027-01-04', 'Noël'], ['2027-02-06', '2027-02-22', 'hiver'],
    ['2027-04-03', '2027-04-19', 'printemps'], ['2027-05-06', '2027-05-10', 'pont de l\'Ascension'], ['2027-07-03', '2027-09-02', 'été'],
    ['2027-10-23', '2027-11-08', 'Toussaint'], ['2027-12-18', '2028-01-03', 'Noël'], ['2028-02-12', '2028-02-28', 'hiver'],
    ['2028-04-15', '2028-05-02', 'printemps'], ['2028-05-25', '2028-05-29', 'pont de l\'Ascension'], ['2028-07-04', '2028-09-04', 'été'],
    ['2028-10-21', '2028-11-06', 'Toussaint'], ['2028-12-23', '2029-01-08', 'Noël'], ['2029-02-10', '2029-02-26', 'hiver'],
    ['2029-04-07', '2029-04-23', 'printemps'], ['2029-05-10', '2029-05-14', 'pont de l\'Ascension'], ['2029-07-07', '2029-09-03', 'été'],
    ['2029-10-20', '2029-11-05', 'Toussaint'], ['2029-12-22', '2030-01-07', 'Noël'], ['2030-02-16', '2030-03-04', 'hiver'],
    ['2030-04-13', '2030-04-29', 'printemps'], ['2030-05-30', '2030-06-03', 'pont de l\'Ascension'], ['2030-07-06', '2030-09-02', 'été'],
    ['2030-10-19', '2030-11-04', 'Toussaint'], ['2030-12-21', '2031-01-06', 'Noël'], ['2031-02-15', '2031-03-03', 'hiver'],
    ['2031-04-12', '2031-04-28', 'printemps'], ['2031-05-22', '2031-05-26', 'pont de l\'Ascension']
  ];
  LL.VACANCES = VAC.map(function (v) { return { from: LL.di(v[0]), to: LL.di(v[1]), nom: v[2] }; });
  LL.RENTREES = [['2026-09-01', '4e'], ['2027-09-02', '3e'], ['2028-09-04', 'seconde'], ['2029-09-03', 'première'], ['2030-09-02', 'terminale']]
    .map(function (r) { return { d: LL.di(r[0]), n: r[1] }; });
  LL.NIVEAUX = ['4e', '3e', 'seconde', 'première', 'terminale'];
  LL.niveau = function (d) { var n = '4e'; LL.RENTREES.forEach(function (r) { if (d >= r.d) n = r.n; }); return n; };
  LL.niveauIdx = function (d) { return LL.NIVEAUX.indexOf(LL.niveau(d)); };
  LL.ecole = function (d) { return LL.niveauIdx(d) >= 2 ? 'lycée' : 'collège'; };

  function easter(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return Date.UTC(y, mo - 1, da); }
  var FERIES = {};
  for (var y = 2026; y <= 2031; y++) {
    ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'].forEach(function (s) { FERIES[LL.di(y + '-' + s)] = 1; });
    var e = Math.round((easter(y) - START) / 864e5); FERIES[e + 1] = 1; FERIES[e + 39] = 1; FERIES[e + 50] = 1;
  }
  LL.isFerie = function (d) { return !!FERIES[d]; };
  LL.vacance = function (d) { for (var i = 0; i < LL.VACANCES.length; i++) { var v = LL.VACANCES[i]; if (d >= v.from && d < v.to) return v; } return null; };
  LL.isVacances = function (d) { return !!LL.vacance(d) || d < 0; };
  LL.isWeekend = function (d) { var w = LL.dow(d); return w === 0 || w === 6; };
  LL.isSchoolDay = function (d) { return !LL.isWeekend(d) && !LL.isVacances(d) && !LL.isFerie(d) && !LL.inBacRevision(d) && !LL.inBrevetWeek(d); };
  /* Horaires de cours : 8h30–16h30 ; mercredi 8h30–12h30 */
  LL.isSchoolTime = function (d, min) { if (!LL.isSchoolDay(d)) return false; var end = LL.dow(d) === 3 ? 750 : 990; return min >= 510 && min < end; };
  LL.season = function (d) { var m = LL.md(d)[0], dd = LL.md(d)[1]; var k = m * 100 + dd; if (k >= 321 && k < 621) return 'printemps'; if (k >= 621 && k < 923) return 'été'; if (k >= 923 && k < 1221) return 'automne'; return 'hiver'; };
  function rnd(seed) { var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  LL.rndDay = rnd;
  LL.weather = function (d) {
    var s = LL.season(d), r = rnd(d + 11), r2 = rnd(d * 3 + 7);
    if (s === 'hiver') return r < 0.12 ? 'neige' : r < 0.42 ? 'pluie' : r < 0.7 ? 'nuageux' : 'soleil';
    if (s === 'automne') return r < 0.38 ? 'pluie' : r < 0.65 ? 'nuageux' : 'soleil';
    if (s === 'printemps') return r < 0.25 ? 'pluie' : r2 < 0.4 ? 'nuageux' : 'soleil';
    return r < 0.1 ? 'pluie' : r < 0.25 ? 'nuageux' : 'soleil';
  };
  LL.METEO_EMOJI = { soleil: '☀️', nuageux: '⛅', pluie: '🌧️', neige: '❄️' };

  /* Anniversaires (mois, jour) */
  LL.BIRTHDAYS = { lyham: [1, 11], tania: [3, 31], casimir: [5, 3] };
  LL.LYHAM_BIRTH_YEAR = 2013; // 13 ans au début du jeu (septembre 2026)
  LL.ageLyham = function (d) { var t = LL.dateOf(d), a = t.getUTCFullYear() - LL.LYHAM_BIRTH_YEAR; if (t.getUTCMonth() + 1 < 1 || (t.getUTCMonth() === 0 && t.getUTCDate() < 11)) a--; return a; };

  /* Examens (dates estimées, voir rapport) */
  LL.BREVET_PREP = LL.di('2028-06-19');   // semaine de préparation du lundi 19 au dimanche 25 juin 2028
  LL.BREVET_DAY = LL.di('2028-06-26');
  LL.EAM_DAY = LL.di('2030-06-12');       // épreuve anticipée de mathématiques (fin de première)
  LL.BAC_REV_START = LL.di('2031-06-02'); // 14 jours de révisions : 2 → 15 juin 2031
  LL.BAC_DAY = LL.di('2031-06-16');       // épreuve de philosophie (date estimée)
  LL.END_DAY = LL.BAC_DAY;
  LL.inBrevetWeek = function (d) { return d >= LL.BREVET_PREP && d < LL.BREVET_PREP + 7; };
  LL.inBacRevision = function (d) { return d >= LL.BAC_REV_START && d < LL.BAC_DAY; };
  LL.LISA_START = LL.di('2027-09-06');    // première lettre de Lisa : lundi de la 1re semaine de 3e

  /* ---------- État canonique ---------- */
  LL.GAUGES = ['faim', 'energie', 'fun', 'social', 'hygiene'];
  LL.GAUGE_NOMS = { faim: '🍎 Faim', energie: '⚡ Énergie', fun: '🎈 Amusement', social: '💬 Social', hygiene: '🛁 Hygiène' };
  LL.SKILLS = ['cuisine', 'danse', 'sport', 'musique', 'ecriture', 'charisme', 'jardinage', 'francais', 'anglais', 'maths', 'histoire', 'sciences', 'philo', 'art'];
  LL.SKILL_NOMS = { cuisine: '🍳 Cuisine', danse: '💃 Danse', sport: '⚽ Sport', musique: '🎸 Musique', ecriture: '✍️ Écriture', charisme: '😊 Charisme', jardinage: '🌱 Jardinage', francais: '📘 Français', anglais: '🇬🇧 Anglais', maths: '📐 Maths', histoire: '🌍 Histoire-géo', sciences: '🔬 Sciences', philo: '🦉 Philosophie', art: '🎨 Arts' };
  LL.RELS = ['casimir', 'tania', 'daryl', 'moka', 'cataleya', 'elynn', 'lisa', 'noah', 'lopez'];
  LL.OUTFITS = {
    uniforme: { nom: 'Tenue du collège', top: '#5b4b8a', bottom: '#2e2a4f', prix: 0 },
    jean: { nom: 'Jean & tee-shirt', top: '#ff8fc0', bottom: '#4a6fa5', prix: 0 },
    sweat: { nom: 'Sweat violet', top: '#9b6bd6', bottom: '#3d4a6b', prix: 0 },
    pyjama: { nom: 'Pyjama étoilé', top: '#b9a6f2', bottom: '#b9a6f2', prix: 0 },
    robe: { nom: 'Robe fleurie', top: '#f6a5c0', bottom: '#f6a5c0', dress: 1, prix: 25 },
    danse: { nom: 'Tenue de danse', top: '#e04f8f', bottom: '#2b2340', prix: 20 },
    ete: { nom: 'Tenue d\'été', top: '#ffd166', bottom: '#4cc9f0', prix: 18 },
    bal: { nom: 'Robe de bal', top: '#c77dff', bottom: '#c77dff', dress: 2, prix: 60 },
    toge: { nom: 'Toge de diplôme', top: '#2a2350', bottom: '#2a2350', dress: 2, prix: 0, cond: 'bac' }
  };
  LL.ITEMS = { cupcake: '🧁 Cupcake', yaourt: '🥛 Yaourt', graines: '🌱 Graines', livre: '📕 Roman', carte: '💌 Carte', fleurs: '💐 Bouquet', croissant: '🥐 Croissant', fruit: '🍓 Fruits', chouchou: '🎀 Chouchou', bonbons: '🍬 Bonbons' };

  LL.newState = function () {
    var S = {
      saveVersion: LL.SAVE_VERSION, day: 0, min: 7 * 60, place: 'chambre', lx: 480,
      g: { faim: 70, energie: 85, fun: 60, social: 60, hygiene: 75 },
      money: 10, skills: {}, rel: {}, inv: { cupcake: 1 }, outfit: 'pyjama', outfits: ['uniforme', 'jean', 'sweat', 'pyjama'],
      events: {}, flags: {}, journal: [], daily: {},
      settings: { muted: false, sfx: 0.8, mus: 0.55, reduce: false, textScale: 1 },
      lisa: { read: {}, replies: {} }, quiz: { recent: [], ok: 0, ko: 0 }, prono: { done: {} }, brevet: { done: {}, day: 0 },
      bacRevision: { day: 1, prep: { philo: 10, anglais: 20, maths: 15 }, confiance: 45, done: {}, errors: [], current: null, bilans: {}, finished: false },
      darylVisits: 0, stats: { actions: 0, days: 0 }, ended: false, garden: 0, tvXp: {}
    };
    LL.SKILLS.forEach(function (k) { S.skills[k] = 0; });
    var base = { casimir: 70, tania: 70, daryl: 60, moka: 65, cataleya: 65, elynn: 70, lisa: 0, noah: 30, lopez: 40 };
    LL.RELS.forEach(function (k) { S.rel[k] = base[k]; });
    return S;
  };

  /* Validation / migration de sauvegarde : complète par défaut, borne, convertit les anciennes versions */
  LL.migrate = function (o) {
    var D = LL.newState();
    if (!o || typeof o !== 'object') return D;
    var v = +o.saveVersion || 1;
    if (v < 2) { // v1 : jauges à plat (o.faim, o.energie…) et argent "argent"
      o.g = o.g || {}; LL.GAUGES.forEach(function (k) { if (o[k] != null) o.g[k] = o[k]; });
      if (o.argent != null) o.money = o.argent;
    }
    if (v < 3) { // v2 : bacRevision absent, relation "lisa" absente
      o.bacRevision = o.bacRevision || null;
    }
    var S = D;
    S.day = LL.clamp(Math.floor(+o.day || 0), 0, LL.END_DAY);
    S.min = LL.clamp(Math.floor(+o.min || 420), 0, 1439);
    S.place = typeof o.place === 'string' ? o.place : 'chambre';
    S.lx = LL.clamp(+o.lx || 480, 40, 920);
    if (o.g) LL.GAUGES.forEach(function (k) { if (o.g[k] != null) S.g[k] = LL.clamp(o.g[k], 0, 100); });
    S.money = LL.clamp(Math.floor(+o.money || 0), 0, 99999);
    if (o.skills) LL.SKILLS.forEach(function (k) { S.skills[k] = LL.clamp(+o.skills[k] || 0, 0, 1e6); });
    if (o.rel) LL.RELS.forEach(function (k) { if (o.rel[k] != null) S.rel[k] = LL.clamp(o.rel[k], 0, 100); });
    if (o.inv && typeof o.inv === 'object') { S.inv = {}; Object.keys(LL.ITEMS).forEach(function (k) { var n = Math.floor(+o.inv[k] || 0); if (n > 0) S.inv[k] = Math.min(n, 99); }); }
    if (LL.OUTFITS[o.outfit]) S.outfit = o.outfit;
    if (Array.isArray(o.outfits)) S.outfits = o.outfits.filter(function (k) { return LL.OUTFITS[k]; });
    ['uniforme', 'jean', 'sweat', 'pyjama'].forEach(function (k) { if (S.outfits.indexOf(k) < 0) S.outfits.push(k); });
    if (o.events && typeof o.events === 'object') Object.keys(o.events).forEach(function (k) { var st = o.events[k]; if (st === 'available' || st === 'done' || st === 'locked') S.events[k] = st; });
    if (o.flags && typeof o.flags === 'object') S.flags = JSON.parse(JSON.stringify(o.flags));
    if (Array.isArray(o.journal)) S.journal = o.journal.filter(function (j) { return j && typeof j.t === 'string'; }).slice(-200);
    if (o.daily && typeof o.daily === 'object') S.daily = o.daily;
    if (o.settings) { var st = o.settings; S.settings.muted = !!st.muted; S.settings.sfx = LL.clamp(st.sfx != null ? st.sfx : 0.8, 0, 1); S.settings.mus = LL.clamp(st.mus != null ? st.mus : 0.55, 0, 1); S.settings.reduce = !!st.reduce; S.settings.textScale = LL.clamp(st.textScale || 1, 0.85, 1.5); }
    if (o.lisa) { S.lisa.read = o.lisa.read || {}; S.lisa.replies = o.lisa.replies || {}; }
    if (o.quiz) { S.quiz.recent = Array.isArray(o.quiz.recent) ? o.quiz.recent.slice(-40) : []; S.quiz.ok = +o.quiz.ok || 0; S.quiz.ko = +o.quiz.ko || 0; }
    if (o.prono && o.prono.done) S.prono.done = o.prono.done;
    if (o.brevet) { S.brevet.done = o.brevet.done || {}; S.brevet.day = LL.clamp(+o.brevet.day || 0, 0, 7); }
    if (o.bacRevision) {
      var b = o.bacRevision, B = S.bacRevision;
      B.day = LL.clamp(Math.floor(+b.day || 1), 1, 15); B.confiance = LL.clamp(b.confiance != null ? b.confiance : 45, 0, 100);
      if (b.prep) ['philo', 'anglais', 'maths'].forEach(function (k) { B.prep[k] = LL.clamp(b.prep[k] != null ? b.prep[k] : B.prep[k], 0, 100); });
      B.done = b.done || {}; B.errors = Array.isArray(b.errors) ? b.errors.slice(-60) : []; B.current = b.current || null; B.bilans = b.bilans || {}; B.finished = !!b.finished;
    }
    S.darylVisits = Math.max(0, Math.floor(+o.darylVisits || 0));
    if (o.stats) { S.stats.actions = +o.stats.actions || 0; S.stats.days = +o.stats.days || 0; }
    S.ended = !!o.ended; S.garden = LL.clamp(+o.garden || 0, 0, 100); S.tvXp = o.tvXp || {};
    S.saveVersion = LL.SAVE_VERSION;
    return S;
  };

  LL.S = LL.newState();
})();

/* Détection des emojis réellement affichables (Android 7 n'a pas les emojis récents) + repli lisible */
(function () {
  'use strict';
  var LL = window.LyhamLife, cache = {}, cv = null, g = null, ref = null, refW = 0;
  function px(ch) { g.clearRect(0, 0, 48, 48); g.fillText(ch, 2, 34); return g.getImageData(0, 0, 48, 48).data; }
  LL.emojiOK = function (ch) {
    if (!ch) return false; if (ch in cache) return cache[ch];
    var ok = true;
    try {
      if (!cv) { cv = document.createElement('canvas'); cv.width = cv.height = 48; g = cv.getContext('2d', { willReadFrequently: true }); g.font = '28px system-ui, sans-serif'; ref = px('\uDB3F\uDFFD'); refW = g.measureText('\uDB3F\uDFFD').width || 1; }
      var d = px(ch), same = true, ink = false; for (var i = 3; i < d.length; i += 4) { if (d[i] !== ref[i]) same = false; if (d[i] > 0) ink = true; }
      ok = ink && !same && g.measureText(ch).width < refW * 1.7;
    } catch (e) { ok = true; }
    cache[ch] = ok; return ok;
  };
  var FALL = { '💕': '♥', '💖': '♥', '💛': '♥', '💚': '♥', '💜': '♥', '❤️': '♥', '✨': '✦', '⭐': '★', '🌟': '★', '🎵': '♪', '🎶': '♫', '😋': '☺', '😄': '☺', '😀': '☺', '😂': '☺', '😆': '☺', '😊': '☺', '😜': '☺', '🤪': '☺', '😎': '☺', '😮': '!', '❄️': '❄', '☀️': '☀', '☕': '☕', '💦': '~', '💨': '~', '⚽': '●', '🏀': '●', '🔴': '●', '✅': '✔', '❌': '✘', '⚠️': '⚠', '🔒': '×', '🔊': '♪', '🔇': '×', '📖': '≡', '💌': '✉', '📬': '✉', '🎓': '★', '🏆': '★', '📚': '≡', '📝': '✎', '✍️': '✎', '🎵': '♪', '🎸': '♪', '🎹': '♪', '🗣️': '♪', '🐱': '♥', '🎂': '★', '🌸': '✿', '🌼': '✿', '💐': '✿', '☀️': '☀', '⛅': '☁', '🌧️': '☂' };
  var RX = null; try { RX = new RegExp('(?:[\\u{1F1E6}-\\u{1F1FF}]{2}|\\p{Extended_Pictographic}\\uFE0F?(?:\\u200D\\p{Extended_Pictographic}\\uFE0F?)*)', 'gu'); } catch (e) { RX = null; }
  LL.glyph = function (e) { return LL.emojiOK(e) ? e : (FALL[e] || FALL[e.replace('\uFE0F', '')] || '✦'); };
  LL.cleanEmoji = function (s) { if (!RX || s == null) return s; return String(s).replace(RX, function (m) { return LL.emojiOK(m) ? m : (FALL[m] || FALL[m.replace('\uFE0F', '')] || ''); }); };
  LL.cleanNode = function (root) {
    if (!RX || !root || !document.createTreeWalker) return; var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) { var v = t.nodeValue; RX.lastIndex = 0; if (RX.test(v)) { RX.lastIndex = 0; var nv = LL.cleanEmoji(v); if (nv !== v) t.nodeValue = nv.replace(/^\s+/, ''); } });
  };
})();
