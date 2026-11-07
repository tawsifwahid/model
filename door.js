/* Classroom Door — ভিশন-গ্লাসসহ কাঠের দরজা, কেসিং, পিতলের লিভার, কব্জা, কিক-প্লেট (+z দিকে মুখ) */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('door');
    const cream = M.get('paintCream'), wood = M.get('woodMid'), woodL = M.get('woodLight'), woodD = M.get('woodDark');
    const brass = M.get('brass'), glass = M.get('glass');

    // কেসিং
    g.add(B.box(0.07, 2.16, 0.12, cream, -0.535, 1.08, 0));
    g.add(B.box(0.07, 2.16, 0.12, cream, 0.535, 1.08, 0));
    g.add(B.box(1.14, 0.07, 0.12, cream, 0, 2.145, 0));
    g.add(B.box(1.0, 0.012, 0.12, M.get('alu'), 0, 0.006, 0));                       // থ্রেশহোল্ড

    // স্ল্যাব: স্টাইল, রেল, প্যানেল
    g.add(B.box(0.12, 2.1, 0.045, wood, -0.44, 1.05, 0));
    g.add(B.box(0.12, 2.1, 0.045, wood, 0.44, 1.05, 0));
    g.add(B.box(0.76, 0.10, 0.045, wood, 0, 0.05 + 0.012, 0));
    g.add(B.box(0.76, 0.10, 0.045, wood, 0, 1.05, 0));
    g.add(B.box(0.76, 0.10, 0.045, wood, 0, 2.05, 0));
    g.add(B.box(0.76, 0.88, 0.03, woodD, 0, 0.56, -0.006));
    g.add(B.rbox(0.62, 0.70, 0.016, 0.01, woodL, 0, 0.56, 0.018, 0.004));            // উঁচু প্যানেল

    // ভিশন গ্লাস ও বিড
    g.add(B.box(0.72, 0.84, 0.008, glass, 0, 1.55, 0));
    g.add(B.box(0.74, 0.02, 0.02, woodD, 0, 1.97, 0.02));
    g.add(B.box(0.74, 0.02, 0.02, woodD, 0, 1.13, 0.02));
    g.add(B.box(0.02, 0.86, 0.02, woodD, -0.36, 1.55, 0.02));
    g.add(B.box(0.02, 0.86, 0.02, woodD, 0.36, 1.55, 0.02));

    // হার্ডওয়্যার
    const rose = B.cyl(0.032, 0.032, 0.01, brass, 0.38, 1.0, 0.027, 20); rose.rotation.x = Math.PI / 2; g.add(rose);
    g.add(B.rod([0.38, 1.0, 0.03], [0.38, 1.0, 0.075], 0.009, brass, 10));
    g.add(B.rod([0.38, 1.0, 0.075], [0.26, 1.0, 0.075], 0.009, brass, 10));
    g.add(B.sphere(0.011, brass, 0.26, 1.0, 0.075, 10));
    const lock = B.cyl(0.013, 0.013, 0.01, brass, 0.38, 1.1, 0.027, 14); lock.rotation.x = Math.PI / 2; g.add(lock);
    [0.25, 1.05, 1.85].forEach(function (y) {
      g.add(B.box(0.014, 0.1, 0.012, brass, -0.5, y, 0.028));
      g.add(B.cyl(0.007, 0.007, 0.104, brass, -0.505, y, 0.034, 8));
    });
    g.add(B.box(0.74, 0.14, 0.006, brass, 0, 0.14, 0.026));                           // কিক-প্লেট
    // দরজার নম্বর প্লেট
    g.add(B.box(0.16, 0.06, 0.008, M.get('plasticBlack'), 0, 2.2, 0.065));
    g.add(B.box(0.13, 0.035, 0.004, brass, 0, 2.2, 0.071));
    return g;
  }

  Registry.register('door', { label: 'Door', bn: 'দরজা', order: 43, cam: { pos: [1.7, 1.3, 2.6], target: [0, 1.05, 0] }, build: build });
})();
