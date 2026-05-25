/* =====================================================================
   api.js — Módulo de consumo de la API REST Countries
   API pública: https://restcountries.com/v3.1
   No requiere autenticación ni API Key.
   Cubre: fetch(), async/await, Promesas con .then()/.catch()
   ===================================================================== */

const API_BASE = 'https://restcountries.com/v3.1';

/**
 * Busca países por nombre usando async/await.
 * Demuestra: fetch + async/await + manejo de errores con try/catch.
 *
 * @param {string} nombre - Nombre del país (en cualquier idioma)
 * @returns {Promise<Array>} Array de objetos país
 */
async function buscarPaisesPorNombre(nombre) {
  const url = `${API_BASE}/name/${encodeURIComponent(nombre)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`No se encontró ningún país con el nombre "${nombre}".`);
    }
    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
  }

  const datos = await response.json();
  return datos;
}

/**
 * Busca todos los países de una región usando el estilo .then()/.catch().
 * Demuestra: fetch + Promesas encadenadas con .then() y .catch().
 *
 * @param {string} region - Nombre de la región (Africa, Americas, Asia, Europe, Oceania)
 * @returns {Promise<Array>} Array de objetos país
 */
function buscarPaisesPorRegion(region) {
  const url = `${API_BASE}/region/${encodeURIComponent(region)}`;

  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`Error al obtener la región: ${response.status}`);
      }
      return response.json();
    })
    .catch(function(error) {
      // Re-lanza el error para que el caller lo maneje
      throw new Error(`No se pudo cargar la región "${region}": ${error.message}`);
    });
}

/**
 * Carga un conjunto inicial de países de América para la pantalla de bienvenida.
 * Demuestra: async/await + try/catch + manipulación de arrays (.sort, .slice).
 *
 * @returns {Promise<Array>} Los 8 países de América con mayor población
 */
async function obtenerPaisesDestacados() {
  try {
    const url = `${API_BASE}/region/americas`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`No se pudo cargar la información inicial: ${response.status}`);
    }

    const paises = await response.json();

    // Ordena por población descendente y retorna los primeros 8
    return paises
      .sort((a, b) => b.population - a.population)
      .slice(0, 8);

  } catch (error) {
    // El error se propaga al llamador (inicializarApp en app.js)
    throw new Error(`Error al cargar países destacados: ${error.message}`);
  }
}
