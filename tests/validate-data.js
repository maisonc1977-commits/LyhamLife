/* Lyham Life — tests/validate-data.js : validation des banques de contenu (Node.js)
   Usage : node tests/validate-data.js   (depuis la racine du projet) */
'use strict';
var path = require('path'), fs = require('fs');
var A = path.join(__dirname, '..', 'app', 'src', 'main', 'assets');
function ignorer() { return undefined; } // les écouteurs d'événements ne servent pas en Node
global.window = { addEventListener: ignorer };
global.document = { addEventListener: ignorer, hidden: false };
window.LyhamLife = {};
['data.js', 'lieux.js', 'quiz.js', 'prononciation.js', 'lisa.js', 'histoire.js'].forEach(function (f) { require(path.join(A, f)); });
var LL = window.LyhamLife, errors = [], warn = [], report = {};
function err(m) { errors.push(m); }
function num(s) { s = String(s).replace(/\u2212/g, '-').replace(/^[^0-9\-−,.]*?=\s*/, '').replace(/(\d)\s+(?=\d{3}\b)/g, '$1').replace(',', '.'); var m = s.match(/-?\d+(\.\d+)?(\/\d+)?/); if (!m) return NaN; if (m[2]) { var p = m[0].split('/'); return +p[0] / +p[1]; } return parseFloat(m[0]); }
function pure(o) { var t = String(o).replace(/\u2212/g, '-').replace(/^x\s*=\s*/, '').replace(/\s*(cm³|cm|%|°|Hz|W|J|Wh|g\/L|€)$/, '').replace(/\s/g, ''); return /^-?\d+([.,]\d+)?(\/\d+)?$/.test(t); }
function toJs(e) { return e.replace(/\u2212/g, '-').replace(/²/g, '**2').replace(/³/g, '**3').replace(/\s/g, '').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x').replace(/\)\(/g, ')*(').replace(/\)x/g, ')*x').replace(/^y=/, ''); }
function evx(expr, x) { return Function('x', 'return (' + expr + ');')(x); }
/* ---------- Quiz ---------- */
var Q = LL.QUIZ, ids = {}, perM = {}, perML = {};
Q.forEach(function (q) {
  if (ids[q.id]) err('Quiz : identifiant en double ' + q.id); ids[q.id] = 1;
  perM[q.m] = (perM[q.m] || 0) + 1; perML[q.m + q.n] = (perML[q.m + q.n] || 0) + 1;
  if (!Array.isArray(q.c) || q.c.length !== 4) err(q.id + ' : il faut 4 propositions');
  if (new Set(q.c).size !== q.c.length) err(q.id + ' : propositions en double');
  if (!(q.a >= 0 && q.a < q.c.length)) err(q.id + ' : index de bonne réponse invalide');
  if (!q.e || q.e.length < 8) err(q.id + ' : explication manquante');
  if (q.v) { var val = Function('return (' + q.v + ');')(), good = num(q.c[q.a]); if (Math.abs(val - good) > 1e-6) err(q.id + ' : la bonne réponse « ' + q.c[q.a] + ' » ≠ calcul ' + val); q.c.forEach(function (o, k) { if (k !== q.a && pure(o) && Math.abs(num(o) - val) < 1e-9) err(q.id + ' : une autre proposition (« ' + o + ' ») est aussi exacte'); }); report.quizCalcules = (report.quizCalcules || 0) + 1; }
  if (q.vx) { var xs = [-2.5, -1, 0.5, 1.7, 3.2], match = q.c.map(function (o) { try { var f = toJs(o); return xs.every(function (x) { return Math.abs(evx(f, x) - evx(q.vx, x)) < 1e-9; }); } catch (e) { return false; } }); if (!match[q.a]) err(q.id + ' : la bonne réponse algébrique ne correspond pas'); if (match.filter(Boolean).length !== 1) err(q.id + ' : ' + match.filter(Boolean).length + ' propositions algébriquement équivalentes'); report.quizAlgebriques = (report.quizAlgebriques || 0) + 1; }
});
report.questions = Q.length; report.parMatiere = perM;
if (Q.length < 300) err('Moins de 300 questions');
Object.keys(LL.MATIERES).forEach(function (m) { if ((perM[m] || 0) < 60) err('Moins de 60 questions en ' + m); for (var n = 0; n < 5; n++) if (!perML[m + n]) err('Aucune question de niveau ' + n + ' en ' + m); });
/* ---------- Brevet ---------- */
var BR = LL.BREVET; report.brevet = BR.length;
for (var d = 1; d <= 7; d++) { var it = BR.filter(function (b) { return b.day === d; }); if (!it.some(function (b) { return b.mat === 'fr'; }) || !it.some(function (b) { return b.mat === 'ma'; })) err('Brevet jour ' + d + ' : il faut 1 exercice de français et 1 de maths'); }
BR.forEach(function (b) { check(b, 'Brevet ' + b.id); });
function check(it, lab) {
  ['titre', 'consigne', 'correction', 'methode'].forEach(function (k) { if (!it[k] || String(it[k]).length < 4) err(lab + ' : champ « ' + k + ' » manquant'); });
  if (it.kind === 'qcm') { if (!(it.answer >= 0 && it.answer < it.options.length)) err(lab + ' : réponse QCM invalide'); if (new Set(it.options).size !== it.options.length) err(lab + ' : options en double'); }
  else if (it.kind === 'num') { if (typeof it.answer !== 'number') err(lab + ' : réponse numérique manquante'); if (!it.v) err(lab + ' : pas de vérification programmatique (v)'); else { var val = Function('return (' + it.v + ');')(), tol = it.tol != null ? it.tol : 1e-6; if (Math.abs(val - it.answer) > tol + 1e-9) err(lab + ' : réponse ' + it.answer + ' ≠ calcul ' + val); report.exercicesCalcules = (report.exercicesCalcules || 0) + 1; } }
  else if (it.kind === 'open') { if (!it.criteria || it.criteria.length < 3) err(lab + ' : grille de critères trop courte'); }
  else if (it.kind === 'prono') { (it.refs || []).forEach(function (r) { if (!LL.PRONO.EXOS.some(function (e) { return e.id === r; })) err(lab + ' : référence de prononciation inconnue ' + r); }); }
  else err(lab + ' : type inconnu ' + it.kind);
}
/* ---------- Révisions du bac ---------- */
var BAC = LL.BAC_REVISION, all = [];
if (BAC.days.length !== 14) err('BAC_REVISION : il faut exactement 14 journées');
BAC.days.forEach(function (day) { var its = day.items.map(function (id) { return LL.bacItem(id); }); if (its.some(function (x) { return !x; })) err('Jour ' + day.day + ' : activité introuvable'); ['philo', 'anglais', 'maths'].forEach(function (m) { var n = its.filter(function (x) { return x && x.mat === m; }).length; if (n < 3) err('Jour ' + day.day + ' : moins de 3 activités en ' + m); }); its.forEach(function (x) { if (x) { all.push(x); check(x, 'Bac ' + x.id); ['duree', 'xp', 'diff'].forEach(function (k) { if (!(x[k] > 0)) err(x.id + ' : ' + k + ' manquant'); }); if (!x.erreurs) err(x.id + ' : erreurs fréquentes manquantes'); if (x.type === 'chrono' && !x.timer) err(x.id + ' : mini-épreuve sans chronomètre'); if (x.type === 'oral' && !x.audio) err(x.id + ' : compréhension orale sans texte audio'); } }); });
report.activitesBac = all.length; if (all.length < 126) err('Moins de 126 activités de révision');
if (new Set(all.map(function (x) { return x.id; })).size !== all.length) err('Identifiants d\'activités du bac en double');
[7, 14].forEach(function (d) { if (!LL.bacDayItems(d).some(function (x) { return x.type === 'bilan'; })) err('Jour ' + d + ' : bilan manquant'); });
report.chronos = all.filter(function (x) { return x.timer; }).length; report.prononcBac = all.filter(function (x) { return x.kind === 'prono'; }).length;
var types = {}; all.forEach(function (x) { types[x.type] = (types[x.type] || 0) + 1; }); report.typesBac = types;
/* ---------- Prononciation ---------- */
var P = LL.PRONO.EXOS; report.prononciation = P.length; if (P.length < 60) err('Moins de 60 exercices de prononciation');
P.forEach(function (e) { if (!e.ph || !e.tip || !(e.n >= 0 && e.n <= 4)) err('Prononciation ' + e.id + ' incomplète'); });
['th', 'h', 'voyelles', 'ed', 'tion', 'muettes', 'accent', 'intonation', 'virelangues'].forEach(function (t) { if (!P.some(function (e) { return e.theme === t; })) err('Thème de prononciation manquant : ' + t); });
var sc = LL.PRONO.score('think', ['think']); if (sc.stars !== 3) err('Score de prononciation parfait ≠ 3 étoiles');
var sc2 = LL.PRONO.score('think', ['sink']); if (sc2.stars === 3 || sc2.marks[0] !== false) err('Score de prononciation : « sink » devrait être pénalisé sur le « th »');
/* ---------- Lettres de Lisa ---------- */
var LET = LL.LETTRES; report.lettres = LET.length; if (LET.length < 40) err('Moins de 40 lettres de Lisa');
var flagsSet = {}; LET.forEach(function (l) { l.replies.forEach(function (r) { if (r.flag) flagsSet[r.flag] = 1; }); });
LET.forEach(function (l) { if (!l.en || !l.fr || l.replies.length < 2) err('Lettre ' + l.n + ' incomplète'); l.cond.forEach(function (c) { if (!flagsSet[c[0]]) err('Lettre ' + l.n + ' : condition sur un drapeau jamais posé ' + c[0]); }); });
function wps(t) { var s = t.split(/[.!?]+/).filter(function (x) { return x.trim(); }); return t.split(/\s+/).length / s.length; }
var early = LET.slice(0, 10).reduce(function (a, l) { return a + wps(l.en); }, 0) / 10, late = LET.slice(-10).reduce(function (a, l) { return a + wps(l.en); }, 0) / 10;
report.motsParPhraseLettres = { debut: +early.toFixed(1), fin: +late.toFixed(1) }; if (late <= early) err('Pas de progression linguistique mesurable dans les lettres');
var ord = ['A1', 'A2', 'B1', 'B2']; for (var i = 1; i < LET.length; i++) if (ord.indexOf(LET[i].niveau) < ord.indexOf(LET[i - 1].niveau)) err('Niveau de lettre décroissant à la lettre ' + LET[i].n);
var gen = {}; for (var w = LET.length + 1; w <= LET.length + 160; w++) { var g = LL.lettreGeneree(w); if (gen[g.en]) err('Lettre générée en double à la semaine ' + w); gen[g.en] = 1; }
/* ---------- Histoire ---------- */
var ST = LL.STORY, sid = {}, cnt = LL.STATS_HISTOIRE(); report.histoire = cnt;
var storyFlags = {}; ST.forEach(function (s) { s.choices.forEach(function (c) { if (c[1] && c[1].f) storyFlags[c[1].f] = 1; }); });
Object.keys(flagsSet).forEach(function (k) { storyFlags[k] = 1; });
ST.forEach(function (s) {
  if (sid[s.id]) err('Scène en double ' + s.id); sid[s.id] = 1;
  if (s.choices.length < 2) err('Scène ' + s.id + ' : moins de 2 choix');
  s.choices.forEach(function (c, k) { if (!c[1] || !c[1].f) err('Scène ' + s.id + ' choix ' + k + ' : pas de conséquence persistante'); if (!c[3]) err('Scène ' + s.id + ' choix ' + k + ' : pas de souvenir'); });
  if (!(s.from >= 0 && s.from <= LL.END_DAY)) err('Scène ' + s.id + ' hors de la période de jeu');
  if (s.lieu && !LL.PLACES[s.lieu]) err('Scène ' + s.id + ' : lieu inconnu ' + s.lieu);
  s.lines.forEach(function (l) { if (l[2]) { var f = l[2].replace('!', ''); if (!storyFlags[f]) err('Scène ' + s.id + ' : condition sur drapeau jamais posé ' + f); } });
});
if (cnt.famille < 30) err('Moins de 30 événements familiaux'); if (cnt.amitie < 20) err('Moins de 20 scènes d\'amitié'); if (cnt.episodes < 7) err('Moins de 7 épisodes structurants');
['lyham', 'tania', 'casimir'].forEach(function (p) { ['prep', 'jour', 'apres'].forEach(function (k) { for (var y = 2027; y <= 2031; y++) if (!sid['anniv_' + p + '_' + y + '_' + k]) err('Anniversaire manquant : ' + p + ' ' + y + ' ' + k); }); });
/* ---------- Durée et calendrier ---------- */
report.joursJouables = LL.END_DAY + 1; if (LL.END_DAY + 1 < 800) err('Moins de 800 jours jouables');
var sd = 0; for (var dd = 0; dd <= LL.END_DAY; dd++) if (LL.isSchoolDay(dd)) sd++; report.joursDeCours = sd;
LL.NIVEAUX.forEach(function (n) { if (!LL.RENTREES.some(function (r) { return r.n === n; })) err('Année scolaire manquante : ' + n); });
if (LL.dateOf(LL.BIRTHDAYS && 0).getUTCDay() !== 2) err('Le jour 0 doit être un mardi (rentrée du 1er septembre 2026)');
/* ---------- Lieux ---------- */
report.lieux = Object.keys(LL.PLACES).length;
Object.keys(LL.ZONES).forEach(function (z) { LL.ZONES[z].forEach(function (id) { if (!LL.PLACES[id]) err('Lieu manquant : ' + id); }); });
console.log(JSON.stringify(report, null, 1));
if (errors.length) { console.log('\n❌ ' + errors.length + ' ERREUR(S) :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('\n✅ Toutes les données sont valides.');
