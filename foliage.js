/*
 * Foliage — (১) জানালার বাইরের গাছ, আকাশ ও মাটি (ক্লাসরুম মোডে)
 *           (২) অদৃশ্য পাতা ও ব্লাইন্ড-স্ল্যাট "gobo" (প্রপ মোডে ছায়ার নকশার জন্য)
 * সবই InstancedMesh — মাত্র কয়েকটি draw call।
 */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  const rn = M.rng(2024);
  let leafGeo = null;

  function leaf() {
    if (leafGeo) return leafGeo;
    const s = new T.Shape();
    s.moveTo(0, -0.5); s.quadraticCurveTo(0.5, -0.1, 0, 0.5); s.quadraticCurveTo(-0.5, -0.1, 0, -0.5);
    leafGeo = new T.ShapeGeometry(s, 3);
    return leafGeo;
  }
  const gauss = function () { return (rn() + rn() + rn() - 1.5) / 1.5; };

  function scatter(mesh, start, count, c, r, smin, smax, palette) {
    const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), p = new T.Vector3(), s = new T.Vector3(), col = new T.Color();
    for (let i = 0; i < count; i++) {
      p.set(c[0] + gauss() * r[0], c[1] + gauss() * r[1], c[2] + gauss() * r[2]);
      e.set((rn() - 0.5) * 2.2, (rn() - 0.5) * 2.2, rn() * 6.28);
      q.setFromEuler(e);
      const k = smin + rn() * (smax - smin);
      s.set(k * (0.8 + rn() * 0.4), k * (1.0 + rn() * 0.5), 1);
      m.compose(p, q, s);
      mesh.setMatrixAt(start + i, m);
      if (palette) { col.copy(palette[Math.floor(rn() * palette.length)]).offsetHSL((rn() - 0.5) * 0.03, 0, (rn() - 0.5) * 0.08); mesh.setColorAt(start + i, col); }
    }
  }

  const Foliage = {
    leafGeometry: leaf,

    outdoor: function () {
      const g = new T.Group(); g.name = 'outdoor';

      // আকাশ (উজ্জ্বল গরম, বাইরের আলোর গ্লো)
      const c = M.canvas(8, 256), x = c.getContext('2d');
      const gr = x.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, '#ffe2a6'); gr.addColorStop(0.6, '#fff1cf'); gr.addColorStop(1, '#ffe8b8');
      x.fillStyle = gr; x.fillRect(0, 0, 8, 256);
      const st = new T.CanvasTexture(c); st.encoding = T.sRGBEncoding;
      const sky = new T.Mesh(new T.PlaneGeometry(140, 70), new T.MeshBasicMaterial({ map: st, color: new T.Color(2.4, 2.0, 1.4), fog: false }));
      sky.position.set(34, 12, 0); sky.rotation.y = -Math.PI / 2; g.add(sky);

      // মাটি
      const ground = B.plane(140, 140, M.solid('#5b4a2b', { roughness: 1 }), 0, -0.04, 0);
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);

      // পাতা
      const crowns = [
        [5.7, 2.5, -2.5, 1.5, 1.3, 1.7, 130], [5.3, 2.1, 0.5, 1.3, 1.2, 1.3, 110],
        [5.9, 2.7, 2.9, 1.5, 1.3, 1.5, 130], [8.5, 3.4, -0.5, 2.4, 2.1, 3.6, 220]
      ];
      let total = 0; crowns.forEach(function (k) { total += k[6]; });
      const mat = new T.MeshStandardMaterial({ color: 0xffffff, side: T.DoubleSide, roughness: 0.65, emissive: new T.Color(0x3a4a10), emissiveIntensity: 0.5 });
      const leaves = new T.InstancedMesh(leaf(), mat, total);
      const palette = ['#35431a', '#4b5c1f', '#6f7f2a', '#9aa83a', '#b9a83a', '#2a3714'].map(function (h) { return new T.Color(h); });
      let at = 0;
      crowns.forEach(function (k) { scatter(leaves, at, k[6], [k[0], k[1], k[2]], [k[3], k[4], k[5]], 0.26, 0.46, palette); at += k[6]; });
      leaves.castShadow = true; leaves.frustumCulled = false;
      g.add(leaves);

      // ডাল ও কাণ্ড
      const bark = M.get('bark');
      g.add(B.rod([6.6, 0, -1.4], [6.3, 3.6, -1.0], 0.17, bark, 10));
      g.add(B.rod([6.3, 2.4, -1.1], [5.5, 2.5, -2.5], 0.06, bark, 8));
      g.add(B.rod([6.3, 2.2, -1.0], [5.3, 2.1, 0.6], 0.06, bark, 8));
      g.add(B.rod([6.3, 3.0, -1.0], [5.9, 2.7, 2.8], 0.05, bark, 8));
      return g;
    },

    // অদৃশ্য ছায়া-নকশা: ব্লাইন্ড স্ল্যাট + পাতা
    gobo: function () {
      const g = new T.Group(); g.name = 'gobo';
      const mat = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: T.DoubleSide });
      const n = 72, sp = 0.09;
      const slats = new T.InstancedMesh(new T.BoxGeometry(7, 0.004, 0.13), mat, n);
      const m = new T.Matrix4(), q = new T.Quaternion().setFromEuler(new T.Euler(0.5, 0, 0)), p = new T.Vector3(), s = new T.Vector3(1, 1, 1);
      for (let i = 0; i < n; i++) { p.set(0, (i - n / 2) * sp, 0); m.compose(p, q, s); slats.setMatrixAt(i, m); }
      slats.castShadow = true; slats.frustumCulled = false; g.add(slats);

      const total = 6 * 30;
      const lv = new T.InstancedMesh(leaf(), mat, total);
      for (let k = 0; k < 6; k++) {
        const c = [(rn() - 0.5) * 5.5, (rn() - 0.3) * 4.5, (rn() - 0.5) * 0.8];
        scatter(lv, k * 30, 30, c, [0.6, 0.55, 0.3], 0.2, 0.46, null);
      }
      lv.castShadow = true; lv.frustumCulled = false; g.add(lv);
      return g;
    }
  };

  window.Foliage = Foliage;
})();
