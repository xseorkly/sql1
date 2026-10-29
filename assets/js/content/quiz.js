/* =========================================================
   Contenu : quiz noté « Ai-je bien compris ? » (/20)
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1;
  function qcm(id, num, q, options, answer, explain) { return { id: id, num: num, type: 'qcm', q: q, options: options, answer: answer, explain: explain, pts: 0.5 }; }
  function hand(id, num, sql, model, ordered) {
    return { id: id, num: num, type: 'hand', db: 'mini', solution: sql, pts: 1, model: '<p>' + model + '</p>', ordered: !!ordered, rows: 2,
      q: '<p>Écris le résultat de cette requête sur la mini-table :</p>' + H.code(sql), placeholder: 'Écris seulement le résultat : les noms et/ou les nombres (sans explication)…' };
  }
  function sqlQ(id, num, q, solution, check, expected, db) { return { id: id, num: num, type: 'sql', db: db || 'sephora', q: q, solution: solution, check: check || {}, pts: 1.5, expected: expected }; }
  function open(id, num, q, model) { return { id: id, num: num, type: 'open', q: q, model: model, pts: 1, rows: 3 }; }

  C.evals.quiz = {
    id: 'quiz', court: 'Quiz « Ai-je compris ? »', rubrique: 'S\'entraîner', kicker: '🧠 Quiz noté · /20 · sans limite de temps',
    titre: 'Quiz : ai-je bien compris ?', duree: 0,
    intro: `<p class="lead">Un quiz pour faire le point sur tout le cours : des QCM, des résultats à trouver à la main, des requêtes à écrire et des questions ouvertes. Tu peux exécuter tes requêtes. Quand tu as fini, rends ta copie pour voir ta note et le corrigé.</p>
${H.box('idee', 'Comment est calculée la note ?', '<ul><li>Les QCM, les résultats à la main et les requêtes sont <b>corrigés automatiquement</b>.</li><li>Pour les questions ouvertes, tu lis la <b>réponse modèle</b> et tu t\'<b>auto-évalues</b> (faux, à moitié, juste).</li><li>Tu peux recommencer autant de fois que tu veux.</li></ul>')}`,
    preface: `<details class="think" style="background:var(--blue-soft)"><summary style="color:var(--blue)">📋 La mini-table de 8 produits</summary>${C.MINI_TABLE}</details>`,
    sections: [
      {
        titre: 'Partie A — QCM',
        questions: [
          qcm('a1', 'A1', 'Que fait <code>SELECT DISTINCT brand FROM Sephora;</code> ?', ['Elle compte les marques', 'Elle affiche chaque marque une seule fois', 'Elle trie les marques'], 1, 'DISTINCT enlève les répétitions.'),
          qcm('a2', 'A2', 'Quelle condition garde les produits dont le nom <b>finit</b> par « Set » ?', ['<code>name LIKE \'Set%\'</code>', '<code>name LIKE \'%Set\'</code>', '<code>name = \'%Set\'</code>'], 1, 'Le % avant : n\'importe quoi, puis « Set » à la fin.'),
          qcm('a3', 'A3', '<code>WHERE brand IN (\'Dior\', \'Nova\')</code> veut dire…', ['la marque est Dior et Nova', 'la marque est Dior ou Nova', 'la marque contient Dior'], 1, 'IN = « fait partie de la liste » = plusieurs OR.'),
          qcm('a4', 'A4', 'Quel outil calcule un <b>total</b> ?', ['COUNT', 'SUM', 'MAX'], 1, 'SUM additionne.'),
          qcm('a5', 'A5', 'Sur la mini-table, <code>COUNT(*)</code> vaut 8. Que vaut <code>COUNT(price)</code> ?', ['8', '7', '0'], 1, 'Soin B n\'a pas de prix : il n\'est pas compté.'),
          qcm('a6', 'A6', '« Les catégories qui ont plus de 2 produits » : il faut…', ['WHERE COUNT(*) > 2', 'GROUP BY category HAVING COUNT(*) > 2', 'ORDER BY COUNT(*) LIMIT 2'], 1, 'Une condition sur un groupe → GROUP BY + HAVING.'),
          qcm('a7', 'A7', 'Pourquoi met-on des parenthèses dans <code>WHERE (brand = \'Dior\' OR brand = \'Nova\') AND price &gt; 25</code> ?', ['Pour faire joli', 'Parce que l\'ordinateur fait AND avant OR', 'Parce que OR est interdit sans parenthèses'], 1, 'Sans parenthèses, AND passe en premier et le sens change.'),
          qcm('a8', 'A8', 'La sous-requête renvoie <b>une seule valeur</b> (une moyenne). Quel signe peut-on utiliser ?', ['<code>&gt;</code>', '<code>IN</code> seulement', '<code>LIKE</code>'], 0, 'Une seule valeur → =, &gt;, &lt;… Une liste → IN.'),
          qcm('a9', 'A9', 'Dans quel ordre l\'ordinateur exécute-t-il une requête ?', ['SELECT, FROM, WHERE, GROUP BY', 'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY', 'WHERE, SELECT, FROM, ORDER BY'], 1, 'C\'est pour ça que WHERE ne peut pas utiliser COUNT : les groupes n\'existent pas encore.'),
          qcm('a10', 'A10', 'Que donne <code>SELECT AVG(price) FROM Sephora WHERE brand = \'Inconnue\';</code> s\'il n\'y a aucun produit de cette marque ?', ['0', 'NULL', 'une erreur'], 1, 'Sur un ensemble vide, AVG, SUM, MIN et MAX donnent NULL. COUNT donnerait 0.')
        ]
      },
      {
        titre: 'Partie B — Je joue l\'ordinateur',
        questions: [
          hand('b1', 'B1', "SELECT name FROM Sephora WHERE category = 'Lipstick' AND price < 50;", 'Rouge A (le seul Lipstick à moins de 50).'),
          hand('b2', 'B2', "SELECT category, MAX(price) FROM Sephora GROUP BY category;", 'Lipstick 50, Mascara 40, Skincare 60.'),
          hand('b3', 'B3', "SELECT name FROM Sephora WHERE price IS NULL OR love < 50;", 'Soin B (prix NULL et love 30) et Soin C (love 40).'),
          hand('b4', 'B4', "SELECT name, price FROM Sephora ORDER BY price DESC, name LIMIT 2;", 'Soin A 60, puis Rouge B 50 (Rouge B passe avant Rouge C grâce au nom).', true)
        ]
      },
      {
        titre: 'Partie C — J\'écris les requêtes', intro: '<p>Sur la <b>vraie base Sephora</b>. Tu peux exécuter tes requêtes pour vérifier.</p>',
        questions: [
          sqlQ('c1', 'C1', '<p>Affiche les produits de la marque <b>tarte</b> (en minuscules) qui coûtent <b>moins de 25 $</b>.</p>', "SELECT name, price FROM Sephora WHERE brand = 'tarte' AND price < 25;", { cols: ['name'] }, '93 lignes'),
          sqlQ('c2', 'C2', '<p>Affiche les marques qui ont <b>plus de 150 produits</b>, avec leur nombre de produits.</p>', "SELECT brand, COUNT(*) AS nombre FROM Sephora GROUP BY brand HAVING COUNT(*) > 150;", {}, '4 marques'),
          sqlQ('c3', 'C3', '<p>Avec une <b>sous-requête</b>, affiche le nom du produit qui a <b>le plus de love</b>.</p>', "SELECT name, love FROM Sephora WHERE love = (SELECT MAX(love) FROM Sephora);", { cols: ['name'] }, 'Everlasting Liquid Lipstick'),
          sqlQ('c4', 'C4', '<p>Affiche le <b>prix moyen des parfums</b> (<code>\'Perfume\'</code>), <b>arrondi à 2 décimales</b>.</p>', "SELECT ROUND(AVG(price), 2) FROM Sephora WHERE category = 'Perfume';", { value: true, mustInclude: ['ROUND'] }, '112.16')
        ]
      },
      {
        titre: 'Partie D — Questions ouvertes', intro: '<p>Réponds avec tes mots. Après avoir rendu la copie, compare avec la réponse modèle et auto-évalue-toi.</p>',
        questions: [
          open('d1', 'D1', '<p>Quelle est la différence entre <b>WHERE</b> et <b>HAVING</b> ?</p>', '<p>WHERE filtre les <b>lignes</b> (les produits) <b>avant</b> de faire les groupes. HAVING filtre les <b>groupes</b> <b>après</b> les calculs (COUNT, AVG…).</p>'),
          open('d2', 'D2', '<p>Sur la mini-table, la somme des prix vaut 270. Pourquoi la moyenne vaut 38,57 et pas 270 ÷ 8 = 33,75 ?</p>', '<p>Le prix de Soin B est <b>NULL</b> (inconnu). AVG <b>ignore</b> les cases vides : il divise par les <b>7</b> prix connus, pas par 8. 270 ÷ 7 ≈ 38,57.</p>'),
          open('d3', 'D3', '<p>Pourquoi faut-il toujours un <b>ORDER BY</b> avant un <b>LIMIT</b> quand on veut « les 5 plus chers » ?</p>', '<p>Sans ORDER BY, l\'ordre des lignes n\'est pas garanti : LIMIT prendrait 5 lignes <b>au hasard</b>. Il faut d\'abord trier du plus cher au moins cher (ORDER BY price DESC), puis garder les 5 premières.</p>'),
          open('d4', 'D4', '<p>Quand utilise-t-on <b>IN</b> plutôt que <b>=</b> devant une sous-requête ?</p>', '<p>Quand la sous-requête peut renvoyer <b>plusieurs valeurs</b> (une liste, par exemple plusieurs marques). <code>=</code> ne convient que si elle renvoie <b>une seule</b> valeur (une moyenne, un maximum…).</p>'),
          open('d5', 'D5', '<p>Explique, étape par étape, ce que fait cette requête :</p>' + H.code("SELECT brand, COUNT(*)\nFROM Sephora\nWHERE price > 20\nGROUP BY brand\nHAVING COUNT(*) >= 2;"), '<p>1. <b>WHERE</b> garde les produits qui coûtent plus de 20. 2. <b>GROUP BY</b> fait un tas par marque. 3. <b>COUNT(*)</b> compte les produits de chaque tas. 4. <b>HAVING</b> garde les marques qui ont au moins 2 produits. 5. On affiche la marque et son nombre. (Sur la mini-table : Dior 2, Nova 3.)</p>')
        ]
      }
    ]
  };
})();
