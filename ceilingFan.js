/* Ceiling Fan — ৩ ব্লেডের সিলিং ফ্যান: ডাউনরড, মোটর হাউজিং, ব্র্যাকেট ও পিচ করা ব্লেড। মূল বিন্দু = সিলিং */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('ceilingFan');
    const cream = M.get('paintCream'), steel = M.get('alu'), dark = M.get('plasticBlack');

    g.add(B.cyl(0.07, 0.07, 0.015, cream, 0, -0.008, 0, 24));                         // সিলিং প্লেট
    g.add(B.cyl(0.014, 0.014, 0.26, steel, 0, -0.14, 0, 12));                         // ডাউনরড
    g.add(B.lathe([[0.0, 0.0], [0.045, 0.0], [0.06, -0.03], [0.14, -0.05], [0.15, -0.09], [0.12, -0.115], [0.0, -0.115]], M.dbl('paintCream'), 0, -0.26, 0, 32));
    g.add(B.cyl(0.05, 0.04, 0.03, dark, 0, -0.4, 0, 20));                              // নিচের ক্যাপ

    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const pivot = new T.Group(); pivot.rotation.y = a; pivot.position.y = -0.34;
      pivot.add(B.box(0.22, 0.006, 0.035, dark, 0.2, 0.012, 0));                       // ব্র্যাকেট আর্ম
      const blade = B.rbox(0.56, 0.006, 0.15, 0.04, M.get('woodMid'), 0.46, 0.005, 0, 0.002);
      blade.rotation.x = 0.16; pivot.add(blade);
      g.add(pivot);
    }
    return g;
  }

  Registry.register('ceilingFan', { label: 'Ceiling Fan', bn: 'সিলিং ফ্যান', order: 47, lift: 2.3, cam: { pos: [1.7, -1.0, 1.9], target: [0, -0.3, 0] }, build: build });
})();
