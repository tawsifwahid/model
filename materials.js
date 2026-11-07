/*
 * Materials (window.Mat) — শেয়ার্ড PBR ম্যাটেরিয়াল ও প্রসিডিউরাল টেক্সচার।
 * একই ম্যাটেরিয়াল সবখানে পুনর্ব্যবহার হয় (মেমরি কম, মার্জ সহজ)।
 * Mat.get('woodLight') · Mat.fabric('#6b2a2d') · Mat.solid('#aa3322') · Mat.dbl('steelDark')
 */
(function () {
  const T = THREE;
  const Mat = {};
  const cache = {};
  const D = {};

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const cvs = function (w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  function tex(c, tile, srgb) {
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 8;
    if (srgb) t.encoding = T.sRGBEncoding;
    t.repeat.set(1 / tile, 1 / tile);
    return t;
  }
  function maps(c, tile) { return { map: tex(c, tile, true), bumpMap: tex(c, tile, false) }; }

  /* ---------- canvases ---------- */
  function woodCanvas(base, dark, light, seed) {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 14; i++) {
      const y = r() * S, h = 20 + r() * 60;
      const gr = g.createLinearGradient(0, y - h, 0, y + h);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(.5, 'rgba(' + (r() < .5 ? dark : light) + ',' + (.05 + r() * .07) + ')');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, y - h, S, 2 * h);
    }
    for (let i = 0; i < 320; i++) {
      const y = r() * S, w = .5 + r() * 1.8, col = r() < .7 ? dark : light;
      g.strokeStyle = 'rgba(' + col + ',' + (.03 + r() * .12) + ')';
      g.lineWidth = w; g.beginPath();
      const ph = r() * 6.28, amp = .8 + r() * 3.5, fr = .006 + r() * .01;
      for (let x = 0; x <= S; x += 16) {
        const yy = y + Math.sin(x * fr * 6.28 + ph) * amp;
        if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.stroke();
    }
    for (let k = 0; k < 3; k++) { // কাঠের গিঁট
      const x = r() * S, y = r() * S;
      for (let i = 4; i > 0; i--) { g.strokeStyle = 'rgba(' + dark + ',' + (.08 + .05 * i) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, i * 7, i * 2.6, 0, 0, 6.28); g.stroke(); }
    }
    return c;
  }

  function parquetCanvas(seed) {
    const S = 1024, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    const rows = 8, rh = S / rows;
    for (let i = 0; i < rows; i++) {
      const j = Math.floor(S * (.25 + r() * .5));
      [[0, j], [j, S]].forEach(function (seg) {
        const a = seg[0], b = seg[1];
        g.fillStyle = 'hsl(' + (28 + r() * 8) + ',' + (40 + r() * 10) + '%,' + (40 + r() * 10) + '%)';
        g.fillRect(a, i * rh, b - a, rh);
        for (let k = 0; k < 26; k++) {
          const y = i * rh + r() * rh;
          g.strokeStyle = 'rgba(' + (r() < .6 ? '60,32,12' : '235,190,130') + ',' + (.05 + r() * .12) + ')';
          g.lineWidth = .6 + r() * 1.4; g.beginPath(); g.moveTo(a, y);
          for (let x = a; x <= b; x += 24) g.lineTo(x, y + Math.sin(x * .02 + k) * 1.5);
          g.stroke();
        }
        g.strokeStyle = 'rgba(30,14,4,.55)'; g.lineWidth = 2; g.strokeRect(a + 1, i * rh + 1, b - a - 2, rh - 2);
      });
    }
    return c;
  }

  function plasterCanvas(base, seed) {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 40; i++) {
      const x = r() * S, y = r() * S, rad = 40 + r() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const dk = r() < .5;
      gr.addColorStop(0, dk ? 'rgba(90,60,30,.06)' : 'rgba(255,245,220,.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 3500; i++) {
      g.fillStyle = r() < .5 ? 'rgba(0,0,0,' + (.02 + r() * .04) + ')' : 'rgba(255,255,255,' + (.03 + r() * .05) + ')';
      g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
    }
    return c;
  }

  function fabricCanvas(hex, seed) {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = hex; g.fillRect(0, 0, S, S);
    for (let i = 0; i < S; i += 2) {
      g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(i, 0, 1, S);
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, i, S, 1);
    }
    for (let i = 0; i < 1800; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',.05)'; g.fillRect(r() * S, r() * S, 1, 1); }
    return c;
  }

  function leatherCanvas(hex, seed) {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = hex; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',' + (.03 + r() * .06) + ')';
      g.beginPath(); g.arc(r() * S, r() * S, .6 + r() * 1.6, 0, 6.28); g.fill();
    }
    return c;
  }

  function corkCanvas(seed) {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = '#c99a62'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      const d = r() < .55;
      g.fillStyle = d ? 'rgba(95,60,28,' + (.15 + r() * .3) + ')' : 'rgba(236,196,140,' + (.2 + r() * .3) + ')';
      g.beginPath(); g.arc(r() * S, r() * S, .5 + r() * 2.2, 0, 6.28); g.fill();
    }
    return c;
  }

  /* ---------- materials ---------- */
  function wood(base, dark, light, seed, o) {
    o = o || {};
    const m = maps(woodCanvas(base, dark, light, seed), o.tile || 0.9);
    return new T.MeshStandardMaterial({ map: m.map, bumpMap: m.bumpMap, bumpScale: o.bump || 0.6, roughness: o.rough || 0.55, metalness: 0 });
  }
  const std = function (o) { return new T.MeshStandardMaterial(o); };

  D.woodLight = function () { return wood('#c68f55', '72,40,16', '236,190,126', 3); };
  D.woodMid = function () { return wood('#a56b34', '50,24,8', '210,150,86', 5); };
  D.woodDark = function () { return wood('#6b3e20', '24,10,3', '150,92,48', 7, { rough: .5 }); };
  D.plywood = function () { return wood('#d9ac70', '120,72,30', '248,214,160', 9, { rough: .6, tile: .7 }); };

  D.steel = function () { return std({ color: 0xc8ccd2, metalness: 1, roughness: .26 }); };
  D.steelDark = function () { return std({ color: 0x2a2d32, metalness: .75, roughness: .4 }); };
  D.alu = function () { return std({ color: 0xa9aeb6, metalness: 1, roughness: .38 }); };
  D.brass = function () { return std({ color: 0xc9983f, metalness: 1, roughness: .3 }); };
  D.rubber = function () { return std({ color: 0x161515, metalness: 0, roughness: .95 }); };
  D.plasticBlack = function () { return std({ color: 0x1d1d1f, metalness: 0, roughness: .5 }); };
  D.plasticWhite = function () { return std({ color: 0xe9e3d3, metalness: 0, roughness: .45 }); };
  D.paper = function () { return std({ color: 0xf1e8d2, roughness: .95 }); };
  D.ceramic = function () { return std({ color: 0xf2eee3, roughness: .22 }); };
  D.felt = function () { return std({ color: 0x5a2a22, roughness: 1 }); };
  D.chalk = function () { return std({ color: 0xf4f1e8, roughness: 1 }); };
  D.paintCream = function () { return std({ color: 0xe9dcbf, roughness: .55 }); };
  D.bark = function () { return std({ color: 0x3b2a1c, roughness: 1 }); };
  D.lockerBlue = function () { return std({ color: 0x3f6f9f, metalness: .45, roughness: .42 }); };
  D.lockerDark = function () { return std({ color: 0x1c2a3a, metalness: .4, roughness: .5 }); };
  D.cord = function () { return std({ color: 0xcfc4a8, roughness: .8 }); };
  D.glass = function () {
    return std({ color: 0xcfe6ee, roughness: .04, metalness: 0, transparent: true, opacity: .1, depthWrite: false, envMapIntensity: 1.6 });
  };
  D.lightEmissive = function () { return std({ color: 0xfff6dc, emissive: 0xffe4a8, emissiveIntensity: 2.6, roughness: .6 }); };
  D.blind = function () {
    return std({ color: 0xece0c6, roughness: .5, metalness: .05, side: T.DoubleSide, emissive: 0xc79a58, emissiveIntensity: .32 });
  };

  D.plaster = function () {
    const m = maps(plasterCanvas('#ecd9b0', 21), 2);
    return std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .5, roughness: .95 });
  };
  D.wainscot = function () {
    const m = maps(plasterCanvas('#6d9a8e', 33), 2);
    return std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .4, roughness: .62 });
  };
  D.baseboard = function () { return std({ color: 0x5a3a24, roughness: .5 }); };
  D.rail = function () { return std({ color: 0xe9dcbf, roughness: .5 }); };
  D.ceiling = function () {
    const m = maps(plasterCanvas('#f1e4c4', 44), 2);
    const mat = std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .3, roughness: .95 });
    mat.shadowSide = T.DoubleSide;
    return mat;
  };
  D.floor = function () {
    const m = maps(parquetCanvas(77), 1.28);
    return new T.MeshPhysicalMaterial({ map: m.map, bumpMap: m.bumpMap, bumpScale: .4, roughness: .42, metalness: 0, clearcoat: .35, clearcoatRoughness: .3 });
  };
  D.leather = function () {
    const m = maps(leatherCanvas('#3d2a1e', 55), .2);
    return std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .5, roughness: .55 });
  };
  D.leatherGreen = function () {
    const m = maps(leatherCanvas('#2f4a3a', 56), .2);
    return std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .5, roughness: .6 });
  };
  D.cork = function () {
    const m = maps(corkCanvas(88), .3);
    return std({ map: m.map, bumpMap: m.bumpMap, bumpScale: 1.2, roughness: 1 });
  };

  /* ---------- API ---------- */
  Mat.get = function (name) {
    if (!cache[name]) {
      if (!D[name]) throw new Error('Unknown material: ' + name);
      cache[name] = D[name]();
    }
    return cache[name];
  };
  Mat.dbl = function (name) {
    const k = name + '#dbl';
    if (!cache[k]) { const m = Mat.get(name).clone(); m.side = T.DoubleSide; cache[k] = m; }
    return cache[k];
  };
  Mat.fabric = function (hex, tile) {
    const k = 'fabric:' + hex + ':' + (tile || .2);
    if (!cache[k]) {
      const m = maps(fabricCanvas(hex, 99), tile || .2);
      cache[k] = std({ map: m.map, bumpMap: m.bumpMap, bumpScale: .6, roughness: .92 });
    }
    return cache[k];
  };
  Mat.solid = function (hex, o) {
    const k = 'solid:' + hex + JSON.stringify(o || {});
    if (!cache[k]) cache[k] = std(Object.assign({ color: new T.Color(hex), roughness: .6, metalness: 0 }, o || {}));
    return cache[k];
  };
  Mat.texture = function (canvas, tile, srgb) { return tex(canvas, tile || 1, srgb !== false); };
  Mat.canvas = cvs;
  Mat.rng = rng;

  window.Mat = Mat;
})();
