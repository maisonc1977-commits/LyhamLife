/* Lyham Life — histoire.js : épisodes d'amitié, événements familiaux, anniversaires, visites de Daryl, fin ; déclencheurs par date */
(function () {
  'use strict';
  var LL = window.LyhamLife, ST = LL.STORY = [];
  /* sc(id, type, date ISO, lieu, distribution, répliques, choix) — choix : [libellé, effets, répliques de réponse, souvenir pour l'album]
     effets : { r: {perso: ±}, f: 'drapeau', g: {jauge: ±}, x: [compétence, xp], m: argent, i: objet } ; réplique : [qui, texte, condition-drapeau optionnelle ('!' = absent)] */
  function sc(id, type, date, lieu, cast, lines, choices, extra) { var o = { id: id, type: type, from: LL.di(date), lieu: lieu, cast: cast, lines: lines, choices: choices }; if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; }); ST.push(o); return o; }
  var C = 'casimir', T = 'tania', D = 'daryl', K = 'cataleya', E = 'elynn', Y = 'lyham', N = 'noah', P = 'lopez';

  /* ================= 7 épisodes structurants d'amitié ================= */
  sc('ami_ep1', 'amitie', '2026-09-04', 'cour', [K, E], [[K, 'Lyham ! Elynn ! Nouvelle année, nouvelle classe… et on est encore ensemble, c\'est le destin !'], [E, 'Il nous faudrait un nom, comme un vrai trio. Un nom qui dure pour toujours.'], [Y, 'Un nom pour toujours… ça met la pression !'], [K, 'Allez, à toi de choisir, cheffe !']],
    [['« Les Inséparables » 💞', { r: { cataleya: 3, elynn: 3 }, f: 'trio_inseparables' }, [[E, 'Les Inséparables… J\'adore. Même si un jour on habite loin ?'], [Y, 'Surtout si un jour on habite loin.']], 'Le trio a choisi son nom : « Les Inséparables ».'],
     ['« C+E+L », comme sur la cabane 🌳', { r: { elynn: 5, cataleya: 1 }, f: 'trio_cel' }, [[E, 'Comme les lettres gravées dans la cabane quand on avait cinq ans… Tu t\'en souviens !'], [K, 'Hé, je n\'étais même pas encore là à l\'époque, mais j\'accepte d\'être une lettre !']], 'Le trio a pris le nom « C+E+L », comme les initiales gravées dans la cabane d\'Elynn.'],
     ['« Les Étoiles du mardi » ⭐', { r: { cataleya: 5, elynn: 1 }, f: 'trio_etoiles' }, [[K, 'Parce qu\'on brille au cours de danse du mardi ! C\'est parfait !'], [E, 'Et parce que les étoiles restent là même quand on ne les voit pas.']], 'Le trio s\'appelle désormais « Les Étoiles du mardi ».']]);
  sc('ami_ep2', 'amitie', '2026-12-08', 'cdi', [K], [[K, '…'], [Y, 'Cataleya ? Tu caches quoi derrière ton dos ?'], [K, 'Rien ! Bon… mon contrôle de maths. 4 sur 20. Mes parents vont me tuer. Je l\'ai caché dans mon casier.'], [K, 'Tu ne dis rien à personne, hein ? Promis ?']],
    [['L\'encourager à en parler à ses parents', { r: { cataleya: 4 }, f: 'amitie_ep2_verite', x: ['charisme', 3] }, [[Y, 'Je ne dirai rien. Mais toi, dis-le-leur. Et je t\'aide à réviser, tous les mercredis.'], [K, 'Tu ferais ça ? … D\'accord. Ce soir. Mais tu restes au téléphone avec moi après !']], 'Lyham a aidé Cataleya à avouer sa mauvaise note… et à remonter en maths.'],
     ['Garder le secret sans rien dire', { r: { cataleya: 2 }, f: 'amitie_ep2_secret' }, [[Y, 'Promis. C\'est ton secret.'], [K, 'Merci… T\'es la meilleure. Même si j\'ai l\'impression d\'avoir un caillou dans le ventre.']], 'Lyham a gardé le secret du 4/20 de Cataleya.'],
     ['En parler à Elynn pour trouver une solution', { r: { cataleya: -3, elynn: 2 }, f: 'amitie_ep2_elynn' }, [[K, 'Tu l\'as dit à Elynn ?! J\'avais dit à PERSONNE !'], [Y, 'Je voulais t\'aider… pardon.']], 'Lyham a confié le secret de Cataleya à Elynn : une petite fissure dans le trio.']]);
  sc('ami_ep3', 'amitie', '2027-04-21', 'chez_elynn', [E], [[E, 'Mes parents veulent couper le vieux chêne. Les racines abîment la maison. Et la cabane avec…'], [Y, 'Notre cabane ? Celle où on a gravé nos initiales ?'], [E, 'Je sais que c\'est bête, on est grandes maintenant. Mais j\'ai l\'impression qu\'on coupe un morceau de nous.']],
    [['Proposer à papa de déplacer la cabane dans un autre arbre', { r: { elynn: 6, casimir: 2 }, f: 'cabane_reparee', x: ['jardinage', 4] }, [[Y, 'Mon père est bricoleur… enfin, il le croit. On la démonte et on la remonte dans ton cerisier !'], [E, 'Tu ferais ça ?! Lyham… tu es la meilleure amie du monde.']], 'Avec papa, Lyham et Elynn ont sauvé la cabane en la déplaçant dans le cerisier.'],
     ['Organiser une fête d\'adieu à la cabane', { r: { elynn: 4, cataleya: 2 }, f: 'elynn_cabane_promesse' }, [[Y, 'On lui fait une vraie fête d\'adieu. Et on se promet de garder ce qu\'elle représente.'], [E, 'Une promesse de cabane. Pour toujours.']], 'Fête d\'adieu à la cabane : le trio s\'est fait une promesse pour toujours.'],
     ['Dire que c\'est un truc de bébés', { r: { elynn: -5 }, f: 'cabane_bebes' }, [[E, 'Ah. D\'accord. Pour toi, peut-être.'], [Y, '(Aïe… ce n\'était pas la bonne chose à dire.)']], 'Lyham a blessé Elynn en parlant de « truc de bébés ». À réparer…']]);
  sc('ami_ep4', 'amitie', '2027-10-12', 'danse', [K, E, P], [[P, 'Pour le gala, il me faut une soliste. Cataleya ou Elynn, décidez-vous d\'ici la semaine prochaine.'], [K, 'Ce solo, j\'en rêve depuis la 6e !'], [E, 'Moi aussi j\'y tiens… Pour une fois que j\'ose.'], [K, 'Lyham, dis-lui, toi ! Tu es avec qui ?']],
    [['Proposer une chorégraphie à trois à la place du solo', { r: { cataleya: 3, elynn: 3, lopez: 3 }, f: 'trio_mediation', x: ['danse', 5] }, [[Y, 'Et si on ne choisissait pas ? Un trio, avec un passage pour chacune.'], [P, 'Hmm… audacieux. J\'aime ça. Montrez-moi mardi.']], 'Lyham a évité la dispute en proposant une chorégraphie à trois.'],
     ['Soutenir Cataleya', { r: { cataleya: 5, elynn: -4 }, f: 'gala_cataleya' }, [[K, 'Merci ! Je savais que je pouvais compter sur toi !'], [E, '…Je vois.']], 'Lyham a soutenu Cataleya pour le solo ; Elynn s\'est sentie mise à l\'écart.'],
     ['Soutenir Elynn', { r: { elynn: 5, cataleya: -4 }, f: 'gala_elynn' }, [[E, 'Tu crois vraiment en moi ? Merci…'], [K, 'Super. Trop bien. Génial.']], 'Lyham a encouragé Elynn à oser le solo ; Cataleya a boudé une semaine.']]);
  sc('ami_ep5', 'amitie', '2028-03-21', 'danse', [K, E, P], [[P, 'Le soir du gala ! Les parents sont dans la salle. Respirez, souriez, et dansez pour vous.'], [K, 'J\'ai les jambes en coton…', '!gala_elynn'], [E, 'Mon cœur bat si fort qu\'on va l\'entendre dans la salle.'], [E, 'Le trio que tu as imaginé… on y est. On va le faire.', 'trio_mediation'], [Y, 'Avant d\'entrer en scène, je…']],
    [['…prends leurs mains : « Quoi qu\'il arrive, on est ensemble »', { r: { cataleya: 4, elynn: 4 }, f: 'gala_mains', x: ['danse', 8] }, [[K, 'Ensemble. 💛'], [E, 'Ensemble. 💚'], [P, 'Bravo, mes étoiles ! Écoutez ces applaudissements !']], 'Le gala de danse : le trio a dansé main dans la main, sous les applaudissements.'],
     ['…fais une blague pour détendre tout le monde', { r: { cataleya: 3, elynn: 2 }, f: 'gala_blague', x: ['charisme', 4] }, [[Y, 'Si on tombe, on dira que c\'est de la danse contemporaine.'], [K, 'Ha ha ! Ok, je respire !']], 'Au gala, la blague de Lyham a sauvé tout le monde du trac.'],
     ['…me concentre seule dans mon coin', { r: { cataleya: -1, elynn: -1 }, f: 'gala_seule', x: ['danse', 10] }, [[P, 'Belle technique, Lyham. Mais n\'oublie pas tes partenaires.']], 'Au gala, Lyham a brillé techniquement… mais un peu seule.']]);
  sc('ami_ep6', 'amitie', '2028-09-12', 'parc', [K, E], [[E, 'Alors voilà… c\'est officiel. Je pars au lycée horticole, à l\'autre bout de la ville.'], [K, 'Et nous, on est au lycée Victor-Hugo… On ne se verra plus qu\'au cours de danse.'], [E, 'J\'ai peur qu\'on s\'éloigne. Ça arrive à tout le monde, au lycée.']],
    [['Créer « le mardi du trio » : chaque mardi, danse puis chocolat chaud', { r: { cataleya: 4, elynn: 6 }, f: 'rituel_mardi' }, [[Y, 'On fait un rituel. Chaque mardi : danse, puis chocolat chaud au Lilas. Obligatoire. Même malades.'], [K, 'Même malades ! Signé !'], [E, 'Le mardi du trio… ❤️']], 'Naissance du « mardi du trio » : danse puis chocolat chaud au café Le Lilas, chaque semaine.'],
     ['Créer un groupe de discussion avec des photos chaque soir', { r: { cataleya: 3, elynn: 3 }, f: 'groupe_photos' }, [[K, 'Une photo par soir ! Même de nos chaussettes !'], [E, 'Surtout de tes chaussettes.']], 'Le trio s\'envoie une photo chaque soir, même des chaussettes de Cataleya.'],
     ['Dire que ça ira tout seul', { r: { elynn: -3 }, f: 'trio_laisser' }, [[E, 'Tu as sûrement raison…'], [Y, '(Elle n\'a pas l\'air convaincue.)']], 'Lyham a laissé faire le temps… Elynn s\'est sentie un peu seule cette année-là.']]);
  sc('ami_ep7', 'amitie', '2031-05-31', 'chez_elynn', [K, E], [[E, 'Dans deux semaines, le bac. Dans trois mois, chacune sa vie, peut-être dans des villes différentes.'], [K, 'Je refuse. Je déclare officiellement que je refuse.'], [E, 'On est là où tout a commencé. Il faut qu\'on se promette un truc.'], [E, 'Notre cabane a tenu bon, grâce à toi et ton père.', 'cabane_reparee'], [K, 'Sept ans de trio, dont… beaucoup de mardis !', 'rituel_mardi']],
    [['Graver une nouvelle date dans la cabane : « Promesse du bac, 2031 »', { r: { cataleya: 5, elynn: 5 }, f: 'promesse_bac', x: ['art', 3] }, [[E, 'Sous nos initiales d\'enfants. Comme ça, la cabane se souviendra.'], [K, 'Et chaque été, on revient ici. Toutes les trois.']], 'La promesse du bac est gravée dans la cabane : chaque été, le trio s\'y retrouvera.'],
     ['Écrire une lettre à ouvrir dans dix ans', { r: { cataleya: 5, elynn: 5 }, f: 'lettre_dix_ans', x: ['ecriture', 5] }, [[Y, 'Une lettre chacune, cachetée, à ouvrir en 2041. Comme Lisa et moi, les lettres, ça dure.'], [K, 'En 2041 ! J\'aurai peut-être une maison avec une piscine… ou un chat.']], 'Trois lettres ont été cachées dans la cabane, à ouvrir en 2041.']]);

  /* ================= 13 autres scènes d'amitié ================= */
  sc('ami_s01', 'amitie', '2026-10-03', 'chez_elynn', [E], [[E, 'Soirée pyjama ! Tu as apporté ta lampe de poche ?'], [Y, 'Évidemment. Et des bonbons. Beaucoup de bonbons.'], [E, 'On raconte des histoires qui font peur ou on regarde les étoiles ?']],
    [['Raconter des histoires qui font peur', { r: { elynn: 3 }, g: { fun: 10 }, f: 'pyjama_peur' }, [[E, 'AAAH ! Bon, on dort avec la lumière allumée.']], 'Soirée pyjama chez Elynn : des histoires qui font peur… et la lumière allumée toute la nuit.'],
     ['Regarder les étoiles depuis la fenêtre', { r: { elynn: 4 }, g: { fun: 6 }, f: 'pyjama_etoiles', x: ['sciences', 3] }, [[E, 'Là, c\'est Cassiopée, en forme de W. Elle sera toujours là, tu sais.']], 'Soirée pyjama : Elynn a montré Cassiopée à Lyham.']]);
  sc('ami_s02', 'amitie', '2026-11-18', 'cour', [K, N], [[N, 'Euh… Cataleya, tu… tu veux… le dernier biscuit ?'], [K, 'Noah, tu es tout rouge. Ça va ?'], [N, '(chuchote à Lyham) Aide-moi…']],
    [['Aider Noah discrètement', { r: { noah: 4, cataleya: 1 }, f: 'noah_aide' }, [[Y, 'Noah voulait juste te dire que ta chanson d\'hier était géniale.'], [K, 'Ah oui ? Merci Noah ! 😄'], [N, '(murmure) Merci Lyham…']], 'Lyham a aidé Noah à faire un compliment à Cataleya.'],
     ['Le taquiner gentiment', { r: { noah: -1, cataleya: 2 }, g: { fun: 6 }, f: 'noah_taquin' }, [[Y, 'Noah est amoureux du biscuit, voilà tout.'], [N, 'Pfff… merci beaucoup.']], 'Lyham a taquiné Noah devant Cataleya.']]);
  sc('ami_s03', 'amitie', '2027-01-27', 'cour', [K, E], [[K, 'IL NEIGE ! Bataille de boules de neige, équipes : moi contre vous deux !'], [E, 'C\'est injuste… pour toi.']],
    [['Faire équipe avec Elynn', { r: { elynn: 3, cataleya: 1 }, g: { fun: 12 }, f: 'neige_elynn' }, [[K, 'Trahison ! Bon… vous avez gagné. Cette fois.']], 'La grande bataille de boules de neige de janvier 2027.'],
     ['Rejoindre Cataleya pour équilibrer', { r: { cataleya: 3, elynn: 1 }, g: { fun: 12 }, f: 'neige_cataleya' }, [[E, 'Deux contre une ! Je proteste… en vous lançant ÇA !']], 'Bataille de neige : Lyham et Cataleya contre Elynn (qui a gagné).']]);
  sc('ami_s04', 'amitie', '2027-06-09', 'cdi', [K, E], [[E, 'Exposé de SVT pour vendredi : les abeilles. On se répartit le travail ?'], [K, 'Je fais la présentation, je suis très douée pour parler.'], [E, 'Et pour chercher les informations…']],
    [['Proposer que chacune prenne une partie', { r: { cataleya: 2, elynn: 2 }, x: ['sciences', 6], f: 'expose_partage' }, [[E, 'Parfait, c\'est juste. Je prends la pollinisation !']], 'Exposé sur les abeilles : le trio a eu 17/20.'],
     ['Tout faire seule pour que ce soit parfait', { r: { cataleya: -1, elynn: -1 }, x: ['sciences', 10], g: { energie: -15 }, f: 'expose_seule' }, [[K, 'Bon… si tu veux. Mais on aurait aimé t\'aider.']], 'Lyham a fait l\'exposé presque seule : bonne note, mais épuisée.']]);
  sc('ami_s05', 'amitie', '2027-07-15', 'plage', [K, E], [[K, 'La mer ! Enfin ! Premier arrivé dans l\'eau a gagné !'], [E, 'Attends, il faut de la crème solaire ! Et un château de sable !']],
    [['Construire le plus grand château de sable', { r: { elynn: 3 }, x: ['art', 3], f: 'plage_chateau' }, [[E, 'Il a des tours, un pont et même un donjon pour Moka !']], 'Été 2027 : un château de sable géant à la plage.'],
     ['Course jusqu\'à l\'eau', { r: { cataleya: 3 }, x: ['sport', 3], f: 'plage_course' }, [[K, 'J\'ai gagné ! … Elle est GELÉE !']], 'Été 2027 : la course dans l\'eau gelée.']]);
  sc('ami_s06', 'amitie', '2027-11-24', 'cafe', [K, E], [[K, 'J\'ai écrit une chanson. Elle s\'appelle « Trois ». Je vous la chante ?'], [E, 'Ici ? Devant tout le monde ?'], [K, 'Surtout devant tout le monde !']],
    [['L\'accompagner en tapant le rythme', { r: { cataleya: 4 }, x: ['musique', 4], f: 'chanson_trois' }, [[K, '♪ Trois cœurs, un même pas… ♪ — Merci ! Vous êtes un public formidable !']], 'Au café, Cataleya a chanté « Trois », la chanson du trio.'],
     ['Lui proposer de la jouer à la guitare plus tard', { r: { cataleya: 2 }, x: ['musique', 6], f: 'chanson_guitare' }, [[K, 'Tu ferais les accords ? Notre premier vrai morceau !']], 'Lyham a mis des accords de guitare sur la chanson de Cataleya.']]);
  sc('ami_s07', 'amitie', '2028-02-02', 'cinema', [K, E], [[E, 'Film d\'horreur ou comédie romantique ?'], [K, 'Horreur ! Elynn crie toujours, c\'est le meilleur moment.']],
    [['Comédie romantique', { r: { elynn: 2 }, g: { fun: 12 }, m: -8, f: 'cine_romance' }, [[K, 'J\'ai pleuré. Ne le dites à personne.']], 'Séance de cinéma : Cataleya a pleuré devant une comédie romantique.'],
     ['Film d\'horreur', { r: { cataleya: 2 }, g: { fun: 12 }, m: -8, f: 'cine_horreur' }, [[E, 'Je n\'ai PAS crié. C\'était… une toux.']], 'Séance de cinéma : Elynn a « toussé » très fort pendant le film d\'horreur.']], { cond: function (S) { return S.money >= 8; } });
  sc('ami_s08', 'amitie', '2028-10-18', 'cafe', [K, E], [[E, 'Je me plais au lycée horticole, mais je me sens un peu seule à la cantine.'], [K, 'On peut venir te chercher le mercredi midi !'], [E, 'Vous feriez ça ?']],
    [['Promettre de venir chaque mercredi', { r: { elynn: 5 }, f: 'mercredi_elynn' }, [[Y, 'Promis. Et on apportera des cookies.']], 'Le trio retrouve Elynn chaque mercredi midi.'],
     ['Lui conseiller de parler à quelqu\'un de sa classe', { r: { elynn: 2 }, x: ['charisme', 2], f: 'conseil_elynn' }, [[E, 'Tu as raison… il y a une fille qui adore les cactus. Je vais essayer.']], 'Grâce au conseil de Lyham, Elynn s\'est fait une nouvelle amie (fan de cactus).']]);
  sc('ami_s09', 'amitie', '2029-01-20', 'patinoire', [K, E, N], [[N, 'Je suis venu ! Je ne sais pas patiner, mais je suis venu !'], [K, 'Noah, tu tiens debout depuis trois secondes. Record !']],
    [['Apprendre à Noah à patiner', { r: { noah: 4 }, x: ['sport', 3], f: 'noah_patin' }, [[N, 'Je glisse ! Je GLISSE ! … Je tombe.']], 'Patinoire : Lyham a appris à Noah à (presque) patiner.'],
     ['Faire une course avec Cataleya', { r: { cataleya: 3 }, x: ['sport', 4], f: 'course_patin' }, [[K, 'Égalité ! On dit égalité !']], 'Patinoire : la course nulle entre Lyham et Cataleya.']]);
  sc('ami_s10', 'amitie', '2029-05-15', 'parc', [K, E], [[K, 'Choix des spécialités pour la première… Je prends musique, évidemment.'], [E, 'Moi je continue en horticulture. Et toi, Lyham ?']],
    [['Parler de ses rêves avec sincérité', { r: { cataleya: 2, elynn: 2 }, f: 'reves_partages' }, [[Y, 'J\'aimerais travailler avec les langues. Peut-être grâce à Lisa.'], [E, 'Ça te va trop bien. Tu seras traductrice ou journaliste !']], 'Le trio a partagé ses rêves d\'avenir au parc.'],
     ['Dire qu\'elle ne sait pas encore et que c\'est normal', { r: { elynn: 2 }, f: 'reves_doute' }, [[E, 'Ne pas savoir, c\'est déjà être honnête. On a le temps.']], 'Lyham a avoué ne pas encore savoir… et Elynn l\'a rassurée.']]);
  sc('ami_s11', 'amitie', '2029-11-06', 'cdi', [K], [[K, 'Lyham… mes parents se séparent. Je ne sais pas à qui le dire.'], [Y, 'Oh, Cataleya…']],
    [['L\'écouter sans rien dire et la serrer dans ses bras', { r: { cataleya: 6 }, f: 'soutien_cataleya' }, [[K, 'Merci. J\'avais juste besoin que quelqu\'un soit là.']], 'Lyham a été là pour Cataleya au moment de la séparation de ses parents.'],
     ['Lui proposer de venir dîner à la maison', { r: { cataleya: 5, casimir: 2 }, f: 'diner_cataleya' }, [[C, 'Cataleya ! Ce soir, crêpes en forme de licorne pour toi.', null], [K, 'Ton père est incroyable…']], 'Cataleya est venue dîner : papa lui a fait une crêpe licorne.']]);
  sc('ami_s12', 'amitie', '2030-06-26', 'parc', [K, E], [[E, 'Les épreuves anticipées, c\'est fini ! On fête ça ?'], [K, 'Pique-nique ! J\'ai apporté un gâteau… un peu écrasé.']],
    [['Pique-nique et photos', { r: { cataleya: 2, elynn: 2 }, g: { fun: 15 }, f: 'piquenique_eam' }, [[E, 'Celle-là, on l\'encadre. Les trois grimaces.']], 'Fin des épreuves anticipées : le pique-nique des trois grimaces.'],
     ['Nourrir les canards en refaisant les épreuves', { r: { elynn: 2 }, g: { fun: 8 }, f: 'canards_eam' }, [[K, 'Les canards ont eu 20/20 en philo, eux.']], 'Fin de première : les canards ont « passé » l\'épreuve.']]);
  sc('ami_s13', 'amitie', '2031-02-14', 'boutiques', [K, E], [[K, 'Le bal de fin d\'année ! Il nous faut des robes. Des ROBES, Lyham !'], [E, 'Je veux une robe couleur tournesol.']],
    [['Choisir trois robes assorties', { r: { cataleya: 3, elynn: 3 }, f: 'robes_assorties' }, [[K, 'Trois nuances de violet ! On sera inoubliables.']], 'Le trio a choisi des robes de bal assorties.'],
     ['Que chacune choisisse son style', { r: { cataleya: 2, elynn: 2 }, f: 'robes_libres' }, [[E, 'Tournesol pour moi, paillettes pour Cataleya, et toi… parfaite.']], 'Pour le bal, chacune a choisi son style.']]);

  /* ================= 30 événements familiaux ================= */
  sc('fam_01', 'famille', '2026-09-01', 'cuisine', [C, T], [[C, 'Petit-déjeuner spécial rentrée ! Crêpe artistique en forme de… cartable !'], [T, 'Ma grande entre en 4e… Je vais pleurer.'], [C, 'Tu es prête, championne ?']],
    [['« Prête ! » avec un grand sourire', { r: { casimir: 2, tania: 2 }, g: { fun: 5 }, f: 'rentree_4e_prete' }, [[C, 'Voilà l\'esprit ! Et ce soir, tu me racontes TOUT.']], 'Rentrée en 4e : la crêpe-cartable de papa.'],
     ['Avouer qu\'elle a un peu peur', { r: { tania: 4 }, f: 'rentree_4e_peur' }, [[T, 'C\'est normal d\'avoir peur. Le courage, c\'est d\'y aller quand même.']], 'Rentrée en 4e : maman a rassuré Lyham.']]);
  sc('fam_02', 'famille', '2026-10-10', 'cuisine', [C], [[C, 'Je lance ma collection automne-hiver de crêpes artistiques. Tu choisis le modèle !'], [Y, 'Hmm…']],
    [['Une crêpe en forme de Moka', { r: { casimir: 3 }, f: 'crepe_moka', x: ['cuisine', 2] }, [[C, 'Moka version crêpe ! Bon… il ressemble plutôt à une patate avec des oreilles.']], 'La célèbre crêpe-Moka (en forme de patate).'],
     ['Une crêpe en forme de tour Eiffel', { r: { casimir: 3 }, f: 'crepe_tour', x: ['cuisine', 2] }, [[C, 'Ambitieux ! … Elle s\'est effondrée. Comme la tour de Pise, mais en crêpe.']], 'La crêpe-tour Eiffel qui s\'est effondrée.']]);
  sc('fam_03', 'famille', '2026-11-20', 'salon', [C], [[C, 'Lyham, il est 23 h. Tu es encore sur ton téléphone.'], [Y, 'Je finis juste une vidéo…'], [C, 'Ça fait trois « juste une vidéo ». On doit parler des écrans.']],
    [['Proposer un accord : pas de téléphone à table ni après 22 h', { r: { casimir: 5 }, f: 'dispute_ecran_ok', g: { energie: 5 } }, [[C, 'Marché conclu. Et moi, pas d\'ordinateur pendant le dîner. Promis.']], 'L\'accord des écrans : pas de téléphone à table, même pour papa.'],
     ['Bouder et claquer la porte', { r: { casimir: -4 }, f: 'dispute_ecran_porte' }, [[Y, 'C\'est trop injuste !'], [C, '(soupir) On en reparlera demain, ma grande.']], 'La dispute des écrans de novembre 2026 (porte claquée).']]);
  sc('fam_04', 'famille', '2026-12-12', 'salon', [C, T], [[T, 'Le sapin est là ! Qui met l\'étoile au sommet ?'], [C, 'Moka vient de manger une guirlande.']],
    [['Mettre l\'étoile sur les épaules de papa', { r: { casimir: 2, tania: 2 }, g: { fun: 10 }, f: 'sapin_epaules' }, [[C, 'Aïe, mon dos ! … Mais quelle étoile magnifique.']], 'Décembre 2026 : l\'étoile du sapin posée sur les épaules de papa.'],
     ['Laisser maman la mettre', { r: { tania: 4 }, f: 'sapin_maman' }, [[T, 'Comme quand j\'étais petite chez ta mamie… Merci ma chérie.']], 'Maman a mis l\'étoile au sommet du sapin.']]);
  sc('fam_05', 'famille', '2026-12-24', 'salon', [C, T, D], [[D, 'Joyeux réveillon ! J\'ai apporté les chocolats… enfin, ce qu\'il en reste.'], [C, 'Daryl, tu as mangé la moitié de la boîte dans le métro ?'], [T, 'Tout le monde à table ! Lyham, tu fais le discours ?']],
    [['Faire un petit discours ému', { r: { casimir: 2, tania: 2, daryl: 2 }, x: ['charisme', 3], f: 'discours_noel' }, [[D, 'Arrête, tu vas me faire pleurer… dans ma bûche.']], 'Le discours de Noël de Lyham (Daryl a pleuré dans sa bûche).'],
     ['Lancer une partie de cartes géante', { r: { daryl: 4 }, g: { fun: 12 }, f: 'cartes_noel' }, [[D, 'Bataille générale ! Le perdant fait la vaisselle !'], [C, 'J\'ai perdu… comme chaque année.']], 'Noël 2026 : la bataille géante (papa a fait la vaisselle).']]);
  sc('fam_06', 'famille', '2027-02-12', 'salon', [T], [[T, 'Ma série reprend ce soir ! Tu regardes avec moi ? Plaid, chocolat chaud…'], [Y, 'C\'est celle avec les détectives en Écosse ?']],
    [['Accepter, plaid et chocolat', { r: { tania: 5 }, g: { fun: 10, social: 8 }, f: 'serie_maman' }, [[T, 'Notre rendez-vous du vendredi est né !']], 'Le rendez-vous du vendredi : série et chocolat avec maman.'],
     ['Préférer réviser ce soir', { r: { tania: 1 }, x: ['francais', 4], f: 'serie_non' }, [[T, 'Tu as raison… Mais la prochaine fois, je te garde une place !']], 'Lyham a préféré réviser… maman lui garde une place sur le canapé.']]);
  sc('fam_07', 'famille', '2027-04-10', 'jardin', [C], [[C, 'Opération potager ! Tomates, fraises, basilic. Tu m\'aides ?'], [Y, 'Et Moka, il va encore creuser partout.']],
    [['Planter des fraises', { r: { casimir: 3 }, x: ['jardinage', 6], f: 'potager_fraises', i: 'graines' }, [[C, 'En juin, on fera des crêpes aux fraises du jardin !']], 'Le potager de papa : les fraises plantées en avril 2027.'],
     ['Faire un épouvantail pour Moka', { r: { casimir: 2 }, g: { fun: 10 }, x: ['art', 3], f: 'epouvantail' }, [[C, 'Il ressemble à moi… C\'est voulu ?']], 'L\'épouvantail du jardin, qui ressemble étrangement à papa.']]);
  sc('fam_08', 'famille', '2027-07-01', 'salon', [C, T], [[T, 'Le bulletin de fin de 4e est arrivé…'], [C, 'Félicitations du conseil de classe ! Ma fille !'], [T, 'Il y a juste un petit commentaire en maths : « peut mieux faire ».']],
    [['Promettre de travailler les maths avec papa en 3e', { r: { casimir: 3 }, f: 'maths_papa', x: ['maths', 4] }, [[C, 'Deal. Mes pauses de 10 h 45 sont à toi.']], 'Fin de 4e : promesse de travailler les maths avec papa pendant ses pauses.'],
     ['Fêter les félicitations !', { r: { tania: 3, casimir: 1 }, g: { fun: 12 }, f: 'fete_4e' }, [[C, 'Crêpes pour tout le monde ! Même pour Moka (une petite).']], 'Fin de 4e : fête des félicitations avec crêpes.']]);
  sc('fam_09', 'famille', '2027-07-24', 'plage', [C, T], [[T, 'Journée à la mer en famille ! Ton père a oublié le parasol.'], [C, 'Je ne l\'ai pas oublié, je l\'ai… laissé à la maison volontairement.']],
    [['Construire un abri avec les serviettes', { r: { casimir: 2, tania: 2 }, g: { fun: 12 }, f: 'abri_serviettes' }, [[C, 'Génie ! Ma fille est architecte !']], 'Été 2027 : l\'abri de serviettes à la plage.'],
     ['Aller nager avec maman', { r: { tania: 4 }, x: ['sport', 3], f: 'nage_maman' }, [[T, 'Elle est froide ! Mais c\'est tellement bon !']], 'Été 2027 : la baignade avec maman.']]);
  sc('fam_10', 'famille', '2027-08-18', 'salon', [C, T], [[T, 'Lyham ! On ne trouve plus Moka ! Ni dans le jardin, ni sous les lits !'], [C, 'J\'ai vérifié le frigo… on ne sait jamais.']],
    [['Secouer sa balle rouge dans toute la maison', { r: { moka: 6, tania: 2 }, f: 'moka_balle', snd: 'miaou' }, [[Y, 'Mokaaa ! Ta balle !'], [T, 'Il était dans ton dressing ! Couché sur ton pull préféré.']], 'Le jour où Moka a disparu… et dormait dans le dressing.'],
     ['Faire des affiches dans le quartier', { r: { tania: 2, casimir: 2 }, x: ['art', 3], f: 'moka_affiches' }, [[C, 'Euh… il est sur le toit de l\'abri de jardin. Il nous regarde faire.']], 'Les affiches « Chat perdu »… alors que Moka était sur le toit.']]);
  sc('fam_11', 'famille', '2027-09-02', 'cuisine', [C, T], [[C, 'Rentrée en 3e ! L\'année du brevet. Et… surprise.'], [T, 'Ta professeure d\'anglais propose une correspondance avec une élève anglaise. Ça te tente ?'], [Y, 'Une correspondante ? En Angleterre ?']],
    [['Accepter avec enthousiasme', { r: { tania: 2 }, f: 'lisa_ok', x: ['anglais', 4] }, [[T, 'Elle s\'appelle Lisa et elle vit au nord de Londres. Première lettre lundi !']], 'Rentrée en 3e : le début de la correspondance avec Lisa.'],
     ['Accepter, un peu stressée', { r: { tania: 3 }, f: 'lisa_stress' }, [[T, 'Tu verras, ton anglais va décoller. Et je t\'aiderai au début.']], 'Rentrée en 3e : Lyham un peu stressée à l\'idée d\'écrire en anglais.']]);
  sc('fam_12', 'famille', '2027-11-16', 'cuisine', [C], [[C, '(tousse) Je vais bien… je vais très bien… (éternue)'], [Y, 'Papa, tu as de la fièvre. Retourne au lit !']],
    [['Lui préparer une soupe maison', { r: { casimir: 6 }, x: ['cuisine', 6], f: 'soupe_papa' }, [[C, 'La meilleure soupe de ma vie. Je pourrais pleurer. C\'est peut-être la fièvre.']], 'Novembre 2027 : la soupe de Lyham pour papa malade.'],
     ['Prévenir ses collègues de sa visio', { r: { casimir: 4 }, x: ['charisme', 3], f: 'visio_papa' }, [[C, 'Tu as parlé à mon chef ?! … Et il a dit « repos ». Merci, ma grande.']], 'Lyham a annulé la visio de papa malade.']]);
  sc('fam_13', 'famille', '2028-01-23', 'salon', [T], [[T, 'J\'ai retrouvé une boîte de vieilles photos. Regarde : toi à 4 ans avec Elynn, dans la cabane !'], [Y, 'On avait des couronnes en papier !']],
    [['Faire un album souvenir avec maman', { r: { tania: 5 }, x: ['art', 4], f: 'album_souvenir' }, [[T, 'Le premier album « Lyham Life ». On le continuera chaque année.']], 'L\'album souvenir commencé avec maman en janvier 2028.'],
     ['Envoyer la photo à Elynn', { r: { elynn: 4, tania: 1 }, f: 'photo_elynn' }, [[T, 'Elle va adorer. Vous étiez déjà inséparables.']], 'La photo des couronnes en papier envoyée à Elynn.']]);
  sc('fam_14', 'famille', '2028-03-14', 'salon', [C, T], [[C, 'Bon, conseil de famille : quel lycée l\'an prochain ?'], [T, 'Le lycée Victor-Hugo est tout près, avec une section euro anglais.'], [Y, 'Cataleya y va aussi…']],
    [['Choisir la section européenne anglais', { r: { tania: 2 }, x: ['anglais', 5], f: 'section_euro' }, [[T, 'Avec Lisa, tu seras imbattable !']], 'Choix du lycée : section européenne anglais.'],
     ['Choisir le lycée sans option particulière', { r: { casimir: 2 }, f: 'lycee_simple' }, [[C, 'Tu as raison, garde de l\'énergie pour la danse et ta vie.']], 'Choix du lycée : le lycée Victor-Hugo, sans option.']]);
  sc('fam_15', 'famille', '2028-07-07', 'salon', [C, T, D], [[T, 'Les résultats du brevet sont en ligne… Tu veux regarder seule ou avec nous ?'], [D, 'Avec nous ! J\'ai fait trois heures de RER pour ça !']],
    [['Regarder tous ensemble', { r: { casimir: 3, tania: 3, daryl: 3 }, f: 'brevet_ensemble' }, [[C, 'ADMISE ! MENTION ! Lyham, tu as le brevet !'], [D, 'Ma petite sœur est diplômée ! Je l\'avais dit !']], 'Juillet 2028 : le brevet découvert en famille, avec Daryl.'],
     ['Regarder seule, puis annoncer', { r: { tania: 2 }, x: ['charisme', 2], f: 'brevet_seule' }, [[Y, 'Mesdames et messieurs… j\'ai le brevet !'], [T, 'Ma chérie ! 💕']], 'Juillet 2028 : Lyham a annoncé son brevet à toute la famille.']], { cond: function () { return true; } });
  sc('fam_16', 'famille', '2028-08-12', 'parc', [C, T], [[C, 'Pique-nique ! Sandwichs, melon, et… j\'ai oublié les serviettes.'], [T, 'Cette famille et les oublis…']],
    [['Organiser un jeu de devinettes', { r: { casimir: 2, tania: 2 }, g: { fun: 10 }, f: 'devinettes' }, [[C, 'Je suis… un chat roux qui dort seize heures par jour ?'], [T, 'MOKA !']], 'Pique-nique d\'août 2028 : le jeu des devinettes.'],
     ['Nourrir les canards avec maman', { r: { tania: 3 }, g: { fun: 8 }, f: 'canards_maman' }, [[T, 'Quand tu étais petite, tu leur parlais. Tu leur donnais des prénoms.']], 'Pique-nique : les canards du parc et les souvenirs de maman.']]);
  sc('fam_17', 'famille', '2028-10-08', 'salon', [T], [[T, 'Mamie au téléphone ! Elle veut te raconter comment elle a rencontré papy.'], [Y, 'Encore l\'histoire du bal de 1975 ?']],
    [['Écouter toute l\'histoire en prenant des notes', { r: { tania: 3 }, x: ['histoire', 4], f: 'histoire_mamie' }, [[T, 'Tu sais, c\'est précieux. Ces histoires, c\'est nous.']], 'L\'histoire du bal de mamie, notée dans un carnet.'],
     ['Lui poser des questions sur sa jeunesse', { r: { tania: 4 }, x: ['charisme', 2], f: 'questions_mamie' }, [[T, 'Elle était ravie. Tu lui as fait sa semaine !']], 'Lyham a interviewé mamie sur sa jeunesse.']]);
  sc('fam_18', 'famille', '2028-11-11', 'jardin', [D], [[D, 'Petite sœur… j\'ai un secret. J\'ai quitté mon travail. Je lance ma propre entreprise de jeux vidéo.'], [D, 'Je n\'ai rien dit aux parents. J\'ai peur qu\'ils s\'inquiètent. Tu gardes ça pour toi jusqu\'à Noël ?']],
    [['Promettre de garder le secret', { r: { daryl: 6 }, f: 'daryl_secret' }, [[D, 'Merci. Et tu seras ma première testeuse officielle.']], 'Le secret de Daryl : sa propre entreprise de jeux vidéo.'],
     ['Le convaincre d\'en parler plus tôt', { r: { daryl: 3, casimir: 2 }, f: 'daryl_courage', x: ['charisme', 3] }, [[D, 'Tu as raison… ce soir, je leur dis. Tu restes à côté de moi ?']], 'Lyham a aidé Daryl à annoncer son projet aux parents.']]);
  sc('fam_19', 'famille', '2028-12-24', 'salon', [C, T, D], [[D, 'J\'ai une annonce. Mon entreprise est créée. Mon premier jeu sort au printemps.'], [C, 'QUOI ?! … Mon fils, patron ?!'], [T, 'Tu aurais pu nous le dire avant…', 'daryl_secret'], [T, 'Lyham t\'a soutenu dès le début, n\'est-ce pas ?', 'daryl_courage']],
    [['Défendre le projet de Daryl', { r: { daryl: 4, tania: 1 }, f: 'noel_daryl_defense' }, [[Y, 'Il bosse dessus depuis des mois. Et son jeu est génial, je l\'ai testé !'], [C, 'Alors… je suis fier de toi, mon fils. Vraiment.']], 'Noël 2028 : Daryl a annoncé son entreprise. Papa est fier.'],
     ['Détendre l\'atmosphère avec une blague', { r: { casimir: 2, daryl: 2 }, g: { fun: 8 }, f: 'noel_blague' }, [[Y, 'Et le personnage principal est un chat roux paresseux. Moka va toucher des droits d\'auteur !']], 'Noël 2028 : le jeu de Daryl a pour héros un chat roux.']]);
  sc('fam_20', 'famille', '2029-02-16', 'salon', [C, T], [[C, 'Panne d\'électricité dans tout le quartier ! Personne ne panique !'], [T, 'C\'est toi qui paniques, Casimir.']],
    [['Sortir les bougies et les jeux de société', { r: { casimir: 2, tania: 2 }, g: { fun: 12 }, f: 'panne_jeux' }, [[C, 'Le meilleur soir de l\'année. On devrait couper le courant plus souvent.']], 'La panne de février 2029 : bougies et jeux de société.'],
     ['Jouer de la guitare à la lumière des bougies', { r: { tania: 3 }, x: ['musique', 5], f: 'panne_guitare' }, [[T, 'C\'était magique… Rejoue celle-là encore.']], 'Concert de guitare improvisé pendant la panne.']]);
  sc('fam_21', 'famille', '2029-04-14', 'bureau', [C], [[C, 'Choix des spécialités de première. Tu veux qu\'on en parle pendant ma pause ?'], [Y, 'Je pense à maths, anglais littérature et SES…']],
    [['Garder la spécialité maths', { r: { casimir: 3 }, x: ['maths', 4], f: 'spe_maths' }, [[C, 'Et en terminale aussi ? Mes pauses restent à toi !']], 'Spécialités : Lyham garde les maths jusqu\'en terminale.'],
     ['Choisir d\'abord ce qui la passionne', { r: { casimir: 2 }, x: ['anglais', 4], f: 'spe_passion' }, [[C, 'La passion d\'abord, oui. Mais garde les maths, ça ouvre des portes !'], [Y, 'D\'accord… je garde les maths aussi.']], 'Spécialités : la passion d\'abord (et les maths quand même).']]);
  sc('fam_22', 'famille', '2029-06-15', 'jardin', [C, T], [[C, 'Fête des voisins ! J\'ai fait 80 crêpes. Pour 12 personnes.'], [T, 'Il faut que quelqu\'un aille chercher la voisine du 3e, elle est toujours seule.']],
    [['Aller chercher la voisine', { r: { tania: 3 }, x: ['charisme', 3], f: 'voisine' }, [[T, 'Elle a pleuré de joie. Tu as un grand cœur.']], 'Fête des voisins 2029 : Lyham est allée chercher la voisine du 3e.'],
     ['Animer le stand crêpes avec papa', { r: { casimir: 3 }, x: ['cuisine', 4], f: 'stand_crepes' }, [[C, '80 crêpes, 80 mangées ! Record !']], 'Fête des voisins : le stand de crêpes de papa et Lyham.']]);
  sc('fam_23', 'famille', '2029-11-03', 'salon', [T], [[T, 'Tu es rentrée à minuit et demi. Tu avais dit 23 h. Je t\'ai appelée dix fois !'], [Y, 'Mon téléphone était déchargé, et…'], [T, 'J\'étais morte d\'inquiétude, Lyham.']],
    [['S\'excuser sincèrement', { r: { tania: 2 }, f: 'dispute_maman_excuse' }, [[T, '… Merci. Va dormir. On en reparlera demain.']], 'La dispute du 3 novembre 2029 (Lyham s\'est excusée).'],
     ['Répondre qu\'elle n\'est plus une enfant', { r: { tania: -5 }, f: 'dispute_maman_colere' }, [[T, 'Justement. Une adulte prévient.'], [Y, '(Elle a les larmes aux yeux…)']], 'La dispute du 3 novembre 2029 (des mots durs).']]);
  sc('fam_24', 'famille', '2029-11-05', 'cuisine', [T], [[T, 'Je t\'ai fait un chocolat chaud. On peut parler ?'], [T, 'Tu t\'es excusée tout de suite, et ça m\'a touchée.', 'dispute_maman_excuse'], [T, 'J\'ai été dure, moi aussi. Mais j\'ai eu vraiment peur.', 'dispute_maman_colere']],
    [['Proposer un accord : un message si elle est en retard', { r: { tania: 6 }, f: 'accord_maman' }, [[T, 'Marché conclu. Et moi, j\'arrête de t\'appeler dix fois.']], 'La réconciliation avec maman et l\'accord du « petit message ».'],
     ['La prendre dans ses bras sans un mot', { r: { tania: 7 }, f: 'calin_maman' }, [[T, 'Ma grande fille… je t\'aime, tu sais.']], 'La réconciliation : un câlin silencieux avec maman.']]);
  sc('fam_25', 'famille', '2030-02-09', 'jardin', [C], [[C, 'Conduite accompagnée, leçon 1. Je suis très calme. Très, très calme.'], [Y, 'Papa, tu t\'accroches à la poignée.']],
    [['Rester concentrée et rassurer papa', { r: { casimir: 3 }, x: ['charisme', 3], f: 'conduite_calme' }, [[C, 'Tu conduis mieux que moi. Ne le dis pas à ta mère.']], 'Première leçon de conduite accompagnée avec papa (qui tenait la poignée).'],
     ['Mettre de la musique pour détendre tout le monde', { r: { casimir: 2 }, g: { fun: 8 }, f: 'conduite_musique' }, [[C, 'Avec de la musique chill, je respire. Continue comme ça.']], 'Conduite accompagnée : en musique chill, papa respire mieux.']]);
  sc('fam_26', 'famille', '2030-06-11', 'cuisine', [C, T], [[T, 'Demain, épreuve anticipée de maths. Et après-demain, l\'oral de français.'], [C, 'J\'ai préparé un petit-déjeuner de championne : crêpe en forme de « 20/20 ».']],
    [['Réviser une dernière fois avec papa', { r: { casimir: 3 }, x: ['maths', 6], f: 'eam_papa' }, [[C, 'Dérivée de x² ? … 2x ! Tu es prête.']], 'Juin 2030 : dernières révisions de maths avec papa avant l\'épreuve anticipée.'],
     ['Se reposer et regarder une série avec maman', { r: { tania: 3 }, g: { energie: 15, fun: 8 }, f: 'eam_repos' }, [[T, 'Le repos, c\'est aussi réviser. Ton cerveau range tout pendant la nuit.']], 'Veille des épreuves anticipées : série et repos avec maman.']]);
  sc('fam_27', 'famille', '2030-09-02', 'cuisine', [C, T], [[C, 'Terminale ! La dernière rentrée… Je ne suis pas prêt.'], [T, 'Elle, elle est prête. C\'est toi qui pleures dans la pâte à crêpes.']],
    [['Promettre de profiter de chaque moment', { r: { casimir: 3, tania: 3 }, f: 'terminale_profiter' }, [[C, 'Et des crêpes chaque vendredi. C\'est non négociable.']], 'Rentrée en terminale : la promesse de profiter de chaque moment.'],
     ['Annoncer son objectif pour le bac', { r: { casimir: 2, tania: 2 }, x: ['philo', 3], f: 'terminale_objectif' }, [[Y, 'Mention bien. Et un 15 en philo.'], [C, 'En philo ?! Ma fille est plus ambitieuse que Descartes.']], 'Rentrée en terminale : objectif mention bien.']]);
  sc('fam_28', 'famille', '2030-12-08', 'bureau', [C, T], [[T, 'Parcoursup ouvre bientôt. On fait le point ensemble ?'], [C, 'J\'ai fait un tableau Excel. Avec des couleurs.']],
    [['Viser une licence de langues (LLCER anglais)', { r: { tania: 3 }, x: ['anglais', 4], f: 'voeu_langues' }, [[T, 'Lisa serait tellement fière !']], 'Parcoursup : des vœux en licence de langues.'],
     ['Viser une école de journalisme après une licence', { r: { casimir: 3 }, x: ['ecriture', 4], f: 'voeu_journalisme' }, [[C, 'Ma fille journaliste ! Tu m\'interviewes sur mes crêpes ?']], 'Parcoursup : le rêve de journalisme.']]);
  sc('fam_29', 'famille', '2031-03-12', 'salon', [T], [[T, 'Moka dort de plus en plus… Le vétérinaire dit qu\'il est juste un vieux monsieur chat. Il va bien.'], [Y, 'Il a toujours sa balle rouge à côté de lui.']],
    [['Lui acheter un coussin chauffant', { r: { moka: 6, tania: 2 }, m: -10, f: 'coussin_moka' }, [[T, 'Regarde-le ronronner… Il te dit merci.']], 'Le coussin chauffant de Moka, le vieux monsieur chat.'],
     ['Passer la soirée à le câliner', { r: { moka: 8 }, g: { fun: 6 }, f: 'soiree_moka' }, [[Y, 'Tu étais là pour toutes mes années, Moka. Merci.']], 'Une soirée entière de câlins avec Moka.']]);
  sc('fam_30', 'famille', '2031-05-30', 'cuisine', [C, T, D], [[C, 'Dernier grand dîner avant tes révisions. Menu : TOUTES les crêpes artistiques depuis la 4e.'], [D, 'Même la tour Eiffel effondrée ?', 'crepe_tour'], [D, 'Même la Moka-patate ?', 'crepe_moka'], [T, 'Sept ans de souvenirs dans une poêle.']],
    [['Porter un toast à la famille', { r: { casimir: 3, tania: 3, daryl: 3 }, x: ['charisme', 3], f: 'toast_famille' }, [[Y, 'À papa, maman, Daryl… et Moka. Vous êtes ma plus grande force.'], [D, 'Arrête, il y a de la farine dans mes yeux. C\'est la farine.']], 'Le dernier grand dîner avant le bac : le toast de Lyham.'],
     ['Proposer de faire la dernière crêpe elle-même', { r: { casimir: 5 }, x: ['cuisine', 5], f: 'derniere_crepe' }, [[C, 'Une crêpe en forme de… diplôme ! L\'élève a dépassé le maître.']], 'La crêpe-diplôme de Lyham, la veille des révisions.']]);

  /* ================= Anniversaires : 3 scènes par anniversaire (préparation, moment principal, conséquence), chaque année ================= */
  var CADEAUX = {
    tania: [['un coffret de sa série préférée', 'un bouquet et un poème écrit à la main', 'un album photo fait main'], ['un plaid tout doux pour les soirées série', 'une chanson à la guitare', 'un petit-déjeuner au lit'], ['des places pour un concert', 'une lettre de tous les souvenirs de l\'année', 'une plante à fleurs pour le salon'], ['un atelier poterie à deux', 'un cadre avec une photo de famille', 'un gâteau fait maison'], ['un week-end « entre filles » organisé', 'un carnet de recettes de famille', 'une vidéo avec les messages de toute la famille']],
    casimir: [['un tablier « Chef des crêpes »', 'une tasse « Meilleur papa (en visio) »', 'une playlist pour cuisiner'], ['une poêle à crêpes professionnelle', 'un cadre pour son bureau', 'un dessin de Moka'], ['un livre de recettes du monde', 'un casque confortable pour ses visios', 'un repas cuisiné par Lyham'], ['un cours de pâtisserie à deux', 'un album « papa en crêpes »', 'une plante pour son bureau'], ['une montre gravée « Merci pour tout »', 'une lettre lue à voix haute', 'un tablier signé par toute la famille']]
  };
  function anniversaires() {
    for (var y = 2027; y <= 2031; y++) {
      var k = y - 2027, age = y - LL.LYHAM_BIRTH_YEAR;
      // Lyham — 11 janvier
      sc('anniv_lyham_' + y + '_prep', 'anniv', y + '-01-09', 'salon', [C, T], [[T, 'Psst… Ton anniversaire approche ! ' + age + ' ans… Tu as envie de quoi, cette année ?'], [C, 'J\'ai déjà une idée de crêpe-gâteau. Top secret.']],
        [['Une fête avec Cataleya et Elynn', { r: { cataleya: 2, elynn: 2 }, f: 'anniv' + y + '_amies' }, [[T, 'Noté ! On invitera le trio.']], 'Anniversaire ' + y + ' : Lyham a choisi de fêter avec ses amies.'],
         ['Un dîner en famille, avec Daryl', { r: { tania: 2, daryl: 2 }, f: 'anniv' + y + '_famille' }, [[C, 'Daryl a déjà dit oui. Il apporte… un cadeau mystère.']], 'Anniversaire ' + y + ' : un dîner en famille avec Daryl.'],
         ['Une soirée pyjama à la maison', { r: { elynn: 2, tania: 1 }, f: 'anniv' + y + '_pyjama' }, [[T, 'Pyjamas, film et pop-corn. Parfait.']], 'Anniversaire ' + y + ' : soirée pyjama à la maison.']]);
      sc('anniv_lyham_' + y + '_jour', 'anniv', y + '-01-11', 'salon', [C, T, D], [[C, 'JOYEUX ANNIVERSAIRE ! 🎉 Voici la crêpe-gâteau à ' + age + ' bougies !'], [D, 'Joyeux anniversaire, petite sœur ! Tu as vieilli. Beaucoup.'], [T, 'Fais un vœu, ma chérie.'], [K, 'Et nous, on a apporté un gâteau en plus ! On n\'est jamais trop !', 'anniv' + y + '_amies']],
        [['Souffler en faisant un vœu pour toute la famille', { r: { casimir: 2, tania: 2, daryl: 2 }, g: { fun: 15, social: 15 }, f: 'voeu_' + y }, [[T, 'Tu ne le dis pas, sinon il ne se réalise pas !']], 'Les ' + age + ' ans de Lyham : un vœu pour toute la famille.', 'fanfare'],
         ['Ouvrir d\'abord le cadeau mystère de Daryl', { r: { daryl: 4 }, g: { fun: 15 }, f: 'cadeau_daryl_' + y }, [[D, ['Une manette rose ! Comme ça tu n\'as plus d\'excuse quand tu perds.', 'Un vieux jeu vidéo de quand j\'étais petit. Mon trésor, maintenant le tien.', 'Un appareil photo instantané. Pour garder chaque moment.', 'Une clé USB… avec le premier niveau de mon jeu, et ton prénom dedans.', 'Une valise. Pour aller voir Lisa en Angleterre, un jour.'][k]]], 'Les ' + age + ' ans : le cadeau mystère de Daryl.', 'fanfare']]);
      sc('anniv_lyham_' + y + '_apres', 'anniv', y + '-01-13', 'chambre', [], [[Y, 'Encore un peu de crêpe-gâteau au petit-déjeuner… Comment remercier tout le monde ?']],
        [['Écrire une carte de remerciement à chacun', { r: { casimir: 2, tania: 2, daryl: 2 }, x: ['ecriture', 3], f: 'merci_' + y }, [[Y, '« Merci d\'être ma famille. » Simple, mais vrai.']], 'Après ses ' + age + ' ans, Lyham a écrit une carte à chacun.'],
         ['Préparer le dîner pour remercier papa et maman', { r: { casimir: 3, tania: 3 }, x: ['cuisine', 4], f: 'diner_merci_' + y }, [[Y, 'Ce soir, c\'est moi la cheffe !']], 'Après ses ' + age + ' ans, Lyham a cuisiné pour ses parents.']]);
      // Tania — 31 mars
      var ct = CADEAUX.tania[k];
      sc('anniv_tania_' + y + '_prep', 'anniv', y + '-03-27', 'bureau', [C], [[C, 'Opération anniversaire de maman ! Le 31 mars. Discrétion absolue. Quel cadeau ?']],
        ct.map(function (g, i) { return ['Offrir ' + g, { r: { casimir: 1 }, f: 'cadeau_maman_' + y + '_' + i }, [[C, 'Excellente idée ! Elle va adorer.']], 'Anniversaire de maman ' + y + ' : le cadeau choisi — ' + g + '.']; }));
      sc('anniv_tania_' + y + '_jour', 'anniv', y + '-03-31', 'salon', [C, T], [[C, 'SURPRISE ! Joyeux anniversaire, Tania !'], [T, 'Oh ! Vous êtes fous ! Qu\'est-ce que c\'est ?'], [T, 'Mes épisodes ! Tu me connais par cœur !', 'cadeau_maman_' + y + '_0'], [T, 'C\'est toi qui l\'as fait ? Ma chérie…', 'cadeau_maman_' + y + '_1'], [T, 'Je vais le garder toute ma vie.', 'cadeau_maman_' + y + '_2']],
        [['La serrer dans ses bras', { r: { tania: 5 }, g: { social: 10 }, f: 'anniv_maman_surprise' }, [[T, 'Le plus beau cadeau, c\'est vous deux.']], 'Les ' + (y === 2027 ? '' : '') + 'anniversaires de maman : le câlin de ' + y + '.', 'fanfare'],
         ['Chanter « Joyeux anniversaire » avec papa (faux)', { r: { tania: 3, casimir: 2 }, g: { fun: 12 }, f: 'chanson_maman_' + y }, [[T, 'Vous chantez horriblement mal… et c\'est parfait.']], 'Anniversaire de maman ' + y + ' : la chanson (très) fausse.', 'fanfare']]);
      sc('anniv_tania_' + y + '_apres', 'anniv', y + '-04-02', 'salon', [T], [[T, 'Tu sais, j\'utilise ton cadeau tous les jours. Il me rend heureuse à chaque fois.']],
        [['Lui proposer de le partager ensemble ce soir', { r: { tania: 3 }, g: { social: 8 }, f: 'partage_maman_' + y }, [[T, 'Ce soir, toi et moi. C\'est noté.']], 'Après l\'anniversaire de maman ' + y + ' : une soirée rien qu\'à deux.'],
         ['Lui dire qu\'elle mérite encore plus', { r: { tania: 4 }, f: 'merite_maman_' + y }, [[T, 'Tu me fais rougir… Viens là.']], 'Après l\'anniversaire de maman ' + y + ' : des mots qui comptent.']]);
      // Casimir — 3 mai
      var cc = CADEAUX.casimir[k];
      sc('anniv_casimir_' + y + '_prep', 'anniv', y + '-04-30', 'salon', [T], [[T, 'L\'anniversaire de ton père, c\'est le 3 mai. On lui offre quoi ? Pas encore une cravate, par pitié.']],
        cc.map(function (g, i) { return ['Offrir ' + g, { r: { tania: 1 }, f: 'cadeau_papa_' + y + '_' + i }, [[T, 'Il va être tellement ému. Il pleure facilement, ton père.']], 'Anniversaire de papa ' + y + ' : le cadeau choisi — ' + g + '.']; }));
      sc('anniv_casimir_' + y + '_jour', 'anniv', y + '-05-03', 'cuisine', [C, T, D], [[T, 'Joyeux anniversaire, Casimir !'], [D, 'Joyeux anniversaire, papa ! Tu as quel âge déjà ? 100 ?'], [C, 'Oh… pour moi ? Vous êtes… (renifle) … je ne pleure pas, c\'est l\'oignon.'], [C, 'Je l\'utiliserai pour chaque crêpe ! Chaque ! Crêpe !', 'cadeau_papa_' + y + '_0']],
        [['Lui faire un gros câlin', { r: { casimir: 5 }, f: 'cadeau_papa' }, [[C, 'Ma grande… merci. Tu grandis trop vite.']], 'Anniversaire de papa ' + y + ' : le câlin et les « larmes d\'oignon ».', 'fanfare'],
         ['Lui préparer une crêpe artistique à son tour', { r: { casimir: 4 }, x: ['cuisine', 4], f: 'crepe_pour_papa_' + y }, [[C, 'Une crêpe… en forme de MOI ? C\'est le plus beau jour de ma vie.']], 'Anniversaire de papa ' + y + ' : Lyham lui a fait une crêpe à son effigie.', 'fanfare']]);
      sc('anniv_casimir_' + y + '_apres', 'anniv', y + '-05-05', 'bureau', [C], [[C, 'Regarde, j\'ai mis ton cadeau bien en vue dans mon bureau. Mes collègues en visio l\'ont tous remarqué !']],
        [['« Tu le mérites, papa »', { r: { casimir: 3 }, f: 'merite_papa_' + y }, [[C, 'Et toi, tu mérites le meilleur. Allez, file avant que je pleure encore.']], 'Après l\'anniversaire de papa ' + y + ' : le cadeau trône dans son bureau.'],
         ['Lui proposer une pause crêpes cet après-midi', { r: { casimir: 4 }, g: { fun: 6 }, f: 'pause_crepes_' + y }, [[C, 'À 16 h pile. Ma pause est à toi.']], 'Après l\'anniversaire de papa ' + y + ' : la pause crêpes de 16 h.']]);
    }
  }
  anniversaires();

  /* ================= Visites mensuelles de Daryl (premier samedi du mois) ================= */
  var DARYL = [
    ['Revanche à la console ? Je me suis entraîné tout le mois.', ['Accepter la revanche', 'daryl_revanche'], ['Proposer une balade au parc', 'daryl_balade']],
    ['J\'ai rapporté des croissants. Enfin, deux. J\'ai mangé les autres.', ['Partager les croissants', 'daryl_croissants'], ['Le taquiner sur sa gourmandise', 'daryl_taquin']],
    ['Raconte-moi ton mois. En entier. Je veux tout savoir.', ['Tout lui raconter', 'daryl_confidences'], ['Lui demander d\'abord des nouvelles de lui', 'daryl_nouvelles']],
    ['Papa m\'a demandé de réparer l\'imprimante. Tu m\'aides ?', ['L\'aider à réparer', 'daryl_imprimante'], ['Filmer la scène pour en rire', 'daryl_film']],
    ['Tu veux voir les dessins de mon prochain jeu ?', ['Donner son avis honnête', 'daryl_avis'], ['Proposer une idée de personnage', 'daryl_idee']],
    ['Moka m\'a reconnu ! Enfin, il m\'a griffé. C\'est pareil.', ['Jouer avec Moka et Daryl', 'daryl_moka'], ['Consoler Daryl', 'daryl_console']],
    ['On cuisine pour les parents ce midi ? Surprise !', ['Cuisiner ensemble', 'daryl_cuisine'], ['Mettre la table en mode restaurant', 'daryl_table']],
    ['Tu as besoin d\'aide pour tes devoirs ? Je suis nul en maths, mais motivé.', ['Lui expliquer elle-même', 'daryl_prof'], ['Faire les devoirs ensemble', 'daryl_devoirs']]
  ];
  LL.darylVisitScene = function () {
    var S = LL.S, n = S.darylVisits, v = DARYL[n % DARYL.length], id = 'daryl_' + LL.year(S.day) + '_' + LL.md(S.day)[0];
    return { id: id, type: 'daryl', titre: 'Visite de Daryl', lieu: null, cast: [D], recurring: true,
      lines: [[D, ['Yo petite sœur !', 'Salut la famille !', 'Coucou les gens que j\'aime !'][n % 3]], [D, v[0]]],
      choices: [[v[1][0], { r: { daryl: 3 }, g: { fun: 10, social: 10 }, f: v[1][1] }, [[D, 'C\'est pour ça que je viens chaque mois. 😄']], 'Visite de Daryl : ' + v[1][0].toLowerCase() + '.'], [v[2][0], { r: { daryl: 2 }, g: { fun: 8, social: 8 }, f: v[2][1] }, [[D, 'Haha, t\'es incroyable.']], 'Visite de Daryl : ' + v[2][0].toLowerCase() + '.']] };
  };

  /* ================= Le bac et la fin ================= */
  sc('fin_veille', 'fin', '2031-06-15', 'chambre', [C, T], [[T, 'Demain, la philo… Tu as fait 14 jours de révisions, tu es prête.'], [C, 'Ta crêpe de demain matin est déjà prévue. Elle aura la forme d\'une chouette. Symbole de la philosophie !'], [Y, 'Je suis stressée et contente à la fois.']],
    [['Relire une dernière fois ses fiches puis dormir', { r: { tania: 2 }, g: { energie: 20 }, f: 'veille_fiches' }, [[T, 'Bonne nuit, future bachelière.']], 'La veille du bac : dernières fiches et nuit calme.'],
     ['Appeler Cataleya et Elynn', { r: { cataleya: 2, elynn: 2 }, g: { social: 20 }, f: 'veille_amies' }, [[K, 'Demain, on gère. On est les meilleures !', null], [E, 'Respire. Pense à la cabane.']], 'La veille du bac : un appel au trio.']]);
  sc('fin_bac', 'fin', '2031-06-16', 'cour', [K, E], [[K, 'C\'est le grand jour ! Épreuve de philo : 4 heures !'], [E, 'Trois sujets au choix. Tu prends lequel ?'], [Y, 'Je lis les trois, je respire… et je choisis celui où je vois un vrai problème.']],
    [['Choisir la dissertation', { x: ['philo', 20], f: 'bac_dissertation' }, [[Y, '(Problématique, plan, exemples… comme pendant les révisions.)']], 'Le bac de philosophie : Lyham a choisi la dissertation.'],
     ['Choisir l\'explication de texte', { x: ['philo', 20], f: 'bac_explication' }, [[Y, '(Thèse, mouvement du texte, enjeu… exactement comme au bac blanc.)']], 'Le bac de philosophie : Lyham a choisi l\'explication de texte.']], { final: true });

  /* ================= Moteur des épisodes ================= */
  var BYID = {}; ST.forEach(function (s) { BYID[s.id] = s; });
  LL.storyById = function (id) { return BYID[id] || (id.indexOf('daryl_') === 0 ? LL.darylVisitScene() : null); };
  function st(id) { return LL.S.events[id] || 'locked'; }
  LL.storyStatus = st;
  LL.availableScenes = function () { return ST.filter(function (s) { return st(s.id) === 'available'; }); };
  LL.checkStory = function () {
    var S = LL.S, news = 0;
    ST.forEach(function (s) { if (st(s.id) === 'locked' && S.day >= s.from && (!s.cond || s.cond(S))) { S.events[s.id] = 'available'; news++; } });
    if (LL.darylVisitDay(S.day) && S.min >= 660 && S.min < 1110 && LL.PLACES[S.place].zone === 'maison') { var dv = LL.darylVisitScene(); if (!S.events[dv.id]) { S.events[dv.id] = 'available'; news++; } }
    if (news && LL.toast) LL.toast('📖 ' + (news > 1 ? news + ' nouveaux épisodes' : 'Un nouvel épisode') + ' à vivre !');
    // lecture automatique quand Lyham est au bon endroit, pendant la fenêtre de l'événement
    if (LL.ui && LL.ui.sceneOpen && !LL.ui.sceneOpen() && !LL.M.busy()) {
      var modal = document.getElementById('modal'); if (modal && modal.classList.contains('on')) return;
      var cand = ST.filter(function (s) { return st(s.id) === 'available' && S.day - s.from <= 10 && (!s.lieu || s.lieu === S.place || (s.type !== 'amitie' && LL.PLACES[S.place].zone === 'maison' && LL.ZONES.maison.indexOf(s.lieu) >= 0)); });
      var dvs = Object.keys(S.events).filter(function (k) { return k.indexOf('daryl_') === 0 && S.events[k] === 'available'; });
      if (cand.length) LL.ui.playScene(cand[0].id); else if (dvs.length && LL.PLACES[S.place].zone === 'maison') LL.ui.playScene(dvs[0]);
    }
  };
  /* Applique un choix : effets persistants + souvenir dans l'album */
  LL.applyChoice = function (scene, idx) {
    var S = LL.S, ch = scene.choices[idx]; if (!ch || st(scene.id) === 'done') return null; var e = ch[1] || {};
    if (e.r) Object.keys(e.r).forEach(function (k) { LL.rel(k, e.r[k]); });
    if (e.g) LL.add(e.g); if (e.x) LL.xp(e.x[0], e.x[1]); if (e.m) LL.money(e.m); if (e.i) LL.giveItem(e.i);
    if (e.f) S.flags[e.f] = S.day; S.flags[scene.id + '_c' + idx] = S.day;
    S.flags.souvenirs = (S.flags.souvenirs || []).concat([{ d: S.day, t: ch[3] || ch[0], type: scene.type }]).slice(-300);
    if (ch[4]) LL.son(ch[4]);
    S.events[scene.id] = 'done'; if (scene.type === 'daryl') S.darylVisits++;
    LL.log('📖 ' + (scene.titre || titreDe(scene)) + ' — ' + ch[0]);
    if (scene.final) { S.flags.bacPasse = S.day; if (S.outfits.indexOf('toge') < 0) S.outfits.push('toge'); }
    if (LL.save) LL.save(); return ch;
  };
  function titreDe(s) { var T = { famille: 'Famille', amitie: 'Amitié', anniv: 'Anniversaire', daryl: 'Visite de Daryl', fin: 'Le bac' }; return T[s.type] || 'Épisode'; }
  LL.sceneTitre = function (s) { if (s.titre) return s.titre; if (s.type === 'anniv') { var p = s.id.split('_'); return '🎂 Anniversaire de ' + ({ lyham: 'Lyham', tania: 'maman', casimir: 'papa' }[p[1]]) + ' (' + ({ prep: 'préparation', jour: 'le grand jour', apres: 'le lendemain' }[p[3]]) + ')'; } if (/^ami_ep/.test(s.id)) return '💛 Épisode d\'amitié ' + s.id.slice(-1) + '/7'; return { famille: '🏠 Événement familial', amitie: '💛 Moment entre amies', fin: '🎓 Le bac', daryl: '🎮 Visite de Daryl' }[s.type]; };
  LL.lineText = function (l) { if (!l) return null; if (l[2] && l[2][0] === '!') return LL.S.flags[l[2].slice(1)] ? null : l[1]; if (l[2]) return LL.S.flags[l[2]] ? l[1] : null; return l[1]; };

  /* Conclusion : reprend les liens d'amitié et de famille réellement construits */
  LL.conclusion = function () {
    var S = LL.S, f = S.flags, r = S.rel, out = [];
    out.push('🎓 Juillet 2031. Les résultats tombent : Lyham est bachelière' + (S.bacRevision.prep.philo + S.bacRevision.prep.anglais + S.bacRevision.prep.maths > 210 ? ', avec mention !' : ' !'));
    var nom = f.trio_inseparables ? '« Les Inséparables »' : f.trio_cel ? '« C+E+L »' : f.trio_etoiles ? '« Les Étoiles du mardi »' : 'le trio';
    out.push('💛 ' + nom + ' fête la nouvelle ' + (f.rituel_mardi ? 'un mardi soir, évidemment, au café Le Lilas.' : 'au parc, comme au bon vieux temps.') + (f.promesse_bac ? ' Dans la cabane, la « promesse du bac » attend le prochain été.' : f.lettre_dix_ans ? ' Trois lettres attendent 2041 dans la cabane.' : ''));
    out.push(r.cataleya >= 70 && r.elynn >= 70 ? 'Cataleya et Elynn sont plus que des amies : des sœurs choisies.' : 'L\'amitié a connu des hauts et des bas, mais elle est toujours là.');
    out.push('🏠 ' + (r.casimir >= 75 ? 'Papa prépare une crêpe artistique en forme de diplôme' + (f.derniere_crepe ? ', avec la poêle que Lyham lui a appris à manier.' : '.') : 'Papa serre sa fille dans ses bras, ému.') + ' ' + (r.tania >= 75 ? 'Maman, fière, ajoute une dernière page à l\'album « Lyham Life ».' : 'Maman a les larmes aux yeux.'));
    out.push('🎮 Daryl ' + (f.daryl_secret || f.daryl_courage ? 'offre à sa sœur le dernier niveau de son jeu… dont l\'héroïne lui ressemble beaucoup.' : 'promet une revanche « digne d\'une bachelière ».'));
    if (S.rel.lisa > 30) out.push('💌 Une lettre arrive de Wellbrook : « Congratulations, Lyham! ' + (f.lisa_invitation ? 'Your room is ready: Biscuit is waiting for you this summer!' : 'I am so proud of you!') + ' »');
    out.push('🐱 Moka, le vieux monsieur chat, dort sur la toge de diplôme' + (f.coussin_moka ? ', sur son coussin chauffant.' : '.'));
    out.push('Fin… ou plutôt, le début d\'une nouvelle histoire. Merci d\'avoir joué à Lyham Life ! 💜');
    return out;
  };
  LL.STATS_HISTOIRE = function () { var c = { famille: 0, amitie: 0, anniv: 0, fin: 0, episodes: 0 }; ST.forEach(function (s) { c[s.type] = (c[s.type] || 0) + 1; if (/^ami_ep/.test(s.id)) c.episodes++; }); return c; };
})();
