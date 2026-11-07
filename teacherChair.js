/* Teacher Chair — গ্যাস-লিফট অফিস চেয়ার: ৫ পায়ার বেস, চাকা, প্যাডেড লেদার সিট ও ব্যাক, আর্মরেস্ট (+z দিকে মুখ) */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('teacherChair');
    const lea = M.get('leather'), blk = M.get('plasticBlack'), chrome = M.get('steel'), rub = M.get('rubber');

    // ৫ পায়ার তারা-বেস ও চাকা
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5, x = Math.sin(a) * 0.30, z = Math.cos(a) * 0.30;
      g.add(B.rod([0, 0.085, 0], [x, 0.055, z], 0.017, blk, 10));
      const w = B.cyl(0.03, 0.03, 0.022, rub, x, 0.03, z, 14);
      w.rotation.z = Math.PI / 2; w.rotation.y = a; g.add(w);
      g.add(B.rod([x, 0.052, z], [x, 0.066, z], 0.008, chrome, 8));
    }
    g.add(B.cyl(0.05, 0.07, 0.045, blk, 0, 0.09, 0, 20));
    g.add(B.cyl(0.03, 0.04, 0.16, blk, 0, 0.17, 0, 20));                          // গ্যাস-লিফট কভার
    g.add(B.cyl(0.021, 0.021, 0.22, chrome, 0, 0.30, 0, 16));
    g.add(B.box(0.24, 0.04, 0.24, blk, 0, 0.385, 0));                             // মেকানিজম বক্স
    g.add(B.box(0.44, 0.02, 0.44, blk, 0, 0.405, 0));                             // সিট প্যান

    g.add(B.rbox(0.50, 0.075, 0.50, 0.07, lea, 0, 0.45, 0.01, 0.025));            // সিট কুশন
    g.add(B.rod([0, 0.40, -0.12], [0, 0.60, -0.255], 0.014, blk, 10));
    const back = B.rbox(0.47, 0.46, 0.07, 0.06, lea, 0, 0.76, -0.27, 0.028);
    back.rotation.x = -0.14; g.add(back);
    for (let i = 0; i < 3; i++) {                                                  // কুইল্টেড লাইন
      const l = B.box(0.45, 0.004, 0.012, M.get('woodDark'), 0, 0.62 + i * 0.13, -0.236 - i * 0.018);
      l.rotation.x = -0.14; g.add(l);
    }

    [-1, 1].forEach(function (s) {
      g.add(B.rod([s * 0.27, 0.40, -0.02], [s * 0.27, 0.62, -0.02], 0.012, blk, 10));
      g.add(B.rbox(0.06, 0.03, 0.28, 0.012, blk, s * 0.27, 0.635, 0.04, 0.008));
    });
    return g;
  }

  Registry.register('teacherChair', { label: 'Teacher Chair', bn: 'শিক্ষকের চেয়ার', order: 21, cam: { pos: [1.3, 1.1, 1.5], target: [0, 0.45, 0] }, build: build });
})();
