/*
 * Lighting — একটি নিচু উষ্ণ "সূর্য" (গোল্ডেন আওয়ার) + ছায়া।
 *  - ছায়া স্থির, তাই শুধু দরকারে একবার আঁকা হয় (autoUpdate=false) → দ্রুত
 *  - প্রপ-মোডে জানালার ব্লাইন্ড ও পাতার ছায়ার জন্য অদৃশ্য "gobo" ব্যবহার হয়
 */
(function () {
  const T = THREE;

  const L = {
    sun: null, scene: null, renderer: null, gobo: null,
    az: 18, el: 24, R: 3.3, dist: 48,
    center: new T.Vector3(0, 0.8, 0),

    init: function (scene, renderer) {
      this.scene = scene; this.renderer = renderer;
      const s = new T.DirectionalLight(0xffc780, 3.0);
      s.castShadow = true;
      s.shadow.bias = -0.0006;
      s.shadow.normalBias = 0.012;
      s.shadow.camera.near = 1;
      s.shadow.camera.far = 110;
      s.shadow.mapSize.set(3072, 3072);
      scene.add(s); scene.add(s.target);
      this.sun = s;
      this.apply();
    },

    dirToSun: function () {
      const a = this.az * Math.PI / 180, e = this.el * Math.PI / 180;
      return new T.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
    },
    travelDir: function () { return this.dirToSun().multiplyScalar(-1); },

    apply: function () {
      const s = this.sun, d = this.dirToSun();
      s.target.position.copy(this.center);
      s.target.updateMatrixWorld();
      s.position.copy(this.center).addScaledVector(d, this.dist);
      const k = Math.min(1, Math.max(0, (this.el - 6) / 39));
      s.color.set(0xff8a3d).lerp(new T.Color(0xffe3b8), k);
      s.intensity = 3.0 - (1 - k) * 0.5;
      const c = s.shadow.camera;
      c.left = -this.R; c.right = this.R; c.top = this.R; c.bottom = -this.R;
      c.updateProjectionMatrix();
      if (this.gobo) this.placeGobo();
      this.refresh();
    },

    setAngles: function (az, el) { this.az = az; this.el = el; this.apply(); },
    fit: function (R, c) { this.R = R; this.center.set(c[0], c[1], c[2]); this.apply(); },

    setShadowSize: function (px) {
      const sh = this.sun.shadow;
      sh.mapSize.set(px, px);
      if (sh.map) { sh.map.dispose(); sh.map = null; }
      this.refresh();
    },

    refresh: function () { if (this.renderer) this.renderer.shadowMap.needsUpdate = true; },

    setGobo: function (on) {
      if (on && !this.gobo) { this.gobo = window.Foliage.gobo(); this.scene.add(this.gobo); this.placeGobo(); }
      if (this.gobo) this.gobo.visible = on;
      this.refresh();
    },
    placeGobo: function () {
      const g = this.gobo;
      g.position.copy(this.center).addScaledVector(this.dirToSun(), 6);
      g.lookAt(this.center);
      g.updateMatrixWorld(true);
    }
  };

  window.Lighting = L;
})();
