/* =========================================================
   Contenu : évaluation écrite (1 h) et évaluation TP (1 h)
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1;

  var EVAL_TABLE = H.table(['name', 'brand', 'category', 'price', 'love'], [
    ['Gloss 1', 'Kiko', 'Lipstick', 12, 300], ['Gloss 2', 'Kiko', 'Lipstick', 18, 150],
    ['Rouge X', 'Dior', 'Lipstick', 45, 500], ['Rouge Y', 'Dior', 'Lipstick', 45, 80],
    ['Mascara Pro', 'Kiko', 'Mascara', 15, 400], ['Mascara Max', 'Dior', 'Mascara', 35, 250],
    ['Parfum Or', 'Dior', 'Perfume', 120, 600], ['Parfum Rose', 'Lumi', 'Perfume', 80, 90],
    ['Crème Douce', 'Lumi', 'Skincare', null, 60], ['Crème Nuit', 'Lumi', 'Skincare', 40, 120]
  ], 'compact');

  function qcm(id, num, q, options, answer, explain, pts) { return { id: id, num: num, type: 'qcm', q: q, options: options, answer: answer, explain: explain, pts: pts }; }
  function hand(id, num, sql, model, pts, extra) {
    var o = { id: id, num: num, type: 'hand', db: 'eval', solution: sql, pts: pts, model: '<p>' + model + '</p>', rows: 2,
      q: H.code(sql) + (extra && extra.hint ? '<p class="expected">' + extra.hint + '</p>' : ''), placeholder: 'Écris seulement le résultat : les noms et/ou les nombres (sans explication)…' };
    if (extra && extra.ordered) o.ordered = true;
    return o;
  }
  function sqlQ(id, num, q, solution, check, pts, expected, db, explain) {
    return { id: id, num: num, type: 'sql', db: db || 'sephora', q: q, solution: solution, check: check || {}, pts: pts, expected: expected, explain: explain };
  }
  function fix(id, num, wrong, solution, model, pts, check, why) {
    return { id: id, num: num, type: 'fix', db: 'eval', wrong: wrong, solution: solution, model: model, pts: pts, check: check || {},
      q: '<p>' + (why || 'Explique l\'erreur et corrige la requête.') + '</p>' + H.code(wrong) };
  }

  /* ===================== ÉCRIT SUR TABLE ===================== */
  C.evals.ecrit = {
    id: 'ecrit', court: 'Évaluation écrite (1 h)', rubrique: 'Évaluations', kicker: '📝 Évaluation · 1 heure · /20',
    titre: 'Évaluation écrite — comme sur table', duree: 60, noRun: true, corrigeLibre: true,
    intro: `<p class="lead">Une heure, sans exécuter les requêtes : comme sur une feuille. Tu écris tes réponses, puis tu rends ta copie. La correction et la note s'affichent tout de suite.</p>
${H.box('retenir', 'Consignes', '<ul><li>Le bouton ▶ Exécuter est <b>désactivé</b> : réfléchis comme sur papier.</li><li>Écris tes requêtes avec des apostrophes droites <code>\'</code>.</li><li>Tes réponses sont enregistrées automatiquement.</li><li>Durée conseillée : Ex. 1 → 10 min · Ex. 2 → 20 min · Ex. 3 → 20 min · Ex. 4 → 10 min.</li></ul>')}`,
    preface: `<h2>Le tableau de l'évaluation</h2><p>La table s'appelle <code>Sephora</code>. Elle sert pour les exercices 2 et 4.</p>${EVAL_TABLE}`,
    sections: [
      {
        titre: 'Exercice 1 — Questions de cours', intro: '<p>Choisis la bonne réponse.</p>',
        questions: [
          qcm('a1', '1.1', 'Dans une table, une <b>ligne</b> représente :', ['une information', 'un produit', 'une requête'], 1, 'Une ligne = un produit ; une colonne = une information.', 0.5),
          qcm('a2', '1.2', 'Quel mot sert à <b>filtrer les lignes</b> ?', ['SELECT', 'WHERE', 'ORDER BY'], 1, 'WHERE garde seulement les lignes pour lesquelles la condition est vraie.', 0.5),
          qcm('a3', '1.3', '<code>price BETWEEN 20 AND 40</code> garde un produit à 40 $ :', ['oui', 'non'], 0, 'Avec BETWEEN, les deux bornes sont comprises.', 0.5),
          qcm('a4', '1.4', 'Pour chercher les prix inconnus, on écrit :', ['<code>price = NULL</code>', '<code>price IS NULL</code>', '<code>price = 0</code>'], 1, 'On écrit toujours IS NULL.', 0.5),
          qcm('a5', '1.5', '<code>ORDER BY price DESC</code> trie :', ['du moins cher au plus cher', 'du plus cher au moins cher'], 1, 'DESC = décroissant.', 0.5),
          qcm('a6', '1.6', 'Pour garder seulement les <b>groupes</b> qui ont plus de 5 produits, on utilise :', ['WHERE', 'HAVING', 'LIMIT'], 1, 'Une condition sur un groupe → HAVING.', 0.5),
          qcm('a7', '1.7', '<code>LIKE \'Mini%\'</code> trouve les noms qui :', ['contiennent Mini', 'commencent par Mini', 'finissent par Mini'], 1, 'Le % est seulement à la fin : « Mini » puis n\'importe quoi.', 0.5),
          qcm('a8', '1.8', 'Quel est le <b>bon ordre d\'écriture</b> ?', ['SELECT – WHERE – FROM – ORDER BY', 'SELECT – FROM – WHERE – ORDER BY', 'FROM – SELECT – ORDER BY – WHERE'], 1, 'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.', 0.5)
        ]
      },
      {
        titre: 'Exercice 2 — Je joue l\'ordinateur', intro: '<p>Pour chaque requête, écris <b>le résultat exact</b> à partir du tableau de l\'évaluation (les noms et/ou les nombres).</p>',
        questions: [
          hand('b1', '2.1', "SELECT name FROM Sephora WHERE price > 40;", 'Rouge X, Rouge Y, Parfum Or, Parfum Rose. (Crème Nuit coûte 40 : 40 &gt; 40 est faux. Crème Douce a un prix NULL.)', 1),
          hand('b2', '2.2', "SELECT name, price FROM Sephora\nWHERE brand = 'Kiko' OR price >= 80\nORDER BY price DESC;", 'Parfum Or 120, Parfum Rose 80, Gloss 2 18, Mascara Pro 15, Gloss 1 12 — dans cet ordre.', 1, { ordered: true, hint: 'Attention à l\'ordre des lignes.' }),
          hand('b3', '2.3', "SELECT COUNT(*), COUNT(price), MIN(price), MAX(price) FROM Sephora;", '10 | 9 | 12 | 120 (10 lignes, mais 9 prix connus).', 1),
          hand('b4', '2.4', "SELECT brand, COUNT(*) AS nombre FROM Sephora GROUP BY brand;", 'Dior 4, Kiko 3, Lumi 3.', 1),
          hand('b5', '2.5', "SELECT name, love FROM Sephora ORDER BY love DESC LIMIT 3;", 'Parfum Or 600, Rouge X 500, Mascara Pro 400.', 1, { ordered: true }),
          hand('b6', '2.6', "SELECT name FROM Sephora\nWHERE price > (SELECT AVG(price) FROM Sephora);", 'Parfum Or, Parfum Rose. La somme des prix vaut 410 et il y a 9 prix connus : la moyenne est 410 ÷ 9 ≈ 45,56 (et pas 410 ÷ 10). Rouge X et Rouge Y, à 45, sont en dessous.', 1, { hint: 'Indice : calcule d\'abord la parenthèse. Attention à la case NULL.' }),
          hand('b7', '2.7', "SELECT brand, SUM(love) FROM Sephora\nWHERE category <> 'Perfume'\nGROUP BY brand\nHAVING SUM(love) > 500;", 'Dior 830, Kiko 850. Sans les parfums : Dior = 500 + 80 + 250 = 830 ; Kiko = 300 + 150 + 400 = 850 ; Lumi = 60 + 120 = 180 (ne dépasse pas 500).', 1)
        ]
      },
      {
        titre: 'Exercice 3 — J\'écris les requêtes',
        intro: '<p>On travaille sur la <b>vraie table Sephora</b>. Colonnes utiles : <code>name</code>, <code>brand</code>, <code>category</code>, <code>price</code>, <code>rating</code>, <code>love</code>, <code>number_of_reviews</code>, <code>exclusive</code> (1 = oui, 0 = non).</p>',
        questions: [
          sqlQ('c1', '3.1', '<p>Afficher le nom et le prix des produits de la marque <b>NARS</b>.</p>', "SELECT name, price FROM Sephora WHERE brand = 'NARS';", { cols: ['name', 'price'] }, 1, '57 lignes'),
          sqlQ('c2', '3.2', '<p>Afficher le nom des produits qui coûtent <b>entre 10 et 25 $</b> (compris).</p>', "SELECT name FROM Sephora WHERE price BETWEEN 10 AND 25;", { cols: ['name'] }, 1, '', 'sephora', 'On accepte aussi <code>price &gt;= 10 AND price &lt;= 25</code>.'),
          sqlQ('c3', '3.3', '<p>Afficher les <b>différentes catégories</b>, sans doublon, triées par ordre alphabétique.</p>', "SELECT DISTINCT category FROM Sephora ORDER BY category;", { ordered: true }, 1, '143 lignes'),
          sqlQ('c4', '3.4', '<p>Afficher le nom et le nombre de love des <b>5 produits les plus aimés</b>.</p>', "SELECT name, love FROM Sephora ORDER BY love DESC LIMIT 5;", { cols: ['name', 'love'], ordered: true }, 1, 'le 1er est Everlasting Liquid Lipstick'),
          sqlQ('c5', '3.5', '<p>Afficher le <b>nombre de produits exclusifs</b>.</p>', "SELECT COUNT(*) FROM Sephora WHERE exclusive = 1;", { value: true }, 1, '2427'),
          sqlQ('c6', '3.6', '<p>Afficher, <b>pour chaque marque</b>, son prix moyen, mais <b>seulement</b> pour les marques dont le prix moyen dépasse 80 $.</p>', "SELECT brand, AVG(price) AS prix_moyen FROM Sephora GROUP BY brand HAVING AVG(price) > 80;", {}, 1, '', 'sephora', 'On accepte ROUND(…, 2) ou un ORDER BY en plus.')
        ]
      },
      {
        titre: 'Exercice 4 — Trouve et corrige l\'erreur', intro: '<p>Chaque requête contient <b>une erreur</b>. Explique-la en quelques mots, puis corrige la requête (table de l\'évaluation).</p>',
        questions: [
          fix('d1', '4.1', "SELECT name FROM Sephora WHERE brand = Dior;", "SELECT name FROM Sephora WHERE brand = 'Dior';", 'Le texte n\'a pas d\'apostrophes : il faut écrire <code>\'Dior\'</code>.', 0.5),
          fix('d2', '4.2', "SELECT name, price, FROM Sephora;", "SELECT name, price FROM Sephora;", 'Il y a une virgule en trop avant FROM.', 0.5),
          fix('d3', '4.3', "SELECT name FROM Sephora WHERE price = NULL;", "SELECT name FROM Sephora WHERE price IS NULL;", 'On n\'écrit jamais <code>= NULL</code> : il faut <code>IS NULL</code>.', 0.5),
          fix('d4', '4.4', "SELECT name FROM Sephora ORDER BY price WHERE brand = 'Kiko';", "SELECT name FROM Sephora WHERE brand = 'Kiko' ORDER BY price;", 'WHERE doit venir avant ORDER BY.', 0.5, { ordered: true }),
          fix('d5', '4.5', "SELECT brand, COUNT(*) FROM Sephora WHERE COUNT(*) > 2 GROUP BY brand;", "SELECT brand, COUNT(*) FROM Sephora GROUP BY brand HAVING COUNT(*) > 2;", 'COUNT est interdit dans WHERE : il faut HAVING après GROUP BY.', 0.5),
          fix('d6', '4.6', "SELECT name FROM Sephora WHERE brand = 'Dior' OR brand = 'Kiko' AND price < 20;", "SELECT name FROM Sephora WHERE (brand = 'Dior' OR brand = 'Kiko') AND price < 20;", 'Il manque les parenthèses autour du OR.', 0.5, {}, 'On veut les produits <b>Dior ou Kiko</b> qui coûtent <b>moins de 20 $</b>. Explique l\'erreur et corrige.')
        ]
      }
    ],
    bareme: `<h2>Barème</h2>${H.table(['Exercice', 'Points'], [['1 — Cours (8 × 0,5)', '4'], ['2 — Je joue l\'ordinateur (7 × 1)', '7'], ['3 — J\'écris (6 × 1)', '6'], ['4 — Erreurs (6 × 0,5)', '3'], ['<b>Total</b>', '<b>20</b>']])}
<p><b>Correction automatique :</b> Ex. 2 → 0,5 point si une seule valeur manque ou est en trop. Ex. 3 → la requête est exécutée et son résultat comparé au corrigé (moitié des points si le nombre de lignes est bon mais pas les colonnes). Ex. 4 → la moitié des points pour la correction (vérifiée automatiquement), l'autre moitié pour l'explication (auto-évaluée).</p>`
  };

  /* ===================== TP SUR ORDINATEUR ===================== */
  C.evals.tp = {
    id: 'tp', court: 'Évaluation TP (1 h)', rubrique: 'Évaluations', kicker: '💻 Évaluation · 1 heure · /20',
    titre: 'Évaluation TP — sur ordinateur', duree: 60, corrigeLibre: true,
    intro: `<p class="lead">Une heure sur la vraie base Sephora. Tu peux exécuter tes requêtes autant que tu veux. Quand tu as fini, rends ta copie : chaque requête est corrigée automatiquement.</p>
${H.box('retenir', 'Consignes', '<ul><li>Pour chaque question, écris ta requête et clique sur <b>▶ Exécuter</b> pour vérifier ton résultat.</li><li>Tes réponses sont enregistrées automatiquement.</li><li>Les questions vont du plus facile au plus difficile. Si tu bloques, passe à la suivante.</li><li>À la fin, clique sur <b>Rendre ma copie</b>, puis <b>Télécharger ma copie</b> pour la déposer (ENT, clé…).</li></ul>')}`,
    preface: `<details class="think" style="background:var(--blue-soft)"><summary style="color:var(--blue)">📋 Les colonnes de la table Sephora</summary>${H.table(['Colonne', 'Ce qu\'elle contient'], C.schemaSephora.map(function (r) { return [r[0], r[1]]; }), 'compact')}</details>`,
    sections: [
      {
        titre: 'Partie A — Choisir des produits',
        questions: [
          sqlQ('q1', 'Q1', '<p>Affiche le nom, le prix et la note (<code>rating</code>) des produits de la marque <b>TOM FORD</b>.</p>', "SELECT name, price, rating FROM Sephora WHERE brand = 'TOM FORD';", { cols: ['name'] }, 1, '161 lignes'),
          sqlQ('q2', 'Q2', '<p>Affiche les sérums visage (<code>category = \'Face Serums\'</code>) qui coûtent <b>moins de 30 $</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE category = 'Face Serums' AND price < 30;", { cols: ['name'] }, 1, '73 lignes'),
          sqlQ('q3', 'Q3', '<p>Affiche les produits dont le nom <b>contient « serum »</b>.</p>', "SELECT name FROM Sephora WHERE name LIKE '%serum%';", { cols: ['name'] }, 1, '360 lignes'),
          sqlQ('q4', 'Q4', '<p>Avec <b>IN</b>, affiche les produits des catégories <b>Mascara, Lipstick et Eyeliner</b>.</p>', "SELECT name, category FROM Sephora WHERE category IN ('Mascara', 'Lipstick', 'Eyeliner');", { cols: ['name'], mustInclude: ['IN'] }, 1, '471 lignes'),
          sqlQ('q5', 'Q5', '<p>Affiche les produits notés <b>4,5 ou plus</b> qui ont <b>au moins 1 000 avis</b> (<code>number_of_reviews</code>).</p>', "SELECT name, rating, number_of_reviews FROM Sephora WHERE rating >= 4.5 AND number_of_reviews >= 1000;", { cols: ['name'] }, 1, '409 lignes'),
          sqlQ('q6', 'Q6', '<p>Affiche le nom, la marque et le love des <b>3 mascaras</b> (<code>\'Mascara\'</code>) <b>les plus aimés</b>.</p>', "SELECT name, brand, love FROM Sephora WHERE category = 'Mascara' ORDER BY love DESC LIMIT 3;", { cols: ['name', 'love'], ordered: true }, 1, 'Better Than Sex Mascara, They\'re Real!…, Roller Lash…')
        ]
      },
      {
        titre: 'Partie B — Compter et calculer',
        questions: [
          sqlQ('q7', 'Q7', '<p><b>Combien de marques différentes</b> vendent des parfums (<code>\'Perfume\'</code>) ?</p>', "SELECT COUNT(DISTINCT brand) FROM Sephora WHERE category = 'Perfume';", { value: true }, 1.5, '76'),
          sqlQ('q8', 'Q8', '<p>Pour la marque <b>SEPHORA COLLECTION</b>, affiche en <b>une seule requête</b> : le nombre de produits, le prix moyen <b>arrondi à 2 décimales</b>, le prix minimum et le prix maximum. Donne un nom à chaque colonne avec <code>AS</code>.</p>', "SELECT COUNT(*) AS nombre, ROUND(AVG(price), 2) AS prix_moyen, MIN(price) AS prix_min, MAX(price) AS prix_max FROM Sephora WHERE brand = 'SEPHORA COLLECTION';", { value: true, mustInclude: ['ROUND', 'AS'] }, 2, '496 | 18.34 | 2 | 110'),
          sqlQ('q9a', 'Q9 a', '<p>Calcule la <b>note moyenne</b> (<code>rating</code>) de <b>tous</b> les produits, arrondie à 2 décimales.</p>', "SELECT ROUND(AVG(rating), 2) FROM Sephora;", { value: true }, 1, '3.99'),
          sqlQ('q9b', 'Q9 b', '<p>Calcule la même moyenne, mais <b>sans les produits notés 0</b>.</p>', "SELECT ROUND(AVG(rating), 2) FROM Sephora WHERE rating > 0;", { value: true }, 1, '4.17'),
          { id: 'q9c', num: 'Q9 c', type: 'open', pts: 0.5, q: '<p>Explique en une phrase pourquoi les deux moyennes (Q9 a et Q9 b) sont différentes.</p>', model: '<p>Les produits notés 0 n\'ont en réalité <b>pas encore de note</b> (il y en a 398). Ils font baisser la moyenne alors qu\'ils ne devraient pas compter.</p>' }
        ]
      },
      {
        titre: 'Partie C — Groupes et sous-requêtes',
        questions: [
          sqlQ('q10', 'Q10', '<p>Pour la marque <b>Dior</b>, affiche le <b>nombre de produits par catégorie</b>, du plus grand au plus petit, et garde seulement les <b>3 premières</b> catégories.</p>', "SELECT category, COUNT(*) AS nombre FROM Sephora WHERE brand = 'Dior' GROUP BY category ORDER BY nombre DESC LIMIT 3;", { ordered: true }, 2, 'Perfume 19, Face Serums 13, Mascara 9'),
          sqlQ('q11', 'Q11', '<p>Affiche les <b>catégories qui ont au moins 200 produits</b>, avec leur nombre de produits.</p>', "SELECT category, COUNT(*) AS nombre FROM Sephora GROUP BY category HAVING COUNT(*) >= 200 ORDER BY nombre DESC;", {}, 1.5, '9 catégories'),
          sqlQ('q12', 'Q12', '<p>Avec une <b>sous-requête</b>, affiche le produit qui a <b>le plus d\'avis</b> (nom, marque, nombre d\'avis).</p>', "SELECT name, brand, number_of_reviews FROM Sephora WHERE number_of_reviews = (SELECT MAX(number_of_reviews) FROM Sephora);", { cols: ['name'] }, 1.5, 'bareMinerals, 19 000 avis'),
          sqlQ('q13', 'Q13', '<p><b>Combien</b> de parfums coûtent <b>moins cher que le prix moyen des parfums</b> ?<br><span class="expected">Indice : la sous-requête doit aussi ne regarder que les parfums.</span></p>', "SELECT COUNT(*) FROM Sephora WHERE category = 'Perfume' AND price < (SELECT AVG(price) FROM Sephora WHERE category = 'Perfume');", { value: true }, 1.5, '399 (la moyenne des parfums est 112,16 $)'),
          sqlQ('q14', 'Q14 ★', '<p>Affiche les marques qui <b>n\'ont aucun produit</b> vendu uniquement en ligne (<code>online_only = 1</code>).</p>', "SELECT DISTINCT s.brand FROM Sephora AS s WHERE NOT EXISTS (SELECT 1 FROM Sephora AS p WHERE p.brand = s.brand AND p.online_only = 1);", { cols: ['brand'] }, 1.5, '65 marques', 'sephora', 'Autre solution acceptée : <code>SELECT brand FROM Sephora GROUP BY brand HAVING SUM(online_only) = 0;</code>')
        ]
      }
    ],
    bareme: `<h2>Barème</h2>${H.table(['Partie', 'Questions', 'Points'], [['A — Choisir', 'Q1 à Q6 (6 × 1)', '6'], ['B — Calculer', 'Q7 (1,5) · Q8 (2) · Q9 (1 + 1 + 0,5)', '6'], ['C — Groupes et sous-requêtes', 'Q10 (2) · Q11 à Q14 (4 × 1,5)', '8'], ['<b>Total</b>', '', '<b>20</b>']])}
<p><b>Correction automatique :</b> chaque requête est exécutée et son résultat comparé à celui du corrigé. Points complets si le résultat est identique ; moitié des points si le nombre de lignes est bon mais pas les valeurs, ou si un mot imposé (IN, ROUND, AS) manque. Q9 c est auto-évaluée.</p>`
  };
})();
