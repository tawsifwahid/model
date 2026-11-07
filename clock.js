/* Wall Clock — গোল দেয়াল ঘড়ি। group.setTime(h, m, s) দিয়ে সময় বদলানো যায় */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  let faceMat = null;

  function faceTexture() {
    const S = 1024, c = M.canvas(S, S), g = c.getContext('2d');
    g.fillStyle = '#f3ead4'; g.fillRect(0, 0, S, S);
    const gr = g.createRadialGradient(S / 2, S / 2, 60, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(120,90,40,.18)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    g.translate(S / 2, S / 2);
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * Math.PI * 2, big = i % 5 === 0;
      g.strokeStyle = '#2b2230'; g.lineWidth = big ? 9 : 3;
      g.beginPath(); g.moveTo(Math.sin(a) * (S / 2 - 22), -Math.cos(a) * (S / 2 - 22));
      g.lineTo(Math.sin(a) * (S / 2 - (big ? 62 : 44)), -Math.cos(a) * (S / 2 - (big ? 62 : 44))); g.stroke();
    }
    g.fillStyle = '#2b2230'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 92px Georgia, serif';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; g.fillText(String(i), Math.sin(a) * 365, -Math.cos(a) * 365 + 4); }
    g.font = '600 34px sans-serif'; g.fillStyle = '#6b5a45'; g.fillText('QUARTZ', 0, -150);
    return c;
  }

  function build(o) {
    o = o || {};
    const r = o.r || 0.22;
    const g = B.group('clock');
    const blk = M.get('plasticBlack');
    if (!faceMat) {
      const t = M.texture(faceTexture(), 1, true); t.repeat.set(1, 1); t.wrapS = t.wrapT = T.ClampToEdgeWrapping;
      faceMat = new T.MeshStandardMaterial({ map: t, roughness: .6 });
    }
    const body = B.cyl(r + 0.016, r + 0.016, 0.035, blk, 0, 0, -0.0175, 48); body.rotation.x = Math.PI / 2; g.add(body);
    g.add(B.torus(r + 0.008, 0.016, blk, 0, 0, 0.004, 12, 64));
    const face = new T.Mesh(new T.CircleGeometry(r, 64), faceMat);
    face.position.z = 0.002; face.receiveShadow = true; g.add(face);

    const glass = new T.Mesh(new T.CircleGeometry(r, 48), M.get('glass'));
    glass.position.z = 0.03; g.add(glass);

    function hand(len, w, mat, z, tail) {
      const p = new T.Group(); p.position.z = z;
      const m = B.box(w, len + tail, 0.004, mat, 0, (len - tail) / 2, 0);
      m.userData.dynamic = true; p.add(m);
      const tip = B.box(w * 0.5, len * 0.12, 0.004, mat, 0, len * 0.95, 0.0005); tip.userData.dynamic = true; p.add(tip);
      g.add(p); return p;
    }
    const H = hand(r * 0.5, 0.016, blk, 0.012, 0.03);
    const Mn = hand(r * 0.76, 0.011, blk, 0.017, 0.035);
    const S = hand(r * 0.82, 0.004, M.solid('#c8342e', { roughness: 0.4 }), 0.022, 0.05);
    const cap = B.cyl(0.013, 0.013, 0.016, M.get('brass'), 0, 0, 0.026, 16); cap.rotation.x = Math.PI / 2; cap.userData.dynamic = true; g.add(cap);

    g.setTime = function (h, m, s) {
      s = s || 0;
      S.rotation.z = -s / 60 * Math.PI * 2;
      Mn.rotation.z = -(m + s / 60) / 60 * Math.PI * 2;
      H.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2;
    };
    g.setTime(8, 50, 20);
    return g;
  }

  Registry.register('clock', { label: 'Wall Clock', bn: 'দেয়াল ঘড়ি', order: 41, lift: 1.7, cam: { pos: [0.5, 0.1, 1.2], target: [0, 0, 0] }, build: build });
})();
