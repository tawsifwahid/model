/*
 * Wheelchair — ম্যানুয়াল ফোল্ডিং হুইলচেয়ার (+z দিকে মুখ)।
 * ২৪ স্পোকের পেছনের চাকা + হ্যান্ডরিম, সামনের ক্যাস্টর, X-ক্রস ব্রেস, ফুটপ্লেট,
 * আর্মরেস্ট, কাপড় রক্ষা প্যানেল, ব্রেক লিভার, পুশ-হ্যান্ডেল, অ্যান্টি-টিপার।
 */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function wheel(side) {
    const rubber = M.get('rubber'), chrome = M.get('steel'), R = 0.30;
    const g = new T.Group();
    g.add(B.mesh(new T.TorusGeometry(R, 0.018, 10, 72), rubber));
    g.add(B.mesh(new T.TorusGeometry(R - 0.026, 0.008, 8, 72), chrome));
    const hr = B.mesh(new T.TorusGeometry(0.262, 0.0065, 8, 60), chrome);
    hr.position.z = 0.052 * side; g.add(hr);
    const hub = B.cyl(0.024, 0.024, 0.07, chrome, 0, 0, 0, 18); hub.rotation.x = Math.PI / 2; g.add(hub);
    const cap = B.cyl(0.012, 0.012, 0.11, chrome, 0, 0, 0, 10); cap.rotation.x = Math.PI / 2; g.add(cap);
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2, s = (i % 2 ? 1 : -1) * 0.026;
      g.add(B.rod([Math.cos(a) * 0.024, Math.sin(a) * 0.024, s], [Math.cos(a) * (R - 0.032), Math.sin(a) * (R - 0.032), 0], 0.0016, chrome, 4));
    }
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.3;
      g.add(B.rod([Math.cos(a) * (R - 0.032), Math.sin(a) * (R - 0.032), 0], [Math.cos(a) * 0.262, Math.sin(a) * 0.262, 0.052 * side], 0.004, chrome, 6));
    }
    g.rotation.y = Math.PI / 2;
    return g;
  }

  function build() {
    const g = B.group('wheelchair');
    const frame = M.get('steelDark'), chrome = M.get('steel'), rub = M.get('rubber'), blk = M.get('plasticBlack');
    const fab = M.fabric('#6b2a2d', 0.2), fab2 = M.fabric('#55231f', 0.2);

    [-1, 1].forEach(function (s) {
      const w = wheel(s); w.position.set(s * 0.29, 0.318, -0.05); g.add(w);
      const x = s * 0.23;

      g.add(B.tube([[x, 0.93, -0.31], [x, 0.51, -0.23], [x, 0.51, 0.20], [x, 0.36, 0.30], [x, 0.15, 0.40]], 0.012, frame, 0.06));
      g.add(B.rod([x, 0.93, -0.31], [x, 0.925, -0.43], 0.0145, rub, 10));                       // পুশ-হ্যান্ডেল গ্রিপ
      g.add(B.tube([[x, 0.30, -0.18], [x, 0.30, 0.20], [x, 0.27, 0.28]], 0.011, frame, 0.05));
      g.add(B.rod([x, 0.30, -0.18], [x, 0.51, -0.23], 0.011, frame, 8));
      g.add(B.box(0.012, 0.12, 0.10, chrome, s * 0.25, 0.35, -0.05));                         // অ্যাক্সেল প্লেট

      // সামনের ক্যাস্টর
      g.add(B.cyl(0.016, 0.016, 0.14, frame, x, 0.25, 0.285, 12));
      g.add(B.box(0.07, 0.012, 0.05, frame, x, 0.178, 0.295));
      g.add(B.box(0.008, 0.10, 0.04, frame, x - 0.026, 0.125, 0.305));
      g.add(B.box(0.008, 0.10, 0.04, frame, x + 0.026, 0.125, 0.305));
      const cw = B.cyl(0.075, 0.075, 0.03, rub, x, 0.075, 0.305, 24); cw.rotation.z = Math.PI / 2; g.add(cw);
      const ch = B.cyl(0.026, 0.026, 0.044, chrome, x, 0.075, 0.305, 14); ch.rotation.z = Math.PI / 2; g.add(ch);

      // ফুটপ্লেট
      const fp = B.rbox(0.11, 0.012, 0.15, 0.01, blk, x, 0.125, 0.43, 0.003);
      fp.rotation.x = -0.25; g.add(fp);
      g.add(B.rod([x, 0.15, 0.40], [x, 0.13, 0.46], 0.007, frame, 8));

      // আর্মরেস্ট ও সাইড গার্ড
      g.add(B.rod([x, 0.51, 0.04], [x, 0.70, 0.04], 0.01, frame, 8));
      g.add(B.rod([x, 0.51, -0.14], [x, 0.70, -0.14], 0.01, frame, 8));
      g.add(B.rbox(0.05, 0.032, 0.30, 0.014, blk, x, 0.715, -0.05, 0.01));
      g.add(B.rbox(0.01, 0.14, 0.32, 0.03, blk, s * 0.245, 0.60, -0.05, 0.003));

      // ব্রেক লিভার
      g.add(B.rod([s * 0.262, 0.50, 0.12], [s * 0.262, 0.67, 0.06], 0.008, chrome, 8));
      g.add(B.sphere(0.014, blk, s * 0.262, 0.67, 0.06, 10));

      // অ্যান্টি-টিপার
      g.add(B.rod([x, 0.26, -0.20], [x, 0.07, -0.47], 0.008, frame, 8));
      const aw = B.cyl(0.03, 0.03, 0.02, rub, x, 0.04, -0.47, 14); aw.rotation.z = Math.PI / 2; g.add(aw);
    });

    // X-ক্রস ব্রেস
    g.add(B.rod([-0.2, 0.28, 0.10], [0.2, 0.46, -0.12], 0.012, frame, 8));
    g.add(B.rod([0.2, 0.28, 0.10], [-0.2, 0.46, -0.12], 0.012, frame, 8));
    g.add(B.sphere(0.013, chrome, 0, 0.37, -0.01, 10));

    // সিট স্লিং, কুশন ও ব্যাক
    g.add(B.rbox(0.46, 0.018, 0.44, 0.03, fab2, 0, 0.52, -0.01, 0.006));
    g.add(B.rbox(0.44, 0.06, 0.42, 0.05, fab, 0, 0.56, -0.01, 0.02));
    const back = B.rbox(0.46, 0.36, 0.03, 0.04, fab, 0, 0.74, -0.265, 0.01);
    back.rotation.x = -0.19; g.add(back);
    return g;
  }

  Registry.register('wheelchair', { label: 'Wheelchair', bn: 'হুইলচেয়ার', order: 30, cam: { pos: [1.5, 1.1, 1.7], target: [0, 0.42, 0] }, build: build });
})();
