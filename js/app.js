/* =====================================================================
   app.js — Lógica principal de World Explorer
   ===================================================================== */

const estadoApp = {
  favoritos: [],
  viajesDeseados: [],
  resultadosActuales: [],
  vistaCompacta: false,
};

const nombresRegion = {
  Africa:   'África',
  Americas: 'América',
  Asia:     'Asia',
  Europe:   'Europa',
  Oceania:  'Oceanía',
};

/* ── Toast ─────────────────────────────────────────────────────────── */
const TOAST_ICONS = {
  success: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 9l2.5 2.5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error:   '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16.5 15H1.5L9 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8v3M9 13.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  info:    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M9 8v5M9 5.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

/* ── Converter de URLs de banderas a CDN compatible ──────────────────── */
function convertirURLBandera(url) {
  if (!url) return '';
  // Si la URL es de flagcdn.com, convertirla a raw.githubusercontent.com que tiene CORS permisivo
  if (url.includes('flagcdn.com')) {
    const match = url.match(/flagcdn\.com\/(\w+)\.(svg|png)/);
    if (match) {
      const code = match[1].toLowerCase();
      return `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${code}.svg`;
    }
  }
  return url;
}

function mostrarToast(mensaje, tipo) {
  tipo = tipo || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.innerHTML = `<span class="toast__icon">${TOAST_ICONS[tipo] || TOAST_ICONS.info}</span><span>${escaparHTML(mensaje)}</span>`;
  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', function () { toast.remove(); }, { once: true });
  }, 3200);
}

/* ── Skeleton ───────────────────────────────────────────────────────── */
function mostrarSkeletons(n) {
  const grid = document.getElementById('resultsGrid');
  grid.innerHTML = '';
  grid.classList.toggle('results-grid--compact', estadoApp.vistaCompacta);

  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    var card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-block skeleton-flag"></div>
      <div class="skeleton-body">
        <div class="skeleton-block skeleton-line skeleton-line--wide"></div>
        <div class="skeleton-block skeleton-line skeleton-line--short"></div>
        <div class="skeleton-block skeleton-line skeleton-line--xs"></div>
        <div class="skeleton-block skeleton-line skeleton-line--xs"></div>
      </div>`;
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

/* ── Render cards ───────────────────────────────────────────────────── */
function renderizarTarjetasPaises(paises) {
  const grid = document.getElementById('resultsGrid');
  const paisesOrdenados = ordenarPaises(Array.isArray(paises) ? [...paises] : []);

  estadoApp.resultadosActuales = paisesOrdenados;
  grid.innerHTML = '';
  grid.classList.toggle('results-grid--compact', estadoApp.vistaCompacta);
  actualizarResumen();

  if (paisesOrdenados.length === 0) {
    grid.innerHTML = `
      <div class="results-grid__empty">
        <div>
          <p>No hay resultados para mostrar.</p>
          <p>Prueba con otro país o selecciona una región.</p>
        </div>
      </div>`;
    return;
  }

  const fragmento = document.createDocumentFragment();
  paisesOrdenados.forEach(function (pais) {
    fragmento.appendChild(crearTarjetaPais(pais));
  });
  grid.appendChild(fragmento);
}

function crearTarjetaPais(pais) {
  const esFavorito  = estadoApp.favoritos.some(function (f) { return f.cca3 === pais.cca3; });
  const capital     = pais.capital ? pais.capital[0] : 'N/D';
  const bandera     = convertirURLBandera(pais.flags?.svg || pais.flags?.png || '');
  const monedas     = obtenerMonedas(pais.currencies);
  const idiomas     = obtenerIdiomas(pais.languages);
  const subregion   = pais.subregion || 'N/D';
  const zonas       = pais.timezones ? pais.timezones.slice(0, 2).join(', ') : 'N/D';
  const regionLabel = nombresRegion[pais.region] || pais.region || 'N/D';

  const tarjeta = document.createElement('article');
  tarjeta.className = 'country-card';
  tarjeta.dataset.cca3 = pais.cca3;

  tarjeta.innerHTML = `
    <div class="country-card__flag-wrapper">
      <img
        src="${escaparHTML(bandera)}"
        alt="Bandera de ${escaparHTML(pais.name.common)}"
        class="country-card__flag"
        loading="lazy"
      >
      <span class="country-card__region">${escaparHTML(regionLabel)}</span>
    </div>
    <div class="country-card__body">
      <h3 class="country-card__name">${escaparHTML(pais.name.common)}</h3>
      <p class="country-card__official">${escaparHTML(pais.name.official)}</p>
      <ul class="country-card__info">
        <li><span class="country-card__label">Capital:</span> ${escaparHTML(capital)}</li>
        <li><span class="country-card__label">Población:</span> ${formatearNumero(pais.population)}</li>
        <li><span class="country-card__label">Moneda:</span> ${escaparHTML(monedas)}</li>
      </ul>
      <div class="country-card__details" id="details-${escaparHTML(pais.cca3)}">
        <p><span class="country-card__label">Subregión:</span> ${escaparHTML(subregion)}</p>
        <p><span class="country-card__label">Idioma:</span> ${escaparHTML(idiomas)}</p>
        <p><span class="country-card__label">Zona horaria:</span> ${escaparHTML(zonas)}</p>
        <p><span class="country-card__label">Área:</span> ${pais.area ? formatearNumero(pais.area) + ' km²' : 'N/D'}</p>
      </div>
      <div class="country-card__actions">
        <button
          class="btn ${esFavorito ? 'btn--fav-active' : 'btn--fav'} country-card__fav-btn"
          data-cca3="${escaparHTML(pais.cca3)}"
          type="button"
        >${esFavorito ? '★ Guardado' : '☆ Guardar'}</button>
        <button
          class="country-card__details-btn"
          type="button"
          aria-expanded="false"
          aria-controls="details-${escaparHTML(pais.cca3)}"
        >Detalles</button>
      </div>
    </div>
  `;

  /* Hover → actualizar bandera 3D */
  tarjeta.addEventListener('mouseenter', function () {
    if (typeof window.actualizarBandera3D === 'function') {
      window.actualizarBandera3D(bandera, pais.name.common);
    }
  });

  tarjeta.querySelector('.country-card__fav-btn')
    .addEventListener('click', function () { toggleFavorito(pais, this); });

  tarjeta.querySelector('.country-card__details-btn')
    .addEventListener('click', function () { alternarDetallesTarjeta(tarjeta, this); });

  return tarjeta;
}

function alternarDetallesTarjeta(tarjeta, boton) {
  const detalles  = tarjeta.querySelector('.country-card__details');
  const estaAbierto = boton.getAttribute('aria-expanded') === 'true';
  boton.setAttribute('aria-expanded', String(!estaAbierto));
  boton.textContent = estaAbierto ? 'Detalles' : 'Ocultar';
  detalles.classList.toggle('is-open', !estaAbierto);
}

/* ── Favoritos ──────────────────────────────────────────────────────── */
function toggleFavorito(pais, boton) {
  const indice = estadoApp.favoritos.findIndex(function (f) { return f.cca3 === pais.cca3; });

  if (indice === -1) {
    estadoApp.favoritos.push({
      cca3:     pais.cca3,
      nombre:   pais.name.common,
      capital:  pais.capital ? pais.capital[0] : 'N/D',
      region:   nombresRegion[pais.region] || pais.region || 'N/D',
      poblacion:pais.population,
      bandera:  convertirURLBandera(pais.flags?.svg || pais.flags?.png || ''),
    });
    boton.textContent = '★ Guardado';
    boton.className   = 'btn btn--fav-active country-card__fav-btn';
    mostrarToast('Agregado a favoritos: ' + pais.name.common, 'success');
  } else {
    estadoApp.favoritos.splice(indice, 1);
    boton.textContent = '☆ Guardar';
    boton.className   = 'btn btn--fav country-card__fav-btn';
    mostrarToast('Eliminado de favoritos: ' + pais.name.common, 'warning');
  }

  renderizarTablaFavoritos();
  actualizarResumen();
}

function renderizarTablaFavoritos() {
  const tbody   = document.getElementById('favoritesBody');
  const contador = document.getElementById('favCount');

  contador.textContent = pluralizar(estadoApp.favoritos.length, 'favorito', 'favoritos');

  if (estadoApp.favoritos.length === 0) {
    tbody.innerHTML = `
      <tr class="table__empty-row">
        <td colspan="6" class="table__empty-cell">
          Aún no tienes favoritos. Busca países y presiona Guardar.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = '';

  estadoApp.favoritos.forEach(function (fav) {
    const fila = document.createElement('tr');
    fila.className = 'table__row';

    fila.innerHTML = `
      <td class="table__cell">
        <img src="${escaparHTML(fav.bandera)}" alt="${escaparHTML(fav.nombre)}" class="table__flag">
      </td>
      <td class="table__cell table__cell--name">${escaparHTML(fav.nombre)}</td>
      <td class="table__cell">${escaparHTML(fav.capital)}</td>
      <td class="table__cell">${escaparHTML(fav.region)}</td>
      <td class="table__cell">${formatearNumero(fav.poblacion)}</td>
      <td class="table__cell">
        <button class="btn btn--danger btn--sm" type="button" data-cca3="${escaparHTML(fav.cca3)}">
          Quitar
        </button>
      </td>`;

    fila.querySelector('.btn--danger').addEventListener('click', function () {
      const codigo = this.dataset.cca3;
      estadoApp.favoritos = estadoApp.favoritos.filter(function (f) { return f.cca3 !== codigo; });
      renderizarTablaFavoritos();
      actualizarBotonTarjeta(codigo, false);
      actualizarResumen();
      mostrarToast('País eliminado de favoritos', 'info');
    });

    tbody.appendChild(fila);
  });
}

function actualizarBotonTarjeta(cca3, esFavorito) {
  const tarjeta = document.querySelector(`.country-card[data-cca3="${cca3}"]`);
  if (!tarjeta) return;
  const btn = tarjeta.querySelector('.country-card__fav-btn');
  if (!btn) return;
  btn.textContent = esFavorito ? '★ Guardado' : '☆ Guardar';
  btn.className   = `btn ${esFavorito ? 'btn--fav-active' : 'btn--fav'} country-card__fav-btn`;
}

/* ── Viajes ─────────────────────────────────────────────────────────── */
function agregarViaje(viaje) {
  estadoApp.viajesDeseados.push(viaje);
  renderizarListaViajes();
  actualizarResumen();
  mostrarToast('Destino agregado: ' + viaje.destino, 'success');
}

function renderizarListaViajes() {
  const contenedor = document.getElementById('travelListContainer');
  const contador   = document.getElementById('travelCount');
  contador.textContent = estadoApp.viajesDeseados.length;

  if (estadoApp.viajesDeseados.length === 0) {
    contenedor.innerHTML = '<li class="travel-list__empty">Aún no has agregado destinos.</li>';
    return;
  }

  contenedor.innerHTML = '';

  estadoApp.viajesDeseados.forEach(function (viaje, i) {
    const li = document.createElement('li');
    li.className = 'travel-list__item';
    li.innerHTML = `
      <div class="travel-item">
        <div class="travel-item__header">
          <span class="travel-item__number">#${i + 1}</span>
          <strong class="travel-item__destination">${escaparHTML(viaje.destino)}</strong>
          <span class="travel-item__date">${formatearFecha(viaje.fecha)}</span>
        </div>
        <p class="travel-item__traveler">Viajero: ${escaparHTML(viaje.viajero)}</p>
        ${viaje.nota ? `<p class="travel-item__note">"${escaparHTML(viaje.nota)}"</p>` : ''}
        <button class="btn btn--danger btn--sm" type="button" data-id="${viaje.id}">Eliminar</button>
      </div>`;

    li.querySelector('.btn--danger').addEventListener('click', function () {
      eliminarViaje(Number(this.dataset.id));
    });

    contenedor.appendChild(li);
  });
}

function eliminarViaje(id) {
  const viaje = estadoApp.viajesDeseados.find(function (v) { return v.id === id; });
  estadoApp.viajesDeseados = estadoApp.viajesDeseados.filter(function (v) { return v.id !== id; });
  renderizarListaViajes();
  actualizarResumen();
  if (viaje) mostrarToast('Destino eliminado: ' + viaje.destino, 'warning');
}

/* ── Validación formulario ──────────────────────────────────────────── */
function validarFormulario() {
  let esValido = true;

  const nombre  = document.getElementById('travelerName').value.trim();
  const destino = document.getElementById('destination').value.trim();
  const fecha   = document.getElementById('travelDate').value;

  if (!nombre || nombre.length < 2) {
    mostrarError('nameError', !nombre ? 'El nombre es obligatorio.' : 'Debe tener al menos 2 caracteres.');
    esValido = false;
  } else {
    limpiarError('nameError');
  }

  if (!destino || destino.length < 2) {
    mostrarError('destinationError', !destino ? 'El destino es obligatorio.' : 'Debe tener al menos 2 caracteres.');
    esValido = false;
  } else {
    limpiarError('destinationError');
  }

  if (!fecha) {
    mostrarError('dateError', 'La fecha es obligatoria.');
    esValido = false;
  } else {
    const hoy  = new Date();
    const fViaje = new Date(fecha + 'T00:00:00');
    hoy.setHours(0, 0, 0, 0);
    if (fViaje < hoy) {
      mostrarError('dateError', 'La fecha debe ser igual o posterior a hoy.');
      esValido = false;
    } else {
      limpiarError('dateError');
    }
  }

  return esValido;
}

function mostrarError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
}

function limpiarError(id) {
  const el = document.getElementById(id);
  el.textContent = ''; el.style.display = 'none';
}

function resetearFormulario() {
  document.getElementById('travelForm').reset();
  document.getElementById('charCount').textContent = '0 / 200';
  ['nameError', 'destinationError', 'dateError'].forEach(limpiarError);
}

/* ── UI helpers ─────────────────────────────────────────────────────── */
function mostrarEstadoBusqueda(mensaje, tipo) {
  const el = document.getElementById('searchStatus');
  el.textContent = mensaje;
  el.className   = tipo ? `search-status search-status--${tipo}` : 'search-status';
}

function actualizarResumen() {
  setText('resultsCount', pluralizar(estadoApp.resultadosActuales.length, 'país', 'países'));
  setText('statResults',  estadoApp.resultadosActuales.length);
  setText('statFavs',     estadoApp.favoritos.length);
  setText('statTrips',    estadoApp.viajesDeseados.length);
  setText('favCount',     pluralizar(estadoApp.favoritos.length, 'favorito', 'favoritos'));
  setText('travelCount',  estadoApp.viajesDeseados.length);
}

function aplicarOrdenResultados() {
  if (estadoApp.resultadosActuales.length) renderizarTarjetasPaises(estadoApp.resultadosActuales);
}

function alternarVistaResultados() {
  estadoApp.vistaCompacta = !estadoApp.vistaCompacta;
  const grid  = document.getElementById('resultsGrid');
  const boton = document.getElementById('viewToggle');
  grid.classList.toggle('results-grid--compact', estadoApp.vistaCompacta);
  boton.setAttribute('aria-pressed', String(estadoApp.vistaCompacta));
  boton.innerHTML = estadoApp.vistaCompacta
    ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="12" height="4" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="9" width="12" height="4" rx="1" stroke="currentColor" stroke-width="1.4"/></svg> Vista amplia'
    : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/></svg> Vista compacta';
}

function ordenarPaises(paises) {
  const criterio = (document.getElementById('sortSelect') || {}).value || 'population-desc';
  return paises.sort(function (a, b) {
    if (criterio === 'population-asc') return (a.population || 0) - (b.population || 0);
    if (criterio === 'name-asc')       return a.name.common.localeCompare(b.name.common);
    if (criterio === 'region-asc')     return (a.region || '').localeCompare(b.region || '') || a.name.common.localeCompare(b.name.common);
    return (b.population || 0) - (a.population || 0);
  });
}

function sincronizarChipsRegion(region) {
  document.querySelectorAll('[data-region-option]').forEach(function (chip) {
    chip.classList.toggle('is-active', chip.dataset.regionOption === region);
  });
}

/* ── Scroll suave con easing ────────────────────────────────────────── */
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function scrollSuave(destinoY, duracionMs) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, destinoY);
    return;
  }

  const inicio    = window.scrollY;
  const distancia = destinoY - inicio;
  const duracion  = duracionMs || Math.min(Math.max(Math.abs(distancia) * 0.45, 380), 820);
  let   t0        = null;

  function paso(ahora) {
    if (!t0) t0 = ahora;
    const progreso = Math.min((ahora - t0) / duracion, 1);
    window.scrollTo(0, inicio + distancia * easeInOutQuart(progreso));
    if (progreso < 1) requestAnimationFrame(paso);
  }

  requestAnimationFrame(paso);
}

function alturaHeader() {
  const h = document.getElementById('siteHeader');
  return h ? h.offsetHeight + 12 : 84;
}

function inicializarScrollSuave() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id     = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const destinoY = target.getBoundingClientRect().top + window.scrollY - alturaHeader();
    scrollSuave(destinoY);

    /* Cierra el menú móvil si estaba abierto */
    if (typeof cerrarMenuPrincipal === 'function') cerrarMenuPrincipal();
  });
}

/* ── Scroll progress + Back to top ─────────────────────────────────── */
function inicializarScrollExtras() {
  const progressBar = document.getElementById('scrollProgress');
  const backToTop   = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
    if (backToTop)   backToTop.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      scrollSuave(0);
    });
  }
}

/* ── Intersection observer ──────────────────────────────────────────── */
function inicializarAnimacionesSecciones() {
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.section-animate').forEach(function (el) {
    io.observe(el);
  });
}

/* ── Nav active link on scroll ──────────────────────────────────────── */
function inicializarNavActiva() {
  const sections = ['buscar', 'resultados', 'favoritos', 'lista-viajes'];
  const links    = document.querySelectorAll('.header__nav-link[data-nav]');

  window.addEventListener('scroll', function () {
    let active = sections[0];
    sections.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) active = id;
    });
    links.forEach(function (link) {
      link.classList.toggle('is-active', link.dataset.nav === active);
    });
  }, { passive: true });
}

/* ── Utility ────────────────────────────────────────────────────────── */
function formatearNumero(num) {
  if (typeof num !== 'number') return 'N/D';
  return num.toLocaleString('es-ES');
}

function formatearFecha(s) {
  if (!s) return 'Sin fecha';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function obtenerMonedas(currencies) {
  if (!currencies) return 'N/D';
  return Object.values(currencies).map(function (c) {
    return `${c.name} (${c.symbol || '—'})`;
  }).slice(0, 2).join(', ') || 'N/D';
}

function obtenerIdiomas(languages) {
  if (!languages) return 'N/D';
  return Object.values(languages).slice(0, 2).join(', ') || 'N/D';
}

function pluralizar(n, sing, plur) { return `${n} ${n === 1 ? sing : plur}`; }

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escaparHTML(val) {
  return String(val ?? '')
    .replaceAll('&',  '&amp;')
    .replaceAll('<',  '&lt;')
    .replaceAll('>',  '&gt;')
    .replaceAll('"',  '&quot;')
    .replaceAll("'",  '&#039;');
}

/* ── Init ───────────────────────────────────────────────────────────── */
async function inicializarApp() {
  inicializarEventos();
  inicializarScrollSuave();
  inicializarScrollExtras();
  inicializarAnimacionesSecciones();
  inicializarNavActiva();
  actualizarResumen();
  mostrarEstadoBusqueda('Cargando países destacados…', 'loading');
  mostrarSkeletons(8);

  try {
    const paises = await obtenerPaisesDestacados();
    renderizarTarjetasPaises(paises);
    mostrarEstadoBusqueda(
      `Mostrando ${paises.length} países populares. Busca cualquier país.`,
      'success'
    );
  } catch (error) {
    mostrarEstadoBusqueda('No se pudo conectar con la API. Verifica tu conexión.', 'error');
    document.getElementById('resultsGrid').innerHTML = `
      <div class="results-grid__empty">
        <div>
          <p>Sin conexión a la API</p>
          <p>Usa el buscador o el filtro de región cuando tengas internet.</p>
        </div>
      </div>`;
    actualizarResumen();
  }
}

document.addEventListener('DOMContentLoaded', inicializarApp);
