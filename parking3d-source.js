/*
 * ParkLab 3D — digital twin of the four-space Arduino parking prototype.
 * Author-facing source file. Build: npx esbuild parking3d-source.js --bundle --minify --format=iife --outfile=parking3d.js
 * The browser measures distance from virtual cars to each ultrasonic sensor;
 * its logic mirrors the threshold/hysteresis and safe-entry rules in sketch.ino.
 */
import * as THREE from 'three';

const SLOT_X = [-5.7, -1.9, 1.9, 5.7];
const SLOT_Z = -4.35;
const OPEN_CM = 25;
const OCCUPIED_CM = 18;
const SENSOR_PERIOD = 350;
const GATE_WAIT_MS = 24000;
const $ = (id) => document.getElementById(id);
const state = {
  mode: 'idle', parked: [null, null, null, null], sensed: [false, false, false, false],
  distance: [150, 150, 150, 150], fault: -1, active: null, gateInTarget: 0,
  gateOutTarget: 0, choiceTimer: null, pendingSpot: null, notice: '', noticeType: '',
};

const host = $('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101e2a);
scene.fog = new THREE.Fog(0x101e2a, 26, 55);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.55;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc5f1ff, 0x1d3339, 2.4));
const sun = new THREE.DirectionalLight(0xffe5bc, 3.2);
sun.position.set(-7, 15, 8); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
sun.shadow.bias = -0.0003;
scene.add(sun);
const amber = new THREE.PointLight(0x45f5d2, 26, 13);
amber.position.set(-9, 3.3, -1); scene.add(amber);

const mat = (color, metalness = 0, roughness = .82) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
const asphalt = mat(0x263841), concrete = mat(0x3e5358), white = mat(0xc4e6df), yellow = mat(0xf7c968);
const mint = mat(0x5eeac1), red = mat(0xf78171), dark = mat(0x18333a);
function box(w, h, d, material, x, y, z, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m;
}
function cylinder(radius, height, material, x, y, z, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; scene.add(mesh); return mesh;
}
function line(x1, z1, x2, z2, material, width = .05, y = .106) {
  const dx = x2 - x1, dz = z2 - z1;
  const mesh = box(Math.hypot(dx, dz), .018, width, material, (x1 + x2) / 2, y, (z1 + z2) / 2, false);
  mesh.rotation.y = -Math.atan2(dz, dx);
  return mesh;
}
function textPlane(text, width, height, x, z, size = 96) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0,0,512,160);
  g.font = `700 ${size}px sans-serif`; g.textAlign = 'center'; g.fillStyle = '#d6f7ed';
  g.fillText(text, 256, 110);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  plane.rotation.x = -Math.PI / 2; plane.position.set(x, .13, z); scene.add(plane);
}

// Parking garage, driveway, aisle, bay markings and small architectural details.
box(28, .45, 18.4, concrete, 0, -.27, -1.1);
box(27, .055, 5.1, asphalt, 0, .003, .5, false);
box(27, .08, 4.4, mat(0x2b4245), 0, .055, -4.55, false);
box(27, .16, 1.2, mat(0x4e6967), 0, .09, 5.1);
box(27, .28, .4, mat(0x718980), 0, .17, -7.14);
line(-12.7, 3.02, 12.7, 3.02, white, .09);
for (let x = -11.4; x <= 11.4; x += 2.7) line(x, .75, x + 1.35, .75, yellow, .07);
for (let i = 0; i < 4; i++) {
  const x = SLOT_X[i];
  line(x - 1.65, -6.5, x - 1.65, -2.5, white, .07);
  line(x + 1.65, -6.5, x + 1.65, -2.5, white, .07);
  line(x - 1.65, -6.5, x + 1.65, -6.5, white, .07);
  textPlane('0' + (i + 1), 1.1, .4, x, -6.05, 98);
}
for (let x = -11; x < 12; x += 2.6) {
  box(.16, .14, .16, mint, x, .13, 4.8);
}
for (const x of [-11.2, 11.1]) {
  box(.5, .5, 1.0, dark, x, .28, 3.95);
  box(.44, .08, .82, mint, x, .58, 3.95);
}
// Entrance booth and its luminous sign.
box(2.1, 1.55, 2.1, mat(0x345c62), -9.1, .84, -2.54);
box(2.4, .16, 2.4, dark, -9.1, 1.7, -2.54);
box(1.8, .65, .09, mat(0x92e9d6, .25, .16), -9.1, 1.08, -1.45, false);
for (const x of [-9.15, 9.1]) {
  cylinder(.11, .9, mat(0x6f8684), x, .45, -1.95);
  cylinder(.11, .9, mat(0x6f8684), x, .45, 2.8);
}

// The boom extends across the driving aisle and rotates upward when opened.
function makeGate(x, direction) {
  const pivot = new THREE.Group(); pivot.position.set(x, .65, 2.55); scene.add(pivot);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(.16, .15, 4.15), mat(0xf0ebe0));
  pole.position.z = -2.1; pole.castShadow = true; pivot.add(pole);
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(.17, .16, .42), red);
    stripe.position.z = -.4 - i * .82; pivot.add(stripe);
  }
  box(.6, 1.12, .62, mat(0x27444c), x, .58, 2.56);
  box(.42, .12, .4, direction === 'in' ? mint : yellow, x, 1.2, 2.56);
  return pivot;
}
const gateIn = makeGate(-8, 'in');
const gateOut = makeGate(8.25, 'out');

// Each HC-SR04 analogue reads the distance to the nearest car in its bay.
const sensorLights = [], bayBorders = [], hitZones = [];
for (let i = 0; i < 4; i++) {
  const x = SLOT_X[i];
  box(.8, .19, .36, dark, x, .24, -6.68);
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x5df0b9, emissive: 0x18bb91, emissiveIntensity: 1.5 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), ledMat);
  led.position.set(x, .42, -6.45); scene.add(led); sensorLights.push(led);
  const border = new THREE.Mesh(new THREE.BoxGeometry(3.23, .015, 3.9), new THREE.MeshBasicMaterial({ color: 0x4af1c0, transparent: true, opacity: .035, depthWrite: false }));
  border.position.set(x, .12, -4.5); scene.add(border); bayBorders.push(border);
  const hit = new THREE.Mesh(new THREE.BoxGeometry(3.27, .05, 3.95), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hit.position.set(x, .18, -4.5); hit.userData.index = i; scene.add(hit); hitZones.push(hit);
}

function makeCar(color = 0x5de5d0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, .43, 1.12), mat(color, .27, .3));
  body.position.y = .48; body.castShadow = true; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.06, .42, .93), mat(0x294557, .15, .25));
  cabin.position.set(-.1, .85, 0); cabin.castShadow = true; g.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.18, .09, 1.00), mat(color, .2, .35));
  roof.position.set(-.1, 1.1, 0); roof.castShadow = true; g.add(roof);
  const tire = mat(0x111d24, .05, .97), hub = mat(0x9dbac0, .6, .35);
  for (const px of [-.67, .67]) for (const pz of [-.58, .58]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .12, 14), tire);
    wh.rotation.x = Math.PI / 2; wh.position.set(px, .27, pz); wh.castShadow = true; g.add(wh);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .13, 12), hub);
    h.rotation.x = Math.PI / 2; h.position.set(px, .27, pz); g.add(h);
  }
  for (const pz of [-.37, .37]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.045, .12, .16), mat(0xfff5c6));
    lamp.position.set(1.02, .53, pz); g.add(lamp);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.045, .10, .16), mat(0xfa625c));
    tail.position.set(-1.02, .5, pz); g.add(tail);
  }
  scene.add(g); return g;
}

function addEvent(message) {
  const li = document.createElement('li'), time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  li.append(time, document.createTextNode(message)); $('events').prepend(li);
  while ($('events').children.length > 7) $('events').lastElementChild.remove();
}
function show(message, type = '') {
  state.notice = message; state.noticeType = type;
  $('status').textContent = message; $('status').className = `status ${type}`;
}
function countFree() { return state.sensed.reduce((n, taken, i) => n + (!taken && i !== state.fault ? 1 : 0), 0); }
// Keep the actual buttons mounted: replacing them on every sensor sample can
// discard a pointerdown before pointerup and make choosing a bay seem frozen.
const spotButtons = Array.from({ length: 4 }, (_, i) => {
  const button = document.createElement('button');
  button.className = 'spot';
  button.innerHTML = `<span class="dot"></span><b>VAGA ${String(i + 1).padStart(2, '0')}</b><small></small>`;
  button.addEventListener('click', () => selectSpot(i));
  $('spotlist').append(button);
  return button;
});
function sensorReadings() {
  const allCars = state.parked.filter(Boolean);
  if (state.active && !allCars.includes(state.active)) allCars.push(state.active);
  for (let i = 0; i < 4; i++) {
    if (i === state.fault) { state.distance[i] = null; continue; }
    let cm = 150;
    for (const car of allCars) {
      const separation = Math.hypot(car.position.x - SLOT_X[i], car.position.z - SLOT_Z);
      cm = Math.min(cm, Math.round(10 + separation * 16));
    }
    state.distance[i] = cm;
    if (cm <= OCCUPIED_CM) state.sensed[i] = true;
    else if (cm >= OPEN_CM) state.sensed[i] = false;
  }
  updatePanel();
}
function updatePanel() {
  const free = countFree(), broken = state.fault >= 0;
  $('free').textContent = free; $('free').style.color = broken || free === 0 ? '#ff826f' : '#61ecc1';
  $('progress').style.width = `${free * 25}%`;
  $('progress').style.background = broken || free === 0 ? '#ff826f' : '';
  $('green').classList.toggle('on', !broken && free > 0); $('red').classList.toggle('on', broken || free === 0);
  const hint = state.mode === 'chooseIn' ? 'ESCOLHA UMA VAGA' : state.mode === 'chooseOut' ? 'ESCOLHA O CARRO' : state.mode === 'parking' ? 'ESTACIONANDO' : state.mode === 'leaving' ? 'SAIDA EM CURSO' : state.mode === 'arriving' ? 'CARRO NA ENTRADA' : broken ? 'FALHA NO SENSOR' : free === 0 ? 'ESTAC. LOTADO' : 'AGUARDANDO CARRO';
  $('lcd').textContent = `LIVRES: ${free} / 4\n${hint}`;
  $('enter').disabled = state.mode !== 'idle'; $('exit').disabled = state.mode !== 'idle';
  for (let i = 0; i < 4; i++) {
    const button = spotButtons[i];
    const fault = i === state.fault, occupied = state.sensed[i] || !!state.parked[i];
    button.className = 'spot' + (fault ? ' fault' : occupied ? ' occupied' : '') + (((state.mode === 'chooseIn' || state.mode === 'arriving') && !occupied && !fault) || (state.mode === 'chooseOut' && !!state.parked[i]) ? ' selected' : '');
    const label = `${fault ? 'Falha de leitura' : occupied ? 'Ocupada' : 'Livre'} · ${fault ? '—' : state.distance[i]} cm`;
    const small = button.querySelector('small');
    if (small.textContent !== label) small.textContent = label;
    const color = fault ? 0xffc96b : occupied ? 0xff7d70 : 0x5df0b9;
    sensorLights[i].material.color.setHex(color); sensorLights[i].material.emissive.setHex(color);
    bayBorders[i].material.opacity = button.classList.contains('selected') ? .16 : .027;
    bayBorders[i].material.color.setHex(color);
  }
  $('faultToggle').textContent = broken ? `Restaurar sensor ${state.fault + 1}` : 'Falhar sensor 2';
}
function animatePath(obj, points, ms) {
  return new Promise(resolve => {
    let segment = 0, started = performance.now();
    const per = ms / (points.length - 1);
    function frame(now) {
      const elapsed = Math.min(now - started, ms);
      segment = Math.min(Math.floor(elapsed / per), points.length - 2);
      const u = Math.min((elapsed - segment * per) / per, 1);
      const smooth = u * u * (3 - 2 * u);
      const from = points[segment], to = points[segment + 1];
      obj.position.set(THREE.MathUtils.lerp(from.x, to.x, smooth), 0, THREE.MathUtils.lerp(from.z, to.z, smooth));
      const angle = Math.atan2(-(to.z - from.z), to.x - from.x);
      obj.rotation.y = angle;
      if (elapsed < ms) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function requestEntry() {
  if (state.mode !== 'idle') return;
  sensorReadings();
  if (state.fault !== -1) { show('Sensor com falha: entrada bloqueada. Restaure o sensor para continuar.', 'warning'); addEvent('ENTRADA NEGADA · falha no sensor'); return; }
  if (countFree() === 0) { show('Estacionamento lotado: a cancela permanece fechada.', 'warning'); addEvent('ENTRADA NEGADA · estacionamento lotado'); return; }
  state.mode = 'arriving'; state.pendingSpot = null; state.active = makeCar([0x59d7cf, 0xf6b069, 0x7da8f0, 0xdb9ae1][state.parked.filter(Boolean).length % 4]);
  state.active.position.set(-13.8, 0, .5); state.gateInTarget = 1.43;
  show('Entrada autorizada: carro chegando à cancela.', 'success'); addEvent('ENTRADA AUTORIZADA · cancela levantada'); updatePanel();
  await wait(400);
  await animatePath(state.active, [{x:-13.8,z:.5},{x:-10.25,z:.5}], 1200);
  state.mode = 'chooseIn'; show('Cancela aberta. Clique em uma das vagas livres para estacionar.', 'success'); updatePanel();
  if (state.pendingSpot !== null) {
    const chosen = state.pendingSpot;
    state.pendingSpot = null;
    await selectSpot(chosen);
    return;
  }
  state.choiceTimer = setTimeout(async () => {
    if (state.mode !== 'chooseIn') return;
    state.mode = 'cancelling'; show('Tempo de escolha esgotado. Entrada cancelada.', 'warning');
    await animatePath(state.active, [{x:-10.25,z:.5},{x:-13.8,z:.5}], 900);
    scene.remove(state.active); state.active = null; state.gateInTarget = 0; state.mode = 'idle'; addEvent('ENTRADA CANCELADA · cancela fechada'); sensorReadings();
  }, GATE_WAIT_MS);
}
async function selectSpot(i) {
  if (state.mode === 'arriving') {
    if (i === state.fault || state.sensed[i] || state.parked[i]) { show('Esta vaga está indisponível. Escolha uma vaga livre.', 'warning'); return; }
    state.pendingSpot = i;
    show(`Vaga ${i + 1} selecionada. O carro vai estacionar ao chegar à cancela.`, 'success');
    return;
  }
  if (state.mode === 'chooseIn') {
    if (i === state.fault || state.sensed[i] || state.parked[i]) { show('Esta vaga está indisponível. Escolha uma vaga livre.', 'warning'); return; }
    clearTimeout(state.choiceTimer); state.mode = 'parking'; show(`Carro a caminho da vaga ${i + 1}. Sensor aguardando presença.`, 'success'); updatePanel();
    const x = SLOT_X[i];
    await animatePath(state.active, [{x:-10.25,z:.5},{x:-8.5,z:.5},{x,z:.5},{x,z:SLOT_Z}], 2700);
    state.parked[i] = state.active; state.active = null; sensorReadings();
    state.gateInTarget = 0; state.mode = 'idle';
    addEvent(`VAGA ${i + 1} · veículo detectado a ${state.distance[i]} cm`);
    show(`Veículo estacionado na vaga ${i + 1}. Cancela fechada.`, 'success'); updatePanel();
  } else if (state.mode === 'chooseOut') {
    const car = state.parked[i];
    if (!car) { show('Escolha uma vaga ocupada para realizar a saída.', 'warning'); return; }
    state.mode = 'leaving'; state.gateOutTarget = 1.43;
    show(`Saída autorizada: veículo da vaga ${i + 1} em movimento.`, 'success'); addEvent(`SAÍDA AUTORIZADA · vaga ${i + 1}`); updatePanel();
    await wait(300);
    const x = SLOT_X[i];
    await animatePath(car, [{x,z:SLOT_Z},{x,z:.5},{x:8.8,z:.5},{x:13.8,z:.5}], 3100);
    scene.remove(car); state.parked[i] = null; sensorReadings();
    state.gateOutTarget = 0; state.mode = 'idle'; addEvent(`VAGA ${i + 1} · sensor livre`);
    show(`Saída concluída. A vaga ${i + 1} está livre.`, 'success'); updatePanel();
  } else {
    show('Primeiro solicite entrada ou saída no painel.', 'warning');
  }
}
function requestExit() {
  if (state.mode !== 'idle') return;
  if (!state.parked.some(Boolean)) { show('Não há veículos estacionados para sair.', 'warning'); return; }
  state.mode = 'chooseOut'; show('Escolha a vaga ocupada do veículo que vai sair.'); updatePanel();
}
$('enter').onclick = requestEntry; $('exit').onclick = requestExit;
$('faultToggle').onclick = () => {
  state.fault = state.fault === -1 ? 1 : -1;
  addEvent(state.fault === -1 ? 'SENSOR 2 · comunicação restaurada' : 'SENSOR 2 · falha de leitura');
  show(state.fault === -1 ? 'Sensor restaurado. Novas entradas liberadas se houver vaga.' : 'Falha no sensor 2: novas entradas bloqueadas.', state.fault === -1 ? 'success' : 'warning');
  sensorReadings();
};

// Camera orbit is intentionally implemented here to keep the static page self-contained.
let azimuth = .52, polar = .98, radius = 25, dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0;
function updateCamera() {
  camera.position.set(Math.sin(azimuth) * Math.sin(polar) * radius, Math.cos(polar) * radius + 1.3,
    Math.cos(azimuth) * Math.sin(polar) * radius - 1.1);
  camera.lookAt(0, 0, -1.1);
}
$('resetCam').onclick = () => { azimuth = .52; polar = .98; radius = 25; updateCamera(); };
$('topCam').onclick = () => { azimuth = .01; polar = .18; radius = 27; updateCamera(); };
host.addEventListener('pointerdown', e => { dragging = true; downX = lastX = e.clientX; downY = lastY = e.clientY; host.setPointerCapture(e.pointerId); });
host.addEventListener('pointermove', e => {
  if (!dragging) return;
  azimuth += (e.clientX - lastX) * .006; polar = THREE.MathUtils.clamp(polar + (e.clientY - lastY) * .006, .18, 1.42);
  lastX = e.clientX; lastY = e.clientY; updateCamera();
});
const raycaster = new THREE.Raycaster();
host.addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height * 2 - 1));
  raycaster.setFromCamera(mouse, camera);
  const matches = raycaster.intersectObjects(hitZones);
  if (matches.length) selectSpot(matches[0].object.userData.index);
});
host.addEventListener('wheel', e => { e.preventDefault(); radius = THREE.MathUtils.clamp(radius + Math.sign(e.deltaY) * 1.35, 16, 38); updateCamera(); }, {passive:false});
function resize() { const {width, height} = host.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); }
new ResizeObserver(resize).observe(host); resize(); updateCamera();
let lastSample = 0;
renderer.setAnimationLoop(now => {
  gateIn.rotation.x = THREE.MathUtils.damp(gateIn.rotation.x, state.gateInTarget, 6.5, 1/60);
  gateOut.rotation.x = THREE.MathUtils.damp(gateOut.rotation.x, state.gateOutTarget, 6.5, 1/60);
  if (now - lastSample > SENSOR_PERIOD) { lastSample = now; sensorReadings(); }
  renderer.render(scene, camera);
});
addEvent('SISTEMA INICIADO · quatro sensores operacionais');
sensorReadings();
