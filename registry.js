/*
 * Registry — প্রতিটি prop ফাইল নিজেকে এখানে রেজিস্টার করে।
 * Viewer শুধু Registry থেকে তালিকা পড়ে, কোনো prop ফাইলের নাম জানে না।
 *
 * Registry.register('id', {
 *   label, bn, order,          // চিপের নাম ও ক্রম
 *   lift: 0,                   // দেয়ালে ঝোলানো prop হলে মাটি থেকে উচ্চতা (m)
 *   cam: { pos:[x,y,z], target:[x,y,z] },   // ডিফল্ট ক্যামেরা (lift যোগ হয়)
 *   room: false,               // true হলে পুরো ঘর (স্টেজ ও বাইরের দৃশ্য আলাদা)
 *   build(opts) { return THREE.Group }
 * })
 */
(function () {
  const defs = new Map();
  const Registry = {
    register(id, def) {
      defs.set(id, Object.assign({ id: id, label: id, bn: def.label || id, order: 100, lift: 0, room: false }, def));
    },
    get(id) { return defs.get(id); },
    has(id) { return defs.has(id); },
    list() { return Array.from(defs.values()).sort(function (a, b) { return a.order - b.order; }); },
    create(id, opts) {
      const d = defs.get(id);
      if (!d) throw new Error('Unknown prop: ' + id);
      const obj = d.build(opts || {});
      if (!d.noMerge && window.Opt) window.Opt.mergeStatic(obj);
      obj.userData.propId = id;
      return obj;
    }
  };
  window.Registry = Registry;
})();
