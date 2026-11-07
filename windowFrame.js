/*
 * Window + Venetian Blinds — কাঠের ফ্রেম, গ্লাস, জানালার তাক, এবং আসল জ্যামিতির ব্লাইন্ড স্ল্যাট।
 * স্ল্যাটগুলো সূর্যের আলো আটকায়, তাই মেঝে ও দেয়ালে আসল ব্লাইন্ডের ডোরাকাটা ছায়া পড়ে।
 * opts: { w, h, drop (০–১), backdrop (false হলে বাইরের উজ্জ্বল ব্যাকগ্রাউন্ড থাকে না) }
 * ঘরের ভেতরের দিক = +z
 */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  let skyMat = null;

  function sky() {
    if (skyMat) return skyMat;
    const c = M.canvas(8, 256), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#fff0c8'); gr.addColorStop(1, '#ffd89a');
    g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
    skyMat = new T.MeshBasicMaterial({ map: t, color: new T.Color(2.0, 1.7, 1.2) });
    return skyMat;
  }

  function build(o) {
    o = o || {};
    const w = o.w || 1.4, h = o.h || 1.5;
    const drop = o.drop !== undefined ? o.drop : 0.9;
    const g = B.group('window');
    const cream = M.get('paintCream'), blind = M.get('blind'), cord = M.get('cord'), brass = M.get('brass');

    g.add(B.box(w + 0.06, 0.06, 0.1, cream, 0, h / 2, 0));
    g.add(B.box(w + 0.06, 0.06, 0.1, cream, 0, -h / 2, 0));
    g.add(B.box(0.06, h, 0.1, cream, -w / 2, 0, 0));
    g.add(B.box(0.06, h, 0.1, cream, w / 2, 0, 0));
    g.add(B.box(0.04, h, 0.07, cream, 0, 0, 0));
    g.add(B.box(w, 0.04, 0.07, cream, 0, h * 0.2, 0));
    g.add(B.box(0.014, 0.1, 0.02, brass, 0.04, -0.05, 0.04));                      // হ্যান্ডেল

    const glass = new T.Mesh(new T.PlaneGeometry(w, h), M.get('glass'));
    glass.position.z = -0.01; g.add(glass);
    if (o.backdrop !== false) {
      const bd = new T.Mesh(new T.PlaneGeometry(w + 2, h + 2), sky());
      bd.position.z = -0.45; g.add(bd);
    }

    // জানালার তাক
    g.add(B.box(w + 0.24, 0.035, 0.2, cream, 0, -h / 2 - 0.04, 0.06));
    g.add(B.box(w + 0.1, 0.07, 0.03, cream, 0, -h / 2 - 0.1, 0.14));

    // ভেনিশিয়ান ব্লাইন্ড
    const topY = h / 2 - 0.045, sp = 0.026;
    const n = Math.max(1, Math.floor((h - 0.1) * drop / sp));
    g.add(B.box(w - 0.06, 0.04, 0.05, blind, 0, topY, 0.07));
    for (let i = 0; i < n; i++) {
      const s = B.box(w - 0.1, 0.0018, 0.03, blind, 0, topY - 0.03 - i * sp, 0.07);
      s.rotation.x = 0.85; g.add(s);
    }
    const botY = topY - 0.03 - n * sp;
    g.add(B.box(w - 0.1, 0.014, 0.034, blind, 0, botY - 0.01, 0.07));
    [-1, 1].forEach(function (s) {
      g.add(B.rod([s * (w / 2 - 0.12), topY, 0.076], [s * (w / 2 - 0.12), botY, 0.076], 0.0016, cord, 5));
    });
    g.add(B.rod([w / 2 - 0.08, topY, 0.09], [w / 2 - 0.08, botY - 0.25, 0.09], 0.003, cord, 5));  // ছড়ি
    return g;
  }

  Registry.register('windowFrame', { label: 'Window + Blinds', bn: 'জানালা ও ব্লাইন্ড', order: 42, lift: 1.7, cam: { pos: [1.6, 0.1, 2.6], target: [0, 0, 0] }, build: build });
})();
