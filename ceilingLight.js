/* Ceiling Light — ফ্লুরোসেন্ট ব্যাটেন: স্টিল হাউজিং, ডিফিউজার, এন্ড-ক্যাপ, ঝোলানো রড। (আসল আলো দেয় না, শুধু দেখতে।) */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('ceilingLight');
    const white = M.get('plasticWhite'), steel = M.get('steel'), em = M.get('lightEmissive');

    g.add(B.box(1.30, 0.05, 0.20, white, 0, 0, 0));
    g.add(B.box(1.20, 0.012, 0.16, em, 0, -0.03, 0));                                 // ডিফিউজার (গ্লো)
    g.add(B.box(1.24, 0.02, 0.012, white, 0, -0.02, 0.092));
    g.add(B.box(1.24, 0.02, 0.012, white, 0, -0.02, -0.092));
    [-1, 1].forEach(function (s) {
      g.add(B.box(0.03, 0.06, 0.21, M.get('plasticBlack'), s * 0.655, -0.005, 0));    // এন্ড-ক্যাপ
      g.add(B.rod([s * 0.5, 0.025, 0], [s * 0.5, 0.05, 0], 0.003, steel, 6));         // ঝোলানো রড (সিলিংয়ের নিচে থামে)
      g.add(B.cyl(0.02, 0.02, 0.008, steel, s * 0.5, 0.054, 0, 12));
    });
    return g;
  }

  Registry.register('ceilingLight', { label: 'Ceiling Light', bn: 'সিলিং লাইট', order: 46, lift: 2.2, cam: { pos: [1.5, -0.9, 1.7], target: [0, 0, 0] }, build: build });
})();
