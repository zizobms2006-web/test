/* Glossy 3D objects in the brand colours, floating in page heroes and the industries section.
   Each <canvas class="obj3d" data-objects="<preset>"> gets its own small scene (presets below).
   Renders only while on screen; a single still frame when the visitor prefers reduced motion. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvases = [...document.querySelectorAll('canvas.obj3d')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;

const COLORS = { teal: '#279596', light: '#42BEBC', deep: '#106067', orange: '#FF5A1F', pearl: '#FFFFFF', slate: '#314A4F' };
const material = (c, opts = {}) => new THREE.MeshPhysicalMaterial({
  color: COLORS[c], roughness: c === 'pearl' ? .28 : .22, metalness: c === 'deep' || c === 'slate' ? .25 : .08,
  clearcoat: 1, clearcoatRoughness: .12, flatShading: !!opts.flat, ...opts.extra
});
const GEO = {
  knot: () => new THREE.TorusKnotGeometry(.85, .3, 180, 28),
  torus: () => new THREE.TorusGeometry(1, .36, 48, 110),
  ring: () => new THREE.TorusGeometry(1.25, .07, 16, 140),
  box: () => new RoundedBoxGeometry(1.3, 1.3, 1.3, 6, .26),
  slab: () => new RoundedBoxGeometry(1.7, 1.15, .22, 4, .1),
  sphere: () => new THREE.SphereGeometry(1, 48, 48),
  capsule: () => new THREE.CapsuleGeometry(.42, 1, 12, 28),
  cone: () => new THREE.ConeGeometry(.85, 1.4, 48),
  gem: () => new THREE.IcosahedronGeometry(1, 0)
};

// [shape, colour, position, scale, flat?] — the first object is the centrepiece
const PRESETS = {
  about:    [['knot', 'teal', [0, 0, 0], 1.25], ['sphere', 'orange', [2.1, 1.3, .6], .34], ['box', 'pearl', [-2.2, -1.2, .4], .55], ['ring', 'light', [0, 0, -.6], 1.55], ['gem', 'deep', [1.9, -1.6, .2], .5, true]],
  services: [['box', 'teal', [0, 0, 0], 1.2], ['box', 'light', [1.9, 1.35, -.4], .55], ['sphere', 'pearl', [-2, 1, .3], .45], ['torus', 'orange', [-1.7, -1.5, .4], .38], ['capsule', 'deep', [2, -1.4, .2], .7]],
  projects: [['gem', 'light', [0, 0, 0], 1.5, true], ['slab', 'pearl', [-2.1, 1.1, -.3], .75], ['torus', 'teal', [2.1, -1.2, .2], .55], ['sphere', 'orange', [1.9, 1.4, .5], .3], ['slab', 'teal', [-1.8, -1.5, .3], .55]],
  clients:  [['torus', 'teal', [0, 0, 0], 1.25], ['sphere', 'pearl', [0, 0, 0], .32, false, 'orbit'], ['sphere', 'orange', [0, 0, 0], .22, false, 'orbit'], ['sphere', 'light', [0, 0, 0], .26, false, 'orbit'], ['gem', 'deep', [-2.1, -1.4, .2], .45, true]],
  contact:  [['sphere', 'pearl', [0, 0, 0], 1.05], ['ring', 'teal', [0, 0, 0], 1.25], ['cone', 'orange', [1.9, 1.3, .4], .42], ['capsule', 'teal', [-2, -1.2, .3], .65], ['box', 'light', [-1.8, 1.5, -.2], .42]],
  sectors:  [['box', 'teal', [-6.2, 2, -1], .6], ['sphere', 'orange', [6, 2.4, -1.2], .38], ['torus', 'light', [6.4, -1.8, -1], .55], ['gem', 'deep', [-6.6, -2.2, -1.4], .7, true],
             ['capsule', 'pearl', [-6.9, .2, -2], .55], ['knot', 'teal', [6.8, .4, -2.4], .5], ['torus', 'orange', [-5.6, 3.4, -3], .3], ['sphere', 'light', [5.8, -3.3, -2.4], .42]]
};

let env = null;
function build(canvas) {
  const preset = PRESETS[canvas.dataset.objects];
  if (!preset || !canvas.offsetParent) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  env = env || new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  scene.environment = env;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 6); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x106067, .6));

  const wide = canvas.dataset.objects === 'sectors';
  const camera = new THREE.PerspectiveCamera(wide ? 40 : 35, 1, .1, 100);
  camera.position.set(0, 0, wide ? 12 : 9.5);

  const root = new THREE.Group(); scene.add(root);
  const items = (small && wide ? preset.slice(0, 4) : preset).map(([shape, color, pos, scale, flat, mode], i) => {
    const mesh = new THREE.Mesh(GEO[shape](), material(color, { flat }));
    mesh.position.set(...pos);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    root.add(mesh);
    return { mesh, base: new THREE.Vector3(...pos), scale, mode, i, spin: .15 + Math.random() * .35, phase: Math.random() * 6.28 };
  });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the side objects of the wide scene at the edges on any screen
    if (wide) camera.position.z = Math.max(12, 9.5 * 1.6 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();

  const pointer = { x: 0, y: 0 }, look = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5; }, { passive: true });

  let start = null;
  const frame = t => {
    if (start === null) start = t;
    const age = t - start;
    look.x += (pointer.x - look.x) * .05; look.y += (pointer.y - look.y) * .05;
    const scroll = scrollY * .0012;
    root.rotation.y = look.x * .5 + (wide ? 0 : scroll);
    root.rotation.x = look.y * .3;
    for (const it of items) {
      const grow = Math.min(1, Math.max(0, (age - it.i * .12) / .9));
      const pop = 1 - Math.pow(1 - grow, 3) * Math.cos(grow * 4.5);   // springy entrance
      it.mesh.scale.setScalar(it.scale * pop);
      if (it.mode === 'orbit') {
        const a = t * (.5 + it.i * .12) + it.i * 2.1, r = 2 + it.i * .15;
        it.mesh.position.set(Math.cos(a) * r, Math.sin(a * .7) * .9, Math.sin(a) * r * .55);
      } else {
        it.mesh.position.y = it.base.y + Math.sin(t * .8 + it.phase) * (wide ? .25 : .16);
        it.mesh.position.x = it.base.x + Math.cos(t * .6 + it.phase) * .08;
      }
      it.mesh.rotation.x += it.spin * .006;
      it.mesh.rotation.y += it.spin * .01;
    }
    renderer.render(scene, camera);
  };

  if (reduced) { frame(3); return; }
  let on = false, id = 0;
  const run = ms => { frame(ms * .001); id = requestAnimationFrame(run); };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; id = requestAnimationFrame(run); }
    else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(id); }
  }).observe(canvas);
}

canvases.forEach(build);
