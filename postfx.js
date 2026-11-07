/*
 * PostFX — সিনেমাটিক পোস্ট-প্রসেসিং:
 *   HDR রেন্ডার → Bloom (আলোর গ্লো) → ACES টোন-ম্যাপ → উষ্ণ কালার গ্রেড (বাদামি ছায়া, সোনালি হাইলাইট)
 *   → ভিনিয়েট → হালকা ফিল্ম-গ্রেইন → sRGB
 * কিছু ব্যর্থ হলে সরাসরি রেন্ডারে ফিরে যায়।
 */
(function () {
  const T = THREE;

  const Grade = {
    uniforms: {
      tDiffuse: { value: null }, uTime: { value: 0 },
      uExposure: { value: 1.0 }, uGrain: { value: 0.04 }, uVig: { value: 0.55 }
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform float uTime, uExposure, uGrain, uVig; varying vec2 vUv;',
      'vec3 aces(vec3 x){ const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }',
      'void main(){',
      '  vec3 c = texture2D(tDiffuse, vUv).rgb * uExposure;',
      '  c = aces(c);',
      '  float l = dot(c, vec3(0.299,0.587,0.114));',
      '  c *= mix(vec3(1.0), vec3(1.07,0.98,0.84), 0.65);',
      '  c += vec3(0.032,0.017,0.008) * (1.0 - l);',
      '  c = mix(vec3(l), c, 1.1);',
      '  float v = 1.0 - smoothstep(0.25, 0.9, length(vUv - 0.5));',
      '  c *= mix(1.0 - uVig, 1.0, v);',
      '  c = pow(max(c, 0.0), vec3(1.0/2.2));',
      '  float g = hash(vUv * vec2(1920.0,1080.0) + fract(uTime) * 37.0) - 0.5;',
      '  c += g * uGrain * (1.0 - 0.6 * l);',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n')
  };

  const PostFX = {
    composer: null, enabled: false, grade: null, renderer: null, scene: null, camera: null,

    build: function (renderer, scene, camera, o) {
      this.dispose();
      this.renderer = renderer; this.scene = scene; this.camera = camera;
      try {
        if (!T.EffectComposer || !T.UnrealBloomPass) throw new Error('postprocessing libs missing');
        const size = renderer.getSize(new T.Vector2());
        const pr = renderer.getPixelRatio();
        const w = Math.floor(size.x * pr), h = Math.floor(size.y * pr);
        const isGL2 = renderer.capabilities.isWebGL2;
        const params = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, type: isGL2 ? T.HalfFloatType : T.UnsignedByteType };
        let rt;
        if (o.msaa > 0 && isGL2) { rt = new T.WebGLMultisampleRenderTarget(w, h, params); rt.samples = o.msaa; }
        else rt = new T.WebGLRenderTarget(w, h, params);

        renderer.toneMapping = T.NoToneMapping;
        const comp = new T.EffectComposer(renderer, rt);
        comp.setPixelRatio(pr);
        comp.setSize(size.x, size.y);
        comp.addPass(new T.RenderPass(scene, camera));
        if (o.bloom) comp.addPass(new T.UnrealBloomPass(new T.Vector2(size.x, size.y), 0.55, 0.8, 0.9));
        this.grade = new T.ShaderPass(Grade);
        comp.addPass(this.grade);
        this.composer = comp;
        this.enabled = true;
      } catch (e) {
        console.warn('[PostFX] disabled:', e);
        this.enabled = false; this.composer = null;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.outputEncoding = T.sRGBEncoding;
      }
    },

    resize: function (w, h, pr) {
      if (!this.composer) return;
      this.composer.setPixelRatio(pr);
      this.composer.setSize(w, h);
    },

    render: function (dt, time) {
      if (this.enabled && this.composer) {
        this.grade.uniforms.uTime.value = time;
        this.composer.render(dt);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    },

    dispose: function () {
      if (!this.composer) return;
      try {
        this.composer.renderTarget1.dispose();
        this.composer.renderTarget2.dispose();
        this.composer.passes.forEach(function (p) { if (p.dispose) p.dispose(); });
      } catch (e) { /* ignore */ }
      this.composer = null; this.enabled = false;
    }
  };

  window.PostFX = PostFX;
})();
