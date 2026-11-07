/*
 * Viewer — মূল সমন্বয়কারী। রেন্ডারার, ক্যামেরা, কন্ট্রোল, স্টেজ, ধুলো, পারফরম্যান্স গভর্নর।
 * কোনো prop ফাইলের নাম জানে না; সবকিছু Registry থেকে আসে।
 */
(function () {
  'use strict';
  const T = THREE, B = window.B, M = window.Mat;

  const QUALITY = {
    low: { pr: 1, shadow: 2048, bloom: false, msaa: 0, label: 'Low' },
    medium: { pr: 1.5, shadow: 3072, bloom: true, msaa: 0, label: 'Med' },
    high: { pr: 2, shadow: 4096, bloom: true, msaa: 4, label: 'High' }
  };
  const ORDER = ['low', 'medium', 'high'];

  const S = { quality: 'medium', light: true, cutaway: false, auto: false, sunEl: 24, sunAz: 18, scale: 1, current: null, id: null, mode: null, home: null };
  let renderer, scene, camera, controls, stage, outdoor, dust, clock;
  let anim = null, frames = 0, acc = 0, hudT = 0, busy = false, lastFps = 60;

  const tick = function () { return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 16); }); }); };

  /* ---------- স্টেজ (প্রপ-মোডের মেঝে ও দেয়াল) ---------- */
  function buildStage() {
    const g = new T.Group(); g.name = 'stage';
    const fl = B.plane(18, 18, M.get('floor')); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const wall = B.plane(14, 6, M.get('plaster')); wall.rotation.y = Math.PI / 2; wall.position.set(-2.3, 3, 0); g.add(wall);
    g.add(B.box(0.04, 0.12, 14, M.get('baseboard'), -2.28, 0.06, 0));
    return g;
  }

  /* ---------- ধুলোর কণা ---------- */
  function softDot() {
    const c = M.canvas(64, 64), g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  }
  function buildDust() {
    const n = 220, pos = new Float32Array(n * 3), vel = new Float32Array(n * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({ map: softDot(), size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending, color: 0xffd9a0, fog: false });
    const pts = new T.Points(geo, mat); pts.frustumCulled = false;
    return { pts: pts, pos: pos, vel: vel, n: n, box: [0, 1.5, 0, 4, 1.5, 3.5] };
  }
  function seedDust(box) {
    dust.box = box;
    for (let i = 0; i < dust.n; i++) {
      dust.pos[i * 3] = box[0] + (Math.random() * 2 - 1) * box[3];
      dust.pos[i * 3 + 1] = box[1] + (Math.random() * 2 - 1) * box[4];
      dust.pos[i * 3 + 2] = box[2] + (Math.random() * 2 - 1) * box[5];
      dust.vel[i * 3] = (Math.random() - 0.5) * 0.03;
      dust.vel[i * 3 + 1] = 0.004 + Math.random() * 0.012;
      dust.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }
    dust.pts.geometry.attributes.position.needsUpdate = true;
  }
  function updateDust(dt, t) {
    const b = dust.box, p = dust.pos, v = dust.vel;
    for (let i = 0; i < dust.n; i++) {
      const k = i * 3;
      p[k] += (v[k] + Math.sin(t * 0.3 + i) * 0.004) * dt;
      p[k + 1] += v[k + 1] * dt;
      p[k + 2] += (v[k + 2] + Math.cos(t * 0.27 + i * 1.3) * 0.004) * dt;
      if (p[k] > b[0] + b[3]) p[k] = b[0] - b[3]; else if (p[k] < b[0] - b[3]) p[k] = b[0] + b[3];
      if (p[k + 1] > b[1] + b[4]) p[k + 1] = b[1] - b[4];
      if (p[k + 2] > b[2] + b[5]) p[k + 2] = b[2] - b[5]; else if (p[k + 2] < b[2] - b[5]) p[k + 2] = b[2] + b[5];
    }
    dust.pts.geometry.attributes.position.needsUpdate = true;
  }

  /* ---------- কোয়ালিটি ও সাইজ ---------- */
  function currentPR() { return Math.max(0.6, Math.min(window.devicePixelRatio || 1, QUALITY[S.quality].pr) * S.scale); }
  function resize() {
    const w = window.innerWidth, h = window.innerHeight, pr = currentPR();
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 54 : 40;
    camera.updateProjectionMatrix();
    if (PostFX.enabled) PostFX.resize(w, h, pr);
  }
  function applyQuality(name) {
    S.quality = name; S.scale = 1;
    const q = QUALITY[name];
    Lighting.setShadowSize(q.shadow);
    resize();
    PostFX.build(renderer, scene, camera, { bloom: q.bloom, msaa: q.msaa });
    UI.setToolLabel('quality', q.label);
  }

  /* ---------- ক্যামেরা ---------- */
  function flyTo(pos, tgt, instant) {
    if (instant) { camera.position.set(pos[0], pos[1], pos[2]); controls.target.set(tgt[0], tgt[1], tgt[2]); controls.update(); anim = null; return; }
    anim = { t: 0, dur: 1.2, p0: camera.position.clone(), t0: controls.target.clone(), p1: new T.Vector3(pos[0], pos[1], pos[2]), t1: new T.Vector3(tgt[0], tgt[1], tgt[2]) };
  }
  function updateCam(dt) {
    if (!anim) return;
    anim.t += dt / anim.dur;
    const k = Math.min(1, anim.t), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.lerpVectors(anim.p0, anim.p1, e);
    controls.target.lerpVectors(anim.t0, anim.t1, e);
    if (k >= 1) anim = null;
  }

  /* ---------- মোড ও প্রপ লোড ---------- */
  function setMode(mode, obj, def) {
    S.mode = mode;
    const room = mode === 'room', lift = def.lift || 0;
    stage.visible = !room; outdoor.visible = room;
    scene.fog.density = room ? 0.005 : 0.01;
    if (room) { Lighting.fit(8.4, [0, 1.2, 0]); seedDust([0, 1.5, 0, 4, 1.5, 3.5]); }
    else { Lighting.fit(3.4, [0, lift + 0.6, 0]); seedDust([0, lift + 0.8, 0, 2.5, 1.2, 2.5]); }
    Lighting.setGobo(!room && S.light);
    if (room) { GodRays.build(scene, obj.userData.sunPortals, Lighting.travelDir()); GodRays.setVisible(S.light); }
    else GodRays.clear(scene);
    UI.showTool('cut', room);
    controls.maxPolarAngle = (room || lift > 0) ? Math.PI * 0.92 : Math.PI * 0.495;
    controls.maxDistance = room ? 24 : 10;
    controls.minDistance = room ? 0.3 : 0.25;
  }

  async function loadProp(id, first) {
    if (busy) return;
    busy = true;
    const def = Registry.get(id);
    UI.loading(true, 'মডেল তৈরি হচ্ছে…');
    await tick();
    try {
      if (S.current) { scene.remove(S.current); Opt.dispose(S.current); S.current = null; }
      const obj = Registry.create(id);
      obj.position.y = def.lift || 0;
      scene.add(obj);
      S.current = obj; S.id = id; S.cutaway = false; UI.setTool('cut', false);
      setMode(def.room ? 'room' : 'prop', obj, def);
      const lift = def.lift || 0, c = def.cam;
      S.home = { pos: [c.pos[0], c.pos[1] + lift, c.pos[2]], tgt: [c.target[0], c.target[1] + lift, c.target[2]] };
      flyTo(S.home.pos, S.home.tgt, first);
      UI.setTitle((def.bn || def.label) + ' \u00B7 ' + def.label);
    } catch (e) {
      console.error(e);
      UI.toast('ত্রুটি: ' + e.message);
    }
    UI.setActive(id);
    UI.loading(false);
    busy = false;
  }

  /* ---------- টুল ---------- */
  function applyCutaway() {
    if (!S.current) return;
    S.current.traverse(function (o) { if (o.userData && o.userData.cutaway) o.visible = !S.cutaway; });
    Lighting.refresh();
  }
  function applyLight() {
    if (S.mode === 'room') GodRays.setVisible(S.light);
    else Lighting.setGobo(S.light);
  }
  function screenshot() {
    PostFX.render(0, clock.elapsedTime);
    renderer.domElement.toBlob(function (blob) {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'model-view.png'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, 'image/png');
  }
  const handlers = {
    onSelect: function (id) { loadProp(id, false); },
    onSun: function (el) { S.sunEl = el; Lighting.setAngles(S.sunAz, el); if (S.mode === 'room' && S.current) GodRays.build(scene, S.current.userData.sunPortals, Lighting.travelDir()); GodRays.setVisible(S.light || S.mode !== 'room'); },
    onTool: function (id) {
      if (id === 'auto') { S.auto = !S.auto; controls.autoRotate = S.auto; UI.setTool('auto', S.auto); }
      else if (id === 'light') { S.light = !S.light; UI.setTool('light', S.light); applyLight(); }
      else if (id === 'cut') { S.cutaway = !S.cutaway; UI.setTool('cut', S.cutaway); applyCutaway(); }
      else if (id === 'quality') { const n = ORDER[(ORDER.indexOf(S.quality) + 1) % ORDER.length]; applyQuality(n); UI.toast('Quality: ' + QUALITY[n].label); }
      else if (id === 'reset') { if (S.home) flyTo(S.home.pos, S.home.tgt, false); }
      else if (id === 'shot') screenshot();
    }
  };

  /* ---------- মেইন লুপ ---------- */
  function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
    updateCam(dt); controls.update(); updateDust(dt, t); GodRays.update(t);
    renderer.info.reset();
    PostFX.render(dt, t);

    // স্বয়ংক্রিয় পারফরম্যান্স গভর্নর: ধীর হলে রেজোলিউশন একটু কমে (ডিজাইন অপরিবর্তিত)
    acc += dt; frames++;
    if (frames >= 90) {
      lastFps = frames / acc;
      if (t > 5 && lastFps < 30 && S.scale > 0.65) { S.scale = Math.max(0.65, S.scale - 0.15); resize(); }
      acc = 0; frames = 0;
    }
    hudT += dt;
    if (hudT > 0.6) {
      hudT = 0;
      const r = renderer.info.render;
      UI.hud('FPS ' + Math.round(lastFps) + '\n' + r.calls + ' calls\n' + Math.round(r.triangles / 1000) + 'k tris');
    }
  }

  async function start(info) {
    const canvas = document.getElementById('c');
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.info.autoReset = false;

    scene = new T.Scene();
    scene.background = new T.Color(0x140c07);
    scene.fog = new T.FogExp2(0x2b1a0e, 0.01);
    camera = new T.PerspectiveCamera(40, 1, 0.05, 160);
    controls = new T.OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9; controls.panSpeed = 0.8;
    controls.autoRotateSpeed = 1.2; controls.screenSpacePanning = true;
    controls.addEventListener('start', function () { anim = null; });

    scene.environment = Env.build(renderer);
    Lighting.init(scene, renderer);
    stage = buildStage(); scene.add(stage);
    outdoor = Foliage.outdoor(); outdoor.visible = false; scene.add(outdoor);
    dust = buildDust(); scene.add(dust.pts);
    clock = new T.Clock();

    UI.init(handlers, Registry.list());
    UI.setTool('light', true);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () { setTimeout(resize, 250); });
    applyQuality(S.quality);

    const list = Registry.list();
    if (!list.length) { UI.toast('কোনো মডেল ফাইল লোড হয়নি'); UI.loading(false); return; }
    await loadProp(Registry.has('classroom') ? 'classroom' : list[0].id, true);
    if (info && info.failed && info.failed.length) UI.toast('লোড হয়নি: ' + info.failed.map(function (f) { return f.split('/').pop(); }).join(', '));
    loop();
  }

  window.Viewer = { start: start, state: S };
})();
