/* CUIDANDROGA · registro.js — registro paso a paso con resumen editable */
(function () {
  "use strict";
  const CD = window.CD, E = CD.E, $ = CD.$, esc = CD.esc;
  CD.botonTema($("#btnTema"));

  CD.sb.auth.getSession().then(r => {
    if (r.data && r.data.session) $("#regCuerpo").innerHTML = '<div class="reg-listo"><p>Ya tienes la sesión iniciada.</p><a class="btn-aero" href="index.html">Volver al foro</a></div>';
  });

  /* fecha local en formato aaaa-mm-dd (sin errores de zona horaria) */
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const hoy = () => new Date();
  const maxNacimiento = () => { const h = hoy(); return iso(new Date(h.getFullYear() - 18, h.getMonth(), h.getDate())); };
  const ANIO = hoy().getFullYear();

  const d = { edadModo: null, anio: "", cumplio: null, nacimiento: "", sexo: "", genero: "", correo: "", estudia: null, uni: "", carrera: "",
    trabaja: null, ocupacion: "", pub: { estudios: true, edad: true }, nombre: "", av: CD.avatarAzar(), pass: "", pass2: "", encuestaFinal: null };

  const edadCalc = () => {
    if (d.edadModo === "fecha" && d.nacimiento) return CD.edadDesdeFecha(d.nacimiento, hoy());
    if (d.edadModo === "anio" && d.anio && d.cumplio !== null) return ANIO - +d.anio - (d.cumplio ? 0 : 1);
    return null;
  };
  const botones = (campo, lista, valor) => '<div class="reg-ops">' + lista.map(o => '<button type="button" class="reg-op' + (valor === o[0] ? " sel" : "") + '" data-campo="' + campo + '" data-valor="' + esc(o[0]) + '">' + esc(o[1]) + '</button>').join("") + '</div>';
  const siNo = (campo, valor) => botones(campo, [["si", "Sí"], ["no", "No"]], valor === true ? "si" : valor === false ? "no" : "");

  const PASOS = [
    { id: "edad", et: "Edad", titulo: "¿Cuál es tu edad?",
      html: () => {
        let h = '<p class="reg-sub">Puedes poner tu edad o tu fecha de nacimiento completa.</p>' +
          botones("edadModo", [["anio", "Quiero poner mi edad"], ["fecha", "Quiero poner mi fecha de nacimiento"]], d.edadModo);
        if (d.edadModo === "anio") h += '<label>¿En qué año naciste?<input type="number" data-input="anio" min="1900" max="' + ANIO + '" value="' + esc(d.anio) + '" placeholder="Ej: 2003"></label>' +
          '<p class="reg-sub">¿Ya estuviste de cumpleaños este año?</p>' + siNo("cumplio", d.cumplio);
        if (d.edadModo === "fecha") h += '<label>Fecha de nacimiento<input type="date" data-input="nacimiento" min="1900-01-01" max="' + maxNacimiento() + '" value="' + esc(d.nacimiento) + '"></label>';
        const e = edadCalc();
        if (e != null) h += '<p class="reg-resultado' + (e < 18 ? " mal" : "") + '">' + (e < 18 ? "Tienes " + e + " años. Tienes que tener 18 años o más para registrarte." : "Entonces tienes <b>" + e + " años</b>.") + '</p>';
        return h;
      },
      leer: () => {
        if (!d.edadModo) return "Elige cómo quieres poner tu edad.";
        if (d.edadModo === "anio") {
          if (!(+d.anio >= 1900 && +d.anio <= ANIO)) return "Escribe un año válido.";
          if (d.cumplio === null) return "Cuéntanos si ya estuviste de cumpleaños este año.";
        } else if (!d.nacimiento) return "Elige tu fecha de nacimiento.";
        const e = edadCalc();
        if (e < 18) return "Tienes que tener 18 años o más para registrarte.";
        if (e > 110) return "Revisa la fecha: parece que hay un error.";
        return null;
      },
      res: () => edadCalc() != null ? edadCalc() + " años" + (d.edadModo === "fecha" ? " (" + d.nacimiento.split("-").reverse().join("/") + ")" : " (nació en " + d.anio + ")") : "" },
    { id: "sexo", et: "Sexo", titulo: "¿Cuál es tu sexo?", html: () => '<p class="reg-sub">El que te asignaron al nacer.</p>' + botones("sexo", CD.SEXOS.map(s => [s, s]), d.sexo),
      leer: () => d.sexo ? null : "Elige una opción.", res: () => d.sexo },
    { id: "genero", et: "Género", titulo: "¿Cuál es tu género?", html: () => '<p class="reg-sub">Cómo te identificas.</p>' + botones("genero", CD.GENEROS.map(s => [s, s]), d.genero),
      leer: () => d.genero ? null : "Elige una opción.", res: () => d.genero },
    { id: "correo", et: "Correo", titulo: "Coloca tu correo", html: () => '<p class="reg-sub">Lo usamos para enviarte un código si pierdes tu contraseña.</p><label>Correo<input type="email" data-input="correo" value="' + esc(d.correo) + '" placeholder="tucorreo@ejemplo.cl" autocomplete="email"></label>',
      leer: () => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo) ? "Escribe un correo válido." : null,
      remoto: async () => (await CD.rpc("correo_libre", { p_correo: d.correo })) ? null : "Ya hay una cuenta con ese correo.", res: () => d.correo },
    { id: "estudia", et: "Estudios", titulo: "¿Estudias?",
      html: () => siNo("estudia", d.estudia) + (d.estudia ? '<label>¿En qué universidad estás?<select data-input="uni"><option value="">Elige…</option>' +
        Object.entries(CD.UNIS).map(([k, u]) => '<option value="' + k + '"' + (d.uni === k ? " selected" : "") + '>' + esc(u.n) + '</option>').join("") + '</select></label>' +
        '<label>¿Qué carrera estudias?<select data-input="carrera"><option value="">Elige…</option>' +
        Object.entries(CD.CARRERAS).map(([k, c]) => '<option value="' + k + '"' + (d.carrera === k ? " selected" : "") + '>' + esc(c.n) + '</option>').join("") + '</select></label>' : ""),
      leer: () => d.estudia === null ? "Elige Sí o No." : d.estudia && (!d.uni || !d.carrera) ? "Elige tu universidad y tu carrera." : null,
      res: () => d.estudia === null ? "" : d.estudia ? CD.UNIS[d.uni] && CD.CARRERAS[d.carrera] ? CD.UNIS[d.uni].c + " · " + CD.CARRERAS[d.carrera].n : "Sí" : "No estudia" },
    { id: "trabaja", et: "Trabajo", titulo: "¿Trabajas?", visible: () => d.estudia === false,
      html: () => siNo("trabaja", d.trabaja) + (d.trabaja ? '<p class="reg-sub">¿De qué trabajas?</p>' + botones("ocupacion", CD.OCUPACIONES.map(o => [o, o]), d.ocupacion) : ""),
      leer: () => d.trabaja === null ? "Elige Sí o No." : d.trabaja && !d.ocupacion ? "Elige de qué trabajas." : null,
      res: () => d.trabaja === null ? "" : d.trabaja ? d.ocupacion || "Sí" : "No trabaja" },
    { id: "privacidad", et: "Privacidad", titulo: "¿Qué quieres que vean los demás?",
      html: () => '<p class="reg-sub">Tu nombre de usuario y tu foto siempre se ven. Lo puedes cambiar después en Configuración.</p>' +
        '<label class="check"><input type="checkbox" data-pub="estudios"' + (d.pub.estudios ? " checked" : "") + '> Mostrar mi universidad y carrera (o mi trabajo)</label>' +
        '<label class="check"><input type="checkbox" data-pub="edad"' + (d.pub.edad ? " checked" : "") + '> Mostrar mi edad</label>',
      leer: () => null, res: () => [d.pub.estudios ? "Estudios visibles" : "Estudios privados", d.pub.edad ? "edad visible" : "edad privada"].join(", ") },
    { id: "nombre", et: "Usuario", titulo: "Elige tu nombre de usuario",
      html: () => '<p class="reg-sub">Entre 3 y 20 letras, números, puntos o guiones bajos.</p><label>Nombre de usuario<span class="arroba"><b>@</b><input data-input="nombre" maxlength="20" value="' + esc(d.nombre) + '" autocomplete="username"></span></label>',
      leer: () => !CD.nombreValido(d.nombre) ? "Usa entre 3 y 20 letras, números, puntos o guiones bajos." : null,
      remoto: async () => (await CD.rpc("nombre_libre", { p_nombre: d.nombre })) ? null : "Ese nombre ya está ocupado.",
      res: () => d.nombre ? "@" + d.nombre : "" },
    { id: "foto", et: "Foto", titulo: "¿Quieres elegir una foto de usuario?",
      html: () => '<p class="reg-sub">Sube una foto o arma tu avatar.</p><div id="regEditor"></div>', leer: () => null, res: () => d.av.img ? "Foto subida" : "Avatar" },
    { id: "pass", et: "Contraseña", titulo: "Crea tu contraseña",
      html: () => '<label>Contraseña<input type="password" data-input="pass" value="' + esc(d.pass) + '" autocomplete="new-password"></label><ul class="reglas">' +
        CD.reglasPass(d.pass).map(r => '<li class="' + (r.ok ? "ok" : "") + '">' + r.t + '</li>').join("") + '</ul>' +
        '<label>Repite la contraseña<input type="password" data-input="pass2" value="' + esc(d.pass2) + '" autocomplete="new-password"></label>',
      leer: () => !CD.passFuerte(d.pass) ? "La contraseña todavía no cumple todo." : d.pass !== d.pass2 ? "Las contraseñas no coinciden." : null,
      res: () => d.pass ? "••••••••" : "" },
    { id: "encuesta", et: "Encuesta final", titulo: "¿Quieres contestar nuestra encuesta final?", html: () => siNo("encuestaFinal", d.encuestaFinal),
      leer: () => d.encuestaFinal === null ? "Elige Sí o No." : null, res: () => d.encuestaFinal === null ? "" : d.encuestaFinal ? "Sí" : "No" },
    { id: "resumen", et: "Resumen", titulo: "Revisa tus datos",
      html: () => '<p class="reg-sub">Si algo está mal, cámbialo acá mismo.</p><table class="reg-tabla">' + visibles().filter(p => p.id !== "resumen").map(p =>
        '<tr><th>' + p.et + '</th><td>' + (p.id === "foto" ? '<span class="act-av">' + CD.avatar(d.av) + '</span>' : esc(p.res())) + '</td><td><button type="button" class="link" data-ir="' + p.id + '">Cambiar</button></td></tr>').join("") + '</table>',
      leer: () => null, res: () => "" }
  ];
  const visibles = () => PASOS.filter(p => !p.visible || p.visible());
  let actual = "edad", editando = false, editor = null;
  const vistos = new Set(["edad"]);

  function pintar() {
    const vis = visibles(), i = vis.findIndex(p => p.id === actual), p = vis[i];
    $("#regPaso").innerHTML = '<h2>' + p.titulo + '</h2>' + p.html() + '<p class="error" hidden></p>';
    $("#regAv").innerHTML = CD.avatar(d.av);
    $("#regAtras").hidden = i === 0 || editando;
    $("#regSig").textContent = p.id === "resumen" ? "Crear cuenta" : editando ? "Listo" : "Siguiente";
    $("#regPuntos").innerHTML = vis.map((q, j) => '<i class="' + (j < i ? "hecho" : j === i ? "ahora" : "") + '" title="' + q.et + '"></i>').join("");
    $("#regRevisa").innerHTML = vis.filter(q => q.id !== "resumen" && q.id !== actual && vistos.has(q.id) && q.res()).map(q => '<li><button type="button" data-ir="' + q.id + '"><small>' + q.et + '</small>' +
      (q.id === "foto" ? '<span class="act-av">' + CD.avatar(d.av) + '</span>' : esc(q.res())) + '</button></li>').join("") || '<li class="vacio">Acá vas a ver tus respuestas.</li>';
    if (p.id === "foto") editor = CD.editorAvatar($("#regEditor"), d.av, av => { d.av = av; $("#regAv").innerHTML = CD.avatar(av); });
  }
  function error(t) { const e = $("#regPaso .error"); e.textContent = t; e.hidden = false; }
  function ir(id, edit) { actual = id; vistos.add(id); editando = !!edit; pintar(); const f = $("#regPaso input:not([type=checkbox]):not([type=file]),#regPaso select"); if (f) f.focus(); }

  $("#regSig").onclick = async () => {
    const vis = visibles(), i = vis.findIndex(p => p.id === actual), p = vis[i];
    const err = p.leer(); if (err) return error(err);
    if (p.remoto) {
      $("#regSig").disabled = true;
      let r; try { r = await p.remoto(); } catch (e) { r = "No pude conectar con el servidor. Revisa tu internet."; }
      $("#regSig").disabled = false;
      if (r) return error(r);
    }
    const falta = vis.find(q => q.id !== "resumen" && q.leer());
    if (p.id === "resumen") { if (falta) { ir(falta.id, true); return error(falta.leer()); } return crear(); }
    if (editando) return ir(falta ? falta.id : "resumen", true);
    ir(vis[i + 1].id);
  };
  $("#regAtras").onclick = () => { const vis = visibles(), i = vis.findIndex(p => p.id === actual); if (i > 0) ir(vis[i - 1].id); };

  document.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.campo) {
      const c = b.dataset.campo, v = b.dataset.valor;
      d[c] = v === "si" ? true : v === "no" ? false : v;
      if (c === "edadModo") { d.cumplio = d.cumplio; }
      if (c === "estudia" && d.estudia === false) { d.uni = ""; d.carrera = ""; }
      if (c === "estudia" && d.estudia === true) { d.trabaja = null; d.ocupacion = ""; }
      if (c === "trabaja" && d.trabaja === false) d.ocupacion = "";
      pintar();
    } else if (b.dataset.ir) {
      const llego = visibles().some(p => p.id === b.dataset.ir) && (editando || actual === "resumen" || vistos.has(b.dataset.ir));
      if (llego) ir(b.dataset.ir, actual === "resumen" || editando);
    }
  });
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.input) {
      d[t.dataset.input] = t.value.trim ? (t.dataset.input.startsWith("pass") ? t.value : t.value.trim()) : t.value;
      if (!t.dataset.input.startsWith("pass")) pintarRevisa();
      if (t.dataset.input === "pass") $("#regPaso .reglas").innerHTML = CD.reglasPass(d.pass).map(r => '<li class="' + (r.ok ? "ok" : "") + '">' + r.t + '</li>').join("");
      if (t.dataset.input === "anio" || t.dataset.input === "nacimiento") {
        const res = $("#regPaso .reg-resultado"), e2 = edadCalc();
        if (e2 != null) {
          const h = e2 < 18 ? "Tienes " + e2 + " años. Tienes que tener 18 años o más para registrarte." : "Entonces tienes <b>" + e2 + " años</b>.";
          if (res) { res.innerHTML = h; res.classList.toggle("mal", e2 < 18); } else $("#regPaso .error").insertAdjacentHTML("beforebegin", '<p class="reg-resultado' + (e2 < 18 ? " mal" : "") + '">' + h + '</p>');
        }
      }
    }
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.pub) d.pub[t.dataset.pub] = t.checked;
    if (t.tagName === "SELECT" && t.dataset.input) d[t.dataset.input] = t.value;
    if (t.dataset.pub || t.tagName === "SELECT") pintarRevisa();
  });
  function pintarRevisa() {
    const vis = visibles();
    $("#regRevisa").innerHTML = vis.filter(q => q.id !== "resumen" && q.id !== actual && vistos.has(q.id) && q.res()).map(q => '<li><button type="button" data-ir="' + q.id + '"><small>' + q.et + '</small>' +
      (q.id === "foto" ? '<span class="act-av">' + CD.avatar(d.av) + '</span>' : esc(q.res())) + '</button></li>').join("");
  }
  $("#regCuerpo").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); $("#regSig").click(); } });

  async function crear() {
    const datos = { nombre: d.nombre, correo: d.correo, clave: d.pass, edadModo: d.edadModo, nacimiento: d.nacimiento || null, anio: d.anio ? +d.anio : null,
      cumplio: d.cumplio, sexo: d.sexo, genero: d.genero, estudia: d.estudia, uni: d.uni, carrera: d.carrera, trabaja: d.trabaja, ocupacion: d.ocupacion,
      pubEstudios: d.pub.estudios, pubEdad: d.pub.edad, av: d.av, encuestaFinal: d.encuestaFinal };
    $("#regSig").disabled = true;
    const anim = CD.progreso("Creando tu cuenta…", "Guardando tus datos en CUIDANDROGA", 1600);
    try {
      const correo = await CD.rpc("registrar", { d: datos });
      const r = await CD.sb.auth.signInWithPassword({ email: correo, password: d.pass });
      if (r.error) throw r.error;
      await anim;
      location.href = d.encuestaFinal ? "encuesta.html" : "index.html";
    } catch (e) { await anim; $("#regSig").disabled = false; error(CD.errTexto(e)); }
  }
  pintar();
})();
