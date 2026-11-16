# Lyham Life — Rapport de tests (version 1.0, versionCode 1)

Environnement de test : Linux, Node.js 24, Chromium headless 1228 (Playwright), OpenJDK 17.
**Pas d'Android SDK ni de Gradle** dans l'environnement, et les téléchargements de Gradle et des outils Android ont été refusés (HTTP 403). L'APK n'a donc **pas** été compilé ici : la compilation est assurée par le workflow GitHub Actions fourni.

Légende :
- **TESTÉ** = exécuté réellement, résultat observé ;
- **VÉRIFIÉ STATIQUEMENT** = contrôlé sans exécution sur la plateforme cible ;
- **NON TESTÉ** = non exécuté (dépend du téléphone ou de GitHub).

## 1. Synthèse

| Test | Commande / méthode | Résultat | Statut |
|---|---|---|---|
| Syntaxe de tous les scripts | `node --check` sur les 11 fichiers JS | 0 erreur | TESTÉ |
| Validation des données | `node tests/validate-data.js` | ✅ toutes valides (détail §3) | TESTÉ |
| Smoke tests navigateur | `tests/smoke.html` dans Chromium headless | **41 / 41 réussis** | TESTÉ |
| Bout en bout (vraie page `index.html`, viewport 412×900, toucher) | script Playwright | marche, changement de lieu, bouton d'action, bulle tactile, rechargement identique ; 0 erreur console | TESTÉ |
| Console | toutes les sessions Chromium | aucune erreur ni avertissement | TESTÉ |
| Java | `javac --release 17` contre des stubs d'API Android | compile sans erreur | VÉRIFIÉ STATIQUEMENT |
| XML (manifeste, ressources) | analyse XML | 4 fichiers valides | VÉRIFIÉ STATIQUEMENT |
| Fichiers de configuration imposés | comparaison octet par octet | identiques au cahier des charges ; YAML valide | VÉRIFIÉ STATIQUEMENT |
| `gradle assembleDebug` | — | non exécutable ici (pas de SDK, réseau 403) | NON TESTÉ |
| ZIP final | liste relue après compression | 25 fichiers attendus présents | TESTÉ |

## 2. Détail des tests du cahier des charges

| # | Exigence | Résultat observé | Statut |
|---|---|---|---|
| 1 | Aucune erreur console | 0 erreur dans toutes les sessions (jeu, tests, captures) | TESTÉ |
| 2 | Chaque lieu visité, chaque action lancée | 29 lieux ; 111 actions lancées. 20 actions conditionnelles (ex. plage hors saison) ont eu leur condition forcée pour tester leur effet ; leurs messages de refus sont testés à part | TESTÉ |
| 2b | Interactions personnages | 95 interactions (discuter, câlin, check, danser, blague, selfie, cupcake, cartes, jardiner, question, conseil, aider papa) | TESTÉ |
| 3 | Simulation de 400 jours | 400 jours (jusqu'au 6 oct. 2027, en 3e) ; 5 027 actions, 1 375 interactions, 41 scènes, lettres ; aucune exception, jauges toujours dans 0–100, aucun NaN | TESTÉ |
| 4 | Quiz et brevet : une seule bonne réponse, exacte | 300 questions : 4 propositions distinctes chacune ; 47 réponses numériques recalculées par programme (aucune autre proposition égale) ; 6 réponses algébriques testées par évaluation en 5 points ; brevet : 14 exercices, réponses numériques recalculées | TESTÉ |
| 5 | Révisions du bac | 14 journées × 3 matières × 3 activités = 126 ; corrections objectives (QCM, numérique avec tolérance, grilles de critères pour les réponses ouvertes) ; XP réduit quand on refait un exercice (1 XP au lieu de 15) ; brouillon conservé après sauvegarde et rechargement ; bilans des jours 7 et 14 ; prononciation avec repli auto-évaluation ; chronomètre qui valide automatiquement ; enchaînement veille du bac → épreuve → conclusion | TESTÉ |
| 6 | Volumes (comptés par script) | 300 questions (60 par matière, 5 niveaux) ; 65 exercices de prononciation ; 46 lettres écrites + lettres hebdomadaires générées ensuite (160 testées, aucune en double) ; 30 événements familiaux ; 20 scènes d'amitié dont 7 épisodes ; 45 scènes d'anniversaire (3 × 3 personnes × 5 ans) ; 1 750 jours jouables, dont 841 jours de cours | TESTÉ |
| 7 | Gradle, XML, Java, arborescence | voir §1 ; 25/25 fichiers présents | VÉRIFIÉ STATIQUEMENT |
| 8 | Audio | 59 effets + notes de piano/guitare + voix « blabla » sans erreur ; 6 styles + « Ma playlist » ; 🔇 met le gain maître à 0,000 ; la musique s'arrête en quittant la chambre et au coucher ; pause/reprise en arrière-plan | TESTÉ (signal Web Audio, pas d'écoute humaine) |
| 9 | Prononciation | pont Android simulé : « tree » pour « three » → 2★, lettres fautives marquées, conseil sur le « th » ; « three » → 3★ ; micro arrêté après le résultat ; refus du micro (code 9) → auto-évaluation ; sans reconnaissance → Facile / Moyen / Difficile proposés | TESTÉ (avec pont simulé) |
| 10 | Emploi du temps de papa | bureau lun.–ven. 9 h–12 h et 13 h–18 h ; cuisine 12 h–13 h et 18 h 30–20 h ; pas de bureau le week-end ; visio à 10 h 20, pause à 10 h 50 ; message « Chut… papa est en visio » | TESTÉ |
| 11 | Smoke : scripts, API, boutons | API `render, go, act, pass, add, xp, log, save, load` et callbacks Android présents ; aucun bouton visible sans action | TESTÉ |
| 12 | Sauvegarde → rechargement | jour, heure, lieu, jauges, liens, argent, XP, inventaire, événements, réglages audio identiques (test interne + vrai rechargement de page) | TESTÉ |
| 13 | Limites | jauges 0/100 ; 0 pièce (achat refusé) ; inventaire vide ; minuit (nouveau jour + coucher forcé) ; passage 4e → 3e ; anniversaire du 11/01 ; visite de Daryl (1er samedi du mois) ; vacances (collège fermé + message) ; refus du micro ; sauvegarde corrompue (nouvelle partie sans plantage) ; migration d'une sauvegarde v1 | TESTÉ |
| 14 | `gradle assembleDebug` | environnement sans SDK et sans accès réseau | NON TESTÉ |
| 15 | Captures | 16 captures produites (salon et balle, cuisine avec papa, bureau, chambre en musique, télé, prononciation, collège, danse, etc.) | TESTÉ |
| 16 | Distinction des statuts | appliquée dans ce rapport | — |

Mesure de fluidité (indicative) : 57–59 images/s dans Chromium headless sur PC. Non mesuré sur téléphone.

## 3. Corrections effectuées pendant les tests

1. Danse à deux : une récursion infinie (« Maximum call stack size exceeded ») → l'animation passe par la boucle principale.
2. 🔇 ne coupait le son qu'à 23 % → coupure immédiate du gain maître (0,000 mesuré).
3. Minuit : le jour n'avançait pas correctement lors du coucher forcé → nouveau jour puis réveil à 7 h.
4. Moteur audio saturé pendant la simulation longue (blocage vers le jour 350) → limiteur de 24 sons par demi-seconde.
5. Interro surprise de maths : ouvrait un quiz vide (mauvais code de matière) → corrigé.
6. Fonctions vides dans les actions qui ouvrent un écran → remplacées par de vrais effets (`ouvrir(...)`).
7. Emojis absents sur certains appareils : boutons du haut vides → détection et symboles de repli (✉ ≡ ★ ♪), pastilles lettrées dans la scène.
8. Divers éléments visuels : Mme Lopez masquait Lyham, papa assis avec casque en visio, Lyham allongée correctement sur le lit, quiz : fausse alerte du validateur (« 3e »), explication trop courte.

Après corrections : syntaxe OK, validation OK, smoke 41/41, bout en bout OK.

## 4. Choix faits et sources

- **Calendrier** : jour 0 = mardi 1er septembre 2026 (rentrée de 4e), fin le lundi 16 juin 2031 (philosophie). Zone C. Vacances 2026-2028 selon les calendriers publiés ; **2028-2031 estimées** sur le schéma habituel (non publiées).
- **Dates d'examen estimées** : brevet le 26 juin 2028 (préparation du 19 au 25 juin) ; épreuve anticipée de maths le 12 juin 2030 ; révisions du 2 au 15 juin 2031 ; philosophie le 16 juin 2031.
- **Philosophie** : 4 heures, coefficient 8, au choix deux dissertations ou une explication de texte — vérifié sur les sujets officiels 2025 et 2026 (education.gouv.fr, eduscol).
- **Brevet** : depuis 2026, maths en 2 h (20 min d'automatismes sans calculatrice, puis 1 h 40 de problèmes) ; note 60 % épreuves / 40 % contrôle continu — vérifié (education.gouv.fr ; BO n°33 du 4 septembre 2025).
- **Anglais** : présenté comme évalué en contrôle continu, selon l'indication du cahier des charges ; non revérifié ici pour la session 2031.
- **Lettres de Lisa** : 46 lettres écrites (A1 → B2, phrases de 7,9 à 10,1 mots en moyenne), puis lettres hebdomadaires de niveau lycée composées à partir de banques de phrases distinctes.
- **Emojis** : détectés au démarrage ; si absents, remplacés par des symboles ou des pastilles (Android 7 n'a pas tous les emojis récents).

## 5. Limites (non testé / dépend du téléphone)

- Compilation de l'APK (GitHub Actions) et installation : **NON TESTÉ** ici.
- Voix anglaise Android (TextToSpeech en-GB) et reconnaissance vocale (SpeechRecognizer) : testées seulement via un pont simulé ; nécessitent sur le téléphone un moteur de synthèse et le pack de langue anglaise (UK).
- Demande d'autorisation du micro au premier « Répéter » : logique Java vérifiée statiquement, non exécutée sur appareil.
- Rendu sonore : vérifié par signal (gain, absence d'erreur), pas d'écoute humaine.
- Fluidité réelle sur un téléphone moyen, rotation et bouton retour Android : non mesurés.
- La simulation automatique couvre 400 jours ; les 1 750 jours sont vérifiés par calendrier et données, pas joués de bout en bout.
