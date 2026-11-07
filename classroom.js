/*
 * Classroom — ৮ × ৭ × ৩ মি ঘর। অন্য প্রপ ফাইলগুলো Registry.create() দিয়ে জোড়া লাগানো হয়।
 *  - +x দেয়ালে ৩টি আসল জানালা-ফাঁক (সূর্যের আলো আসে), -x দেয়ালে দরজা-ফাঁক
 *  - সিলিং একমুখী (ওপর থেকে দেখা যায় না, কিন্তু ছায়া ফেলে)
 *  - +z দেয়াল ও -x দেয়াল "Walls" বোতামে লুকানো যায় (cutaway)
 * userData.sunPortals — Viewer এখান থেকে আলোর রশ্মির জানালা-মাপ পড়ে।
 */
(function () {
  const T = THREE, B = window.B, M = window.Mat;
  const W = 8, D = 7, H = 3, TH = 0.2;

  function wall(len, ops) {
    const grp = B.group('wall');
    const plaster = M.get('plaster'), wain = M.get('wainscot'), base = M.get('baseboard'), rail = M.get('rail');
    const split = 1.0;
    function piece(a0, a1, b0, b1) {
      if (a1 - a0 < 0.001 || b1 - b0 < 0.001) return;
      const w = a1 - a0, cx = (a0 + a1) / 2;
      const add = function (y0, y1, mat) { grp.add(B.box(w, y1 - y0, TH, mat, cx, (y0 + y1) / 2, 0)); };
      if (b1 <= split) add(b0, b1, wain);
      else if (b0 >= split) add(b0, b1, plaster);
      else { add(b0, split, wain); add(split, b1, plaster); }
      if (b0 <= 0.0001) grp.add(B.box(w, 0.12, TH + 0.02, base, cx, 0.06, 0.01));
      if (b0 < split && b1 > split) grp.add(B.box(w, 0.045, TH + 0.03, rail, cx, split, 0.015));
    }
    let cursor = -len / 2;
    ops.slice().sort(function (a, b) { return a.c - b.c; }).forEach(function (o) {
      const a0 = o.c - o.w / 2, a1 = o.c + o.w / 2;
      piece(cursor, a0, 0, H);
      if (o.y0 > 0) piece(a0, a1, 0, o.y0);
      piece(a0, a1, o.y1, H);
      cursor = a1;
    });
    piece(cursor, len / 2, 0, H);
    return grp;
  }

  function build() {
    const R = B.group('classroom');
    const put = function (o, x, y, z, ry) { o.position.set(x, y, z); o.rotation.y = ry || 0; R.add(o); return o; };
    const mk = function (id, opts) { return Registry.create(id, opts); };

    // মেঝে ও সিলিং
    const floor = B.plane(W, D, M.get('floor')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; R.add(floor);
    const ceil = B.plane(W, D, M.get('ceiling'), 0, H, 0); ceil.rotation.x = Math.PI / 2; ceil.castShadow = true; R.add(ceil);

    // দেয়াল
    const back = wall(W, []);
    back.position.set(0, 0, -D / 2 - TH / 2); R.add(back);

    const right = wall(D, [-1.8, 0, 1.8].map(function (z) { return { c: z, w: 1.4, y0: 0.95, y1: 2.45 }; }));
    right.position.set(W / 2 + TH / 2, 0, 0); right.rotation.y = -Math.PI / 2; R.add(right);

    const left = wall(D, [{ c: -2, w: 1.0, y0: 0, y1: 2.1 }]);
    left.position.set(-W / 2 - TH / 2, 0, 0); left.rotation.y = Math.PI / 2;
    left.userData.dynamic = true; left.userData.cutaway = true; R.add(left);

    const front = wall(W, []);
    front.position.set(0, 0, D / 2 + TH / 2); front.rotation.y = Math.PI;
    front.userData.dynamic = true; front.userData.cutaway = true; R.add(front);

    // লুকানো দেয়ালের ছায়া-ব্লকার (cutaway করলেও আলো ঠিক থাকে)
    const blockMat = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
    const blk = new T.Mesh(new T.BoxGeometry(W + 0.4, H, TH), blockMat);
    blk.position.set(0, H / 2, D / 2 + TH / 2); blk.castShadow = true; R.add(blk);

    // সামনের দেয়াল: ব্ল্যাকবোর্ড, ঘড়ি, নোটিশ বোর্ড
    put(mk('blackboard'), 0, 1.7, -D / 2 + 0.03);
    put(mk('clock'), 2.6, 2.55, -D / 2 + 0.03);
    put(mk('noticeBoard'), -2.9, 1.7, -D / 2 + 0.022);

    // শিক্ষকের জায়গা
    put(mk('teacherDesk'), -1.4, 0, -2.4);
    put(mk('teacherChair'), -1.4, 0, -2.95, 0.15);

    // জানালা (+x দেয়াল)
    [-1.8, 0, 1.8].forEach(function (z) { put(mk('windowFrame', { backdrop: false }), W / 2 + 0.05, 1.7, z, -Math.PI / 2); });

    // দরজা (-x দেয়াল) ও লকার
    put(mk('door'), -W / 2 - 0.05, 0, 2, Math.PI / 2);
    [-2.3, -1.9, -1.5, -1.1].forEach(function (z) { put(mk('locker'), -W / 2 + 0.22, 0, z, Math.PI / 2); });
    put(mk('trashCan'), -W / 2 + 0.45, 0, 0.7);

    // বেঞ্চ-ডেস্ক
    [-2.4, 0, 2.4].forEach(function (x) { [-0.3, 1.1, 2.5].forEach(function (z) { put(mk('bench'), x, 0, z); }); });

    // হুইলচেয়ার (সারির মাঝের রাস্তায়, ব্ল্যাকবোর্ডের দিকে মুখ)
    put(mk('wheelchair'), 1.2, 0, 1.3, Math.PI);

    // সিলিং লাইট ও ফ্যান
    [-2, 2].forEach(function (x) { [-1, 1.5].forEach(function (z) { put(mk('ceilingLight'), x, H - 0.05, z); }); });
    [[-1.0, 0.2], [1.0, 0.2]].forEach(function (p) { put(mk('ceilingFan'), p[0], H, p[1]); });

    // রশ্মির জানালা
    R.userData.sunPortals = [-1.8, 0, 1.8].map(function (z) {
      return { o: [W / 2, 0.95, z - 0.7], u: [0, 0, 1.4], v: [0, 1.5, 0] };
    });
    R.userData.room = { w: W, d: D, h: H };
    return R;
  }

  Registry.register('classroom', {
    label: 'Full Classroom', bn: 'পুরো ক্লাসরুম', order: 0, room: true,
    cam: { pos: [3.1, 1.55, 3.0], target: [-0.6, 1.1, -1.6] }, build: build
  });
})();
