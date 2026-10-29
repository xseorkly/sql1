/* =========================================================
   Contenu : TP1 Sephora et TP2 Astérix, réexpliqués
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1;

  function it(n, titre, sql, expl, res) { return { n: n, titre: titre, sql: sql, expl: expl, res: res, db: 'sephora' }; }

  C.tp.tp1 = {
    kicker: '💄 TP1', titre: 'TP1 — Sephora, expliqué simplement',
    intro: `<p class="lead">Toutes les requêtes du TP1, une par une : ce qu'elles font en français, et le vrai résultat sur la base Sephora (9 168 produits). Tu peux exécuter et modifier chaque requête.</p>
${H.box('piege', 'Trois erreurs à corriger dans tes notes', '<ul><li><code>‘Dior’</code> → écris <code>\'Dior\'</code> (apostrophes droites) ;</li><li><code>100 000</code> → écris <code>100000</code> (sans espace) ;</li><li>enlève le mot <code>(products)</code> après Sephora : ce n\'est pas du SQL.</li></ul>')}`,
    items: [
      it('1', 'Tout afficher', "SELECT * FROM Sephora;", '<p>Montre <b>tout le tableau</b> : toutes les colonnes (<code>*</code>) et toutes les lignes.</p>', '9 168 lignes'),
      it('2', 'Nom, marque et prix', "SELECT name, brand, price FROM Sephora;", '<p>Toujours tous les produits, mais seulement <b>3 colonnes</b> : le nom, la marque et le prix. (Dans tes notes, il est écrit « nom et prix » : il y a aussi la marque.)</p>', '9 168 lignes'),
      it('3', 'La liste des marques', "SELECT DISTINCT brand FROM Sephora;", '<p>Chaque marque <b>une seule fois</b>, grâce à DISTINCT. Version plus propre, triée et sans case vide :</p>' + H.code("SELECT DISTINCT brand FROM Sephora WHERE brand IS NOT NULL ORDER BY brand;") + '<p>Remarque : le tri met les majuscules avant les minuscules (« dyson » ou « tarte » arrivent après).</p>', '324 marques'),
      it('4', 'Les produits Dior', "SELECT name, brand, price FROM Sephora WHERE brand = 'Dior';", '<p>Seulement les produits dont la marque est <b>exactement</b> Dior. Avec <code>\'dior\'</code> en minuscules, on ne trouverait rien.</p>', '145 lignes'),
      it('5', 'Plus de 100 $', "SELECT name, brand, price FROM Sephora WHERE price > 100;", '<p>Les produits dont le prix est <b>strictement</b> supérieur à 100 (un produit à 100 pile n\'est pas gardé).</p>', '845 lignes'),
      it('6', 'Moins de 100 $', "SELECT name, brand, price FROM Sephora WHERE price < 100;", '<p>Les produits strictement en dessous de 100 $.</p>', '8 283 lignes'),
      it('7', 'Différent de 100 $', "SELECT name, brand, price FROM Sephora WHERE price <> 100;", '<p><code>&lt;&gt;</code> veut dire « différent de ». <b>Vérification :</b> 845 au-dessus + 8 283 en dessous + 40 produits à exactement 100 = 9 168. Le compte est bon ✅</p>', '9 128 lignes'),
      it('8', 'Trier par popularité', "SELECT name, brand, price, love FROM Sephora ORDER BY love DESC;", '<p>Du plus aimé au moins aimé. On peut trier sur une colonne qu\'on n\'affiche pas, mais pour vérifier, c\'est mieux d\'ajouter <code>love</code> au SELECT (c\'est fait ici). Le n°1 : <i>Everlasting Liquid Lipstick</i> (KVD Vegan Beauty, 1 300 000 favoris).</p>', '9 168 lignes'),
      it('9', 'Note de 5/5', "SELECT name, brand, price FROM Sephora WHERE rating = 5;", '<p>Les produits notés 5 sur 5.</p>', '872 lignes'),
      it('10', 'Plus de 100 000 favoris', "SELECT name, brand, price FROM Sephora WHERE love > 100000;", '<p>Attention : <code>100000</code> sans espace !</p>', '250 lignes'),
      it('11', 'Entre 20 et 40 $', "SELECT name, brand, price FROM Sephora WHERE price BETWEEN 20 AND 40;", '<p>BETWEEN garde les prix de 20 à 40, <b>bornes comprises</b>.</p>', '4 041 lignes'),
      it('12', 'Contient « mascara »', "SELECT name, brand, price FROM Sephora WHERE name LIKE '%mascara%';", '<p>Le nom contient « mascara » n\'importe où, en majuscules ou en minuscules.</p>', '168 lignes'),
      it('13', 'Les 10 plus chers', "SELECT name, brand, price FROM Sephora ORDER BY price DESC LIMIT 10;", '<p>D\'abord on trie du plus cher au moins cher, puis on garde les 10 premiers. Le n°1 : <i>Airwrap™ Styler</i> de dyson, 549 $.</p>', '10 lignes'),
      it('14', 'Compter tous les produits', "SELECT COUNT(*) AS nombre_produits FROM Sephora;", '<p>COUNT(*) compte les lignes. <code>AS</code> donne un nom à la colonne du résultat.</p>', '9 168'),
      it('15', 'Compter les produits Dior', "SELECT COUNT(name) AS nb_produit_Dior FROM Sephora WHERE brand = 'Dior';", '<p>On filtre d\'abord les Dior, puis on compte. Ici <code>COUNT(name)</code> et <code>COUNT(*)</code> donnent la même chose (aucun nom n\'est vide). <code>COUNT(*)</code> est plus clair pour « combien de produits ».</p>', '145'),
      it('16', 'Le prix moyen', "SELECT AVG(price) FROM Sephora;", '<p>La moyenne des prix. Pour un affichage propre : <code>ROUND(AVG(price), 2) AS prix_moyen</code>.</p>', '≈ 50,06 $'),
      it('17', 'Moins de 50 $', "SELECT name, brand, price FROM Sephora WHERE price < 50;", '<p>Les produits à moins de 50 $.</p>', '6 327 lignes'),
      it('18', 'Plus chers que la moyenne', "SELECT name, price FROM Sephora WHERE price > (SELECT AVG(price) FROM Sephora) ORDER BY price DESC;", '<p>Une <b>sous-requête</b> : la parenthèse calcule d\'abord la moyenne (50,06), puis on garde les produits plus chers.</p>', '2 730 lignes'),
      it('19', 'Le plus cher', "SELECT name, price FROM Sephora WHERE price = (SELECT MAX(price) FROM Sephora);", '<p>La parenthèse trouve le prix maximum (549), puis on cherche le ou les produits à ce prix. S\'il y avait des ex aequo, on les verrait tous.</p>', '1 ligne : Airwrap, 549 $'),
      it('20', '★ Marques sans édition limitée', "SELECT DISTINCT s.brand\nFROM Sephora AS s\nWHERE s.brand IS NOT NULL\n  AND NOT EXISTS (\n      SELECT 1 FROM Sephora AS p\n      WHERE p.brand = s.brand\n        AND p.limited_edition = 1\n  )\nORDER BY s.brand;",
        '<p><b>En simple :</b> « Donne-moi les marques qui n\'ont <b>aucun</b> produit en édition limitée. »</p><p><b>Pour chaque marque, l\'ordinateur réfléchit ainsi :</b></p><ol><li>Il prend une marque, par exemple « Dior ».</li><li>Il cherche : « Existe-t-il un produit Dior en édition limitée ? »</li><li>S\'il en trouve un, il <b>jette</b> Dior.</li><li>S\'il n\'en trouve aucun, il <b>garde</b> la marque.</li></ol><p>Dans tes notes, il y a <code>s .brand</code> avec un espace : écris plutôt <code>s.brand</code>, collé.</p>', '140 marques')
    ],
    fin: `<div class="btn-row"><a class="btn" href="#/tp2">TP2 — Astérix →</a><a class="btn ghost" href="#/exercices">S'entraîner avec les exercices</a></div>`
  };

  function it2(n, titre, sql, expl) { return { n: n, titre: titre, sql: sql, expl: expl }; }
  C.tp.tp2 = {
    kicker: '🛡️ TP2', titre: 'TP2 — Astérix, expliqué simplement',
    intro: `<p class="lead">Ici, il y a <b>plusieurs tableaux</b>. Chaque requête n'en utilise qu'un : c'est exactement comme Sephora.</p>
${H.table(['Table', 'Ce qu\'elle contient', 'Colonnes utilisées'], [
  ['<b>gaulois</b>', 'les personnages', '<code>gauno</code> (numéro), <code>nom</code>, <code>sexe</code>, <code>metier</code>, <code>vilno</code> (numéro du village)'],
  ['<b>village</b>', 'les villages', '<code>vilno</code>, <code>nom</code>, <code>nbhutte</code> (nombre de huttes)'],
  ['<b>absorption</b>', 'les fois où quelqu\'un boit de la potion', '<code>dateab</code> (date), <code>doses</code>'],
  ['<b>bataille</b>', 'les batailles', '<code>datebat</code> (date)']
])}
${H.box('idee', 'À savoir', '<p>La base Astérix n\'est pas disponible sur ce site : les requêtes sont donc affichées sans bouton « Exécuter ». Les colonnes ont été retrouvées à partir de tes réponses. Les questions 9, 10, 14 et 17 n\'ont pas d\'énoncé : elles ne sont pas traitées.</p>')}`,
    items: [
      it2('1', 'Tous les gaulois, du plus grand numéro au plus petit', "SELECT * FROM gaulois ORDER BY gauno DESC;", '<p><code>*</code> = toutes les colonnes. <code>DESC</code> = du plus grand au plus petit.</p>'),
      it2('2', 'Les druides, rangés par nom', "SELECT gauno, nom, metier FROM gaulois\nWHERE metier = 'druide'\nORDER BY nom, gauno;", '<p>WHERE garde seulement les druides. ORDER BY range par nom, et en cas de noms identiques, par numéro.<br>⚠️ <code>\'druide\'</code> doit être écrit exactement comme dans la base.</p>'),
      it2('3', 'Les villages qui ont entre 15 et 50 huttes', "SELECT vilno, nom, nbhutte FROM village\nWHERE nbhutte BETWEEN 15 AND 50\nORDER BY nbhutte, vilno;", '<p>BETWEEN : de 15 à 50, <b>bornes comprises</b>.</p>'),
      it2('4', 'Les gaulois dont le nom contient « ix »', "SELECT gauno, nom FROM gaulois\nWHERE nom LIKE '%ix%'\nORDER BY nom, gauno;", '<p>Astérix, Obélix, Panoramix… <code>%ix%</code> = « ix » n\'importe où dans le nom.</p>'),
      it2('5', 'Sexe ou métier inconnu', "SELECT gauno, nom, sexe, metier FROM gaulois\nWHERE sexe IS NULL OR metier IS NULL\nORDER BY gauno;", '<p>On utilise bien <code>IS NULL</code> (jamais <code>= NULL</code>). OR : il suffit qu\'<b>une</b> des deux cases soit vide.</p>'),
      it2('6', 'La liste des métiers', "SELECT DISTINCT metier FROM gaulois\nWHERE metier IS NOT NULL\nORDER BY metier;", '<p>DISTINCT : chaque métier une seule fois. IS NOT NULL : sans les cases vides.</p>'),
      it2('7', 'Les 3 plus gros villages', "SELECT vilno, nom, nbhutte FROM village\nORDER BY nbhutte DESC, vilno ASC\nLIMIT 3;", '<p>On trie par nombre de huttes du plus grand au plus petit ; en cas d\'égalité, le plus petit numéro passe avant. Puis on garde les 3 premiers.</p>'),
      it2('8', 'Les guerriers et les druides du village n°8', "SELECT gauno, nom, metier FROM gaulois\nWHERE vilno = 8 AND (metier = 'guerrier' OR metier = 'druide')\nORDER BY gauno;", '<p>Les <b>parenthèses sont indispensables</b>. Sans elles, on aurait tous les druides <b>de tous les villages</b> (l\'ordinateur fait AND avant OR). On peut aussi écrire <code>metier IN (\'guerrier\', \'druide\')</code>.</p>'),
      it2('11', 'Trois comptages en une requête', "SELECT COUNT(*)               AS nombre_personnages,\n       COUNT(metier)          AS metiers_renseignes,\n       COUNT(DISTINCT metier) AS metiers_distincts\nFROM gaulois;", '<ul><li><code>COUNT(*)</code> = tous les gaulois ;</li><li><code>COUNT(metier)</code> = seulement ceux dont on connaît le métier ;</li><li><code>COUNT(DISTINCT metier)</code> = combien de métiers <b>différents</b> (guerrier, druide, barde… = 3).</li></ul>'),
      it2('12', 'Statistiques sur les huttes', "SELECT COUNT(nbhutte), MIN(nbhutte), MAX(nbhutte), ROUND(AVG(nbhutte))\nFROM village;", '<p>Le nombre de villages, le plus petit, le plus grand et la moyenne arrondie à l\'entier (<code>ROUND</code> sans chiffre). Pour améliorer : ajouter des noms avec <code>AS</code>.</p>'),
      it2('13', 'Les prises de potion', "SELECT COUNT(DISTINCT dateab) AS nbevents,\n       SUM(doses)             AS total_doses,\n       ROUND(AVG(doses), 2)   AS moy_doses\nFROM absorption;", '<p>⚠️ <code>COUNT(DISTINCT dateab)</code> compte les <b>dates différentes</b>, pas le nombre de prises : si deux gaulois boivent le même jour, ça ne compte qu\'une fois. Si l\'énoncé demandait le nombre de prises, il fallait <code>COUNT(*)</code>.</p>'),
      it2('15', 'Première et dernière bataille', "SELECT MIN(datebat) AS premiere, MAX(datebat) AS derniere FROM bataille;", '<p>MIN et MAX marchent sur des dates <b>si elles sont écrites AAAA-MM-JJ</b> (par exemple 2026-09-15). Avec JJ/MM/AAAA, le tri serait faux.</p>'),
      it2('16', 'Le nombre d\'habitants de chaque village', "SELECT vilno, COUNT(*) AS popu\nFROM gaulois\nGROUP BY vilno\nORDER BY popu DESC;", '<p>C\'est un <b>GROUP BY</b> : on fait <b>un tas par village</b>, puis on compte les gaulois dans chaque tas. Les gaulois sans village (<code>vilno</code> vide) forment leur propre tas « NULL ».</p>')
    ],
    fin: `<div class="btn-row"><a class="btn" href="#/exercices">S'entraîner avec les exercices →</a></div>`
  };
})();
