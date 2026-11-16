/* CUIDANDROGA · datos simulados del foro (prototipo) */
window.CD = {};

/* Usuarios: tono = color de fondo de la foto, f = forma de silueta, on = conectado */
CD.usuarios = {
  "@Cata_TDAH":      { tono: 145, f: 1, on: true  },
  "@nachito.uc":     { tono: 200, f: 0, on: true  },
  "@QF_Javiera":     { tono: 170, f: 1, on: true  },
  "@Benja_Valpo":    { tono: 30,  f: 2, on: false },
  "@mamá_de_Tomi":   { tono: 320, f: 1, on: true  },
  "@Fran.ansiosa":   { tono: 270, f: 1, on: true  },
  "@DonPato62":      { tono: 50,  f: 0, on: false },
  "@Sofi_insomne":   { tono: 230, f: 1, on: true  },
  "@Rodrigo_ing":    { tono: 100, f: 0, on: true  },
  "@Javi.lee":       { tono: 0,   f: 2, on: false },
  "@Ignacia_psico":  { tono: 185, f: 1, on: true  },
  "@Tomás_runner":   { tono: 120, f: 2, on: true  },
  "@Mati_lol":       { tono: 260, f: 2, on: false },
  "@Feña.mtz":       { tono: 340, f: 1, on: true  },
  "@Mod":            { tono: 90,  f: 3, on: true  }
};

/* Foros: el primer mensaje es el texto largo de quien inició el foro */
CD.foros = [
  {
    id: 1, autor: "@Cata_TDAH", titulo: "Eso, el Samexid",
    pregunta: "¿Alguien más sintió que le cambió el día a día o soy yo nomás?",
    mensajes: [
      { de: "@Cata_TDAH", hace: "hace 2 h", likes: 14, texto:
        "Me diagnosticaron TDAH a los 24, después de años pensando que era floja o desordenada. La psiquiatra me recetó Samexid hace tres semanas y les juro que es raro: por primera vez termino una tarea sin abrir otras siete pestañas.\n\nNo es que me sienta \"drogada\" ni nada, es más como si el ruido de fondo bajara. Igual tengo boca seca y almuerzo poco, y eso lo estoy conversando con ella.\n\nLes pregunto porque en mi casa no entienden mucho y me dicen que cuidado con volverme adicta. ¿A ustedes les pasó algo parecido al principio?" },
      { de: "@Rodrigo_ing", hace: "hace 1 h", likes: 6, texto: "Me pasó igual. Lo del ruido de fondo es justo la descripción. Lo de la boca seca a mí se me pasó como a las 5 semanas, pero agua siempre a mano." },
      { de: "@QF_Javiera", hace: "hace 58 min", likes: 11, texto: "Buena que lo estés hablando con tu psiquiatra. La lisdexanfetamina sí puede generar dependencia, por eso se usa con control médico, en la dosis indicada y sin subirla por cuenta propia. Con seguimiento es otra historia que tomarla \"a la mala\"." },
      { de: "@Fran.ansiosa", hace: "hace 40 min", likes: 3, texto: "Lo de la familia me identifica caleta. A mí me ayudó llevar a mi mamá a una consulta para que le explicaran." },
      { de: "@Cata_TDAH", hace: "hace 22 min", likes: 2, texto: "Gracias de verdad. Lo de llevarlos a la consulta lo voy a hacer." }
    ]
  },
  {
    id: 2, autor: "@Rodrigo_ing", titulo: "El bajón de la tarde",
    pregunta: "¿A qué hora se les pasa el efecto y cómo manejan el bajón?",
    mensajes: [
      { de: "@Rodrigo_ing", hace: "hace 5 h", likes: 9, texto:
        "Lo tomo a las 7:30 y como a las 17:00 me viene un bajón de ánimo y de energía bien notorio. Quedo irritable con todo el mundo y llego a la casa sin ganas de nada.\n\nLeí que a algunas personas les pasa cuando se va el efecto. ¿Les pasa? ¿Le comentaron a su médico o lo manejan con algo de rutina?" },
      { de: "@Ignacia_psico", hace: "hace 4 h", likes: 12, texto: "Es bueno anotarlo: a qué hora empieza, cuánto dura, qué comiste. Con eso tu médico puede ajustar horario o dosis con datos, no a ojo." },
      { de: "@Tomás_runner", hace: "hace 3 h", likes: 4, texto: "A mí me ayuda comer algo contundente apenas llego y salir a caminar. No lo arregla, pero lo baja." },
      { de: "@Feña.mtz", hace: "hace 2 h", likes: 1, texto: "Lo mismo me pasa pero a las 15:00 jajaja, somos el club del bajón." }
    ]
  },
  {
    id: 3, autor: "@nachito.uc", titulo: "Pruebas y pastillas prestadas",
    pregunta: "Un compañero me ofreció una para el certamen, ¿qué tan mala idea es?",
    mensajes: [
      { de: "@nachito.uc", hace: "hace 3 h", likes: 5, texto:
        "Estoy en semana de certámenes y voy atrasadísimo. Un compañero que tiene receta me dijo que me podía pasar un par de cápsulas para estudiar de corrido el fin de semana.\n\nYo no tengo diagnóstico de nada. Medio curso dice que \"todos lo hacen\" y que no pasa nada. Antes de hacer una tontera prefiero preguntar acá." },
      { de: "@QF_Javiera", hace: "hace 2 h", likes: 21, texto: "Buena por preguntar. Es un medicamento con receta retenida y la dosis la ajusta un médico según cada persona. Sin evaluación no sabes cómo responde tu corazón ni tu presión, y las noches sin dormir suman. Si el problema es el atraso, la U suele tener apoyo académico y psicológico." },
      { eliminado: true, de: "@usuario", hace: "hace 2 h", likes: 0, por: "@Mod", texto: "[Viva el Samexid, la mejor droga]" },
      { de: "@Ignacia_psico", hace: "hace 1 h", likes: 8, texto: "Y ojo con lo de \"todos lo hacen\": la presión del curso pesa. Dormir y repartir el estudio rinde más que una noche de corrido." },
      { de: "@Mati_lol", hace: "hace 45 min", likes: 2, texto: "Yo lo probé así una vez y no dormí en dos días, la prueba me fue peor igual. No lo recomiendo." }
    ]
  },
  {
    id: 4, autor: "@Fran.ansiosa", titulo: "No me da hambre",
    pregunta: "¿Cómo se acuerdan de comer si no sienten hambre en todo el día?",
    mensajes: [
      { de: "@Fran.ansiosa", hace: "hace 6 h", likes: 7, texto:
        "Desde que empecé el tratamiento me salto el almuerzo sin darme cuenta. A las 9 de la noche me ataca un hambre terrible y como cualquier cosa.\n\nBajé un par de kilos y no era la idea. ¿Qué hacen ustedes?" },
      { de: "@Cata_TDAH", hace: "hace 5 h", likes: 5, texto: "Desayuno fuerte ANTES de tomarlo. Después del mediodía me cuesta, así que dejo snacks en la mochila." },
      { de: "@QF_Javiera", hace: "hace 4 h", likes: 9, texto: "La baja de apetito y de peso son efectos conocidos. Si sigues bajando, coméntalo en tu control: a veces se ajusta, y una nutricionista ayuda bastante." },
      { de: "@Benja_Valpo", hace: "hace 2 h", likes: 2, texto: "Alarma en el celular a las 13:30 que dice COME. Funciona jaja." }
    ]
  },
  {
    id: 5, autor: "@Benja_Valpo", titulo: "Café + estimulantes",
    pregunta: "¿Puedo seguir con mis tres cafés diarios o es mucho?",
    mensajes: [
      { de: "@Benja_Valpo", hace: "hace 1 día", likes: 4, texto:
        "Trabajo en turno de mañana y vivo a puro café. Desde que tomo medicación siento el corazón más acelerado los días que tomo los tres.\n\n¿Alguien redujo el café? ¿Se nota la diferencia?" },
      { de: "@Tomás_runner", hace: "hace 20 h", likes: 6, texto: "Bajé a uno y se me fue esa sensación de taquicardia. Igual lo conversé con el doctor porque me asusté." },
      { de: "@QF_Javiera", hace: "hace 18 h", likes: 10, texto: "La cafeína también es estimulante, así que los efectos pueden sumarse. Palpitaciones o dolor en el pecho son motivo para consultar, no para aguantar." }
    ]
  },
  {
    id: 6, autor: "@Sofi_insomne", titulo: "Dormir de nuevo",
    pregunta: "Lo tomo a las 8 y a la 1 AM sigo despierta, ¿a alguien le pasó?",
    mensajes: [
      { de: "@Sofi_insomne", hace: "hace 9 h", likes: 6, texto:
        "Llevo dos semanas durmiendo como 4 horas. Lo tomo a las 8 de la mañana, así que no entiendo por qué sigo tan activa en la noche.\n\nNo quiero dejarlo porque me está ayudando en la pega, pero así no se puede." },
      { de: "@Rodrigo_ing", hace: "hace 8 h", likes: 3, texto: "Al principio me pasó. Se me ordenó cuando dejé las pantallas a las 23:00 y el café después de almuerzo." },
      { de: "@Ignacia_psico", hace: "hace 6 h", likes: 7, texto: "El insomnio es de lo más común al empezar. Anótalo y llévalo al control: a veces se mueve el horario o la dosis." }
    ]
  },
  {
    id: 7, autor: "@mamá_de_Tomi", titulo: "Mi hijo empieza tratamiento",
    pregunta: "Tomi tiene 9 años, ¿qué le pregunto al neurólogo antes de partir?",
    mensajes: [
      { de: "@mamá_de_Tomi", hace: "hace 1 día", likes: 13, texto:
        "Al Tomi le diagnosticaron TDAH y el neurólogo propuso empezar con medicación. Estoy nerviosa, leo cosas en internet que me asustan y otras que lo pintan como milagro.\n\nQuiero llegar preparada a la próxima consulta. ¿Qué le preguntarían ustedes?" },
      { de: "@QF_Javiera", hace: "hace 22 h", likes: 15, texto: "Buenas preguntas: cómo se va a controlar el peso y la talla, cada cuánto tomar presión y pulso, qué hacer si no come, y qué señales son para consultar al tiro." },
      { de: "@Feña.mtz", hace: "hace 20 h", likes: 5, texto: "Mi hermano chico lo toma hace dos años. Lo que más nos sirvió fue hablar con el colegio para que todos estuvieran en la misma." }
    ]
  },
  {
    id: 8, autor: "@Javi.lee", titulo: "Carrete el viernes",
    pregunta: "¿Es peligroso tomarse unas piscolas estando en tratamiento?",
    mensajes: [
      { de: "@Javi.lee", hace: "hace 7 h", likes: 3, texto:
        "Tengo un cumpleaños el viernes y no quiero ser el fome que no toma nada. Pero estoy con medicación hace un mes.\n\n¿Alguien sabe si se puede o si es mejor saltarse la dosis ese día?" },
      { de: "@Mati_lol", hace: "hace 6 h", likes: 2, texto: "Yo noté que con la pastilla no sentía lo curao y terminaba tomando el doble. Mala combinación." },
      { de: "@QF_Javiera", hace: "hace 5 h", likes: 12, texto: "No te saltes ni cambies la dosis por tu cuenta. Lo del alcohol pregúntaselo a tu médico con tu caso concreto; y si tomas, que sea poco, con agua y comida." }
    ]
  },
  {
    id: 9, autor: "@DonPato62", titulo: "Receta retenida",
    pregunta: "¿Cómo funciona la receta para comprarlo en la farmacia?",
    mensajes: [
      { de: "@DonPato62", hace: "hace 2 días", likes: 5, texto:
        "Me diagnosticaron de viejo, a los 61. Fui a la farmacia y no me lo quisieron vender porque la receta \"tenía que quedar retenida\". No entendí nada.\n\n¿Alguien me explica cómo es el trámite?" },
      { de: "@QF_Javiera", hace: "hace 2 días", likes: 9, texto: "Se vende con receta médica retenida: la farmacia se queda con la receta. Por eso cada compra necesita una receta vigente y el médico debe emitirla así." },
      { de: "@Cata_TDAH", hace: "hace 1 día", likes: 2, texto: "Don Pato, pídale al médico que le deje las recetas de los meses que siguen, así no anda corriendo." }
    ]
  },
  {
    id: 10, autor: "@Tomás_runner", titulo: "Corazón a mil",
    pregunta: "Siento el pulso acelerado cuando entreno, ¿es normal?",
    mensajes: [
      { de: "@Tomás_runner", hace: "hace 11 h", likes: 4, texto:
        "Salgo a trotar en la tarde y desde que tomo medicación el reloj me marca pulsaciones más altas que antes para el mismo ritmo.\n\nNo me siento mal, pero me tiene pensando." },
      { de: "@QF_Javiera", hace: "hace 10 h", likes: 10, texto: "Puede subir la frecuencia cardíaca y la presión. Llévale los registros del reloj a tu médico. Si aparece dolor en el pecho, falta de aire o desmayo, es urgencia." },
      { de: "@Benja_Valpo", hace: "hace 9 h", likes: 1, texto: "Qué bueno que lo midas, la mayoría ni se da cuenta." }
    ]
  },
  {
    id: 11, autor: "@Feña.mtz", titulo: "¿Lo dejo en vacaciones?",
    pregunta: "Quiero parar en febrero, ¿se puede así no más?",
    mensajes: [
      { de: "@Feña.mtz", hace: "hace 1 día", likes: 6, texto:
        "En vacaciones no tengo que concentrarme en nada y me gustaría descansar de la medicación. Una amiga dice que lo deje de una, otra que no.\n\n¿Cómo lo hicieron ustedes?" },
      { de: "@Ignacia_psico", hace: "hace 20 h", likes: 8, texto: "Eso se planifica con el médico. Dejarlo sin indicación puede traer cansancio fuerte y ánimo bajo, sobre todo si se usó más de la cuenta." },
      { de: "@Sofi_insomne", hace: "hace 15 h", likes: 2, texto: "Mi doctora me armó un plan para los fines de semana. Pregúntale, no pierdes nada." }
    ]
  },
  {
    id: 12, autor: "@Ignacia_psico", titulo: "Estigma en la pega",
    pregunta: "¿Le cuentan a su jefe o a sus compañeros que toman medicación?",
    mensajes: [
      { de: "@Ignacia_psico", hace: "hace 3 días", likes: 17, texto:
        "Abro este tema porque varios pacientes me lo preguntan: el miedo a que los traten de \"drogadictos\" por tomar un medicamento recetado.\n\n¿Qué experiencias han tenido? ¿Les sirvió contarlo o prefieren guardarlo?" },
      { de: "@Rodrigo_ing", hace: "hace 3 días", likes: 7, texto: "Lo conté y mi jefa me dijo que su hijo también tiene TDAH. Me fue mejor de lo que pensaba." },
      { de: "@Javi.lee", hace: "hace 2 días", likes: 4, texto: "Yo no lo cuento. Una vez lo dije y me tiraron la talla de \"el tío de la pastilla\" por meses." },
      { de: "@Cata_TDAH", hace: "hace 2 días", likes: 9, texto: "Por eso mismo este foro sirve, acá nadie te mira raro." }
    ]
  }
];

/* Respuestas que van llegando en vivo (simulación) */
CD.enVivo = [
  { foro: 1, de: "@Tomás_runner", texto: "Bienvenida al club, Cata. Lo del ruido de fondo es exacto." },
  { foro: 3, de: "@Feña.mtz", texto: "Nacho, en mi U el apoyo académico me salvó un semestre. Pregunta en bienestar estudiantil." },
  { foro: 8, de: "@Ignacia_psico", texto: "Y nadie es fome por no tomar. El que te presiona por eso no está cachando." },
  { foro: 4, de: "@Sofi_insomne", texto: "Los batidos me sirvieron cuando no me entraba nada sólido." },
  { foro: 6, de: "@Cata_TDAH", texto: "A mí el magnesio no me sirvió, lo que me sirvió fue moverle el horario con la psiquiatra." },
  { foro: 2, de: "@Javi.lee", texto: "Lo de anotar me sirvió, mi médico cambió el horario con eso." },
  { foro: 10, de: "@Rodrigo_ing", texto: "Buena idea llevar los datos del reloj, lo voy a hacer también." }
];

/* Notificaciones iniciales */
CD.notis = [
  { tipo: "foro", de: "@QF_Javiera", foro: 3 },
  { tipo: "mod", foro: 3, por: "@Mod", cita: "[Viva el Samexid, la mejor droga]" },
  { tipo: "foro", de: "@Cata_TDAH", foro: 1 }
];

/* ¿Sabías que? · uno por día (fuentes en conoce.html) */
CD.sabias = [
  "El Samexid es lisdexanfetamina: el cuerpo la transforma en dexanfetamina después de tragarla.",
  "El Samexid se usa para el TDAH en adultos y en niños desde los 6 años.",
  "El Samexid se toma una vez al día, en la mañana: de tarde puede quitar el sueño.",
  "La cápsula de Samexid se puede abrir y mezclar con yogur, agua o jugo de naranja, y se toma al tiro.",
  "En Chile el Samexid se vende con receta médica retenida y solo a mayores de 18 años.",
  "El Samexid no se mezcla con medicamentos IMAO, ni hasta dos semanas después de dejarlos.",
  "El Samexid no se deja de golpe sin hablar con el médico: puede venir cansancio fuerte y ánimo bajo.",
  "Boca seca, dolor de cabeza y menos apetito están entre los efectos más comunes del Samexid.",
  "El Samexid no sirve para bajar de peso, aunque quite el apetito.",
  "Las cápsulas de Samexid que sobran no se botan al inodoro: se devuelven en un punto de recolección.",
  "Antes de empezar con Samexid el médico revisa el corazón, y después controla presión y pulso."
];
