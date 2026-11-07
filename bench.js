/* Bench Desk — দুই সিটের বেঞ্চ-ডেস্ক। ছাত্ররা +z দিকে বসে, -z (ব্ল্যাকবোর্ড) দিকে মুখ */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('bench');
    const wood = M.get('woodLight'), ply = M.get('plywood'), steel = M.get('steelDark'), rub = M.get('rubber');

    g.add(B.rbox(1.30, 0.032, 0.46, 0.02, wood, 0, 0.744, -0.05, 0.006));        // ডেস্কটপ
    g.add(B.rbox(1.30, 0.032, 0.30, 0.02, wood, 0, 0.445, 0.50, 0.006));         // বসার তক্তা

    [-1, 1].forEach(function (s) {
      const x = s * 0.6;
      g.add(B.tube([[x, 0.012, -0.24], [x, 0.70, -0.24], [x, 0.70, 0.14], [x, 0.012, 0.14]], 0.0125, steel, 0.05));
      g.add(B.tube([[x, 0.012, 0.62], [x, 0.42, 0.62], [x, 0.42, 0.14]], 0.0125, steel, 0.05));
      g.add(B.rod([x, 0.14, -0.24], [x, 0.14, 0.14], 0.01, steel, 8));
      [-0.24, 0.14, 0.62].forEach(function (z) { g.add(B.cyl(0.0165, 0.0165, 0.02, rub, x, 0.01, z, 12)); });
      g.add(B.box(0.04, 0.012, 0.40, steel, x, 0.722, -0.05));                    // ডেস্ক মাউন্ট
      g.add(B.box(0.04, 0.012, 0.30, steel, x, 0.424, 0.50));                     // সিট মাউন্ট
    });
    g.add(B.rod([-0.6, 0.15, -0.24], [0.6, 0.15, -0.24], 0.0105, steel));
    g.add(B.rod([-0.6, 0.69, -0.24], [0.6, 0.69, -0.24], 0.0105, steel));
    g.add(B.rod([-0.6, 0.69, 0.14], [0.6, 0.69, 0.14], 0.0105, steel));
    g.add(B.rod([-0.6, 0.41, 0.62], [0.6, 0.41, 0.62], 0.0105, steel));
    g.add(B.rod([-0.6, 0.41, 0.14], [0.6, 0.41, 0.14], 0.0105, steel));

    // বই রাখার তাক
    g.add(B.rbox(1.20, 0.014, 0.38, 0.01, ply, 0, 0.50, -0.05, 0.003));
    g.add(B.box(1.20, 0.06, 0.012, ply, 0, 0.53, -0.234));
    g.add(B.box(0.012, 0.06, 0.38, ply, 0, 0.53, -0.05));
    return g;
  }

  Registry.register('bench', { label: 'Bench Desk', bn: 'বেঞ্চ-ডেস্ক', order: 12, cam: { pos: [2.0, 1.3, 2.0], target: [0, 0.4, 0.15] }, build: build });
})();
