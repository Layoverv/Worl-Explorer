#  World Explorer

> Busca cualquier país, filtra por región, guarda favoritos y organiza tu lista de viajes — todo en una sola página.

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/REST_Countries_API-4CAF50?style=for-the-badge&logo=api&logoColor=white"/>
</p>

---

##  Descripción

**World Explorer** es una aplicación web de una sola página (SPA) desarrollada como proyecto final de Desarrollo Web 2026. Permite explorar información detallada de países de todo el mundo, guardar favoritos y planificar viajes, todo con una interfaz moderna y accesible.

El proyecto destaca por integrar una **visualización 3D de banderas** usando Three.js y consumir datos en tiempo real desde la **REST Countries API**.

---

##  Características principales

| Función | Descripción |
|---|---|
|  **Búsqueda inteligente** | Busca cualquier país por nombre en tiempo real |
|  **Filtrado por región** | Filtra por África, América, Asia, Europa u Oceanía mediante chips interactivos |
|  **Ordenamiento dinámico** | Ordena por población (mayor/menor), nombre A-Z o región |
|  **Vista compacta / grilla** | Alterna entre dos modos de visualización de resultados |
|  **Favoritos** | Guarda países en una tabla con bandera, capital, región y población |
|  **Planificador de viajes** | Formulario para registrar destinos, fechas y notas personales |
|  **Bandera 3D** | Renderizado de banderas en 3D usando Three.js al pasar sobre un país |
|  **Estadísticas en vivo** | Contador de países visibles, favoritos y viajes guardados |
|  **Accesibilidad** | ARIA labels, roles semánticos, navegación por teclado |
|  **Responsive** | Adaptado para móvil con menú hamburguesa |

---

##  Estructura del proyecto

```
Worl-Explorer/
├── index.html          # Estructura principal de la SPA
├── css/
│   └── styles.css      # Estilos globales y componentes
├── js/
│   ├── api.js          # Consumo de REST Countries API
│   ├── app.js          # Lógica principal de la aplicación
│   ├── eventos.js      # Manejo de eventos del DOM
│   └── flag3d.js       # Renderizado 3D de banderas con Three.js
├── libs/               # Librerías locales
└── three.js            # Motor 3D (r128)
```

---

##  Cómo ejecutar el proyecto

### Opción 1 — Abrir directamente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Layoverv/Worl-Explorer.git
   ```
2. Abre `index.html` en tu navegador preferido.

> ⚠️ Para que Three.js funcione correctamente con texturas locales, se recomienda usar un servidor local.

### Opción 2 — Con servidor local (recomendado)

```bash
# Con VS Code: instala la extensión Live Server y haz clic en "Go Live"

# Con Python:
cd Worl-Explorer
python -m http.server 5500

# Luego abre: http://localhost:5500
```

---

##  Tecnologías utilizadas

- **HTML5** — Estructura semántica y accesible
- **CSS3** — Variables CSS, animaciones, diseño responsive
- **JavaScript (Vanilla ES6+)** — Lógica, eventos, DOM
- **[Three.js r128](https://threejs.org/)** — Renderizado 3D de banderas
- **[REST Countries API](https://restcountries.com/)** — Datos de países (nombre, capital, región, población, bandera)

---

##  Secciones de la aplicación

###  Hero / Inicio
Presenta la aplicación con estadísticas en vivo, barra de búsqueda, selector de región y la visualización 3D de banderas.

###  Resultados
Grilla de países con tarjetas que muestran bandera, nombre, capital, región, población y botón para guardar como favorito.

###  Favoritos
Tabla comparativa con todos los países guardados. Permite eliminarlos individualmente o limpiar toda la lista.

###  Lista de viajes
Formulario con validación para agregar destinos: nombre del viajero, país/ciudad destino, fecha planificada y notas personales.

---

##  Decisiones de diseño

- **Paleta oscura moderna** con acentos en gradiente para transmitir una sensación de exploración nocturna
- **Tipografía clara y legible** optimizada para listas de datos
- **Animaciones sutiles** en la carga de secciones para mejorar la percepción de fluidez
- **Scroll progress bar** para orientar al usuario dentro de la página larga
- **Toast notifications** para feedback inmediato al guardar/eliminar elementos

---

##  Posibles mejoras futuras

- [ ] Página de detalle por país con mapa interactivo
- [ ] Exportar lista de viajes a PDF
- [ ] Comparador lado a lado de dos países
- [ ] Modo claro / oscuro
- [ ] Persistencia de datos con `localStorage`
- [ ] PWA (Progressive Web App) para uso offline

---

##  Autor

**Layoverv**
- GitHub: [@Layoverv](https://github.com/Layoverv)

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos como **Proyecto Final — Desarrollo Web 2026**.

---

<p align="center">
   · Datos de <a href="https://restcountries.com">REST Countries</a> · 3D con <a href="https://threejs.org">Three.js</a>
</p>
