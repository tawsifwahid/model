/*
 * Teacher Desk — দুই পাশে ড্রয়ার-পেডেস্টাল, মাঝে হাঁটুর জায়গা, ক্লাসের দিকে (+z) পুরো ফ্রন্ট প্যানেল।
 * শিক্ষক -z দিকে বসেন, ড্রয়ার ও হাতল সেদিকে। টেবিলের ওপর বই, কলমদানি, ঘণ্টা, নেমপ্লেট ইত্যাদি।
 */
(function () {
  const T = THREE, B = window.B, M = window.Mat;

  function book(w, d, h, color, x, y, z, ry) {
    const cover = M.solid(color, { roughness: 0.6 }), pages = M.get('paper');
    const g = B.group('book');
    g.add(B.box(w, 0.004, d, cover, 0, 0.002, 0));
    g.add(B.box(w, 0.004, d, cover, 0, h - 0.002, 0));
    g.add(B.box(0.006, h, d, cover, -w / 2 + 0.003, h / 2, 0));
    g.add(B.box(w - 0.012, h - 0.008, d - 0.008, pages, 0.004, h / 2, 0));
    g.position.set(x, y, z); g.rotation.y = ry || 0;
    return g;
  }

  function build() {
    const g = B.group('teacherDesk');
    const top = M.get('woodLight'), carc = M.get('woodMid'), dark = M.get('woodDark');
    const brass = M.get('brass'), steelD = M.get('steelDark'), paper = M.get('paper');

    g.add(B.rbox(1.56, 0.034, 0.80, 0.02, top, 0, 0.743, 0, 0.007));            // টপ (উপরিতল y=0.76)

    [-1, 1].forEach(function (s) {
      const x = s * 0.55;
      g.add(B.box(0.44, 0.655, 0.68, carc, x, 0.3975, 0));
      g.add(B.box(0.46, 0.07, 0.70, dark, x, 0.035, 0));                         // প্লিন্থ
      [0.62, 0.43, 0.24].forEach(function (yc, i) {
        g.add(B.box(0.40, 0.17, 0.018, dark, x, yc, -0.349));                    // ড্রয়ার ফ্রন্ট
        g.add(B.box(0.31, 0.11, 0.006, top, x, yc, -0.3605));                    // ভেতরের প্যানেল
        g.add(B.rod([x - 0.06, yc, -0.382], [x + 0.06, yc, -0.382], 0.007, brass, 10));
        g.add(B.rod([x - 0.055, yc, -0.36], [x - 0.055, yc, -0.382], 0.005, brass, 8));
        g.add(B.rod([x + 0.055, yc, -0.36], [x + 0.055, yc, -0.382], 0.005, brass, 8));
        if (i === 0) g.add(B.rod([x, yc + 0.05, -0.358], [x, yc + 0.05, -0.365], 0.007, brass, 12)); // চাবির ঘর
      });
      g.add(B.box(0.012, 0.58, 0.6, dark, x + s * 0.226, 0.39, 0));              // বাইরের পাশের প্যানেল
    });

    g.add(B.box(0.68, 0.62, 0.02, carc, 0, 0.40, 0.33));                         // ক্লাসের দিকের ফ্রন্ট
    g.add(B.box(0.56, 0.46, 0.008, top, 0, 0.40, 0.343));
    g.add(B.box(0.68, 0.07, 0.02, dark, 0, 0.69, -0.30));                        // হাঁটুর ওপরের স্ট্রেচার

    // ডেস্ক প্যাড
    g.add(B.rbox(0.58, 0.006, 0.38, 0.01, M.get('leatherGreen'), 0, 0.763, -0.08, 0.002));
    g.add(book(0.30, 0.40, 0.03, '#2a2420', 0.0, 0.766, -0.08, 0.05));           // রেজিস্টার
    // খাতার স্তূপ
    g.add(book(0.21, 0.29, 0.028, '#3f5f8a', 0.52, 0.76, 0.12, 0.12));
    g.add(book(0.21, 0.29, 0.026, '#8a3a32', 0.52, 0.788, 0.12, -0.06));
    g.add(book(0.21, 0.29, 0.03, '#4c6b45', 0.52, 0.814, 0.12, 0.2));

    // কলমদানি ও কলম
    g.add(B.lathe([[0, 0], [0.038, 0], [0.041, 0.003], [0.043, 0.09], [0.039, 0.09], [0.037, 0.008], [0, 0.008]], M.dbl('steelDark'), -0.56, 0.76, -0.2, 24));
    [[0.0, 0.0, '#d23c32', 0.018, 0.01], [0.012, -0.01, '#2a4fa8', -0.012, 0.006], [-0.012, 0.008, '#1c1c1c', 0.01, -0.016], [0.006, 0.014, '#e8c13a', -0.02, 0.012]].forEach(function (p) {
      const bx = -0.56 + p[0], bz = -0.2 + p[1];
      g.add(B.rod([bx, 0.79, bz], [bx + p[3], 0.915, bz + p[4]], 0.004, M.solid(p[2], { roughness: 0.4 }), 8));
    });

    // ঘণ্টা
    g.add(B.cyl(0.046, 0.046, 0.008, brass, -0.33, 0.764, -0.24, 24));
    g.add(B.mesh(new T.SphereGeometry(0.038, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.dbl('brass'), -0.33, 0.768, -0.24));
    g.add(B.sphere(0.008, brass, -0.33, 0.809, -0.24, 10));

    // নেমপ্লেট
    g.add(B.box(0.24, 0.045, 0.025, dark, 0, 0.7825, 0.30));
    g.add(B.box(0.20, 0.028, 0.004, brass, 0, 0.7825, 0.3145));

    // কাঠের স্কেল
    const ruler = B.box(0.30, 0.003, 0.034, M.get('woodLight'), 0.2, 0.7615, -0.3);
    ruler.rotation.y = 0.12; g.add(ruler);

    // চায়ের মগ
    g.add(B.lathe([[0, 0], [0.034, 0], [0.036, 0.004], [0.038, 0.085], [0.034, 0.085], [0.032, 0.008], [0, 0.008]], M.dbl('ceramic'), 0.64, 0.76, -0.22, 24));
    const h = B.mesh(new T.TorusGeometry(0.02, 0.005, 8, 16, Math.PI), M.get('ceramic'), 0.675, 0.805, -0.22);
    h.rotation.z = -Math.PI / 2; g.add(h);

    // ছড়ানো কাগজ
    const sheet = B.box(0.21, 0.002, 0.297, paper, -0.15, 0.7612, 0.1);
    sheet.rotation.y = -0.2; g.add(sheet);
    return g;
  }

  Registry.register('teacherDesk', { label: 'Teacher Desk', bn: 'শিক্ষকের টেবিল', order: 20, cam: { pos: [1.8, 1.4, -1.9], target: [0, 0.45, 0] }, build: build });
})();
