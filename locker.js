/* Locker — দুই কম্পার্টমেন্টের স্টিল লকার: ভেন্ট স্লিট, হ্যান্ডেল, নম্বর প্লেট, পাডলক (+z দিকে মুখ) */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('locker');
    const body = M.get('lockerBlue'), dark = M.get('lockerDark'), steel = M.get('steel'), brass = M.get('brass');

    g.add(B.box(0.40, 1.74, 0.42, body, 0, 0.93, 0));
    g.add(B.box(0.38, 0.06, 0.40, dark, 0, 0.03, 0));                                 // পা/প্লিন্থ
    g.add(B.box(0.41, 0.02, 0.43, body, 0, 1.81, 0));                                 // টপ ক্যাপ

    [0, 1].forEach(function (i) {
      const yc = 1.33 - i * 0.9;
      g.add(B.box(0.36, 0.84, 0.012, body, 0, yc, 0.216));                            // দরজা
      g.add(B.box(0.34, 0.82, 0.006, dark, 0, yc, 0.209));                            // গ্যাপ ছায়া
      for (let k = 0; k < 6; k++) g.add(B.box(0.2, 0.012, 0.004, dark, 0, yc + 0.34 - k * 0.028, 0.224)); // ভেন্ট
      for (let k = 0; k < 3; k++) g.add(B.box(0.2, 0.012, 0.004, dark, 0, yc - 0.3 + k * 0.028, 0.224));
      g.add(B.box(0.07, 0.13, 0.01, steel, 0.12, yc - 0.06, 0.226));                  // হ্যান্ডেল প্লেট
      g.add(B.box(0.014, 0.08, 0.016, M.get('alu'), 0.12, yc - 0.06, 0.238));
      g.add(B.box(0.06, 0.03, 0.004, M.get('plasticWhite'), -0.08, yc + 0.2, 0.224)); // নম্বর/লেবেল
      g.add(B.box(0.012, 0.1, 0.006, steel, -0.178, yc + 0.3, 0.222));                // কব্জা
      g.add(B.box(0.012, 0.1, 0.006, steel, -0.178, yc - 0.3, 0.222));
    });
    // পাডলক
    g.add(B.box(0.035, 0.03, 0.014, brass, 0.12, 1.19 - 0.02, 0.25));
    g.add(B.torus(0.012, 0.003, M.get('steel'), 0.12, 1.19 + 0.0, 0.25, 8, 16));
    return g;
  }

  Registry.register('locker', { label: 'Locker', bn: 'লকার', order: 44, cam: { pos: [1.2, 1.4, 1.8], target: [0, 0.95, 0] }, build: build });
})();
