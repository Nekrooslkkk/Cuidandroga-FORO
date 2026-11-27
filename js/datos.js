/* CUIDANDROGA · datos simulados de la demo (usuarios, foros, encuestas) */
window.CD = window.CD || {};

/*
  Avatares: t = color (0-360), f = forma, a = accesorio
  formas: 0 pelo corto · 1 pelo largo · 2 jockey · 3 escudo (mod) · 4 estrella (admin) · 5 moño · 6 rapado
  accesorios: 0 nada · 1 lentes · 2 audífonos · 3 lentes de sol
  perfil.pub: lo que el usuario deja ver a todos (estudios/trabajo y edad)
  Las 3 cuentas de prueba tienen contraseña 1234 (guardada cifrada: sha256(sal:contraseña)).
*/
CD.SEMILLA = {
  usuarios: {
    pepito:  { nombre: "@PepitoPérez", rol: "usuario", on: false, av: { t: 205, f: 0, a: 1 },
      sal: "k9Qx2pLm", hash: "8c37d282da3f75e4b760f04b7bd9870cc42d8129b44a417927aaf0e24585d2d2",
      perfil: { edadModo: "fecha", nacimiento: "2004-03-14", sexo: "Masculino", genero: "Hombre", correo: "pepito.perez@ejemplo.cl",
        estudia: true, uni: "uch", carrera: "periodismo", pub: { estudios: true, edad: true } }, registro: "2026-11-02" },
    juan:    { nombre: "@JuanPérez", rol: "moderador", on: true, av: { t: 95, f: 3, a: 0 },
      sal: "Tr7vB1zA", hash: "e75245e53d79a39f3d999b5565386736b5913f5c8e506bf20b4a52ed06d5773a",
      perfil: { edadModo: "fecha", nacimiento: "1998-07-21", sexo: "Masculino", genero: "Hombre", correo: "juan.perez@ejemplo.cl",
        estudia: false, trabaja: true, ocupacion: "Salud", pub: { estudios: false, edad: false } }, registro: "2026-10-20" },
    admin:   { nombre: "@admin", rol: "admin", on: false, av: { t: 140, f: 4, a: 0 },
      sal: "Ad4mN8cW", hash: "cce571429770c217efc4e08ab476788dc0f02b34a2c33982207ce3175aa6954f",
      perfil: { edadModo: "fecha", nacimiento: "2003-05-02", sexo: "Prefiero no decirlo", genero: "Prefiero no decirlo", correo: "admin@cuidandroga.cl",
        estudia: true, uni: "unab", carrera: "periodismo", pub: { estudios: false, edad: false } }, registro: "2026-10-01" },

    cata:    { nombre: "@Cata_TDAH", on: true, av: { t: 145, f: 1, a: 0 }, perfil: { edadModo: "fecha", nacimiento: "2002-09-03", sexo: "Femenino", genero: "Mujer",
      correo: "cata.t@ejemplo.cl", estudia: true, uni: "uch", carrera: "derecho", pub: { estudios: false, edad: true } } },
    nacho:   { nombre: "@nachito.uc", on: true, av: { t: 200, f: 2, a: 0 }, perfil: { edadModo: "anio", anio: 2006, edad: 20, sexo: "Masculino", genero: "Hombre",
      correo: "nachito@ejemplo.cl", estudia: true, uni: "uc", carrera: "informatica", pub: { estudios: true, edad: true } } },
    javiera: { nombre: "@QF_Javiera", on: true, av: { t: 170, f: 5, a: 1 }, perfil: { edadModo: "fecha", nacimiento: "1995-01-28", sexo: "Femenino", genero: "Mujer",
      correo: "qf.javiera@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Salud", pub: { estudios: true, edad: false } } },
    benja:   { nombre: "@Benja_Valpo", on: false, av: { t: 30, f: 2, a: 2 }, perfil: { edadModo: "anio", anio: 1999, edad: 27, sexo: "Masculino", genero: "Hombre",
      correo: "benja.valpo@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Transporte y reparto", pub: { estudios: true, edad: true } } },
    mama:    { nombre: "@mamá_de_Tomi", on: true, av: { t: 320, f: 1, a: 0 }, perfil: { edadModo: "fecha", nacimiento: "1988-11-10", sexo: "Femenino", genero: "Mujer",
      correo: "mama.tomi@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Educación", pub: { estudios: false, edad: false } } },
    fran:    { nombre: "@Fran.ansiosa", on: true, av: { t: 270, f: 5, a: 2 }, perfil: { edadModo: "fecha", nacimiento: "2004-06-17", sexo: "Femenino", genero: "No binario",
      correo: "fran.a@ejemplo.cl", estudia: true, uni: "unab", carrera: "periodismo", pub: { estudios: true, edad: true } } },
    pato:    { nombre: "@DonPato62", on: false, av: { t: 50, f: 6, a: 1 }, perfil: { edadModo: "anio", anio: 1964, edad: 62, sexo: "Masculino", genero: "Hombre",
      correo: "donpato@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Independiente", pub: { estudios: false, edad: true } } },
    sofi:    { nombre: "@Sofi_insomne", on: true, av: { t: 230, f: 1, a: 3 }, perfil: { edadModo: "fecha", nacimiento: "2000-02-09", sexo: "Femenino", genero: "Mujer",
      correo: "sofi.ins@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Oficina y administración", pub: { estudios: true, edad: true } } },
    rodrigo: { nombre: "@Rodrigo_ing", on: true, av: { t: 100, f: 0, a: 0 }, perfil: { edadModo: "fecha", nacimiento: "1997-08-30", sexo: "Masculino", genero: "Hombre",
      correo: "rodrigo.ing@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Tecnología", pub: { estudios: true, edad: false } } },
    javi:    { nombre: "@Javi.lee", on: false, av: { t: 0, f: 2, a: 3 }, perfil: { edadModo: "fecha", nacimiento: "2005-04-22", sexo: "Masculino", genero: "Hombre",
      correo: "javi.lee@ejemplo.cl", estudia: true, uni: "uch", carrera: "derecho", pub: { estudios: true, edad: false } } },
    ignacia: { nombre: "@Ignacia_psico", on: true, av: { t: 185, f: 1, a: 1 }, perfil: { edadModo: "fecha", nacimiento: "1993-12-05", sexo: "Femenino", genero: "Mujer",
      correo: "ignacia.psi@ejemplo.cl", estudia: false, trabaja: true, ocupacion: "Salud", pub: { estudios: true, edad: true } } },
    tomas:   { nombre: "@Tomás_runner", on: true, av: { t: 120, f: 2, a: 2 }, perfil: { edadModo: "fecha", nacimiento: "2001-10-11", sexo: "Masculino", genero: "Hombre",
      correo: "tomas.run@ejemplo.cl", estudia: true, uni: "uc", carrera: "derecho", pub: { estudios: false, edad: true } } },
    mati:    { nombre: "@Mati_lol", on: false, av: { t: 260, f: 6, a: 2 }, perfil: { edadModo: "anio", anio: 2007, edad: 19, sexo: "Masculino", genero: "Género fluido",
      correo: "mati.lol@ejemplo.cl", estudia: true, uni: "unab", carrera: "informatica", pub: { estudios: true, edad: true } } },
    fena:    { nombre: "@Feña.mtz", on: true, av: { t: 340, f: 5, a: 0 }, perfil: { edadModo: "fecha", nacimiento: "2003-01-19", sexo: "Femenino", genero: "Mujer",
      correo: "fena.mtz@ejemplo.cl", estudia: true, uni: "uch", carrera: "periodismo", pub: { estudios: true, edad: true } } },
    pastis:  { nombre: "@pastis_al_toque", on: false, av: { t: 15, f: 2, a: 3 }, perfil: { edadModo: "anio", anio: 2006, edad: 20, sexo: "Prefiero no decirlo", genero: "Prefiero no decirlo",
      correo: "pastis99@ejemplo.cl", estudia: false, trabaja: false, pub: { estudios: false, edad: false } } }
  },

  /* min = hace cuántos minutos se escribió · likes = likes iniciales */
  foros: [
    { id: 1, autor: "cata", titulo: "Eso, el Samexid",
      pregunta: "¿Alguien más sintió que le cambió el día a día o soy yo nomás?",
      mensajes: [
        { de: "cata", min: 125, likes: 14, texto: "Me diagnosticaron TDAH a los 24, después de años pensando que era floja o desordenada. La psiquiatra me recetó Samexid hace tres semanas y les juro que es raro: por primera vez termino una tarea sin abrir otras siete pestañas.\n\nNo es que me sienta \"drogada\" ni nada, es más como si el ruido de fondo bajara. Igual tengo boca seca y almuerzo poco, y eso lo estoy conversando con ella.\n\nLes pregunto porque en mi casa no entienden mucho y me dicen que cuidado con volverme adicta. ¿A ustedes les pasó algo parecido al principio?" },
        { de: "rodrigo", min: 64, likes: 6, texto: "Me pasó igual. Lo del ruido de fondo es justo la descripción. Lo de la boca seca a mí se me pasó como a las 5 semanas, pero agua siempre a mano." },
        { de: "javiera", min: 58, likes: 11, texto: "Buena que lo estés hablando con tu psiquiatra. La lisdexanfetamina sí puede generar dependencia, por eso se usa con control médico, en la dosis indicada y sin subirla por cuenta propia. Con seguimiento es otra historia que tomarla \"a la mala\"." },
        { de: "fran", min: 40, likes: 3, texto: "Lo de la familia me identifica caleta. A mí me ayudó llevar a mi mamá a una consulta para que le explicaran." },
        { de: "cata", min: 22, likes: 2, texto: "Gracias de verdad. Lo de llevarlos a la consulta lo voy a hacer." }
      ] },
    { id: 2, autor: "rodrigo", titulo: "El bajón de la tarde",
      pregunta: "¿A qué hora se les pasa el efecto y cómo manejan el bajón?",
      encuesta: { pregunta: "¿A qué hora te llega el bajón?", publica: false, opciones: [
        { t: "Antes de las 15:00", votos: ["fena", "sofi"] },
        { t: "Entre las 15:00 y las 18:00", votos: ["rodrigo", "cata", "tomas", "ignacia", "javi"] },
        { t: "Después de las 18:00", votos: ["benja", "mati", "fran"] } ] },
      mensajes: [
        { de: "rodrigo", min: 300, likes: 9, texto: "Lo tomo a las 7:30 y como a las 17:00 me viene un bajón de ánimo y de energía bien notorio. Quedo irritable con todo el mundo y llego a la casa sin ganas de nada.\n\nLeí que a algunas personas les pasa cuando se va el efecto. ¿Les pasa? ¿Le comentaron a su médico o lo manejan con algo de rutina?" },
        { de: "ignacia", min: 240, likes: 12, texto: "Es bueno anotarlo: a qué hora empieza, cuánto dura, qué comiste. Con eso tu médico puede ajustar horario o dosis con datos, no a ojo." },
        { de: "tomas", min: 180, likes: 4, texto: "A mí me ayuda comer algo contundente apenas llego y salir a caminar. No lo arregla, pero lo baja." },
        { de: "fena", min: 120, likes: 1, texto: "Lo mismo me pasa pero a las 15:00 jajaja, somos el club del bajón." }
      ] },
    { id: 3, autor: "nacho", titulo: "Pruebas y pastillas prestadas",
      pregunta: "Un compañero me ofreció una para el certamen, ¿qué tan mala idea es?",
      mensajes: [
        { de: "nacho", min: 190, likes: 5, texto: "Estoy en semana de certámenes y voy atrasadísimo. Un compañero que tiene receta me dijo que me podía pasar un par de cápsulas para estudiar de corrido el fin de semana.\n\nYo no tengo diagnóstico de nada. Medio curso dice que \"todos lo hacen\" y que no pasa nada. Antes de hacer una tontera prefiero preguntar acá." },
        { de: "javiera", min: 130, likes: 21, texto: "Buena por preguntar. Es un medicamento con receta retenida y la dosis la ajusta un médico según cada persona. Sin evaluación no sabes cómo responde tu corazón ni tu presión, y las noches sin dormir suman. Si el problema es el atraso, la U suele tener apoyo académico y psicológico." },
        { de: "pepito", min: 125, likes: 0, eliminado: { por: "juan", motivo: "Promueve el consumo" }, texto: "[Viva el Samexid, la mejor droga]" },
        { de: "pastis", min: 95, likes: 0, texto: "tengo samexid sin receta, a luca la cápsula. escríbanme al dm y se las paso al toque" },
        { de: "ignacia", min: 62, likes: 8, texto: "Y ojo con lo de \"todos lo hacen\": la presión del curso pesa. Dormir y repartir el estudio rinde más que una noche de corrido." },
        { de: "mati", min: 45, likes: 2, texto: "Yo lo probé así una vez y no dormí en dos días, la prueba me fue peor igual. No lo recomiendo." }
      ] },
    { id: 4, autor: "fran", titulo: "No me da hambre",
      pregunta: "¿Cómo se acuerdan de comer si no sienten hambre en todo el día?",
      mensajes: [
        { de: "fran", min: 360, likes: 7, texto: "Desde que empecé el tratamiento me salto el almuerzo sin darme cuenta. A las 9 de la noche me ataca un hambre terrible y como cualquier cosa.\n\nBajé un par de kilos y no era la idea. ¿Qué hacen ustedes?" },
        { de: "cata", min: 300, likes: 5, texto: "Desayuno fuerte ANTES de tomarlo. Después del mediodía me cuesta, así que dejo snacks en la mochila." },
        { de: "javiera", min: 240, likes: 9, texto: "La baja de apetito y de peso son efectos conocidos. Si sigues bajando, coméntalo en tu control: a veces se ajusta, y una nutricionista ayuda bastante." },
        { de: "benja", min: 120, likes: 2, texto: "Alarma en el celular a las 13:30 que dice COME. Funciona jaja." }
      ] },
    { id: 5, autor: "benja", titulo: "Café + estimulantes",
      pregunta: "¿Puedo seguir con mis tres cafés diarios o es mucho?",
      encuesta: { pregunta: "¿Cuántos cafés tomas al día?", publica: true, opciones: [
        { t: "Ninguno", votos: ["mama", "fran"] },
        { t: "1 o 2", votos: ["tomas", "cata", "sofi", "ignacia", "nacho"] },
        { t: "3 o más", votos: ["benja", "rodrigo", "pato"] } ] },
      mensajes: [
        { de: "benja", min: 1500, likes: 4, texto: "Trabajo en turno de mañana y vivo a puro café. Desde que tomo medicación siento el corazón más acelerado los días que tomo los tres.\n\n¿Alguien redujo el café? ¿Se nota la diferencia?" },
        { de: "tomas", min: 1200, likes: 6, texto: "Bajé a uno y se me fue esa sensación de taquicardia. Igual lo conversé con el doctor porque me asusté." },
        { de: "javiera", min: 1080, likes: 10, texto: "La cafeína también es estimulante, así que los efectos pueden sumarse. Palpitaciones o dolor en el pecho son motivo para consultar, no para aguantar." }
      ] },
    { id: 6, autor: "sofi", titulo: "Dormir de nuevo",
      pregunta: "Lo tomo a las 8 y a la 1 AM sigo despierta, ¿a alguien le pasó?",
      mensajes: [
        { de: "sofi", min: 540, likes: 6, texto: "Llevo dos semanas durmiendo como 4 horas. Lo tomo a las 8 de la mañana, así que no entiendo por qué sigo tan activa en la noche.\n\nNo quiero dejarlo porque me está ayudando en la pega, pero así no se puede." },
        { de: "rodrigo", min: 480, likes: 3, texto: "Al principio me pasó. Se me ordenó cuando dejé las pantallas a las 23:00 y el café después de almuerzo." },
        { de: "ignacia", min: 360, likes: 7, texto: "El insomnio es de lo más común al empezar. Anótalo y llévalo al control: a veces se mueve el horario o la dosis." }
      ] },
    { id: 7, autor: "mama", titulo: "Mi hijo empieza tratamiento", destacado: true,
      pregunta: "Tomi tiene 9 años, ¿qué le pregunto al neurólogo antes de partir?",
      mensajes: [
        { de: "mama", min: 1440, likes: 13, texto: "Al Tomi le diagnosticaron TDAH y el neurólogo propuso empezar con medicación. Estoy nerviosa, leo cosas en internet que me asustan y otras que lo pintan como milagro.\n\nQuiero llegar preparada a la próxima consulta. ¿Qué le preguntarían ustedes?" },
        { de: "javiera", min: 1320, likes: 15, texto: "Buenas preguntas: cómo se va a controlar el peso y la talla, cada cuánto tomar presión y pulso, qué hacer si no come, y qué señales son para consultar al tiro." },
        { de: "fena", min: 1200, likes: 5, texto: "Mi hermano chico lo toma hace dos años. Lo que más nos sirvió fue hablar con el colegio para que todos estuvieran en la misma." }
      ] },
    { id: 8, autor: "javi", titulo: "Carrete el viernes",
      pregunta: "¿Es peligroso tomarse unas piscolas estando en tratamiento?",
      mensajes: [
        { de: "javi", min: 420, likes: 3, texto: "Tengo un cumpleaños el viernes y no quiero ser el fome que no toma nada. Pero estoy con medicación hace un mes.\n\n¿Alguien sabe si se puede o si es mejor saltarse la dosis ese día?" },
        { de: "mati", min: 360, likes: 2, texto: "Yo noté que con la pastilla no sentía lo curao y terminaba tomando el doble. Mala combinación." },
        { de: "javiera", min: 300, likes: 12, texto: "No te saltes ni cambies la dosis por tu cuenta. Lo del alcohol pregúntaselo a tu médico con tu caso concreto; y si tomas, que sea poco, con agua y comida." }
      ] },
    { id: 9, autor: "pato", titulo: "Receta retenida",
      pregunta: "¿Cómo funciona la receta para comprarlo en la farmacia?",
      mensajes: [
        { de: "pato", min: 2900, likes: 5, texto: "Me diagnosticaron de viejo, a los 61. Fui a la farmacia y no me lo quisieron vender porque la receta \"tenía que quedar retenida\". No entendí nada.\n\n¿Alguien me explica cómo es el trámite?" },
        { de: "javiera", min: 2800, likes: 9, texto: "Se vende con receta médica retenida: la farmacia se queda con la receta. Por eso cada compra necesita una receta vigente y el médico debe emitirla así." },
        { de: "cata", min: 1500, likes: 2, texto: "Don Pato, pídale al médico que le deje las recetas de los meses que siguen, así no anda corriendo." }
      ] },
    { id: 10, autor: "tomas", titulo: "Corazón a mil",
      pregunta: "Siento el pulso acelerado cuando entreno, ¿es normal?",
      mensajes: [
        { de: "tomas", min: 660, likes: 4, texto: "Salgo a trotar en la tarde y desde que tomo medicación el reloj me marca pulsaciones más altas que antes para el mismo ritmo.\n\nNo me siento mal, pero me tiene pensando." },
        { de: "javiera", min: 600, likes: 10, texto: "Puede subir la frecuencia cardíaca y la presión. Llévale los registros del reloj a tu médico. Si aparece dolor en el pecho, falta de aire o desmayo, es urgencia." },
        { de: "benja", min: 540, likes: 1, texto: "Qué bueno que lo midas, la mayoría ni se da cuenta." }
      ] },
    { id: 11, autor: "fena", titulo: "¿Lo dejo en vacaciones?",
      pregunta: "Quiero parar en febrero, ¿se puede así no más?",
      mensajes: [
        { de: "fena", min: 1440, likes: 6, texto: "En vacaciones no tengo que concentrarme en nada y me gustaría descansar de la medicación. Una amiga dice que lo deje de una, otra que no.\n\n¿Cómo lo hicieron ustedes?" },
        { de: "ignacia", min: 1200, likes: 8, texto: "Eso se planifica con el médico. Dejarlo sin indicación puede traer cansancio fuerte y ánimo bajo, sobre todo si se usó más de la cuenta." },
        { de: "sofi", min: 900, likes: 2, texto: "Mi doctora me armó un plan para los fines de semana. Pregúntale, no pierdes nada." }
      ] },
    { id: 12, autor: "ignacia", titulo: "Estigma en la pega",
      pregunta: "¿Le cuentan a su jefe o a sus compañeros que toman medicación?",
      encuesta: { pregunta: "¿Le contaste a tu jefe o jefa que tomas medicación?", publica: false, opciones: [
        { t: "Sí, lo conté", votos: ["rodrigo", "ignacia", "sofi"] },
        { t: "No, prefiero guardarlo", votos: ["javi", "benja", "cata", "fena"] },
        { t: "No trabajo", votos: ["nacho", "mati", "fran"] } ] },
      mensajes: [
        { de: "ignacia", min: 4300, likes: 17, texto: "Abro este tema porque varios pacientes me lo preguntan: el miedo a que los traten de \"drogadictos\" por tomar un medicamento recetado.\n\n¿Qué experiencias han tenido? ¿Les sirvió contarlo o prefieren guardarlo?" },
        { de: "rodrigo", min: 4200, likes: 7, texto: "Lo conté y mi jefa me dijo que su hijo también tiene TDAH. Me fue mejor de lo que pensaba." },
        { de: "javi", min: 2900, likes: 4, texto: "Yo no lo cuento. Una vez lo dije y me tiraron la talla de \"el tío de la pastilla\" por meses." },
        { de: "pepito", min: 2500, likes: 4, texto: "En mi U nadie sabe. Me da miedo que me miren raro, así que leer esto me ayuda harto." },
        { de: "cata", min: 2400, likes: 9, texto: "Por eso mismo este foro sirve, acá nadie te mira raro." },
        { de: "admin", min: 2000, likes: 11, texto: "Gracias por abrir este tema. Tomar un medicamento recetado no te hace menos que nadie. Si alguien los molesta por eso en el foro, denúncienlo con la banderita y lo revisamos." }
      ] }
  ],

  /* respuestas que van llegando en vivo */
  enVivo: [
    { foro: 1, de: "tomas", texto: "Bienvenida al club, Cata. Lo del ruido de fondo es exacto." },
    { foro: 3, de: "fena", texto: "Nacho, en mi U el apoyo académico me salvó un semestre. Pregunta en bienestar estudiantil." },
    { foro: 12, de: "sofi", texto: "Pepito, a mí me pasaba igual. Con el tiempo se lo conté a una amiga y fue un alivio." },
    { foro: 8, de: "ignacia", texto: "Y nadie es fome por no tomar. El que te presiona por eso no está cachando." },
    { foro: 4, de: "sofi", texto: "Los batidos me sirvieron cuando no me entraba nada sólido." },
    { foro: 6, de: "cata", texto: "A mí lo que me sirvió fue moverle el horario con la psiquiatra." },
    { foro: 2, de: "javi", texto: "Lo de anotar me sirvió, mi médico cambió el horario con eso." },
    { foro: 10, de: "rodrigo", texto: "Buena idea llevar los datos del reloj, lo voy a hacer también." }
  ],

  /* denuncias ya hechas (foro, n° de mensaje, quién denunció, motivo) */
  denuncias: [
    { foro: 3, msg: 3, por: "nacho", motivo: "Venta de medicamentos", min: 80 },
    { foro: 3, msg: 3, por: "ignacia", motivo: "Venta de medicamentos", min: 70 },
    { foro: 3, msg: 3, por: "javiera", motivo: "Promueve el consumo", min: 60 }
  ],

  solicitudes: [
    { usuario: "cata", campo: "uni", valor: "uc", min: 300 }
  ],

  registro: [
    { por: "juan", min: 120, accion: "Borró un mensaje de @PepitoPérez en el Foro #3", motivo: "Promueve el consumo" },
    { por: "juan", min: 115, accion: "Le envió una advertencia a @PepitoPérez", motivo: "" }
  ],

  /* notificaciones iniciales por cuenta */
  notis: {
    pepito: [
      { tipo: "borrado", foro: 3, por: "juan", cita: "[Viva el Samexid, la mejor droga]", min: 120 },
      { tipo: "dm", por: "juan", texto: "Hola Pepito, borramos tu mensaje del Foro #3. Acá conversamos con respeto y sin promover el consumo. Cualquier duda, escríbeme.", min: 115 },
      { tipo: "respuesta", de: "admin", foro: 12, min: 2000 },
      { tipo: "like", de: "fran", foro: 12, min: 2300 }
    ],
    juan: [
      { tipo: "cola", min: 60 },
      { tipo: "solicitud", de: "cata", min: 300 }
    ],
    admin: [
      { tipo: "cola", min: 60 },
      { tipo: "solicitud", de: "cata", min: 300 },
      { tipo: "nuevo", de: "pepito", min: 30000 }
    ]
  }
};

/* Opciones del registro */
CD.UNIS = {
  uch:  { n: "Universidad de Chile", c: "UCh", col: "#1f5fc8" },
  uc:   { n: "Pontificia Universidad Católica de Chile", c: "UC", col: "#c99a06" },
  unab: { n: "Universidad Andrés Bello", c: "UNAB", col: "#b5162f" }
};
CD.CARRERAS = {
  periodismo:  { n: "Periodismo", e: "📰" },
  derecho:     { n: "Derecho", e: "⚖️" },
  informatica: { n: "Ingeniería en Informática", e: "💻" }
};
CD.OCUPACIONES = ["Comercio y ventas", "Salud", "Educación", "Construcción", "Transporte y reparto", "Gastronomía",
  "Oficina y administración", "Tecnología", "Arte y cultura", "Independiente", "Otro"];
CD.SEXOS = ["Femenino", "Masculino", "Intersexual", "Otro", "Prefiero no decirlo"];
CD.GENEROS = ["Mujer", "Hombre", "No binario", "Género fluido", "Agénero", "Mujer trans", "Hombre trans", "Otro", "Prefiero no decirlo"];
CD.MOTIVOS = ["Promueve el consumo", "Venta de medicamentos", "Acoso o insultos", "Información falsa", "Otro"];
