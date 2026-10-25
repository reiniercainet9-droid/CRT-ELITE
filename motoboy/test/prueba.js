/* Prueba de la app en un Chromium de verdad, en los dos modos:
   · WEB  → la página tal cual en el navegador
   · APK  → la misma página con un Capacitor simulado (los plugins anotan lo que se les pide)
   Uso: npm test */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const WWW = path.join(__dirname, '..', 'www');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

let ok = 0, mal = 0;
function chk(cond, msg) { if (cond) { ok++; console.log('  ✅ ' + msg); } else { mal++; console.log('  ❌ ' + msg); } }

const CAP_FALSO = `
window.__llamadas=[];window.__oyentes={};
const anota=(p,m)=>(a)=>{window.__llamadas.push({p,m,a});
  if(m==='checkPermissions'||m==='requestPermissions')return Promise.resolve({display:'granted'});
  if(m==='guardar')return Promise.resolve({descargas:'Descargas/Motoboy/'+a.nombre,compartido:true});
  return Promise.resolve({});};
const plugin=(p)=>new Proxy({}, {get:(_,m)=>{
  if(m==='addListener')return (ev,fn)=>{window.__oyentes[p+':'+ev]=fn;return Promise.resolve({remove(){}})};
  return anota(p,m);}});
window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',
  Plugins:{Moto:plugin('Moto'),App:plugin('App'),LocalNotifications:plugin('LocalNotifications')}};`;

(async () => {
  const srv = http.createServer((q, r) => {
    let f = path.join(WWW, decodeURIComponent(q.url.split('?')[0]));
    if (f.endsWith('/')) f += 'index.html';
    if (!f.startsWith(WWW) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  }).listen(0);
  const URL = 'http://127.0.0.1:' + srv.address().port + '/';
  const nav = await chromium.launch();

  for (const modo of ['WEB', 'APK']) {
    console.log('\n── ' + modo + ' ──');
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
    const pg = await ctx.newPage();
    const errores = [], fuera = [];
    pg.on('pageerror', e => errores.push(e.message));
    pg.on('request', q => { if (!q.url().startsWith(URL)) fuera.push(q.url()); });
    if (modo === 'APK') await pg.addInitScript(CAP_FALSO);
    await pg.goto(URL);
    await pg.waitForTimeout(400);

    chk(errores.length === 0, 'sin errores de JavaScript ' + (errores.join(' | ') || ''));
    chk(fuera.length === 0, 'no pide nada a internet ' + (fuera.join(' ') || ''));
    chk(await pg.evaluate(() => typeof Html5Qrcode === 'function'), 'el lector de QR va dentro de la app');

    // Registrar una entrega, un gasto y km
    await pg.click('#fabInc');
    await pg.fill('#fCliente', 'Farmacia'); await pg.fill('#fPedido', '1042, 1043'); await pg.fill('#fValor', '30');
    await pg.click('#incSave');
    await pg.click('#fabExp'); await pg.fill('#eValor', '10'); await pg.click('#expSave');
    await pg.click('#kmTab'); await pg.fill('#kmIni', '1000'); await pg.fill('#kmFin', '1045'); await pg.click('#kmSave');
    chk((await pg.textContent('#heroNet')).trim() === '20', 'neto de hoy = 30 − 10 = 20');
    chk((await pg.textContent('#heroCount')).trim() === '2', 'la ruta cuenta 2 entregas');
    chk((await pg.textContent('#stKmToday')).trim() === '45', '45 km de hoy');

    // Recarga: los datos siguen ahí
    await pg.reload(); await pg.waitForTimeout(300);
    chk((await pg.textContent('#heroNet')).trim() === '20', 'los datos sobreviven al cerrar y abrir');

    if (modo === 'WEB') {
      chk(!(await pg.isVisible('text=Recordatorio diario')), 'en la web no sale el recordatorio (es de la APK)');
      const [pop] = await Promise.all([pg.waitForEvent('popup'), (async () => {
        await pg.click('nav button[data-v="tools"]'); await pg.click('[data-rep="day"]'); })()]);
      chk(!!pop, 'web: el reporte PDF abre su ventana como antes');
      const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#btnExport')]);
      chk(/motoboy_respaldo_\d{4}-\d\d-\d\d\.json/.test(dl.suggestedFilename()), 'web: el respaldo se descarga');
      chk((await pg.textContent('#bkEstado')).includes('hoy'), 'apunta que el respaldo fue hoy');
    } else {
      chk(await pg.evaluate(() => document.documentElement.classList.contains('apk')), 'detecta que está en la APK');
      await pg.click('nav button[data-v="tools"]');
      chk(await pg.isVisible('text=Recordatorio diario'), 'APK: tarjeta de recordatorio visible');
      await pg.click('[data-rep="week"]'); await pg.waitForTimeout(100);
      let ll = await pg.evaluate(() => window.__llamadas);
      const imp = ll.find(x => x.p === 'Moto' && x.m === 'imprimir');
      chk(imp && imp.a.html.includes('Reporte Semanal') && imp.a.html.includes('Farmacia'), 'APK: el reporte va a la impresión de Android con los datos');
      await pg.click('[data-kmrep="month"]'); await pg.waitForTimeout(100);
      ll = await pg.evaluate(() => window.__llamadas);
      chk(ll.some(x => x.m === 'imprimir' && x.a.html.includes('1045')), 'APK: el reporte de km también');
      await pg.click('#btnExport'); await pg.waitForTimeout(100);
      ll = await pg.evaluate(() => window.__llamadas);
      const g = ll.find(x => x.m === 'guardar');
      chk(g && JSON.parse(g.a.contenido).entries.length === 1 && g.a.nombre.endsWith('.json'), 'APK: el respaldo se guarda entero en Descargas');
      chk((await pg.textContent('#bkEstado')).includes('hoy'), 'APK: apunta que el respaldo fue hoy');
      // recordatorio
      await pg.click('#recSeg button[data-rec="on"]'); await pg.fill('#recHora', '20:30'); await pg.click('#recGuardar');
      await pg.waitForTimeout(100);
      ll = await pg.evaluate(() => window.__llamadas);
      const sc = ll.filter(x => x.m === 'schedule').pop();
      chk(sc && sc.a.notifications[0].schedule.on.hour === 20 && sc.a.notifications[0].schedule.on.minute === 30, 'APK: recordatorio programado a las 20:30');
      // botón atrás
      const atras = () => pg.evaluate(() => window.__oyentes['App:backButton']());
      await pg.click('#fabExp'); await atras();
      chk(!(await pg.isVisible('#sheetExp.on')), 'atrás 1º cierra la ficha abierta');
      await atras();
      chk(await pg.isVisible('#v-inicio'), 'atrás 2º vuelve a Inicio');
      await atras();
      ll = await pg.evaluate(() => window.__llamadas);
      chk(ll.some(x => x.m === 'exitApp'), 'atrás 3º, ya en Inicio, sale de la app');
      chk(errores.length === 0, 'sin errores tras usarla ' + (errores.join(' | ') || ''));
    }
    // aviso de respaldo viejo en Inicio
    await pg.evaluate(() => { for (let i = 0; i < 6; i++) DB.expenses.push({ id: 'z' + i, cat: 'Gasolina', valor: 1, fecha: todayISO() });
      save(); META.lastBackup = Date.now() - 9 * 86400000; saveMeta(); renderRespaldo(); });
    await pg.click('nav button[data-v="inicio"]');
    chk(await pg.isVisible('#bkAviso'), 'avisa en Inicio si hace más de 7 días sin respaldo');
    await pg.screenshot({ path: path.join(__dirname, 'captura-' + modo.toLowerCase() + '.png') });
    await ctx.close();
  }
  await nav.close(); srv.close();
  console.log('\nCOMPROBADO: ' + ok + ' de ' + (ok + mal));
  process.exit(mal ? 1 : 0);
})();
