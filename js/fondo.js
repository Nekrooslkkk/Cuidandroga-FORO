/* CUIDANDROGA · fondo.js
   Oscuro (Dark Aero): imagen abstracta atrás, planeta verde girando, horizonte y piso de hexágonos, cintas de luz.
   Claro (Frutiger Aero): verde brillante, mallas de líneas finas como seda y gotas de agua. */
(function () {
  "use strict";
  const CD = window.CD;
  const fondo = document.getElementById("fondo");
  if (!fondo) return;

  fondo.innerHTML =
    '<div class="f-oscuro"><div class="abstracto"></div><div class="abstracto-velo"></div>' +
    '<div class="piso"></div><div class="horizonte"></div><canvas id="planeta"></canvas></div>' +
    '<div class="f-claro"><div class="cielo"></div><div class="claro-luz"></div><div class="gotas"></div></div>' +
    '<canvas id="cintas"></canvas><div class="destello"></div>';

  /* gotas de agua (solo claro) */
  const gotas = fondo.querySelector(".gotas");
  const semillas = [[6, 14, 46], [11, 22, 18], [15, 9, 12], [24, 68, 34], [31, 40, 14], [38, 82, 22], [47, 16, 26], [55, 58, 60], [61, 30, 12],
    [68, 74, 30], [74, 12, 40], [79, 47, 16], [86, 88, 20], [91, 26, 54], [95, 62, 14], [20, 90, 16], [43, 50, 10], [65, 92, 12]];
  gotas.innerHTML = semillas.map((s, i) => '<i style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + s[2] + 'px;height:' + Math.round(s[2] * 1.06) + 'px;animation-delay:-' + (i * 2.3) + 's;animation-duration:' + (14 + (i % 5) * 4) + 's"></i>').join("") +
    Array.from({ length: 40 }, (_, i) => '<b style="left:' + ((i * 37) % 100) + '%;top:' + ((i * 53) % 100) + '%;animation-delay:-' + (i * .7) + 's"></b>').join("");

  const cv = document.getElementById("cintas"), ctx = cv.getContext("2d");
  const pc = document.getElementById("planeta"), pctx = pc.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
    const R = planetaR();
    pc.width = pc.height = Math.ceil(R * 2.6 * dpr); pc.style.width = pc.style.height = Math.ceil(R * 2.6) + "px";
    pc.style.left = (W * .2 - R * 1.3) + "px"; pc.style.top = (H * .6 - R * 1.3 - R * .18) + "px";
    dibujar(performance.now(), true);
  }
  const planetaR = () => Math.max(90, Math.min(W, H) * .24);
  const oscuro = () => document.documentElement.dataset.tema === "oscuro";

  /* ---------- cintas: muchas líneas finas que forman una seda que se tuerce ---------- */
  const CINTAS = [
    { y: [.78, .52, .66, .30], esp: [.10, -.16, .14, -.08], vel: .00011, fase: 0, n: 26 },
    { y: [.40, .70, .38, .62], esp: [-.08, .12, -.12, .10], vel: .00008, fase: 2.1, n: 22 },
    { y: [.95, .80, .92, .70], esp: [.06, -.10, .08, -.12], vel: .00014, fase: 4.2, n: 18 }
  ];
  function cinta(c, t, k, colorLinea, colorBrillo, mezcla) {
    const ondas = c.y.map((y, j) => (y + Math.sin(t * c.vel * (1 + j * .35) + c.fase + j) * .06) * H);
    const esp = c.esp.map((e, j) => e * H * Math.sin(t * c.vel * 1.7 + c.fase * (j + 1)));
    const xs = [-.1 * W, .3 * W + Math.sin(t * c.vel + c.fase) * W * .08, .68 * W + Math.cos(t * c.vel * 1.2 + c.fase) * W * .08, 1.1 * W];
    ctx.globalCompositeOperation = mezcla;
    for (let i = 0; i < c.n; i++) {
      const s = i / (c.n - 1) - .5, centro = 1 - Math.abs(s) * 2;
      ctx.strokeStyle = colorLinea(.10 + centro * .32);
      ctx.lineWidth = .7 + centro * .5;
      ctx.beginPath();
      ctx.moveTo(xs[0], ondas[0] + esp[0] * s);
      ctx.bezierCurveTo(xs[1], ondas[1] + esp[1] * s, xs[2], ondas[2] + esp[2] * s, xs[3], ondas[3] + esp[3] * s);
      ctx.stroke();
    }
    /* rayo de luz que recorre la cinta */
    ctx.save();
    ctx.setLineDash([W * .12, W * 1.4]); ctx.lineDashOffset = -((t * .18 + k * 700) % (W * 1.52));
    ctx.strokeStyle = colorBrillo; ctx.lineWidth = 2.4; ctx.shadowColor = colorBrillo; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(xs[0], ondas[0]); ctx.bezierCurveTo(xs[1], ondas[1], xs[2], ondas[2], xs[3], ondas[3]); ctx.stroke();
    ctx.restore();
  }

  /* ---------- planeta ---------- */
  let proy = null, ruta = null, reticula = null;
  if (window.d3 && d3.geoOrthographic && window.TIERRA) {
    proy = d3.geoOrthographic().clipAngle(90).precision(.6);
    ruta = d3.geoPath(proy, pctx);
    reticula = d3.geoGraticule10();
  }
  function planeta(t) {
    const R = planetaR(), s = pc.width / dpr, cx = s / 2, cy = s / 2;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, s, s);
    /* halo */
    let g = pctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.3);
    g.addColorStop(0, "rgba(120,255,90,.45)"); g.addColorStop(1, "rgba(120,255,90,0)");
    pctx.fillStyle = g; pctx.beginPath(); pctx.arc(cx, cy, R * 1.3, 0, 7); pctx.fill();
    /* esfera de vidrio */
    g = pctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, "#4dff6a"); g.addColorStop(.45, "#0fa52b"); g.addColorStop(.85, "#05420f"); g.addColorStop(1, "#7dff6b");
    pctx.fillStyle = g; pctx.beginPath(); pctx.arc(cx, cy, R, 0, 7); pctx.fill();
    if (proy) {
      proy.scale(R).translate([cx, cy]).rotate([(t * .006) % 360, -14, 8]);
      pctx.beginPath(); ruta(reticula); pctx.strokeStyle = "rgba(190,255,170,.16)"; pctx.lineWidth = .7; pctx.stroke();
      pctx.beginPath(); ruta(window.TIERRA);
      g = pctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, "#eaffc8"); g.addColorStop(.4, "#8dff3a"); g.addColorStop(1, "#2fbf17");
      pctx.fillStyle = g; pctx.fill();
      pctx.strokeStyle = "rgba(235,255,210,.8)"; pctx.lineWidth = .8; pctx.stroke();
    }
    /* brillo de vidrio y borde */
    g = pctx.createRadialGradient(cx - R * .38, cy - R * .5, 0, cx - R * .38, cy - R * .5, R * .75);
    g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
    pctx.fillStyle = g; pctx.beginPath(); pctx.arc(cx, cy, R, 0, 7); pctx.fill();
    pctx.strokeStyle = "rgba(200,255,170,.9)"; pctx.lineWidth = 1.5; pctx.beginPath(); pctx.arc(cx, cy, R, 0, 7); pctx.stroke();
  }

  /* ---------- bucle ---------- */
  let ultimo = 0;
  const lento = (navigator.hardwareConcurrency || 4) <= 2;
  const intervalo = lento ? 66 : 33;
  function dibujar(t, forzar) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (oscuro()) {
      cinta(CINTAS[0], t, 0, a => "rgba(130,255,90," + a + ")", "rgba(220,255,160,.95)", "lighter");
      cinta(CINTAS[1], t, 1, a => "rgba(70,230,255," + a * .8 + ")", "rgba(170,255,255,.9)", "lighter");
      cinta(CINTAS[2], t, 2, a => "rgba(160,255,120," + a * .7 + ")", "rgba(230,255,190,.9)", "lighter");
      planeta(t);
    } else {
      cinta(CINTAS[0], t, 0, a => "rgba(255,255,255," + a * 1.1 + ")", "rgba(255,255,255,.95)", "source-over");
      cinta(CINTAS[1], t, 1, a => "rgba(10,80,20," + a * .55 + ")", "rgba(235,255,200,.9)", "source-over");
      cinta(CINTAS[2], t, 2, a => "rgba(230,255,200," + a + ")", "rgba(255,255,255,.95)", "source-over");
    }
  }
  function bucle(t) {
    requestAnimationFrame(bucle);
    if (document.hidden || CD.prefs.sobria || !CD.prefs.fondo) return;
    if (t - ultimo < intervalo) return;
    ultimo = t;
    dibujar(t);
  }
  window.addEventListener("resize", medir);
  document.addEventListener("cd-prefs", () => dibujar(performance.now(), true));
  new MutationObserver(() => dibujar(performance.now(), true)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  medir();
  requestAnimationFrame(bucle);
})();
