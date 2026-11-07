/*
 * Env — প্রসিডিউরাল উষ্ণ এনভায়রনমেন্ট ম্যাপ (গোল্ডেন-আওয়ার আকাশ + উজ্জ্বল জানালা)।
 * ছায়ার ভেতরের নরম বাদামি বাউন্স-লাইট এবং স্টিল/বার্নিশে প্রতিফলন এখান থেকে আসে।
 */
(function () {
  const T = THREE;

  window.Env = {
    build: function (renderer) {
      const pm = new T.PMREMGenerator(renderer);
      const sc = new T.Scene();

      const R = 20;
      const geo = new T.SphereGeometry(R, 32, 16);
      const p = geo.attributes.position, cols = [];
      const top = new T.Color(0.55, 0.44, 0.30), mid = new T.Color(0.46, 0.30, 0.15), bot = new T.Color(0.10, 0.06, 0.03);
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i) / R;
        const c = y > 0 ? mid.clone().lerp(top, Math.pow(y, 0.8)) : mid.clone().lerp(bot, Math.min(1, -y * 1.6));
        cols.push(c.r, c.g, c.b);
      }
      geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
      sc.add(new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));

      const win = new T.Mesh(new T.PlaneGeometry(9, 6), new T.MeshBasicMaterial({ color: new T.Color(5.5, 3.9, 2.0), side: T.DoubleSide }));
      win.position.set(14, 7, 6);
      win.lookAt(0, 1, 0);
      sc.add(win);

      const rt = pm.fromScene(sc, 0.03);
      pm.dispose();
      sc.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      return rt.texture;
    }
  };
})();
