/* =====================================================================
   flag3d.js — Bandera Colombia 3D + objeto geométrico multicolor
   ===================================================================== */

// THREE está disponible globalmente desde el script tag

(function () {
  const canvas = document.getElementById('flagCanvas');
  if (!canvas) return;

  const container = canvas.parentElement;

  /* ── Renderer ──────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ── Escena / Cámara ───────────────────────────────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.2, 11);
  camera.lookAt(0, 0, 0);

  /* ── Iluminación ───────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const sol = new THREE.DirectionalLight(0xfff5e0, 1.5);
  sol.position.set(5, 7, 8);
  sol.castShadow = true;
  scene.add(sol);

  const relleno = new THREE.DirectionalLight(0xb0c0ff, 0.45);
  relleno.position.set(-4, -2, 3);
  scene.add(relleno);

  /* Luces de color para el objeto geométrico */
  const luzRoja    = new THREE.PointLight(0xff2244, 2.2, 5);
  const luzAmarilla= new THREE.PointLight(0xffcc00, 2.2, 5);
  const luzAzul    = new THREE.PointLight(0x4488ff, 2.2, 5);
  const luzMagenta = new THREE.PointLight(0xcc44ff, 2.0, 5);
  luzRoja.position.set(3.5,  1.2, 1.5);
  luzAmarilla.position.set(4.2, -0.8, 1.0);
  luzAzul.position.set(5.0,  0.4, -1.0);
  luzMagenta.position.set(4.0, 0.0, 2.0);
  scene.add(luzRoja, luzAmarilla, luzAzul, luzMagenta);

  /* ── Textura bandera de Colombia ───────────────────────────────── */
  function crearTexturaColombia() {
    const tc = document.createElement('canvas');
    tc.width = 900; tc.height = 600;
    const ctx = tc.getContext('2d');

    ctx.fillStyle = '#FCD116';
    ctx.fillRect(0, 0, 900, 300);

    ctx.fillStyle = '#003087';
    ctx.fillRect(0, 300, 900, 150);

    ctx.fillStyle = '#CE1126';
    ctx.fillRect(0, 450, 900, 150);

    /* Sombras suaves entre franjas */
    [[285, 315], [435, 465]].forEach(function ([y0, y1]) {
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0,  'rgba(0,0,0,0)');
      g.addColorStop(.5, 'rgba(0,0,0,.09)');
      g.addColorStop(1,  'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, y0, 900, y1 - y0);
    });

    /* Brillo superior */
    const shine = ctx.createLinearGradient(0, 0, 0, 100);
    shine.addColorStop(0, 'rgba(255,255,255,.16)');
    shine.addColorStop(1, 'rgba(255,255,255,.0)');
    ctx.fillStyle = shine; ctx.fillRect(0, 0, 900, 100);

    const tex = new THREE.CanvasTexture(tc);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  /* ── Bandera ───────────────────────────────────────────────────── */
  const SEG = 40, FLAG_W = 3.4, FLAG_H = 2.12;
  const flagGeo = new THREE.PlaneGeometry(FLAG_W, FLAG_H, SEG, SEG);
  const posAttr = flagGeo.attributes.position;
  const origX = new Float32Array(posAttr.count);
  const origY = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) {
    origX[i] = posAttr.getX(i);
    origY[i] = posAttr.getY(i);
  }

  const flagMat = new THREE.MeshStandardMaterial({
    map: crearTexturaColombia(),
    side: THREE.DoubleSide,
    roughness: 0.55, metalness: 0.04,
  });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0.55, 0, 0);

  /* Asta */
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xd0c0f0, roughness: 0.22, metalness: 0.88 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd560, roughness: 0.16, metalness: 0.94 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 4.1, 16), poleMat);
  pole.position.set(-1.15, -0.35, 0);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), goldMat);
  ball.position.set(-1.15, 1.70, 0);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.26, 14), goldMat);
  tip.position.set(-1.15, 1.95, 0);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 10, 24), goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(-1.15, 1.35, 0);

  /* Grupo bandera — posicionado en el centro */
  const grupoBandera = new THREE.Group();
  grupoBandera.add(flagMesh, pole, ball, tip, ring);
  grupoBandera.position.x = 0;
  scene.add(grupoBandera);

  /* ── Resize ────────────────────────────────────────────────────── */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Hint ──────────────────────────────────────────────────────── */
  const hintEl = document.getElementById('flagHint');
  if (hintEl) hintEl.textContent = '🇨🇴 Colombia';

  /* ── Animación ─────────────────────────────────────────────────── */
  function animar(ahora) {
    requestAnimationFrame(animar);
    const t = ahora * 0.001;

    /* ── Ola de la bandera ─────────────────────────────────────── */
    for (let i = 0; i < posAttr.count; i++) {
      const x = origX[i];
      const y = origY[i];
      const f = (x + FLAG_W / 2) / FLAG_W;
      posAttr.setZ(i,
        Math.sin(x * 2.8 - t * 2.6) * 0.24 * f +
        Math.sin(x * 4.6 - t * 3.9 + y * 1.3) * 0.07 * f
      );
    }
    posAttr.needsUpdate = true;
    flagGeo.computeVertexNormals();

    /* ── Rotación bandera ──────────────────────────────────────── */
    grupoBandera.rotation.y += 0.007;
    grupoBandera.rotation.z  = Math.sin(t * 0.4) * 0.022;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animar);

  /* ── API pública ───────────────────────────────────────────────── */
  window.actualizarBandera3D = function (url, nombre) {
    if (!url) return;
    new THREE.TextureLoader().load(url, function (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy  = renderer.capabilities.getMaxAnisotropy();
      flagMat.map = tex;
      flagMat.needsUpdate = true;
      if (hintEl && nombre) hintEl.textContent = '🌍 ' + nombre;
    });
  };

  canvas.style.cursor = 'pointer';
  canvas.title = 'Clic para restablecer la bandera de Colombia';
  canvas.addEventListener('click', function () {
    flagMat.map = crearTexturaColombia();
    flagMat.needsUpdate = true;
    if (hintEl) hintEl.textContent = '🇨🇴 Colombia';
  });
})();
