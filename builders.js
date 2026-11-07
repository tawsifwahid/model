/*
 * Builders (window.B) — ছোট জ্যামিতি সহায়ক ফাংশন।
 * সব UV মিটার স্কেলে, তাই টেক্সচার সব জায়গায় একই মাপে পড়ে।
 */
(function () {
  const T = THREE;
  const B = {};

  B.mesh = function (geo, mat, x, y, z) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };

  B.group = function (name) {
    const g = new T.Group(); g.name = name || '';
    for (let i = 1; i < arguments.length; i++) { const k = arguments[i]; if (k) g.add(k); }
    return g;
  };

  function scaleBoxUV(geo, w, h, d) {
    const uv = geo.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
    uv.needsUpdate = true;
  }

  B.box = function (w, h, d, mat, x, y, z) {
    const g = new T.BoxGeometry(w, h, d);
    scaleBoxUV(g, w, h, d);
    return B.mesh(g, mat, x, y, z);
  };

  B.cyl = function (rt, rb, h, mat, x, y, z, seg) {
    return B.mesh(new T.CylinderGeometry(rt, rb, h, seg || 20), mat, x, y, z);
  };

  B.sphere = function (r, mat, x, y, z, seg) {
    return B.mesh(new T.SphereGeometry(r, seg || 16, Math.max(8, (seg || 16) / 2)), mat, x, y, z);
  };

  B.torus = function (R, r, mat, x, y, z, radial, tubular) {
    return B.mesh(new T.TorusGeometry(R, r, radial || 10, tubular || 48), mat, x, y, z);
  };

  B.plane = function (w, h, mat, x, y, z) {
    const g = new T.PlaneGeometry(w, h);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
    const m = B.mesh(g, mat, x, y, z);
    m.castShadow = false;
    return m;
  };

  B.lathe = function (profile, mat, x, y, z, seg) {
    const pts = profile.map(function (p) { return new T.Vector2(p[0], p[1]); });
    return B.mesh(new T.LatheGeometry(pts, seg || 28), mat, x, y, z);
  };

  // দুই বিন্দুর মধ্যে সিলিন্ডার রড
  B.rod = function (a, b, r, mat, seg) {
    const A = new T.Vector3(a[0], a[1], a[2]);
    const Bv = new T.Vector3(b[0], b[1], b[2]);
    const d = Bv.clone().sub(A);
    const len = d.length();
    const m = new T.Mesh(new T.CylinderGeometry(r, r, len, seg || 8), mat);
    m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };

  // বাঁকানো স্টিল নল (কোণায় গোল fillet)
  B.tube = function (pts, r, mat, fillet, radial) {
    const P = pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); });
    const path = new T.CurvePath();
    let cur = P[0].clone();
    for (let i = 1; i < P.length - 1; i++) {
      const prev = P[i - 1], p = P[i], next = P[i + 1];
      const d1 = p.clone().sub(prev), d2 = next.clone().sub(p);
      const f = Math.min(fillet || 0.05, d1.length() / 2, d2.length() / 2);
      const s = p.clone().addScaledVector(d1.clone().normalize(), -f);
      const e = p.clone().addScaledVector(d2.clone().normalize(), f);
      if (cur.distanceTo(s) > 1e-6) path.add(new T.LineCurve3(cur.clone(), s));
      path.add(new T.QuadraticBezierCurve3(s, p.clone(), e));
      cur = e;
    }
    path.add(new T.LineCurve3(cur.clone(), P[P.length - 1].clone()));
    const segs = Math.max(20, Math.ceil(path.getLength() / 0.018));
    const g = new T.TubeGeometry(path, segs, r, radial || 10, false);
    return B.mesh(g, mat, 0, 0, 0);
  };

  // গোল কোণার বেভেল করা বাক্স (কাঠের টপ, কুশন ইত্যাদি)
  B.rbox = function (w, h, d, r, mat, x, y, z, bev) {
    const b = Math.min(bev === undefined ? 0.004 : bev, h * 0.45, Math.min(w, d) / 4);
    const w2 = w - 2 * b, d2 = d - 2 * b, h2 = Math.max(0.0005, h - 2 * b);
    const r2 = Math.max(0.001, Math.min(r - b, Math.min(w2, d2) / 2 - 0.0005));
    const hw = w2 / 2, hd = d2 / 2;
    const s = new T.Shape();
    s.moveTo(-hw + r2, -hd);
    s.lineTo(hw - r2, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r2);
    s.lineTo(hw, hd - r2); s.quadraticCurveTo(hw, hd, hw - r2, hd);
    s.lineTo(-hw + r2, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r2);
    s.lineTo(-hw, -hd + r2); s.quadraticCurveTo(-hw, -hd, -hw + r2, -hd);
    const g = new T.ExtrudeGeometry(s, { depth: h2, bevelEnabled: b > 0.0005, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 5 });
    g.rotateX(-Math.PI / 2);
    g.center();
    return B.mesh(g, mat, x, y, z);
  };

  // বাঁকা পাতলা প্যানেল (চেয়ারের ব্যাকরেস্ট) — প্রান্ত +z এর দিকে বাঁকে
  B.curved = function (w, h, t, sag, mat) {
    const R = (w * w / 4 + sag * sag) / (2 * sag);
    const half = Math.asin(w / 2 / R), n = 12;
    const s = new T.Shape();
    const pt = function (rho, a) { return [rho * Math.sin(a), -(R - rho * Math.cos(a))]; };
    for (let i = 0; i <= n; i++) { const a = -half + 2 * half * i / n; const p = pt(R + t / 2, a); if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); }
    for (let i = n; i >= 0; i--) { const a = -half + 2 * half * i / n; const p = pt(R - t / 2, a); s.lineTo(p[0], p[1]); }
    const g = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, steps: 1 });
    g.rotateX(-Math.PI / 2);
    g.center();
    return B.mesh(g, mat, 0, 0, 0);
  };

  // দুমড়ানো কাগজের গোলা
  B.crumple = function (r, seed, mat, x, y, z) {
    const g = new T.IcosahedronGeometry(r, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i);
      const k = 1 + 0.16 * Math.sin(X * 97 + seed) * Math.cos(Y * 83 + seed * 1.7) + 0.1 * Math.sin(Z * 131 + seed * 2.3);
      p.setXYZ(i, X * k, Y * k, Z * k);
    }
    g.computeVertexNormals();
    return B.mesh(g, mat, x, y, z);
  };

  window.B = B;
})();
