/* =========================================================
   Contenu : le cours (chapitres), la méthode, la fiche mémo
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1;

  var MINI = H.table(['name', 'brand', 'category', 'price', 'love'], [
    ['Rouge A', 'Dior', 'Lipstick', 30, 120], ['Rouge B', 'Dior', 'Lipstick', 50, 200],
    ['Rouge C', 'Nova', 'Lipstick', 50, 80], ['Mascara A', 'Dior', 'Mascara', 20, 150],
    ['Mascara B', 'Nova', 'Mascara', 40, 90], ['Soin A', 'Nova', 'Skincare', 60, 70],
    ['Soin B', 'Luma', 'Skincare', null, 30], ['Soin C', 'Luma', 'Skincare', 20, 40]
  ], 'compact');
  C.MINI_TABLE = MINI;

  var miniRappel = `<details class="think" style="background:var(--blue-soft)"><summary style="color:var(--blue)">📋 Revoir la mini-table de 8 produits</summary>${MINI}</details>`;

  C.cours = [
    /* ------------------------------------------------------ 0 */
    {
      id: 'demarrer', num: '0', short: 'Bien démarrer', titre: 'Bien démarrer',
      lead: 'Comment utiliser ce site, et comment ouvrir la base de données sur ton ordinateur.',
      html: `
<h2>Comment lire ce cours</h2>
<ul>
  <li>Lis <b>un chapitre à la fois</b>. Ne cherche pas à aller vite.</li>
  <li>Après chaque chapitre, réponds au <b>petit quiz</b> en bas de la page.</li>
  <li>Dans les cadres noirs, tu peux <b>écrire et exécuter de vraies requêtes</b>. Clique sur <b>▶ Exécuter</b>, ou appuie sur <b>Ctrl + Entrée</b>.</li>
  <li>Pour les exercices : essaie d'abord, et regarde la réponse <b>seulement après</b>.</li>
  <li>Si tu bloques, c'est normal. Relis la partie « Comment réfléchir ».</li>
</ul>

<h2>Essaie tout de suite</h2>
<p>Voici une vraie requête. Clique sur <b>▶ Exécuter</b> et regarde le résultat qui apparaît en dessous.</p>
${H.try('sephora', "SELECT name, brand, price\nFROM Sephora\nLIMIT 5;")}
<p>Bravo, tu viens d'exécuter ta première requête SQL ! Tu peux changer le <code>5</code> en <code>10</code> et exécuter à nouveau.</p>
${H.box('retenir', 'Tu ne peux rien casser', '<p>Les requêtes de ce cours <b>lisent</b> le tableau, elles ne le modifient pas. Essaie tout ce que tu veux.</p>')}

<h2>Travailler sur ton ordinateur (comme en TP)</h2>
<p>En TP, tu utilises le logiciel gratuit <b>DB Browser for SQLite</b>.</p>
<ol>
  <li>Installe <b>DB Browser for SQLite</b> (site : <a href="https://sqlitebrowser.org" target="_blank" rel="noopener">sqlitebrowser.org</a>).</li>
  <li>Ouvre le logiciel. Clique sur <b>« Ouvrir une base de données »</b>.</li>
  <li>Choisis le fichier <b><code>sephora.db</code></b>.</li>
  <li>Va dans l'onglet <b>« Exécuter le SQL »</b>.</li>
  <li>Écris ta requête, puis clique sur <b>▶</b> (ou Ctrl + Entrée).</li>
  <li>Le résultat s'affiche en bas, avec le nombre de lignes trouvées.</li>
</ol>
${H.box('piege', 'Le bon fichier', '<p>Ouvre le fichier <code>.db</code>. Le fichier <code>.sqbpro</code> n\'est qu\'un fichier de réglages des fenêtres : il ne contient pas les données.</p>')}
<p>Tu peux aussi <a href="data/sephora.db" download>télécharger ici la base Sephora utilisée sur ce site</a>. C'est une version allégée (sans les longs textes de description), mais toutes les colonnes du cours y sont, et les résultats sont identiques.</p>
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Quel fichier faut-il ouvrir dans DB Browser for SQLite ?', options: ['<code>sephora_sqlite.sqbpro</code>', '<code>sephora.db</code>', 'Le PDF du cours'], answer: 1, explain: 'Le fichier <code>.db</code> contient les données. Le <code>.sqbpro</code> ne contient que des réglages.' },
        { id: 'q2', type: 'qcm', q: 'Dans quel onglet de DB Browser écrit-on les requêtes ?', options: ['Structure de la base', 'Parcourir les données', 'Exécuter le SQL'], answer: 2, explain: 'C\'est l\'onglet <b>Exécuter le SQL</b>.' },
        { id: 'q3', type: 'qcm', q: 'Est-ce qu\'une requête SELECT peut abîmer la base ?', options: ['Oui, il faut faire très attention', 'Non, elle ne fait que lire les données'], answer: 1, explain: 'SELECT lit les données. Elle ne les modifie jamais.' }
      ]
    },

    /* ------------------------------------------------------ 1 */
    {
      id: 'base', num: '1', short: 'Une base de données ?', titre: 'C\'est quoi une base de données ?',
      lead: 'Une base de données, c\'est simplement un grand tableau, comme dans Excel.',
      html: `
<h2>Un tableau, comme dans Excel</h2>
<p>Voici le début du tableau des produits Sephora :</p>
${H.table(['name', 'brand', 'category', 'price', 'love'], [['Rouge A', 'Dior', 'Lipstick', 30, 120], ['Mascara A', 'Dior', 'Mascara', 20, 150], ['Soin A', 'Nova', 'Skincare', 60, 70]])}

<h2>Les 3 mots à connaître</h2>
<h3>La table</h3>
<p>C'est le tableau. Il a un nom. Ici, il s'appelle <b>Sephora</b>.</p>
<h3>Une ligne</h3>
<p>Une ligne = <b>un produit</b>. La ligne « Rouge A » parle du produit Rouge A.<br>
Dans la vraie base, il y a <b>9 168 lignes</b>, donc 9 168 produits.</p>
<h3>Une colonne</h3>
<p>Une colonne = <b>une information</b> sur les produits :</p>
<ul>
  <li><code>name</code> = le nom</li>
  <li><code>brand</code> = la marque</li>
  <li><code>category</code> = la catégorie (rouge à lèvres, mascara, parfum…)</li>
  <li><code>price</code> = le prix (en dollars)</li>
  <li><code>love</code> = combien de personnes ont mis le produit en favori ❤️</li>
</ul>
${H.box('image', 'Image à retenir', '<p>Une ligne, c\'est <b>une fiche produit</b>. Une colonne, c\'est <b>une case de la fiche</b> (le nom, le prix…).</p>')}

<h2>Les autres colonnes de la vraie table</h2>
${H.table(['Colonne', 'Ça veut dire'], [
  ['<code>rating</code>', 'la note, de 0 à 5 ⭐'],
  ['<code>number_of_reviews</code>', 'le nombre d\'avis'],
  ['<code>online_only</code>', 'vendu seulement sur Internet ? <b>1 = oui, 0 = non</b>'],
  ['<code>exclusive</code>', 'exclusivité Sephora ? 1 = oui, 0 = non'],
  ['<code>limited_edition</code>', 'édition limitée ? 1 = oui, 0 = non'],
  ['<code>value_price</code>', 'le prix « normal » (avant promotion)'],
  ['<code>size</code>', 'la contenance (ex. 50 mL)'],
  ['<code>id</code>', 'le numéro unique du produit']
])}

<h2>La mini-table du cours</h2>
<p>Pour comprendre, on utilise souvent une <b>petite table de 8 produits</b>. Elle est assez petite pour qu'on puisse tout vérifier avec les doigts 🖐️. Elle a aussi une table <code>Sephora</code>, mais avec seulement 5 colonnes.</p>
${MINI}
<p>Le prix de <b>Soin B</b> est vide (<span class="null">NULL</span>) : on ne le connaît pas. On en reparlera au chapitre 10.</p>
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Dans la table Sephora, une <b>ligne</b> représente…', options: ['une information (le prix, la marque…)', 'un produit', 'une requête'], answer: 1, explain: 'Une ligne = un produit. Une colonne = une information.' },
        { id: 'q2', type: 'qcm', q: 'La colonne <code>brand</code> contient…', options: ['la marque', 'le prix', 'la catégorie'], answer: 0, explain: '<i>brand</i> veut dire « marque » en anglais.' },
        { id: 'q3', type: 'qcm', q: 'Dans la colonne <code>exclusive</code>, que veut dire la valeur 1 ?', options: ['Il reste 1 produit', 'Oui, c\'est une exclusivité', 'Non, ce n\'est pas une exclusivité'], answer: 1, explain: 'Pour ces colonnes, 1 = oui et 0 = non.' },
        { id: 'q4', type: 'open', q: 'Avec tes mots : quelle est la différence entre une ligne et une colonne ?', model: '<p>Une <b>ligne</b> = un produit (une fiche). Une <b>colonne</b> = une information sur tous les produits (le nom, le prix…).</p>' }
      ]
    },

    /* ------------------------------------------------------ 2 */
    {
      id: 'langue', num: '2', short: 'Parler à l\'ordinateur', titre: 'Parler à l\'ordinateur',
      lead: 'Le SQL est une langue. On écrit une phrase (une requête), l\'ordinateur répond avec un petit tableau.',
      html: `
<h2>Le SQL, c'est une langue</h2>
<p>Pour poser une question au tableau, on écrit une phrase dans une langue spéciale : <b>le SQL</b>.<br>
Cette phrase s'appelle <b>une requête</b>. L'ordinateur la lit et répond avec <b>un petit tableau</b> : le <b>résultat</b>.</p>
${H.try('mini', "SELECT name FROM Sephora;")}
<p>Ça veut dire : « Montre-moi les noms des produits de la table Sephora. »</p>

<h2>Les mots SQL sont de l'anglais</h2>
${H.table(['SQL', 'En français'], [['SELECT', 'sélectionne / montre-moi'], ['FROM', 'dans / depuis'], ['WHERE', 'où / seulement si'], ['ORDER BY', 'trie par'], ['COUNT', 'compte']])}

<h2>Les 5 règles d'écriture</h2>
<h3>Règle 1 — Le texte se met entre apostrophes droites</h3>
<p>✅ <code>'Dior'</code> &nbsp; ❌ <code>Dior</code> (sans apostrophes) &nbsp; ❌ <code>‘Dior’</code> (apostrophes penchées)</p>
${H.box('piege', 'Attention au copier-coller', '<p>Word et Pages transforment les apostrophes droites en apostrophes penchées. <b>Ça ne marche plus</b>. Sur ce site, les apostrophes penchées apparaissent <span class="t-bad" style="padding:0 4px">en rouge</span> dans l\'éditeur.</p>')}
<p>Essaie : exécute cette requête (sans apostrophes), lis l'erreur, puis ajoute les apostrophes autour de Dior.</p>
${H.try('mini', "SELECT name FROM Sephora WHERE brand = Dior;")}

<h3>Règle 2 — Les nombres : sans apostrophes, avec un point, sans espace</h3>
<p>✅ <code>29.5</code> ✅ <code>100000</code> &nbsp; ❌ <code>29,5</code> ❌ <code>100 000</code></p>

<h3>Règle 3 — On finit par un point-virgule <code>;</code></h3>
<p>C'est le point final de la phrase.</p>

<h3>Règle 4 — On peut aller à la ligne</h3>
<p>Ça ne change rien pour l'ordinateur, mais c'est plus facile à lire pour toi. Ces deux requêtes sont identiques :</p>
${H.code("SELECT name, price FROM Sephora WHERE brand = 'Dior';")}
${H.code("SELECT name, price\nFROM Sephora\nWHERE brand = 'Dior';")}

<h3>Règle 5 — Avec <code>=</code>, les majuscules comptent dans le texte</h3>
<p><code>'Dior'</code> et <code>'dior'</code>, ce n'est pas pareil. Essaie avec <code>'dior'</code> : il n'y a aucun résultat.</p>
${H.try('mini', "SELECT name FROM Sephora WHERE brand = 'dior';")}
<p>Par contre, pour les <b>mots SQL</b> (SELECT, FROM…), majuscules ou minuscules, c'est pareil. On les écrit en majuscules par habitude, pour mieux lire.</p>
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Quelle écriture est correcte ?', options: ['<code>brand = Dior</code>', '<code>brand = \'Dior\'</code>', '<code>brand = ‘Dior’</code>'], answer: 1, explain: 'Le texte se met entre apostrophes <b>droites</b>.' },
        { id: 'q2', type: 'qcm', q: 'Comment écrire le nombre « cent mille » dans une requête ?', options: ['<code>100 000</code>', '<code>\'100000\'</code>', '<code>100000</code>'], answer: 2, explain: 'Un nombre s\'écrit sans espace et sans apostrophes.' },
        { id: 'q3', type: 'qcm', q: 'Comment écrire 12,5 dans une requête ?', options: ['<code>12,5</code>', '<code>12.5</code>'], answer: 1, explain: 'En SQL, on met un point pour les décimales, comme en anglais.' },
        { id: 'q4', type: 'sql', db: 'mini', q: 'Corrige cette requête pour qu\'elle affiche les noms des produits <b>Nova</b> : <code>SELECT name FROM Sephora WHERE brand = Nova;</code>', starter: 'SELECT name FROM Sephora WHERE brand = Nova;', solution: "SELECT name FROM Sephora WHERE brand = 'Nova';", check: {}, expected: '3 lignes : Rouge C, Mascara B, Soin A' }
      ]
    },

    /* ------------------------------------------------------ 3 */
    {
      id: 'select', num: '3', short: 'SELECT et FROM', titre: 'SELECT et FROM : choisir les colonnes',
      lead: 'SELECT dit quelles colonnes on veut voir. FROM dit dans quel tableau.',
      html: `
<h2>L'idée</h2>
<ul><li><b>SELECT</b> = quelles <b>colonnes</b> je veux voir.</li><li><b>FROM</b> = dans quel <b>tableau</b>.</li></ul>
<h2>Exemple</h2>
${H.try('mini', "SELECT name, price\nFROM Sephora;")}
<p><b>En français :</b> « Montre-moi le nom et le prix de tous les produits. »<br>
<b>Résultat :</b> les 8 produits, mais seulement 2 colonnes.</p>

<h2>À savoir</h2>
<ul>
  <li>On sépare les colonnes par <b>des virgules</b>.</li>
  <li><b>Pas de virgule</b> après la dernière colonne (sinon : erreur).</li>
  <li>L'ordre dans SELECT = l'ordre d'affichage. <code>SELECT price, name</code> affiche le prix en premier.</li>
  <li>L'étoile <code>*</code> veut dire <b>« toutes les colonnes »</b>.</li>
</ul>
${H.try('mini', "SELECT * FROM Sephora;")}
${H.box('image', 'Image', '<p>SELECT, c\'est comme <b>cacher les colonnes</b> qu\'on ne veut pas voir dans Excel.</p>')}
${H.box('piege', 'L\'ordre des lignes', '<p>Sans tri (chapitre 6), l\'ordre des lignes n\'est pas garanti. Ne suppose jamais que la première ligne est « la plus chère ».</p>')}

<h2>À toi : sur la vraie base</h2>
<p>Change la requête pour afficher aussi la catégorie (<code>category</code>).</p>
${H.try('sephora', "SELECT name, brand, price\nFROM Sephora;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Que fait <code>SELECT * FROM Sephora;</code> ?', options: ['Elle affiche la première ligne', 'Elle affiche toutes les colonnes et toutes les lignes', 'Elle compte les produits'], answer: 1, explain: '<code>*</code> = toutes les colonnes. Il n\'y a pas de filtre, donc toutes les lignes.' },
        { id: 'q2', type: 'qcm', q: 'Où est l\'erreur dans <code>SELECT name, price, FROM Sephora;</code> ?', options: ['Il manque une colonne', 'Il y a une virgule en trop avant FROM', 'FROM doit être avant SELECT'], answer: 1, explain: 'Pas de virgule après la dernière colonne.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche le <b>nom</b> et la <b>marque</b> de tous les produits (dans cet ordre).', solution: 'SELECT name, brand FROM Sephora;', check: {}, expected: '8 lignes, 2 colonnes', think: '<p>Afficher quoi ? le nom et la marque → <code>SELECT name, brand</code>. Dans quel tableau ? → <code>FROM Sephora</code>.</p>' }
      ]
    },

    /* ------------------------------------------------------ 4 */
    {
      id: 'where', num: '4', short: 'WHERE', titre: 'WHERE : choisir les lignes',
      lead: 'WHERE est un filtre. L\'ordinateur garde seulement les lignes pour lesquelles la condition est vraie.',
      html: `
<h2>L'idée</h2>
<p><b>WHERE</b> est un <b>filtre</b>, comme une passoire. L'ordinateur regarde <b>chaque ligne, une par une</b>, et se pose une question :</p>
<ul><li>si la réponse est <b>oui</b> → il <b>garde</b> la ligne ;</li><li>si la réponse est <b>non</b> → il <b>jette</b> la ligne.</li></ul>

<h2>Exemple</h2>
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE brand = 'Dior';")}
<p><b>En français :</b> « Montre-moi le nom et le prix, <b>seulement pour</b> les produits Dior. »</p>
<p><b>L'ordinateur fait ça :</b><br>
Rouge A → Dior ? Oui ✅ gardé<br>
Rouge B → Dior ? Oui ✅ gardé<br>
Rouge C → Dior ? Non (Nova) ❌ jeté<br>
Mascara A → Dior ? Oui ✅ gardé<br>
Les autres → Non ❌</p>
<p><b>Résultat :</b> Rouge A, Rouge B, Mascara A.</p>
${miniRappel}

<h2>Les signes pour comparer</h2>
${H.table(['Signe', 'Se lit', 'Exemple', 'Garde…'], [
  ['<code>=</code>', 'égal à', '<code>price = 50</code>', 'les produits à 50'],
  ['<code>&lt;&gt;</code>', 'différent de', '<code>price &lt;&gt; 50</code>', 'tous sauf ceux à 50'],
  ['<code>&gt;</code>', 'plus grand que', '<code>price &gt; 50</code>', 'au-dessus de 50 (<b>pas</b> 50)'],
  ['<code>&gt;=</code>', 'plus grand <b>ou égal</b>', '<code>price &gt;= 50</code>', '50 et au-dessus'],
  ['<code>&lt;</code>', 'plus petit que', '<code>price &lt; 50</code>', 'en dessous de 50 (<b>pas</b> 50)'],
  ['<code>&lt;=</code>', 'plus petit ou égal', '<code>price &lt;= 50</code>', '50 et en dessous']
])}
${H.box('idee', 'Astuce', '<p>Le petit trait sous le signe (<code>&gt;=</code>) veut dire « <b>ou égal</b> ». Sans lui, le nombre lui-même n\'est pas compris.</p>')}
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE price > 40;")}
<p>Change <code>&gt;</code> en <code>&gt;=</code> et exécute à nouveau : Mascara B (40) apparaît.</p>

<h2>Deux conditions : AND et OR</h2>
<p><b>AND = ET</b> → les <b>deux</b> conditions doivent être vraies.<br><b>OR = OU</b> → <b>au moins une</b> des deux doit être vraie.</p>
<h3>Exemple avec AND</h3>
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE brand = 'Dior' AND price > 25;")}
<p>Rouge A : Dior ✅ et 30 &gt; 25 ✅ → <b>gardé</b><br>Rouge B : Dior ✅ et 50 &gt; 25 ✅ → <b>gardé</b><br>Mascara A : Dior ✅ mais 20 &gt; 25 ❌ → jeté (il en manque un)</p>
<h3>Exemple avec OR</h3>
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE brand = 'Luma' OR price > 55;")}
<p>Résultat : Soin B (Luma), Soin C (Luma), Soin A (60 &gt; 55).</p>
<h3>NOT = le contraire</h3>
<p><code>WHERE NOT brand = 'Dior'</code> garde tout ce qui n'est pas Dior (comme <code>brand &lt;&gt; 'Dior'</code>).</p>

<h2>⚠️ Le grand piège : mélanger AND et OR</h2>
<p>L'ordinateur fait toujours <b>AND en premier</b>, comme en maths où on fait la multiplication avant l'addition.</p>
<p>On veut : « les produits Dior ou Nova, qui coûtent plus de 25 ».</p>
<p>❌ Sans parenthèses, l'ordinateur comprend « tous les Dior, <b>ou bien</b> les Nova à plus de 25 ». Il garde donc Mascara A (Dior à 20). C'est faux !</p>
${H.try('mini', "SELECT name, brand, price\nFROM Sephora\nWHERE brand = 'Dior' OR brand = 'Nova' AND price > 25;", 'Sans parenthèses (faux)')}
<p>✅ Avec des parenthèses :</p>
${H.try('mini', "SELECT name, brand, price\nFROM Sephora\nWHERE (brand = 'Dior' OR brand = 'Nova') AND price > 25;", 'Avec parenthèses (juste)')}
${H.box('retenir', 'Règle simple', '<p><b>AND et OR dans la même phrase = parenthèses, toujours.</b></p>')}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Un produit coûte exactement 50. Est-il gardé par <code>WHERE price &gt; 50</code> ?', options: ['Oui', 'Non'], answer: 1, explain: '<code>&gt;</code> veut dire « strictement plus grand ». 50 n\'est pas plus grand que 50. Il faudrait <code>&gt;=</code>.' },
        { id: 'q2', type: 'qcm', q: 'Que garde <code>WHERE brand = \'Dior\' AND price &lt; 25</code> sur la mini-table ?', options: ['Rouge A et Rouge B', 'Mascara A', 'Tous les produits Dior et tous ceux à moins de 25'], answer: 1, explain: 'Il faut être Dior <b>ET</b> coûter moins de 25 : seul Mascara A (20) remplit les deux conditions.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche le nom des produits qui coûtent <b>40 ou plus</b>.', solution: 'SELECT name FROM Sephora WHERE price >= 40;', check: {}, expected: '4 lignes : Rouge B, Rouge C, Mascara B, Soin A', think: '<p>« 40 ou plus » → <code>&gt;=</code>. N\'oublie pas que 40 doit être compris.</p>' },
        { id: 'q4', type: 'sql', db: 'mini', q: 'Affiche le nom des produits <b>Nova ou Luma</b> qui coûtent <b>moins de 45</b>.', solution: "SELECT name FROM Sephora WHERE (brand = 'Nova' OR brand = 'Luma') AND price < 45;", check: {}, expected: '2 lignes : Mascara B, Soin C', think: '<p>Il y a un OU (Nova ou Luma) et un ET (moins de 45) : mets des <b>parenthèses</b> autour du OU.</p>' }
      ]
    },

    /* ------------------------------------------------------ 5 */
    {
      id: 'raccourcis', num: '5', short: 'BETWEEN, IN, LIKE', titre: 'Trois raccourcis : BETWEEN, IN, LIKE',
      lead: 'Trois mots pour écrire plus vite certaines conditions.',
      html: `
<h2>BETWEEN = « entre … et … »</h2>
${H.code("WHERE price BETWEEN 20 AND 40")}
<p>Ça veut dire : le prix est <b>entre 20 et 40</b>, et <b>20 et 40 sont compris</b>. C'est la même chose que :</p>
${H.code("WHERE price >= 20 AND price <= 40")}
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE price BETWEEN 20 AND 40;")}

<h2>IN = « fait partie de la liste »</h2>
${H.code("WHERE brand IN ('Dior', 'Nova')")}
<p>Ça veut dire : la marque est <b>Dior ou Nova</b>. C'est la même chose que <code>brand = 'Dior' OR brand = 'Nova'</code>.</p>
${H.box('image', 'Image', '<p>IN, c\'est une <b>liste d\'invités</b> : si ton nom est sur la liste, tu entres.</p>')}
${H.try('mini', "SELECT name, category\nFROM Sephora\nWHERE category IN ('Lipstick', 'Mascara');")}

<h2>LIKE = « contient un morceau de texte »</h2>
<p><code>=</code> cherche le <b>mot exact</b>. LIKE cherche <b>un morceau</b>.<br>
On utilise le signe <b><code>%</code></b>, qui veut dire <b>« n'importe quoi »</b> (même rien du tout).</p>
${H.table(['J\'écris', 'Ça trouve'], [
  ['<code>LIKE \'%mascara%\'</code>', '« mascara » <b>n\'importe où</b> dans le nom'],
  ['<code>LIKE \'Mini%\'</code>', 'les noms qui <b>commencent</b> par Mini'],
  ['<code>LIKE \'%Set\'</code>', 'les noms qui <b>finissent</b> par Set'],
  ['<code>LIKE \'R_uge%\'</code>', '<code>_</code> remplace <b>une seule lettre</b> : Rouge…']
])}
${H.box('image', 'Image', '<p>Le <code>%</code>, c\'est un <b>joker</b> aux cartes : il remplace ce que tu veux.</p>')}
${H.try('sephora', "SELECT name, brand\nFROM Sephora\nWHERE name LIKE '%mascara%';")}
<p>Sur la vraie base, on trouve <b>168 produits</b>.</p>
${H.box('idee', 'Majuscules', '<p>Dans SQLite, LIKE <b>ne fait pas attention aux majuscules</b> : « Mascara » et « mascara » sont trouvés tous les deux (pas forcément pour les lettres accentuées).</p>')}
${H.box('piege', 'Un morceau, pas un mot', '<p><code>\'%lip%\'</code> trouve aussi « c<b>lip</b> » ou « s<b>lip</b>pers » : LIKE cherche des lettres qui se suivent, pas un mot entier.</p>')}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: '<code>price BETWEEN 20 AND 40</code> garde-t-il un produit à 40 ?', options: ['Oui, les deux bornes sont comprises', 'Non, 40 est exclu'], answer: 0, explain: 'Avec BETWEEN, les deux bornes sont <b>incluses</b>.' },
        { id: 'q2', type: 'qcm', q: 'Quel motif trouve les noms qui <b>commencent</b> par « Gel » ?', options: ['<code>\'%Gel%\'</code>', '<code>\'Gel%\'</code>', '<code>\'%Gel\'</code>'], answer: 1, explain: 'Le <code>%</code> seulement à la fin : « Gel » puis n\'importe quoi.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Avec <b>IN</b>, affiche le nom des produits des marques <b>Dior et Luma</b>.', solution: "SELECT name FROM Sephora WHERE brand IN ('Dior', 'Luma');", check: { mustInclude: ['IN'] }, expected: '5 lignes', think: '<p>Une liste de marques → <code>brand IN (\'Dior\', \'Luma\')</code>.</p>' },
        { id: 'q4', type: 'sql', db: 'sephora', q: 'Sur la vraie base : affiche les produits dont le nom <b>contient « palette »</b>.', solution: "SELECT name FROM Sephora WHERE name LIKE '%palette%';", check: { cols: ['name'] }, expected: '277 lignes', think: '<p>« contient » → LIKE avec <code>%</code> avant et après.</p>' }
      ]
    },

    /* ------------------------------------------------------ 6 */
    {
      id: 'ranger', num: '6', short: 'DISTINCT, ORDER BY, LIMIT', titre: 'Ranger le résultat : DISTINCT, ORDER BY, LIMIT',
      lead: 'Enlever les répétitions, trier, et garder seulement les premiers.',
      html: `
<h2>DISTINCT = enlever les répétitions</h2>
${H.try('mini', "SELECT brand FROM Sephora;", 'Sans DISTINCT')}
<p>Ça donne Dior, Dior, Nova, Dior… Ça se répète beaucoup.</p>
${H.try('mini', "SELECT DISTINCT brand FROM Sephora;", 'Avec DISTINCT')}
<p>Ça donne <b>Dior, Nova, Luma</b> : chaque marque <b>une seule fois</b>.</p>
${H.box('idee', 'Quand utiliser DISTINCT ?', '<p>DISTINCT répond à la question « <b>quelles sont les différentes…</b> ». Avec deux colonnes (<code>SELECT DISTINCT brand, category</code>), c\'est le <b>couple</b> marque + catégorie qui doit être unique.</p>')}

<h2>ORDER BY = trier</h2>
<ul>
  <li><code>ORDER BY price</code> → du <b>plus petit au plus grand</b> (1, 2, 3…). On peut écrire <code>ASC</code>, c'est le choix par défaut.</li>
  <li><code>ORDER BY price DESC</code> → du <b>plus grand au plus petit</b> (3, 2, 1…).</li>
</ul>
${H.box('astuce', 'Pour s\'en souvenir', '<p><b>DESC = DESCendre</b> : on part du haut et on descend.</p>')}
${H.try('mini', "SELECT name, price\nFROM Sephora\nORDER BY price DESC;")}
<h3>Deux critères</h3>
${H.code("ORDER BY price DESC, name")}
<p>« Trie par prix, du plus cher au moins cher. <b>Si deux produits ont le même prix</b>, range-les par nom (A, B, C…). »</p>

<h2>LIMIT = garder seulement les premiers</h2>
${H.try('mini', "SELECT name, price\nFROM Sephora\nORDER BY price DESC\nLIMIT 3;")}
<p><b>En français :</b> « Trie du plus cher au moins cher, puis garde <b>les 3 premiers</b>. »<br>Résultat : Soin A (60), Rouge B (50), Rouge C (50).</p>
${H.box('piege', 'Toujours trier avant de limiter', '<p>Sans ORDER BY, LIMIT prend des lignes au hasard. « Les 10 plus chers » = <code>ORDER BY price DESC</code> <b>puis</b> <code>LIMIT 10</code>.</p>')}
${H.box('image', 'Image', '<p>C\'est un <b>podium</b> : d\'abord on classe les coureurs, ensuite on garde les 3 premiers.</p>')}

<h2>À toi, sur la vraie base</h2>
<p>Les 10 produits les plus chers :</p>
${H.try('sephora', "SELECT name, brand, price\nFROM Sephora\nORDER BY price DESC\nLIMIT 10;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: '<code>ORDER BY price DESC</code> trie…', options: ['du moins cher au plus cher', 'du plus cher au moins cher'], answer: 1, explain: 'DESC = décroissant, on « descend » du plus grand au plus petit.' },
        { id: 'q2', type: 'qcm', q: 'Pour avoir « les 5 produits les moins chers », il faut…', options: ['<code>LIMIT 5</code> tout seul', '<code>ORDER BY price LIMIT 5</code>', '<code>ORDER BY price DESC LIMIT 5</code>'], answer: 1, explain: 'On trie du moins cher au plus cher (ASC, par défaut), puis on garde les 5 premiers.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche la liste des <b>différentes catégories</b>, sans répétition.', solution: 'SELECT DISTINCT category FROM Sephora;', check: {}, expected: '3 lignes : Lipstick, Mascara, Skincare', think: '<p>« différentes » → DISTINCT.</p>' },
        { id: 'q4', type: 'sql', db: 'mini', q: 'Affiche le nom et le love des <b>2 produits les plus aimés</b> (love le plus grand).', solution: 'SELECT name, love FROM Sephora ORDER BY love DESC LIMIT 2;', check: { ordered: true }, expected: 'Rouge B (200), Mascara A (150)', think: '<p>Trier par love du plus grand au plus petit (DESC), puis LIMIT 2.</p>' }
      ]
    },

    /* ------------------------------------------------------ 7 */
    {
      id: 'calculer', num: '7', short: 'Compter et calculer', titre: 'Compter et calculer',
      lead: 'Résumer beaucoup de lignes en un seul nombre : combien, le total, la moyenne, le plus petit, le plus grand.',
      html: `
<h2>L'idée</h2>
<p>Avant, on affichait <b>des produits</b>. Maintenant, on veut <b>un seul nombre</b> qui résume : combien il y en a, le plus cher, la moyenne…</p>

<h2>Les 5 outils de calcul</h2>
${H.table(['Outil', 'Ce qu\'il fait', 'Question en français'], [
  ['<code>COUNT(*)</code>', 'compte les lignes', '« Combien ? »'],
  ['<code>SUM(price)</code>', 'additionne', '« Combien en tout ? »'],
  ['<code>AVG(price)</code>', 'fait la moyenne', '« En moyenne ? »'],
  ['<code>MIN(price)</code>', 'trouve le plus petit', '« Le moins cher ? »'],
  ['<code>MAX(price)</code>', 'trouve le plus grand', '« Le plus cher ? »']
])}

<h2>Exemples sur la mini-table</h2>
${H.try('mini', "SELECT COUNT(*) FROM Sephora;")}
<p>→ <b>8</b>, car il y a 8 lignes.</p>
${H.try('mini', "SELECT MIN(price), MAX(price) FROM Sephora;")}
<p>→ <b>20</b> et <b>60</b>.</p>
${H.try('mini', "SELECT SUM(love) FROM Sephora;")}
<p>→ 120 + 200 + 80 + 150 + 90 + 70 + 30 + 40 = <b>780</b>.</p>
${H.box('piege', 'Une seule ligne', '<p>Le résultat fait <b>UNE seule ligne</b>. C\'est normal : on a résumé tout le tableau.</p>')}

<h2>Calculer seulement sur certains produits</h2>
<p>On ajoute un WHERE. L'ordinateur <b>filtre d'abord, puis calcule</b>.</p>
${H.try('mini', "SELECT COUNT(*) FROM Sephora WHERE brand = 'Dior';")}
<p>1. Il garde les Dior : Rouge A, Rouge B, Mascara A. 2. Il compte : <b>3</b>.</p>

<h2>AS = donner un nom à la colonne</h2>
${H.try('mini', "SELECT COUNT(*) AS nombre_dior\nFROM Sephora\nWHERE brand = 'Dior';")}
<p>La colonne du résultat s'appelle « nombre_dior » au lieu de « COUNT(*) ». C'est juste une <b>étiquette</b> (un <b>alias</b>) : ça ne change rien dans la base.</p>

<h2>ROUND = arrondir</h2>
${H.try('mini', "SELECT AVG(price), ROUND(AVG(price), 2)\nFROM Sephora;")}
<p><code>ROUND(…, 2)</code> veut dire « garde <b>2 chiffres</b> après la virgule ». <code>ROUND(x)</code> arrondit à l'entier.</p>

<h2>COUNT(*) ou COUNT(colonne) ?</h2>
<ul>
  <li><code>COUNT(*)</code> compte <b>toutes les lignes</b>.</li>
  <li><code>COUNT(price)</code> compte seulement les lignes où le prix est <b>rempli</b>.</li>
  <li><code>COUNT(DISTINCT brand)</code> compte les marques <b>différentes</b>.</li>
</ul>
${H.try('mini', "SELECT COUNT(*), COUNT(price), COUNT(DISTINCT brand)\nFROM Sephora;")}
<p>→ 8 lignes, 7 prix connus (Soin B est vide), 3 marques différentes.</p>
${H.box('idee', 'Et s\'il n\'y a aucune ligne ?', '<p>COUNT donne 0. SUM, AVG, MIN et MAX donnent <span class="null">NULL</span> (« rien à calculer »).</p>')}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Quel outil répond à « En moyenne, combien coûte un produit ? »', options: ['SUM', 'AVG', 'COUNT'], answer: 1, explain: 'AVG = average = moyenne.' },
        { id: 'q2', type: 'qcm', q: 'Sur la mini-table, que donne <code>SELECT COUNT(price) FROM Sephora;</code> ?', options: ['8', '7', '270'], answer: 1, explain: 'COUNT(price) ne compte pas la case vide de Soin B : 7.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche le <b>prix le plus élevé</b> des produits <b>Nova</b>.', solution: "SELECT MAX(price) FROM Sephora WHERE brand = 'Nova';", check: { value: true }, expected: '60', think: '<p>D\'abord on garde les Nova (WHERE), puis on prend le plus grand (MAX).</p>' },
        { id: 'q4', type: 'sql', db: 'sephora', q: 'Sur la vraie base : <b>combien</b> y a-t-il de produits de la marque <b>CLINIQUE</b> ?', solution: "SELECT COUNT(*) FROM Sephora WHERE brand = 'CLINIQUE';", check: { value: true }, expected: '234', think: '<p>« Combien » → COUNT(*). Attention : CLINIQUE est écrit en majuscules dans la base.</p>' }
      ]
    },

    /* ------------------------------------------------------ 8 */
    {
      id: 'groupby', num: '8', short: 'GROUP BY', titre: 'GROUP BY : calculer pour chaque groupe',
      lead: 'Un nombre pour chaque catégorie, ou pour chaque marque.',
      html: `
<h2>L'idée</h2>
<p>Au chapitre 7, on avait <b>un seul nombre pour tout le tableau</b>. Maintenant, on veut <b>un nombre pour chaque catégorie</b> (ou pour chaque marque).</p>
${H.box('image', 'Image des bonbons 🍬', '<p>Tu as un sac de bonbons. Tu fais <b>des tas par couleur</b> : les rouges ensemble, les verts ensemble, les jaunes ensemble. Ensuite tu <b>comptes chaque tas</b>.<br>GROUP BY, c\'est <b>faire les tas</b>.</p>')}

<h2>Exemple</h2>
${H.try('mini', "SELECT category, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY category;")}
<p><b>En français :</b> « Fais un tas par catégorie, et compte combien il y a de produits dans chaque tas. »</p>
<p><b>Étape 1 — Les tas :</b><br>
Tas <b>Lipstick</b> : Rouge A, Rouge B, Rouge C<br>
Tas <b>Mascara</b> : Mascara A, Mascara B<br>
Tas <b>Skincare</b> : Soin A, Soin B, Soin C</p>
<p><b>Étape 2 — On compte chaque tas :</b> Lipstick 3, Mascara 2, Skincare 3.</p>
<p>On avait 8 lignes, on obtient <b>3 lignes</b> : <b>une par tas</b>.</p>
${miniRappel}

<h2>Autre exemple : le prix moyen par marque</h2>
${H.try('mini', "SELECT brand, AVG(price) AS prix_moyen\nFROM Sephora\nGROUP BY brand;")}
<p>Dior : (30 + 50 + 20) ÷ 3 = <b>33,33</b><br>Nova : (50 + 40 + 60) ÷ 3 = <b>50</b><br>Luma : 20 ÷ 1 = <b>20</b> (le prix vide de Soin B ne compte pas)</p>

<h2>⚠️ La règle d'or</h2>
<p>Dans le SELECT, tu peux mettre <b>seulement</b> :</p>
<ul><li>la colonne qui sert à faire les tas (celle du GROUP BY) ;</li><li>des calculs (COUNT, AVG, SUM, MIN, MAX).</li></ul>
<p>❌ <code>SELECT name, COUNT(*) FROM Sephora GROUP BY category;</code><br>
Pourquoi c'est faux ? Le tas « Lipstick » contient 3 noms (Rouge A, B, C). L'ordinateur ne peut pas en afficher un seul : la question n'a pas de sens. SQLite l'accepte sans râler (il choisit un nom au hasard), mais <b>c'est une erreur de raisonnement</b>.</p>
${H.box('idee', 'Et l\'ordre ?', '<p>GROUP BY ne trie pas. Si tu veux un ordre, ajoute ORDER BY à la fin.</p>')}

<h2>Sur la vraie base</h2>
<p>Le nombre de produits par catégorie, du plus grand au plus petit :</p>
${H.try('sephora', "SELECT category, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY category\nORDER BY nombre DESC;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Sur la mini-table, combien de lignes donne <code>SELECT brand, COUNT(*) FROM Sephora GROUP BY brand;</code> ?', options: ['8', '3', '1'], answer: 1, explain: 'Une ligne par marque : Dior, Nova, Luma.' },
        { id: 'q2', type: 'qcm', q: 'Pourquoi <code>SELECT name, COUNT(*) FROM Sephora GROUP BY brand;</code> est une erreur de raisonnement ?', options: ['Parce que COUNT doit être en premier', 'Parce qu\'une marque a plusieurs noms : on ne sait pas lequel afficher', 'Parce qu\'il manque WHERE'], answer: 1, explain: 'Dans SELECT : la colonne du GROUP BY et des calculs, rien d\'autre.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche, <b>pour chaque marque</b>, la marque et le <b>total des love</b>.', solution: 'SELECT brand, SUM(love) FROM Sephora GROUP BY brand;', check: {}, expected: 'Dior 470, Nova 240, Luma 70', think: '<p>« pour chaque marque » → GROUP BY brand. « total » → SUM(love).</p>' },
        { id: 'q4', type: 'open', q: 'Explique avec tes mots (l\'image des bonbons peut t\'aider) ce que fait GROUP BY.', model: '<p>GROUP BY <b>fait des tas</b> : il range ensemble les lignes qui ont la même valeur (même catégorie, même marque…). Ensuite, les calculs (COUNT, AVG…) se font <b>dans chaque tas</b>, et on obtient une ligne par tas.</p>' }
      ]
    },

    /* ------------------------------------------------------ 9 */
    {
      id: 'having', num: '9', short: 'HAVING', titre: 'HAVING : choisir les groupes',
      lead: 'WHERE trie les produits avant de faire les tas. HAVING trie les tas après les calculs.',
      html: `
<h2>Deux filtres différents</h2>
${H.table(['Filtre', 'Il trie…', 'Quand ?'], [
  ['<b>WHERE</b>', 'les <b>lignes</b> (les produits)', '<b>avant</b> de faire les tas'],
  ['<b>HAVING</b>', 'les <b>tas</b> (les groupes)', '<b>après</b> avoir fait les tas']
])}
${H.box('image', 'Image des bonbons 🍬', '<p><b>WHERE</b> = avant de faire les tas, tu jettes les bonbons cassés.<br><b>HAVING</b> = après avoir fait les tas, tu gardes seulement les tas qui ont au moins 3 bonbons.</p>')}

<h2>Exemple</h2>
<p><b>Question :</b> « Quelles marques ont <b>au moins 3 produits</b> ? »</p>
${H.try('mini', "SELECT brand, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY brand\nHAVING COUNT(*) >= 3;")}
<p>1. On fait les tas par marque : Dior (3), Nova (3), Luma (2).<br>2. HAVING garde les tas qui ont 3 produits ou plus : <b>Dior et Nova</b>.</p>

<h2>Exemple avec les deux filtres</h2>
<p><b>Question :</b> « Quelles marques ont au moins 2 produits <b>à 30 $ ou plus</b> ? »</p>
${H.try('mini', "SELECT brand, COUNT(*) AS nombre\nFROM Sephora\nWHERE price >= 30\nGROUP BY brand\nHAVING COUNT(*) >= 2;")}
${H.table(['Étape', 'Ce qui se passe'], [
  ['1. WHERE price >= 30', 'on jette les produits à moins de 30 : il reste Rouge A, Rouge B, Rouge C, Mascara B, Soin A'],
  ['2. GROUP BY brand', 'Dior {Rouge A, Rouge B} = 2 · Nova {Rouge C, Mascara B, Soin A} = 3 · Luma a disparu'],
  ['3. HAVING COUNT(*) >= 2', 'on garde Dior (2) et Nova (3)']
])}

<h2>⚠️ Le piège</h2>
<p>❌ <code>WHERE COUNT(*) &gt;= 2</code> → <b>erreur !</b> Au moment du WHERE, les tas n'existent pas encore : on ne peut pas les compter. Essaie, et lis le message :</p>
${H.try('mini', "SELECT brand, COUNT(*)\nFROM Sephora\nWHERE COUNT(*) >= 2\nGROUP BY brand;", 'Requête fausse')}
${H.box('retenir', 'Le truc pour choisir', '<p>La condition parle <b>d\'un produit</b> (son prix, sa marque) → <b>WHERE</b>.<br>La condition parle <b>d\'un groupe</b> (combien, moyenne du groupe) → <b>HAVING</b>.</p>')}

<h2>Sur la vraie base</h2>
<p>Les marques qui ont plus de 150 produits :</p>
${H.try('sephora', "SELECT brand, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY brand\nHAVING COUNT(*) > 150\nORDER BY nombre DESC;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: '« Les catégories dont le prix moyen dépasse 40 » : quel filtre utiliser ?', options: ['WHERE AVG(price) > 40', 'HAVING AVG(price) > 40'], answer: 1, explain: 'Le prix moyen est un calcul sur un groupe : c\'est HAVING.' },
        { id: 'q2', type: 'qcm', q: '« Les produits qui coûtent plus de 40 » : quel filtre utiliser ?', options: ['WHERE price > 40', 'HAVING price > 40'], answer: 0, explain: 'La condition porte sur un produit : WHERE.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche les <b>catégories</b> qui ont <b>exactement 3 produits</b>, avec leur nombre.', solution: 'SELECT category, COUNT(*) FROM Sephora GROUP BY category HAVING COUNT(*) = 3;', check: {}, expected: 'Lipstick 3, Skincare 3', think: '<p>Tas par catégorie (GROUP BY), puis on garde les tas qui ont 3 produits (HAVING COUNT(*) = 3).</p>' },
        { id: 'q4', type: 'open', q: 'Explique la différence entre WHERE et HAVING en une ou deux phrases.', model: '<p><b>WHERE</b> filtre les <b>lignes</b> (les produits), <b>avant</b> de faire les groupes. <b>HAVING</b> filtre les <b>groupes</b>, <b>après</b> les calculs (COUNT, AVG…).</p>' }
      ]
    },

    /* ------------------------------------------------------ 10 */
    {
      id: 'null', num: '10', short: 'Les cases vides (NULL)', titre: 'Les cases vides (NULL)',
      lead: 'NULL veut dire « je ne sais pas ». Ce n\'est pas zéro.',
      html: `
<h2>L'idée</h2>
<p>Parfois une case est <b>vide</b> : on ne connaît pas l'information. En SQL, une case vide s'appelle <b>NULL</b>.</p>
${H.box('piege', 'NULL n\'est pas zéro', '<p>NULL veut dire « <b>je ne sais pas</b> ». Ce n\'est ni 0, ni un texte vide.</p>')}

<h2>Comment chercher les cases vides</h2>
<p>❌ <code>WHERE price = NULL</code> → <b>ne marche jamais</b> (aucun résultat).<br>
✅ <code>WHERE price IS NULL</code> → trouve les prix vides.<br>
✅ <code>WHERE price IS NOT NULL</code> → trouve les prix remplis.</p>
${H.try('mini', "SELECT name FROM Sephora WHERE price IS NULL;")}
<p>→ <b>Soin B</b>. Remplace <code>IS NULL</code> par <code>= NULL</code> et exécute : plus rien !</p>

<h2>Une case vide n'est jamais gardée par une comparaison</h2>
<p>Pour Soin B, <code>price &gt; 20</code> donne « je ne sais pas ». <code>price &lt;= 20</code> aussi. Or WHERE ne garde que ce qui est <b>vrai</b> : Soin B n'apparaît dans aucun des deux résultats.</p>

<h2>Ce que font les calculs avec les cases vides</h2>
<p>Les calculs <b>ignorent</b> les cases vides :</p>
<ul>
  <li><code>COUNT(*)</code> = <b>8</b> (il compte toutes les lignes)</li>
  <li><code>COUNT(price)</code> = <b>7</b> (seulement les prix remplis)</li>
  <li><code>AVG(price)</code> = 270 ÷ <b>7</b> = 38,57 (et pas ÷ 8)</li>
</ul>
${H.try('mini', "SELECT COUNT(*), COUNT(price), SUM(price), ROUND(AVG(price), 2)\nFROM Sephora;")}
${H.box('image', 'Image', '<p>Comme un contrôle où un élève est absent : la moyenne de la classe se calcule <b>sans lui</b>. On ne lui met pas 0.</p>')}

<h2>Et dans la vraie base Sephora ?</h2>
<p>Dans la vraie base, <b>il n'y a pas de cases vides</b>. Mais <b>398 produits ont une note de 0</b>, ce qui veut sûrement dire « pas encore noté ». Ces 0 font baisser la moyenne des notes : c'est un vrai piège !</p>
${H.try('sephora', "SELECT ROUND(AVG(rating), 2) AS avec_les_zeros FROM Sephora;")}
${H.try('sephora', "SELECT ROUND(AVG(rating), 2) AS sans_les_zeros FROM Sephora WHERE rating > 0;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Comment trouver les produits sans prix ?', options: ['<code>WHERE price = NULL</code>', '<code>WHERE price IS NULL</code>', '<code>WHERE price = 0</code>'], answer: 1, explain: 'On écrit toujours <code>IS NULL</code>, jamais <code>= NULL</code>.' },
        { id: 'q2', type: 'qcm', q: 'Sur la mini-table, AVG(price) divise la somme par…', options: ['8, le nombre de produits', '7, le nombre de prix connus'], answer: 1, explain: 'Les cases vides sont ignorées : 270 ÷ 7.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche le nom des produits dont le prix est <b>connu</b> (rempli).', solution: 'SELECT name FROM Sephora WHERE price IS NOT NULL;', check: {}, expected: '7 lignes (tous sauf Soin B)', think: '<p>« connu » = pas vide → <code>IS NOT NULL</code>.</p>' }
      ]
    },

    /* ------------------------------------------------------ 11 */
    {
      id: 'sousrequetes', num: '11', short: 'Sous-requêtes', titre: 'Une requête dans une requête',
      lead: 'Quand il faut d\'abord calculer quelque chose (la moyenne, le maximum…) avant de pouvoir répondre.',
      html: `
<h2>L'idée</h2>
<p><b>Question :</b> « Quels produits coûtent plus cher que la moyenne ? »<br>
Problème : on ne connaît pas la moyenne.<br>
Solution : on la fait <b>calculer par une petite requête</b>, qu'on met <b>entre parenthèses</b>. C'est une <b>sous-requête</b>.</p>

<h2>Exemple</h2>
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE price > (SELECT AVG(price) FROM Sephora);")}
<p><b>L'ordinateur fait ça en 2 temps :</b><br>
1. Il calcule <b>d'abord la parenthèse</b> : la moyenne vaut <b>38,57</b>.<br>
2. La requête devient : <code>WHERE price &gt; 38.57</code>.<br>
<b>Résultat :</b> Soin A (60), Rouge B (50), Rouge C (50), Mascara B (40).</p>
${H.box('astuce', 'Astuce très utile', '<p>Copie la parenthèse toute seule et exécute-la. Tu verras le chiffre qu\'elle donne. Ça aide beaucoup à comprendre.</p>')}
${H.try('mini', "SELECT AVG(price) FROM Sephora;", 'La parenthèse toute seule')}

<h2>Trouver le plus cher</h2>
${H.try('mini', "SELECT name, price\nFROM Sephora\nWHERE price = (SELECT MAX(price) FROM Sephora);")}
<p>1. La parenthèse donne 60. 2. On cherche les produits à 60 : <b>Soin A</b>.<br>
Avantage : si deux produits coûtent 60, <b>on voit les deux</b>. Avec <code>ORDER BY price DESC LIMIT 1</code>, on n'en verrait qu'un.</p>

<h2>Quand la parenthèse donne une LISTE : IN</h2>
<p><b>Question :</b> « Tous les produits des marques qui ont au moins 3 produits. »</p>
${H.try('mini', "SELECT name, brand\nFROM Sephora\nWHERE brand IN (\n    SELECT brand FROM Sephora\n    GROUP BY brand\n    HAVING COUNT(*) >= 3\n);")}
<p>1. La parenthèse donne <b>une liste</b> : Dior, Nova.<br>2. La requête devient <code>WHERE brand IN ('Dior', 'Nova')</code>.<br>3. <b>Résultat :</b> les 6 produits Dior et Nova.</p>
${H.box('retenir', 'Le truc', '<p>La parenthèse donne <b>un seul nombre</b> → <code>=</code> ou <code>&gt;</code> ou <code>&lt;</code>.<br>La parenthèse donne <b>une liste</b> → <code>IN</code>.</p>')}

<h2>Sur la vraie base</h2>
<p>Le produit le plus cher de toute la boutique :</p>
${H.try('sephora', "SELECT name, brand, price\nFROM Sephora\nWHERE price = (SELECT MAX(price) FROM Sephora);")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Dans une requête avec une sous-requête, qu\'est-ce qui est calculé en premier ?', options: ['La grande requête', 'La parenthèse (la sous-requête)'], answer: 1, explain: 'L\'ordinateur calcule d\'abord la parenthèse, puis utilise son résultat.' },
        { id: 'q2', type: 'qcm', q: 'La sous-requête renvoie <b>plusieurs marques</b>. Quel mot utiliser ?', options: ['=', 'IN', 'LIKE'], answer: 1, explain: 'Une liste → IN.' },
        { id: 'q3', type: 'sql', db: 'mini', q: 'Affiche le nom et le prix du ou des produits <b>les moins chers</b>, avec une sous-requête.', solution: 'SELECT name, price FROM Sephora WHERE price = (SELECT MIN(price) FROM Sephora);', check: { cols: ['name'] }, expected: 'Mascara A et Soin C (20)', think: '<p>1. La parenthèse : le prix le plus petit → <code>SELECT MIN(price) FROM Sephora</code>. 2. Les produits dont le prix est égal à ça.</p>' },
        { id: 'q4', type: 'sql', db: 'sephora', q: 'Sur la vraie base : <b>combien</b> de produits coûtent plus cher que la moyenne ?', solution: 'SELECT COUNT(*) FROM Sephora WHERE price > (SELECT AVG(price) FROM Sephora);', check: { value: true }, expected: '2730', think: '<p>COUNT(*) + WHERE price &gt; (la moyenne calculée dans une parenthèse).</p>' }
      ]
    },

    /* ------------------------------------------------------ 12 */
    {
      id: 'bonus', num: '12', short: 'Bonus : plus difficile', titre: 'Bonus : alias, NOT EXISTS et classements',
      lead: 'La partie la plus avancée. Maîtrise d\'abord les chapitres 3 à 11.',
      html: `
<h2>Les surnoms (alias)</h2>
<p>On peut donner <b>un surnom</b> à la table :</p>
${H.code("SELECT p.name FROM Sephora AS p;")}
<p><code>p</code> est le surnom de Sephora. <code>p.name</code> veut dire « la colonne name de p ». Ça sert quand on utilise <b>deux fois le même tableau</b> dans une requête.</p>

<h2>Comparer un produit à sa propre catégorie</h2>
<p><b>Question :</b> « Quels produits sont plus chers que <b>la moyenne de leur catégorie</b> ? »</p>
${H.try('mini', "SELECT p.name, p.category, p.price\nFROM Sephora AS p\nWHERE p.price > (\n    SELECT AVG(q.price)\n    FROM Sephora AS q\n    WHERE q.category = p.category\n);")}
<ul>
  <li><code>p</code> = le produit que je regarde.</li>
  <li><code>q</code> = les autres produits, qui servent à calculer la moyenne.</li>
  <li><code>q.category = p.category</code> = « seulement les produits <b>de la même catégorie</b> que mon produit ».</li>
</ul>
${H.table(['Produit p', 'Moyenne de sa catégorie', 'Plus cher ?'], [
  ['Rouge A : 30', 'Lipstick : 43,33', '<span class="ko">non</span>'], ['Rouge B : 50', '43,33', '<span class="ok">oui</span>'],
  ['Rouge C : 50', '43,33', '<span class="ok">oui</span>'], ['Mascara A : 20', 'Mascara : 30', '<span class="ko">non</span>'],
  ['Mascara B : 40', '30', '<span class="ok">oui</span>'], ['Soin A : 60', 'Skincare : 40', '<span class="ok">oui</span>'], ['Soin C : 20', '40', '<span class="ko">non</span>']
], 'compact')}
<p>On appelle ça une sous-requête <b>corrélée</b> : elle utilise une information (<code>p.category</code>) qui vient de la requête du dessus.</p>

<h2>NOT EXISTS = « il n'existe aucun… »</h2>
<p><code>EXISTS (…)</code> est vrai si la parenthèse trouve <b>au moins une</b> ligne. <code>NOT EXISTS (…)</code> est vrai si elle n'en trouve <b>aucune</b>. Le <code>SELECT 1</code> ne sert qu'à écrire quelque chose : on veut juste savoir <b>s'il y a</b> une ligne.</p>
<p>Exemple du TP1 : les marques qui n'ont <b>aucun</b> produit en édition limitée.</p>
${H.try('sephora', "SELECT DISTINCT s.brand\nFROM Sephora AS s\nWHERE NOT EXISTS (\n    SELECT 1 FROM Sephora AS p\n    WHERE p.brand = s.brand\n      AND p.limited_edition = 1\n)\nORDER BY s.brand;")}
<p>Pour chaque marque s, l'ordinateur cherche un produit p de la même marque en édition limitée. S'il n'en trouve <b>aucun</b>, il garde la marque. Résultat : 140 marques.</p>

<h2>« Tous les produits de la marque… »</h2>
<p>« Les marques dont <b>tous</b> les produits coûtent au moins 20 » : si le <b>moins cher</b> coûte au moins 20, alors <b>tous</b> coûtent au moins 20.</p>
${H.try('mini', "SELECT brand FROM Sephora\nGROUP BY brand\nHAVING MIN(price) >= 20\n   AND COUNT(price) = COUNT(*);")}
<p><code>COUNT(price) = COUNT(*)</code> vérifie qu'il n'y a <b>aucun prix inconnu</b>. Sans ce test, Luma serait gardée à tort à cause de Soin B.</p>

<h2>Les classements : RANK, DENSE_RANK, ROW_NUMBER</h2>
<p>GROUP BY <b>écrase</b> chaque groupe en une ligne. Ces fonctions gardent toutes les lignes et <b>ajoutent un numéro de classement</b>.</p>
${H.try('mini', "SELECT name, price,\n       RANK()       OVER (ORDER BY price DESC)       AS rang,\n       DENSE_RANK() OVER (ORDER BY price DESC)       AS dense,\n       ROW_NUMBER() OVER (ORDER BY price DESC, name) AS numero\nFROM Sephora\nWHERE category = 'Lipstick';")}
<ul>
  <li><b>RANK</b> fonctionne comme un podium sportif : deux premiers ex aequo, le suivant est <b>3ᵉ</b>.</li>
  <li><b>DENSE_RANK</b> ne laisse pas de trou : le suivant est <b>2ᵉ</b>.</li>
  <li><b>ROW_NUMBER</b> numérote simplement 1, 2, 3.</li>
  <li><code>PARTITION BY category</code> dans le OVER recommence le classement dans chaque catégorie.</li>
</ul>

<h2>WITH : une étape intermédiaire</h2>
<p>On ne peut pas filtrer directement sur un rang dans la même requête. On fait donc deux étapes : WITH crée une table temporaire, puis on la filtre. Exemple : les 2 plus chers de chaque catégorie.</p>
${H.try('mini', "WITH classement AS (\n    SELECT name, category, price,\n           ROW_NUMBER() OVER (PARTITION BY category\n                              ORDER BY price DESC, name) AS rang\n    FROM Sephora\n    WHERE price IS NOT NULL\n)\nSELECT name, category, price, rang\nFROM classement\nWHERE rang <= 2\nORDER BY category, rang;")}
`,
      quiz: [
        { id: 'q1', type: 'qcm', q: 'Dans <code>FROM Sephora AS p</code>, que représente <code>p</code> ?', options: ['Une nouvelle table', 'Un surnom de la table Sephora', 'La colonne price'], answer: 1, explain: 'AS donne un surnom (un alias) à la table.' },
        { id: 'q2', type: 'qcm', q: 'Deux produits sont 1ers ex aequo. Quel rang a le suivant avec RANK ?', options: ['2', '3'], answer: 1, explain: 'RANK laisse un trou : 1, 1, 3. DENSE_RANK donnerait 1, 1, 2.' },
        { id: 'q3', type: 'open', q: 'Dis avec tes mots ce que veut dire <code>NOT EXISTS (SELECT 1 FROM … WHERE …)</code>.', model: '<p>« Garde la ligne s\'il <b>n\'existe aucune</b> ligne qui répond à la condition de la parenthèse. » Par exemple : garder une marque s\'il n\'existe aucun produit de cette marque en édition limitée.</p>' }
      ]
    }
  ];

  /* ===================== La méthode ===================== */
  C.pages = {};
  C.pages.methode = `
<div class="crumbs"><a href="#/">Accueil</a> › S'entraîner</div>
<div class="kicker">⭐ À connaître par cœur</div>
<h1>La méthode pour résoudre n'importe quel exercice</h1>
<p class="lead">Quand tu lis une question, <b>ne commence pas par écrire du SQL</b>. Pose-toi d'abord ces 6 questions, dans l'ordre.</p>
${H.table(['N°', 'Je me demande', 'Ça devient'], [
  ['1', '<b>Qu\'est-ce que je dois afficher ?</b> (des noms ? un nombre ?)', '<code>SELECT …</code>'],
  ['2', '<b>Dans quel tableau ?</b>', '<code>FROM …</code>'],
  ['3', '<b>Est-ce que je garde seulement certains produits ?</b>', '<code>WHERE …</code>'],
  ['4', '<b>Est-ce qu\'on me dit « par marque », « par catégorie », « pour chaque » ?</b>', '<code>GROUP BY …</code>'],
  ['5', '<b>Est-ce que je garde seulement certains groupes ?</b>', '<code>HAVING …</code>'],
  ['6', '<b>Faut-il trier ? Garder les premiers ?</b>', '<code>ORDER BY …</code> puis <code>LIMIT …</code>']
])}

<h2>Les mots qui doivent te mettre la puce à l'oreille 👂</h2>
${H.table(['Dans la question, je lis…', 'Je pense à…'], [
  ['« affiche », « liste », « montre »', 'SELECT'], ['« seulement », « dont », « qui »', 'WHERE'],
  ['« entre … et … »', 'BETWEEN'], ['« contient », « commence par »', 'LIKE'],
  ['« parmi la liste », « ou … ou … »', 'IN'], ['« les différentes », « sans doublon »', 'DISTINCT'],
  ['« combien »', 'COUNT'], ['« moyenne »', 'AVG'], ['« total »', 'SUM'],
  ['« le plus cher », « le maximum »', 'MAX (ou ORDER BY … DESC)'], ['« le moins cher », « le minimum »', 'MIN'],
  ['« par marque », « pour chaque catégorie »', 'GROUP BY'], ['« les marques qui ont au moins… »', 'GROUP BY + HAVING'],
  ['« plus que la moyenne »', 'sous-requête'], ['« les 10 premiers », « le top 5 »', 'ORDER BY + LIMIT'],
  ['« trié », « classé »', 'ORDER BY'], ['« inconnu », « non renseigné »', 'IS NULL']
], 'compact')}

<h2>Exemple complet</h2>
<p><b>Question :</b> « Affiche les marques qui ont plus de 100 produits, avec leur nombre de produits, de la plus grande à la plus petite. »</p>
<ol>
  <li><b>Afficher ?</b> la marque et le nombre → <code>SELECT brand, COUNT(*) AS nombre</code></li>
  <li><b>Tableau ?</b> → <code>FROM Sephora</code></li>
  <li><b>Je garde certains produits ?</b> Non, pas de WHERE.</li>
  <li><b>« Par marque » ?</b> Oui → <code>GROUP BY brand</code></li>
  <li><b>Je garde certains groupes ?</b> Oui, « plus de 100 » → <code>HAVING COUNT(*) &gt; 100</code></li>
  <li><b>Trier ?</b> Du plus grand au plus petit → <code>ORDER BY nombre DESC</code></li>
</ol>
${H.try('sephora', "SELECT brand, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY brand\nHAVING COUNT(*) > 100\nORDER BY nombre DESC;")}

<h2>L'ordre d'écriture est obligatoire</h2>
<p style="font-size:1.15rem"><b>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT</b></p>
${H.box('astuce', 'Petite phrase pour s\'en souvenir', '<p><b>« Sophie Fait Whisky, Guy Habite Oslo, Lise »</b> 😄<br>(Select, From, Where, Group by, Having, Order by, Limit)</p>')}
<p>L'ordinateur, lui, exécute dans un autre ordre : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. C'est pour ça que WHERE ne peut pas utiliser COUNT : à ce moment-là, les groupes n'existent pas encore.</p>

<h2>Construire petit à petit</h2>
<ol>
  <li>Écris d'abord <code>SELECT … FROM …</code>, exécute.</li>
  <li>Ajoute WHERE, exécute : sont-ce les bonnes lignes ?</li>
  <li>Ajoute GROUP BY et les calculs, exécute. Vérifie un chiffre à la main.</li>
  <li>Ajoute HAVING, puis ORDER BY et LIMIT.</li>
  <li>Pour une sous-requête : <b>exécute la parenthèse toute seule</b> d'abord.</li>
</ol>
<div class="btn-row"><a class="btn" href="#/exercices">Passer aux exercices →</a></div>
`;

  /* ===================== Fiche mémo ===================== */
  C.pages.memo = `
<div class="kicker">📌 À garder sous les yeux</div>
<h1>Fiche mémo</h1>
<div class="box box-retenir"><div class="box-title">📄 La fiche à imprimer pour l'évaluation</div><p>Une feuille <b>A4 paysage, recto seul</b>, à <b>plier en deux</b> : tout ce qu'il faut connaître et se rappeler, en deux volets.</p>
<div class="btn-row"><a class="btn" href="assets/docs/fiche-memo-sql.pdf" download>⬇ Télécharger le PDF</a><a class="btn ghost" href="assets/docs/fiche-memo-sql.pdf" target="_blank" rel="noopener">Ouvrir dans un onglet</a></div>
<p class="expected">Conseil d'impression : format A4, orientation paysage, taille réelle (100 %), recto seul.</p></div>
${H.code("SELECT   ...   -- 1. Qu'est-ce que j'affiche ?\nFROM     ...   -- 2. Dans quel tableau ?\nWHERE    ...   -- 3. Quels produits je garde ?\nGROUP BY ...   -- 4. Je fais des tas par… ?\nHAVING   ...   -- 5. Quels tas je garde ?\nORDER BY ...   -- 6. Dans quel ordre ?\nLIMIT    ... ; -- 7. Combien de lignes au maximum ?")}
${H.table(['Je veux…', 'J\'écris'], [
  ['égal / différent', '<code>=</code> / <code>&lt;&gt;</code>'],
  ['plus grand / plus grand ou égal', '<code>&gt;</code> / <code>&gt;=</code>'],
  ['entre deux valeurs (incluses)', '<code>BETWEEN 20 AND 40</code>'],
  ['dans une liste', '<code>IN (\'A\', \'B\')</code>'],
  ['contient un mot', '<code>LIKE \'%mot%\'</code>'],
  ['commence par', '<code>LIKE \'mot%\'</code>'],
  ['case vide / pas vide', '<code>IS NULL</code> / <code>IS NOT NULL</code>'],
  ['sans doublon', '<code>SELECT DISTINCT …</code>'],
  ['trier décroissant', '<code>ORDER BY x DESC</code>'],
  ['les N premiers', '<code>ORDER BY … LIMIT N</code>'],
  ['compter', '<code>COUNT(*)</code>'],
  ['total / moyenne', '<code>SUM(x)</code> / <code>AVG(x)</code>'],
  ['plus petit / plus grand', '<code>MIN(x)</code> / <code>MAX(x)</code>'],
  ['moyenne arrondie', '<code>ROUND(AVG(x), 2)</code>'],
  ['renommer une colonne du résultat', '<code>AS nouveau_nom</code>'],
  ['un calcul par groupe', '<code>GROUP BY colonne</code>'],
  ['garder certains groupes', '<code>HAVING COUNT(*) &gt; 5</code>'],
  ['comparer à une valeur calculée', '<code>WHERE x &gt; (SELECT AVG(x) FROM …)</code>'],
  ['comparer à une liste calculée', '<code>WHERE x IN (SELECT …)</code>']
])}
<h2>Les 6 erreurs les plus fréquentes</h2>
<ol>
  <li>Apostrophes penchées <code>‘ ’</code> au lieu de droites <code>' '</code></li>
  <li><code>= NULL</code> au lieu de <code>IS NULL</code></li>
  <li>COUNT dans le WHERE au lieu du HAVING</li>
  <li>AND et OR sans parenthèses</li>
  <li>LIMIT sans ORDER BY</li>
  <li>Une colonne dans le SELECT qui n'est pas dans le GROUP BY</li>
</ol>
<h2>Quand tu bloques</h2>
<ol>
  <li>Relis la question et souligne les mots-clés (« combien », « par marque », « plus que »…).</li>
  <li>Construis la requête <b>petit à petit</b> en exécutant à chaque étape.</li>
  <li>Pour une sous-requête : exécute la parenthèse toute seule.</li>
</ol>
<div class="btn-row no-print"><button class="btn soft" onclick="window.print()">🖨 Imprimer la fiche</button></div>
`;

  /* ===================== Schéma et idées (bac à sable) ===================== */
  C.schemaSephora = [
    ['<code>id</code>', 'numéro unique du produit', '2218774'], ['<code>brand</code>', 'marque', '\'Dior\''],
    ['<code>category</code>', 'catégorie', '\'Perfume\''], ['<code>name</code>', 'nom du produit', '\'Dior Lip Glow\''],
    ['<code>size</code>', 'contenance', '\'0.7 oz/ 20 mL\''], ['<code>rating</code>', 'note sur 5 (0 = pas noté)', '4.5'],
    ['<code>number_of_reviews</code>', 'nombre d\'avis', '76'], ['<code>love</code>', 'nombre de mises en favori', '2700'],
    ['<code>price</code>', 'prix en dollars', '66.0'], ['<code>value_price</code>', 'prix « valeur » (avant promo)', '75.0'],
    ['<code>online_only</code>', 'vendu seulement en ligne ? 1 = oui, 0 = non', '1'], ['<code>exclusive</code>', 'exclusivité Sephora ? 1/0', '0'],
    ['<code>limited_edition</code>', 'édition limitée ? 1/0', '0'], ['<code>limited_time_offer</code>', 'offre limitée dans le temps ? 1/0', '0']
  ];
  C.schemaMini = [
    ['<code>name</code>', 'nom du produit', '\'Rouge A\''], ['<code>brand</code>', 'marque', '\'Dior\''],
    ['<code>category</code>', 'catégorie', '\'Lipstick\''], ['<code>price</code>', 'prix (peut être NULL)', '30'],
    ['<code>love</code>', 'nombre de favoris', '120']
  ];
  C.ideas = [
    ['Les 10 plus chers', "SELECT name, brand, price\nFROM Sephora\nORDER BY price DESC\nLIMIT 10;"],
    ['Produits Dior', "SELECT name, price\nFROM Sephora\nWHERE brand = 'Dior';"],
    ['Contient « mascara »', "SELECT name, brand\nFROM Sephora\nWHERE name LIKE '%mascara%';"],
    ['Nombre de produits', "SELECT COUNT(*) AS nombre FROM Sephora;"],
    ['Produits par catégorie', "SELECT category, COUNT(*) AS nombre\nFROM Sephora\nGROUP BY category\nORDER BY nombre DESC;"],
    ['Plus chers que la moyenne', "SELECT name, price\nFROM Sephora\nWHERE price > (SELECT AVG(price) FROM Sephora)\nORDER BY price DESC;"],
    ['Les plus aimés', "SELECT name, brand, love\nFROM Sephora\nORDER BY love DESC\nLIMIT 10;"]
  ];
})();
