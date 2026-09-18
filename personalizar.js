/* ============================================================
   PERSONALIZADOR DE COLORES
   ------------------------------------------------------------
   Un panel para cambiar las variables de :root sin escribir
   codigo, y ver el CSS que se genera al hacerlo.

   La idea es que compruebes con las manos lo que se explica en
   explicacion.html: que cambiar UN valor cambia media aplicacion.

   Este archivo es un EXTRA. La Lista de Tareas no lo necesita
   para funcionar: si lo borras, la app sigue igual.
   ============================================================ */

'use strict';

(function () {

  const CLAVE = 'mini-proyectos-js:colores';

  /* ------------------------------------------------------------
     Los temas cambian los colores de fondo y de texto.
     Son exactamente las variables que aparecen en style.css.
  ------------------------------------------------------------ */
  const TEMAS = {
    oscuro: {
      nombre: 'Oscuro',
      vars: {
        '--fondo':        '#0e1116',
        '--superficie':   '#171b22',
        '--superficie-2': '#1e232c',
        '--texto':        '#e6e9ef',
        '--texto-suave':  '#8b93a1',
        '--borde':        '#2a303b'
      }
    },
    claro: {
      nombre: 'Claro',
      vars: {
        '--fondo':        '#f1f4f9',
        '--superficie':   '#ffffff',
        '--superficie-2': '#f2f4f9',
        '--texto':        '#1b1f27',
        '--texto-suave':  '#6c7484',
        '--borde':        '#e0e5ee'
      }
    },
    violeta: {
      nombre: 'Noche violeta',
      vars: {
        '--fondo':        '#12101c',
        '--superficie':   '#1b1830',
        '--superficie-2': '#241f3d',
        '--texto':        '#ece9f7',
        '--texto-suave':  '#9b93b8',
        '--borde':        '#322b52'
      }
    },
    bosque: {
      nombre: 'Bosque',
      vars: {
        '--fondo':        '#0b1512',
        '--superficie':   '#12201b',
        '--superficie-2': '#182a24',
        '--texto':        '#e3efe9',
        '--texto-suave':  '#88a79a',
        '--borde':        '#23382f'
      }
    }
  };

  // Paletas limitadas: son colores elegidos para que siempre
  // se lean bien sobre cualquiera de los cuatro temas.
  const ACENTOS  = ['#4f8cff', '#b45cff', '#ff5c8a', '#ff9040', '#22c55e', '#06b6d4'];
  const EXITOS   = ['#35d399', '#a3e635', '#2dd4bf', '#60a5fa'];
  const PELIGROS = ['#ff5f6d', '#fb923c', '#f472b6', '#94a3b8'];

  const PORDEFECTO = { tema: 'oscuro', acento: '#4f8cff', exito: '#35d399', peligro: '#ff5f6d' };

  let estado = cargar();

  /* ------------------------------------------------------------
     Guardar y cargar la eleccion del usuario
  ------------------------------------------------------------ */
  function cargar() {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE));
      if (g && TEMAS[g.tema]) return Object.assign({}, PORDEFECTO, g);
    } catch (e) {}
    return Object.assign({}, PORDEFECTO);
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
  }

  /* ------------------------------------------------------------
     Convierte #4f8cff en rgba(79,140,255,0.16)
     Lo necesitamos para el anillo de foco y los resplandores
     del fondo, que son el mismo color pero transparente.
  ------------------------------------------------------------ */
  function conAlfa(hex, alfa) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alfa + ')';
  }

  /* ------------------------------------------------------------
     Aplicar: escribe las variables en el documento.
     Esto es exactamente lo mismo que editar :root en style.css,
     solo que hecho desde JavaScript.
  ------------------------------------------------------------ */
  function aplicar() {
    const raiz = document.documentElement;
    const tema = TEMAS[estado.tema];

    Object.keys(tema.vars).forEach(v => raiz.style.setProperty(v, tema.vars[v]));

    raiz.style.setProperty('--acento',        estado.acento);
    raiz.style.setProperty('--acento-suave',  conAlfa(estado.acento, .12));
    raiz.style.setProperty('--exito',         estado.exito);
    raiz.style.setProperty('--peligro',       estado.peligro);
    raiz.style.setProperty('--brillo-1',      conAlfa(estado.acento, .16));
    raiz.style.setProperty('--brillo-2',      conAlfa(estado.exito,  .10));

    raiz.dataset.tema = estado.tema;
  }

  /* ------------------------------------------------------------
     El CSS que el usuario esta generando, para copiar y pegar
  ------------------------------------------------------------ */
  function textoCSS() {
    const tema = TEMAS[estado.tema];
    const filas = [];

    Object.keys(tema.vars).forEach(v => filas.push([v, tema.vars[v]]));
    filas.push(['--acento',       estado.acento]);
    filas.push(['--acento-suave', conAlfa(estado.acento, .12)]);
    filas.push(['--exito',        estado.exito]);
    filas.push(['--peligro',      estado.peligro]);

    return ':root {\n' +
      filas.map(f => '  <b>' + f[0] + '</b>: <i>' + f[1] + '</i>;').join('\n') +
      '\n}';
  }

  function cssPlano() {
    return textoCSS().replace(/<\/?[bi]>/g, '');
  }

  /* ------------------------------------------------------------
     Construir el panel
  ------------------------------------------------------------ */
  function muestras(clave, colores) {
    return colores.map(c =>
      '<button class="pz__color' + (estado[clave] === c ? ' pz__color--activo' : '') + '"' +
      ' style="--muestra:' + c + '" data-campo="' + clave + '" data-valor="' + c + '"' +
      ' title="' + c + '" aria-label="Color ' + c + '"></button>'
    ).join('');
  }

  function grupo(titulo, variable, contenido) {
    return '<div class="pz__grupo">' +
             '<div class="pz__titulo">' + titulo +
               '<span class="pz__var">' + variable + '</span>' +
             '</div>' + contenido +
           '</div>';
  }

  const boton = document.createElement('button');
  boton.className = 'pz-abrir';
  boton.id = 'pz-abrir';
  boton.innerHTML = '<span class="pz-abrir__punto"></span>Colores';

  const panel = document.createElement('aside');
  panel.className = 'pz';
  panel.id = 'pz';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Personalizar colores');

  function dibujar() {
    panel.innerHTML =
      '<header class="pz__cab">' +
        '<div><b>Colores</b><span>:root { ... }</span></div>' +
        '<button class="pz__x" id="pz-cerrar" title="Cerrar" aria-label="Cerrar el panel">' +
          '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"' +
          ' stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</header>' +

      '<div class="pz__cuerpo">' +
        grupo('Tema', 'fondo y texto',
          '<div class="pz__temas">' +
            Object.keys(TEMAS).map(k =>
              '<button class="pz__tema' + (estado.tema === k ? ' pz__tema--activo' : '') + '"' +
              ' data-campo="tema" data-valor="' + k + '">' +
              '<i style="background:' + TEMAS[k].vars['--fondo'] + '"></i>' +
              TEMAS[k].nombre + '</button>'
            ).join('') +
          '</div>') +

        grupo('Color principal', '--acento',
          '<div class="pz__muestras">' + muestras('acento', ACENTOS) + '</div>') +

        grupo('Tarea completada', '--exito',
          '<div class="pz__muestras">' + muestras('exito', EXITOS) + '</div>') +

        grupo('Borrar', '--peligro',
          '<div class="pz__muestras">' + muestras('peligro', PELIGROS) + '</div>') +
      '</div>' +

      '<pre class="pz__salida">' + textoCSS() + '</pre>' +

      '<footer class="pz__pie">' +
        '<button class="pz__btn pz__btn--principal" id="pz-copiar">Copiar CSS</button>' +
        '<button class="pz__btn" id="pz-reset">Restablecer</button>' +
      '</footer>';
  }

  /* ------------------------------------------------------------
     Abrir y cerrar
  ------------------------------------------------------------ */
  function abrir() {
    dibujar();
    panel.hidden = false;
    boton.hidden = true;
    document.documentElement.dataset.pz = 'abierto';
  }

  function cerrar() {
    panel.hidden = true;
    boton.hidden = false;
    delete document.documentElement.dataset.pz;
    boton.focus();
  }

  boton.addEventListener('click', abrir);

  /* ------------------------------------------------------------
     Un solo escuchador para todo el panel (delegacion de eventos,
     la misma tecnica que usa script.js con la lista de tareas)
  ------------------------------------------------------------ */
  panel.addEventListener('click', evento => {
    if (evento.target.closest('#pz-cerrar')) { cerrar(); return; }

    if (evento.target.closest('#pz-reset')) {
      estado = Object.assign({}, PORDEFECTO);
      guardar();
      aplicar();
      dibujar();
      return;
    }

    if (evento.target.closest('#pz-copiar')) {
      const b = panel.querySelector('#pz-copiar');
      navigator.clipboard.writeText(cssPlano())
        .then(() => { b.textContent = '¡Copiado!'; })
        .catch(() => { b.textContent = 'No se pudo copiar'; });
      setTimeout(() => { b.textContent = 'Copiar CSS'; }, 1600);
      return;
    }

    const opcion = evento.target.closest('[data-campo]');
    if (!opcion) return;

    estado[opcion.dataset.campo] = opcion.dataset.valor;
    guardar();
    aplicar();
    dibujar();
  });

  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && !panel.hidden) cerrar();
  });

  /* ------------------------------------------------------------
     Arranque
  ------------------------------------------------------------ */
  aplicar();
  document.body.appendChild(boton);
  document.body.appendChild(panel);

})();
