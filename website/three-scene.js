import * as THREE from 'three';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BRAND = new THREE.Color('#FF5A1F');
const BRAND_LIGHT = new THREE.Color('#FF8A52');
const TEAL = new THREE.Color('#3FB8B0');

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  r.setClearColor(0x000000, 0);
  return r;
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(.25, 'rgba(255,255,255,.6)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* Visible-only render loop: pauses when the canvas is off-screen. */
function loop(canvas, frame) {
  let on = false, id = 0;
  const run = t => { frame(t * 0.001); id = requestAnimationFrame(run); };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; id = requestAnimationFrame(run); }
    else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(id); }
  }).observe(canvas);
}

/* ================= HERO: growth core ================= */
function hero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0A0B0D, 0.045);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  scene.add(root);

  // Morphing core (displaced icosahedron, fresnel glow)
  const coreUniforms = { uTime: { value: 0 }, uColor: { value: BRAND }, uColor2: { value: BRAND_LIGHT }, uHover: { value: 0 } };
  const coreGeo = new THREE.IcosahedronGeometry(1.55, 48);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    transparent: true,
    vertexShader: `
      uniform float uTime; uniform float uHover;
      varying vec3 vN; varying vec3 vView; varying float vD;
      float wave(vec3 p){
        return sin(p.x*2.1+uTime*1.1)*sin(p.y*2.4+uTime*.9)*sin(p.z*1.9+uTime*1.3);
      }
      void main(){
        float d = wave(position) * (0.18 + uHover*0.12) + sin(length(position.xy)*5.0 - uTime*2.0)*0.03;
        vD = d;
        vec3 p = position + normal * d;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform vec3 uColor2;
      varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){
        float f = pow(1.0 - max(dot(vN, vView), 0.0), 2.4);
        vec3 col = mix(vec3(0.05,0.04,0.04), uColor, f);
        col += uColor2 * smoothstep(0.05, 0.22, vD) * 0.55;
        gl_FragColor = vec4(col, 0.35 + f*0.65);
      }`
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  // Wireframe shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.05, 2),
    new THREE.MeshBasicMaterial({ color: BRAND, wireframe: true, transparent: true, opacity: 0.16 })
  );
  root.add(shell);

  // Shell vertices as glowing nodes
  const sprite = dotTexture();
  const nodeGeo = new THREE.BufferGeometry().setAttribute('position', shell.geometry.getAttribute('position').clone());
  const nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ size: 0.09, map: sprite, color: BRAND_LIGHT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  shell.add(nodes);

  // Orbit rings
  const rings = [];
  [[2.8, 0.012, 1.1, 0.4, BRAND], [3.4, 0.008, -0.5, 1.2, TEAL], [4.1, 0.006, 0.3, -0.7, BRAND_LIGHT]].forEach(([r, t, rx, rz, c], i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 220), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5 - i * 0.1 }));
    ring.rotation.set(rx, 0, rz);
    // satellite riding each ring
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (2 - i) * 0.02, 16, 16), new THREE.MeshBasicMaterial({ color: c }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(0.7);
    sat.add(halo);
    ring.add(sat);
    ring.userData = { r, sat, speed: 0.35 + i * 0.12, phase: i * 2 };
    rings.push(ring);
    root.add(ring);
  });

  // Starfield / data particles
  const N = innerWidth < 700 ? 900 : 2200;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 4 + Math.random() * 16, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
    pos[i * 3 + 2] = r * Math.cos(ph) - 4;
    const c = Math.random() < 0.7 ? BRAND : Math.random() < 0.5 ? BRAND_LIGHT : new THREE.Color('#F4F1EC');
    col.set([c.r, c.g, c.b], i * 3);
    seed[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.06, map: sprite, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(particles);

  // Rising growth bars (a subtle 3D chart behind the core)
  const bars = new THREE.Group();
  const barMat = new THREE.MeshBasicMaterial({ color: BRAND, transparent: true, opacity: 0.12 });
  const barEdge = new THREE.LineBasicMaterial({ color: BRAND, transparent: true, opacity: 0.45 });
  for (let i = 0; i < 9; i++) {
    const h = 0.4 + i * 0.32 + Math.random() * 0.2;
    const g = new THREE.BoxGeometry(0.34, h, 0.34);
    g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, barMat);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), barEdge));
    m.position.set(-3.2 + i * 0.8, -3.2, -5);
    m.scale.y = 0.001;
    m.userData.delay = i * 0.12;
    bars.add(m);
  }
  root.add(bars);

  // Layout: the core sits behind the founder portrait (left on desktop RTL, top on mobile)
  let baseX = 0, baseY = 0, scale = 1;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const mobile = w < 960;
    const visibleW = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    // portrait column is on the left in RTL, on the right in LTR
    baseX = mobile ? 0 : visibleW * 0.24 * (document.documentElement.dir === 'ltr' ? 1 : -1);
    baseY = mobile ? 1.6 : 0;
    scale = mobile ? 0.62 : 1;
    root.position.set(baseX, baseY, 0);
    root.scale.setScalar(scale);
  };
  resize();
  addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const hoverTarget = document.querySelector('.portrait');
  let hover = 0, hoverT = 0;
  hoverTarget?.addEventListener('pointerenter', () => hoverT = 1);
  hoverTarget?.addEventListener('pointerleave', () => hoverT = 0);

  let scrollP = 0;
  addEventListener('scroll', () => { scrollP = Math.min(1, scrollY / innerHeight); }, { passive: true });

  const t0 = performance.now() / 1000;
  const frame = now => {
    const t = now - t0;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    hover += (hoverT - hover) * 0.06;
    coreUniforms.uTime.value = t;
    coreUniforms.uHover.value = hover;

    core.rotation.y = t * 0.15;
    core.rotation.x = t * 0.08;
    shell.rotation.y = -t * 0.1;
    shell.rotation.z = t * 0.05;
    rings.forEach((r, i) => {
      r.rotation.z += 0.0015 * (i % 2 ? -1 : 1);
      const a = t * r.userData.speed + r.userData.phase;
      r.userData.sat.position.set(Math.cos(a) * r.userData.r, Math.sin(a) * r.userData.r, 0);
    });
    bars.children.forEach(b => {
      const k = THREE.MathUtils.clamp((t - 0.6 - b.userData.delay) / 1.2, 0.001, 1);
      b.scale.y = 1 - Math.pow(1 - k, 3);
    });
    particles.rotation.y = t * 0.02 + mouse.x * 0.08;
    particles.rotation.x = mouse.y * 0.05;

    root.rotation.y = mouse.x * 0.35;
    root.rotation.x = mouse.y * 0.25 + scrollP * 0.6;
    root.position.y = baseY + scrollP * 1.5;
    camera.position.z = 9 + scrollP * 3;
    camera.position.x = mouse.x * 0.4;
    camera.position.y = -mouse.y * 0.3;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  if (reduced) { frame(performance.now() / 1000 + 3); return; }
  loop(canvas, frame);
}

/* ================= CTA: particle wave field ================= */
function ctaWave() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 3.2, 9);
  camera.lookAt(0, 0, 0);

  const cols = innerWidth < 700 ? 70 : 130, rows = 50, gap = 0.22;
  const n = cols * rows, pos = new Float32Array(n * 3);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const k = (i * rows + j) * 3;
    pos[k] = (i - cols / 2) * gap; pos[k + 1] = 0; pos[k + 2] = (j - rows / 2) * gap;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const uniforms = { uTime: { value: 0 }, uColor: { value: BRAND }, uColor2: { value: BRAND_LIGHT }, uMouse: { value: new THREE.Vector2(0, 0) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime; uniform vec2 uMouse; varying float vH;
      void main(){
        vec3 p = position;
        float d = distance(p.xz, uMouse*vec2(12.0,4.0));
        p.y = sin(p.x*0.6+uTime)*0.45 + cos(p.z*0.8+uTime*0.8)*0.35 + sin(d*1.5-uTime*3.0)*0.35*exp(-d*0.25);
        vH = p.y;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_PointSize = (2.2 + vH*1.8) * (12.0 / -mv.z);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform vec3 uColor2; varying float vH;
      void main(){
        float d = length(gl_PointCoord-0.5); if(d>0.5) discard;
        float a = smoothstep(0.5,0.0,d);
        gl_FragColor = vec4(mix(uColor, uColor2, clamp(vH+0.4,0.0,1.0)), a*(0.45+vH*0.5));
      }`
  });
  scene.add(new THREE.Points(geo, mat));

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    uniforms.uMouse.value.set((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  });
  const t0 = performance.now() / 1000;
  const frame = now => { uniforms.uTime.value = now - t0; renderer.render(scene, camera); };
  if (reduced) { frame(performance.now() / 1000 + 2); return; }
  loop(canvas, frame);
}

try { hero(); ctaWave(); } catch (e) { console.warn('3D disabled:', e); }
