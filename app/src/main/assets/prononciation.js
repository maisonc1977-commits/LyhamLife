/* Lyham Life — prononciation.js : exercices (mot, phonétique, astuce, niveau), écoute, enregistrement, score Levenshtein, auto-évaluation */
(function () {
  'use strict';
  var LL = window.LyhamLife;
  /* Nouvel exercice = une ligne : [texte, phonétique (anglais britannique), astuce en français, niveau 0=4e…4=terminale, thème] */
  var RAW = [
    ['think', '/θɪŋk/', 'Pour le th, place ta langue entre tes dents et souffle doucement, sans voix.', 0, 'th'],
    ['this', '/ðɪs/', 'Ce th-là vibre : langue entre les dents, et fais « bzz » avec ta gorge.', 0, 'th'],
    ['three', '/θriː/', 'Th soufflé puis un i long : « thriii ». Ne dis pas « tree » (arbre) !', 0, 'th'],
    ['brother', '/ˈbrʌðə/', 'Le th au milieu vibre. Le « o » se prononce comme un « a » bref.', 0, 'th'],
    ['thank you', '/ˈθæŋk juː/', 'Langue entre les dents pour « th », puis un « a » très ouvert.', 0, 'th'],
    ['mother', '/ˈmʌðə/', 'Comme brother : th qui vibre, « o » prononcé « a » bref.', 0, 'th'],
    ['bath', '/bɑːθ/', 'Un « a » long et grave, puis un th soufflé à la fin.', 0, 'th'],
    ['the weather', '/ðə ˈweðə/', 'Deux th vibrants ! « the » se dit « zeu » avec la langue entre les dents.', 0, 'th'],
    ['house', '/haʊs/', 'Le h s\'entend : expire comme pour faire de la buée sur une vitre.', 0, 'h'],
    ['happy', '/ˈhæpi/', 'Souffle le h, puis un « a » bien ouvert, entre « a » et « è ».', 0, 'h'],
    ['hello', '/həˈləʊ/', 'H soufflé, accent sur la 2e syllabe : he-LLO.', 0, 'h'],
    ['hat', '/hæt/', 'H expiré + « a » ouvert. Sans h, tu dis « at » !', 0, 'h'],
    ['hungry', '/ˈhʌŋɡri/', 'H soufflé, « u » prononcé « a » bref, accent au début.', 0, 'h'],
    ['Harry has a horse', '/ˈhæri hæz ə hɔːs/', 'Trois h à souffler ! Entraîne-toi lentement puis accélère.', 0, 'h'],
    ['ship', '/ʃɪp/', 'Le i est COURT et détendu (presque « é »). Bateau !', 1, 'voyelles'],
    ['sheep', '/ʃiːp/', 'Le i est LONG et souriant : « chiiip ». Mouton !', 1, 'voyelles'],
    ['live', '/lɪv/', 'i court : « liv ». Vivre.', 1, 'voyelles'],
    ['leave', '/liːv/', 'i long : « liiiv ». Partir.', 1, 'voyelles'],
    ['full', '/fʊl/', 'ou COURT, lèvres peu arrondies. Plein.', 1, 'voyelles'],
    ['fool', '/fuːl/', 'ou LONG, lèvres bien arrondies. Idiot.', 1, 'voyelles'],
    ['sit', '/sɪt/', 'i court et détendu.', 1, 'voyelles'],
    ['seat', '/siːt/', 'i long et tendu, comme un sourire.', 1, 'voyelles'],
    ['played', '/pleɪd/', 'Après un son voisé (ici « ei »), -ed se dit /d/ : une seule syllabe.', 1, 'ed'],
    ['wanted', '/ˈwɒntɪd/', 'Après t ou d, -ed se dit /ɪd/ : une syllabe en plus, « won-tid ».', 1, 'ed'],
    ['watched', '/wɒtʃt/', 'Après un son sourd (tch), -ed se dit /t/ : « wotcht ».', 1, 'ed'],
    ['loved', '/lʌvd/', '-ed après v : /d/. Ne dis pas « lov-ède » !', 1, 'ed'],
    ['needed', '/ˈniːdɪd/', 'Après d : /ɪd/, deux syllabes « nii-did ».', 1, 'ed'],
    ['laughed', '/lɑːft/', 'gh = f, et -ed après f sourd = /t/ : « laaft ».', 1, 'ed'],
    ['nation', '/ˈneɪʃn/', '-tion se dit « chn », jamais « sion » à la française. Accent sur NA.', 2, 'tion'],
    ['information', '/ˌɪnfəˈmeɪʃn/', 'Accent juste avant -tion : in-for-MA-tion.', 2, 'tion'],
    ['education', '/ˌedʒuˈkeɪʃn/', 'du = « dju », accent sur CA : e-du-CA-tion.', 2, 'tion'],
    ['pollution', '/pəˈluːʃn/', 'Accent sur LU, -tion = « chn ».', 2, 'tion'],
    ['conversation', '/ˌkɒnvəˈseɪʃn/', 'Accent sur SA : con-ver-SA-tion.', 2, 'tion'],
    ['knife', '/naɪf/', 'Le k est muet devant n : « naïf ».', 2, 'muettes'],
    ['Wednesday', '/ˈwenzdeɪ/', 'Le premier d est muet : « wènz-dei ».', 2, 'muettes'],
    ['island', '/ˈaɪlənd/', 'Le s est muet : « aï-lènd ».', 2, 'muettes'],
    ['listen', '/ˈlɪsn/', 'Le t est muet : « li-sseun ».', 2, 'muettes'],
    ['castle', '/ˈkɑːsl/', 'Le t est muet : « kaa-sseul ».', 2, 'muettes'],
    ['knee', '/niː/', 'k muet : « nii ».', 2, 'muettes'],
    ['write', '/raɪt/', 'w muet devant r : « raït ».', 2, 'muettes'],
    ['half', '/hɑːf/', 'l muet : « haaf », avec h soufflé.', 2, 'muettes'],
    ['photograph', '/ˈfəʊtəɡrɑːf/', 'Accent sur la 1re syllabe : PHO-to-graph.', 3, 'accent'],
    ['photography', '/fəˈtɒɡrəfi/', 'L\'accent se déplace : pho-TO-gra-phy !', 3, 'accent'],
    ['photographer', '/fəˈtɒɡrəfə/', 'Même accent que photography : pho-TO-gra-pher.', 3, 'accent'],
    ['economy', '/ɪˈkɒnəmi/', 'Accent sur la 2e syllabe : e-CO-no-my.', 3, 'accent'],
    ['economic', '/ˌiːkəˈnɒmɪk/', 'Avec -ic, l\'accent tombe juste avant : e-co-NO-mic.', 3, 'accent'],
    ['comfortable', '/ˈkʌmftəbl/', 'Seulement 3 syllabes : COMF-ta-ble.', 3, 'accent'],
    ['interesting', '/ˈɪntrəstɪŋ/', 'Accent au début, 3 syllabes : IN-tres-ting.', 3, 'accent'],
    ['vegetable', '/ˈvedʒtəbl/', '3 syllabes seulement : VEDGE-ta-ble.', 3, 'accent'],
    ['Are you coming?', '/ɑː juː ˈkʌmɪŋ/ ↗', 'Question fermée (oui/non) : la voix MONTE à la fin ↗.', 3, 'intonation'],
    ['Where do you live?', '/weə də juː ˈlɪv/ ↘', 'Question ouverte (wh-) : la voix DESCEND à la fin ↘.', 3, 'intonation'],
    ['Is it raining?', '/ɪz ɪt ˈreɪnɪŋ/ ↗', 'Oui/non : intonation montante ↗.', 3, 'intonation'],
    ['What time is it?', '/wɒt ˈtaɪm ɪz ɪt/ ↘', 'Question en « what » : intonation descendante ↘.', 3, 'intonation'],
    ['Do you like tea?', '/də juː ˈlaɪk tiː/ ↗', 'Montée finale ↗ sur « tea ».', 3, 'intonation'],
    ['Why are you late?', '/waɪ ə juː ˈleɪt/ ↘', 'Question en « why » : descente ↘ sur « late ».', 3, 'intonation'],
    ['She sells seashells by the seashore', '/ʃiː selz ˈsiːʃelz baɪ ðə ˈsiːʃɔː/', 'Alterne bien « s » (sourire) et « sh » (lèvres en avant).', 4, 'virelangues'],
    ['Red lorry, yellow lorry', '/red ˈlɒri ˈjeləʊ ˈlɒri/', 'Le r anglais ne roule pas : langue en arrière, sans toucher le palais.', 4, 'virelangues'],
    ['Peter Piper picked a peck of pickled peppers', '/ˈpiːtə ˈpaɪpə pɪkt ə pek əv ˈpɪkld ˈpepəz/', 'Les p sont explosifs : un petit souffle après chaque p.', 4, 'virelangues'],
    ['How much wood would a woodchuck chuck', '/haʊ mʌtʃ wʊd wʊd ə ˈwʊdtʃʌk tʃʌk/', 'Lèvres bien arrondies pour chaque w.', 4, 'virelangues'],
    ['I scream, you scream, we all scream for ice cream', '/aɪ skriːm juː skriːm wiː ɔːl skriːm fər aɪs kriːm/', 'Attention à la coupure : « I scream » ≈ « ice cream » !', 4, 'virelangues'],
    ['Three thin thinkers thinking thick thoughts', '/θriː θɪn ˈθɪŋkəz ˈθɪŋkɪŋ θɪk θɔːts/', 'Six th soufflés : langue entre les dents à chaque fois !', 4, 'virelangues'],
    ['Betty Botter bought some butter', '/ˈbeti ˈbɒtə bɔːt səm ˈbʌtə/', 'Le t entre deux voyelles reste net en anglais britannique.', 4, 'virelangues'],
    ['Although it was raining, we went out', '/ɔːlˈðəʊ ɪt wəz ˈreɪnɪŋ wiː went aʊt/', 'Although : th vibrant, accent sur la 2e syllabe.', 4, 'phrases'],
    ['I would have helped you if I had known', '/aɪ wʊd əv helpt juː ɪf aɪ həd nəʊn/', '« would have » se réduit à « woud-ev » ; « known » : k muet.', 4, 'phrases'],
    ['The environment is a major issue nowadays', '/ði ɪnˈvaɪrənmənt ɪz ə ˈmeɪdʒər ˈɪʃuː ˈnaʊədeɪz/', 'en-VI-ron-ment ; issue se dit « i-chou ».', 4, 'phrases']
  ];
  var EXOS = RAW.map(function (r, i) { return { id: 'pr' + (i + 1), t: r[0], ph: r[1], tip: r[2], n: r[3], theme: r[4] }; });
  var THEMES = { th: 'Le son « th »', h: 'Le h aspiré', voyelles: 'Voyelles courtes / longues', ed: 'Terminaisons -ed', tion: 'Terminaison -tion', muettes: 'Lettres muettes', accent: 'Accent tonique', intonation: 'Intonation des questions', virelangues: 'Virelangues', phrases: 'Phrases de terminale' };

  function norm(s) { return String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* Distance de Levenshtein + alignement pour colorer les lettres mal prononcées */
  function lev(a, b) {
    var n = a.length, m = b.length, d = [], i, j; for (i = 0; i <= n; i++) { d[i] = [i]; } for (j = 1; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    var ok = []; i = n; j = m; while (i > 0 || j > 0) { if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { ok[i - 1] = a[i - 1] === b[j - 1]; i--; j--; } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ok[i - 1] = false; i--; } else j--; }
    return { dist: d[n][m], ok: ok };
  }
  function score(target, results) {
    var t = norm(target), best = { sim: 0, txt: '', ok: [] };
    (results || []).forEach(function (r) { var x = norm(r); if (!x) return; var L = lev(t, x), sim = 1 - L.dist / Math.max(t.length, x.length, 1); if (sim > best.sim) best = { sim: sim, txt: r, ok: L.ok }; });
    var stars = best.sim >= 0.9 ? 3 : best.sim >= 0.7 ? 2 : 1;
    // marques par caractère du texte affiché (les caractères non alphabétiques restent neutres)
    var marks = [], k = 0, disp = String(target);
    for (var c = 0; c < disp.length; c++) { var ch = disp[c].toLowerCase(); if (/[a-z]/.test(ch)) { marks.push(best.ok[k] === undefined ? false : !!best.ok[k]); k++; } else if (ch === ' ' && k < t.length && t[k] === ' ') { marks.push(null); k++; } else marks.push(null); }
    var advice = stars === 3 ? 'Parfait, accent impeccable ! 🇬🇧' : conseil(target, marks);
    return { sim: Math.round(best.sim * 100) / 100, stars: stars, best: best.txt, marks: marks, advice: advice };
  }
  function conseil(target, marks) { var disp = String(target), bad = ''; for (var i = 0; i < disp.length; i++) if (marks[i] === false) bad += disp[i].toLowerCase(); var ex = EXOS.filter(function (e) { return e.t === target; })[0]; if (/th/.test(disp.toLowerCase()) && /[th]/.test(bad)) return 'Le « th » : langue entre les dents ! ' + (ex ? ex.tip : ''); if (/^h/i.test(disp) && bad.indexOf('h') >= 0) return 'N\'oublie pas de souffler le h !'; return ex ? ex.tip : 'Écoute à nouveau en vitesse lente puis répète.'; }

  /* Écoute : Android TextToSpeech (en-GB) sinon speechSynthesis */
  function voixDispo() { try { if (window.AndroidVoix && AndroidVoix.voixDispo()) return 'android'; } catch (e) { } return window.speechSynthesis ? 'web' : null; }
  function ecouter(text, slow) {
    var v = voixDispo();
    try { if (v === 'android') { AndroidVoix.parler(String(text).slice(0, 400), slow ? 0.6 : 1.0); return true; } if (v === 'web') { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(String(text)); u.lang = 'en-GB'; u.rate = slow ? 0.6 : 1; var vs = speechSynthesis.getVoices().filter(function (x) { return /en-GB/i.test(x.lang); }); if (vs[0]) u.voice = vs[0]; speechSynthesis.speak(u); return true; } } catch (e) { LL.reportError && LL.reportError(e); }
    if (LL.caption) LL.caption('🔇 Voix anglaise indisponible : lis la phonétique ' + text);
    return false;
  }
  /* Reconnaissance : pont Android, sinon API web, sinon null (=> auto-évaluation) */
  function ecouteDispo() { if (LL.S.flags.micRefuse) return null; try { if (window.AndroidVoix && AndroidVoix.ecouteDispo()) return 'android'; } catch (e) { } return (window.SpeechRecognition || window.webkitSpeechRecognition) && !window.AndroidVoix ? 'web' : null; }
  var cur = null, webReco = null, timer = null;
  function clear() { if (timer) { clearTimeout(timer); timer = null; } }
  function repeter(onReady, onResult, onError) {
    var mode = ecouteDispo(); if (!mode) { onError(-1); return false; }
    cur = { onReady: onReady, onResult: onResult, onError: onError }; clear();
    timer = setTimeout(function () { arreter(); if (cur) { var c = cur; cur = null; c.onError(-2); } }, 12000);
    if (mode === 'android') { try { AndroidVoix.ecouter(); } catch (e) { clear(); cur = null; onError(-1); } return true; }
    try { var R = window.SpeechRecognition || window.webkitSpeechRecognition; webReco = new R(); webReco.lang = 'en-GB'; webReco.maxAlternatives = 5; webReco.onstart = function () { window.onEcoutePrete(); }; webReco.onresult = function (e) { var l = []; for (var i = 0; i < e.results[0].length; i++) l.push(e.results[0][i].transcript); window.onEcouteResultat(l); }; webReco.onerror = function (e) { window.onEcouteErreur(e.error === 'not-allowed' ? 9 : 7); }; webReco.start(); } catch (e) { clear(); cur = null; onError(-1); }
    return true;
  }
  function arreter() { clear(); try { if (window.AndroidVoix) AndroidVoix.arreterEcoute(); } catch (e) { } try { if (webReco) webReco.abort(); } catch (e) { } webReco = null; }
  /* Callbacks appelés par MainActivity (le micro est coupé juste après le résultat ; rien n'est enregistré) */
  window.onEcoutePrete = function () { if (cur && cur.onReady) cur.onReady(); };
  window.onEcouteResultat = function (list) { clear(); arreter(); if (!cur) return; var c = cur; cur = null; c.onResult(Array.isArray(list) ? list.map(String) : []); };
  window.onEcouteErreur = function (code) { clear(); arreter(); if (+code === 9) { LL.S.flags.micRefuse = true; if (LL.toast) LL.toast('🎤 Micro refusé : passage en mode auto-évaluation.'); } if (!cur) return; var c = cur; cur = null; c.onError(+code); };

  /* XP : complet la 1re fois, puis réduit (pas d'XP infini) */
  function valider(id, stars) { var s = LL.S, prev = s.prono.done[id] || 0, gain = stars > prev ? (stars - prev) * 4 : 1; s.prono.done[id] = Math.max(prev, stars); LL.xp('anglais', gain); return gain; }
  function autoEval(id, niveau) { return valider(id, niveau === 'facile' ? 3 : niveau === 'moyen' ? 2 : 1); }
  LL.PRONO = { EXOS: EXOS, THEMES: THEMES, score: score, lev: lev, norm: norm, ecouter: ecouter, voixDispo: voixDispo, ecouteDispo: ecouteDispo, repeter: repeter, arreter: arreter, valider: valider, autoEval: autoEval,
    pour: function (niv) { return EXOS.filter(function (e) { return e.n <= niv; }); } };
})();
