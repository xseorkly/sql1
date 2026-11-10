(function runSQL2Site() {
  'use strict';
  const D=window.SQL2DATA;
  const $=id=>document.getElementById(id);
  const main=$('contenu'),side=$('sideContent'),indicator=$('engineStatus');
  const questions=[...D.official,...D.extras,...D.examA,...D.examB];
  const qById=Object.fromEntries(questions.map(q=>[q.id,q]));
  const env={sql:null,mini:null,world:null,worldFile:'',worldError:''};
  let state={answers:{},passed:{},exams:{}};
  try{state=Object.assign(state,JSON.parse(localStorage.getItem('sql2.v2')||'{}'))}catch(e){}
  const save=()=>{try{localStorage.setItem('sql2.v2',JSON.stringify(state))}catch(e){}};
  const esc=x=>String(x===undefined?'':x===null?'NULL':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=(url,label)=>`<a class="btn outline" href="${url}">${label}</a>`;
  const note=(heading,msg,kind='')=>`<div class="note ${kind}"><strong>${heading}</strong>${msg}</div>`;
  const code=sql=>`<pre class="code"><code>${esc(sql)}</code></pre>`;
  function table(cols,rows,max=35){
    if(!cols.length)return'<p>Aucune colonne retournée.</p>';
    const slice=rows.slice(0,max);
    return`<div class="table-wrap"><table class="data-table"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${slice.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>max?`<p class="tip">${max} premières lignes affichées sur ${rows.length}.</p>`:''}`;
  }
  function schema(db){
    if(db==='mini')return `<div class="schema"><div class="schema-title">mini_etudiants.sqlite : le même contenu fictif que le fichier du poly</div><div class="schema-tables"><div class="schema-table"><b>Etudiant</b><ul><li class="key">numSecu : clé primaire (TEXT)</li><li>nom (TEXT)</li></ul></div><div class="schema-table"><b>Matiere</b><ul><li class="fk">numSecu : clé étrangère (TEXT)</li><li>matiere (TEXT)</li></ul></div></div><p>Etudiant.numSecu = Matiere.numSecu</p><p>2 étudiants : Alice Martin et Karim Benali. 2 matières : Informatique et Mécanique.</p></div>`;
    return `<div class="schema"><div class="schema-title">World.db3 : trois tables, trois relations</div><div class="schema-tables"><div class="schema-table"><b>City · 4 079 lignes</b><ul><li class="key">ID : PK</li><li>Name</li><li class="fk">CountryCode : FK</li><li>District</li><li>Population</li></ul></div><div class="schema-table"><b>Country · 239 lignes</b><ul><li class="key">Code : PK</li><li>Name</li><li>Continent</li><li>Region</li><li>Population</li><li class="fk">Capital : FK</li></ul></div><div class="schema-table"><b>CountryLanguage · 988 lignes</b><ul><li class="fk">CountryCode : FK</li><li>Language</li><li>IsOfficial (0/1)</li><li>Percentage</li></ul></div></div><p>Ville → pays : <strong>City.CountryCode = Country.Code</strong></p><p>Langue → pays : <strong>CountryLanguage.CountryCode = Country.Code</strong></p><p>Capitale → ville : <strong>Country.Capital = City.ID</strong></p></div>`;
  }
  const baseFor=db=>db==='mini'?env.mini:env.world;
  function dbMessage(db){
    if(!env.sql)return note('Moteur SQL en cours de chargement','Les cours et les corrigés restent accessibles, mais la vérification automatique attend SQLite.','warn');
    if(db==='world'&&!env.world)return note('World.db3 doit être importée','Le ZIP du professeur contenait mini_etudiants.sqlite et le polycopié, mais pas World.db3. Utilise le bouton « Importer World.db3 » dans le menu. Le corrigé rédigé reste consultable sans fichier.','warn');
    return'';
  }
  function execute(db,sql){
    const base=baseFor(db);
    if(!env.sql||!base)throw Error(db==='world'?'Importe le fichier World.db3 pour exécuter cette requête.':'Le moteur SQL n’est pas prêt.');
    if(db==='world'&&(/\bCROSS\s+JOIN\b/i.test(sql)||/\bFROM\s+(?:City|Country)\b[^;]*?,\s*(?:City|Country)\b/i.test(sql))&&!/\bLIMIT\b/i.test(sql))throw Error('Produit cartésien géant : ajoute un LIMIT pour éviter de bloquer ton navigateur.');
    const clone=new env.sql.Database(new Uint8Array(base.export()));
    try{return clone.exec(sql).map(x=>({columns:x.columns,values:x.values}))}finally{clone.close()}
  }
  const result=r=>r.length?r[r.length-1]:{columns:[],values:[]};
  function grade(q,answer){
    if(q.kind==='open')return{points:null,message:'Compare ton raisonnement avec la correction. Cette question rédigée nécessite une autoévaluation.'};
    if(q.kind==='numeric'){
      const ok=answer.trim().replace(',','.')===String(q.sql).trim().replace(',','.');
      return{points:ok?1:0,message:ok?'Bonne réponse !':'Le nombre est différent du résultat attendu.'};
    }
    const actualSets=execute(q.db,answer),expectedSets=execute(q.db,q.sql);
    const a=result(actualSets),b=result(expectedSets);
    if(expectedSets.length>1){const ok=actualSets.length===expectedSets.length&&actualSets.every((x,i)=>x.columns.length===expectedSets[i].columns.length&&JSON.stringify(x.values)===JSON.stringify(expectedSets[i].values));if(!ok)return{points:0,message:'Cette question attend plusieurs résultats SQL. Exécute toutes les requêtes demandées.',actual:a,expected:b};}
    const ra=a.values.map(x=>JSON.stringify(x)),rb=b.values.map(x=>JSON.stringify(x));
    const identical=JSON.stringify(ra)===JSON.stringify(rb);
    const sameUnordered=JSON.stringify(ra.slice().sort())===JSON.stringify(rb.slice().sort());
    let points=0,message='Le résultat est différent : vérifie ON, WHERE, GROUP BY, les colonnes et le tri.';
    if(identical&&a.columns.length===b.columns.length){points=1;message='Exact : mêmes valeurs, même ordre et même nombre de colonnes.'}
    else if(sameUnordered&&a.columns.length===b.columns.length){points=.75;message='Bonnes lignes, mais ordre différent : relis ORDER BY.'}
    else if(a.values.length===b.values.length&&a.values.length>0&&a.columns.length!==b.columns.length){points=.25;message='Même nombre de lignes, mais colonnes différentes : relis SELECT.'}
    if(points===1&&/\bORDER\s+BY\b/i.test(q.sql)&&!/\bORDER\s+BY\b/i.test(answer)){points=.75;message='Résultat présent, mais ORDER BY est obligatoire lorsque le sujet impose un tri.';}
    if(points===1&&q.db==='world'&&(D.official.includes(q)||D.examA.includes(q)||D.examB.includes(q))&&(!/\bJOIN\b/i.test(answer)||!/\bON\b/i.test(answer))){points=.75;message='Le résultat est identique, mais la consigne du poly exige JOIN ... ON.';}
    return{points,message,actual:a,expected:b};
  }
  function feedback(q,r){
    const div=$('feedback-'+q.id);if(!div)return;
    div.hidden=false;div.className='feedback '+(r.points===1?'success':r.points===null||r.points>0?'warn':'fail');
    div.innerHTML=`<strong>${r.points===null?'Autoévaluation':String(r.points).replace('.',',')+' / 1'}</strong> — ${esc(r.message)}${r.actual?`<h4>Ton résultat</h4>${table(r.actual.columns,r.actual.values,12)}`:''}${r.expected&&r.points!==1?`<details><summary>Résultat attendu</summary>${table(r.expected.columns,r.expected.values,12)}</details>`:''}`;
  }
  function progress(items){
    const done=items.filter(q=>state.passed[q.id]).length,pct=Math.round(100*done/Math.max(items.length,1));
    return`<div class="panel"><div class="progresslabel"><span>Exercices maîtrisés</span><strong>${done} / ${items.length}</strong></div><div class="progressbar"><div style="width:${pct}%"></div></div><p class="tip">Une réponse est marquée acquise lorsqu’elle est exacte. Les données restent dans ce navigateur.</p></div>`;
  }
  function clauseByClause(sql){
    if(!/^\s*(SELECT|WITH)\b/i.test(sql))return'';
    const terms=[...sql.matchAll(/\b(SELECT|FROM|JOIN|ON|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT)\b/gi)];
    const details={
      'SELECT':'**Ce que l\'on affiche** : les colonnes et les éventuels calculs demandés.',
      'FROM':'**Table de départ** : c\'est le premier tableau du raisonnement.',
      'JOIN':'**Table ajoutée** : une nouvelle table fournit les informations qui manquent.',
      'ON':'**Lien entre les tables** : les deux identifiants doivent correspondre ; ici il faut vérifier la clé.',
      'WHERE':'**Filtre des lignes** : cette condition ne conserve que les lignes répondant à l\'énoncé.',
      'GROUP BY':'**Regroupement** : les lignes sont réunies pour calculer un total ou une moyenne par groupe.',
      'HAVING':'**Filtre des groupes** : on sélectionne des groupes d\'après COUNT, SUM ou AVG.',
      'ORDER BY':'**Classement** : ASC est croissant, DESC décroissant ; les critères sont appliqués dans l\'ordre.',
      'LIMIT':'**Nombre final** : seul le nombre demandé de premières lignes est conservé après le tri.'
    };
    return'<details><summary>Comprendre la requête clause par clause</summary><ol>'+
      terms.map((m,i)=>{const name=m[1].replace(/\s+/g,' ').toUpperCase();const start=m.index+m[0].length,end=i+1<terms.length?terms[i+1].index:sql.length;const portion=sql.slice(start,end).replace(/;\s*$/,'').trim();return'<li><strong>'+esc(name)+'</strong> : '+details[name].replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'<div class="tip"><code>'+esc(portion)+'</code></div></li>'}).join('')+'</ol></details>';
  }
  function qCard(q,exam=false,prefix=''){
    const value=state.answers[q.id]??(q.kind==='fix'?q.wrong||'':'');
    const input=q.kind==='numeric'?`<input type="text" id="answer-${q.id}" placeholder="Écris le nombre" value="${esc(value)}">`:
      `<textarea id="answer-${q.id}" spellcheck="false" rows="${q.kind==='open'?4:6}" placeholder="${q.kind==='open'?'Explique avec tes mots…':'Écris ta requête SQL…'}">${esc(value)}</textarea>`;
    return `<article class="exercise" id="item-${q.id}"><div class="top"><b>${esc(prefix||q.id)}</b><span class="difficulty">${esc(q.section||q.group||q.db)}</span>${state.passed[q.id]&&!exam?'<span class="chip">✓ maîtrisé</span>':''}</div><h3>${esc(q.question)}</h3>${q.expected?`<p class="tip">Indication du poly : ${esc(q.expected)}</p>`:''}${input}
    ${!exam?`<div class="btn-row"><button class="smallbtn" data-action="verify" data-id="${q.id}">▶ Vérifier</button><button class="smallbtn outline" data-action="hint" data-id="${q.id}">💡 Indice</button><button class="smallbtn ghost" data-action="correction" data-id="${q.id}">Voir la correction détaillée</button></div><div class="tip" id="hint-${q.id}" hidden>${esc(q.hint||'Identifie les tables, trace le chemin ON, puis ajoute WHERE, GROUP BY ou ORDER BY.')}</div>`:''}
    <div class="feedback" id="feedback-${q.id}" hidden></div>
    <div class="answer" id="correction-${q.id}" hidden><h4>Correction et méthode</h4>${q.kind==='open'?`<p>${esc(q.sql)}</p>`:q.kind==='numeric'?`<strong>${esc(q.sql)}</strong>`:code(q.sql)}<p><strong>Explication :</strong> ${esc(q.reason)}</p>${q.kind==='sql'||!q.kind||q.kind==='fix'?clauseByClause(q.sql):''}${q.kind==='open'&&!exam?`<button class="smallbtn" data-action="manual" data-id="${q.id}">✓ J’ai compris</button>`:''}</div></article>`;
  }
  function pageHeader(k,t,p){return`<div class="kicker">${esc(k)}</div><h1>${esc(t)}</h1><p class="lead">${esc(p)}</p>`}
  function nav(){
    const current=location.hash;
    function a(hash,title,num){return`<a href="${hash}" class="${current===hash?'active':''}"><span class="num">${num}</span>${esc(title)}</a>`}
    side.innerHTML=`<h4>Commencer</h4>${a('#/','Accueil','⌂')}${a('#/methode','Les trois relations','★')}
      <h4>Le cours pas à pas</h4>${D.modules.map((m,i)=>a('#/cours/'+m.id,m.title,i+1)).join('')}
      <h4>S’entraîner</h4>${a('#/poly','20 exercices du poly','20')}${a('#/exos/mini/0','Exercices mini-base','↗')}${a('#/exos/world/0','Exercices World','↗')}${a('#/bac','Bac à sable SQL','⌘')}
      <h4>Contrôles blancs</h4>${a('#/cc2/A','Sujet blanc A /20','A')}${a('#/cc2/B','Sujet blanc B /20','B')}${a('#/progres','Mes résultats','✓')}
      <h4>Les bases SQLite</h4><div class="panel" style="padding:12px;margin:8px 0"><div class="tip">Mini-base : intégrée au site.</div><button class="smallbtn outline" id="worldButton">📂 Importer World.db3</button>
      <input class="hidden" type="file" id="worldFile" accept=".db3,.sqlite,.db,.sqlite3"><div id="worldText" class="tip" style="margin-top:9px">${env.world?'✓ '+esc(env.worldFile):'World non chargée'}</div></div>`;
    const input=$('worldFile');$('worldButton').onclick=()=>input.click();
    input.onchange=async()=>{
      if(!input.files||!input.files[0])return;
      const f=input.files[0];
      $('worldText').textContent='Vérification de la base…';
      try{
        if(!env.sql)throw Error('SQLite n’est pas prêt.');
        const candidate=new env.sql.Database(new Uint8Array(await f.arrayBuffer()));
        const names=candidate.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values.map(v=>v[0].toLowerCase())||[];
        if(!['city','country','countrylanguage'].every(n=>names.includes(n)))throw Error('Les tables City, Country, CountryLanguage sont introuvables.');
        const c=candidate.exec('SELECT (SELECT COUNT(*) FROM City),(SELECT COUNT(*) FROM Country),(SELECT COUNT(*) FROM CountryLanguage)')[0].values[0];
        if(c[0]!==4079||c[1]!==239||c[2]!==988)throw Error('Le fichier doit contenir City=4079, Country=239, CountryLanguage=988 lignes comme la base du poly.');
        if(env.world)env.world.close();env.world=candidate;env.worldFile=f.name;
        render();
      }catch(e){$('worldText').textContent='Erreur : '+e.message}
    };
  }
  function home(){
    const n=Object.keys(state.passed).filter(k=>state.passed[k]).length;
    main.innerHTML=`<section class="hero"><div class="kicker" style="color:#ffd8ec">CPES · L1 · novembre 2026–janvier 2027</div><h1>SQL2 : maîtriser les jointures</h1>
    <p>La suite du site SQL1, fondée sur le polycopié des enseignants : mini_etudiants.sqlite, World.db3, 20 requêtes du cours et préparation au CC2 du 5 janvier.</p><div class="btn-row"><a class="btn light" href="#/cours/m1">Commencer le cours</a><a class="btn ghost" style="color:white;border-color:white" href="#/poly">20 requêtes du poly</a></div></section>
    <div class="stats"><div class="stat"><b>${D.modules.length}</b><span>chapitres expliqués</span></div><div class="stat"><b>${D.extras.length}</b><span>exercices supplémentaires</span></div><div class="stat"><b>2 × 20</b><span>questions de CC2 blancs</span></div></div>
    ${note('Le fonctionnement','La mini-base correspond aux données fictives du fichier fourni. World.db3 doit être importée depuis ton ordinateur pour exécuter les exercices World. Aucune donnée n’est envoyée à un serveur.','ok')}
    <h2>Les cours</h2><div class="module-grid">${D.modules.map((m,i)=>`<a class="module-card" href="#/cours/${m.id}"><div class="ico">${['📘','🔗','🧩','🌍','🏙️','🗣️','📊','🧠','🎓'][i]}</div><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p><div class="meta">${m.db==='mini'?'Mini-base':'World.db3'} · ${m.parts.length} étapes</div></a>`).join('')}</div>
    <h2>Entraînements et évaluations</h2><div class="module-grid">${[['#/poly','20 exercices du poly','Les requêtes A à E avec corrections.'],['#/exos/mini/0','Exercices sur la mini-base','Produits cartésiens, JOIN, WHERE, prévisions et erreurs.'],['#/exos/world/0','Exercices sur World','Villes, pays, langues, capitales, agrégations, 3 tables.'],['#/cc2/A','Sujet blanc A','20 requêtes originales sur World.'],['#/cc2/B','Sujet blanc B','20 autres requêtes du même niveau.'],['#/progres','Mes résultats','${n} exercices déjà maîtrisés.']].map(([h,t,p])=>`<a href="${h}" class="module-card"><h3>${t}</h3><p>${p}</p></a>`).join('')}</div>
    <div class="footer">Contenu adapté du polycopié « Les jointures SQL » (10 novembre 2026) et de la synthèse CC1 (3 novembre 2026). Les questions du poly sont distinguées des exercices et sujets blancs créés pour ce site.</div>`;
  }
  function course(id){
    const m=D.modules.find(x=>x.id===id);if(!m){main.innerHTML='<h1>Chapitre introuvable</h1>';return}
    const i=D.modules.indexOf(m);
    main.innerHTML=pageHeader(`Chapitre ${i+1}/${D.modules.length}`,m.title,m.desc)+dbMessage(m.db)+schema(m.db)+
      m.parts.map((x,j)=>`<div class="lesson-box"><h2>${j+1}. ${esc(x.title)}</h2><p>${esc(x.explain)}</p>${code(x.query)}
      <div class="btn-row"><button class="smallbtn" data-action="example" data-chapter="${id}" data-idx="${j}">▶ Exécuter l’exemple</button><button class="smallbtn outline" data-action="edit" data-chapter="${id}" data-idx="${j}">✎ Modifier dans le bac à sable</button></div>
      <div id="example-${j}" class="result" hidden></div>${note('À retenir',esc(x.tip),'ok')}</div>`).join('')+
      `<div class="panel"><h3>Passer à l'entraînement</h3><p>Réécris les requêtes sans regarder le modèle. Lorsque tu ne comprends pas, reviens au passage précis du cours.</p>${link(m.db==='mini'?'#/exos/mini/0':'#/exos/world/0','Faire les exercices')}</div>
      <div class="pager">${i?link('#/cours/'+D.modules[i-1].id,'← Chapitre précédent'):'<span></span>'}${i<D.modules.length-1?link('#/cours/'+D.modules[i+1].id,'Chapitre suivant →'):link('#/cc2/A','Sujet blanc A →')}</div>`;
  }
  function listPractice(db,page){
    const qs=D.extras.filter(x=>x.db===db),per=12,nPages=Math.ceil(qs.length/per),p=Math.max(0,Math.min(nPages-1,Number(page)||0));
    main.innerHTML=pageHeader('Entraînement intensif',db==='mini'?'Exercices mini_etudiants.sqlite':'Exercices World.db3',db==='mini'?'Comprendre les deux tables et anticiper les résultats, avant de passer à World.':'Des exercices originaux proches des requêtes universitaires : écrire, corriger, expliquer.')+
    dbMessage(db)+progress(qs)+`<p>Page ${p+1}/${nPages}. Les corrigés sont masqués tant que tu ne demandes pas à les voir.</p>`+
    qs.slice(p*per,(p+1)*per).map(x=>qCard(x)).join('')+
    `<div class="pager">${p?link('#/exos/'+db+'/'+(p-1),'← Page précédente'):'<span></span>'}${p<nPages-1?link('#/exos/'+db+'/'+(p+1),'Page suivante →'):link('#/cc2/A','Passer au CC2 blanc →')}</div>`;
  }
  function poly(){
    const groups={A:'Villes et pays',B:'Langues et pays',C:'Capitales',D:'Calculer après JOIN',E:'Trois tables'};
    main.innerHTML=pageHeader('Support du professeur','Les 20 requêtes du polycopié','Les vingt questions de World.db3, numérotées et classées exactement en A, B, C, D et E, avec des solutions expliquées.')+
    dbMessage('world')+schema('world')+progress(D.official)+
    `<div class="section-tabs">${Object.keys(groups).map(k=>`<a href="#/poly" data-scroll="part${k}">${k} · ${groups[k]}</a>`).join('')}</div>`+
    Object.keys(groups).map(k=>`<section id="part${k}"><h2>${k}. ${groups[k]}</h2>${D.official.filter(q=>q.section===k).map(q=>qCard(q)).join('')}</section>`).join('');
  }
  function exam(name){
    const items=name==='B'?D.examB:D.examA,record=state.exams[name];
    main.innerHTML=pageHeader('CC2 blanc : sujet '+name,'Évaluation /20 — sujet '+name,'Vingt requêtes à rédiger sur World.db3. Une correction question par question devient disponible après remise.')+
    dbMessage('world')+note('Sujet d’entraînement, non officiel','Durée conseillée : 2 heures. Le sujet reprend le niveau et le mode de questionnement du CC1, avec les jointures du cours. Barème indicatif : 1 point si exact, 0,75 si l’ordre seul est incorrect.', 'warn')+
    (record?.submitted?`<div class="feedback success">Dernière tentative : <strong>${esc(record.score)} / 20</strong></div>`:'')+
    items.map((q,i)=>qCard(q,true,`Question ${i+1} — 1 pt`)).join('')+
    `<div class="btn-row"><button class="btn" id="submitCC" data-name="${name}">Rendre et corriger ma copie</button><button class="btn outline" id="resetCC" data-name="${name}">Recommencer</button><button class="btn ghost" id="exportCC" data-name="${name}">⬇ Télécharger ma copie</button></div>`;
    if(record?.submitted)items.forEach(q=>{
      const d=$('correction-'+q.id),f=$('feedback-'+q.id),r=record.details[q.id];
      d.hidden=false;if(r){f.hidden=false;f.className='feedback '+(r.points===1?'success':r.points>0?'warn':'fail');f.textContent=`${r.points} / 1 — ${r.message}`;}
    });
  }
  function method(){
    main.innerHTML=pageHeader('Fiche méthode','Les liens à mémoriser','Les six questions qui permettent de rédiger une requête même quand l’énoncé paraît difficile.')+schema('world')+
    `<div class="lesson-box"><h2>Les six questions</h2><ol><li>Quelles colonnes dois-je afficher ?</li><li>Dans quelle(s) table(s) sont-elles ?</li><li>Quel chemin de clés relie ces tables ?</li><li>Quelles lignes dois-je filtrer avec WHERE ?</li><li>Faut-il un calcul : COUNT, SUM, GROUP BY ou HAVING ?</li><li>Quel ordre et quelle limite : ORDER BY et LIMIT ?</li></ol></div>
    <div class="lesson-box"><h2>Les pièges signalés au CC1</h2><p>Respecte les valeurs en anglais et la casse : <code>'Europe'</code>, et non <code>'EUROPE'</code>. Utilise <code>LIKE 'San%'</code>, pas une égalité. Évite les deux SELECT collés, les fonctions d'agrégation dans WHERE, les conditions OR mal écrites et les tris oubliés.</p>
    <p>Les corrections doivent être lues comme une méthode, puis réécrites sans copier-coller.</p></div>${link('#/poly','S’entraîner sur le poly')}`;
  }
  let sandboxDefault={db:'mini',sql:"SELECT e.nom,m.matiere FROM Etudiant e JOIN Matiere m ON e.numSecu=m.numSecu;"};
  function sandbox(){
    main.innerHTML=pageHeader('Laboratoire','Bac à sable SQL','Toutes les requêtes s’exécutent sur une copie temporaire. Aucune donnée de la base du professeur n’est écrasée.')+
    `<div class="panel"><label for="sandboxDatabase">Choisir la base</label><select id="sandboxDatabase"><option value="mini">mini_etudiants.sqlite</option><option value="world">World.db3</option></select>
    <textarea id="sandboxSQL" spellcheck="false" style="width:100%;height:200px;font-family:monospace;padding:12px;border:1px solid #bbb;border-radius:10px">${esc(sandboxDefault.sql)}</textarea>
    <div class="btn-row"><button class="btn" id="sandboxGo">▶ Exécuter</button><button class="btn outline" id="sandboxClear">Effacer</button></div><div id="sandboxResult" class="result" hidden></div></div>`+schema('mini')+schema('world');
    $('sandboxDatabase').value=sandboxDefault.db;
    $('sandboxGo').onclick=()=>{
      const div=$('sandboxResult');div.hidden=false;
      try{const r=execute($('sandboxDatabase').value,$('sandboxSQL').value);div.innerHTML=r.length?r.map((x,i)=>`<h4>Résultat ${i+1} — ${x.values.length} lignes</h4>${table(x.columns,x.values,75)}`).join(''):'Commande exécutée sans tableau à afficher.'}
      catch(e){div.textContent='Erreur : '+e.message}
    };
    $('sandboxClear').onclick=()=>{$('sandboxSQL').value='';$('sandboxResult').hidden=true};
  }
  function stats(){
    main.innerHTML=pageHeader('Progression','Mes résultats','Ton suivi reste sur cet appareil et ce navigateur.')+
    progress([...D.official,...D.extras])+
    `<div class="panel"><h2>Contrôles blancs</h2>${table(['Sujet','Note'],[['Sujet A',state.exams.A?.submitted?state.exams.A.score+'/20':'Non rendu'],['Sujet B',state.exams.B?.submitted?state.exams.B.score+'/20':'Non rendu']])}
    <div class="btn-row"><button id="exportProgress" class="smallbtn outline">⬇ Exporter le suivi</button><button id="resetProgress" class="smallbtn ghost">Effacer</button></div></div>`;
    $('exportProgress').onclick=()=>download('SQL2_resultats.json',JSON.stringify(state,null,2),'application/json');
    $('resetProgress').onclick=()=>{if(confirm('Effacer toutes les réponses et les notes SQL2 de ce navigateur ?')){state={answers:{},passed:{},exams:{}};save();render()}};
  }
  function download(filename,content,type='text/plain;charset=utf-8'){
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(){
    nav();
    const p=(location.hash||'#/').replace(/^#\/?/,'').split('/');
    switch(p[0]){
      case'':case'accueil':home();break;
      case'cours':course(p[1]);break;
      case'poly':poly();break;
      case'exos':listPractice(p[1]||'world',p[2]||'0');break;
      case'cc2':exam(p[1]==='B'?'B':'A');break;
      case'methode':method();break;
      case'bac':sandbox();break;
      case'progres':stats();break;
      default:main.innerHTML='<h1>Page introuvable</h1>';
    }
    $('side').classList.remove('open');$('overlay').classList.remove('show');window.scrollTo(0,0);
    document.title=(main.querySelector('h1')?.textContent||'SQL2')+' — SQL pas à pas';
  }
  main.addEventListener('click',e=>{const a=e.target.closest('[data-scroll]');if(a){e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}});
  main.addEventListener('input',e=>{
    if(e.target.id?.startsWith('answer-')){state.answers[e.target.id.slice(7)]=e.target.value;save();}
  });
  main.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const act=b.dataset.action,id=b.dataset.id,q=qById[id];
    if(act==='example'||act==='edit'){
      const m=D.modules.find(x=>x.id===b.dataset.chapter),x=m?.parts[Number(b.dataset.idx)];if(!x)return;
      if(act==='edit'){sandboxDefault={db:m.db,sql:x.query};location.hash='#/bac';return;}
      const div=$('example-'+b.dataset.idx);div.hidden=false;
      try{const r=execute(m.db,x.query);div.innerHTML=r.length?r.map((z,i)=>`<h4>Résultat ${i+1} : ${z.values.length} ligne(s)</h4>${table(z.columns,z.values,20)}`).join(''):'Commande exécutée sans tableau à afficher.'}
      catch(er){div.textContent='Erreur : '+er.message}
      return;
    }
    if(!q)return;
    if(act==='hint'){$('hint-'+id).hidden=!$('hint-'+id).hidden;return;}
    if(act==='correction'){$('correction-'+id).hidden=!$('correction-'+id).hidden;return;}
    if(act==='manual'){state.passed[id]=true;save();const f=$('feedback-'+id);f.hidden=false;f.textContent='Compréhension déclarée. Essaie de reformuler sans le corrigé.';return;}
    if(act==='verify'){
      const answer=$('answer-'+id).value;
      if(!answer.trim()){const f=$('feedback-'+id);f.hidden=false;f.textContent='Écris d’abord une réponse.';return;}
      try{
        const r=grade(q,answer);feedback(q,r);if(r.points!==null){state.passed[id]=r.points===1;save();}
      }catch(er){const f=$('feedback-'+id);f.hidden=false;f.className='feedback fail';f.textContent='Erreur ou base absente : '+er.message;}
    }
  });
  main.addEventListener('click',e=>{
    const t=e.target;if(!t.id)return;
    if(t.id==='submitCC'){
      const name=t.dataset.name,items=name==='B'?D.examB:D.examA;
      if(!env.world){alert('Importe World.db3 pour noter automatiquement ta copie.');return;}
      if(items.some(q=>!$('answer-'+q.id).value.trim())&&!confirm('Certaines questions sont sans réponse. Rendre la copie quand même ?'))return;
      let sum=0;const details={};
      items.forEach(q=>{let r;try{r=grade(q,$('answer-'+q.id).value)}catch(er){r={points:0,message:er.message}}sum+=r.points||0;details[q.id]={points:r.points||0,message:r.message};});
      state.exams[name]={submitted:true,score:Math.round(sum*100)/100,date:new Date().toISOString(),details};save();render();
    }
    if(t.id==='resetCC'){const name=t.dataset.name;if(!confirm('Effacer les réponses de ce contrôle blanc ?'))return;(name==='B'?D.examB:D.examA).forEach(q=>delete state.answers[q.id]);delete state.exams[name];save();render();}
    if(t.id==='exportCC'){
      const name=t.dataset.name,items=name==='B'?D.examB:D.examA;
      const content=['SQL2 — sujet blanc '+name,'Copie d’entraînement non officielle',''].concat(items.flatMap((q,i)=>[`${i+1}. ${q.question}`,state.answers[q.id]||'(aucune réponse)',''])).join('\n');
      download('SQL2_CC2_sujet_'+name+'_copie.txt',content);
    }
  });
  $('menuToggle').onclick=()=>{const open=!$('side').classList.contains('open');$('side').classList.toggle('open',open);$('overlay').classList.toggle('show',open);$('menuToggle').setAttribute('aria-expanded',String(open))};
  $('overlay').onclick=()=>{$('side').classList.remove('open');$('overlay').classList.remove('show')};
  document.querySelector('.skip')?.addEventListener('click',e=>{e.preventDefault();main.focus();});
  window.addEventListener('hashchange',render);
  render();
  (async()=>{
    try{
      if(typeof initSqlJs!=='function')throw Error('sql-wasm.js introuvable');
      env.sql=await initSqlJs({locateFile:f=>'../assets/vendor/'+f});
      env.mini=new env.sql.Database();env.mini.run(D.miniSQL);
      indicator.textContent='✓ Moteur SQLite prêt';indicator.classList.add('ready');render();
    }catch(e){indicator.textContent='SQLite indisponible';indicator.classList.add('bad');console.error(e);}
  })();
})();