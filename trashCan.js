/* Trash Can — টেপারড স্টিল বিন, রিং, ভেতরে দুমড়ানো কাগজ ও একটি খালি বোতল (সাধারণ ক্লাসরুম আবর্জনা) */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function build() {
    const g = B.group('trashCan');
    const steel = M.get('alu'), dark = M.get('plasticBlack'), paper = M.solid('#efe6d0', { roughness: 0.95, flatShading: true });
    const radiusAt = function (y) { return 0.12 + (0.17 - 0.12) * y / 0.38; };

    g.add(B.lathe([[0, 0.012], [0.115, 0.012], [0.12, 0.02], [0.172, 0.38], [0.18, 0.386], [0.18, 0.396], [0.17, 0.396], [0.165, 0.384]], M.dbl('alu'), 0, 0, 0, 40));
    g.add(B.cyl(0.158, 0.158, 0.008, dark, 0, 0.3, 0, 32));                           // ভেতরের ছায়া
    [0.08, 0.2, 0.32].forEach(function (y) {
      const ring = B.torus(radiusAt(y) + 0.002, 0.004, steel, 0, y, 0, 8, 40);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    });
    g.add(B.cyl(0.125, 0.125, 0.014, dark, 0, 0.007, 0, 28));                         // রাবার বেস

    g.add(B.crumple(0.055, 1.3, paper, -0.06, 0.37, 0.02));
    g.add(B.crumple(0.05, 2.7, paper, 0.05, 0.385, -0.03));
    g.add(B.crumple(0.045, 4.1, paper, 0.0, 0.405, 0.06));
    const sheet = B.box(0.13, 0.002, 0.09, M.get('paper'), 0.07, 0.44, 0.07);
    sheet.rotation.set(0.5, 0.4, 0.3); g.add(sheet);

    // খালি প্লাস্টিক বোতল
    const bt = B.cyl(0.03, 0.03, 0.15, M.get('glass'), -0.07, 0.47, -0.05, 16);
    bt.rotation.z = 0.5; bt.rotation.x = 0.2; g.add(bt);
    const cap = B.cyl(0.013, 0.013, 0.02, M.solid('#c8352c', { roughness: 0.4 }), -0.14, 0.535, -0.07, 12);
    cap.rotation.z = 0.5; cap.rotation.x = 0.2; g.add(cap);
    return g;
  }

  Registry.register('trashCan', { label: 'Trash Can', bn: 'ডাস্টবিন', order: 45, cam: { pos: [0.9, 0.7, 1.0], target: [0, 0.22, 0] }, build: build });
})();
