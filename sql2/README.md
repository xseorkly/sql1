# SQL2 — Les jointures SQL (CPES L1)

Suite de SQL1, intégrée au même site et accessible depuis l'accueil de SQL1.

## Base réelle du cours

Le programme suit le polycopié **« Les jointures SQL : relier deux tables »**, daté du 10 novembre 2026, transmis dans l'archive de cours.

- **mini_etudiants.sqlite** : 2 tables (Etudiant, Matiere), numSecu comme clé, JOIN ... ON, alias, ON / WHERE, produit cartésien, correspondances multiples. Les deux lignes fictives sont reproduites en mémoire dans le navigateur.
- **World.db3** : City (4079 lignes), Country (239), CountryLanguage (988). Trois relations : City.CountryCode = Country.Code ; CountryLanguage.CountryCode = Country.Code ; Country.Capital = City.ID.

**Important :** World.db3 n'était pas dans l'archive transmise. Le site propose de l'importer depuis l'ordinateur de l'étudiant. Le fichier est lu dans le navigateur, sans transfert vers un serveur. Les résultats attendus dépendent donc de la version exacte du fichier fourni par les enseignants.

## Contenus

- 9 chapitres très progressifs et exemples réellement exécutables.
- Les 20 questions du polycopié sur World.db3, parties A à E, avec des corrections rédigées.
- 110 exercices supplémentaires : SQL à écrire, recherches d'erreurs, calculs de résultats, explications de raisonnement, deux ou trois tables, filtres, tris, agrégats, trois relations World.
- 2 sujets blancs de CC2 : **20 requêtes par sujet**, corrigés affichés après remise.
- Bac à sable SQLite, indices, autocorrection sur résultat exécuté, sauvegarde locale des réponses et suivi de progression.
- La notation automatique des sujets blancs est **indicative** ; elle ne reproduit pas exactement toutes les nuances de l'évaluation de l'enseignant.

## La logique de correction du CC1

Le CC1 du 3 novembre 2026 comportait 30 questions sur World.db3. D'après sa synthèse, les résultats étaient comparés à ceux attendus avec prise en compte des lignes, colonnes et tris. Le prochain contrôle étant annoncé plus court, les deux sujets blancs du site comportent 20 questions d'une valeur indicative de 1 point chacune.

Aucune donnée individuelle issue de la copie personnelle du CC1 n'est diffusée.

## Fichiers actifs

- index.html : page d'accueil.
- style.css : apparence, responsive, style de SQL1.
- lessons-v2.js : cours et mini-base fictive reproduite.
- poly-v2.js : les 20 questions du professeur avec correction.
- practice-v2.js : 110 exercices supplémentaires.
- exams-v2.js : deux sujets blancs.
- app-v2.js : navigateur, moteur SQL, corrections et progression.

Les anciens fichiers content.js et exercises.js sont des versions préparatoires conservées dans l'historique mais **non chargées** par le site.

## Objectif

Savoir retrouver et justifier les conditions de jointure, résoudre des requêtes à deux ou trois tables et conserver les acquis de SQL1 utiles à la réussite du CC2 du 5 janvier 2027.
