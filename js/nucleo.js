/* CUIDANDROGA · nucleo.js
   Estado de la demo, cuentas, roles, avatares, insignias y ventanas.
   Todo se guarda en el navegador (localStorage): es una simulación sin servidor. */
(function () {
  "use strict";
  const CD = window.CD = window.CD || {};
  const CLAVE = "cd_estado2", CLAVE_PREFS = "cd_prefs", VERSION = "s2";
  CD.AHORA = Date.now();

  /* ---------------- SHA-256 (sirve también sin https) ---------------- */
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,
    0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,
    0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,
    0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function sha256(texto) {
    const b = new TextEncoder().encode(texto), l = b.length, n = ((l + 9 + 63) >> 6);
    const w = new Uint32Array(n * 16);
    for (let i = 0; i < l; i++) w[i >> 2] |= b[i] << (24 - (i % 4) * 8);
    w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    w[n * 16 - 1] = l * 8;
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const W = new Uint32Array(64);
    const r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let q = 0; q < n; q++) {
      for (let t = 0; t < 16; t++) W[t] = w[q * 16 + t];
      for (let t = 16; t < 64; t++) {
        const s0 = r(W[t - 15], 7) ^ r(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        const s1 = r(W[t - 2], 17) ^ r(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      let [a, bb, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      [a, bb, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => ("00000000" + (v >>> 0).toString(16)).slice(-8)).join("");
  }
  CD.sha256 = sha256;
  CD.cifrar = (sal, pass) => sha256(sal + ":" + pass);
  CD.nuevaSal = () => Array.from({ length: 8 }, () => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 56)]).join("");

  /* ---------------- preferencias del navegador ---------------- */
  const PREFS_BASE = { tema: "claro", sobria: false, fondo: true, grande: false, min: {} };
  CD.prefs = Object.assign({}, PREFS_BASE);
  try { Object.assign(CD.prefs, JSON.parse(localStorage.getItem(CLAVE_PREFS) || "{}")); } catch (e) {}
  try { const t = localStorage.getItem("cd_tema"); if (t && !localStorage.getItem(CLAVE_PREFS)) CD.prefs.tema = t; } catch (e) {}
  CD.guardarPrefs = () => { try { localStorage.setItem(CLAVE_PREFS, JSON.stringify(CD.prefs)); localStorage.setItem("cd_tema", CD.prefs.tema); } catch (e) {} CD.aplicarPrefs(); };
  CD.aplicarPrefs = () => {
    const r = document.documentElement;
    r.dataset.tema = CD.prefs.tema;
    r.classList.toggle("sobria", !!CD.prefs.sobria);
    r.classList.toggle("sin-fondo", !CD.prefs.fondo);
    r.classList.toggle("grande", !!CD.prefs.grande);
    document.dispatchEvent(new Event("cd-prefs"));
  };
  CD.aplicarPrefs();

  /* ---------------- estado (cuentas, foros, notificaciones...) ---------------- */
  const copia = o => JSON.parse(JSON.stringify(o));
  function semilla() {
    const S = CD.SEMILLA, E = { v: VERSION, usuarios: {}, foros: [], likes: {}, denuncias: [], notis: {}, avisos: [],
      avisosCerrados: {}, folleto: {}, solicitudes: [], registro: [], votos: {}, sesion: null, sig: 1 };
    Object.entries(copia(S.usuarios)).forEach(([id, u]) => {
      u.id = id; u.rol = u.rol || "usuario";
      if (!u.hash) { u.sal = CD.nuevaSal(); u.hash = sha256(u.sal + Math.random()); }
      u.registro = u.registro || "2026-10-15";
      u.config = { avisarTodos: false, avisarParticipo: true, avisarLikes: true };
      E.usuarios[id] = u;
    });
    E.foros = copia(S.foros).map(f => {
      f.mensajes.forEach((m, i) => { m.id = f.id + "-" + i; });
      if (f.encuesta) f.encuesta.opciones.forEach(o => { o.votos.forEach(v => { (E.votos[f.id] = E.votos[f.id] || {})[v] = f.encuesta.opciones.indexOf(o); }); });
      return f;
    });
    S.denuncias.forEach(d => E.denuncias.push({ id: "d" + E.sig++, msg: d.foro + "-" + d.msg, foro: d.foro, por: d.por, motivo: d.motivo, min: d.min, estado: "pendiente" }));
    S.solicitudes.forEach(s => E.solicitudes.push(Object.assign({ id: "s" + E.sig++, estado: "pendiente" }, s)));
    S.registro.forEach(l => E.registro.push(Object.assign({}, l)));
    Object.entries(copia(S.notis)).forEach(([uid, lista]) => { E.notis[uid] = lista.map(n => Object.assign({ id: "n" + E.sig++ }, n)); });
    return E;
  }
  try { const g = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (g && g.v === VERSION) CD.E = g; } catch (e) {}
  if (!CD.E) CD.E = semilla();
  CD.guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(CD.E)); } catch (e) { CD.toast("No se pudo guardar: el navegador no tiene espacio."); } };
  CD.reiniciarDemo = () => { try { localStorage.removeItem(CLAVE); } catch (e) {} };
  CD.nuevoId = p => p + (CD.E.sig++);

  /* ---------------- tiempo ---------------- */
  CD.tsDe = x => x.ts || (CD.AHORA - (x.min || 0) * 60000);
  CD.hace = ts => {
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "ahora";
    const m = Math.round(s / 60); if (m < 60) return "hace " + m + " min";
    const h = Math.round(m / 60); if (h < 24) return "hace " + h + " h";
    const d = Math.round(h / 24); return d === 1 ? "hace 1 día" : "hace " + d + " días";
  };
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  CD.fecha = ts => { const d = new Date(ts); return d.getDate() + " " + MESES[d.getMonth()] + " " + d.getFullYear() + " · " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

  /* ---------------- utilidades ---------------- */
  CD.esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  CD.norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^@/, "").trim().toLowerCase();
  CD.$ = (s, r) => (r || document).querySelector(s);
  CD.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------------- usuarios y roles ---------------- */
  CD.u = id => CD.E.usuarios[id] || { id, nombre: "@desconocido", rol: "usuario", av: { t: 0, f: 0 }, perfil: { pub: {} } };
  CD.yo = () => CD.E.sesion ? CD.E.usuarios[CD.E.sesion] || null : null;
  CD.esMod = u => !!u && (u.rol === "moderador" || u.rol === "admin");
  CD.esAdmin = u => !!u && u.rol === "admin";
  CD.porNombre = nombre => Object.values(CD.E.usuarios).find(u => CD.norm(u.nombre) === CD.norm(nombre));
  CD.porCorreo = c => Object.values(CD.E.usuarios).find(u => (u.perfil.correo || "").toLowerCase() === String(c).trim().toLowerCase());
  CD.enLinea = u => u.on || (CD.E.sesion === u.id);

  CD.edadDesdeFecha = (iso, hoy) => {
    const n = new Date(iso + "T00:00:00"), h = hoy || new Date();
    let e = h.getFullYear() - n.getFullYear();
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
    return e;
  };
  CD.edad = u => {
    const p = u.perfil || {};
    if (p.edadModo === "fecha" && p.nacimiento) return CD.edadDesdeFecha(p.nacimiento);
    if (p.edad != null) return p.edad + (new Date().getFullYear() - (p.edadAnioRegistro || 2026));
    return null;
  };

  /* login: devuelve el usuario o un texto de error */
  CD.login = (nombre, pass) => {
    const u = CD.porNombre(nombre);
    if (!u || CD.cifrar(u.sal, pass) !== u.hash) return "El nombre de usuario o la contraseña no coinciden.";
    CD.E.sesion = u.id; CD.guardar(); return u;
  };
  CD.logout = () => { CD.E.sesion = null; CD.guardar(); };
  CD.claveVisto = () => CD.E.sesion || "anon";

  /* contraseña fuerte para cuentas nuevas */
  CD.reglasPass = p => [
    { ok: p.length >= 8, t: "8 caracteres o más" },
    { ok: /[A-ZÁÉÍÓÚÑ]/.test(p), t: "Una mayúscula" },
    { ok: /[a-záéíóúñ]/.test(p), t: "Una minúscula" },
    { ok: /\d/.test(p), t: "Un número" },
    { ok: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(p), t: "Un símbolo (!?#$…)" }
  ];
  CD.passFuerte = p => CD.reglasPass(p).every(r => r.ok);
  CD.nombreValido = n => /^@?[A-Za-zÁÉÍÓÚÑáéíóúñ0-9._]{3,20}$/.test(n);

  /* ---------------- notificaciones ---------------- */
  CD.notificar = (uid, n) => {
    if (!uid || !CD.E.usuarios[uid]) return;
    (CD.E.notis[uid] = CD.E.notis[uid] || []).unshift(Object.assign({ id: CD.nuevoId("n"), ts: Date.now() }, n));
  };
  CD.notificarMods = n => Object.values(CD.E.usuarios).filter(CD.esMod).forEach(u => CD.notificar(u.id, n));
  CD.anotar = (accion, motivo) => { const y = CD.yo(); CD.E.registro.unshift({ por: y ? y.id : "?", ts: Date.now(), accion, motivo: motivo || "" }); };

  /* ---------------- avatares ---------------- */
  let nAv = 0;
  CD.FORMAS_USUARIO = [0, 1, 2, 5, 6];
  CD.NOMBRES_FORMA = { 0: "Pelo corto", 1: "Pelo largo", 2: "Jockey", 5: "Moño", 6: "Rapado" };
  CD.NOMBRES_ACC = ["Nada", "Lentes", "Audífonos", "Lentes de sol"];
  CD.COLORES = [0, 20, 45, 90, 120, 145, 170, 200, 230, 260, 290, 320];
  CD.avatarAzar = () => ({ t: CD.COLORES[Math.floor(Math.random() * CD.COLORES.length)], f: CD.FORMAS_USUARIO[Math.floor(Math.random() * 5)], a: Math.floor(Math.random() * 4) });
  CD.avatar = (av) => {
    av = av || { t: 150, f: 0 };
    if (av.img) return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="' + av.img + '" width="100" height="100" preserveAspectRatio="xMidYMid slice"/></svg>';
    const t = av.t, id = "av" + (nAv++), cy = av.f === 2 ? 57 : 55;
    const hombros = '<path d="M18 104c2-20 15-31 32-31s30 11 32 31z"/>';
    const formas = {
      0: '<circle cx="50" cy="55" r="15"/><path d="M35 52c0-11 7-17 15-17s15 6 15 17c-3-5-8-8-15-8s-12 3-15 8z" opacity=".35" fill="#000"/>' + hombros,
      1: '<path d="M33 59c-2-18 6-27 17-27s19 9 17 27c0 8 3 14 7 18H26c4-4 7-10 7-18z" opacity=".5" fill="#000"/><circle cx="50" cy="55" r="14"/>' + hombros,
      2: '<circle cx="50" cy="57" r="14"/><path d="M35 52c0-10 7-15 15-15s15 5 15 15H35zM63 50h13c1 0 1 3 0 3H63z" opacity=".6" fill="#000"/>' + hombros,
      3: '<path d="M50 34l24 9v17c0 17-10 29-24 34C36 89 26 77 26 60V43z"/><path d="M40 62l7 7 14-15" fill="none" stroke="hsl(' + t + ',60%,30%)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
      4: '<circle cx="50" cy="62" r="27"/><path d="M50 43l5.6 11.4 12.6 1.8-9.1 8.9 2.2 12.5L50 71.7l-11.3 5.9 2.2-12.5-9.1-8.9 12.6-1.8z" fill="hsl(' + t + ',65%,32%)"/>',
      5: '<circle cx="50" cy="35" r="7" opacity=".45" fill="#000"/><circle cx="50" cy="55" r="15"/><path d="M35 53c0-11 7-16 15-16s15 5 15 16c-4-6-9-8-15-8s-11 2-15 8z" opacity=".4" fill="#000"/>' + hombros,
      6: '<circle cx="50" cy="55" r="15"/><path d="M35.5 51c1-9 7-14 14.5-14s13.5 5 14.5 14c-4-4-9-5-14.5-5s-10.5 1-14.5 5z" opacity=".15" fill="#000"/>' + hombros
    };
    const acc = [
      "",
      '<g fill="none" stroke="#1a2a22" stroke-width="2"><circle cx="43.5" cy="' + (cy + 1) + '" r="5"/><circle cx="56.5" cy="' + (cy + 1) + '" r="5"/><path d="M48.5 ' + (cy + 1) + 'h3"/></g>',
      '<g><path d="M33 ' + cy + 'c0-13 8-19 17-19s17 6 17 19" fill="none" stroke="#1a2a22" stroke-width="3"/><rect x="29" y="' + (cy - 4) + '" width="7" height="11" rx="3" fill="#1a2a22"/><rect x="64" y="' + (cy - 4) + '" width="7" height="11" rx="3" fill="#1a2a22"/></g>',
      '<g fill="#10161a" stroke="#10161a" stroke-width="1.5"><rect x="38" y="' + (cy - 3) + '" width="10.5" height="7" rx="3"/><rect x="51.5" y="' + (cy - 3) + '" width="10.5" height="7" rx="3"/><path d="M48 ' + (cy - 1) + 'h4" fill="none"/></g>'
    ][av.a || 0] || "";
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><radialGradient id="' + id + 'b" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="hsl(' + t + ',75%,82%)"/><stop offset=".55" stop-color="hsl(' + t + ',58%,52%)"/><stop offset="1" stop-color="hsl(' + t + ',62%,24%)"/></radialGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(' + t + ',35%,97%)"/><stop offset="1" stop-color="hsl(' + t + ',30%,74%)"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#' + id + 'b)"/><ellipse cx="50" cy="104" rx="60" ry="18" fill="#fff" opacity=".18"/>' +
      '<g fill="url(#' + id + 's)" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">' + (formas[av.f] || formas[0]) + '</g>' + acc +
      '<path d="M0 0h100v38C70 30 30 30 0 44z" fill="url(#' + id + 'r)"/></svg>';
  };
  CD.av = (u, clase) => '<span class="' + (clase || "mini-av") + '">' + CD.avatar((u || {}).av) + '</span>';

  /* imagen subida → cuadrado de 160 px */
  CD.leerFoto = file => new Promise((ok, mal) => {
    if (!file || !/^image\//.test(file.type)) return mal("Elige una imagen.");
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const s = Math.min(im.width, im.height);
      c.getContext("2d").drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 160, 160);
      ok(c.toDataURL("image/jpeg", .85)); }; im.onerror = () => mal("No pude leer la imagen."); im.src = fr.result; };
    fr.readAsDataURL(file);
  });

  /* editor de avatar (registro y configuración) */
  CD.editorAvatar = (cont, inicial, alCambiar) => {
    let av = Object.assign({}, inicial || CD.avatarAzar());
    const pintar = () => {
      cont.innerHTML =
        '<div class="ea"><div class="ea-prev">' + CD.avatar(av) + '</div><div class="ea-ops">' +
        '<div class="ea-fila"><span>Forma</span><div class="ea-btns">' + CD.FORMAS_USUARIO.map(f =>
          '<button type="button" class="ea-op' + (!av.img && av.f === f ? " sel" : "") + '" data-f="' + f + '" title="' + CD.NOMBRES_FORMA[f] + '">' + CD.avatar({ t: av.t || 150, f, a: 0 }) + '</button>').join("") + '</div></div>' +
        '<div class="ea-fila"><span>Color</span><div class="ea-btns">' + CD.COLORES.map(t =>
          '<button type="button" class="ea-color' + (!av.img && av.t === t ? " sel" : "") + '" data-t="' + t + '" style="--h:' + t + '" title="Color"></button>').join("") + '</div></div>' +
        '<div class="ea-fila"><span>Accesorio</span><div class="ea-btns">' + CD.NOMBRES_ACC.map((n, i) =>
          '<button type="button" class="ea-acc' + (!av.img && (av.a || 0) === i ? " sel" : "") + '" data-a="' + i + '">' + n + '</button>').join("") + '</div></div>' +
        '<div class="ea-fila"><span>Tu foto</span><div class="ea-btns"><label class="btn-vista">Subir foto<input type="file" accept="image/*" hidden></label>' +
        '<button type="button" class="btn-vista" data-azar>Al azar</button></div></div></div></div>';
      alCambiar && alCambiar(av);
    };
    cont.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || !cont.contains(b)) return;
      const base = av.img ? { t: 145, f: 0, a: 0 } : av;
      if (b.dataset.f) av = Object.assign({}, base, { f: +b.dataset.f });
      else if (b.dataset.t) av = Object.assign({}, base, { t: +b.dataset.t });
      else if (b.dataset.a) av = Object.assign({}, base, { a: +b.dataset.a });
      else if (b.hasAttribute("data-azar")) av = CD.avatarAzar();
      else return;
      delete av.img; pintar();
    });
    cont.addEventListener("change", e => {
      if (e.target.type !== "file") return;
      CD.leerFoto(e.target.files[0]).then(img => { av = { img }; pintar(); }).catch(m => CD.toast(m));
    });
    pintar();
    return { valor: () => av };
  };

  /* ---------------- insignias (universidad, carrera, edad, rol) ---------------- */
  CD.rolBadge = u => u.rol === "admin" ? '<span class="insignia admin">ADMINISTRADOR</span>' : u.rol === "moderador" ? '<span class="insignia mod">MOD</span>' : "";
  CD.chips = (u, verTodo) => {
    const p = u.perfil || {}, pub = p.pub || {}, out = [];
    if ((pub.estudios || verTodo) && p.estudia && CD.UNIS[p.uni]) {
      const un = CD.UNIS[p.uni], ca = CD.CARRERAS[p.carrera] || { n: "", e: "" };
      out.push('<span class="chip" tabindex="0" style="--c:' + un.col + '"><b>' + un.c + '</b><i>' + ca.e + '</i><span class="chip-txt">' + CD.esc(un.n + (ca.n ? " · " + ca.n : "")) + '</span></span>');
    } else if ((pub.estudios || verTodo) && p.trabaja && p.ocupacion) {
      out.push('<span class="chip" tabindex="0" style="--c:#3c8f5a"><i>💼</i><span class="chip-txt">' + CD.esc(p.ocupacion) + '</span></span>');
    }
    const e = CD.edad(u);
    if ((pub.edad || verTodo) && e != null) out.push('<span class="chip edad" tabindex="0" style="--c:#6b7c8f"><b>' + e + '</b><span class="chip-txt">años</span></span>');
    return out.join("");
  };
  CD.firma = u => '<span class="firma"><b class="firma-n">' + CD.esc(u.nombre) + '</b>' + CD.rolBadge(u) + CD.chips(u) + '</span>';

  /* ---------------- iconos ---------------- */
  CD.ic = {
    estrella: '<svg class="ico" viewBox="0 0 16 16"><path d="M8 1.2l2 4.3 4.7.6-3.4 3.2.9 4.6L8 11.6l-4.2 2.3.9-4.6L1.3 6.1 6 5.5z"/></svg>',
    bandera: '<svg class="ico" viewBox="0 0 16 16"><path d="M3 1v14" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M3.8 2h9l-2 3 2 3h-9z"/></svg>',
    responder: '<svg class="ico" viewBox="0 0 16 16"><path d="M6 3 1 8l5 5V10c4 0 6.5 1 9 4-1-5-3.5-8-9-8.5z"/></svg>',
    escudo: '<svg class="ico" viewBox="0 0 16 16"><path d="M8 1l6 2.2v4.1c0 3.7-2.6 6.4-6 7.7-3.4-1.3-6-4-6-7.7V3.2z"/></svg>',
    basura: '<svg class="ico" viewBox="0 0 16 16"><path d="M5 2h6v1.5h3V5H2V3.5h3zM3.5 6h9l-.8 9H4.3z"/></svg>',
    sobre: '<svg class="ico" viewBox="0 0 16 16"><path d="M1 3.5h14v9H1z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 4l6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    chincheta: '<svg class="ico" viewBox="0 0 16 16"><path d="M9.5 1l5.5 5.5-1.5 1-1.5-.5-2.5 2.5.5 3-1.5 1.5L6 11l-4 4-1-1 4-4-3-3L3.5 5.5l3 .5L9 3.5 8.5 2z"/></svg>',
    encuesta: '<svg class="ico" viewBox="0 0 16 16"><path d="M2 14V8h3v6zM6.5 14V3h3v11zM11 14V6h3v8z"/></svg>'
  };
  /* triángulo de advertencia pixelado (botón del panel) */
  CD.triangulo = (() => {
    const mapa = ["       KK       ", "      KYYK      ", "      KYYK      ", "     KYYYYK     ", "     KYYYYK     ", "    KYYKKYYK    ", "    KYYKKYYK    ",
      "   KYYYKKYYYK   ", "   KYYYKKYYYK   ", "  KYYYYKKYYYYK  ", "  KYYYYYYYYYYK  ", " KYYYYYKKYYYYYK ", " KYYYYYKKYYYYYK ", "KYYYYYYYYYYYYYYK", "KKKKKKKKKKKKKKKK"];
    let r = "";
    mapa.forEach((fila, y) => fila.split("").forEach((c, x) => { if (c !== " ") r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + (c === "K" ? "#1b1b1b" : (y < 7 ? "#ffe45c" : "#f5c400")) + '"/>'; }));
    return '<svg class="pixel" viewBox="0 0 16 15" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
  })();

  /* ---------------- ventanas modales ---------------- */
  CD.modal = (html, clase, alCerrar) => {
    const capa = document.createElement("div");
    capa.className = "capa";
    capa.innerHTML = '<div class="ventana ' + (clase || "") + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(capa);
    const v = capa.firstElementChild;
    const cerrar = () => { if (!capa.isConnected) return; capa.remove(); alCerrar && alCerrar(); };
    capa.addEventListener("click", e => { if (e.target === capa || e.target.closest("[data-cerrar]")) cerrar(); });
    v.cerrar = cerrar;
    const f = v.querySelector("input:not([type=hidden]):not([type=file]),textarea,select"); if (f) setTimeout(() => f.focus(), 60);
    return v;
  };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { const c = CD.$$(".capa").pop(); if (c && c.firstElementChild.cerrar) c.firstElementChild.cerrar(); } });
  CD.cap = (titulo, opts) => {
    opts = opts || {};
    return '<div class="cap">' + (opts.icono || "") + '<span class="cap-titulo">' + titulo + '</span><span class="cap-btns">' +
      (opts.min ? '<button type="button" class="cb min" data-min aria-label="Minimizar"></button>' : "") +
      (opts.cerrar === false ? "" : '<button type="button" class="cb cerrar" data-cerrar aria-label="Cerrar"></button>') + '</span></div>';
  };
  /* banda animada (como la parte de arriba de las ventanas de copiar archivos) */
  CD.banda = (contenido, clase) => '<div class="banda ' + (clase || "") + '"><div class="banda-lineas"></div><div class="banda-brillo"></div><div class="banda-cont">' + (contenido || "") + '</div></div>';

  CD.toast = msg => {
    let t = CD.$(".toasts"); if (!t) { t = document.createElement("div"); t.className = "toasts"; document.body.appendChild(t); }
    const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; t.appendChild(d);
    setTimeout(() => d.classList.add("fuera"), 2800); setTimeout(() => d.remove(), 3300);
  };

  /* diálogo "copiando…" de Windows para publicar, entrar o crear cuenta */
  CD.progreso = (titulo, texto, ms) => new Promise(ok => {
    const v = CD.modal(CD.cap(CD.esc(titulo), { cerrar: false }) +
      '<div class="copiar frag"><div class="copiar-anim"><span class="carpeta"></span><span class="papel"></span><span class="papel p2"></span><span class="carpeta destino"></span></div>' +
      '<p>' + CD.esc(texto) + '</p><div class="barra-prog"><i></i></div></div>', "dialogo chico progreso");
    setTimeout(() => { v.cerrar(); ok(); }, ms || 1400);
  });

  /* confirmar / pedir texto con ventana propia */
  CD.preguntar = (titulo, etiqueta, valor, boton) => new Promise(ok => {
    const v = CD.modal(CD.cap(CD.esc(titulo)) + '<form class="dlg-cuerpo frag"><label>' + CD.esc(etiqueta) + '<textarea rows="3" required>' + CD.esc(valor || "") + '</textarea></label>' +
      '<div class="dlg-pie"><button class="btn-aero">' + CD.esc(boton || "Aceptar") + '</button><button type="button" class="btn-vista" data-cerrar>Cancelar</button></div></form>', "dialogo", () => ok(null));
    v.querySelector("form").onsubmit = e => { e.preventDefault(); const t = v.querySelector("textarea").value.trim(); if (!t) return; ok(t); v.cerrar(); };
  });
  CD.confirmar = (titulo, texto, boton) => new Promise(ok => {
    let r = false;
    const v = CD.modal(CD.cap(CD.esc(titulo)) + '<div class="dlg-cuerpo frag"><p>' + CD.esc(texto) + '</p><div class="dlg-pie"><button class="btn-aero" data-si>' + CD.esc(boton || "Sí") + '</button><button type="button" class="btn-vista" data-cerrar>Cancelar</button></div></div>', "dialogo chico", () => ok(r));
    v.querySelector("[data-si]").onclick = () => { r = true; v.cerrar(); };
  });

  /* ---------------- barra superior común (botón tema) ---------------- */
  CD.botonTema = btn => {
    const t = () => { const o = CD.prefs.tema === "oscuro"; btn.title = o ? "Modo claro" : "Modo oscuro"; btn.setAttribute("aria-label", btn.title); };
    btn.onclick = () => { CD.prefs.tema = CD.prefs.tema === "oscuro" ? "claro" : "oscuro"; CD.guardarPrefs(); t(); };
    t();
  };
})();
