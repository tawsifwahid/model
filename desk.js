/* Student Desk — স্টিল ফ্রেম + ল্যামিনেটেড কাঠের টপ + নিচে বই রাখার ট্রে */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('desk');
    const wood = M.get('woodLight'), edge = M.get('woodDark'), ply = M.get('plywood');
    const steel = M.get('steelDark'), rub = M.get('rubber');
    const topY = 0.745;

    g.add(B.rbox(0.62, 0.03, 0.46, 0.02, wood, 0, topY, 0, 0.006));
    g.add(B.box(0.5, 0.003, 0.028, edge, 0, topY + 0.0165, -0.165));            // পেন্সিল খাঁজ
    g.add(B.cyl(0.011, 0.011, 0.003, edge, 0.24, topY + 0.016, -0.1, 16));       // কালির গর্ত

    [-1, 1].forEach(function (s) {
      const x = s * 0.26;
      g.add(B.tube([[x, 0.012, -0.19], [x, 0.70, -0.19], [x, 0.70, 0.19], [x, 0.012, 0.19]], 0.0125, steel, 0.05));
      g.add(B.rod([x, 0.12, -0.19], [x, 0.12, 0.19], 0.01, steel, 8));
      g.add(B.cyl(0.0165, 0.0165, 0.02, rub, x, 0.01, -0.19, 12));
      g.add(B.cyl(0.0165, 0.0165, 0.02, rub, x, 0.01, 0.19, 12));
      g.add(B.box(0.03, 0.012, 0.36, steel, x, 0.722, 0, 1));                    // টপ মাউন্ট প্লেট
    });
    g.add(B.rod([-0.26, 0.69, -0.19], [0.26, 0.69, -0.19], 0.0105, steel));
    g.add(B.rod([-0.26, 0.69, 0.19], [0.26, 0.69, 0.19], 0.0105, steel));

    // বই রাখার ট্রে
    g.add(B.rbox(0.5, 0.012, 0.34, 0.01, ply, 0, 0.5, 0, 0.003));
    g.add(B.box(0.5, 0.07, 0.012, ply, 0, 0.536, -0.164));
    [-1, 1].forEach(function (s) {
      g.add(B.box(0.012, 0.06, 0.34, ply, s * 0.244, 0.53, 0));
      g.add(B.rod([s * 0.2, 0.488, -0.19], [s * 0.2, 0.488, 0.19], 0.008, steel, 8));
    });
    return g;
  }

  Registry.register('desk', { label: 'Student Desk', bn: 'ছাত্র ডেস্ক', order: 10, cam: { pos: [1.3, 1.05, 1.5], target: [0, 0.42, 0] }, build: build });
})();
