/* ============================================================
   PROYECTO 1 - LISTA DE TAREAS (TO-DO LIST)
   Logica en JavaScript puro (sin librerias)
   ------------------------------------------------------------
   El programa hace 5 cosas:
     1. Guardar las tareas en una lista (array)
     2. Dibujar esa lista en pantalla
     3. Agregar, completar y borrar tareas
     4. Filtrar lo que se muestra
     5. Recordar todo aunque cerrés el navegador
   ============================================================ */

'use strict'; // Modo estricto: avisa de errores que si no pasarian desapercibidos


/* ------------------------------------------------------------
   1. REFERENCIAS AL HTML
   Guardamos en constantes los elementos que vamos a usar,
   para no tener que buscarlos en el documento cada vez.
------------------------------------------------------------ */
const formulario  = document.getElementById('formulario');
const entrada     = document.getElementById('entrada');
const lista       = document.getElementById('lista');
const filtros     = document.getElementById('filtros');
const contador    = document.getElementById('contador');
const botonLimpiar= document.getElementById('limpiar');
const vacio       = document.getElementById('vacio');
const vacioTexto  = document.getElementById('vacio-texto');
const aviso       = document.getElementById('aviso');
const fecha       = document.getElementById('fecha');

const CLAVE_GUARDADO = 'mini-proyectos-js:tareas'; // nombre con el que guardamos en el navegador


/* ------------------------------------------------------------
   2. EL ESTADO DE LA APLICACION
   'tareas' es la unica fuente de verdad: si algo cambia acá,
   la pantalla se vuelve a dibujar a partir de este array.

   Cada tarea es un objeto:  { id: 1712..., texto: "Comprar pan", hecha: false }
------------------------------------------------------------ */
let tareas = cargarTareas();
let filtroActual = 'todas'; // puede ser: 'todas' | 'pendientes' | 'completadas'


/* ------------------------------------------------------------
   3. GUARDAR Y CARGAR (persistencia)
   localStorage solo guarda texto, por eso convertimos el array
   a texto con JSON.stringify y lo recuperamos con JSON.parse.
   El try/catch evita que la app se rompa si el navegador
   tiene el almacenamiento bloqueado.
------------------------------------------------------------ */
function guardarTareas() {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(tareas));
  } catch (error) {
    // Si no se puede guardar, la app igual sigue funcionando en memoria
    console.warn('No se pudieron guardar las tareas:', error);
  }
}

function cargarTareas() {
  try {
    const guardado = localStorage.getItem(CLAVE_GUARDADO);
    if (!guardado) return [];              // primera visita: lista vacia
    const datos = JSON.parse(guardado);
    return Array.isArray(datos) ? datos : []; // nos aseguramos de que sea un array
  } catch (error) {
    console.warn('No se pudieron leer las tareas:', error);
    return [];
  }
}


/* ------------------------------------------------------------
   4. FUNCIONES DE AYUDA
------------------------------------------------------------ */

// Evita que alguien escriba HTML dentro de una tarea (seguridad basica)
function limpiarTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Muestra un mensajito abajo de la pantalla por 2 segundos
let temporizadorAviso;
function mostrarAviso(mensaje) {
  aviso.textContent = mensaje;
  aviso.classList.add('aviso--visible');
  clearTimeout(temporizadorAviso);         // si habia otro aviso, reiniciamos el reloj
  temporizadorAviso = setTimeout(() => {
    aviso.classList.remove('aviso--visible');
  }, 2000);
}

// Devuelve solo las tareas que corresponden al filtro elegido
function tareasVisibles() {
  if (filtroActual === 'pendientes')  return tareas.filter(t => !t.hecha);
  if (filtroActual === 'completadas') return tareas.filter(t =>  t.hecha);
  return tareas;                            // 'todas'
}


/* ------------------------------------------------------------
   5. DIBUJAR LA PANTALLA
   Esta funcion se llama cada vez que algo cambia.
   Borra la lista y la vuelve a construir desde el array.
------------------------------------------------------------ */
function dibujar() {
  const visibles = tareasVisibles();

  // Construimos todo el HTML de una sola vez (más rápido que ir agregando de a uno)
  lista.innerHTML = visibles.map(tarea => `
    <li class="tarea ${tarea.hecha ? 'tarea--hecha' : ''}" data-id="${tarea.id}">
      <button class="tarea__check" data-accion="alternar" aria-label="Marcar tarea">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
             stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </button>
      <span class="tarea__texto">${limpiarTexto(tarea.texto)}</span>
      <button class="tarea__borrar" data-accion="borrar" aria-label="Borrar tarea">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </li>
  `).join('');

  // Mostrar u ocultar el mensaje de "no hay nada"
  if (visibles.length === 0) {
    vacio.classList.add('vacio--visible');
    vacioTexto.textContent =
      filtroActual === 'completadas' ? 'Todavía no completaste ninguna tarea.' :
      filtroActual === 'pendientes'  ? '¡Excelente! No te queda nada pendiente.' :
                                       'Todavía no hay tareas. ¡Agregá la primera!';
  } else {
    vacio.classList.remove('vacio--visible');
  }

  // Actualizar el contador del pie
  const pendientes = tareas.filter(t => !t.hecha).length;
  contador.textContent =
    pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`;

  // El boton de limpiar solo tiene sentido si hay tareas completadas
  botonLimpiar.style.visibility = tareas.some(t => t.hecha) ? 'visible' : 'hidden';
}


/* ------------------------------------------------------------
   6. ACCIONES SOBRE LAS TAREAS
------------------------------------------------------------ */

function agregarTarea(texto) {
  tareas.unshift({          // unshift agrega al principio (arriba de la lista)
    id: Date.now(),         // la hora actual en milisegundos sirve como identificador unico
    texto: texto,
    hecha: false
  });
  guardarTareas();
  dibujar();
}

function alternarTarea(id) {
  const tarea = tareas.find(t => t.id === id);  // buscamos la tarea por su id
  if (!tarea) return;
  tarea.hecha = !tarea.hecha;                   // invertimos su estado
  guardarTareas();
  dibujar();
}

function borrarTarea(id) {
  tareas = tareas.filter(t => t.id !== id);     // nos quedamos con todas MENOS esa
  guardarTareas();
  dibujar();
  mostrarAviso('Tarea eliminada');
}

function borrarCompletadas() {
  const cantidad = tareas.filter(t => t.hecha).length;
  if (cantidad === 0) return;
  tareas = tareas.filter(t => !t.hecha);
  guardarTareas();
  dibujar();
  mostrarAviso(`${cantidad} tarea${cantidad > 1 ? 's' : ''} eliminada${cantidad > 1 ? 's' : ''}`);
}


/* ------------------------------------------------------------
   7. ESCUCHAR AL USUARIO (eventos)
------------------------------------------------------------ */

// Enviar el formulario (Enter o clic en +)
formulario.addEventListener('submit', evento => {
  evento.preventDefault();              // evita que la pagina se recargue
  const texto = entrada.value.trim();   // trim() saca los espacios de los costados
  if (texto === '') {
    mostrarAviso('Escribí algo primero');
    return;
  }
  agregarTarea(texto);
  entrada.value = '';                   // vaciamos el campo
  entrada.focus();                      // dejamos el cursor listo para la siguiente
});

// Un solo escuchador para TODA la lista (se llama "delegación de eventos").
// Es mejor que poner un escuchador en cada boton: funciona incluso
// para las tareas que todavia no existen.
lista.addEventListener('click', evento => {
  const boton = evento.target.closest('[data-accion]'); // el boton clickeado
  if (!boton) return;                                   // clic en el vacio: no hacemos nada

  const id = Number(boton.closest('.tarea').dataset.id);

  if (boton.dataset.accion === 'alternar') alternarTarea(id);
  if (boton.dataset.accion === 'borrar')   borrarTarea(id);
});

// Cambiar de filtro
filtros.addEventListener('click', evento => {
  const boton = evento.target.closest('[data-filtro]');
  if (!boton) return;

  filtroActual = boton.dataset.filtro;

  // Marcamos visualmente cual esta activo
  filtros.querySelectorAll('.filtros__boton')
         .forEach(b => b.classList.remove('filtros__boton--activo'));
  boton.classList.add('filtros__boton--activo');

  dibujar();
});

// Borrar todas las completadas
botonLimpiar.addEventListener('click', borrarCompletadas);


/* ------------------------------------------------------------
   8. ARRANQUE
   Se ejecuta una sola vez, al abrir la pagina.
------------------------------------------------------------ */
fecha.textContent = new Date().toLocaleDateString('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long'
});

dibujar();     // dibujamos las tareas guardadas (si las hay)
entrada.focus();
