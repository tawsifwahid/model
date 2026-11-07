/*
 * GodRays — জানালা দিয়ে আসা ধুলোমাখা আলোর রশ্মি (ভলিউমেট্রিক গ্লো-এর নকল)।
 * প্রতিটি জানালার মাপে একটি সমান্তরাল-পিপড আকারের additive মেশ, সূর্যের দিকে প্রসারিত।
 */
(function () {
  const T = THREE;
  let group = null, mat = null;

  const VS = [
    'varying float vT; varying vec3 vN; varying vec3 vV; attribute float t;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  vV = -mv.xyz; vT = t; vN = normalMatrix * normal;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  const FS = [
    'uniform vec3 uColor; uniform float uIntensity; uniform float uTime;',
    'varying float vT; varying vec3 vN; varying vec3 vV;',
    'void main(){',
    '  float f = abs(dot(normalize(vN), normalize(vV)));',
    '  float a = uIntensity * pow(max(0.0, 1.0 - vT), 1.3) * (0.25 + 0.75 * f);',
    '  a *= 0.88 + 0.12 * sin(uTime * 0.4 + vT * 6.0);',
    '  gl_FragColor = vec4(uColor, a);',
    '}'
  ].join('\n');

  const GodRays = {
    build: function (scene, portals, travelDir) {
      this.clear(scene);
      if (!portals || !portals.length) return;
      if (!mat) {
        mat = new T.ShaderMaterial({
          uniforms: { uColor: { value: new T.Color(1.0, 0.78, 0.45) }, uIntensity: { value: 0.075 }, uTime: { value: 0 } },
          vertexShader: VS, fragmentShader: FS,
          transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide
        });
      }
      group = new T.Group(); group.name = 'godrays';
      const d = travelDir.clone().normalize();
      const L = 2.5 / Math.max(0.15, Math.abs(d.y));

      portals.forEach(function (pt) {
        const o = new T.Vector3().fromArray(pt.o), u = new T.Vector3().fromArray(pt.u), v = new T.Vector3().fromArray(pt.v);
        const c = [o.clone(), o.clone().add(u), o.clone().add(u).add(v), o.clone().add(v)];
        const far = c.map(function (p) { return p.clone().addScaledVector(d, L); });
        const pos = [], ts = [], idx = [];
        for (let i = 0; i < 4; i++) {
          const a = c[i], b = c[(i + 1) % 4], fa = far[i], fb = far[(i + 1) % 4], base = pos.length / 3;
          [a, b, fb, fa].forEach(function (p, k) { pos.push(p.x, p.y, p.z); ts.push(k < 2 ? 0 : 1); });
          idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        geo.setAttribute('t', new T.Float32BufferAttribute(ts, 1));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const m = new T.Mesh(geo, mat);
        m.frustumCulled = false; m.renderOrder = 5;
        group.add(m);
      });
      scene.add(group);
    },
    clear: function (scene) {
      if (!group) return;
      scene.remove(group);
      group.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
      group = null;
    },
    setVisible: function (b) { if (group) group.visible = b; },
    update: function (time) { if (mat) mat.uniforms.uTime.value = time; }
  };

  window.GodRays = GodRays;
})();
