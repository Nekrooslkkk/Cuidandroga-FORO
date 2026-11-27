/* CUIDANDROGA · app.js — página principal del foro */
(function () {
  "use strict";
  const CD = window.CD, $ = CD.$, $$ = CD.$$, esc = CD.esc, ic = CD.ic;
  let E = CD.E, yo = null, esMod = false, esAdmin = false;
  const noLeidos = {}, minimizados = [], avisosCerradosAnon = {};
  ic.burbuja = '<svg class="ico" viewBox="0 0 16 16"><path d="M2 2.5h12v8H7l-3.5 3v-3H2z"/></svg>';
  ic.megafono = '<svg class="ico" viewBox="0 0 16 16"><path d="M1.5 6h3l7-4v12l-7-4h-3zM5 10.5l1.2 4h2l-1-4"/></svg>';
  ic.folleto = '<svg class="ico" viewBox="0 0 16 16"><path d="M1.5 3l4.3-1.5 4.4 1.5 4.3-1.5v11.5l-4.3 1.5-4.4-1.5L1.5 14.5z"/></svg>';

  const foro = id => E.foros.find(f => f.id === +id);
  const msgPorId = id => { for (const f of E.foros) { const m = f.mensajes.find(x => x.id === +id); if (m) return { f, m }; } return {}; };
  /* vuelve a traer todo desde Supabase y repinta */
  let cargando = null;
  async function refrescar(desdeSondeo) {
    if (cargando) return cargando;
    cargando = (async () => {
      const antes = {}; E.foros.forEach(f => { antes[f.id] = f.mensajes.length; });
      try { E = await CD.cargar(); } catch (e) { if (!desdeSondeo) CD.toast("No pude conectar con el servidor. Revisa tu internet."); return; } finally { cargando = null; }
      yo = CD.yo(); esMod = CD.esMod(yo); esAdmin = CD.esAdmin(yo);
      E.foros.forEach(f => { if (antes[f.id] != null && f.mensajes.length > antes[f.id] && (!abierto || abierto.id !== f.id)) noLeidos[f.id] = true; });
      const escribiendo = document.activeElement && document.activeElement.id === "hmTexto";
      pintarBarra(); pintarAvisos(); pintarTablones(); pintarNotis(); pintarActivos();
      if (abierto && !(desdeSondeo && escribiendo)) pintarHilo(true);
    })();
    return cargando;
  }
  async function hacer(promesa, exito) {
    try { const r = await promesa; if (exito) CD.toast(exito); await refrescar(); return r === undefined ? true : r; }
    catch (e) { CD.toast(CD.errTexto(e)); return null; }
  }
  const nombre = id => CD.u(id).nombre;
  const nLikes = m => (m.likes || 0) + Object.keys(E.likes[m.id] || {}).length;
  const participa = (f, uid) => f.mensajes.some(m => m.de === uid);

  /* ===================== permisos ===================== */
  function necesitaCuenta(que) {
    if (!yo) { abrirLogin("Para " + que + " tienes que iniciar sesión."); return true; }
    if (yo.suspendido) { CD.toast("Tu cuenta está suspendida por moderación. Puedes leer, pero no participar."); return true; }
    return false;
  }

  /* ===================== barra superior ===================== */
  function pintarBarra() {
    $("#cuentaAv").innerHTML = CD.avatar(yo ? yo.av : CD.avatarAzar());
    $("#cuentaTxt").textContent = yo ? yo.nombre : "LOGIN";
    $("#btnCuenta").classList.toggle("anon", !yo);
    $("#btnCuenta").title = yo ? "Mi cuenta" : "Iniciar sesión";
    $("#btnPanel").hidden = !esMod;
    $("#btnPanel").innerHTML = CD.triangulo;
    const fr = $("#franjaRol");
    if (esMod) {
      fr.hidden = false;
      fr.innerHTML = ic.escudo + '<span>Eres ' + (esAdmin ? "administrador" : "moderador") + ' · <b>' + esc(yo.nombre) + '</b></span>' +
        '<button class="btn-vista" data-panel>Panel de ' + (esAdmin ? "administración" : "moderación") + '</button>';
    }
  }

  /* ===================== avisos del admin (arriba de los foros) ===================== */
  function avisos() {
    const k = CD.claveVisto(), lista = [];
    if (!E.folleto[k]) lista.push({ id: "folleto", autor: "admin", titulo: "Mira nuestro folleto",
      texto: "Armamos un folleto con lo que tienes que saber para cuidarte: cómo se toma, con qué no mezclarlo, qué señales son para consultar y dónde pedir ayuda. Son dos minutos.", boton: "folleto" });
    E.avisos.forEach(a => lista.push(a));
    const cerrados = yo ? (E.avisosCerrados[yo.id] || {}) : avisosCerradosAnon;
    return lista.filter(a => a.fijo || !cerrados[a.id]);
  }
  function pintarAvisos() {
    $("#avisos").innerHTML = avisos().map(a => {
      const au = CD.u(a.autor), min = !a.fijo && CD.prefs.min["aviso-" + a.id];
      const href = a.boton === "folleto" ? "folleto.html" : a.boton === "encuesta" ? "encuesta.html" : null;
      const clic = href ? '<a class="clic-aca" href="' + href + '">¡CLIC ACÁ!</a>' : a.foro ? '<button class="clic-aca" data-foro="' + a.foro + '">¡CLIC ACÁ!</button>' : "";
      return '<section class="ventana aviso' + (a.fijo ? " fijo" : "") + (min ? " min" : "") + '" data-aviso="' + a.id + '">' +
        '<div class="cap"><span class="cap-ico">' + ic.megafono + '</span><span class="cap-titulo">MENSAJE DEL ADMINISTRADOR</span><span class="cap-btns">' +
        (a.fijo ? "" : '<button class="cb min" data-aviso-min aria-label="Minimizar"></button><button class="cb cerrar" data-aviso-x aria-label="Cerrar"></button>') + '</span></div>' +
        '<div class="aviso-cuerpo"><div class="banda-lineas"></div><div class="banda-brillo"></div>' +
        '<div class="aviso-foto">' + CD.avatar(au.av) + '</div>' +
        '<div class="aviso-txt"><div class="aviso-quien">ADMIN / ' + esc(au.nombre) + '</div><h3>' + esc(a.titulo) + '</h3><p>' + esc(a.texto) + '</p></div>' + clic + '</div></section>';
    }).join("");
  }

  /* ===================== tablones ===================== */
  function orden(f) { return (f.destacado ? 0 : 1e6) + (f.id > 12 ? -f.id : f.id); }
  function pintarTablones() {
    $("#tablones").innerHTML = E.foros.slice().sort((a, b) => orden(a) - orden(b)).map(f => {
      const au = CD.u(f.autor), n = f.mensajes.filter(m => !m.eliminado).length;
      return '<button class="tablon' + (f.destacado ? " destacado" : "") + '" data-foro="' + f.id + '">' +
        '<div class="cap">' + (f.destacado ? '<span class="pin">' + ic.chincheta + '</span>' : "") + '<span class="cap-titulo">' + esc(f.titulo) + '</span>' +
        (f.encuesta ? '<span class="t-enc" title="Tiene encuesta">' + ic.encuesta + '</span>' : "") + '</div>' +
        '<div class="t-preg"><span>' + esc(f.pregunta) + '</span></div>' +
        '<div class="t-foto">' + CD.avatar(au.av) + (noLeidos[f.id] ? '<span class="t-nuevo"></span>' : "") +
        '<div class="t-pie"><div><b>' + esc(au.nombre) + '</b><span class="t-foro"><span class="punto' + (CD.enLinea(au) ? "" : " off") + '"></span>Foro #' + f.id + '</span></div>' +
        '<span class="t-cont">' + n + '</span></div></div></button>';
    }).join("");
  }

  /* ===================== columna derecha ===================== */
  function pintarMin() { $$("[data-lat]").forEach(v => v.classList.toggle("min", !!CD.prefs.min[v.dataset.lat])); }

  const TIPOS = {
    borrado: n => ({ ico: "escudo", cls: "mod", t: "Mensaje nuevo de moderación", s: 'Tu mensaje ha sido moderado y eliminado por "' + nombre(n.por) + '"', cita: n.cita, foro: n.foro }),
    dm: n => ({ ico: "sobre", cls: "mod", t: "Mensaje de " + nombre(n.por), s: n.texto }),
    respuesta: n => ({ ico: "responder", t: nombre(n.de) + " respondió", s: "En un foro donde participas", foro: n.foro }),
    foro: n => ({ ico: "burbuja", t: "Mensaje nuevo en el foro", s: nombre(n.de), foro: n.foro }),
    like: n => ({ ico: "estrella", t: nombre(n.de) + " le dio Like a tu mensaje", foro: n.foro }),
    cola: () => ({ ico: "bandera", cls: "mod", t: "Denuncias por revisar", s: pendientes().length ? pendientes().length + (pendientes().length === 1 ? " mensaje denunciado" : " mensajes denunciados") : "Ya no quedan pendientes", panel: "denuncias" }),
    denuncia: n => ({ ico: "bandera", cls: "mod", t: "Nueva denuncia", s: nombre(n.de) + " denunció un mensaje", panel: "denuncias" }),
    solicitud: n => ({ ico: "escudo", cls: "mod", t: nombre(n.de) + " pidió cambiar sus datos", panel: "solicitudes" }),
    nuevo: n => ({ ico: "estrella", t: "Nuevo usuario registrado", s: nombre(n.de), panel: "usuarios" }),
    nombre: () => ({ ico: "escudo", cls: "mod", t: "Cambiamos tu nombre de usuario", s: "Es temporal hasta que elijas otro. Por favor no uses nombres así.", cuenta: true }),
    foto: () => ({ ico: "escudo", cls: "mod", t: "Restablecimos tu foto de perfil", s: "Puedes elegir otra en tu cuenta.", cuenta: true }),
    solicitudRes: n => ({ ico: "escudo", t: n.ok ? "Aprobamos tu cambio de datos" : "No aprobamos tu cambio de datos", cuenta: true }),
    rol: n => ({ ico: "escudo", t: n.rol === "moderador" ? "Ahora eres moderador" : "Ya no eres moderador" }),
    suspension: n => ({ ico: "escudo", cls: "mod", t: n.si ? "Tu cuenta fue suspendida" : "Tu cuenta fue reactivada", s: n.si ? "Puedes leer, pero no participar." : "" }),
    bienvenida: () => ({ ico: "estrella", t: "¡Bienvenido/a a CUIDANDROGA!", s: "Ya puedes responder, dar Like y votar en las encuestas." }),
    recuperacion: () => ({ ico: "sobre", cls: "mod", t: "Alguien pidió recuperar su contraseña", s: "Revisa el panel: Recuperaciones", panel: "recuperaciones" })
  };
  function pintarNotis() {
    let h = '<a class="noti folleto" href="folleto.html"><span class="noti-ico">' + ic.folleto + '</span><span class="noti-c"><b>Observa el folleto</b><small>Lo que tienes que saber para cuidarte</small></span></a>';
    if (!yo) h += '<button class="noti vacia" data-login><span class="noti-c"><small>Inicia sesión para ver tus notificaciones.</small></span></button>';
    else {
      const lista = E.notis[yo.id] || [];
      lista.forEach(n => {
        const d = (TIPOS[n.tipo] || (() => ({ ico: "burbuja", t: "Notificación" })))(n);
        h += '<button class="noti ' + (d.cls || "") + '" data-noti="' + n.id + '"><span class="noti-ico">' + (ic[d.ico] || "") + '</span><span class="noti-c">' +
          '<b>' + esc(d.t) + '</b>' + (d.s ? '<small>' + esc(d.s) + '</small>' : "") + (d.cita ? '<em>"' + esc(d.cita) + '"</em>' : "") +
          '<span class="noti-meta">' + (d.foro ? "Foro #" + d.foro + " · " : "") + CD.hace(CD.tsDe(n)) + '</span></span></button>';
      });
      if (!lista.length) h += '<div class="noti vacia"><span class="noti-c"><small>No tienes notificaciones nuevas.</small></span></div>';
    }
    $("#notiLista").innerHTML = h;
    const n = yo ? (E.notis[yo.id] || []).length : 0;
    $("#notiCuenta").textContent = n ? "(" + n + ")" : "";
  }
  function pintarActivos() {
    const lista = Object.values(E.usuarios).filter(CD.enLinea).sort((a, b) => peso(a) - peso(b));
    function peso(u) { return u.rol === "admin" ? 0 : u.rol === "moderador" ? 1 : yo && u.id === yo.id ? 2 : 3; }
    $("#activosLista").innerHTML = lista.map(u =>
      '<li><button class="activo' + (CD.esMod(u) ? " es-mod" : "") + '" data-perfil="' + u.id + '">' + CD.av(u, "act-av") +
      '<span class="act-nom">' + CD.firma(u) + '</span><span class="punto"></span></button></li>').join("");
    $("#activosCuenta").textContent = "(" + lista.length + ")";
  }

  /* ===================== ventana del foro ===================== */
  let abierto = null;
  function abrirForo(id, focoId) {
    const f = foro(id); if (!f) return;
    if (abierto) abierto.v.cerrar();
    const i = minimizados.indexOf(f.id); if (i >= 0) { minimizados.splice(i, 1); pintarTareas(); }
    delete noLeidos[f.id];
    const v = CD.modal("", "hilo", () => { if (abierto && abierto.v === v) abierto = null; });
    abierto = { id: f.id, v, para: f.autor };
    pintarHilo();
    pintarTablones();
    if (focoId) enfocar(focoId);
  }
  function enfocar(mid) {
    const el = document.getElementById("m-" + mid); if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.add("foco"); setTimeout(() => el.classList.remove("foco"), 1600);
  }
  function encuestaHTML(f) {
    const e = f.encuesta, votos = E.votos[f.id] || {}, conteo = E.conteos[f.id] || [0, 0, 0], total = conteo.reduce((a, b) => a + b, 0);
    const mio = yo ? votos[yo.id] : undefined, ver = mio !== undefined || esAdmin;
    let h = '<div class="encuesta"><div class="enc-cab">' + ic.encuesta + '<b>ENCUESTA</b><span>' + (e.publica ? "Pública: todos ven quién votó" : "Anónima") + '</span></div>' +
      '<p class="enc-preg">' + esc(e.pregunta) + '</p>';
    e.opciones.forEach((o, i) => {
      const quienes = Object.keys(votos).filter(k => votos[k] === i), n = conteo[i] || 0, pct = total ? Math.round(n * 100 / total) : 0;
      if (!ver) { h += '<button class="enc-op" data-votar="' + f.id + ':' + i + '"><span class="radio"></span>' + esc(o.t) + '</button>'; return; }
      const caras = (e.publica || esAdmin) && n ? '<span class="enc-caras">' + quienes.slice(0, 8).map(k => '<span title="' + esc(nombre(k)) + '">' + CD.avatar(CD.u(k).av) + '</span>').join("") + (n > 8 ? '<i>+' + (n - 8) + '</i>' : "") + '</span>' : "";
      h += '<div class="enc-res' + (mio === i ? " mio" : "") + '"><div class="enc-res-l"><span>' + esc(o.t) + (mio === i ? " ✓" : "") + '</span><b>' + pct + '% · ' + n + '</b></div>' +
        '<div class="barra-prog fija"><i style="width:' + pct + '%"></i></div>' + caras + '</div>';
    });
    h += '<div class="enc-pie"><span>' + total + (total === 1 ? " persona respondió" : " personas respondieron") + '</span>' +
      (esAdmin && !e.publica ? '<span class="solo-admin">Ves quién votó porque eres administrador</span>' : "") +
      (mio !== undefined ? '<button class="link" data-desvotar="' + f.id + '">Cambiar mi voto</button>' : "") + '</div></div>';
    return h;
  }
  function msgHTML(f, m, i) {
    const u = CD.u(m.de), ts = CD.tsDe(m), primero = i === 0;
    const cab = '<header class="msg-cab">' + (primero ? '<span class="por">Por</span>' : "") +
      '<button class="msg-av" data-perfil="' + u.id + '">' + CD.avatar(u.av) + '</button>' +
      '<div class="msg-quien">' + CD.firma(u) + '<span class="msg-hace">' + CD.hace(ts) + '</span></div><div class="msg-der"><time>' + CD.fecha(ts) + '</time>';
    if (m.eliminado) {
      const veo = esMod || (yo && yo.id === m.de);
      return '<article class="msg borrado" id="m-' + m.id + '">' + cab + '</div></header><div class="msg-txt">Mensaje eliminado por ' + esc(nombre(m.eliminado.por)) +
        (veo && m.eliminado.texto ? '<br><s>' + esc(m.eliminado.texto) + '</s>' + (m.eliminado.motivo ? '<br><small>Motivo: ' + esc(m.eliminado.motivo) + '</small>' : "") : "") + '</div></article>';
    }
    const propio = yo && yo.id === m.de, yl = yo && E.likes[m.id] && E.likes[m.id][yo.id];
    const den = yo && E.denuncias.some(d => d.msg === m.id && d.por === yo.id);
    const puedoModerar = esMod && !propio && (esAdmin || !CD.esMod(u));
    return '<article class="msg' + (primero ? " primero" : "") + '" id="m-' + m.id + '">' + cab + '<div class="msg-der-btns">' +
      (puedoModerar ? '<button class="btn-mod" data-borrar="' + m.id + '">' + ic.basura + 'Borrar</button><button class="btn-mod" data-advertir="' + u.id + '">' + ic.sobre + 'Advertir</button>' : "") +
      (propio ? "" : '<button class="btn-den' + (den ? " on" : "") + '" data-den="' + m.id + '">' + ic.bandera + '<span>' + (den ? "Denunciado" : "Denunciar") + '</span></button>') +
      '</div></div></header>' +
      (primero ? '<h2 class="msg-titulo">' + esc(f.titulo) + '</h2><p class="msg-pregunta">' + esc(f.pregunta) + '</p>' : "") +
      '<div class="msg-txt">' + esc(m.texto) + '</div>' + (primero && f.encuesta ? encuestaHTML(f) : "") +
      '<footer class="msg-acc"><button class="btn-resp" data-resp="' + m.id + '">' + ic.responder + 'Responder</button>' +
      '<button class="btn-like' + (yl ? " on" : "") + '" data-like="' + m.id + '">' + ic.estrella + 'Like <span>' + nLikes(m) + '</span></button></footer></article>';
  }
  function filaGente(u) {
    return '<li><button class="gente" data-perfil="' + u.id + '">' + CD.av(u, "act-av") + '<span class="act-nom">' + CD.firma(u) + '</span>' +
      '<span class="punto' + (CD.enLinea(u) ? "" : " off") + '"></span></button></li>';
  }
  function pintarHilo(mantenerScroll) {
    if (!abierto) return;
    const f = foro(abierto.id), v = abierto.v, au = CD.u(f.autor);
    const lect = v.querySelector(".hm-lectura"), scroll = lect ? lect.scrollTop : 0, borrador = v.querySelector("#hmTexto");
    const texto = borrador ? borrador.value : "";
    const ids = [...new Set(f.mensajes.map(m => m.de))];
    const activos = Object.values(E.usuarios).filter(u => CD.enLinea(u) && !ids.includes(u.id));
    v.innerHTML = '<div class="cap"><span class="cap-av">' + CD.avatar(au.av) + '</span><span class="cap-titulo">' + esc(f.titulo) + ' <span class="cap-num">(#' + f.id + ')</span></span>' +
      '<span class="cap-btns"><button class="cb min" data-min-foro aria-label="Minimizar"></button><button class="cb cerrar" data-cerrar aria-label="Cerrar"></button></span></div>' +
      (esMod ? '<div class="hm-mod">' + ic.escudo + '<span>Moderación</span><button class="hm-btn" data-destacar="' + f.id + '">' + ic.chincheta + (f.destacado ? "Quitar destacado" : "Destacar foro") + '</button></div>' : "") +
      '<div class="hm-cuerpo"><aside class="hm-gente frag"><h4>En esta conversación</h4><ul>' + ids.map(id => filaGente(CD.u(id))).join("") + '</ul>' +
      '<h4>Usuarios activos</h4><ul>' + activos.map(filaGente).join("") + '</ul></aside>' +
      '<div class="hm-lectura frag">' + f.mensajes.map((m, i) => msgHTML(f, m, i)).join("") +
      (yo ? '<form class="hm-redactar" id="hmRedactar"><div class="hm-para">' + CD.av(yo) + '<span>Respondiendo a <b id="hmPara">' + esc(nombre(abierto.para)) + '</b></span></div>' +
        '<textarea id="hmTexto" rows="3" placeholder="Escribe tu respuesta…" required>' + esc(texto) + '</textarea><div class="hm-enviar"><button class="btn-aero">Enviar</button></div></form>'
        : '<div class="hm-login"><p>Para responder, dar Like o votar tienes que iniciar sesión.</p><button class="btn-aero" data-login>Iniciar sesión</button></div>') +
      '</div></div>';
    if (mantenerScroll) v.querySelector(".hm-lectura").scrollTop = scroll;
    const form = v.querySelector("#hmRedactar");
    if (form) form.onsubmit = e => { e.preventDefault(); responder(f, v.querySelector("#hmTexto").value.trim()); };
  }
  async function responder(f, texto) {
    if (!texto || necesitaCuenta("responder")) return;
    const boton = abierto.v.querySelector("#hmRedactar .btn-aero"); boton.disabled = true;
    try {
      const nuevo = await CD.tabla(CD.sb.from("mensajes").insert({ foro_id: f.id, autor: yo.id, texto }).select("id").single());
      abierto.v.querySelector("#hmTexto").value = ""; abierto.para = f.autor;
      await refrescar(); pintarHilo(); enfocar(nuevo.id);
    } catch (e) { CD.toast(CD.errTexto(e)); boton.disabled = false; }
  }

  /* minimizar el foro a la barra de abajo */
  function pintarTareas() {
    $("#tareas").innerHTML = minimizados.map(id => { const f = foro(id); return '<button class="tarea" data-foro="' + id + '">' + CD.avatar(CD.u(f.autor).av) + '<span>' + esc(f.titulo) + '</span></button>'; }).join("");
  }

  /* ===================== acciones dentro del foro ===================== */
  function darLike(mid) {
    if (necesitaCuenta("dar Like")) return;
    const { m } = msgPorId(mid); if (!m) return;
    const l = E.likes[m.id] = E.likes[m.id] || {}, tenia = !!l[yo.id];
    if (tenia) delete l[yo.id]; else l[yo.id] = true;
    pintarHilo(true);
    const q = tenia ? CD.sb.from("likes").delete().match({ mensaje_id: m.id, usuario: yo.id }) : CD.sb.from("likes").insert({ mensaje_id: m.id, usuario: yo.id });
    hacer(CD.tabla(q));
  }
  function denunciar(mid) {
    if (necesitaCuenta("denunciar")) return;
    if (E.denuncias.some(d => d.msg === +mid && d.por === yo.id)) return CD.toast("Ya denunciaste este mensaje. Lo vamos a revisar.");
    const v = CD.modal(CD.cap("DENUNCIAR MENSAJE", { icono: '<span class="cap-ico rojo">' + ic.bandera + '</span>' }) +
      '<form class="dlg-cuerpo frag"><p>¿Por qué denuncias este mensaje? Lo revisa un moderador.</p><div class="opciones">' +
      CD.MOTIVOS.map((t, i) => '<label class="opcion"><input type="radio" name="mot" value="' + esc(t) + '"' + (i ? "" : " checked") + '><span>' + esc(t) + '</span></label>').join("") +
      '</div><div class="dlg-pie"><button class="btn-aero">' + ic.bandera + 'Denunciar</button><button type="button" class="btn-vista" data-cerrar>Cancelar</button></div></form>', "dialogo chico");
    v.querySelector("form").onsubmit = e => {
      e.preventDefault();
      const motivo = v.querySelector("input:checked").value; v.cerrar();
      hacer(CD.tabla(CD.sb.from("denuncias").insert({ mensaje_id: +mid, por: yo.id, motivo })), "Gracias. Un moderador va a revisar el mensaje.");
    };
  }
  async function borrarMensaje(mid, motivoBase) {
    const { m } = msgPorId(mid); if (!m || !esMod) return;
    const motivo = await CD.preguntar("BORRAR MENSAJE", "Motivo (lo verá " + nombre(m.de) + ")", motivoBase || "Promueve el consumo", "Borrar mensaje");
    if (!motivo) return;
    await hacer(CD.rpc("borrar_mensaje", { p_id: m.id, p_motivo: motivo }), "Mensaje borrado y " + nombre(m.de) + " fue notificado.");
    refrescarPanel();
  }
  async function advertir(uid) {
    const u = CD.u(uid);
    const t = await CD.preguntar("MENSAJE A " + u.nombre.toUpperCase(), "Mensaje de moderación", "Hola, te escribimos de moderación: ", "Enviar");
    if (!t) return;
    await hacer(CD.rpc("advertir", { p_uid: uid, p_texto: t }), "Mensaje enviado a " + u.nombre + ".");
    refrescarPanel();
  }
  function votar(fid, op) {
    if (necesitaCuenta("votar")) return;
    hacer(CD.tabla(CD.sb.from("votos").insert({ foro_id: fid, usuario: yo.id, opcion: op })));
  }

  /* ===================== mini perfil ===================== */
  function abrirPerfil(uid) {
    const u = CD.u(uid), foros = E.foros.filter(f => participa(f, uid));
    const v = CD.modal(CD.cap("PERFIL") + CD.banda('<span class="perfil-av">' + CD.avatar(u.av) + '</span><span class="banda-titulo">' + esc(u.nombre) + '</span>') +
      '<div class="dlg-cuerpo frag"><div class="perfil-firma">' + CD.firma(u) + '<span class="punto' + (CD.enLinea(u) ? "" : " off") + '"></span></div>' +
      (foros.length ? '<h4>Participa en</h4><div class="perfil-foros">' + foros.map(f => '<button class="btn-vista" data-foro="' + f.id + '">#' + f.id + ' ' + esc(f.titulo) + '</button>').join("") + '</div>' : "") +
      (esMod && u.id !== yo.id ? '<div class="dlg-pie"><button class="btn-aero" data-panel-usuario="' + u.id + '">' + ic.escudo + 'Moderar</button></div>' : "") + '</div>', "dialogo chico");
    v.addEventListener("click", e => { if (e.target.closest("[data-foro],[data-panel-usuario]")) v.cerrar(); });
  }

  /* ===================== login ===================== */
  function abrirLogin(msg) {
    const v = CD.modal(CD.cap("LOGIN") + CD.banda('<span class="banda-titulo">LOGIN</span>') +
      '<form class="login frag" autocomplete="on"><div class="login-foto">' + CD.avatar(CD.avatarAzar()) + '</div><div class="login-campos">' +
      (msg ? '<p class="nota">' + esc(msg) + '</p>' : "") +
      '<label>Nombre de usuario<input name="u" autocomplete="username" placeholder="@nombre" required></label>' +
      '<label>Contraseña<input name="p" type="password" autocomplete="current-password" required></label><p class="error" hidden></p>' +
      '<button class="btn-aero grande">Entrar</button>' +
      '<p class="login-links">¿No estás registrado? <a href="registro.html">Regístrate</a></p>' +
      '<p class="login-links"><a href="#" data-olvide>¿Olvidaste tu contraseña?</a></p></div></form>', "dialogo login-v");
    const form = v.querySelector("form");
    form.onsubmit = async e => {
      e.preventDefault();
      const boton = form.querySelector(".btn-aero"); boton.disabled = true;
      const id = await CD.login(form.u.value, form.p.value), err = form.querySelector(".error");
      boton.disabled = false;
      const r = typeof id === "string" ? id : (await CD.cargar(), CD.u(id.id));
      if (typeof r === "string") { err.textContent = r; err.hidden = false; v.classList.remove("temblor"); void v.offsetWidth; v.classList.add("temblor"); return; }
      form.querySelector(".login-foto").innerHTML = CD.avatar(r.av);
      form.querySelector(".login-foto").classList.add("aparece");
      form.querySelector(".login-campos").innerHTML = '<p class="login-hola">¡Hola!</p><p class="login-nombre">' + CD.firma(r) + '</p><div class="barra-prog"><i></i></div>';
      setTimeout(() => v.classList.add("entrando"), 1300);
      setTimeout(() => location.reload(), 1850);
    };
    v.querySelector("[data-olvide]").onclick = e => { e.preventDefault(); v.cerrar(); abrirOlvide(); };
  }

  function abrirOlvide() {
    const v = CD.modal(CD.cap("¿OLVIDASTE TU CONTRASEÑA?") + CD.banda('<span class="banda-titulo">Recuperar cuenta</span>') +
      '<div class="dlg-cuerpo frag olvide"><section class="olv-op"><h4>' + ic.escudo + 'Pregúntale a un moderador por Instagram</h4>' +
      '<p>Pronto vamos a publicar acá los usuarios de Instagram de los moderadores.</p></section>' +
      '<section class="olv-op"><h4>' + ic.sobre + 'Recupérala con tu correo</h4><form class="olv-paso"><label>Tu correo<input type="email" required placeholder="tucorreo@ejemplo.cl"></label>' +
      '<p class="error" hidden></p><button class="btn-aero">Pedir contraseña temporal</button></form></section></div>', "dialogo");
    v.querySelector("form").onsubmit = async e => {
      e.preventDefault();
      const f = e.target, correo = f.querySelector("input").value;
      try { await CD.rpc("pedir_recuperacion", { p_correo: correo }); }
      catch (er) { const err = f.querySelector(".error"); err.textContent = CD.errTexto(er); err.hidden = false; return; }
      f.outerHTML = '<p class="nota">Listo. Si ese correo tiene una cuenta, un administrador te va a escribir con una contraseña temporal. Cuando entres, te vamos a pedir que la cambies.</p>';
    };
  }
  function reglas(form) {
    const p = form.querySelector("input[type=password]").value;
    form.querySelector(".reglas").innerHTML = CD.reglasPass(p).map(r => '<li class="' + (r.ok ? "ok" : "") + '">' + r.t + '</li>').join("");
  }

  /* ===================== mi cuenta / configuración ===================== */
  function abrirCuenta(pestana) {
    if (!yo) return abrirLogin();
    const v = CD.modal("", "dialogo cuenta-v");
    let tab = pestana || (yo.debeCambiarNombre ? "perfil" : "perfil");
    const pintar = () => {
      const p = yo.perfil, c = yo.config || (yo.config = { avisarTodos: false, avisarParticipo: true, avisarLikes: true });
      const tabs = [["perfil", "Perfil"], ["privacidad", "Privacidad"], ["notis", "Notificaciones"], ["diseno", "Diseño"], ["seguridad", "Seguridad"]];
      let cuerpo = "";
      if (tab === "seguridad" && yo.debeCambiarClave) cuerpo = '<p class="nota mod">Entraste con una contraseña temporal. Cámbiala ahora: en "Contraseña actual" escribe la temporal.</p>';
      if (tab === "perfil") cuerpo =
        (yo.debeCambiarNombre ? '<p class="nota mod">Moderación cambió tu nombre de usuario de forma temporal. Elige uno nuevo, por favor sin groserías.</p>' : "") +
        '<h4>Foto de perfil</h4><div id="cEditor"></div><div class="dlg-pie izq"><button class="btn-aero" data-guardar-foto>Guardar foto</button></div>' +
        '<h4>Nombre de usuario</h4><form class="fila-form" data-form="nombre"><input value="' + esc(yo.nombre) + '" maxlength="21" required><button class="btn-aero">Cambiar nombre</button></form><p class="error" hidden></p>';
      if (tab === "privacidad") cuerpo =
        '<p>Elige qué pueden ver los demás. Tu nombre de usuario y tu foto siempre se ven.</p>' +
        '<label class="check"><input type="checkbox" data-pub="estudios"' + (p.pub.estudios ? " checked" : "") + '> Mostrar mi universidad y carrera (o mi trabajo)</label>' +
        '<label class="check"><input type="checkbox" data-pub="edad"' + (p.pub.edad ? " checked" : "") + '> Mostrar mi edad</label>' +
        '<h4>Así te ven los demás</h4><div class="vista-previa">' + CD.av(yo, "act-av") + CD.firma(yo) + '</div>';
      if (tab === "notis") cuerpo =
        '<label class="check"><input type="checkbox" data-cfg="avisarParticipo"' + (c.avisarParticipo ? " checked" : "") + '> Respuestas en foros donde participo</label>' +
        '<label class="check"><input type="checkbox" data-cfg="avisarLikes"' + (c.avisarLikes ? " checked" : "") + '> Likes a mis mensajes</label>' +
        '<label class="check"><input type="checkbox" data-cfg="avisarTodos"' + (c.avisarTodos ? " checked" : "") + '> Mensajes nuevos en todos los foros</label>';
      if (tab === "diseno") cuerpo =
        '<label class="check"><input type="checkbox" data-pref="oscuro"' + (CD.prefs.tema === "oscuro" ? " checked" : "") + '> Modo oscuro</label>' +
        '<label class="check"><input type="checkbox" data-pref="fondo"' + (CD.prefs.fondo ? " checked" : "") + '> Fondo animado</label>' +
        '<label class="check"><input type="checkbox" data-pref="sobria"' + (CD.prefs.sobria ? " checked" : "") + '> Versión sobria (menos brillos, sin animaciones ni parpadeos)</label>' +
        '<label class="check"><input type="checkbox" data-pref="grande"' + (CD.prefs.grande ? " checked" : "") + '> Texto más grande</label>';
      if (tab === "seguridad") {
        const mias = E.solicitudes.filter(s => s.usuario === yo.id);
        cuerpo += '<h4>Cambiar contraseña</h4><form data-form="pass" class="col-form"><label>Contraseña actual<input type="password" required></label>' +
          '<label>Contraseña nueva<input type="password" required></label><ul class="reglas"></ul><label>Repite la contraseña nueva<input type="password" required></label>' +
          '<p class="error" hidden></p><button class="btn-aero">Cambiar contraseña</button></form>' +
          '<h4>Cambiar mis datos</h4><p>Los cambios de edad, estudios o trabajo los revisa un moderador.</p>' +
          '<form data-form="solicitud" class="col-form"><label>Dato<select name="campo">' + CAMPOS.map(([k, n]) => '<option value="' + k + '">' + n + '</option>').join("") + '</select></label>' +
          '<label>Nuevo valor<span class="valor-campo"></span></label><button class="btn-aero">Enviar a moderación</button></form>' +
          (mias.length ? '<ul class="lista-simple">' + mias.map(s => '<li>' + esc(nombreCampo(s.campo)) + ': ' + esc(valorLegible(s.campo, s.valor)) + ' · <b>' + s.estado + '</b></li>').join("") + '</ul>' : "");
      }
      v.innerHTML = CD.cap("MI CUENTA") + CD.banda('<span class="perfil-av">' + CD.avatar(yo.av) + '</span><span class="banda-titulo">' + esc(yo.nombre) + '</span>' + CD.rolBadge(yo)) +
        '<div class="tabs">' + tabs.map(([k, n]) => '<button class="tab' + (k === tab ? " sel" : "") + '" data-tab="' + k + '">' + n + '</button>').join("") + '</div>' +
        '<div class="dlg-cuerpo frag tab-cuerpo">' + cuerpo + '</div><div class="cuenta-pie"><button class="btn-vista" data-salir>Cerrar sesión</button></div>';
      if (tab === "perfil") editor = CD.editorAvatar(v.querySelector("#cEditor"), yo.av);
      if (tab === "seguridad") { const fp = v.querySelector('[data-form="pass"]'); fp.addEventListener("input", () => reglasNueva(fp)); reglasNueva(fp); campoValor(v); }
    };
    let editor = null;
    v.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.tab) { tab = b.dataset.tab; pintar(); }
      else if (b.hasAttribute("data-guardar-foto")) { const av = editor.valor(); hacer(CD.tabla(CD.sb.from("perfiles").update({ av }).eq("id", yo.id)), "Foto guardada.").then(() => { yo = CD.yo(); pintar(); }); }
      else if (b.hasAttribute("data-salir")) { CD.logout().then(() => location.reload()); }
    });
    v.addEventListener("change", e => {
      const t = e.target;
      if (t.dataset.pub) { hacer(CD.tabla(CD.sb.from("perfiles").update({ ["pub_" + t.dataset.pub]: t.checked }).eq("id", yo.id))).then(() => { yo = CD.yo(); pintar(); }); }
      else if (t.dataset.cfg) { const col = { avisarTodos: "avisar_todos", avisarParticipo: "avisar_participo", avisarLikes: "avisar_likes" }[t.dataset.cfg]; hacer(CD.tabla(CD.sb.from("privados").update({ [col]: t.checked }).eq("id", yo.id))); }
      else if (t.dataset.pref) {
        if (t.dataset.pref === "oscuro") CD.prefs.tema = t.checked ? "oscuro" : "claro"; else CD.prefs[t.dataset.pref] = t.checked;
        CD.guardarPrefs();
      } else if (t.name === "campo") campoValor(v);
    });
    v.addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target, sig = f.nextElementSibling;
      const err = f.querySelector(".error") || (sig && sig.classList.contains("error") ? sig : null);
      const mal = t => { if (err) { err.textContent = t; err.hidden = false; } else CD.toast(t); };
      if (f.dataset.form === "nombre") {
        let n = f.querySelector("input").value.trim(); if (n[0] !== "@") n = "@" + n;
        if (!CD.nombreValido(n)) return mal("Usa entre 3 y 20 letras, números, puntos o guiones bajos.");
        try { await CD.rpc("cambiar_nombre", { p_nombre: n }); } catch (er) { return mal(CD.errTexto(er)); }
        CD.toast("Nombre cambiado a " + n + "."); await refrescar(); yo = CD.yo(); pintar();
      } else if (f.dataset.form === "pass") {
        const [a, b, c] = f.querySelectorAll("input");
        if (!CD.passFuerte(b.value)) return mal("La contraseña nueva todavía no cumple todo.");
        if (b.value !== c.value) return mal("Las contraseñas nuevas no coinciden.");
        try { await CD.rpc("cambiar_clave", { p_actual: a.value, p_nueva: b.value }); } catch (er) { return mal(CD.errTexto(er)); }
        CD.toast("Contraseña cambiada."); await refrescar(); yo = CD.yo(); pintar();
      } else if (f.dataset.form === "solicitud") {
        const campo = f.campo.value, valor = f.querySelector("[name=valor]").value;
        if (!valor) return mal("Elige el nuevo valor.");
        await hacer(CD.tabla(CD.sb.from("solicitudes").insert({ usuario: yo.id, campo, valor: String(valor) })), "Listo, un moderador lo va a revisar.");
        pintar();
      }
    });
    pintar();
  }
  function reglasNueva(f) { const p = f.querySelectorAll("input")[1].value; f.querySelector(".reglas").innerHTML = CD.reglasPass(p).map(r => '<li class="' + (r.ok ? "ok" : "") + '">' + r.t + '</li>').join(""); }
  const CAMPOS = [["edad", "Edad"], ["uni", "Universidad"], ["carrera", "Carrera"], ["ocupacion", "Trabajo"], ["sexo", "Sexo"], ["genero", "Género"]];
  const nombreCampo = k => (CAMPOS.find(c => c[0] === k) || [k, k])[1];
  const valorLegible = (k, v) => k === "uni" ? (CD.UNIS[v] || {}).n : k === "carrera" ? (CD.CARRERAS[v] || {}).n : k === "edad" ? v + " años" : v;
  function opcionesCampo(k) {
    if (k === "uni") return Object.entries(CD.UNIS).map(([c, u]) => [c, u.n]);
    if (k === "carrera") return Object.entries(CD.CARRERAS).map(([c, u]) => [c, u.n]);
    if (k === "ocupacion") return CD.OCUPACIONES.map(o => [o, o]);
    if (k === "sexo") return CD.SEXOS.map(o => [o, o]);
    if (k === "genero") return CD.GENEROS.map(o => [o, o]);
    return null;
  }
  function campoValor(v) {
    const f = v.querySelector('[data-form="solicitud"]'); if (!f) return;
    const ops = opcionesCampo(f.campo.value);
    f.querySelector(".valor-campo").innerHTML = ops ? '<select name="valor">' + ops.map(([k, n]) => '<option value="' + esc(k) + '">' + esc(n) + '</option>').join("") + '</select>'
      : '<input name="valor" type="number" min="18" max="110" required>';
  }

  /* ===================== publicar (Hotmail + Messenger) ===================== */
  const EMOS = ["😊", "😂", "😢", "😮", "😡", "👍", "🙏", "💚", "💊", "📚"];
  function abrirPublicar() {
    if (necesitaCuenta("publicar")) return;
    const sig = Math.max(0, ...E.foros.map(f => f.id)) + 1;
    const v = CD.modal(CD.cap("Nuevo foro - CUIDANDROGA") +
      CD.banda('<span class="pub-anim"><span class="papel"></span><span class="papel p2"></span></span><span class="banda-titulo">Publicar</span>', "messenger") +
      '<form class="pub frag"><div class="pub-barra"><button class="hm-btn" data-enviar>' + ic.responder + 'Enviar</button>' +
      '<button type="button" class="hm-btn" data-toggle-enc>' + ic.encuesta + 'Encuesta</button><span class="hm-esp"></span>' +
      '<span class="pub-emos">' + EMOS.map(e => '<button type="button" class="emo" data-emo="' + e + '">' + e + '</button>').join("") + '</span></div>' +
      '<div class="pub-campos"><span class="pub-et">De:</span><span class="pub-de">' + CD.av(yo) + CD.firma(yo) + '</span>' +
      '<span class="pub-et">Para:</span><span class="pub-para">Foro #' + sig + ' (nuevo)</span>' +
      '<label class="pub-et" for="pTit">Título:</label><input id="pTit" name="titulo" maxlength="40" required>' +
      '<label class="pub-et" for="pPre">Pregunta:</label><input id="pPre" name="pregunta" maxlength="120" required placeholder="Lo que quieres preguntar o debatir"></div>' +
      '<textarea name="texto" rows="7" required placeholder="Cuéntanos más…"></textarea>' +
      '<fieldset class="pub-enc" hidden><legend>' + ic.encuesta + 'Encuesta (máximo 3 opciones)</legend>' +
      '<input name="ePre" maxlength="100" placeholder="Pregunta de la encuesta"><input name="e1" maxlength="60" placeholder="Opción 1"><input name="e2" maxlength="60" placeholder="Opción 2"><input name="e3" maxlength="60" placeholder="Opción 3 (opcional)">' +
      '<label class="check"><input type="checkbox" name="ePub"> Encuesta pública: todos pueden ver quién votó</label></fieldset>' +
      (esMod ? '<fieldset class="pub-extra"><legend>' + ic.escudo + (esAdmin ? "Opciones de administrador" : "Opciones de moderador") + '</legend>' +
        '<label class="check"><input type="checkbox" name="destacar"> Destacar este foro</label>' +
        (esAdmin ? '<label class="check"><input type="checkbox" name="aviso"> Mostrarlo también como aviso grande en el inicio</label>' +
          '<label class="check"><input type="checkbox" name="fijo"> Aviso fijo: nadie lo puede minimizar ni cerrar</label>' : "") + '</fieldset>' : "") +
      '<p class="error" hidden></p><div class="dlg-pie"><button class="btn-aero grande">Publicar</button><button type="button" class="btn-vista" data-cerrar>Cancelar</button></div></form>', "dialogo publicar");
    const form = v.querySelector("form"), enc = v.querySelector(".pub-enc");
    let ultimoCampo = form.texto;
    form.addEventListener("focusin", e => { if (e.target.matches("input:not([type=checkbox]),textarea")) ultimoCampo = e.target; });
    v.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.emo) { const c = ultimoCampo, p = c.selectionStart || c.value.length; c.value = c.value.slice(0, p) + b.dataset.emo + c.value.slice(p); c.focus(); }
      if (b.hasAttribute("data-toggle-enc")) { enc.hidden = !enc.hidden; b.classList.toggle("on", !enc.hidden); }
    });
    form.onsubmit = async e => {
      e.preventDefault();
      const err = form.querySelector(".error"), mal = t => { err.textContent = t; err.hidden = false; };
      const fila = { autor: yo.id, titulo: form.titulo.value.trim(), pregunta: form.pregunta.value.trim(), destacado: !!(esMod && form.destacar.checked) };
      if (!enc.hidden) {
        const ops = [form.e1.value, form.e2.value, form.e3.value].map(s => s.trim()).filter(Boolean);
        if (!form.ePre.value.trim() || ops.length < 2) return mal("La encuesta necesita una pregunta y al menos 2 opciones.");
        Object.assign(fila, { enc_pregunta: form.ePre.value.trim(), enc_opciones: ops, enc_publica: form.ePub.checked });
      }
      const aviso = esAdmin && form.aviso.checked, fijo = esAdmin && form.fijo.checked, texto = form.texto.value.trim();
      v.cerrar();
      const anim = CD.progreso("Publicando…", "Subiendo tu foro a CUIDANDROGA", 1500);
      try {
        const nuevo = await CD.tabla(CD.sb.from("foros").insert(fila).select("id").single());
        await CD.tabla(CD.sb.from("mensajes").insert({ foro_id: nuevo.id, autor: yo.id, texto }));
        if (aviso) await CD.rpc("publicar_aviso", { p_titulo: fila.titulo, p_texto: fila.pregunta, p_boton: "", p_fijo: fijo, p_foro: nuevo.id });
        await anim; await refrescar(); abrirForo(nuevo.id);
      } catch (er) { await anim; CD.toast(CD.errTexto(er)); }
    };
  }

  /* ===================== panel de moderación / administración ===================== */
  let panel = null;
  const pendientes = () => {
    const g = {};
    E.denuncias.filter(d => d.estado === "pendiente").forEach(d => { (g[d.msg] = g[d.msg] || []).push(d); });
    return Object.entries(g).filter(([mid]) => { const { m } = msgPorId(mid); return m && !m.eliminado; });
  };
  function abrirPanel(tab, uid) {
    if (!esMod) return;
    if (panel) panel.v.cerrar();
    const v = CD.modal("", "panel", () => { panel = null; });
    panel = { v, tab: tab || "usuarios", uid: uid || null, busca: "" };
    pintarPanel();
    v.addEventListener("click", clickPanel);
    v.addEventListener("input", e => { if (e.target.matches("[data-buscar]")) { panel.busca = e.target.value; pintarListaUsuarios(); } });
    v.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      if (f.dataset.form === "aviso") {
        hacer(CD.rpc("publicar_aviso", { p_titulo: f.titulo.value.trim(), p_texto: f.texto.value.trim(), p_boton: f.boton.value, p_fijo: f.fijo.checked, p_foro: null }), "Aviso publicado en el inicio.").then(() => pintarPanel());
      }
    });
  }
  function refrescarPanel() { if (panel) pintarPanel(); }
  function pintarPanel() {
    const v = panel.v, pend = pendientes(), sol = E.solicitudes.filter(s => s.estado === "pendiente");
    const tabs = [["usuarios", "Usuarios"], ["denuncias", "Denuncias" + (pend.length ? " (" + pend.length + ")" : "")], ["solicitudes", "Solicitudes" + (sol.length ? " (" + sol.length + ")" : "")]];
    if (esAdmin) { const rp = E.recuperaciones.filter(r => r.estado === "pendiente").length; tabs.push(["avisos", "Avisos"], ["recuperaciones", "Recuperaciones" + (rp ? " (" + rp + ")" : "")]); }
    tabs.push(["registro", "Registro"]);
    if (esAdmin) tabs.push(["datos", "Datos"]);
    let c = "";
    if (panel.tab === "usuarios") c = '<div class="pn-usuarios"><div class="pn-lista"><input data-buscar placeholder="Buscar usuario…" value="' + esc(panel.busca) + '"><ul id="pnLista"></ul></div><div class="pn-detalle" id="pnDetalle"></div></div>';
    if (panel.tab === "denuncias") c = pend.length ? pend.map(([mid, ds]) => {
      const { f, m } = msgPorId(mid), u = CD.u(m.de);
      return '<div class="pn-caso"><div class="pn-caso-cab">' + CD.av(u, "act-av") + CD.firma(u) + '<span class="pn-num">' + ds.length + ' ' + (ds.length === 1 ? "denuncia" : "denuncias") + '</span></div>' +
        '<blockquote>' + esc(m.texto) + '</blockquote><p class="pn-meta">Foro #' + f.id + ' · ' + esc(f.titulo) + ' · Motivos: ' + esc([...new Set(ds.map(d => d.motivo))].join(", ")) +
        ' · Denunciado por ' + esc(ds.map(d => nombre(d.por)).join(", ")) + '</p><div class="dlg-pie izq"><button class="btn-aero" data-pn-borrar="' + mid + '">' + ic.basura + 'Borrar mensaje</button>' +
        '<button class="btn-vista" data-pn-advertir="' + u.id + '">' + ic.sobre + 'Advertir</button><button class="btn-vista" data-pn-ver="' + mid + '">Ver en el foro</button>' +
        '<button class="btn-vista" data-pn-descartar="' + mid + '">Descartar</button></div></div>';
    }).join("") : '<p class="pn-vacio">No hay denuncias pendientes. ✨</p>';
    if (panel.tab === "solicitudes") c = sol.length ? sol.map(s => {
      const u = CD.u(s.usuario), actual = s.campo === "edad" ? CD.edad(u) : u.perfil[s.campo];
      return '<div class="pn-caso"><div class="pn-caso-cab">' + CD.av(u, "act-av") + CD.firma(u) + '</div><p>Quiere cambiar <b>' + esc(nombreCampo(s.campo)) + '</b>: ' +
        esc(valorLegible(s.campo, actual) || "—") + ' → <b>' + esc(valorLegible(s.campo, s.valor)) + '</b></p><div class="dlg-pie izq"><button class="btn-aero" data-sol-si="' + s.id + '">Aprobar</button>' +
        '<button class="btn-vista" data-sol-no="' + s.id + '">Rechazar</button></div></div>';
    }).join("") : '<p class="pn-vacio">No hay solicitudes pendientes.</p>';
    if (panel.tab === "avisos") c = '<form data-form="aviso" class="col-form pn-aviso"><h4>' + ic.megafono + 'Nuevo aviso en el inicio</h4><label>Título<input name="titulo" required maxlength="60"></label>' +
      '<label>Texto<textarea name="texto" rows="3" required></textarea></label><label>Botón ¡CLIC ACÁ!<select name="boton"><option value="">Sin botón</option><option value="folleto">Lleva al folleto</option><option value="encuesta">Lleva a la encuesta</option></select></label>' +
      '<label class="check"><input type="checkbox" name="fijo"> Aviso fijo: nadie lo puede minimizar ni cerrar</label><button class="btn-aero">Publicar aviso</button></form>' +
      '<h4>Avisos publicados</h4><ul class="lista-simple"><li>Folleto (automático: se muestra hasta que cada persona abre el folleto)</li>' +
      E.avisos.map(a => '<li><b>' + esc(a.titulo) + '</b>' + (a.fijo ? " · fijo" : "") + ' <button class="link" data-aviso-borrar="' + a.id + '">Quitar</button></li>').join("") + '</ul>';
    if (panel.tab === "recuperaciones") c = E.recuperaciones.length ? E.recuperaciones.map(r => {
      const u = Object.values(E.usuarios).find(x => (x.perfil.correo || "") === r.correo);
      return '<div class="pn-caso"><div class="pn-caso-cab">' + (u ? CD.av(u, "act-av") + CD.firma(u) : "<b>Ninguna cuenta con ese correo</b>") + '<span class="pn-num">' + esc(r.estado) + '</span></div>' +
        '<p class="pn-meta">' + esc(r.correo) + ' · ' + CD.fecha(Date.parse(r.creado)) + '</p>' +
        (u && r.estado === "pendiente" ? '<div class="dlg-pie izq"><button class="btn-aero" data-pn-temporal="' + u.id + '">Generar contraseña temporal</button></div>' : "") + '</div>';
    }).join("") : '<p class="pn-vacio">Nadie ha pedido recuperar su contraseña.</p>';
    if (panel.tab === "registro") c = '<ul class="pn-log">' + E.registro.map(l => '<li><time>' + CD.fecha(CD.tsDe(l)) + '</time><b>' + esc(nombre(l.por)) + '</b> ' + esc(l.accion) +
      (l.motivo ? '<small>"' + esc(l.motivo) + '"</small>' : "") + '</li>').join("") + '</ul>';
    if (panel.tab === "datos") c = datosHTML();
    v.innerHTML = CD.cap(esAdmin ? "PANEL DE ADMINISTRACIÓN" : "PANEL DE MODERACIÓN", { icono: '<span class="cap-ico">' + CD.triangulo + '</span>' }) +
      CD.banda('<span class="banda-titulo">' + (esAdmin ? "Administración" : "Moderación") + '</span><span class="banda-sub">' + esc(yo.nombre) + '</span>') +
      '<div class="tabs">' + tabs.map(([k, n]) => '<button class="tab' + (k === panel.tab ? " sel" : "") + '" data-ptab="' + k + '">' + n + '</button>').join("") + '</div>' +
      '<div class="pn-cuerpo frag">' + c + '</div>';
    if (panel.tab === "usuarios") { pintarListaUsuarios(); pintarDetalle(); }
  }
  function pintarListaUsuarios() {
    const q = CD.norm(panel.busca), l = $("#pnLista"); if (!l) return;
    l.innerHTML = Object.values(E.usuarios).filter(u => !q || CD.norm(u.nombre).includes(q) || (esAdmin && (u.perfil.correo || "").includes(q)))
      .map(u => '<li><button class="gente' + (u.id === panel.uid ? " sel" : "") + '" data-pn-u="' + u.id + '">' + CD.av(u, "act-av") + '<span class="act-nom">' + CD.firma(u) +
        (u.suspendido ? '<span class="insignia susp">SUSPENDIDO</span>' : "") + '</span></button></li>').join("");
  }
  function pintarDetalle() {
    const d = $("#pnDetalle"); if (!d) return;
    if (!panel.uid) { d.innerHTML = '<p class="pn-vacio">Elige un usuario para ver sus datos.</p>'; return; }
    const u = CD.u(panel.uid), p = u.perfil, sePuede = u.id !== yo.id && (esAdmin || !CD.esMod(u));
    const fila = (k, val) => '<tr><th>' + k + '</th><td>' + val + '</td></tr>';
    const priv = b => b ? '<span class="vis vis-si">Público</span>' : '<span class="vis vis-no">Privado</span>';
    let t = fila("Nombre", esc(u.nombre) + " " + CD.rolBadge(u)) + fila("Rol", u.rol) + fila("Estado", u.suspendido ? "Suspendido" : "Activo") + fila("Registro", esc(u.registro || "—"));
    if (esAdmin) {
      const e = CD.edad(u);
      t += fila("Correo", esc(p.correo || "—")) +
        fila("Edad", (e != null ? e + " años" : "—") + " · " + (p.edadModo === "fecha" ? "dio fecha de nacimiento (" + esc(p.nacimiento) + ")" : "dio su año de nacimiento (" + esc(p.anio) + ")") + " " + priv(p.pub.edad)) +
        fila("Sexo", esc(p.sexo || "—")) + fila("Género", esc(p.genero || "—")) +
        fila("Estudia", p.estudia ? esc((CD.UNIS[p.uni] || {}).n + " · " + (CD.CARRERAS[p.carrera] || {}).n) + " " + priv(p.pub.estudios) : "No") +
        (p.estudia ? "" : fila("Trabaja", p.trabaja ? esc(p.ocupacion || "Sí") + " " + priv(p.pub.estudios) : "No")) +
        fila("Contraseña", '<code class="hash">cifrada con bcrypt (ni el admin la puede leer)</code>');
    } else {
      t += fila("Lo que muestra", CD.chips(u) || "Nada (perfil privado)") + fila("Datos privados", "Solo los ve un administrador");
    }
    const adv = E.registro.filter(l => l.accion.includes(u.nombre)).length;
    t += fila("Historial", adv + (adv === 1 ? " acción de moderación" : " acciones de moderación"));
    d.innerHTML = '<div class="pn-ficha"><div class="pn-foto">' + CD.avatar(u.av) + '</div><table>' + t + '</table></div>' +
      (sePuede ? '<div class="dlg-pie izq pn-acciones"><button class="btn-aero" data-pn-advertir="' + u.id + '">' + ic.sobre + 'Advertir</button>' +
        '<button class="btn-vista" data-pn-nombre="' + u.id + '">Restablecer nombre</button><button class="btn-vista" data-pn-foto="' + u.id + '">Restablecer foto</button>' +
        '<button class="btn-vista" data-pn-susp="' + u.id + '">' + (u.suspendido ? "Reactivar" : "Suspender") + '</button>' +
        (esAdmin && u.rol !== "admin" ? '<button class="btn-vista" data-pn-rol="' + u.id + '">' + (u.rol === "moderador" ? "Quitar moderador" : "Hacer moderador") + '</button>' : "") + '</div>' : "");
  }
  function datosHTML() {
    const us = Object.values(E.usuarios).filter(u => u.rol === "usuario" && u.perfil.privado);
    const cuenta = fn => { const r = {}; us.forEach(u => { const k = fn(u); if (k) r[k] = (r[k] || 0) + 1; }); return r; };
    const tabla = (tit, o) => '<table class="pn-tabla"><caption>' + tit + '</caption>' + Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) =>
      '<tr><td>' + esc(k) + '</td><td><div class="barra-prog fija"><i style="width:' + Math.round(n * 100 / us.length) + '%"></i></div></td><td>' + n + '</td></tr>').join("") + '</table>';
    return '<p>' + us.length + ' usuarios (sin contar moderación). Estos datos los ves completos porque eres administrador.</p><div class="pn-tablas">' +
      tabla("Universidad", cuenta(u => u.perfil.estudia ? (CD.UNIS[u.perfil.uni] || {}).c : u.perfil.trabaja ? "Trabaja" : "Ni estudia ni trabaja")) +
      tabla("Carrera", cuenta(u => u.perfil.estudia ? (CD.CARRERAS[u.perfil.carrera] || {}).n : null)) +
      tabla("Género", cuenta(u => u.perfil.genero)) + tabla("Sexo", cuenta(u => u.perfil.sexo)) +
      tabla("Edad informada con", cuenta(u => u.perfil.edadModo === "fecha" ? "Fecha de nacimiento" : "Año de nacimiento")) + '</div>' +
      '<div class="dlg-pie izq"><button class="btn-aero" data-csv>Descargar CSV</button></div>';
  }
  function csv() {
    const col = ["usuario", "rol", "correo", "edad", "modo_edad", "nacimiento_o_anio", "sexo", "genero", "estudia", "universidad", "carrera", "trabaja", "ocupacion", "estudios_publicos", "edad_publica", "registro"];
    const q = s => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
    const filas = Object.values(E.usuarios).filter(u => u.perfil.privado).map(u => { const p = u.perfil; return [u.nombre, u.rol, p.correo, CD.edad(u), p.edadModo, p.edadModo === "fecha" ? p.nacimiento : p.anio, p.sexo, p.genero,
      p.estudia ? "si" : "no", p.estudia ? (CD.UNIS[p.uni] || {}).n : "", p.estudia ? (CD.CARRERAS[p.carrera] || {}).n : "", p.trabaja ? "si" : "no", p.ocupacion || "", p.pub.estudios ? "si" : "no", p.pub.edad ? "si" : "no", u.registro].map(q).join(","); });
    const b = new Blob(["﻿" + col.join(",") + "\n" + filas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "cuidandroga-usuarios.csv"; a.click();
  }
  async function clickPanel(e) {
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    if (d.ptab) { panel.tab = d.ptab; pintarPanel(); }
    else if (d.pnU) { panel.uid = d.pnU; pintarListaUsuarios(); pintarDetalle(); }
    else if (d.pnBorrar) { const ds = E.denuncias.find(x => x.msg === +d.pnBorrar); await borrarMensaje(+d.pnBorrar, ds && ds.motivo); }
    else if (d.pnAdvertir) await advertir(d.pnAdvertir);
    else if (d.pnVer) { const { f } = msgPorId(d.pnVer); panel.v.cerrar(); if (f) abrirForo(f.id, +d.pnVer); }
    else if (d.pnDescartar) { await hacer(CD.rpc("descartar_denuncias", { p_id: +d.pnDescartar }), "Denuncias descartadas."); pintarPanel(); }
    else if (d.pnTemporal) {
      const clave = await hacer(CD.rpc("clave_temporal", { p_uid: d.pnTemporal }));
      if (clave) { pintarPanel(); CD.modal(CD.cap("CONTRASEÑA TEMPORAL") + '<div class="dlg-cuerpo"><p>Envíale esta contraseña a ' + esc(CD.u(d.pnTemporal).nombre) + ' por correo o Instagram. Al entrar se le va a pedir cambiarla.</p><div class="correo-demo"><code>' + esc(clave) + '</code></div><div class="dlg-pie"><button class="btn-aero" data-cerrar>Listo</button></div></div>', "dialogo chico"); }
    }
    else if (d.pnNombre) {
      const u = CD.u(d.pnNombre);
      if (!(await CD.confirmar("RESTABLECER NOMBRE", "Vamos a cambiar " + u.nombre + " por un nombre temporal hasta que elija otro.", "Restablecer"))) return;
      await hacer(CD.rpc("restablecer_nombre", { p_uid: u.id }), "Nombre restablecido."); pintarPanel();
    } else if (d.pnFoto) {
      await hacer(CD.rpc("restablecer_foto", { p_uid: d.pnFoto }), "Foto restablecida."); pintarPanel();
    } else if (d.pnSusp) {
      const u = CD.u(d.pnSusp);
      await hacer(CD.rpc("suspender", { p_uid: u.id, p_valor: !u.suspendido }), u.suspendido ? "Cuenta reactivada." : "Cuenta suspendida."); pintarPanel();
    } else if (d.pnRol) {
      const u = CD.u(d.pnRol);
      await hacer(CD.rpc("cambiar_rol", { p_uid: u.id, p_rol: u.rol === "moderador" ? "usuario" : "moderador" }), "Rol actualizado."); pintarPanel();
    } else if (d.solSi || d.solNo) {
      await hacer(CD.rpc("resolver_solicitud", { p_id: +(d.solSi || d.solNo), p_ok: !!d.solSi }), d.solSi ? "Cambio aprobado." : "Cambio rechazado."); pintarPanel();
    } else if (d.avisoBorrar) { await hacer(CD.rpc("quitar_aviso", { p_id: +d.avisoBorrar }), "Aviso quitado."); pintarPanel(); }
    else if (b.hasAttribute("data-csv")) csv();
  }

  /* ===================== clics ===================== */
  document.addEventListener("click", e => {
    const t = e.target;
    if (panel && panel.v.contains(t)) return;
    let b;
    if ((b = t.closest("[data-panel-usuario]"))) return abrirPanel("usuarios", b.dataset.panelUsuario);
    if ((b = t.closest("[data-perfil]"))) return abrirPerfil(b.dataset.perfil);
    if ((b = t.closest("[data-foro]"))) { const id = +b.dataset.foro; if (b.classList.contains("clic-aca") || b.classList.contains("tarea") || !abierto || abierto.id !== id) abrirForo(id); return; }
    if ((b = t.closest("[data-like]"))) return darLike(b.dataset.like);
    if ((b = t.closest("[data-den]"))) return denunciar(b.dataset.den);
    if ((b = t.closest("[data-borrar]"))) return borrarMensaje(b.dataset.borrar);
    if ((b = t.closest("[data-advertir]"))) return advertir(b.dataset.advertir);
    if ((b = t.closest("[data-votar]"))) { const [fid, op] = b.dataset.votar.split(":"); return votar(+fid, +op); }
    if ((b = t.closest("[data-desvotar]"))) return hacer(CD.tabla(CD.sb.from("votos").delete().match({ foro_id: +b.dataset.desvotar, usuario: yo.id })));
    if ((b = t.closest("[data-destacar]"))) { const f = foro(b.dataset.destacar); return hacer(CD.rpc("destacar_foro", { p_id: f.id, p_valor: !f.destacado })); }
    if ((b = t.closest("[data-resp]"))) {
      if (necesitaCuenta("responder")) return;
      const { m } = msgPorId(b.dataset.resp); abierto.para = m.de;
      $("#hmPara").textContent = nombre(m.de);
      const { f } = msgPorId(m.id); const ta = $("#hmTexto"); if (f.mensajes[0].id !== m.id && !ta.value) ta.value = nombre(m.de) + " ";
      ta.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => ta.focus(), 300); return;
    }
    if (t.closest("[data-min-foro]")) { minimizados.push(abierto.id); abierto.v.cerrar(); return pintarTareas(); }
    if (t.closest("[data-login]")) { const c = t.closest(".capa"); if (c) c.firstElementChild.cerrar(); return abrirLogin(); }
    if (t.closest("[data-panel]")) return abrirPanel();
    if ((b = t.closest("[data-noti]"))) {
      const n = (E.notis[yo.id] || []).find(x => String(x.id) === b.dataset.noti); if (!n) return;
      const d = (TIPOS[n.tipo] || (() => ({})))(n);
      if (d.panel && esMod) return abrirPanel(d.panel);
      if (d.cuenta) return abrirCuenta(n.tipo === "solicitudRes" ? "seguridad" : "perfil");
      if (d.foro) {
        const f = foro(d.foro); if (!f) return;
        const quien = n.tipo === "borrado" ? f.mensajes.find(m => m.eliminado && m.de === yo.id) : n.de ? f.mensajes.slice().reverse().find(m => m.de === n.de) : null;
        return abrirForo(d.foro, quien && quien.id);
      }
      return;
    }
    if ((b = t.closest("[data-aviso-min]"))) { const id = b.closest("[data-aviso]").dataset.aviso; CD.prefs.min["aviso-" + id] = !CD.prefs.min["aviso-" + id]; CD.guardarPrefs(); return pintarAvisos(); }
    if ((b = t.closest("[data-aviso-x]"))) {
      const id = b.closest("[data-aviso]").dataset.aviso;
      if (yo) { (E.avisosCerrados[yo.id] = E.avisosCerrados[yo.id] || {})[id] = true; pintarAvisos(); CD.tabla(CD.sb.from("avisos_cerrados").insert({ usuario: yo.id, aviso_id: id })).catch(er => CD.toast(CD.errTexto(er))); return; }
      avisosCerradosAnon[id] = true; return pintarAvisos();
    }
    if ((b = t.closest("[data-lat-min]"))) { const k = b.closest("[data-lat]").dataset.lat; CD.prefs.min[k] = !CD.prefs.min[k]; CD.guardarPrefs(); return pintarMin(); }
    if (t.closest("#notiCerrar")) { if (yo) { E.notis[yo.id] = []; pintarNotis(); hacer(CD.tabla(CD.sb.from("notificaciones").delete().eq("para", yo.id))); } return; }
  });
  $("#btnCuenta").onclick = () => yo ? abrirCuenta() : abrirLogin();
  $("#btnPublicar").onclick = abrirPublicar;
  $("#btnPanel").onclick = () => abrirPanel();
  CD.botonTema($("#btnTema"));

  function pintarTodo() { pintarBarra(); pintarAvisos(); pintarTablones(); pintarNotis(); pintarActivos(); pintarMin(); if (abierto) pintarHilo(true); }
  pintarMin(); pintarBarra();
  $("#tablones").innerHTML = '<div class="cargando"><div class="barra-prog"><i></i></div><p>Cargando el foro…</p></div>';
  (async () => {
    try { E = await CD.cargar(); }
    catch (e) { $("#tablones").innerHTML = '<div class="cargando"><p>No pude conectar con el servidor de CUIDANDROGA. Revisa tu internet y recarga la página.</p></div>'; return; }
    yo = CD.yo(); esMod = CD.esMod(yo); esAdmin = CD.esAdmin(yo);
    pintarTodo();
    if (yo && yo.debeCambiarClave) setTimeout(() => abrirCuenta("seguridad"), 600);
    else if (yo && yo.debeCambiarNombre) setTimeout(() => abrirCuenta("perfil"), 600);
    const latido = () => { if (yo) CD.sb.from("perfiles").update({ ultima_vez: new Date().toISOString() }).eq("id", yo.id).then(() => {}); };
    latido(); setInterval(latido, 60000);
    setInterval(() => { if (!document.hidden) refrescar(true); }, 12000);
  })();
})();
