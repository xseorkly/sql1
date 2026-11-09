(function makeContent(){
  'use strict';
  const schema=`
PRAGMA foreign_keys=ON;
CREATE TABLE Groupes (id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE, specialite TEXT NOT NULL);
CREATE TABLE Etudiants (id INTEGER PRIMARY KEY, nom TEXT NOT NULL, groupe_id INTEGER NOT NULL REFERENCES Groupes(id));
CREATE TABLE Modules (id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE, ects INTEGER NOT NULL CHECK(ects>0));
CREATE TABLE Notes (id INTEGER PRIMARY KEY, etudiant_id INTEGER NOT NULL REFERENCES Etudiants(id), module_id INTEGER NOT NULL REFERENCES Modules(id), note REAL CHECK(note BETWEEN 0 AND 20), UNIQUE(etudiant_id,module_id));
INSERT INTO Groupes VALUES (1,'A','Mathématiques'),(2,'B','Physique'),(3,'C','Sciences de l''ingénieur'),(4,'D','Chimie');
INSERT INTO Etudiants VALUES (1,'Emma',1),(2,'Louis',2),(3,'Inès',1),(4,'Yanis',3),(5,'Lina',2),(6,'Hugo',3),(7,'Zoé',4),(8,'Noé',1),(9,'Salma',4),(10,'Adam',2);
INSERT INTO Modules VALUES (10,'Analyse',6),(20,'Physique',6),(30,'Chimie',5),(40,'Algorithmique',4),(50,'SI',5),(60,'Stage',2);
INSERT INTO Notes VALUES
(1,1,10,16),(2,1,20,14),(3,1,40,18),
(4,2,10,11),(5,2,20,15),
(6,3,30,17),(7,3,40,15),
(8,4,50,12),(9,4,40,13),
(10,5,20,9),(11,5,30,12),
(12,6,50,18),(13,6,10,10),
(14,7,30,16),
(15,8,10,8),(16,8,40,11),
(17,10,20,14);
CREATE TABLE Laboratoires(id INTEGER PRIMARY KEY, nom TEXT NOT NULL, ville TEXT NOT NULL);
CREATE TABLE Experiences(id INTEGER PRIMARY KEY, nom TEXT NOT NULL, laboratoire_id INTEGER NOT NULL REFERENCES Laboratoires(id));
CREATE TABLE Capteurs(id INTEGER PRIMARY KEY, nom TEXT NOT NULL, type TEXT NOT NULL);
CREATE TABLE Mesures(id INTEGER PRIMARY KEY, experience_id INTEGER NOT NULL REFERENCES Experiences(id), capteur_id INTEGER NOT NULL REFERENCES Capteurs(id), valeur REAL NOT NULL, unite TEXT NOT NULL);
INSERT INTO Laboratoires VALUES (1,'Chimie','Paris'),(2,'Physique','Lyon'),(3,'Énergie','Strasbourg'),(4,'Biomédical','Lille');
INSERT INTO Experiences VALUES (101,'Titrage acide-base',1),(102,'Chauffage solution',1),(103,'Oscillations',2),(104,'Cellule photovoltaïque',3),(105,'Essai sans mesure',3);
INSERT INTO Capteurs VALUES (1,'pH-mètre','pH'),(2,'Thermomètre','Température'),(3,'Voltmètre','Tension'),(4,'Accéléromètre','Accélération'),(5,'Spectromètre','Spectre');
INSERT INTO Mesures VALUES (1,101,1,7.0,'pH'),(2,101,2,22.0,'°C'),(3,102,2,78.0,'°C'),(4,103,4,9.8,'m/s2'),(5,104,3,3.2,'V'),(6,104,2,28.0,'°C');
CREATE TABLE Protocoles(id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE, duree INTEGER NOT NULL CHECK(duree>0));
INSERT INTO Protocoles VALUES (1,'Titrage',30),(2,'Spectrométrie',45),(3,'Dosage',60);
`;
  const modules=[
  {id:'relations',num:1,week:'9–15 novembre',time:'2 h',icon:'🧩',title:'Comprendre plusieurs tables',short:'Clés, relations et schémas',objectives:['Identifier une clé primaire et une clé étrangère.','Reconnaître une relation un-à-plusieurs.','Lire un schéma de base et préparer une jointure.'],lesson:`
<h2>1. Pourquoi découper les données en plusieurs tables ?</h2>
<p>Dans SQL1, tu interrogeais surtout une seule grande table <code>Sephora</code>. Dans une vraie application, les informations sont généralement réparties. Imaginons une liste de dix étudiants avec leur groupe. Si nous écrivons « Mathématiques » sur chaque ligne des étudiants du groupe A, nous répétons une même information. Si le nom du groupe change, il faudra modifier plusieurs lignes, avec le risque d'en oublier une.</p>
<p>On préfère deux tables : <code>Groupes</code> contient une ligne par groupe ; <code>Etudiants</code> contient une ligne par étudiant et un <strong>numéro de groupe</strong>. Le numéro sert de lien. C'est le principe d'une base <strong>relationnelle</strong> : plusieurs tableaux reliés de manière précise.</p>
<div class="note ok"><strong>Image mentale</strong>Une table ressemble à une feuille de calcul. La clé primaire est comme un numéro unique de fiche. La clé étrangère est un numéro de fiche enregistré dans une autre table pour retrouver les informations associées.</div>
<h2>2. La clé primaire : une identité unique</h2>
<p>Dans <code>Groupes(id, nom, specialite)</code>, <code>id</code> vaut 1 pour A, 2 pour B, etc. Deux groupes ne doivent jamais avoir le même <code>id</code>. La clé primaire <code>PRIMARY KEY</code> garantit cette unicité. Le nom n'est pas toujours un bon identifiant : il peut changer ou être identique dans deux contextes.</p>
<p>Dans <code>Etudiants(id, nom, groupe_id)</code>, l'<code>id</code> identifie un étudiant. Deux étudiants peuvent s'appeler Emma : leurs numéros restent différents. Il faut distinguer <strong>la valeur qui décrit</strong> (nom) et <strong>l'identifiant</strong> qui repère sans ambiguïté.</p>
<h2>3. La clé étrangère : le lien entre deux tables</h2>
<p>La colonne <code>Etudiants.groupe_id</code> pointe vers <code>Groupes.id</code> ; c'est une <strong>clé étrangère</strong> ou <code>FOREIGN KEY</code>. Par exemple, Emma possède <code>groupe_id = 1</code>. En allant chercher le groupe 1, on apprend qu'Emma appartient à A, spécialité Mathématiques.</p>
<p>Attention : la clé étrangère et la clé primaire ne portent pas nécessairement le même nom. Ce sont les <em>valeurs</em> qui se correspondent ; une relation doit être explicitement identifiée par le schéma.</p>
<h2>4. Comprendre « un à plusieurs »</h2>
<p>Un groupe peut contenir <strong>plusieurs étudiants</strong>. Un étudiant de notre exemple appartient à <strong>un seul groupe</strong>. On parle d'une relation <strong>1 à N</strong>. Ce n'est pas la même chose qu'une relation « plusieurs à plusieurs » : un étudiant peut avoir plusieurs modules, et un module concerne plusieurs étudiants. Pour enregistrer les résultats, nous utilisons une <strong>table intermédiaire</strong> <code>Notes</code>, qui contient <code>etudiant_id</code> et <code>module_id</code>.</p>
<div class="note"><strong>Méthode à apprendre</strong>1. Identifier les tables. 2. Repérer la clé primaire de chaque table. 3. Chercher la clé étrangère. 4. Tracer mentalement le lien. 5. Vérifier combien de lignes peuvent correspondre.</div>
<h2>5. Observer les vraies données</h2>
<p>Exécute séparément les deux requêtes. Regarde la valeur <code>groupe_id</code> d'Emma puis recherche ce numéro dans la table <code>Groupes</code>.</p>
<pre class="sql-sample">SELECT id, nom, groupe_id FROM Etudiants ORDER BY id;</pre>
<pre class="sql-sample">SELECT id, nom, specialite FROM Groupes ORDER BY id;</pre>
<p>Observe ensuite la table <code>Notes</code>. Elle contient deux clés étrangères et une note. Elle ne répète ni le nom de l'étudiant ni celui du module.</p>
<pre class="sql-sample">SELECT id, etudiant_id, module_id, note FROM Notes LIMIT 8;</pre>
<h2>6. Les trois grandes erreurs de débutant</h2>
<ul><li><strong>Confondre</strong> <code>Etudiants.id</code> (identifiant de l'étudiant) et <code>Etudiants.groupe_id</code> (identifiant du groupe).</li><li><strong>Relier deux colonnes au hasard</strong> parce qu'elles ont le même type numérique : une correspondance doit avoir un sens.</li><li><strong>Penser qu'une clé étrangère est toujours unique</strong>. Elle peut se répéter : Emma, Inès et Noé ont tous <code>groupe_id = 1</code>.</li></ul>
<p>Avant les exercices, sois capable de dessiner : <code>Groupes.id ← Etudiants.groupe_id</code>, puis <code>Etudiants.id ← Notes.etudiant_id</code> et <code>Modules.id ← Notes.module_id</code>.</p>`},
  {id:'inner',num:2,week:'16–22 novembre',time:'2 h',icon:'🔗',title:'INNER JOIN : relier deux tables',short:'Jointures internes pas à pas',objectives:['Expliquer exactement le rôle de FROM, JOIN et ON.','Écrire une jointure entre deux tables avec des alias.','Prévoir les lignes présentes ou absentes du résultat.'],lesson:`
<h2>1. Le problème à résoudre</h2>
<p>Le professeur demande « affiche le nom de chaque étudiant et sa spécialité ». Le nom est dans <code>Etudiants</code> ; la spécialité est dans <code>Groupes</code>. Avec une seule table, aucune requête ne possède les deux informations. Il faut <strong>rapprocher des lignes</strong> en utilisant leur lien.</p>
<h2>2. La recette d'une jointure interne</h2>
<pre class="sql-sample">SELECT e.nom, g.specialite
FROM Etudiants AS e
INNER JOIN Groupes AS g
  ON e.groupe_id = g.id
ORDER BY e.nom;</pre>
<p><strong>Ligne 1 :</strong> <code>SELECT</code> indique les informations que nous souhaitons afficher. Le préfixe <code>e.</code> ou <code>g.</code> précise de quelle table provient la colonne.</p>
<p><strong>Ligne 2 :</strong> <code>FROM Etudiants AS e</code> prend la table principale ; <code>e</code> est son surnom, appelé <em>alias</em>.</p>
<p><strong>Ligne 3 :</strong> <code>INNER JOIN Groupes AS g</code> demande de rapprocher les lignes avec la table des groupes.</p>
<p><strong>Ligne 4 :</strong> <code>ON e.groupe_id = g.id</code> est la condition de correspondance : il faut le même numéro de groupe des deux côtés.</p>
<p><strong>Ligne 5 :</strong> le tri est facultatif et améliore la lisibilité.</p>
<div class="note ok"><strong>À retenir mot pour mot</strong><code>FROM A INNER JOIN B ON A.cle_etrangere = B.cle_primaire</code>. Une jointure interne conserve les couples de lignes qui vérifient <code>ON</code>. Elle ne garantit pas « une ligne par étudiant » : cela dépend de la relation.</div>
<h2>3. Fais fonctionner l'ordinateur dans ta tête</h2>
<p>Prends Emma dans <code>Etudiants</code> : son groupe vaut 1. Recherche le groupe dont <code>id</code> vaut 1 : c'est A. Le résultat comporte Emma et Mathématiques. Recommence avec Louis : groupe 2, Physique. C'est exactement le calcul conceptuel de la jointure.</p>
<p>Observe que le résultat contient dix lignes ici, car chaque étudiant possède exactement un groupe valide. Ce ne sera <strong>pas toujours</strong> le cas.</p>
<h2>4. Pourquoi certaines lignes se multiplient-elles ?</h2>
<p>Regarde maintenant les notes d'Emma. Elle possède trois notes. La jointure entre <code>Etudiants</code> et <code>Notes</code> affichera <strong>Emma trois fois</strong> : une fois pour chaque note. Ce n'est pas un bug, c'est la conséquence du lien « un étudiant — plusieurs notes ».</p>
<pre class="sql-sample">SELECT e.nom, n.module_id, n.note
FROM Etudiants e
INNER JOIN Notes n ON e.id = n.etudiant_id
WHERE e.nom = 'Emma'
ORDER BY n.module_id;</pre>
<p>Salma, qui n'a aucune note, <strong>n'apparaît pas</strong> dans ce résultat. Le mot « interne » signifie que seules les lignes ayant un correspondant sont conservées.</p>
<h2>5. Ne pas confondre ON et WHERE</h2>
<p><code>ON</code> exprime le <strong>lien entre les tables</strong> ; <code>WHERE</code> exprime généralement le <strong>filtre demandé dans l'énoncé</strong>. Pour les étudiants du groupe A :</p>
<pre class="sql-sample">SELECT e.nom, g.nom AS groupe
FROM Etudiants e
INNER JOIN Groupes g ON e.groupe_id = g.id
WHERE g.nom = 'A'
ORDER BY e.nom;</pre>
<h2>6. Reconnaître les erreurs typiques</h2>
<ul><li><code>ON e.id = g.id</code> est faux pour cette relation : il faut comparer <code>e.groupe_id</code> et <code>g.id</code>.</li><li><code>SELECT id</code> est ambigu si les deux tables possèdent une colonne <code>id</code>. Préfixe-la : <code>e.id</code>.</li><li>Une requête sans condition correcte peut fabriquer trop de lignes, comme un <em>produit cartésien</em>.</li><li><code>INNER JOIN</code> et <code>JOIN</code> signifient la même chose dans SQLite.</li></ul>
<p><strong>En évaluation :</strong> commence toujours par marquer sur le schéma les deux colonnes à relier. Ensuite seulement, écris la requête.</p>`},
  {id:'trois',num:3,week:'23–29 novembre',time:'2 h',icon:'🧬',title:'Joindre trois tables et filtrer',short:'Trois tables, WHERE et tri',objectives:['Déterminer le chemin des clés entre trois tables.','Écrire deux JOIN successifs.','Éviter les doublons et contrôler le tri.'],lesson:`
<h2>1. Une question impossible avec deux tables</h2>
<p>Nous voulons « le nom de l'étudiant, le nom du module et la note ». Les trois informations sont réparties dans <code>Etudiants</code>, <code>Modules</code> et <code>Notes</code>. La table <code>Notes</code> fait le <strong>pont</strong> entre les deux autres, grâce à ses deux clés étrangères.</p>
<h2>2. Trouver le chemin avant d'écrire SQL</h2>
<p>Trace ce parcours : <code>Etudiants.id → Notes.etudiant_id</code>, puis <code>Notes.module_id → Modules.id</code>. Il faudra <strong>deux conditions ON</strong> et donc deux jointures successives.</p>
<pre class="sql-sample">SELECT e.nom AS etudiant, m.nom AS module, n.note
FROM Etudiants AS e
INNER JOIN Notes AS n ON e.id = n.etudiant_id
INNER JOIN Modules AS m ON n.module_id = m.id
ORDER BY e.nom, m.nom;</pre>
<p>Lis chaque instruction à haute voix : « je prends les étudiants, je retrouve leurs notes, puis je retrouve les modules de ces notes ». Une jointure n'est pas liée à une seule colonne affichée : une fois les tables rapprochées, tu peux sélectionner des colonnes de chacune.</p>
<h2>3. Ajouter un filtre de l'énoncé</h2>
<p>On te demande uniquement les notes d'Analyse supérieures ou égales à 10. La relation entre les tables ne change pas ; seule la condition <code>WHERE</code> s'ajoute.</p>
<pre class="sql-sample">SELECT e.nom, n.note
FROM Etudiants e
JOIN Notes n ON e.id = n.etudiant_id
JOIN Modules m ON n.module_id = m.id
WHERE m.nom = 'Analyse' AND n.note >= 10
ORDER BY n.note DESC, e.nom;</pre>
<p>Cette requête montre une distinction essentielle : <code>ON</code> assemble, <code>WHERE</code> choisit les lignes conservées, <code>ORDER BY</code> organise ce qui sera affiché.</p>
<h2>4. Pourquoi DISTINCT parfois ?</h2>
<p>Si tu demandes « quels étudiants ont au moins une note ? », Emma apparaît trois fois dans la jointure : une fois par note. Mais tu souhaites une <strong>liste d'étudiants uniques</strong>. Dans ce cas, <code>SELECT DISTINCT e.nom</code> retire les répétitions. Attention, <code>DISTINCT</code> ne doit pas servir à masquer une mauvaise condition de jointure.</p>
<pre class="sql-sample">SELECT DISTINCT e.nom
FROM Etudiants e JOIN Notes n ON e.id = n.etudiant_id
ORDER BY e.nom;</pre>
<h2>5. Attention à la multiplication des lignes</h2>
<p>Si une expérience possède deux mesures, elle apparaîtra deux fois après une jointure avec <code>Mesures</code>. C'est normal. En sciences, une expérience et une mesure ne représentent pas la même unité d'observation. Avant de compter, demande-toi donc : <strong>qu'est-ce qu'une ligne du résultat représente ?</strong></p>
<pre class="sql-sample">SELECT x.nom AS experience, c.nom AS capteur, r.valeur, r.unite
FROM Experiences x
JOIN Mesures r ON x.id = r.experience_id
JOIN Capteurs c ON r.capteur_id = c.id
ORDER BY x.id, r.id;</pre>
<h2>6. Méthode d'examen en six étapes</h2>
<ol><li>Souligne les informations réclamées dans l'énoncé.</li><li>Entoure la table qui contient chaque information.</li><li>Trace les chemins de clés entre les tables.</li><li>Écris <code>FROM</code> et <strong>une jointure par table ajoutée</strong>.</li><li>Ajoute les filtres, le tri et éventuellement <code>DISTINCT</code>.</li><li>Prédit le nombre de lignes sur un petit exemple pour contrôler.</li></ol>
<div class="note warn"><strong>Piège évalué très souvent</strong>Ne relie pas directement <code>Etudiants</code> à <code>Modules</code> : il n'existe aucun champ qui relie directement ces deux tables dans notre schéma. Passe par <code>Notes</code>.</div>`},
  {id:'left',num:4,week:'30 novembre – 6 décembre',time:'2 h',icon:'↔️',title:'LEFT JOIN et données absentes',short:'Lignes sans correspondance',objectives:['Distinguer INNER JOIN et LEFT JOIN.','Afficher les lignes sans correspondance.','Comprendre NULL et le piège du filtre WHERE.'],lesson:`
<h2>1. Pourquoi INNER JOIN ne suffit pas</h2>
<p>Salma est bien inscrite dans <code>Etudiants</code>, mais elle n'a encore aucune ligne dans <code>Notes</code>. Une jointure interne la fait disparaître. Pourtant, si la question est « affiche <strong>tous les étudiants</strong> et leurs éventuelles notes », Salma doit rester visible.</p>
<h2>2. LEFT JOIN : conserver toute la table de gauche</h2>
<pre class="sql-sample">SELECT e.nom, n.note
FROM Etudiants e
LEFT JOIN Notes n ON e.id = n.etudiant_id
ORDER BY e.nom, n.note;</pre>
<p>Avec <code>LEFT JOIN</code>, on conserve <strong>chaque étudiant</strong>, même s'il ne possède aucune note. En l'absence de correspondance, les colonnes venant de <code>Notes</code> valent <code>NULL</code> (information absente). Les étudiants qui possèdent plusieurs notes apparaissent toujours plusieurs fois.</p>
<div class="note ok"><strong>Astuce pour les sujets</strong>Les expressions « tous les étudiants, même sans note », « y compris les expériences sans mesure » et « chaque module, même sans inscription » doivent te faire penser à <code>LEFT JOIN</code>.</div>
<h2>3. Trouver les étudiants sans note</h2>
<p>Avec une jointure gauche, un étudiant sans note apparaît avec <code>n.id = NULL</code>. Nous allons conserver uniquement ces lignes. Souviens-toi que <code>NULL</code> ne se compare pas avec <code>=</code>, mais avec <code>IS NULL</code>.</p>
<pre class="sql-sample">SELECT e.nom
FROM Etudiants e
LEFT JOIN Notes n ON e.id = n.etudiant_id
WHERE n.id IS NULL;</pre>
<p>Cette technique s'appelle parfois une <em>anti-jointure</em> : elle recherche une absence de lien. Applique-la pour trouver les modules sans notes ou les expériences sans mesures.</p>
<h2>4. Le piège majeur : WHERE après LEFT JOIN</h2>
<p>Supposons qu'on cherche tous les étudiants avec, s'ils en ont, leur note de Physique. Si on place <code>WHERE m.nom = 'Physique'</code> après les jointures, on supprime les lignes dont le module est absent. La requête cesse de conserver réellement tous les étudiants.</p>
<p>Pour garder tout le monde, on peut filtrer dans la condition de jointure, ou préparer une sous-requête ne contenant que les notes de Physique. Voici une version correcte, sans sous-requête :</p>
<pre class="sql-sample">SELECT e.nom, n.note
FROM Etudiants e
LEFT JOIN Notes n
  ON e.id = n.etudiant_id AND n.module_id = 20
ORDER BY e.nom;</pre>
<p>Ici <code>n.module_id = 20</code> est placé dans <code>ON</code> : il limite les lignes mises en correspondance, <strong>sans éliminer les étudiants</strong> dépourvus d'une telle note.</p>
<h2>5. COUNT(*) et COUNT(n.id) ne disent pas la même chose</h2>
<p>Après une jointure gauche, un groupe peut posséder une ligne avec des champs de droite à <code>NULL</code>. <code>COUNT(*)</code> la compte ; <code>COUNT(n.id)</code> l'ignore. Pour savoir combien de <strong>notes réelles</strong> possède un étudiant, utilise <code>COUNT(n.id)</code>.</p>
<pre class="sql-sample">SELECT e.nom, COUNT(n.id) AS nombre_notes
FROM Etudiants e
LEFT JOIN Notes n ON e.id = n.etudiant_id
GROUP BY e.id, e.nom
ORDER BY e.nom;</pre>
<h2>6. Tester sur un autre contexte scientifique</h2>
<p>Notre base comporte une expérience « Essai sans mesure », un laboratoire « Biomédical » sans expérience et un capteur « Spectromètre » jamais utilisé. Ce sont de parfaits contre-exemples pour tester les jointures externes.</p>
<pre class="sql-sample">SELECT x.nom, COUNT(r.id) AS nb_mesures
FROM Experiences x
LEFT JOIN Mesures r ON x.id = r.experience_id
GROUP BY x.id, x.nom
ORDER BY x.id;</pre>
<div class="note warn"><strong>Attention</strong><code>LEFT JOIN</code> ne veut pas dire « récupérer uniquement les lignes manquantes ». Il conserve <strong>toutes</strong> les lignes de gauche ; pour les manquantes seulement, il faut ajouter <code>WHERE table_de_droite.id IS NULL</code>.</div>`},
  {id:'groupes',num:5,week:'7–13 décembre',time:'2 h',icon:'📊',title:'Statistiques avec les jointures',short:'GROUP BY, HAVING, erreurs de compte',objectives:['Calculer des nombres et des moyennes par groupe.','Utiliser GROUP BY et HAVING sur plusieurs tables.','Détecter un double comptage dans les données scientifiques.'],lesson:`
<h2>1. Revoir la bonne question : que compte-t-on ?</h2>
<p>Un <strong>étudiant</strong> peut avoir plusieurs <strong>notes</strong>. Si on effectue une jointure <code>Etudiants</code>–<code>Notes</code>, on obtient une ligne par note, et non une ligne par étudiant. Dans un exercice de statistiques, la plus grande erreur consiste à confondre ces deux quantités.</p>
<h2>2. Compter les notes de chaque étudiant</h2>
<pre class="sql-sample">SELECT e.nom, COUNT(n.id) AS nb_notes
FROM Etudiants e
LEFT JOIN Notes n ON e.id = n.etudiant_id
GROUP BY e.id, e.nom
ORDER BY nb_notes DESC, e.nom;</pre>
<p>Lis la requête comme une procédure : nous conservons tous les étudiants grâce au <code>LEFT JOIN</code> ; nous formons un groupe de lignes par étudiant grâce au <code>GROUP BY</code> ; nous comptons les identifiants de notes présents avec <code>COUNT(n.id)</code>.</p>
<h2>3. Moyenne : attention au regroupement</h2>
<p>Pour obtenir la moyenne de chaque module, il faut son nom (table <code>Modules</code>) et les notes associées (table <code>Notes</code>). Nous affichons aussi le nombre de notes. <code>ROUND(...,2)</code> arrondit à deux chiffres après la virgule.</p>
<pre class="sql-sample">SELECT m.nom, COUNT(n.id) AS effectif,
       ROUND(AVG(n.note), 2) AS moyenne
FROM Modules m
LEFT JOIN Notes n ON m.id = n.module_id
GROUP BY m.id, m.nom
ORDER BY m.nom;</pre>
<p>Le module Stage, sans note, possède un effectif de 0 et une moyenne <code>NULL</code>. Ce n'est pas la même chose qu'une moyenne de 0 : il manque des observations.</p>
<h2>4. WHERE avant, HAVING après</h2>
<p><code>WHERE</code> filtre les lignes <strong>avant</strong> le calcul des groupes. <code>HAVING</code> filtre les groupes <strong>après</strong> l'agrégation. Si nous voulons les modules avec au moins trois notes :</p>
<pre class="sql-sample">SELECT m.nom, COUNT(n.id) AS nb_notes
FROM Modules m
JOIN Notes n ON m.id = n.module_id
GROUP BY m.id, m.nom
HAVING COUNT(n.id) >= 3
ORDER BY nb_notes DESC, m.nom;</pre>
<p>Ne mets jamais <code>WHERE COUNT(n.id) >= 3</code> : c'est une erreur, car <code>WHERE</code> agit avant le regroupement.</p>
<h2>5. Éviter la moyenne des moyennes</h2>
<p>Quand des groupes ont des effectifs différents, la moyenne simple de leurs moyennes n'est <strong>pas nécessairement</strong> la moyenne générale. En sciences, préfère calculer <code>AVG(n.note)</code> directement sur toutes les observations voulues, ou utilise une moyenne pondérée appropriée. Le dénominateur compte.</p>
<h2>6. La question piège : COUNT(DISTINCT)</h2>
<p>Si tu joins les étudiants aux notes puis regroupes par groupe, <code>COUNT(*)</code> mesure le nombre de lignes après jointure, donc plutôt le nombre de notes. Pour obtenir le nombre <strong>d'étudiants différents ayant des notes</strong>, utilise <code>COUNT(DISTINCT e.id)</code>. Pour compter tous les étudiants du groupe, mieux vaut partir de <code>Groupes</code> et <code>Etudiants</code> sans passer par <code>Notes</code>.</p>
<pre class="sql-sample">SELECT g.nom, COUNT(DISTINCT e.id) AS etudiants_notes
FROM Groupes g
LEFT JOIN Etudiants e ON g.id = e.groupe_id
LEFT JOIN Notes n ON e.id = n.etudiant_id
WHERE n.id IS NOT NULL
GROUP BY g.id, g.nom
ORDER BY g.nom;</pre>
<h2>7. Application physique-chimie</h2>
<p>On ne mélange pas naïvement des unités : la moyenne de 7 pH, 22 °C et 3,2 V n'a pas de sens scientifique. Pour calculer une moyenne, filtre d'abord sur une grandeur homogène ou regroupe par type et unité de mesure.</p>
<pre class="sql-sample">SELECT c.type, r.unite, COUNT(*) AS n,
       ROUND(AVG(r.valeur), 2) AS moyenne
FROM Mesures r
JOIN Capteurs c ON r.capteur_id = c.id
GROUP BY c.type, r.unite
ORDER BY c.type;</pre>
<div class="note warn"><strong>Réflexe de contrôle</strong>Avant de valider un agrégat, réponds à ces trois questions : « une ligne = quoi ? », « je compte quoi ? » et « est-ce que les valeurs ont la même unité ? »</div>`},
  {id:'creer',num:6,week:'14–20 décembre',time:'2 h',icon:'🛠️',title:'Créer et modifier une base',short:'CREATE, INSERT, UPDATE, DELETE',objectives:['Créer une table avec ses contraintes.','Insérer et modifier des lignes dans une copie de base.','Expliquer les risques de UPDATE ou DELETE sans WHERE.'],lesson:`
<h2>1. Changer de rôle : de lecteur à concepteur</h2>
<p>Avec <code>SELECT</code>, tu lis des informations. Avec <code>CREATE TABLE</code>, tu définis la structure d'une table. Avec <code>INSERT</code>, <code>UPDATE</code> et <code>DELETE</code>, tu modifies ses données. Dans notre site, <strong>chaque essai crée sa propre base temporaire</strong> : tu peux donc expérimenter sans endommager le site ni supprimer un travail.</p>
<h2>2. Créer une table, ligne par ligne</h2>
<pre class="sql-sample">CREATE TABLE Instruments (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  cout REAL CHECK(cout >= 0),
  laboratoire_id INTEGER REFERENCES Laboratoires(id)
);</pre>
<p><code>CREATE TABLE Instruments</code> demande une nouvelle table. <code>id INTEGER PRIMARY KEY</code> définit un identifiant entier unique. <code>nom TEXT NOT NULL</code> est un texte obligatoire. <code>cout REAL</code> accepte les décimaux. <code>CHECK(cout &gt;= 0)</code> interdit les coûts négatifs. Enfin, <code>REFERENCES Laboratoires(id)</code> définit une clé étrangère.</p>
<p>La création ne remplit pas automatiquement la table : elle ne définit que ses colonnes et les règles de validité des données. Pour voir ces règles, on peut consulter <code>PRAGMA table_info('Instruments')</code> et <code>PRAGMA foreign_key_list('Instruments')</code>.</p>
<h2>3. Insérer une ligne</h2>
<p>Notre base contient déjà la table <code>Protocoles</code> (identifiant, nom, durée en minutes). Écris les colonnes ciblées dans le même ordre que les valeurs :</p>
<pre class="sql-sample">INSERT INTO Protocoles (id, nom, duree)
VALUES (4, 'Pesée', 15);
SELECT * FROM Protocoles ORDER BY id;</pre>
<p>Dans un exercice, il vaut mieux <strong>énumérer les colonnes</strong> même si cela paraît plus long : c'est plus clair et plus résistant à un changement de structure.</p>
<h2>4. Modifier une information avec UPDATE</h2>
<pre class="sql-sample">UPDATE Protocoles
SET duree = 35
WHERE id = 1;
SELECT * FROM Protocoles WHERE id = 1;</pre>
<p><code>SET</code> indique la nouvelle valeur ; <code>WHERE id = 1</code> désigne la ligne modifiée. Sans <code>WHERE</code>, on modifierait <strong>tous les protocoles</strong> : c'est une des erreurs les plus graves en pratique.</p>
<h2>5. Supprimer une ligne avec DELETE</h2>
<pre class="sql-sample">DELETE FROM Protocoles WHERE id = 3;
SELECT * FROM Protocoles ORDER BY id;</pre>
<p>On supprime ici le protocole d'identifiant 3. Avec <code>DELETE FROM Protocoles;</code> sans filtre, toutes les lignes seraient supprimées. Cela ne supprime <strong>pas</strong> la table elle-même. <code>DROP TABLE</code> supprime la table et sa structure : nous ne le travaillons pas comme compétence centrale.</p>
<h2>6. Les clés et les contraintes servent à éviter les incohérences</h2>
<p>La clé primaire empêche deux lignes d'avoir le même identifiant. <code>NOT NULL</code> exige une valeur. <code>UNIQUE</code> empêche certaines répétitions. Une clé étrangère avec contrôle activé empêche par exemple d'attribuer une mesure à une expérience inexistante. Les règles protègent les données, mais doivent être conçues en fonction de l'énoncé.</p>
<h2>7. Comment réussir un exercice de création ?</h2>
<ol><li>Liste les entités du problème : étudiants, groupes, mesures…</li><li>Pour chaque table, choisis ses colonnes et leurs types.</li><li>Définis un identifiant unique.</li><li>Place les clés étrangères dans les tables qui portent la relation.</li><li>Ajoute les contraintes seulement si elles sont justifiées.</li><li>Teste une insertion correcte, puis une insertion volontairement incorrecte.</li></ol>
<div class="note ok"><strong>Point crucial en TP</strong>Pour vérifier un résultat de <code>INSERT</code>, <code>UPDATE</code> ou <code>DELETE</code>, lance ensuite un <code>SELECT</code>. Dans le bac à sable SQL2, plusieurs instructions séparées par <code>;</code> sont autorisées.</div>`},
  {id:'bilan',num:7,week:'4–10 janvier',time:'2 h',icon:'🎓',title:'Se préparer aux évaluations',short:'Méthodes, sujets blancs et TP',objectives:['Résoudre un énoncé sans solution modèle sous les yeux.','Reconnaître et corriger les erreurs fréquentes.','Savoir justifier une jointure, une agrégation et une contrainte.'],lesson:`
<h2>1. L'examen ne demande pas seulement du SQL par cœur</h2>
<p>On peut te demander d'<strong>écrire</strong> une requête, mais aussi de la <strong>lire</strong> en français, de <strong>prévoir son résultat</strong> sur un petit tableau, de <strong>corriger une erreur</strong>, d'<strong>expliquer</strong> pourquoi une ligne est absente, de <strong>compléter</strong> une requête ou de <strong>créer</strong> une table à partir d'un énoncé. Nous travaillons tous ces formats.</p>
<h2>2. Une méthode universelle en sept questions</h2>
<ol><li><strong>Qu'afficher ?</strong> Note les colonnes et les calculs demandés.</li><li><strong>Où ?</strong> Identifie les tables qui portent ces informations.</li><li><strong>Par quel lien ?</strong> Repère les couples clé primaire / clé étrangère.</li><li><strong>Qui garder ?</strong> Détermine INNER JOIN ou LEFT JOIN selon les données manquantes.</li><li><strong>Quel filtre ?</strong> Repère les conditions <code>WHERE</code>.</li><li><strong>Quel calcul ?</strong> Ajoute <code>GROUP BY</code> puis éventuellement <code>HAVING</code>.</li><li><strong>Quel ordre ?</strong> Termine avec <code>ORDER BY</code>, et contrôle les doublons.</li></ol>
<h2>3. Sujet guidé : une question et son raisonnement</h2>
<p><strong>Énoncé :</strong> « Afficher les modules ayant au moins deux notes, avec le nom du module et sa moyenne arrondie à deux décimales, de la plus forte moyenne à la plus faible. »</p>
<p>Il faut <code>Modules</code> pour le nom, <code>Notes</code> pour les notes. Le lien est <code>Modules.id = Notes.module_id</code>. On groupe par module, on filtre les groupes avec <code>HAVING COUNT(n.id) &gt;= 2</code>, puis on trie.</p>
<pre class="sql-sample">SELECT m.nom, ROUND(AVG(n.note), 2) AS moyenne
FROM Modules m
JOIN Notes n ON m.id = n.module_id
GROUP BY m.id, m.nom
HAVING COUNT(n.id) >= 2
ORDER BY moyenne DESC, m.nom;</pre>
<h2>4. Checklist avant de rendre sa copie</h2>
<ul><li>Ai-je choisi les <strong>bonnes tables</strong> ?</li><li>Chaque <code>JOIN</code> possède-t-il un <code>ON</code> correct ?</li><li>Ai-je préfixé les colonnes ambiguës avec leurs alias ?</li><li>Ai-je bien conservé les lignes sans correspondance si l'énoncé dit « tous » ?</li><li>Un <code>COUNT(*)</code> compte-t-il par erreur une ligne fictive issue d'un <code>LEFT JOIN</code> ?</li><li>Mes agrégats portent-ils sur les bonnes unités et les bonnes observations ?</li><li>Ai-je mis les filtres d'agrégation dans <code>HAVING</code> ?</li><li>La requête permet-elle réellement de répondre à la <strong>question exacte</strong> ?</li></ul>
<h2>5. Deux entraînements complets</h2>
<p>Le <strong>sujet blanc écrit</strong> mélange lecture de schémas, QCM, calculs à la main, analyse d'erreurs et rédaction de requêtes. Le <strong>sujet blanc TP</strong> impose d'écrire des requêtes sur la base scientifique. Les questions sont autoévaluées lorsque c'est possible ; les réponses rédigées restent explicitement en autoévaluation.</p>
<p>Tu peux aussi refaire les exercices sans afficher les indices ni les corrigés, et imprimer ce chapitre comme fiche de révision. Les résultats sont conservés <strong>sur ton navigateur uniquement</strong>.</p>
<div class="note warn"><strong>Dernier conseil</strong>Ne mémorise pas trente requêtes. Maîtrise quelques structures et entraîne-toi à les adapter à de nouvelles questions. Si tu sais expliquer <em>pourquoi</em> la jointure fonctionne, tu seras beaucoup plus à l'aise devant un sujet inédit.</div>`}
  ];
  window.SQL2CONTENT={schema,modules,version:'1.0'};
})();