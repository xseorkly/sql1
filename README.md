# SQL pas à pas — cours, TP et évaluations (base Sephora)

Site de cours de SQL pour grands débutants (Licence 1), entièrement statique, publié avec GitHub Pages.

👉 **Site en ligne :** https://xseorkly.github.io/sql1/

## Ce qu'il contient

- **Le cours** en 13 chapitres très simples (SELECT, WHERE, BETWEEN/IN/LIKE, DISTINCT/ORDER BY/LIMIT, fonctions de calcul, GROUP BY, HAVING, NULL, sous-requêtes, bonus : alias, NOT EXISTS, classements), avec un quiz corrigé à la fin de chaque chapitre.
- **La méthode** en 6 questions pour écrire n'importe quelle requête, et une **fiche mémo** imprimable.
- **TP1 Sephora** et **TP2 Astérix** réexpliqués requête par requête.
- **44 exercices** sur 8 niveaux, **corrigés automatiquement** (la requête de l'élève est exécutée et son résultat comparé au corrigé).
- **Un quiz noté « Ai-je compris ? »** (/20) : QCM, résultats à trouver à la main, requêtes, questions ouvertes avec auto-évaluation.
- **Deux évaluations d'une heure** (/20) : un **écrit sur table** (exécution désactivée, chrono) et un **TP sur ordinateur**. Correction, note, corrigé détaillé, téléchargement de la copie, vue enseignant (sujet + corrigé).
- **La fiche mémo expliquée** : page web (`fiche-memo.html`) et PDF couleur / noir et blanc (livret A5, A4 recto-verso plié en 2) dans `assets/docs/`.
- **Un bac à sable SQL** et la page **Mes notes** (progression, relevé téléchargeable).

## Fonctionnement technique

- Les requêtes s'exécutent **dans le navigateur** grâce à [sql.js](https://github.com/sql-js/sql.js) (SQLite compilé en WebAssembly, fichiers dans `assets/vendor/`).
- `data/sephora.db` est une version allégée de la base Sephora du cours (9 168 produits, toutes les colonnes utilisées en cours, sans les longs textes de description).
- Deux petites tables sont créées en mémoire : la **mini-table du cours** (8 produits) et la **table de l'évaluation écrite** (10 produits).
- Les réponses, la progression et les notes sont enregistrées dans le `localStorage` du navigateur de l'élève (rien n'est envoyé à un serveur).

## Structure

```
index.html                 page unique (routeur par #)
assets/css/style.css       design
assets/js/helpers.js       coloration SQL, aides de mise en page
assets/js/app.js           moteur : exécution SQL, correction automatique, notes, pages
assets/js/content/         contenu modifiable : cours, TP, exercices, quiz, évaluations
data/sephora.db            base de données
```

Pour modifier un exercice ou une question, il suffit d'éditer le fichier correspondant dans `assets/js/content/`.

## Tester en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Le site doit être servi par un serveur web : l'ouverture directe du fichier `index.html` ne permet pas de charger la base.)
