/* Petits outils partagés par le contenu et l'application. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var KW = ['SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
    'IS', 'NULL', 'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'GROUP', 'HAVING', 'AS', 'EXISTS',
    'WITH', 'OVER', 'PARTITION', 'ON', 'JOIN', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];
  var FN = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'RANK', 'DENSE_RANK', 'ROW_NUMBER', 'UPPER', 'LOWER', 'LENGTH'];
  var kwRe = new RegExp('\\b(' + KW.join('|') + ')\\b', 'gi');
  var fnRe = new RegExp('\\b(' + FN.join('|') + ')\\b(?=\\s*\\()', 'gi');

  /* Coloration syntaxique très simple (sortie HTML). */
  function highlight(sql) {
    var out = '';
    var re = /('(?:[^']|'')*'?)|([‘’][^‘’]*[‘’]?)|(--[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;
    var m;
    while ((m = re.exec(sql)) !== null) {
      if (m[1]) out += '<span class="t-str">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="t-bad" title="Apostrophes penchées : remplace-les par des apostrophes droites \'">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="t-com">' + esc(m[3]) + '</span>';
      else if (m[4]) out += '<span class="t-num">' + esc(m[4]) + '</span>';
      else if (m[5]) {
        var w = m[5], up = w.toUpperCase();
        if (FN.indexOf(up) >= 0 && /^\s*\(/.test(sql.slice(re.lastIndex))) out += '<span class="t-fn">' + esc(w) + '</span>';
        else if (KW.indexOf(up) >= 0) out += '<span class="t-kw">' + esc(w) + '</span>';
        else out += esc(w);
      } else out += esc(m[6]);
    }
    return out;
  }

  /* Aides pour écrire le contenu. */
  var H = {
    esc: esc,
    /* bloc de code SQL affiché (non exécutable) */
    code: function (sql) { return '<pre class="code"><code>' + highlight(sql.trim()) + '</code></pre>'; },
    /* bloc « Essaie ! » : éditeur exécutable */
    try: function (db, sql, label) {
      return '<div class="try" data-db="' + db + '" data-sql="' + encodeURIComponent(sql.trim()) + '"' +
        (label ? ' data-label="' + esc(label) + '"' : '') + '></div>';
    },
    /* encadrés */
    box: function (kind, title, html) {
      var icons = { idee: '💡', piege: '⚠️', retenir: '📌', image: '🖼️', astuce: '🔎' };
      return '<div class="box box-' + kind + '"><div class="box-title">' + (icons[kind] || '') + ' ' + title + '</div>' + html + '</div>';
    },
    /* tableau à partir d'un tableau de lignes */
    table: function (head, rows, cls) {
      var h = '<div class="tbl-wrap"><table class="tbl ' + (cls || '') + '"><thead><tr>';
      head.forEach(function (c) { h += '<th>' + c + '</th>'; });
      h += '</tr></thead><tbody>';
      rows.forEach(function (r) {
        h += '<tr>';
        r.forEach(function (c) { h += '<td>' + (c === null ? '<span class="null">NULL</span>' : c) + '</td>'; });
        h += '</tr>';
      });
      return h + '</tbody></table></div>';
    }
  };

  window.SQLH = { esc: esc, highlight: highlight };
  window.H = H;
  window.SQL1 = { cours: [], tp: {}, exercices: [], quiz: {}, evals: {} };
})();
