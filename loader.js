/* Loader — manifest অনুযায়ী ফাইলগুলো এক এক করে লোড করে (ক্রম বজায় রেখে) */
(function () {
  const M = window.MANIFEST;
  const label = document.getElementById('loader-text');
  const failed = [];

  function load(src) {
    return new Promise(function (resolve) {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(true); };
      s.onerror = function () { failed.push(src); console.error('[loader] failed:', src); resolve(false); };
      document.head.appendChild(s);
    });
  }

  async function run(list, critical) {
    for (const src of list) {
      if (label) label.textContent = 'লোড হচ্ছে… ' + src.split('/').pop();
      const ok = await load(src);
      if (!ok && critical) throw new Error('জরুরি ফাইল লোড হয়নি: ' + src);
    }
  }

  (async function () {
    try {
      await run(M.libs, true);
      await run(M.core, true);
      await run(M.props, false);
      await run(M.viewer, true);
      await window.Viewer.start({ failed: failed });
    } catch (e) {
      console.error(e);
      if (label) label.textContent = 'ত্রুটি: ' + e.message;
      const sp = document.querySelector('.spin');
      if (sp) sp.style.display = 'none';
    }
  })();
})();
