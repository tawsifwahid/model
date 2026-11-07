/* Notice Board — কর্ক বোর্ড, কাঠের ফ্রেম, লেখাসহ কাগজ (রুটিন, নোটিশ), রঙিন পিন */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  const sheetMats = {};

  function sheetMat(key, bg, title, lines) {
    if (sheetMats[key]) return sheetMats[key];
    const c = M.canvas(256, 320), g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, 256, 320);
    g.fillStyle = '#2b2230'; g.font = 'bold 26px sans-serif'; g.fillText(title, 16, 40);
    g.fillRect(16, 50, 224, 2);
    g.font = '15px sans-serif'; g.fillStyle = '#4a3f3a';
    lines.forEach(function (l, i) { g.fillText(l, 16, 80 + i * 26); });
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
    sheetMats[key] = new T.MeshStandardMaterial({ map: t, roughness: 0.92 });
    return sheetMats[key];
  }

  function build() {
    const g = B.group('noticeBoard');
    const wood = M.get('woodDark');
    g.add(B.box(1.2, 0.8, 0.04, wood, 0, 0, 0));
    g.add(B.box(1.1, 0.7, 0.02, M.get('cork'), 0, 0, 0.025));

    const sheets = [
      [-0.36, 0.1, 0.26, 0.34, 0.05, sheetMat('a', '#f6efdc', 'Routine', ['Sun  Math', 'Mon  Physics', 'Tue  English', 'Wed  Chem', 'Thu  Bangla']), '#c8352c'],
      [-0.02, 0.14, 0.24, 0.3, -0.08, sheetMat('b', '#f7d98a', 'NOTICE', ['Exam starts', 'next Sunday.', 'Bring your', 'admit card.']), '#2a4fa8'],
      [0.34, 0.1, 0.24, 0.32, 0.1, sheetMat('c', '#f4b9b3', 'Sports Day', ['Friday 3 PM', 'Main field', 'All classes']), '#2f7a43'],
      [-0.2, -0.2, 0.22, 0.26, -0.05, sheetMat('d', '#bfe1f4', 'Library', ['Open 9 - 4', 'Return books', 'by Thursday']), '#c8352c'],
      [0.22, -0.2, 0.26, 0.28, 0.07, sheetMat('e', '#f6efdc', 'Lost & Found', ['Blue pencil box', 'Ask the office']), '#e8c13a']
    ];
    sheets.forEach(function (s) {
      const p = B.box(s[2], s[3], 0.003, s[5], s[0], s[1], 0.037);
      p.rotation.z = s[4]; g.add(p);
      g.add(B.sphere(0.009, M.solid(s[6], { roughness: 0.3, metalness: 0.2 }), s[0], s[1] + s[3] / 2 - 0.025, 0.045, 10));
    });
    return g;
  }

  Registry.register('noticeBoard', { label: 'Notice Board', bn: 'নোটিশ বোর্ড', order: 48, lift: 1.7, cam: { pos: [0.9, 0.2, 1.9], target: [0, 0, 0] }, build: build });
})();
