/* =========================================================
   Contenu : exercices par niveaux (corrigés automatiquement)
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1;

  function hand(id, sql, model, think, ordered) {
    return { id: id, type: 'hand', db: 'mini', solution: sql, model: '<p>' + model + '</p>', think: think, ordered: !!ordered,
      q: '<p>Sans exécuter, écris le résultat de cette requête :</p>' + H.code(sql), placeholder: 'Écris seulement le résultat : les noms et/ou les nombres (sans explication)…', rows: 2 };
  }
  function sql(id, q, solution, check, expected, think, db) {
    return { id: id, type: 'sql', db: db || 'sephora', q: q, solution: solution, check: check || {}, expected: expected, think: think };
  }
  function open(id, query, model) {
    return { id: id, type: 'open', q: '<p>Dis avec une phrase simple ce que fait cette requête :</p>' + H.code(query), model: '<p>' + model + '</p>', rows: 2 };
  }
  function fix(id, wrong, solution, model, db, check, why) {
    return { id: id, type: 'fix', db: db, wrong: wrong, solution: solution, model: model, check: check || {},
      q: '<p>' + (why || 'Cette requête est fausse. Trouve l\'erreur et corrige-la.') + '</p>' + H.code(wrong) };
  }

  C.exercices = [
    {
      id: 'n1', niveau: 'Niveau 1', ico: '🟢', titre: 'Je joue l\'ordinateur', sous: 'Sur papier, avec la mini-table de 8 produits.',
      intro: '<p>Ici, <b>pas besoin d\'écrire du SQL</b>. Tu regardes la mini-table et tu trouves le résultat avec tes yeux, comme si tu étais l\'ordinateur. Écris les noms ou les nombres du résultat, puis clique sur <b>Vérifier</b>.</p>' + C.MINI_TABLE,
      items: [
        hand('e1', "SELECT name FROM Sephora WHERE price >= 50;", 'Rouge B (50), Rouge C (50), Soin A (60).', '<p>Lis chaque ligne : le prix est-il 50 <b>ou plus</b> ? 50 compte, à cause du <code>=</code>.</p>'),
        hand('e2', "SELECT COUNT(*) FROM Sephora WHERE brand = 'Nova';", '3 (Rouge C, Mascara B, Soin A).', '<p>Garde seulement les lignes Nova, puis compte-les sur tes doigts.</p>'),
        hand('e3', "SELECT MAX(love) FROM Sephora WHERE category = 'Lipstick';", 'Les Lipstick ont 120, 200 et 80 de love. Le plus grand est 200.', '<p>1) Garde les Lipstick. 2) Regarde leur colonne love. 3) Prends le plus grand.</p>'),
        hand('e4', "SELECT brand, COUNT(*) FROM Sephora GROUP BY brand;", 'Dior 3, Nova 3, Luma 2.', '<p>Fais des tas par marque, puis compte chaque tas.</p>'),
        hand('e5', "SELECT name FROM Sephora WHERE price < 25 OR love > 150;", 'Mascara A (20 &lt; 25), Soin C (20 &lt; 25), Rouge B (love 200 &gt; 150).', '<p>Avec OR, il suffit qu\'<b>une seule</b> des deux conditions soit vraie.</p>'),
        hand('e6', "SELECT COUNT(*), COUNT(price) FROM Sephora WHERE brand = 'Luma';", '2 et 1 : deux produits Luma, mais Soin B n\'a pas de prix.', '<p>Combien de produits Luma ? Et combien ont un prix <b>rempli</b> ?</p>'),
        hand('e7', "SELECT name FROM Sephora ORDER BY love DESC LIMIT 3;", 'Rouge B (200), Mascara A (150), Rouge A (120), dans cet ordre.', '<p>Classe les love du plus grand au plus petit, puis garde les 3 premiers. L\'ordre compte !</p>', true)
      ]
    },
    {
      id: 'n2', niveau: 'Niveau 2', ico: '🟢', titre: 'Traduire en français', sous: 'Lire une requête et dire ce qu\'elle fait.',
      intro: '<p>Lis la requête et dis <b>avec une phrase simple</b> ce qu\'elle fait. Puis compare avec la réponse modèle et évalue-toi.</p>' + H.box('astuce', 'Comment réfléchir', '<p>Lis les mots un par un : SELECT = « montre-moi », FROM = « dans », WHERE = « seulement si », GROUP BY = « pour chaque », HAVING = « seulement les groupes qui… ».</p>'),
      items: [
        open('t1', "SELECT name, rating FROM Sephora WHERE rating < 2;", 'Montre le nom et la note des produits notés <b>moins de 2</b>.'),
        open('t2', "SELECT DISTINCT category FROM Sephora WHERE brand = 'NARS';", 'Montre les <b>différentes catégories</b> de produits de la marque NARS (chacune une seule fois).'),
        open('t3', "SELECT COUNT(*) FROM Sephora WHERE exclusive = 1;", '<b>Compte</b> les produits qui sont des exclusivités Sephora.'),
        open('t4', "SELECT brand, COUNT(*) FROM Sephora GROUP BY brand HAVING COUNT(*) > 150;", 'Montre les marques qui ont <b>plus de 150 produits</b>, avec leur nombre de produits.'),
        open('t5', "SELECT name FROM Sephora WHERE price = (SELECT MIN(price) FROM Sephora);", 'Montre le ou les produits <b>les moins chers</b> de toute la boutique.')
      ]
    },
    {
      id: 'n3', niveau: 'Niveau 3', ico: '🟡', titre: 'Choisir des produits', sous: 'SELECT et WHERE, sur la vraie base.',
      intro: H.box('astuce', 'Pour tout ce niveau', '<p>1. Qu\'est-ce que j\'affiche ? → SELECT. 2. Dans quel tableau ? → FROM Sephora. 3. Quels produits je garde ? → WHERE.</p>'),
      items: [
        sql('e1', '<p>Affiche le <b>nom</b> et le <b>prix</b> des produits de la marque <b>CLINIQUE</b>.</p>', "SELECT name, price FROM Sephora WHERE brand = 'CLINIQUE';", { cols: ['name', 'price'] }, '234 lignes', '<p>Afficher quoi ? nom et prix → <code>SELECT name, price</code>. Seulement lesquels ? la marque est CLINIQUE → <code>WHERE brand = \'CLINIQUE\'</code>. Attention : CLINIQUE est écrit <b>en majuscules</b> dans la base.</p>'),
        sql('e2', '<p>Affiche les produits (au moins leur nom) qui coûtent <b>moins de 10 $</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE price < 10;", { cols: ['name'] }, '273 lignes', '<p>« moins de » → le signe <code>&lt;</code>.</p>'),
        sql('e3', '<p>Affiche les <b>parfums</b> (<code>category = \'Perfume\'</code>) qui coûtent <b>plus de 150 $</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE category = 'Perfume' AND price > 150;", { cols: ['name'] }, '84 lignes', '<p>Deux conditions qui doivent être vraies toutes les deux → <b>AND</b>.</p>'),
        sql('e4', '<p>Affiche les produits <b>exclusifs</b> Sephora.</p>', "SELECT name, brand FROM Sephora WHERE exclusive = 1;", { cols: ['name'] }, '2 427 lignes', '<p>La colonne <code>exclusive</code> vaut <b>1</b> pour oui. 1 est un nombre : <b>pas d\'apostrophes</b>.</p>'),
        sql('e5', '<p>Affiche les produits vendus <b>seulement en ligne</b> et qui coûtent <b>moins de 20 $</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE online_only = 1 AND price < 20;", { cols: ['name'] }, '365 lignes', '<p>« seulement en ligne » → <code>online_only = 1</code>. « et » → AND. « moins de 20 » → <code>&lt; 20</code>.</p>')
      ]
    },
    {
      id: 'n4', niveau: 'Niveau 4', ico: '🟡', titre: 'Les raccourcis et le rangement', sous: 'LIKE, IN, DISTINCT, ORDER BY, LIMIT.',
      items: [
        sql('e1', '<p>Affiche les produits dont le nom <b>contient « lip »</b>.</p>', "SELECT name FROM Sephora WHERE name LIKE '%lip%';", { cols: ['name'] }, '580 lignes', '<p>« contient » → LIKE. « n\'importe où » → <code>%</code> avant <b>et</b> après.</p>'),
        sql('e2', '<p>Affiche les produits dont le nom <b>commence par « Mini »</b>.</p>', "SELECT name FROM Sephora WHERE name LIKE 'Mini%';", { cols: ['name'] }, '127 lignes', '<p>« commence par » → le <code>%</code> seulement <b>à la fin</b>.</p>'),
        sql('e3', '<p>Affiche la liste des <b>différentes catégories</b>, rangée par ordre alphabétique.</p>', "SELECT DISTINCT category FROM Sephora ORDER BY category;", { ordered: true }, '143 lignes', '<p>« différentes » → DISTINCT. « ordre alphabétique » → ORDER BY.</p>'),
        sql('e4', '<p>Avec <b>IN</b>, affiche les produits des marques <b>Dior, CHANEL ou NARS</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE brand IN ('Dior', 'CHANEL', 'NARS');", { cols: ['name'], mustInclude: ['IN'] }, '254 lignes', '<p>Plusieurs marques possibles → une liste → <code>IN (\'Dior\', \'CHANEL\', \'NARS\')</code>.</p>'),
        sql('e5', '<p>Affiche le nom et le prix des <b>3 rouges à lèvres</b> (<code>\'Lipstick\'</code>) <b>les plus chers</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE category = 'Lipstick' ORDER BY price DESC LIMIT 3;", { cols: ['price'], ordered: true }, '3 lignes à 90 $ (Christian Louboutin)', '<p>1. Seulement les Lipstick → WHERE. 2. Du plus cher au moins cher → ORDER BY price DESC. 3. Les 3 premiers → LIMIT 3.</p>'),
        sql('e6', '<p>Affiche le nom, la note (<code>rating</code>) et le nombre d\'avis (<code>number_of_reviews</code>) des <b>5 produits les mieux notés</b>. En cas d\'égalité, ceux qui ont <b>le plus d\'avis</b> passent devant.</p>', "SELECT name, brand, rating, number_of_reviews FROM Sephora ORDER BY rating DESC, number_of_reviews DESC LIMIT 5;", { cols: ['rating', 'number_of_reviews'], ordered: true }, 'le 1er est « Modern Renaissance Eye Shadow Palette »', '<p>Deux critères de tri : d\'abord la note (DESC), puis le nombre d\'avis (DESC).</p>')
      ]
    },
    {
      id: 'n5', niveau: 'Niveau 5', ico: '🟠', titre: 'Compter et calculer', sous: 'COUNT, SUM, AVG, MIN, MAX, ROUND.',
      intro: H.box('astuce', 'Pour tout ce niveau', '<p>La réponse est <b>un seul nombre</b>. Cherche le bon outil : combien → COUNT, moyenne → AVG, total → SUM, plus petit → MIN, plus grand → MAX.</p>'),
      items: [
        sql('e1', '<p><b>Combien</b> de produits sont en <b>édition limitée</b> ?</p>', "SELECT COUNT(*) FROM Sephora WHERE limited_edition = 1;", { value: true }, '842', '<p>« combien » → COUNT(*). « édition limitée » → <code>WHERE limited_edition = 1</code>.</p>'),
        sql('e2', '<p>Le <b>prix moyen</b> des produits Dior, avec <b>2 chiffres après la virgule</b>.</p>', "SELECT ROUND(AVG(price), 2) AS prix_moyen FROM Sephora WHERE brand = 'Dior';", { value: true, mustInclude: ['ROUND'] }, '67.57', '<p>moyenne → AVG. Deux chiffres → ROUND(…, 2). D\'abord on filtre les Dior.</p>'),
        sql('e3', '<p>Le prix du parfum <b>le moins cher</b> et du parfum <b>le plus cher</b>, dans la même requête.</p>', "SELECT MIN(price) AS mini, MAX(price) AS maxi FROM Sephora WHERE category = 'Perfume';", { value: true }, '17 et 335', '<p>Deux calculs dans le même SELECT, séparés par une virgule.</p>'),
        sql('e4', '<p>Le <b>total</b> des favoris (love) de la marque NARS.</p>', "SELECT SUM(love) FROM Sephora WHERE brand = 'NARS';", { value: true }, '4 794 700', '<p>« total » → SUM.</p>'),
        sql('e5', '<p><b>Combien</b> de produits ont un prix normal (<code>value_price</code>) <b>plus grand</b> que leur prix (<code>price</code>) ? (Ce sont les produits en promotion.)</p>', "SELECT COUNT(*) FROM Sephora WHERE value_price > price;", { value: true }, '549', '<p>On peut comparer <b>deux colonnes entre elles</b> dans le WHERE.</p>')
      ]
    },
    {
      id: 'n6', niveau: 'Niveau 6', ico: '🔴', titre: 'Faire des groupes', sous: 'GROUP BY et HAVING.',
      intro: H.box('astuce', 'Pour tout ce niveau', '<p>Cherche les mots « <b>par</b> », « <b>pour chaque</b> », « <b>les marques qui…</b> » : ils veulent dire « fais des tas » (GROUP BY). Une condition sur un tas → HAVING.</p>'),
      items: [
        sql('e1', '<p>Affiche le <b>nombre de produits par catégorie</b>, du plus grand au plus petit.</p>', "SELECT category, COUNT(*) AS nombre FROM Sephora GROUP BY category ORDER BY nombre DESC;", { mustInclude: ['GROUP', 'ORDER'] }, '143 lignes, la 1re est Perfume (665)', '<p>« par catégorie » → GROUP BY category. « nombre » → COUNT(*). « du plus grand au plus petit » → ORDER BY … DESC. Donne un nom au calcul (AS nombre) pour trier dessus.</p>'),
        sql('e2', '<p>Affiche les <b>catégories</b> dont le <b>prix moyen dépasse 100 $</b>, avec leur prix moyen.</p>', "SELECT category, ROUND(AVG(price), 2) AS prix_moyen FROM Sephora GROUP BY category HAVING AVG(price) > 100 ORDER BY prix_moyen DESC;", {}, '9 catégories, la 1re est « Hair Straighteners & Flat Irons »', '<p>« catégories » → GROUP BY category. « prix moyen dépasse 100 » → condition <b>sur le groupe</b> → HAVING (pas WHERE !).</p>'),
        sql('e3', '<p>Pour les marques qui ont <b>au moins 100 produits</b> : affiche la marque, son nombre de produits et son prix moyen.</p>', "SELECT brand, COUNT(*) AS nombre, ROUND(AVG(price), 2) AS prix_moyen FROM Sephora GROUP BY brand HAVING COUNT(*) >= 100 ORDER BY prix_moyen DESC;", {}, '9 marques, la plus chère est TOM FORD (112.05)', '<p>« marques » → GROUP BY brand. « au moins 100 produits » → HAVING COUNT(*) &gt;= 100. On affiche deux calculs : COUNT et AVG.</p>'),
        sql('e4', '<p>Affiche les marques dont le produit <b>le moins cher</b> coûte <b>au moins 50 $</b> (des marques « de luxe »).</p>', "SELECT brand, MIN(price) AS moins_cher FROM Sephora GROUP BY brand HAVING MIN(price) >= 50;", { cols: ['brand'] }, '22 marques', '<p>Si le <b>moins cher</b> coûte au moins 50, alors <b>tous</b> coûtent au moins 50. Le moins cher → MIN(price). C\'est une condition sur le groupe → HAVING.</p>')
      ]
    },
    {
      id: 'n7', niveau: 'Niveau 7', ico: '🟣', titre: 'Sous-requêtes', sous: 'Une requête dans une requête.',
      intro: H.box('astuce', 'Pour tout ce niveau', '<p>1. <b>Écris d\'abord la petite requête</b> qui calcule le nombre (ou la liste). 2. <b>Exécute-la seule</b> pour voir le résultat. 3. <b>Mets-la entre parenthèses</b> dans la grande requête.</p>'),
      items: [
        sql('e1', '<p>Affiche les produits <b>plus chers que le prix moyen des produits Dior</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE price > (SELECT AVG(price) FROM Sephora WHERE brand = 'Dior');", { cols: ['name'] }, '1 907 lignes', '<p>1. Petite requête : le prix moyen Dior → <code>SELECT AVG(price) FROM Sephora WHERE brand = \'Dior\'</code> (67.57). 2. Grande requête : les produits dont le prix est plus grand que ça.</p>'),
        sql('e2', '<p>Affiche le nom et le prix du ou des <b>mascaras</b> (<code>\'Mascara\'</code>) <b>les moins chers</b>.</p>', "SELECT name, brand, price FROM Sephora WHERE category = 'Mascara' AND price = (SELECT MIN(price) FROM Sephora WHERE category = 'Mascara');", { cols: ['name'] }, '2 lignes à 10 $', '<p>1. Petite requête : le prix le plus bas <b>parmi les mascaras</b> (pas de toute la boutique !). 2. Les mascaras à ce prix-là. Si tu oublies le filtre Mascara dans la parenthèse, tu prends 2 $ et tu ne trouves aucun mascara.</p>'),
        sql('e3', '<p>Affiche tous les produits des <b>marques qui ont au moins 100 produits</b>.</p>', "SELECT name, brand FROM Sephora WHERE brand IN (SELECT brand FROM Sephora GROUP BY brand HAVING COUNT(*) >= 100);", { cols: ['name'] }, '1 694 lignes', '<p>1. Petite requête : la <b>liste</b> des marques avec au moins 100 produits. 2. C\'est une liste → <b>IN</b>.</p>'),
        sql('e4', '<p>★ Affiche les produits <b>plus chers que la moyenne de leur propre catégorie</b>.</p>', "SELECT p.name, p.category, p.price FROM Sephora AS p WHERE p.price > (SELECT AVG(q.price) FROM Sephora AS q WHERE q.category = p.category);", { cols: ['name'] }, '3 528 lignes', '<p>Utilise deux surnoms : <code>p</code> pour le produit regardé, <code>q</code> pour calculer la moyenne. Dans la parenthèse : <code>WHERE q.category = p.category</code>. Revois le chapitre 12 (bonus).</p>')
      ]
    },
    {
      id: 'n8', niveau: 'Niveau 8', ico: '⚫', titre: 'Trouve l\'erreur', sous: 'Chaque requête est fausse : explique et corrige.',
      intro: H.box('astuce', 'Vérifie dans cet ordre', '<ol><li>les apostrophes sont-elles droites ?</li><li>les nombres sont-ils sans espace ?</li><li>l\'ordre SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT est-il respecté ?</li><li>y a-t-il une virgule en trop ?</li><li>y a-t-il un COUNT dans le WHERE ?</li><li>y a-t-il <code>= NULL</code> ?</li><li>AND et OR sont-ils mélangés sans parenthèses ?</li></ol>'),
      items: [
        fix('f1', "SELECT name FROM Sephora WHERE brand = ‘Dior’;", "SELECT name FROM Sephora WHERE brand = 'Dior';", 'Les apostrophes sont penchées : il faut des apostrophes droites.', 'sephora', { cols: ['name'] }),
        fix('f2', "SELECT name FROM Sephora WHERE love > 100 000;", "SELECT name FROM Sephora WHERE love > 100000;", 'Un nombre ne doit pas contenir d\'espace : 100000.', 'sephora', { cols: ['name'] }),
        fix('f3', "SELECT name, price, FROM Sephora;", "SELECT name, price FROM Sephora;", 'Il y a une virgule en trop avant FROM.', 'mini'),
        fix('f4', "SELECT name FROM Sephora ORDER BY price WHERE brand = 'Dior';", "SELECT name FROM Sephora WHERE brand = 'Dior' ORDER BY price;", 'WHERE doit venir avant ORDER BY.', 'mini', { ordered: true }),
        fix('f5', "SELECT name FROM Sephora WHERE price = NULL;", "SELECT name FROM Sephora WHERE price IS NULL;", 'On n\'écrit jamais = NULL : il faut IS NULL.', 'mini', {}, 'Cette requête ne provoque pas d\'erreur, mais elle ne trouve jamais rien. Pourquoi ? Corrige-la pour trouver les produits sans prix.'),
        fix('f6', "SELECT brand, COUNT(*) FROM Sephora WHERE COUNT(*) > 100 GROUP BY brand;", "SELECT brand, COUNT(*) FROM Sephora GROUP BY brand HAVING COUNT(*) > 100;", 'COUNT ne peut pas aller dans WHERE : on filtre les groupes avec HAVING, après GROUP BY.', 'sephora'),
        fix('f7', "SELECT name, brand, price FROM Sephora WHERE brand = 'Dior' OR brand = 'NARS' AND price < 30;", "SELECT name, brand, price FROM Sephora WHERE (brand = 'Dior' OR brand = 'NARS') AND price < 30;", 'Il manque les parenthèses autour du OR : sans elles, on garde tous les Dior, même les plus chers.', 'sephora', { cols: ['name'] }, 'On veut les produits <b>Dior ou NARS</b> qui coûtent <b>moins de 30 $</b>. La requête ne donne pas le bon résultat. Pourquoi ?'),
        fix('f8', "SELECT name, AVG(price) FROM Sephora GROUP BY brand;", "SELECT brand, AVG(price) FROM Sephora GROUP BY brand;", 'name n\'est pas dans le GROUP BY : une marque a plusieurs noms. Il faut afficher brand.', 'mini', {}, 'On veut le prix moyen de chaque marque. Qu\'est-ce qui ne va pas ?')
      ]
    }
  ];
})();
