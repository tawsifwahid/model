/* Blackboard — কাঠের ফ্রেম, চকের লেখা ও মোছার দাগ, চক-ট্রে, চক ও ডাস্টার */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  let boardMat = null;

  function boardTexture() {
    const W = 1536, H = 540, c = M.canvas(W, H), g = c.getContext('2d'), r = M.rng(404);
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#2c5446'); gr.addColorStop(.5, '#27493d'); gr.addColorStop(1, '#2b5144');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // মোছার ঘোলাটে দাগ
    g.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      g.strokeStyle = 'rgba(235,240,230,' + (.025 + r() * .05) + ')';
      g.lineWidth = 40 + r() * 60;
      g.beginPath(); const y = r() * H, x = r() * W;
      g.moveTo(x, y); g.quadraticCurveTo(x + 150, y + (r() - .5) * 70, x + 280 + r() * 200, y + (r() - .5) * 40); g.stroke();
    }
    for (let i = 0; i < 2500; i++) { g.fillStyle = 'rgba(255,255,255,' + (r() * .05) + ')'; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
    // চকের লেখা
    function chalk(txt, x, y, size, alpha) {
      g.font = size + 'px "Segoe Print","Bradley Hand","Comic Sans MS",cursive';
      for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(245,244,236,' + (alpha * (k ? .35 : .85)) + ')'; g.fillText(txt, x + (r() - .5) * 1.6, y + (r() - .5) * 1.6); }
    }
    chalk('Class 9  —  Chemistry', 90, 95, 64, .95);
    g.strokeStyle = 'rgba(245,244,236,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(90, 118); g.lineTo(720, 124); g.stroke();
    chalk('Atoms & Molecules', 90, 200, 52, .85);
    chalk('H2O  +  CO2  \u2192  H2CO3', 90, 285, 50, .8);
    chalk('2H2 + O2 \u2192 2H2O', 90, 365, 50, .75);
    chalk('Homework: Ex. 4.2  (1 \u2013 6)', 90, 460, 44, .8);
    // ডান পাশে একটি ডায়াগ্রাম
    g.strokeStyle = 'rgba(245,244,236,.75)'; g.lineWidth = 3.5;
    g.beginPath(); g.arc(1130, 250, 70, 0, 6.28); g.stroke();
    g.beginPath(); g.arc(1130, 250, 30, 0, 6.28); g.stroke();
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + .4; g.beginPath(); g.arc(1130 + Math.cos(a) * 70, 250 + Math.sin(a) * 70, 9, 0, 6.28); g.fillStyle = 'rgba(245,244,236,.8)'; g.fill(); }
    chalk('Bohr model', 1040, 370, 38, .75);
    return c;
  }

  function build(o) {
    o = o || {};
    const w = o.w || 3.4, h = o.h || 1.2;
    const g = B.group('blackboard');
    const wood = M.get('woodDark'), chalkM = M.get('chalk');
    if (!boardMat) {
      const canvas = boardTexture();
      const t = M.texture(canvas, 1, true); t.repeat.set(1, 1);
      const bt = M.texture(canvas, 1, false); bt.repeat.set(1, 1);
      boardMat = new T.MeshStandardMaterial({ map: t, bumpMap: bt, bumpScale: .6, roughness: .93, metalness: 0 });
    }
    g.add(B.box(w, h, 0.03, M.solid('#22463a', { roughness: 0.9 }), 0, 0, 0));
    const face = new T.Mesh(new T.PlaneGeometry(w, h), boardMat);
    face.position.z = 0.0155; face.receiveShadow = true; g.add(face);

    g.add(B.box(w + 0.12, 0.06, 0.06, wood, 0, h / 2 + 0.03, 0.01));
    g.add(B.box(w + 0.12, 0.06, 0.06, wood, 0, -h / 2 - 0.03, 0.01));
    g.add(B.box(0.06, h, 0.06, wood, -(w / 2 + 0.03), 0, 0.01));
    g.add(B.box(0.06, h, 0.06, wood, (w / 2 + 0.03), 0, 0.01));

    // চক-ট্রে
    g.add(B.box(w, 0.025, 0.11, wood, 0, -h / 2 - 0.0725, 0.065));
    g.add(B.box(w, 0.04, 0.014, wood, 0, -h / 2 - 0.06, 0.12));
    [[-0.5, 0.0], [-0.42, 0.01], [-0.3, -0.005], [0.2, 0.0]].forEach(function (p, i) {
      const c = B.cyl(0.0065, 0.0065, 0.07 - i * 0.012, chalkM, p[0], -h / 2 - 0.0535, 0.06 + p[1], 10);
      c.rotation.z = Math.PI / 2; c.rotation.y = i * 0.5; g.add(c);
    });
    // ডাস্টার
    g.add(B.rbox(0.14, 0.03, 0.055, 0.008, wood, 0.75, -h / 2 - 0.045, 0.07, 0.003));
    g.add(B.box(0.14, 0.018, 0.055, M.get('felt'), 0.75, -h / 2 - 0.0675, 0.07));
    return g;
  }

  Registry.register('blackboard', { label: 'Blackboard', bn: 'ব্ল্যাকবোর্ড', order: 40, lift: 1.7, cam: { pos: [1.4, 0.15, 3.6], target: [0, -0.1, 0] }, build: build });
})();
