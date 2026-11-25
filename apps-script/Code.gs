// Pega este archivo en Extensiones > Apps Script de tu hoja de Google Sheets.
// Crea dos pestañas solas: "partidas" (una fila por partida) y "respuestas" (una fila por pregunta).

function sheet_(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var now = new Date();
    sheet_('partidas', ['fecha', 'partida', 'jugador', 'puntaje', 'aciertos', 'preguntas', 'segundos'])
      .appendRow([now, d.game, d.player, d.score, d.correct, d.total, Math.round(d.ms / 1000)]);
    var r = sheet_('respuestas', ['fecha', 'partida', 'jugador', 'pregunta', 'acierto', 'segundos']);
    (d.answers || []).forEach(function (a) {
      r.appendRow([now, d.game, d.player, a.id, a.ok ? 1 : 0, Math.round(a.ms / 100) / 10]);
    });
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
}

// Clave para ver los resultados en la página (#resultados). Cámbiala por una tuya.
var CLAVE = 'EPOC_2026';

function rows_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) return [];
  var v = sh.getDataRange().getValues();
  var h = v.shift();
  return v.map(function (r) { var o = {}; h.forEach(function (k, i) { o[k] = r[i]; }); return o; });
}

// Sin parámetros responde "activo". Con ?clave=... devuelve los datos en JSON para la página de resultados.
function doGet(e) {
  if (e && e.parameter && e.parameter.clave) {
    var out = e.parameter.clave === CLAVE ? { partidas: rows_('partidas'), respuestas: rows_('respuestas') } : { error: 'clave' };
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('activo');
}
