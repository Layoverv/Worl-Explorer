/* =====================================================================
   eventos.js - Registro de interacciones de World Explorer
   ===================================================================== */

function inicializarEventos() {
  document.getElementById('searchBtn')
    .addEventListener('click', manejarBusqueda);

  document.getElementById('searchInput')
    .addEventListener('keydown', function(e) {
      if (e.key === 'Enter') manejarBusqueda();
    });

  document.getElementById('searchInput')
    .addEventListener('input', manejarInputBusqueda);

  document.getElementById('regionFilter')
    .addEventListener('change', manejarFiltroRegion);

  document.getElementById('travelForm')
    .addEventListener('submit', manejarFormularioViaje);

  document.getElementById('travelNote')
    .addEventListener('input', actualizarContadorCaracteres);

  document.getElementById('clearFavBtn')
    .addEventListener('click', limpiarFavoritos);

  document.getElementById('sortSelect')
    .addEventListener('change', aplicarOrdenResultados);

  document.getElementById('viewToggle')
    .addEventListener('click', alternarVistaResultados);

  document.getElementById('menuToggle')
    .addEventListener('click', alternarMenuPrincipal);

  document.querySelectorAll('.header__nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      cerrarMenuPrincipal();
    });
  });

  document.querySelectorAll('[data-region-option]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      const region = this.dataset.regionOption;
      document.getElementById('regionFilter').value = region;
      sincronizarChipsRegion(region);
      manejarFiltroRegion();
    });
  });

  window.addEventListener('scroll', manejarScrollHeader, { passive: true });
}

async function manejarBusqueda() {
  const input = document.getElementById('searchInput');
  const termino = input.value.trim();

  if (!termino) {
    mostrarEstadoBusqueda('Escribe el nombre de un país para buscar.', 'warning');
    input.focus();
    return;
  }

  mostrarEstadoBusqueda('Buscando país...', 'loading');
  document.getElementById('resultsGrid').innerHTML = '';
  estadoApp.resultadosActuales = [];
  actualizarResumen();
  document.getElementById('regionFilter').value = '';
  sincronizarChipsRegion('');
  cerrarMenuPrincipal();

  try {
    const paises = await buscarPaisesPorNombre(termino);
    renderizarTarjetasPaises(paises);
    mostrarEstadoBusqueda(`${paises.length} resultado(s) para "${termino}"`, 'success');
  } catch (error) {
    estadoApp.resultadosActuales = [];
    mostrarEstadoBusqueda(error.message, 'error');
    document.getElementById('resultsGrid').innerHTML = `
      <div class="results-grid__empty">
        <div>
          <p>Sin resultados para <strong>"${escaparHTML(termino)}"</strong></p>
          <p>Intenta con el nombre en inglés, por ejemplo Germany, Brazil o Japan.</p>
        </div>
      </div>`;
    actualizarResumen();
  }
}

function manejarInputBusqueda() {
  const valor = document.getElementById('searchInput').value.trim();
  if (!valor) mostrarEstadoBusqueda('', '');
}

async function manejarFiltroRegion() {
  const region = document.getElementById('regionFilter').value;
  sincronizarChipsRegion(region);
  document.getElementById('searchInput').value = '';
  document.getElementById('resultsGrid').innerHTML = '';
  estadoApp.resultadosActuales = [];
  actualizarResumen();
  cerrarMenuPrincipal();

  if (!region) {
    mostrarEstadoBusqueda('Cargando países destacados...', 'loading');

    try {
      const paisesIniciales = await obtenerPaisesDestacados();
      renderizarTarjetasPaises(paisesIniciales);
      mostrarEstadoBusqueda(`Mostrando ${paisesIniciales.length} países populares.`, 'success');
    } catch (error) {
      estadoApp.resultadosActuales = [];
      mostrarEstadoBusqueda('No se pudo cargar la selección inicial.', 'error');
      actualizarResumen();
    }

    return;
  }

  mostrarEstadoBusqueda(`Cargando países de ${nombresRegion[region] || region}...`, 'loading');

  try {
    const paises = await buscarPaisesPorRegion(region);
    renderizarTarjetasPaises(paises);
    mostrarEstadoBusqueda(`${paises.length} países en ${nombresRegion[region] || region}`, 'success');
  } catch (error) {
    estadoApp.resultadosActuales = [];
    mostrarEstadoBusqueda(error.message, 'error');
    actualizarResumen();
  }
}

function manejarFormularioViaje(e) {
  e.preventDefault();

  if (!validarFormulario()) return;

  const nuevoViaje = {
    id: Date.now(),
    viajero: document.getElementById('travelerName').value.trim(),
    destino: document.getElementById('destination').value.trim(),
    fecha: document.getElementById('travelDate').value,
    nota: document.getElementById('travelNote').value.trim(),
  };

  agregarViaje(nuevoViaje);
  resetearFormulario();
}

function actualizarContadorCaracteres() {
  const textarea = document.getElementById('travelNote');
  const contador = document.getElementById('charCount');
  const len = textarea.value.length;

  contador.textContent = `${len} / 200`;
  contador.style.color = len > 180 ? '#ff5d87' : '';
}

function limpiarFavoritos() {
  if (estadoApp.favoritos.length === 0) return;

  if (confirm('¿Seguro que deseas eliminar todos los favoritos?')) {
    estadoApp.favoritos = [];
    renderizarTablaFavoritos();
    actualizarResumen();

    document.querySelectorAll('.country-card__fav-btn').forEach(function(btn) {
      btn.textContent = 'Guardar';
      btn.className = 'btn btn--fav country-card__fav-btn';
    });
  }
}

function alternarMenuPrincipal() {
  const header = document.querySelector('.header');
  const boton = document.getElementById('menuToggle');
  const abierto = header.classList.toggle('is-open');

  boton.setAttribute('aria-expanded', String(abierto));
  boton.setAttribute('aria-label', abierto ? 'Cerrar navegación' : 'Abrir navegación');
}

function cerrarMenuPrincipal() {
  const header = document.querySelector('.header');
  const boton = document.getElementById('menuToggle');

  header.classList.remove('is-open');
  boton.setAttribute('aria-expanded', 'false');
  boton.setAttribute('aria-label', 'Abrir navegación');
}

function manejarScrollHeader() {
  document.querySelector('.header').classList.toggle('is-scrolled', window.scrollY > 8);
}
