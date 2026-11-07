/* Student Chair — প্লাইউড সিট ও বাঁকা ব্যাকরেস্ট, বাঁকানো স্টিল নলের ফ্রেম */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('chair');
    const ply = M.get('plywood'), steel = M.get('steelDark'), rub = M.get('rubber');
    const seatY = 0.45;

    g.add(B.rbox(0.40, 0.022, 0.40, 0.03, ply, 0, seatY, 0, 0.006));
    g.add(B.box(0.34, 0.008, 0.05, steel, 0, seatY - 0.015, 0.12, 1));
    g.add(B.box(0.34, 0.008, 0.05, steel, 0, seatY - 0.015, -0.12, 1));

    const back = B.curved(0.38, 0.20, 0.012, 0.025, ply);
    back.position.set(0, 0.70, -0.19);
    back.rotation.x = -0.12;
    g.add(back);

    [-1, 1].forEach(function (s) {
      const x = s * 0.17;
      g.add(B.tube([[x, 0.012, -0.19], [x, 0.43, -0.185], [x, 0.60, -0.198], [x, 0.80, -0.222]], 0.0115, steel, 0.06));
      g.add(B.tube([[x, 0.012, 0.19], [x, 0.43, 0.18]], 0.0115, steel, 0.02));
      g.add(B.rod([x, 0.43, 0.18], [x, 0.43, -0.185], 0.01, steel, 8));
      g.add(B.rod([x, 0.20, 0.186], [x, 0.20, -0.19], 0.009, steel, 8));
      g.add(B.cyl(0.0155, 0.0155, 0.02, rub, x, 0.01, 0.19, 12));
      g.add(B.cyl(0.0155, 0.0155, 0.02, rub, x, 0.01, -0.19, 12));
      g.add(B.sphere(0.006, steel, x, 0.69, -0.2, 8));                            // রিভেট
    });
    g.add(B.rod([-0.17, 0.25, -0.19], [0.17, 0.25, -0.19], 0.009, steel, 8));
    return g;
  }

  Registry.register('chair', { label: 'Student Chair', bn: 'ছাত্র চেয়ার', order: 11, cam: { pos: [1.1, 1.1, 1.3], target: [0, 0.42, 0] }, build: build });
})();
