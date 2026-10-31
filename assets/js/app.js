/* =========================================================
   SQL pas à pas — application (routeur, moteur SQL, correction)
   ========================================================= */
(function () {
  'use strict';
  var C = window.SQL1, esc = SQLH.esc, highlight = SQLH.highlight;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     1. Stockage local (progression, réponses, notes)
     --------------------------------------------------------- */
  var Store = {
    key: 'sql1.v1', data: null,
    load: function () {
      try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; }
      return this.data;
    },
    save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* stockage indisponible */ } },
    get: function (path, def) {
      var o = this.data, parts = path.split('.');
      for (var i = 0; i < parts.length; i++) { if (o == null || typeof o !== 'object') return def; o = o[parts[i]]; }
      return o === undefined ? def : o;
    },
    set: function (path, val) {
      var o = this.data, parts = path.split('.');
      for (var i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null || typeof o[parts[i]] !== 'object') o[parts[i]] = {}; o = o[parts[i]]; }
      o[parts[parts.length - 1]] = val; this.save();
    },
    del: function (path) {
      var o = this.data, parts = path.split('.');
      for (var i = 0; i < parts.length - 1; i++) { if (o == null) return; o = o[parts[i]]; }
      if (o) delete o[parts[parts.length - 1]]; this.save();
    }
  };
  Store.load();

  /* ---------------------------------------------------------
     2. Moteur SQL (sql.js dans le navigateur)
     --------------------------------------------------------- */
  var MINI_ROWS = [
    ['Rouge A', 'Dior', 'Lipstick', 30, 120], ['Rouge B', 'Dior', 'Lipstick', 50, 200],
    ['Rouge C', 'Nova', 'Lipstick', 50, 80], ['Mascara A', 'Dior', 'Mascara', 20, 150],
    ['Mascara B', 'Nova', 'Mascara', 40, 90], ['Soin A', 'Nova', 'Skincare', 60, 70],
    ['Soin B', 'Luma', 'Skincare', null, 30], ['Soin C', 'Luma', 'Skincare', 20, 40]
  ];
  var EVAL_ROWS = [
    ['Gloss 1', 'Kiko', 'Lipstick', 12, 300], ['Gloss 2', 'Kiko', 'Lipstick', 18, 150],
    ['Rouge X', 'Dior', 'Lipstick', 45, 500], ['Rouge Y', 'Dior', 'Lipstick', 45, 80],
    ['Mascara Pro', 'Kiko', 'Mascara', 15, 400], ['Mascara Max', 'Dior', 'Mascara', 35, 250],
    ['Parfum Or', 'Dior', 'Perfume', 120, 600], ['Parfum Rose', 'Lumi', 'Perfume', 80, 90],
    ['Crème Douce', 'Lumi', 'Skincare', null, 60], ['Crème Nuit', 'Lumi', 'Skincare', 40, 120]
  ];
  var DBS = {
    mini: { label: 'Mini-table du cours (8 produits)', short: 'Mini-table (8)', rows: MINI_ROWS },
    eval: { label: 'Table de l\'évaluation (10 produits)', short: 'Table éval (10)', rows: EVAL_ROWS },
    sephora: { label: 'Vraie base Sephora (9 168 produits)', short: 'Sephora (9 168)' }
  };
  window.SQL1_DBS = DBS;

  var Engine = { SQL: null, bytes: null, dbs: {}, ready: null };
  function buildDb(name) {
    if (name === 'sephora') return new Engine.SQL.Database(Engine.bytes);
    var db = new Engine.SQL.Database();
    db.run('CREATE TABLE Sephora (name TEXT, brand TEXT, category TEXT, price REAL, love INTEGER);');
    var st = db.prepare('INSERT INTO Sephora VALUES (?,?,?,?,?)');
    DBS[name].rows.forEach(function (r) { st.run(r); });
    st.free();
    return db;
  }
  Engine.ready = new Promise(function (resolve, reject) {
    if (typeof initSqlJs !== 'function') { reject(new Error('sql.js absent')); return; }
    Promise.all([
      initSqlJs({ locateFile: function (f) { return 'assets/vendor/' + f; } }),
      fetch('data/sephora.db').then(function (r) { if (!r.ok) throw new Error('base introuvable'); return r.arrayBuffer(); })
    ]).then(function (res) {
      Engine.SQL = res[0]; Engine.bytes = new Uint8Array(res[1]);
      Object.keys(DBS).forEach(function (k) { Engine.dbs[k] = buildDb(k); });
      resolve(Engine);
    }).catch(reject);
  });
  Engine.ready.then(function () {
    var s = $('#engineStatus'); s.textContent = '● moteur SQL prêt'; s.className = 'engine ok';
  }, function (e) {
    var s = $('#engineStatus'); s.textContent = '● moteur SQL indisponible'; s.className = 'engine err';
    console.error(e);
  });

  function translateError(msg) {
    var m;
    if ((m = msg.match(/no such column: (.+)/))) {
      return 'La colonne « ' + m[1] + ' » n\'existe pas. Vérifie l\'orthographe du nom de colonne. ' +
        'Si c\'est un texte (une marque, une catégorie…), il faut le mettre entre apostrophes droites : \'' + m[1] + '\'.';
    }
    if ((m = msg.match(/no such table: (.+)/))) return 'La table « ' + m[1] + ' » n\'existe pas. La table s\'appelle Sephora.';
    if ((m = msg.match(/near "(.+?)": syntax error/))) {
      var w = m[1], extra = '';
      if (/^(FROM|WHERE|GROUP|ORDER|HAVING|LIMIT)$/i.test(w)) extra = ' Vérifie l\'ordre : SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT, et qu\'il n\'y a pas de virgule en trop avant « ' + w + ' ».';
      else if (/^\d/.test(w)) extra = ' Un nombre ne doit pas contenir d\'espace (écris 100000, pas 100 000).';
      return 'Erreur d\'écriture près de « ' + w + ' ».' + extra;
    }
    if (/incomplete input/.test(msg)) return 'La requête est incomplète : il manque peut-être une parenthèse ou une apostrophe de fermeture.';
    if (/unrecognized token/.test(msg)) return 'Caractère non reconnu. As-tu utilisé des apostrophes penchées ‘ ’ ? Il faut des apostrophes droites \' \'.';
    if (/misuse of aggregate/.test(msg)) return 'Une fonction de calcul (COUNT, AVG, SUM…) ne peut pas être utilisée dans WHERE. Pour filtrer des groupes, utilise HAVING après GROUP BY.';
    if (/a GROUP BY clause is required/.test(msg)) return 'HAVING s\'utilise après un GROUP BY.';
    if (/sub-select returns (\d+) columns/.test(msg)) return 'La sous-requête renvoie plusieurs colonnes : elle ne doit en renvoyer qu\'une.';
    if (/wrong number of arguments/.test(msg)) return 'Mauvais nombre d\'arguments dans une fonction (par exemple ROUND(x, 2)).';
    return 'Erreur : ' + msg;
  }

  var MUTATE = /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|ATTACH|DETACH|VACUUM|PRAGMA)\b/i;
  function runSQL(dbName, sql) {
    sql = (sql || '').trim();
    if (!sql) return { ok: false, error: 'Écris d\'abord une requête.' };
    var warn = /[‘’“”]/.test(sql) ? 'Attention : ta requête contient des apostrophes ou guillemets penchés (‘ ’ “ ”). Remplace-les par des apostrophes droites \' .' : '';
    var db = Engine.dbs[dbName];
    if (!db) return { ok: false, error: 'Le moteur SQL n\'est pas encore prêt.' };
    var t0 = performance.now();
    try {
      var res = db.exec(sql);
      var last = res.length ? res[res.length - 1] : { columns: [], values: [] };
      if (MUTATE.test(sql)) { db.close(); Engine.dbs[dbName] = buildDb(dbName); warn = 'Ici on ne modifie pas la base : elle a été remise dans son état d\'origine.'; }
      return { ok: true, columns: last.columns, values: last.values, ms: performance.now() - t0, warn: warn };
    } catch (e) {
      return { ok: false, error: translateError(e.message), raw: e.message, warn: warn };
    }
  }

  function fmt(v) {
    if (v === null || v === undefined) return '<span class="null">NULL</span>';
    if (typeof v === 'number' && !Number.isInteger(v)) return String(Math.round(v * 1e6) / 1e6);
    return esc(v);
  }
  function renderResult(res, max) {
    max = max || 200;
    if (!res) return '';
    var h = '';
    if (res.warn) h += '<div class="warn">' + esc(res.warn) + '</div>';
    if (!res.ok) return h + '<div class="err">' + esc(res.error) + (res.raw ? '<small>(message d\'origine : ' + esc(res.raw) + ')</small>' : '') + '</div>';
    var n = res.values.length;
    h += '<div class="count">' + n + ' ligne' + (n > 1 ? 's' : '') + ' trouvée' + (n > 1 ? 's' : '') +
      (n > max ? ' — seules les ' + max + ' premières sont affichées' : '') + '</div>';
    if (!res.columns.length) return h;
    h += '<div class="tbl-wrap"><table class="tbl compact"><thead><tr>';
    res.columns.forEach(function (c) { h += '<th>' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    res.values.slice(0, max).forEach(function (r) {
      h += '<tr>'; r.forEach(function (v) { h += '<td>' + fmt(v) + '</td>'; }); h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* ---------------------------------------------------------
     3. Correction automatique
     --------------------------------------------------------- */
  function sameVal(a, b) {
    if (a === null || b === null || a === undefined || b === undefined) return a == b;
    var na = typeof a === 'number', nb = typeof b === 'number';
    if (na && nb) return Math.abs(a - b) <= Math.max(0.006, Math.abs(a) * 1e-9);
    if (na || nb) { var x = Number(a), y = Number(b); if (!isNaN(x) && !isNaN(y)) return Math.abs(x - y) <= 0.006; }
    return String(a).trim() === String(b).trim();
  }
  function normKey(v) {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'number') return 'n' + (Math.round(v * 100) / 100);
    return 's' + String(v).trim();
  }
  function rowsKeys(values, idxs, ordered) {
    var keys = values.map(function (r) { return idxs.map(function (i) { return normKey(r[i]); }).join('|'); });
    return ordered ? keys : keys.slice().sort();
  }
  function arrEq(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function stripStrings(sql) { return sql.replace(/'(?:[^']|'')*'/g, "''").toUpperCase(); }

  /* check = { value, cols:[...], ordered, mustInclude:[...] } */
  function gradeSQL(q, studentSql) {
    var check = q.check || {};
    var ref = runSQL(q.db, q.solution);
    var stu = runSQL(q.db, studentSql);
    var out = { stu: stu, ref: ref };
    if (!ref.ok) { out.score = 0; out.level = 'ko'; out.msg = 'Problème dans le corrigé : ' + ref.error; return out; }
    if (!studentSql || !studentSql.trim()) { out.score = 0; out.level = 'ko'; out.msg = 'Pas de réponse.'; return out; }
    if (!stu.ok) { out.score = 0; out.level = 'ko'; out.msg = 'Ta requête provoque une erreur. ' + stu.error; return out; }
    var n = stu.values.length, m = ref.values.length;
    if (check.value) {
      if (!n) { out.score = 0; out.level = 'ko'; out.msg = 'Ta requête ne renvoie aucune ligne.'; return out; }
      var refRow = ref.values[0], stuRow = stu.values[0];
      var okAll = refRow.every(function (v) { return stuRow.some(function (w) { return sameVal(v, w); }); });
      if (!okAll) {
        out.score = 0; out.level = 'ko';
        out.msg = 'Le résultat n\'est pas le bon : tu obtiens ' + stuRow.map(fmtPlain).join(' | ') + '.';
        return out;
      }
      out.score = 1; out.level = 'ok'; out.msg = 'Bravo, c\'est le bon résultat : ' + refRow.map(fmtPlain).join(' | ') + '.';
    } else {
      if (n !== m) {
        out.score = 0; out.level = 'ko';
        out.msg = 'Tu obtiens ' + n + ' ligne' + (n > 1 ? 's' : '') + ', il en faut ' + m + '. Relis les conditions (WHERE, HAVING) et la limite (LIMIT).';
        return out;
      }
      if (check.cols) {
        var sIdx = [], rIdx = [], missing = [];
        var lowS = stu.columns.map(function (c) { return c.toLowerCase(); });
        var lowR = ref.columns.map(function (c) { return c.toLowerCase(); });
        check.cols.forEach(function (c) {
          var i = lowS.indexOf(c.toLowerCase()); var j = lowR.indexOf(c.toLowerCase());
          if (i < 0) missing.push(c); else { sIdx.push(i); rIdx.push(j); }
        });
        if (missing.length) {
          out.score = 0.5; out.level = 'mid';
          out.msg = 'Bon nombre de lignes, mais il manque la colonne ' + missing.join(', ') + ' dans ton SELECT.';
          return out;
        }
        var a = rowsKeys(stu.values, sIdx, check.ordered), b = rowsKeys(ref.values, rIdx, check.ordered);
        if (!arrEq(a, b)) {
          var a2 = rowsKeys(stu.values, sIdx, false), b2 = rowsKeys(ref.values, rIdx, false);
          out.score = 0.5; out.level = 'mid';
          out.msg = arrEq(a2, b2) ? 'Ce sont les bonnes valeurs, mais pas dans le bon ordre. Vérifie ton ORDER BY (ASC / DESC).'
            : 'Bon nombre de lignes, mais ce ne sont pas les bonnes valeurs. Vérifie tes conditions.';
          return out;
        }
      } else {
        if (stu.columns.length !== ref.columns.length) {
          out.score = 0.5; out.level = 'mid';
          out.msg = 'Bon nombre de lignes, mais il faut ' + ref.columns.length + ' colonne(s) et tu en as ' + stu.columns.length + '. Relis ce qu\'on demande d\'afficher.';
          return out;
        }
        var all = ref.columns.map(function (_, i) { return i; });
        var x = rowsKeys(stu.values, all, check.ordered), y = rowsKeys(ref.values, all, check.ordered);
        if (!arrEq(x, y)) {
          var x2 = rowsKeys(stu.values, all, false), y2 = rowsKeys(ref.values, all, false);
          out.score = 0.5; out.level = 'mid';
          out.msg = arrEq(x2, y2) ? 'Ce sont les bonnes valeurs, mais pas dans le bon ordre. Vérifie ton ORDER BY.'
            : 'Bon nombre de lignes et de colonnes, mais les valeurs ne sont pas les bonnes (ou les colonnes ne sont pas dans le bon ordre).';
          return out;
        }
      }
      out.score = 1; out.level = 'ok'; out.msg = 'Bravo, c\'est juste ! (' + m + ' ligne' + (m > 1 ? 's' : '') + ')';
    }
    if (check.mustInclude) {
      var up = stripStrings(studentSql);
      var miss = check.mustInclude.filter(function (k) { return !new RegExp('\\b' + k + '\\b').test(up); });
      if (miss.length) { out.score = 0.5; out.level = 'mid'; out.msg = 'Le résultat est bon, mais la consigne demande d\'utiliser : ' + miss.join(', ') + '.'; }
    }
    return out;
  }
  function fmtPlain(v) { if (v === null) return 'NULL'; if (typeof v === 'number' && !Number.isInteger(v)) return String(Math.round(v * 100) / 100); return String(v); }

  /* Correction d'une réponse écrite « je joue l'ordinateur » */
  function gradeHand(q, text) {
    var ref = runSQL(q.db, q.solution);
    var out = { ref: ref };
    text = (text || '').trim();
    if (!text) { out.score = 0; out.level = 'ko'; out.msg = 'Pas de réponse.'; return out; }
    var low = text.toLowerCase();
    // valeurs texte possibles : colonnes du résultat qui existent dans la table
    var tableCols = runSQL(q.db, 'SELECT * FROM Sephora LIMIT 1').columns || [];
    var universe = [];
    ref.columns.forEach(function (c) {
      if (tableCols.indexOf(c) >= 0) {
        var r = runSQL(q.db, 'SELECT DISTINCT "' + c + '" FROM Sephora');
        r.values.forEach(function (v) { if (typeof v[0] === 'string') universe.push(v[0]); });
      }
    });
    var expStr = [], expNum = [];
    ref.values.forEach(function (r) { r.forEach(function (v) { if (typeof v === 'string') expStr.push(v); else if (typeof v === 'number') expNum.push(v); }); });
    var missing = [], extra = [];
    expStr.forEach(function (s) { if (low.indexOf(s.toLowerCase()) < 0 && missing.indexOf(s) < 0) missing.push(s); });
    universe.forEach(function (s) { if (expStr.indexOf(s) < 0 && low.indexOf(s.toLowerCase()) >= 0) extra.push(s); });
    // nombres : on enlève d'abord les noms (qui contiennent des chiffres)
    var stripped = low;
    universe.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (s) { stripped = stripped.split(s.toLowerCase()).join(' '); });
    var nums = (stripped.match(/-?\d+(?:[.,]\d+)?/g) || []).map(function (s) { return parseFloat(s.replace(',', '.')); });
    var pool = nums.slice();
    expNum.forEach(function (v) {
      var k = -1;
      for (var i = 0; i < pool.length; i++) if (Math.abs(pool[i] - v) <= 0.011) { k = i; break; }
      if (k < 0) missing.push(fmtPlain(v)); else pool.splice(k, 1);
    });
    var orderBad = false;
    if (q.ordered && !missing.length) {
      var firstCol = ref.values.map(function (r) { return r[0]; }).filter(function (v) { return typeof v === 'string'; });
      var pos = firstCol.map(function (s) { return low.indexOf(s.toLowerCase()); });
      for (var i = 1; i < pos.length; i++) if (pos[i] < pos[i - 1]) orderBad = true;
    }
    var errs = missing.length + extra.length + (orderBad ? 1 : 0);
    out.score = errs === 0 ? 1 : errs === 1 ? 0.5 : 0;
    out.level = errs === 0 ? 'ok' : errs === 1 ? 'mid' : 'ko';
    var parts = [];
    if (missing.length) parts.push('il manque : ' + missing.join(', '));
    if (extra.length) parts.push('en trop : ' + extra.join(', '));
    if (orderBad) parts.push('l\'ordre n\'est pas le bon');
    out.msg = errs === 0 ? 'Bravo, c\'est exactement le bon résultat !' : 'Pas tout à fait — ' + parts.join(' ; ') + '.';
    return out;
  }

  /* ---------------------------------------------------------
     4. Éditeur SQL
     --------------------------------------------------------- */
  function makeEditor(opts) {
    opts = opts || {};
    var db = opts.db || 'sephora';
    var initial = opts.sql || '';
    var el = document.createElement('div');
    el.className = 'editor';
    var dbHtml = opts.dbSelect
      ? '<select aria-label="Choisir la base">' + Object.keys(DBS).map(function (k) { return '<option value="' + k + '"' + (k === db ? ' selected' : '') + '>' + DBS[k].label + '</option>'; }).join('') + '</select>'
      : '<span>' + DBS[db].label + '</span>';
    el.innerHTML =
      '<div class="editor-head"><span class="lbl">' + esc(opts.label || 'Requête SQL') + '</span>' + dbHtml +
      '<span class="spacer"></span><span class="hint">' + (opts.run === false ? 'exécution désactivée (écrit sur table)' : 'Ctrl + Entrée pour exécuter') + '</span></div>' +
      '<div class="code-area"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Zone de saisie SQL" placeholder="' + esc(opts.placeholder || 'Écris ta requête ici…') + '"></textarea></div>' +
      '<div class="editor-foot">' +
      (opts.run === false ? '' : '<button class="btn teal run" type="button">▶ Exécuter</button>') +
      (opts.reset === false ? '' : '<button class="btn soft reset" type="button" title="Revenir au texte de départ">↺ Revenir au départ</button>') +
      (opts.extraButtons || '') +
      '<span class="status"></span></div>' +
      '<div class="result" hidden></div>';
    var ta = $('textarea', el), pre = $('pre', el), result = $('.result', el), status = $('.status', el);
    var sel = $('select', el);
    function sync() {
      pre.innerHTML = highlight(ta.value) + '\n';
      ta.style.height = 'auto';
      ta.style.height = Math.max(64, ta.scrollHeight) + 'px';
    }
    ta.value = initial; sync();
    ta.addEventListener('input', function () { sync(); if (opts.onInput) opts.onInput(ta.value); });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (opts.run !== false) api.run(); }
      else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 2; sync();
        if (opts.onInput) opts.onInput(ta.value);
      }
    });
    if (sel) sel.addEventListener('change', function () { db = sel.value; if (opts.onDb) opts.onDb(db); });
    var api = {
      el: el,
      getValue: function () { return ta.value; },
      setValue: function (v) { ta.value = v; sync(); },
      getDb: function () { return db; },
      lock: function () { ta.readOnly = true; el.classList.add('locked'); },
      run: function () {
        status.textContent = 'exécution…';
        Engine.ready.then(function () {
          var r = runSQL(db, ta.value);
          result.hidden = false;
          result.innerHTML = renderResult(r);
          status.textContent = r.ok ? 'exécutée en ' + Math.max(1, Math.round(r.ms)) + ' ms' : 'erreur';
          if (opts.onRun) opts.onRun(r, ta.value);
        }, function () { result.hidden = false; result.innerHTML = '<div class="err">Le moteur SQL n\'a pas pu se charger. Recharge la page.</div>'; });
      },
      showResult: function (r) { result.hidden = false; result.innerHTML = renderResult(r); }
    };
    var runBtn = $('.run', el); if (runBtn) runBtn.addEventListener('click', api.run);
    var resetBtn = $('.reset', el);
    if (resetBtn) resetBtn.addEventListener('click', function () { ta.value = initial; sync(); result.hidden = true; status.textContent = ''; if (opts.onInput) opts.onInput(ta.value); });
    // resynchronise la hauteur quand l'éditeur devient visible
    setTimeout(sync, 0);
    return api;
  }

  /* transforme les blocs .try du contenu en éditeurs */
  function hydrate(root) {
    $$('.try', root).forEach(function (div) {
      var ed = makeEditor({ db: div.dataset.db, sql: decodeURIComponent(div.dataset.sql), label: div.dataset.label || '✏️ Essaie !' });
      div.replaceWith(ed.el);
    });
  }

  /* ---------------------------------------------------------
     5. Questions (QCM, ouverte, SQL, à la main, erreur à corriger)
     --------------------------------------------------------- */
  /*  mode 'practice' : correction immédiate question par question
      mode 'exam'     : correction quand on rend la copie            */
  function QuestionSet(root, questions, ns, mode, opts) {
    opts = opts || {};
    var self = this;
    this.opts = opts;
    this.questions = questions; this.ns = ns; this.mode = mode; this.items = [];
    var state = Store.get(ns, {}) || {};
    if (!state.answers) state.answers = {};
    if (!state.self) state.self = {};
    if (!state.res) state.res = {};
    this.state = state;
    this.submitted = mode === 'exam' && !!state.submitted;
    function persist() { Store.set(ns, state); }
    this.persist = persist;

    questions.forEach(function (q, idx) {
      var box = document.createElement('div');
      box.className = 'q'; box.id = 'q-' + q.id;
      var num = q.num || (idx + 1);
      box.innerHTML = '<div class="q-head"><span class="q-num">' + esc(num) + '</span>' +
        (q.title ? '<span class="q-title">' + q.title + '</span>' : '') +
        '<span class="q-status"></span>' +
        (q.pts != null ? '<span class="q-pts">' + fmtPts(q.pts) + ' pt' + (q.pts > 1 ? 's' : '') + '</span>' : '') +
        '</div><div class="q-body">' + (q.q || '') + '</div><div class="q-zone"></div><div class="q-fb"></div><div class="q-corr"></div>';
      root.appendChild(box);
      var item = { q: q, box: box, zone: $('.q-zone', box), fb: $('.q-fb', box), corr: $('.q-corr', box), status: $('.q-status', box) };
      self.items.push(item);
      self.build(item);
    });
    hydrate(root);
    // (en mode examen, la page applique elle-même la correction après chargement du moteur)
    if (mode === 'practice') Engine.ready.then(function () {
      self.items.forEach(function (it) { if (state.res[it.q.id]) self.showPractice(it, state.res[it.q.id], true); });
    });
  }
  function fmtPts(p) { return String(p).replace('.', ','); }

  QuestionSet.prototype.build = function (it) {
    var self = this, q = it.q, st = this.state, mode = this.mode;
    var saved = st.answers[q.id];
    var locked = this.submitted;
    var html = '';
    if (q.type === 'qcm') {
      html = '<div class="choices">' + q.options.map(function (o, i) {
        return '<label class="choice"><input type="radio" name="' + self.ns + '-' + q.id + '" value="' + i + '"' + (saved === i ? ' checked' : '') + (locked ? ' disabled' : '') + '><span>' + o + '</span></label>';
      }).join('') + '</div>';
      it.zone.innerHTML = html;
      $$('input', it.zone).forEach(function (inp) {
        inp.addEventListener('change', function () {
          st.answers[q.id] = Number(inp.value); self.persist();
          if (mode === 'practice') self.checkOne(it);
        });
      });
      return;
    }
    if (q.type === 'open' || q.type === 'hand') {
      it.zone.innerHTML = '<textarea class="answer" rows="' + (q.rows || 3) + '" placeholder="' + esc(q.placeholder || 'Écris ta réponse ici…') + '"' + (locked ? ' readonly' : '') + '></textarea>' +
        (mode === 'practice' ? '<div class="btn-row"><button class="btn small check" type="button">' + (q.type === 'open' ? 'Voir la réponse modèle' : 'Vérifier') + '</button></div>' : '');
      var ta = $('textarea', it.zone); ta.value = saved || '';
      ta.addEventListener('input', function () { st.answers[q.id] = ta.value; self.persist(); });
      var b = $('.check', it.zone); if (b) b.addEventListener('click', function () { self.checkOne(it); });
      if (q.think && mode === 'practice') it.zone.insertAdjacentHTML('afterbegin', thinkHtml(q.think));
      return;
    }
    if (q.type === 'sql' || q.type === 'fix') {
      var parts = '';
      if (q.think && mode === 'practice') parts += thinkHtml(q.think);
      if (q.type === 'fix') parts += '<label class="expected"><b>1. Explique l\'erreur :</b></label><textarea class="answer expl" rows="2" placeholder="L\'erreur est…"' + (locked ? ' readonly' : '') + '></textarea><div class="expected" style="margin-top:8px"><b>2. Corrige la requête :</b></div>';
      it.zone.innerHTML = parts;
      var startSql = (saved && typeof saved === 'object' ? saved.sql : saved);
      if (startSql == null) startSql = q.type === 'fix' ? q.wrong : (q.starter || '');
      var ed = makeEditor({
        db: q.db, sql: startSql, label: q.type === 'fix' ? 'Requête à corriger' : 'Ta requête',
        run: q.run !== false && !(this.mode === 'exam' && this.opts && this.opts.noRun),
        extraButtons: mode === 'practice' ? '<button class="btn check" type="button">✔ Vérifier</button>' : '',
        onInput: function (v) {
          if (q.type === 'fix') { var cur = st.answers[q.id] || {}; cur.sql = v; st.answers[q.id] = cur; } else st.answers[q.id] = v;
          self.persist();
        }
      });
      if (q.type === 'fix' && q.wrong) {
        // le bouton « revenir au départ » remet la requête fausse
      }
      it.editor = ed;
      it.zone.appendChild(ed.el);
      if (locked) ed.lock();
      if (q.expected && mode === 'practice') it.zone.insertAdjacentHTML('beforeend', '<div class="expected">🎯 Résultat attendu : <b>' + q.expected + '</b></div>');
      var cb = $('.check', ed.el); if (cb) cb.addEventListener('click', function () { self.checkOne(it); });
      if (q.type === 'fix') {
        var ex = $('.expl', it.zone); ex.value = (saved && saved.expl) || '';
        ex.addEventListener('input', function () { var cur = st.answers[q.id] || {}; cur.expl = ex.value; if (cur.sql == null) cur.sql = ed.getValue(); st.answers[q.id] = cur; self.persist(); });
      }
      return;
    }
  };
  QuestionSet.prototype.opts = null;

  function thinkHtml(t) { return '<details class="think"><summary>🤔 Comment réfléchir ?</summary>' + t + '</details>'; }

  /* calcule la note automatique d'une question : {score (0..1 de la partie auto), level, msg, needsSelf, autoShare} */
  QuestionSet.prototype.evaluate = function (it) {
    var q = it.q, a = this.state.answers[q.id];
    if (q.type === 'qcm') {
      var ok = a === q.answer;
      return { score: ok ? 1 : 0, level: a == null ? 'ko' : ok ? 'ok' : 'ko', msg: a == null ? 'Pas de réponse.' : ok ? 'Bonne réponse !' : 'Ce n\'est pas la bonne réponse.', autoShare: 1 };
    }
    if (q.type === 'open') return { score: 0, level: 'info', msg: '', needsSelf: true, autoShare: 0 };
    if (q.type === 'hand') { var g = gradeHand(q, a); g.autoShare = 1; return g; }
    if (q.type === 'sql') { var r = gradeSQL(q, typeof a === 'string' ? a : (it.editor ? it.editor.getValue() : '')); r.autoShare = 1; return r; }
    if (q.type === 'fix') {
      var sql = a && a.sql != null ? a.sql : (it.editor ? it.editor.getValue() : q.wrong);
      var f = gradeSQL(q, sql);
      if (f.score < 1) f.score = 0; // la correction doit être complètement juste
      f.autoShare = 0.5; f.needsSelf = true; return f;
    }
  };

  /* score total d'une question en points (auto + auto-évaluation) */
  QuestionSet.prototype.points = function (it, ev) {
    var q = it.q, pts = q.pts || 1;
    var self = this.state.self[q.id];
    var p = ev.score * ev.autoShare * pts;
    if (ev.needsSelf) {
      var share = 1 - ev.autoShare;
      if (self != null) p += self * share * pts;
    }
    return Math.round(p * 100) / 100;
  };

  QuestionSet.prototype.correctionHtml = function (q, ev) {
    var h = '';
    if (q.type === 'qcm') {
      if (q.explain) h += '<div class="model"><div class="model-title">Explication</div>' + q.explain + '</div>';
    } else if (q.type === 'open') {
      h += '<div class="model"><div class="model-title">Réponse modèle</div>' + q.model + '</div>';
    } else if (q.type === 'hand') {
      h += '<div class="model"><div class="model-title">Résultat attendu</div>' + (q.model || '') + renderResultStatic(ev.ref) + '</div>';
    } else {
      h += '<div class="model"><div class="model-title">Corrigé</div>' + (q.type === 'fix' && q.model ? '<p>' + q.model + '</p>' : '');
      h += H.code(q.solution) + (q.explain ? '<p>' + q.explain + '</p>' : '') + (q.expected ? '<p class="expected">🎯 Résultat attendu : <b>' + q.expected + '</b></p>' : '') + '</div>';
    }
    return h;
  };
  function renderResultStatic(r) {
    if (!r || !r.ok) return '';
    return '<div class="result" style="max-height:260px;border:1px solid var(--line);border-radius:8px">' + renderResult(r) + '</div>';
  }

  function selfHtml(q, cur, share) {
    var pts = (q.pts || 1) * share;
    var b = function (v, l) { return '<button type="button" class="btn small soft' + (cur === v ? ' on' : '') + '" data-self="' + v + '">' + l + '</button>'; };
    return '<div class="self"><b>Auto-évaluation</b> (compare avec la réponse modèle, ' + fmtPts(Math.round(pts * 100) / 100) + ' pt) : ' +
      b(0, '✗ Faux') + b(0.5, '≈ À moitié') + b(1, '✓ Juste') + '</div>';
  }

  QuestionSet.prototype.checkOne = function (it) {
    var ev = this.evaluate(it);
    this.state.res[it.q.id] = { level: ev.level, score: ev.score };
    this.persist();
    this.showPractice(it, ev, false);
    if (this.onChange) this.onChange();
  };
  QuestionSet.prototype.showPractice = function (it, ev, restoring) {
    var q = it.q, self = this;
    if (restoring) ev = this.evaluate(it);
    if (q.type === 'qcm') {
      $$('.choice', it.zone).forEach(function (lab, i) {
        lab.classList.remove('right', 'wrong');
        if (i === q.answer) lab.classList.add('right');
        else if (self.state.answers[q.id] === i) lab.classList.add('wrong');
      });
    }
    if (ev.msg) it.fb.innerHTML = '<div class="feedback ' + (ev.level === 'info' ? 'info' : ev.level) + '">' + esc(ev.msg) + '</div>';
    if (q.type === 'sql' || q.type === 'fix') { if (ev.stu && !restoring && it.editor) it.editor.showResult(ev.stu); }
    it.status.className = 'q-status ' + (ev.level === 'ok' ? 'ok' : ev.level === 'ko' ? 'ko' : '');
    it.status.textContent = ev.level === 'ok' ? '✓ réussi' : ev.level === 'mid' ? '≈ presque' : ev.level === 'ko' ? '✗ à revoir' : '';
    var showCorr = q.type === 'open' || q.type === 'qcm' || q.type === 'hand' || ev.level === 'ok';
    if (showCorr) it.corr.innerHTML = this.correctionHtml(q, ev);
    else it.corr.innerHTML = '<details class="sol"><summary>👀 Voir la réponse</summary>' + this.correctionHtml(q, ev) + '</details>';
    if (ev.needsSelf) {
      it.corr.insertAdjacentHTML('beforeend', selfHtml(q, this.state.self[q.id], 1 - ev.autoShare));
      this.bindSelf(it);
    }
  };
  QuestionSet.prototype.bindSelf = function (it) {
    var self = this;
    $$('[data-self]', it.corr).forEach(function (b) {
      b.addEventListener('click', function () {
        self.state.self[it.q.id] = Number(b.dataset.self); self.persist();
        $$('[data-self]', it.corr).forEach(function (x) { x.classList.toggle('on', x === b); });
        if (self.mode === 'exam') self.updateScore(); else if (self.onChange) self.onChange();
      });
    });
  };

  /* --- mode examen --- */
  QuestionSet.prototype.gradeAll = function (restoring, silent) {
    var self = this;
    this.submitted = true; this.state.submitted = true;
    if (!this.state.submittedAt) this.state.submittedAt = new Date().toISOString();
    this.items.forEach(function (it) {
      var ev = self.evaluate(it);
      it.ev = ev;
      $$('input, textarea', it.zone).forEach(function (x) { if (x.type === 'radio') x.disabled = true; else x.readOnly = true; });
      if (it.editor) { it.editor.lock(); if (ev.stu && (ev.stu.ok || it.editor.getValue().trim())) it.editor.showResult(ev.stu); }
      if (it.q.type === 'qcm') {
        $$('.choice', it.zone).forEach(function (lab, i) {
          lab.classList.add('locked');
          if (i === it.q.answer) lab.classList.add('right'); else if (self.state.answers[it.q.id] === i) lab.classList.add('wrong');
        });
      }
      var msg = ev.msg ? '<div class="feedback ' + (ev.level === 'info' ? 'info' : ev.level) + '">' + esc(ev.msg) + '</div>' : '';
      it.fb.innerHTML = msg;
      it.corr.innerHTML = self.correctionHtml(it.q, ev);
      if (ev.needsSelf) { it.corr.insertAdjacentHTML('beforeend', selfHtml(it.q, self.state.self[it.q.id], 1 - ev.autoShare)); self.bindSelf(it); }
    });
    this.persist();
    this.updateScore(silent);
  };
  QuestionSet.prototype.updateScore = function (silent) {
    var self = this, total = 0, max = 0, pending = 0;
    this.items.forEach(function (it) {
      var ev = it.ev || self.evaluate(it);
      var p = self.points(it, ev);
      total += p; max += it.q.pts || 1;
      if (ev.needsSelf && self.state.self[it.q.id] == null) pending++;
      it.status.className = 'q-status ' + (p >= (it.q.pts || 1) - 1e-9 ? 'ok' : p === 0 && !(ev.needsSelf && self.state.self[it.q.id] == null) ? 'ko' : '');
      it.status.textContent = fmtPts(Math.round(p * 100) / 100) + ' / ' + fmtPts(it.q.pts || 1);
    });
    total = Math.round(total * 100) / 100;
    this.state.score = total; this.state.max = max; this.state.pending = pending;
    this.persist();
    if (this.onScore && !silent) this.onScore(total, max, pending);
    return { total: total, max: max, pending: pending };
  };
  QuestionSet.prototype.progress = function () {
    var self = this, done = 0, ok = 0;
    this.items.forEach(function (it) { var r = self.state.res[it.q.id]; if (r) { done++; if (r.level === 'ok' || r.level === 'info') ok++; } });
    return { done: done, ok: ok, total: this.items.length };
  };

  /* ---------------------------------------------------------
     6. Navigation
     --------------------------------------------------------- */
  function navHtml() {
    var h = '<h4>Commencer</h4>' +
      link('#/', '🏠', 'Accueil') +
      '<h4>Le cours</h4>';
    C.cours.forEach(function (ch) {
      var r = Store.get('chap.' + ch.id + '.res', null);
      var done = r && Object.keys(r).length >= (ch.quiz || []).length && (ch.quiz || []).length;
      h += '<a href="#/cours/' + ch.id + '"><span class="num">' + ch.num + '</span>' + esc(ch.short || ch.titre) + (done ? '<span class="done-dot">●</span>' : '') + '</a>';
    });
    h += '<h4>S\'entraîner</h4>' +
      link('#/methode', '⭐', 'La méthode') +
      link('#/exercices', '🏋️', 'Exercices corrigés') +
      link('#/quiz', '🧠', 'Quiz : ai-je compris ?') +
      link('#/bac-a-sable', '🧪', 'Bac à sable SQL') +
      '<h4>Les TP</h4>' +
      link('#/tp1', '💄', 'TP1 — Sephora') +
      link('#/tp2', '🛡️', 'TP2 — Astérix') +
      '<h4>Évaluations</h4>' +
      link('#/eval-ecrit', '📝', 'Écrit sur table') +
      link('#/eval-tp', '💻', 'TP sur ordinateur') +
      '<h4>Outils</h4>' +
      link('#/memo', '📌', 'Fiche mémo') +
      link('#/notes', '📊', 'Mes notes');
    return h;
    function link(href, ico, txt) { return '<a href="' + href + '"><span class="num">' + ico + '</span>' + txt + '</a>'; }
  }
  function refreshNav() {
    $('#sidebar').innerHTML = navHtml();
    var hash = location.hash || '#/';
    $$('#sidebar a').forEach(function (a) {
      var h = a.getAttribute('href');
      a.classList.toggle('active', h === hash || (h !== '#/' && hash.indexOf(h + '/') === 0));
    });
  }

  var routes = [];
  function route(re, fn) { routes.push([re, fn]); }
  function render() {
    var hash = location.hash.replace(/^#/, '') || '/';
    var main = $('#main');
    if (window.__cleanup) { window.__cleanup(); window.__cleanup = null; }
    for (var i = 0; i < routes.length; i++) {
      var m = hash.match(routes[i][0]);
      if (m) { main.innerHTML = ''; routes[i][1](main, m); break; }
    }
    if (i === routes.length) main.innerHTML = '<h1>Page introuvable</h1><p><a href="#/">Retour à l\'accueil</a></p>';
    refreshNav();
    closeMenu();
    window.scrollTo(0, 0);
    var t = main.querySelector('h1'); document.title = (t ? t.textContent + ' — ' : '') + 'SQL pas à pas';
  }
  function closeMenu() { $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
  $('#menuBtn').addEventListener('click', function () {
    var open = !$('#sidebar').classList.contains('open');
    $('#sidebar').classList.toggle('open', open); $('#overlay').classList.toggle('show', open);
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  });
  $('#overlay').addEventListener('click', closeMenu);
  window.addEventListener('hashchange', render);

  /* ---------------------------------------------------------
     7. Pages
     --------------------------------------------------------- */
  route(/^\/$/, function (main) {
    var nChap = C.cours.length;
    var chapDone = C.cours.filter(function (ch) { var r = Store.get('chap.' + ch.id + '.res', null); return r && Object.keys(r).length; }).length;
    var exDone = 0, exTot = 0;
    C.exercices.forEach(function (lv) { exTot += lv.items.length; var r = Store.get('ex.' + lv.id + '.res', {}) || {}; exDone += Object.keys(r).filter(function (k) { return r[k].level === 'ok' || r[k].level === 'info'; }).length; });
    main.innerHTML =
      '<section class="hero"><div class="kicker" style="color:#f3c7de">Licence 1 · Informatique</div>' +
      '<h1>Le SQL expliqué simplement</h1>' +
      '<p>Un cours pour les grands débutants : des phrases courtes, un exemple pour chaque idée, et des requêtes que tu peux exécuter <b>directement ici</b>, sur la vraie base Sephora.</p>' +
      '<div class="btn-row"><a class="btn" href="#/cours/' + C.cours[0].id + '">Commencer le cours →</a><a class="btn ghost" style="color:#fff;border-color:#fff" href="#/bac-a-sable">Ouvrir le bac à sable</a></div>' +
      '<pre>SELECT name, price\nFROM Sephora\nWHERE brand = \'Dior\'\nORDER BY price DESC;</pre></section>' +
      '<h2 style="border:0;margin-top:0">Ton parcours</h2>' +
      '<div class="grid">' +
      card('#/cours/' + C.cours[0].id, '📘', 'Le cours', nChap + ' chapitres très simples, avec un petit quiz à la fin de chacun.', chapDone + ' / ' + nChap + ' chapitres vérifiés') +
      card('#/methode', '⭐', 'La méthode', 'Les 6 questions à se poser pour écrire n\'importe quelle requête.', 'à lire avant les exercices') +
      card('#/exercices', '🏋️', 'Exercices', 'Du plus facile au plus difficile, corrigés automatiquement.', exDone + ' / ' + exTot + ' réussis') +
      card('#/quiz', '🧠', 'Ai-je compris ?', 'Un quiz noté sur 20 : QCM, requêtes et questions ouvertes.', noteTxt('quiz')) +
      card('#/tp1', '💄', 'TP1 — Sephora', 'Toutes les requêtes du TP, expliquées une par une, à essayer.', 'avec les vrais résultats') +
      card('#/tp2', '🛡️', 'TP2 — Astérix', 'Les requêtes du TP2 expliquées simplement.', 'gaulois, villages, potions') +
      card('#/eval-ecrit', '📝', 'Évaluation écrite', '1 heure, comme sur table. Correction et note sur 20.', noteTxt('ecrit')) +
      card('#/eval-tp', '💻', 'Évaluation TP', '1 heure sur ordinateur, requêtes corrigées automatiquement.', noteTxt('tp')) +
      card('#/memo', '📄', 'Fiche mémo à imprimer', 'Une feuille A4 recto, pliée en deux : tout ce qu\'il faut retenir pour l\'évaluation.', 'PDF à télécharger') +
      '</div>' +
      H.box('idee', 'Comment utiliser ce site', '<ul><li>Lis <b>un chapitre à la fois</b>, puis réponds au petit quiz en bas de la page.</li><li>Les cadres noirs avec un bouton <b>▶ Exécuter</b> sont de vraies requêtes : modifie-les, essaie, trompe-toi, tu ne peux rien casser.</li><li>Tes réponses et tes notes sont <b>gardées dans ton navigateur</b> (sur cet ordinateur). Tu les retrouves dans <a href="#/notes">Mes notes</a>.</li></ul>');
    function card(href, ico, t, p, meta) { return '<a class="card" href="' + href + '"><div class="ico">' + ico + '</div><h3>' + t + '</h3><p>' + p + '</p><div class="meta">' + meta + '</div></a>'; }
    function noteTxt(id) { var s = Store.get('eval.' + id, null); return s && s.submitted ? 'Ta note : <b>' + fmtPts(s.score) + ' / ' + s.max + '</b>' : 'pas encore fait'; }
  });

  /* --- chapitres --- */
  route(/^\/cours\/([\w-]+)$/, function (main, m) {
    var idx = C.cours.findIndex(function (c) { return c.id === m[1]; });
    if (idx < 0) { main.innerHTML = '<h1>Chapitre introuvable</h1>'; return; }
    var ch = C.cours[idx], prev = C.cours[idx - 1], next = C.cours[idx + 1];
    main.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a> › Le cours</div>' +
      '<div class="kicker">' + (ch.num === '0' ? 'Avant de commencer' : 'Chapitre ' + ch.num) + '</div>' +
      '<h1>' + ch.titre + '</h1>' + (ch.lead ? '<p class="lead">' + ch.lead + '</p>' : '') +
      '<div class="content">' + ch.html + '</div>' +
      (ch.quiz && ch.quiz.length ? '<h2>✅ Vérifie que tu as compris</h2><p>Réponds aux questions : la correction s\'affiche tout de suite.</p><div id="chapQuiz"></div><div id="chapScore"></div>' : '') +
      '<div class="pager">' + (prev ? '<a href="#/cours/' + prev.id + '"><small>← Précédent</small>' + esc(prev.short || prev.titre) + '</a>' : '<span></span>') +
      (next ? '<a class="next" href="#/cours/' + next.id + '"><small>Suivant →</small>' + esc(next.short || next.titre) + '</a>' : '<a class="next" href="#/methode"><small>Suivant →</small>La méthode</a>') + '</div>';
    hydrate($('.content', main));
    if (ch.quiz && ch.quiz.length) {
      var qs = new QuestionSet($('#chapQuiz'), ch.quiz, 'chap.' + ch.id, 'practice');
      var upd = function () {
        var p = qs.progress();
        $('#chapScore').innerHTML = p.done ? '<div class="feedback ' + (p.ok === p.total ? 'ok' : 'info') + '">Tu as répondu à ' + p.done + ' question(s) sur ' + p.total + ', dont ' + p.ok + ' réussie(s).' + (p.ok === p.total ? ' Bravo, tu peux passer au chapitre suivant !' : '') + '</div>' : '';
        refreshNav();
      };
      qs.onChange = upd; upd();
    }
  });

  route(/^\/cours$/, function () { location.hash = '#/cours/' + C.cours[0].id; });

  /* --- méthode, mémo : pages simples --- */
  route(/^\/methode$/, function (main) { main.innerHTML = C.pages.methode; hydrate(main); });
  route(/^\/memo$/, function (main) { main.innerHTML = C.pages.memo; hydrate(main); });

  /* --- TP --- */
  function tpPage(main, tp) {
    var h = '<div class="crumbs"><a href="#/">Accueil</a> › Les TP</div><div class="kicker">' + tp.kicker + '</div><h1>' + tp.titre + '</h1>' + tp.intro;
    tp.items.forEach(function (it, i) {
      h += '<div class="q" id="tp-' + (i + 1) + '"><div class="q-head"><span class="q-num">' + esc(it.n) + '</span><span class="q-title">' + it.titre + '</span>' +
        (it.res ? '<span class="q-pts">' + it.res + '</span>' : '') + '</div><div class="q-body">' +
        (it.db ? '<div class="tp-ed" data-i="' + i + '"></div>' : H.code(it.sql)) + it.expl + '</div></div>';
    });
    h += tp.fin || '';
    main.innerHTML = h;
    $$('.tp-ed', main).forEach(function (d) {
      var it = tp.items[Number(d.dataset.i)];
      var ed = makeEditor({ db: it.db, sql: it.sql, label: 'Requête du TP' });
      d.replaceWith(ed.el);
    });
    hydrate(main);
  }
  route(/^\/tp1$/, function (main) { tpPage(main, C.tp.tp1); });
  route(/^\/tp2$/, function (main) { tpPage(main, C.tp.tp2); });

  /* --- exercices --- */
  route(/^\/exercices$/, function (main) {
    var h = '<div class="crumbs"><a href="#/">Accueil</a> › S\'entraîner</div><div class="kicker">S\'entraîner</div><h1>Exercices corrigés</h1>' +
      '<p class="lead">Les exercices vont du plus facile au plus difficile. Chaque réponse est corrigée automatiquement : tu sais tout de suite si c\'est juste.</p>' +
      H.box('astuce', 'Pour chaque exercice', '<ol><li>Lis la question.</li><li>Si tu bloques, ouvre <b>« Comment réfléchir ? »</b>.</li><li>Écris ta requête et clique sur <b>▶ Exécuter</b> pour voir le résultat.</li><li>Clique sur <b>✔ Vérifier</b> : le site te dit si c\'est juste.</li><li>Seulement après, regarde la réponse.</li></ol>') +
      '<div class="grid">';
    C.exercices.forEach(function (lv) {
      var r = Store.get('ex.' + lv.id + '.res', {}) || {};
      var ok = Object.keys(r).filter(function (k) { return r[k].level === 'ok' || r[k].level === 'info'; }).length;
      h += '<a class="card" href="#/exercices/' + lv.id + '"><div class="ico">' + lv.ico + '</div><h3>' + lv.titre + '</h3><p>' + lv.sous + '</p>' +
        '<div class="meta"><div class="progress"><span style="width:' + Math.round(100 * ok / lv.items.length) + '%"></span></div>' + ok + ' / ' + lv.items.length + ' réussis</div></a>';
    });
    main.innerHTML = h + '</div>';
  });
  route(/^\/exercices\/([\w-]+)$/, function (main, m) {
    var i = C.exercices.findIndex(function (l) { return l.id === m[1]; });
    if (i < 0) { main.innerHTML = '<h1>Niveau introuvable</h1>'; return; }
    var lv = C.exercices[i], prev = C.exercices[i - 1], next = C.exercices[i + 1];
    main.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a> › <a href="#/exercices">Exercices</a></div><div class="kicker">' + lv.ico + ' ' + lv.niveau + '</div><h1>' + lv.titre + '</h1>' +
      '<div class="levels">' + C.exercices.map(function (l) { return '<a class="pill' + (l.id === lv.id ? ' plum' : '') + '" href="#/exercices/' + l.id + '">' + l.niveau + '</a>'; }).join('') + '</div>' +
      (lv.intro || '') + '<div id="exList"></div><div id="exScore"></div>' +
      '<div class="pager">' + (prev ? '<a href="#/exercices/' + prev.id + '"><small>← Niveau précédent</small>' + prev.titre + '</a>' : '<span></span>') +
      (next ? '<a class="next" href="#/exercices/' + next.id + '"><small>Niveau suivant →</small>' + next.titre + '</a>' : '<a class="next" href="#/quiz"><small>Ensuite →</small>Quiz : ai-je compris ?</a>') + '</div>';
    var qs = new QuestionSet($('#exList'), lv.items, 'ex.' + lv.id, 'practice');
    var upd = function () { var p = qs.progress(); $('#exScore').innerHTML = '<div class="feedback ' + (p.ok === p.total ? 'ok' : 'info') + '">Réussis : ' + p.ok + ' / ' + p.total + (p.ok === p.total ? ' — bravo, niveau terminé !' : '') + '</div>'; };
    qs.onChange = upd; upd();
  });

  /* --- bac à sable --- */
  route(/^\/bac-a-sable$/, function (main) {
    main.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a> › S\'entraîner</div><div class="kicker">Bac à sable</div><h1>Bac à sable SQL</h1>' +
      '<p class="lead">Écris toutes les requêtes que tu veux. Choisis la base dans la liste en haut de l\'éditeur.</p><div id="sb"></div>' +
      '<h2>Les colonnes des tables</h2><div id="schema"></div>' +
      '<h2>Idées de requêtes à essayer</h2><div id="ideas" class="btn-row"></div>';
    var last = Store.get('sandbox', { db: 'sephora', sql: 'SELECT name, brand, price\nFROM Sephora\nWHERE brand = \'Dior\'\nORDER BY price DESC\nLIMIT 10;' });
    var ed = makeEditor({ db: last.db, sql: last.sql, dbSelect: true, label: 'Bac à sable', reset: false,
      onInput: function (v) { Store.set('sandbox', { db: ed.getDb(), sql: v }); },
      onDb: function (d) { Store.set('sandbox', { db: d, sql: ed.getValue() }); showSchema(d); } });
    $('#sb').appendChild(ed.el);
    function showSchema(d) {
      var cols = d === 'sephora' ? C.schemaSephora : C.schemaMini;
      $('#schema').innerHTML = '<p>Base choisie : <b>' + DBS[d].label + '</b> — la table s\'appelle <code>Sephora</code>.</p>' + H.table(['Colonne', 'Ce qu\'elle contient', 'Exemple'], cols, 'compact schema') +
        (d === 'sephora' ? '' : H.table(['name', 'brand', 'category', 'price', 'love'], DBS[d].rows, 'compact'));
    }
    showSchema(last.db);
    C.ideas.forEach(function (idea) {
      var b = document.createElement('button'); b.className = 'btn soft small'; b.textContent = idea[0];
      b.addEventListener('click', function () { ed.setValue(idea[1]); Store.set('sandbox', { db: ed.getDb(), sql: idea[1] }); ed.run(); });
      $('#ideas').appendChild(b);
    });
  });

  /* --- évaluations et quiz noté --- */
  function evalPage(main, def) {
    var ns = 'eval.' + def.id;
    var st = Store.get(ns, {}) || {};
    var started = !!st.startedAt;
    var head = '<div class="crumbs"><a href="#/">Accueil</a> › ' + def.rubrique + '</div><div class="kicker">' + def.kicker + '</div><h1>' + def.titre + '</h1>' + def.intro;
    if (!started) {
      main.innerHTML = head +
        '<h2>Avant de commencer</h2><div class="ident"><div><label>Nom</label><input id="nom" value="' + esc(Store.get('ident.nom', '')) + '"></div><div><label>Prénom</label><input id="prenom" value="' + esc(Store.get('ident.prenom', '')) + '"></div></div>' +
        '<div class="btn-row" style="margin-top:16px"><button class="btn" id="startBtn">Commencer' + (def.duree ? ' (le chrono de ' + def.duree + ' min démarre)' : '') + '</button></div>' +
        (def.corrigeLibre ? '<p class="expected" style="margin-top:20px">Enseignant : <a href="#" id="teacher">voir le sujet et le corrigé sans composer</a>.</p>' : '');
      $('#startBtn').addEventListener('click', function () {
        Store.set('ident.nom', $('#nom').value.trim()); Store.set('ident.prenom', $('#prenom').value.trim());
        st.startedAt = new Date().toISOString(); Store.set(ns, st); render();
      });
      var t = $('#teacher');
      if (t) t.addEventListener('click', function (e) { e.preventDefault(); teacherView(main, def); });
      return;
    }
    main.innerHTML = head +
      '<div class="eval-bar no-print"><span>👤 ' + esc((Store.get('ident.prenom', '') + ' ' + Store.get('ident.nom', '')).trim() || 'Élève') + '</span>' +
      (def.duree ? '<span class="timer" id="timer"></span>' : '') + '<span class="grow"></span><span id="liveScore"></span>' +
      '<button class="btn" id="submitBtn">Rendre ma copie</button></div>' +
      (def.preface || '') + '<div id="sections"></div><div id="final"></div>';
    var sets = [];
    def.sections.forEach(function (sec, si) {
      var wrap = document.createElement('section');
      var secPts = sec.questions.reduce(function (s, q) { return s + (q.pts || 1); }, 0);
      wrap.innerHTML = '<h2>' + sec.titre + ' <span class="pill plum">' + fmtPts(secPts) + ' pts</span></h2>' + (sec.intro || '') + '<div class="qs"></div>';
      $('#sections').appendChild(wrap);
      var qsNs = ns + '.s' + si;
      var qs = Object.create(QuestionSet.prototype);
      qs.opts = { noRun: def.noRun };
      QuestionSet.call(qs, $('.qs', wrap), sec.questions, qsNs, 'exam', { noRun: def.noRun });
      sets.push(qs);
    });
    // chrono
    if (def.duree) {
      var end = new Date(st.startedAt).getTime() + def.duree * 60000;
      var tick = function () {
        var el = $('#timer'); if (!el) return;
        var s = Math.round((end - Date.now()) / 1000);
        if (st.submitted) { el.textContent = '⏱ copie rendue'; return; }
        if (s <= 0) { el.textContent = '⏱ temps écoulé'; el.classList.add('late'); return; }
        el.textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      };
      tick(); var iv = setInterval(tick, 1000);
      window.__cleanup = function () { clearInterval(iv); };
    }
    function total() {
      var t = 0, mx = 0, pend = 0;
      sets.forEach(function (s) { var r = s.updateScore(true); t += r.total; mx += r.max; pend += r.pending; });
      t = Math.round(t * 100) / 100;
      return { total: t, max: mx, pending: pend };
    }
    function showFinal() {
      var r = total();
      var on20 = r.max ? Math.round(r.total / r.max * 20 * 100) / 100 : 0;
      st = Store.get(ns, {}); st.score = r.total; st.max = r.max; st.pending = r.pending; st.submitted = true;
      if (!st.submittedAt) st.submittedAt = new Date().toISOString();
      Store.set(ns, st);
      $('#liveScore').innerHTML = '<b>' + fmtPts(r.total) + ' / ' + r.max + '</b>';
      $('#submitBtn').hidden = true;
      $('#final').innerHTML = '<div class="score-card"><div>Ta note</div><div class="big">' + fmtPts(r.total) + ' <small>/ ' + r.max + '</small></div>' +
        (r.max !== 20 ? '<p>soit ' + fmtPts(on20) + ' / 20</p>' : '') +
        (r.pending ? '<p>⚠️ Il reste <b>' + r.pending + '</b> question(s) à auto-évaluer : compare ta réponse avec la réponse modèle et clique sur ✗, ≈ ou ✓. La note se met à jour.</p>' : '<p>Note définitive. Relis bien le corrigé sous chaque question.</p>') +
        '<div class="btn-row"><button class="btn small" id="dl">⬇ Télécharger ma copie</button><button class="btn small" id="pr">🖨 Imprimer</button><button class="btn small" id="again">↺ Recommencer</button></div></div>';
      $('#dl').addEventListener('click', function () { downloadCopy(def, sets, r); });
      $('#pr').addEventListener('click', function () { window.print(); });
      $('#again').addEventListener('click', function () {
        if (!confirm('Effacer tes réponses et recommencer cette évaluation ?')) return;
        Store.del(ns); render();
      });
    }
    sets.forEach(function (s) { s.onScore = function () { if (st.submitted || Store.get(ns + '.submitted')) showFinal(); }; });
    $('#submitBtn').addEventListener('click', function () {
      if (!confirm('Rendre ta copie ? Tu ne pourras plus modifier tes réponses.')) return;
      st.submitted = true; Store.set(ns + '.submitted', true);
      Engine.ready.then(function () { sets.forEach(function (s) { s.gradeAll(false, true); }); showFinal(); window.scrollTo(0, document.body.scrollHeight); });
    });
    if (st.submitted) Engine.ready.then(function () { sets.forEach(function (s) { s.gradeAll(true, true); }); showFinal(); });
  }

  function teacherView(main, def) {
    var h = '<div class="crumbs"><a href="#/">Accueil</a> › ' + def.rubrique + '</div><div class="kicker">Vue enseignant</div><h1>' + def.titre + ' — sujet et corrigé</h1>' +
      '<p class="no-print"><a href="#" id="back">← Revenir</a> · <a href="#" id="print">🖨 Imprimer</a></p>' + def.intro + (def.preface || '');
    def.sections.forEach(function (sec) {
      h += '<h2>' + sec.titre + '</h2>' + (sec.intro || '');
      sec.questions.forEach(function (q, i) {
        h += '<div class="q"><div class="q-head"><span class="q-num">' + esc(q.num || i + 1) + '</span>' + (q.title ? '<span class="q-title">' + q.title + '</span>' : '') + '<span class="q-pts">' + fmtPts(q.pts || 1) + ' pt</span></div><div class="q-body">' + (q.q || '');
        if (q.type === 'qcm') h += '<ol type="a">' + q.options.map(function (o, k) { return '<li' + (k === q.answer ? ' style="font-weight:700;color:var(--teal)"' : '') + '>' + o + (k === q.answer ? ' ✓' : '') + '</li>'; }).join('') + '</ol>' + (q.explain ? '<p class="expected">' + q.explain + '</p>' : '');
        else if (q.type === 'fix') h += H.code(q.wrong) + '<div class="model"><div class="model-title">Corrigé</div><p>' + q.model + '</p>' + H.code(q.solution) + '</div>';
        else if (q.type === 'open') h += '<div class="model"><div class="model-title">Réponse modèle</div>' + q.model + '</div>';
        else if (q.type === 'hand') h += '<div class="model"><div class="model-title">Résultat attendu</div>' + (q.model || '') + '</div>';
        else h += '<div class="model"><div class="model-title">Corrigé</div>' + H.code(q.solution) + (q.expected ? '<p class="expected">🎯 ' + q.expected + '</p>' : '') + (q.explain ? '<p>' + q.explain + '</p>' : '') + '</div>';
        h += '</div></div>';
      });
    });
    h += def.bareme || '';
    main.innerHTML = h;
    $('#back').addEventListener('click', function (e) { e.preventDefault(); render(); });
    $('#print').addEventListener('click', function (e) { e.preventDefault(); window.print(); });
  }

  function plainHtml(html) { var d = document.createElement('div'); d.innerHTML = html || ''; return d.textContent.replace(/\s+\n/g, '\n').trim(); }
  function downloadCopy(def, sets, r) {
    var who = (Store.get('ident.prenom', '') + ' ' + Store.get('ident.nom', '')).trim() || 'Élève';
    var L = [];
    L.push(def.titre.replace(/<[^>]+>/g, ''));
    L.push('Élève : ' + who);
    L.push('Date : ' + new Date().toLocaleString('fr-FR'));
    L.push('Note : ' + fmtPts(r.total) + ' / ' + r.max + (r.pending ? ' (provisoire : ' + r.pending + ' auto-évaluation(s) manquante(s))' : ''));
    L.push('='.repeat(60));
    def.sections.forEach(function (sec, si) {
      var qs = sets[si];
      L.push(''); L.push(plainHtml(sec.titre)); L.push('-'.repeat(60));
      qs.items.forEach(function (it) {
        var q = it.q, a = qs.state.answers[q.id], ev = it.ev || qs.evaluate(it);
        L.push(''); L.push('Question ' + (q.num || '') + ' (' + fmtPts(qs.points(it, ev)) + ' / ' + fmtPts(q.pts || 1) + ' pt)');
        L.push(plainHtml(q.q));
        if (q.type === 'qcm') L.push('Ma réponse : ' + (a == null ? '—' : plainHtml(q.options[a])) + '   |   Bonne réponse : ' + plainHtml(q.options[q.answer]));
        else if (q.type === 'fix') { L.push('Mon explication : ' + ((a && a.expl) || '—')); L.push('Ma correction :\n' + ((a && a.sql) || '—')); L.push('Corrigé :\n' + q.solution); }
        else if (q.type === 'sql') { L.push('Ma requête :\n' + (a || '—')); if (ev.stu && ev.stu.ok) L.push('Mon résultat : ' + ev.stu.values.length + ' ligne(s)'); L.push('Corrigé :\n' + q.solution); }
        else { L.push('Ma réponse : ' + (a || '—')); if (q.model) L.push('Réponse modèle : ' + plainHtml(q.model)); }
        if (ev.msg) L.push('→ ' + ev.msg);
      });
    });
    var blob = new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (who.replace(/\s+/g, '_') || 'eleve') + '_' + def.id + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
  }

  route(/^\/eval-ecrit$/, function (main) { evalPage(main, C.evals.ecrit); });
  route(/^\/eval-tp$/, function (main) { evalPage(main, C.evals.tp); });
  route(/^\/quiz$/, function (main) { evalPage(main, C.evals.quiz); });

  /* --- mes notes --- */
  route(/^\/notes$/, function (main) {
    var rows = [];
    ['quiz', 'ecrit', 'tp'].forEach(function (id) {
      var d = C.evals[id], s = Store.get('eval.' + id, null);
      rows.push(['<a href="#/' + (id === 'quiz' ? 'quiz' : 'eval-' + id) + '">' + d.court + '</a>',
        s && s.submitted ? '<b>' + fmtPts(s.score) + ' / ' + s.max + '</b>' + (s.pending ? ' <span class="pill amber">provisoire</span>' : '') : '<span class="null">pas encore rendu</span>',
        s && s.submittedAt ? new Date(s.submittedAt).toLocaleString('fr-FR') : '—']);
    });
    var chapRows = C.cours.filter(function (c) { return c.quiz && c.quiz.length; }).map(function (ch) {
      var r = Store.get('chap.' + ch.id + '.res', {}) || {};
      var ok = Object.keys(r).filter(function (k) { return r[k].level === 'ok' || r[k].level === 'info'; }).length;
      return ['<a href="#/cours/' + ch.id + '">' + ch.num + '. ' + esc(ch.short || ch.titre) + '</a>', ok + ' / ' + ch.quiz.length, Object.keys(r).length ? (ok === ch.quiz.length ? '<span class="ok">✓</span>' : '…') : '—'];
    });
    var exRows = C.exercices.map(function (lv) {
      var r = Store.get('ex.' + lv.id + '.res', {}) || {};
      var ok = Object.keys(r).filter(function (k) { return r[k].level === 'ok' || r[k].level === 'info'; }).length;
      return ['<a href="#/exercices/' + lv.id + '">' + lv.niveau + ' — ' + lv.titre + '</a>', ok + ' / ' + lv.items.length, '<div class="progress" style="min-width:120px"><span style="width:' + Math.round(100 * ok / lv.items.length) + '%"></span></div>'];
    });
    main.innerHTML = '<div class="kicker">Outils</div><h1>Mes notes et ma progression</h1>' +
      '<div class="ident"><div><label>Nom</label><input id="nom" value="' + esc(Store.get('ident.nom', '')) + '"></div><div><label>Prénom</label><input id="prenom" value="' + esc(Store.get('ident.prenom', '')) + '"></div></div>' +
      '<h2>Évaluations notées</h2>' + H.table(['Évaluation', 'Note', 'Rendue le'], rows) +
      '<h2>Quiz des chapitres</h2>' + H.table(['Chapitre', 'Réussies', ''], chapRows, 'compact') +
      '<h2>Exercices</h2>' + H.table(['Niveau', 'Réussis', 'Progression'], exRows, 'compact') +
      '<div class="btn-row no-print" style="margin-top:20px"><button class="btn" id="dlAll">⬇ Télécharger mon relevé</button><button class="btn soft" id="prAll">🖨 Imprimer</button><button class="btn ghost" id="reset">🗑 Tout effacer</button></div>' +
      H.box('idee', 'Où sont gardées mes réponses ?', '<p>Elles sont enregistrées <b>dans ce navigateur, sur cet ordinateur</b>. Elles ne sont envoyées nulle part. Si tu changes d\'ordinateur ou si tu effaces l\'historique, elles disparaissent : télécharge ton relevé pour le garder ou l\'envoyer à ton professeur.</p>');
    ['nom', 'prenom'].forEach(function (k) { $('#' + k).addEventListener('input', function (e) { Store.set('ident.' + k, e.target.value.trim()); }); });
    $('#prAll').addEventListener('click', function () { window.print(); });
    $('#reset').addEventListener('click', function () { if (confirm('Effacer toutes tes réponses, notes et progression ?')) { Store.data = {}; Store.save(); render(); } });
    $('#dlAll').addEventListener('click', function () {
      var L = ['Relevé — SQL pas à pas', 'Élève : ' + ((Store.get('ident.prenom', '') + ' ' + Store.get('ident.nom', '')).trim() || '—'), 'Date : ' + new Date().toLocaleString('fr-FR'), ''];
      L.push('ÉVALUATIONS'); rows.forEach(function (r) { L.push('- ' + plainHtml(r[0]) + ' : ' + plainHtml(r[1]) + ' (' + r[2] + ')'); });
      L.push('', 'QUIZ DES CHAPITRES'); chapRows.forEach(function (r) { L.push('- ' + plainHtml(r[0]) + ' : ' + r[1]); });
      L.push('', 'EXERCICES'); exRows.forEach(function (r) { L.push('- ' + plainHtml(r[0]) + ' : ' + r[1]); });
      var blob = new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'releve_sql.txt'; document.body.appendChild(a); a.click(); a.remove();
    });
  });

  /* démarrage */
  window.SQL1_APP = { runSQL: runSQL, gradeSQL: gradeSQL, gradeHand: gradeHand, Engine: Engine, Store: Store };
  render();
})();
