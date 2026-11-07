/*
 * Opt — ভিজ্যুয়াল অপরিবর্তিত রেখে পারফরম্যান্স অপটিমাইজেশন।
 *  - mergeStatic: একই ম্যাটেরিয়ালের স্থির মেশ এক মেশে মার্জ (draw call কমে)
 *  - dispose: প্রপ বদলালে জিপিইউ মেমরি মুক্ত
 * userData.dynamic = true দেওয়া মেশ/গ্রুপ (যেমন ঘড়ির কাঁটা, দেয়াল) মার্জ হয় না।
 */
(function () {
  const T = THREE;
  const Opt = {};

  Opt.mergeStatic = function (root) {
    root.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(root.matrixWorld).invert();
    const used = [];

    root.traverse(function (o) {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
      if (o.userData.dynamic || o.userData.keep) return;
      if (!o.geometry || Array.isArray(o.material) || !o.visible) return;
      let p = o.parent;
      while (p && p !== root) { if (p.userData.dynamic || !p.visible) return; p = p.parent; }
      used.push(o);
    });

    const buckets = new Map();
    used.forEach(function (o) {
      const g = o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      const ng = g.index ? g.toNonIndexed() : g;
      Object.keys(ng.attributes).forEach(function (k) { if (k !== 'position' && k !== 'normal' && k !== 'uv') ng.deleteAttribute(k); });
      if (!ng.attributes.uv) ng.setAttribute('uv', new T.BufferAttribute(new Float32Array(ng.attributes.position.count * 2), 2));
      const key = o.material.uuid + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0);
      let b = buckets.get(key);
      if (!b) { b = { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, geos: [] }; buckets.set(key, b); }
      b.geos.push(ng);
      if (o.parent) o.parent.remove(o);
      o.geometry.dispose();
    });

    buckets.forEach(function (b) {
      const geo = b.geos.length === 1 ? b.geos[0] : T.BufferGeometryUtils.mergeBufferGeometries(b.geos, false);
      if (!geo) return;
      const m = new T.Mesh(geo, b.mat);
      m.castShadow = b.cast; m.receiveShadow = b.recv;
      m.matrixAutoUpdate = false;
      root.add(m);
    });
    return root;
  };

  Opt.dispose = function (root) {
    root.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
  };

  window.Opt = Opt;
})();
