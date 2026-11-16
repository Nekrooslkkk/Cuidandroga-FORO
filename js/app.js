/* CUIDANDROGA · app.js (prototipo del foro) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var YO = "@usuario"; // marcador del usuario actual en los datos

  /* ---------- estado guardado en el navegador ---------- */
  var E = { likes: {}, flags: {}, extras: {}, nuevos: [], nombre: YO, notisMin: false, notisVacias: false, leidos: {} };
  try { var g = JSON.parse(localStorage.getItem("cd_estado") || "null"); if (g) for (var k in g) E[k] = g[k]; } catch (e) {}
  function guardar() { try { localStorage.setItem("cd_estado", JSON.stringify(E)); } catch (e) {} }

  var vivos = {};      // mensajes que llegan en vivo (solo esta sesión)
  var noLeidos = {};   // foros con mensajes nuevos
  var notis = E.notisVacias ? [] : CD.notis.slice();

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nombre(h) { return h === YO ? E.nombre : h; }
  function foros() { return E.nuevos.concat(CD.foros); }
  function foro(id) { return foros().filter(function (f) { return f.id === id; })[0]; }
  function mensajes(f) { return f.mensajes.concat(E.extras[f.id] || [], vivos[f.id] || []); }

  /* ---------- fotos de perfil (SVG) ---------- */
  var nAv = 0;
  function datosUsuario(h) {
    if (h === YO) return { tono: 155, f: 0, on: true };
    return CD.usuarios[h] || { tono: (h.length * 47) % 360, f: h.length % 3, on: true };
  }
  function avatar(h) {
    var u = datosUsuario(h), t = u.tono, id = "av" + (nAv++);
    var siluetas = [
      // pelo corto
      '<circle cx="50" cy="55" r="15"/><path d="M35 52c0-11 7-17 15-17s15 6 15 17c-3-5-8-8-15-8s-12 3-15 8z" opacity=".35" fill="#000"/><path d="M18 104c2-20 15-31 32-31s30 11 32 31z"/>',
      // pelo largo
      '<path d="M33 59c-2-18 6-27 17-27s19 9 17 27c0 8 3 14 7 18H26c4-4 7-10 7-18z" opacity=".5" fill="#000"/><circle cx="50" cy="55" r="14"/><path d="M18 104c2-20 15-31 32-31s30 11 32 31z"/>',
      // jockey
      '<circle cx="50" cy="57" r="14"/><path d="M35 52c0-10 7-15 15-15s15 5 15 15H35zM63 50h13c1 0 1 3 0 3H63z" opacity=".6" fill="#000"/><path d="M18 104c2-20 15-31 32-31s30 11 32 31z"/>',
      // moderación
      '<path d="M50 34l24 9v17c0 17-10 29-24 34C36 89 26 77 26 60V43z"/><path d="M40 62l7 7 14-15" fill="none" stroke="hsl(' + t + ',60%,32%)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
    ];
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><radialGradient id="' + id + 'b" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="hsl(' + t + ',75%,82%)"/><stop offset=".55" stop-color="hsl(' + t + ',58%,52%)"/><stop offset="1" stop-color="hsl(' + t + ',62%,24%)"/></radialGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(' + t + ',35%,97%)"/><stop offset="1" stop-color="hsl(' + t + ',30%,74%)"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#' + id + 'b)"/>' +
      '<ellipse cx="50" cy="104" rx="60" ry="18" fill="#fff" opacity=".18"/>' +
      '<g fill="url(#' + id + 's)" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">' + siluetas[u.f] + '</g>' +
      '<path d="M0 0h100v38C70 30 30 30 0 44z" fill="url(#' + id + 'r)"/>' +
      '</svg>';
  }
  function miniAv(h) { return '<span class="mini-av">' + avatar(h) + '</span>'; }

  /* ---------- tablones ---------- */
  function pintarTablones() {
    $("#tablones").innerHTML = foros().map(function (f) {
      var u = datosUsuario(f.autor), n = mensajes(f).length;
      return '<button class="tablon" data-foro="' + f.id + '">' +
        '<div class="cap"><span class="cap-titulo">' + esc(f.titulo) + '</span></div>' +
        '<div class="t-preg"><span>' + esc(f.pregunta) + '</span></div>' +
        '<div class="t-foto">' + avatar(f.autor) +
          (noLeidos[f.id] ? '<span class="t-nuevo"></span>' : '') +
          '<div class="t-pie"><div><b>' + esc(nombre(f.autor)) + '</b><span class="t-foro"><span class="punto' + (u.on ? '' : ' off') + '"></span>Foro #' + f.id + '</span></div>' +
          '<span class="t-cont">' + n + '</span></div>' +
        '</div></button>';
    }).join("");
  }

  /* ---------- participantes ---------- */
  function pintarParticipantes() {
    var vistos = {}, lista = [];
    foros().forEach(function (f) {
      mensajes(f).forEach(function (m) {
        if (!vistos[m.de] && m.de !== YO) { vistos[m.de] = f.id; lista.push(m.de); }
      });
    });
    $("#participantes").innerHTML = lista.slice(0, 16).map(function (h) {
      return '<button class="part" data-foro="' + vistos[h] + '" title="' + esc(h) + '">' + avatar(h) +
        '<span class="punto' + (datosUsuario(h).on ? '' : ' off') + '"></span></button>';
    }).join("");
  }

  /* ---------- ¿Sabías que? (cambia cada día) ---------- */
  function pintarSabias() {
    var hoy = new Date(), ini = new Date(hoy.getFullYear(), 0, 0);
    var dia = Math.floor((hoy - ini) / 864e5);
    $("#sabiasTexto").textContent = CD.sabias[dia % CD.sabias.length];
  }

  /* ---------- notificaciones ---------- */
  function pintarNotis() {
    $("#notis").classList.toggle("min", !!E.notisMin);
    $("#notiLista").innerHTML = notis.map(function (n, i) {
      if (n.tipo === "mod") {
        return '<button class="noti mod" data-noti="' + i + '"><div class="noti-cab"><span>Mensaje nuevo de moderación</span><span>Foro #' + n.foro + '</span></div>' +
          '<div class="noti-txt">Tu mensaje ha sido moderado y eliminado por "' + esc(n.por) + '"<span class="noti-cita">"' + esc(n.cita) + '"</span></div></button>';
      }
      return '<button class="noti" data-noti="' + i + '"><div class="noti-cab"><span>MENSAJE NUEVO EN EL FORO</span><span>Foro #' + n.foro + '</span></div>' +
        '<div class="noti-us">' + miniAv(n.de) + esc(nombre(n.de)) + '</div></button>';
    }).join("");
  }

  /* ---------- ventana del foro (estilo Hotmail) ---------- */
  var abierto = null, sel = 0;

  function idMsg(f, i) { return f.id + "-" + i; }

  function pintarHilo() {
    var f = foro(abierto), ms = mensajes(f);
    $("#hiloCap").textContent = f.titulo + " - Foro #" + f.id;
    $("#hiloTitulo").textContent = f.titulo;

    $("#hmLista").innerHTML = ms.map(function (m, i) {
      var snip = m.eliminado ? "Mensaje eliminado por " + m.por : m.texto;
      return '<li class="hm-item' + (i === sel ? ' sel' : '') + (m.eliminado ? ' borrado' : '') + '" data-i="' + i + '">' + miniAv(m.de) +
        '<span class="hm-de">' + esc(nombre(m.de)) + '</span><span class="hm-hace">' + esc(m.hace) + '</span>' +
        '<span class="hm-snip">' + esc(snip.split("\n")[0]) + '</span></li>';
    }).join("");

    $("#hmConv").innerHTML = '<p class="hm-pregunta">' + esc(f.pregunta) + '</p>' + ms.map(function (m, i) {
      var id = idMsg(f, i), like = !!E.likes[id], flag = !!E.flags[id];
      var cuerpo = m.eliminado
        ? 'Mensaje eliminado por ' + esc(m.por) + (m.de === YO ? '<br><s>' + esc(m.texto) + '</s>' : '')
        : esc(m.texto);
      return '<article class="msg' + (i === 0 ? ' primero' : '') + (m.eliminado ? ' borrado' : '') + '" id="msg-' + i + '">' +
        '<div class="msg-cab">' + miniAv(m.de) + '<div class="msg-meta"><b>' + esc(nombre(m.de)) + '</b><br>Para: Foro #' + f.id + ' · ' + esc(m.hace) + '</div></div>' +
        '<div class="msg-txt">' + cuerpo + '</div>' +
        (m.eliminado ? '' :
        '<div class="msg-acc">' +
          '<button class="hm-btn" data-resp="' + i + '"><span class="ic ic-resp"></span>Responder</button>' +
          '<button class="hm-btn' + (like ? ' on' : '') + '" data-like="' + i + '"><span class="ic ic-like"></span>' + ((m.likes || 0) + (like ? 1 : 0)) + '</button>' +
          '<span class="hm-esp"></span>' +
          '<button class="hm-btn bandera' + (flag ? ' on' : '') + '" data-flag="' + i + '" title="Denunciar" aria-label="Denunciar"><span class="ic ic-flag"></span></button>' +
        '</div>') +
        '</article>';
    }).join("");

    var m = ms[sel], id = idMsg(f, sel);
    $("#hmLike").classList.toggle("on", !!E.likes[id]);
    $("#hmDenunciar").classList.toggle("on", !!E.flags[id]);
    $("#hmLike").disabled = $("#hmDenunciar").disabled = !!(m && m.eliminado);
  }

  function abrirForo(id, foco) {
    abierto = id; sel = foco || 0;
    delete noLeidos[id];
    cerrarRedactar();
    $("#capa").hidden = false;
    pintarHilo(); pintarTablones();
    enfocar(sel, !!foco);
  }
  function enfocar(i, mover) {
    var art = document.getElementById("msg-" + i);
    if (!art) return;
    if (mover) art.scrollIntoView({ block: "center", behavior: "smooth" });
    else $("#hmLectura").scrollTop = 0;
    art.classList.add("foco");
    setTimeout(function () { art.classList.remove("foco"); }, 1400);
  }
  function seleccionar(i) {
    sel = i;
    pintarHilo();
    enfocar(i, true);
  }

  function alternar(mapa, i) {
    var f = foro(abierto), id = idMsg(f, i);
    if (mensajes(f)[i].eliminado) return;
    if (mapa[id]) delete mapa[id]; else mapa[id] = true;
    guardar(); pintarHilo();
  }

  var paraQuien = null;
  function abrirRedactar(i) {
    var f = foro(abierto), m = mensajes(f)[i];
    paraQuien = m.de;
    $("#hmPara").textContent = nombre(m.de) + " · Foro #" + f.id;
    $("#hmRedactar").hidden = false;
    $("#hmTexto").value = i > 0 ? nombre(m.de) + " " : "";
    $("#hmRedactar").scrollIntoView({ block: "end", behavior: "smooth" });
    setTimeout(function () { $("#hmTexto").focus(); }, 250);
  }
  function cerrarRedactar() { $("#hmRedactar").hidden = true; $("#hmTexto").value = ""; }

  /* ---------- simulación en vivo ---------- */
  var cola = CD.enVivo.slice();
  function llegaMensaje() {
    if (!cola.length) return;
    var v = cola.shift();
    (vivos[v.foro] = vivos[v.foro] || []).push({ de: v.de, hace: "ahora", likes: 0, texto: v.texto });
    if (abierto === v.foro) { pintarHilo(); }
    else noLeidos[v.foro] = true;
    notis.unshift({ tipo: "foro", de: v.de, foro: v.foro });
    pintarNotis(); pintarTablones(); pintarParticipantes();
  }
  setInterval(llegaMensaje, 25000);

  /* ---------- eventos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-foro]");
    if (t) return abrirForo(+t.dataset.foro);

    var n = e.target.closest("[data-noti]");
    if (n) {
      var no = notis[+n.dataset.noti], f = foro(no.foro), ms = mensajes(f), idx = 0;
      ms.forEach(function (m, i) {
        if (no.tipo === "mod" ? m.eliminado : m.de === no.de) idx = i;
      });
      return abrirForo(no.foro, idx);
    }

    var li = e.target.closest(".hm-item");
    if (li) return seleccionar(+li.dataset.i);

    var b;
    if ((b = e.target.closest("[data-like]"))) return alternar(E.likes, +b.dataset.like);
    if ((b = e.target.closest("[data-flag]"))) return alternar(E.flags, +b.dataset.flag);
    if ((b = e.target.closest("[data-resp]"))) return abrirRedactar(+b.dataset.resp);

    if (e.target.closest("[data-cerrar]") || e.target.classList.contains("capa")) {
      var capa = e.target.closest(".capa");
      if (capa) { capa.hidden = true; if (capa.id === "capa") { abierto = null; $(".hilo").classList.remove("max"); } }
    }
  });

  $("#hmResponder").onclick = function () { abrirRedactar(0); };
  $("#hmLike").onclick = function () { alternar(E.likes, sel); };
  $("#hmDenunciar").onclick = function () { alternar(E.flags, sel); };
  $("#hmCancelar").onclick = cerrarRedactar;
  $("#hiloMax").onclick = function () { $(".hilo").classList.toggle("max"); };

  $("#hmRedactar").onsubmit = function (e) {
    e.preventDefault();
    var txt = $("#hmTexto").value.trim();
    if (!txt) return;
    (E.extras[abierto] = E.extras[abierto] || []).push({ de: YO, hace: "ahora", likes: 0, texto: txt });
    guardar(); cerrarRedactar();
    var f = foro(abierto);
    sel = mensajes(f).length - 1;
    pintarHilo(); pintarTablones();
    enfocar(sel, true);
  };

  $("#notiMin").onclick = function () { E.notisMin = !E.notisMin; guardar(); pintarNotis(); };
  $("#notiCerrar").onclick = function () { notis = []; E.notisVacias = true; E.notisMin = true; guardar(); pintarNotis(); };

  /* modo oscuro */
  function tituloTema() {
    var osc = document.documentElement.dataset.tema === "oscuro";
    $("#btnTema").title = osc ? "Modo claro" : "Modo oscuro";
    $("#btnTema").setAttribute("aria-label", $("#btnTema").title);
  }
  $("#btnTema").onclick = function () {
    var r = document.documentElement;
    r.dataset.tema = r.dataset.tema === "oscuro" ? "claro" : "oscuro";
    try { localStorage.setItem("cd_tema", r.dataset.tema); } catch (e) {}
    tituloTema();
  };

  /* publicar */
  $("#btnPublicar").onclick = function () { $("#capaPub").hidden = false; setTimeout(function () { $("#pubTitulo").focus(); }, 50); };
  $("#formPub").onsubmit = function (e) {
    e.preventDefault();
    var max = foros().reduce(function (a, f) { return Math.max(a, f.id); }, 0);
    var nuevo = { id: max + 1, autor: YO, titulo: $("#pubTitulo").value.trim(), pregunta: $("#pubPregunta").value.trim(),
      mensajes: [{ de: YO, hace: "ahora", likes: 0, texto: $("#pubTexto").value.trim() }] };
    E.nuevos.unshift(nuevo); guardar();
    this.reset(); $("#capaPub").hidden = true;
    pintarTablones(); abrirForo(nuevo.id);
  };

  /* cuenta */
  function pintarCuenta() {
    $("#cuentaAvatar").innerHTML = avatar(YO);
    $("#cuentaFoto").innerHTML = avatar(YO);
    $("#cuentaNombre").value = E.nombre;
  }
  $("#btnCuenta").onclick = function () { pintarCuenta(); $("#capaCuenta").hidden = false; };
  $("#formCuenta").onsubmit = function (e) {
    e.preventDefault();
    var v = $("#cuentaNombre").value.trim().replace(/\s+/g, "_");
    if (v && v[0] !== "@") v = "@" + v;
    E.nombre = v || YO; guardar();
    $("#capaCuenta").hidden = true;
    pintarTablones(); pintarNotis();
    if (abierto) pintarHilo();
  };

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".capa").forEach(function (c) { c.hidden = true; });
    abierto = null;
  });

  /* ---------- inicio ---------- */
  tituloTema(); pintarCuenta(); pintarSabias(); pintarTablones(); pintarParticipantes(); pintarNotis();
  setTimeout(llegaMensaje, 9000);
})();
