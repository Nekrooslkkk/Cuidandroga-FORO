/* CUIDANDROGA · nucleo.js
   Estado de la demo, cuentas, roles, avatares, insignias y ventanas.
   Todo se guarda en el navegador (localStorage): es una simulación sin servidor. */
(function () {
  "use strict";
  const CD = window.CD = window.CD || {};
  const CLAVE = "cd_estado2", CLAVE_PREFS = "cd_prefs", VERSION = "s2";
  CD.AHORA = Date.now();

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

  /* ---------------- conexión con Supabase ---------------- */
  CD.SUPA_URL = "https://lbikxnybdpmegvyuvzgf.supabase.co";
  CD.SUPA_KEY = "sb_publishable_Clp90myn97JtNM0KJehvaw_ybwPIbFX";
  CD.sb = window.supabase.createClient(CD.SUPA_URL, CD.SUPA_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  CD.E = { usuarios: {}, foros: [], likes: {}, votos: {}, conteos: {}, denuncias: [], notis: {}, avisos: [], avisosCerrados: {},
    folleto: {}, solicitudes: [], registro: [], recuperaciones: [], sesion: null };
  CD.errTexto = e => String((e && (e.message || e.error_description)) || e || "Error").replace(/^[A-ZÁÉÍÓÚ]+: /, "");
  const ok = r => { if (r.error) throw r.error; return r.data; };
  const lista = r => ok(r) || [];
  try { CD.E.folleto.anon = localStorage.getItem("cd_folleto_anon") === "1"; } catch (e) {}

  /* trae todo el foro desde la base de datos y lo deja en CD.E */
  CD.cargar = async () => {
    const sb = CD.sb;
    const { data: ses } = await sb.auth.getSession();
    const uid = ses && ses.session ? ses.session.user.id : null;
    const [pubs, foros, msgs, likes, conteos, avisos] = await Promise.all([
      sb.from("publicos").select("*").then(lista),
      sb.from("foros").select("*").order("id").then(lista),
      sb.from("mensajes").select("*").order("id").then(lista),
      sb.from("likes").select("mensaje_id,usuario").then(lista),
      sb.rpc("conteo_votos").then(lista),
      sb.from("avisos").select("*").order("id").then(lista)
    ]);
    let propio = [], privs = [], borr = [], votos = [], dens = [], notis = [], cerr = [], sols = [], reg = [], recs = [];
    if (uid) {
      [propio, privs, borr, votos, dens, notis, cerr, sols] = await Promise.all([
        sb.from("perfiles").select("*").eq("id", uid).then(lista),
        sb.from("privados").select("*").then(lista),
        sb.from("borrados").select("*").then(lista),
        sb.from("votos").select("*").then(lista),
        sb.from("denuncias").select("*").then(lista),
        sb.from("notificaciones").select("*").order("creado", { ascending: false }).then(lista),
        sb.from("avisos_cerrados").select("*").then(lista),
        sb.from("solicitudes").select("*").then(lista)
      ]);
      const rol = (pubs.find(p => p.id === uid) || {}).rol;
      if (rol === "moderador" || rol === "admin") reg = await sb.from("registro_mod").select("*").order("creado", { ascending: false }).limit(200).then(lista);
      if (rol === "admin") recs = await sb.from("recuperaciones").select("*").order("creado", { ascending: false }).then(lista);
    }
    const E = { usuarios: {}, foros: [], likes: {}, votos: {}, conteos: {}, denuncias: [], notis: {}, avisos: [], avisosCerrados: {},
      folleto: { anon: CD.E.folleto.anon }, solicitudes: [], registro: [], recuperaciones: recs, sesion: null };
    pubs.forEach(p => {
      E.usuarios[p.id] = { id: p.id, nombre: p.nombre, rol: p.rol, av: p.av, on: !!p.en_linea, suspendido: p.suspendido,
        registro: (p.creado || "").slice(0, 10),
        perfil: { uni: p.uni, carrera: p.carrera, estudia: !!p.uni, ocupacion: p.ocupacion, trabaja: !!p.ocupacion, edadPub: p.edad,
          pub: { estudios: p.pub_estudios, edad: p.pub_edad } } };
    });
    privs.forEach(v => {
      const u = E.usuarios[v.id]; if (!u) return;
      Object.assign(u.perfil, { correo: v.correo, edadModo: v.edad_modo, nacimiento: v.nacimiento, anio: v.anio, edad: v.edad_registro,
        edadAnioRegistro: v.anio_registro, sexo: v.sexo, genero: v.genero, estudia: !!v.estudia, uni: v.uni, carrera: v.carrera,
        trabaja: !!v.trabaja, ocupacion: v.ocupacion, encuestaFinal: v.encuesta_final, privado: true });
      u.config = { avisarTodos: v.avisar_todos, avisarParticipo: v.avisar_participo, avisarLikes: v.avisar_likes };
      if (v.id === uid) E.folleto[uid] = v.folleto_visto;
    });
    if (uid && E.usuarios[uid]) {
      E.sesion = uid;
      const p = propio[0] || {};
      E.usuarios[uid].debeCambiarNombre = p.debe_cambiar_nombre; E.usuarios[uid].debeCambiarClave = p.debe_cambiar_clave;
      E.usuarios[uid].on = true;
    }
    const textoBorrado = {}; borr.forEach(b => { textoBorrado[b.mensaje_id] = b.texto; });
    const porForo = {};
    msgs.forEach(m => {
      (porForo[m.foro_id] = porForo[m.foro_id] || []).push({ id: m.id, foro: m.foro_id, de: m.autor, ts: Date.parse(m.creado), likes: m.likes_base, texto: m.texto,
        eliminado: m.eliminado_por ? { por: m.eliminado_por, motivo: m.eliminado_motivo, texto: textoBorrado[m.id] } : null });
    });
    E.foros = foros.map(f => ({ id: f.id, autor: f.autor, titulo: f.titulo, pregunta: f.pregunta, destacado: f.destacado, ts: Date.parse(f.creado),
      encuesta: f.enc_pregunta ? { pregunta: f.enc_pregunta, publica: f.enc_publica, opciones: (f.enc_opciones || []).map(t => ({ t })) } : null,
      mensajes: porForo[f.id] || [] }));
    likes.forEach(l => { (E.likes[l.mensaje_id] = E.likes[l.mensaje_id] || {})[l.usuario] = true; });
    conteos.forEach(c => { (E.conteos[c.foro_id] = E.conteos[c.foro_id] || [0, 0, 0])[c.opcion] = Number(c.n); });
    votos.forEach(v => { (E.votos[v.foro_id] = E.votos[v.foro_id] || {})[v.usuario] = v.opcion; });
    const foroDe = {}; msgs.forEach(m => { foroDe[m.id] = m.foro_id; });
    E.denuncias = dens.map(d => ({ id: d.id, msg: d.mensaje_id, foro: foroDe[d.mensaje_id], por: d.por, motivo: d.motivo, estado: d.estado, ts: Date.parse(d.creado) }));
    if (uid) E.notis[uid] = notis.map(n => Object.assign({}, n.datos, { id: n.id, tipo: n.tipo, ts: Date.parse(n.creado) }));
    E.avisos = avisos.map(a => ({ id: String(a.id), autor: a.autor, titulo: a.titulo, texto: a.texto, boton: a.boton, fijo: a.fijo, foro: a.foro_id, ts: Date.parse(a.creado) }));
    if (uid) { E.avisosCerrados[uid] = {}; cerr.forEach(c => { E.avisosCerrados[uid][c.aviso_id] = true; }); }
    E.solicitudes = sols.map(s => ({ id: s.id, usuario: s.usuario, campo: s.campo, valor: s.campo === "edad" ? +s.valor : s.valor, estado: s.estado, ts: Date.parse(s.creado) }));
    E.registro = reg.map(l => ({ por: l.por, ts: Date.parse(l.creado), accion: l.accion, motivo: l.motivo }));
    CD.E = E;
    return E;
  };
  /* llama una función de la base de datos y devuelve el resultado o lanza el error en español */
  CD.rpc = async (fn, args) => { const r = await CD.sb.rpc(fn, args || {}); if (r.error) throw new Error(CD.errTexto(r.error)); return r.data; };
  CD.tabla = async promesa => { const r = await promesa; if (r.error) throw new Error(CD.errTexto(r.error)); return r.data; };

  /* ---------------- tiempo ---------------- */
  CD.tsDe = x => x.ts || Date.now();
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
  CD.enLinea = u => !!u.on || (CD.E.sesion === u.id);

  CD.edadDesdeFecha = (iso, hoy) => {
    const n = new Date(iso + "T00:00:00"), h = hoy || new Date();
    let e = h.getFullYear() - n.getFullYear();
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
    return e;
  };
  CD.edad = u => {
    const p = u.perfil || {};
    if (p.edadModo === "fecha" && p.nacimiento) return CD.edadDesdeFecha(p.nacimiento);
    if (p.edadModo === "anio" && p.edad != null) return p.edad + (new Date().getFullYear() - (p.edadAnioRegistro || new Date().getFullYear()));
    return p.edadPub != null ? p.edadPub : null;
  };

  /* login con nombre de usuario: devuelve el id o un texto de error */
  CD.login = async (nombre, pass) => {
    let correo;
    try { correo = await CD.rpc("correo_login", { p_nombre: nombre }); } catch (e) { return "No pude conectar con el servidor. Revisa tu internet."; }
    if (!correo) return "El nombre de usuario o la contraseña no coinciden.";
    const r = await CD.sb.auth.signInWithPassword({ email: correo, password: pass });
    if (r.error) return /invalid/i.test(r.error.message) ? "El nombre de usuario o la contraseña no coinciden." : CD.errTexto(r.error);
    return { id: r.data.user.id };
  };
  CD.logout = async () => { await CD.sb.auth.signOut(); };
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
