/*
 * UI — চিপ (প্রপ বাছাই), টুল বোতাম, সূর্যের স্লাইডার, টোস্ট, লোডিং।
 * Registry.list() থেকে চিপ নিজে তৈরি হয় — নতুন প্রপ যোগ করলে এই ফাইল বদলাতে হয় না।
 */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  let H = {}, toastTimer = 0;
  const toolEls = {};

  const TOOLS = [
    { id: 'auto', icon: '\u27F3', tip: 'Spin' },
    { id: 'light', icon: '\u2600', tip: 'FX' },
    { id: 'cut', icon: '\u25A6', tip: 'Walls' },
    { id: 'quality', icon: '\u25D0', tip: 'Med' },
    { id: 'reset', icon: '\u2316', tip: 'Reset' },
    { id: 'shot', icon: '\u21E9', tip: 'Save' }
  ];

  const UI = {
    init: function (handlers, list) {
      H = handlers;
      const chips = $('chips'); chips.innerHTML = '';
      list.forEach(function (d) {
        const b = document.createElement('button');
        b.className = 'chip'; b.dataset.id = d.id;
        b.innerHTML = (d.bn || d.label) + '<em>' + d.label + '</em>';
        b.addEventListener('click', function () { H.onSelect(d.id); });
        chips.appendChild(b);
      });

      const tools = $('tools'); tools.innerHTML = '';
      TOOLS.forEach(function (t) {
        const b = document.createElement('button');
        b.className = 'tool'; b.dataset.id = t.id;
        b.innerHTML = t.icon + '<small>' + t.tip + '</small>';
        b.addEventListener('click', function () { H.onTool(t.id); });
        tools.appendChild(b); toolEls[t.id] = b;
      });

      const wrap = document.createElement('div'); wrap.className = 'sun-wrap';
      const r = document.createElement('input');
      r.type = 'range'; r.min = 6; r.max = 45; r.step = 1; r.value = 24; r.setAttribute('aria-label', 'Sun height');
      r.addEventListener('input', function () { H.onSun(parseFloat(r.value)); });
      wrap.appendChild(r); tools.appendChild(wrap);
    },

    setActive: function (id) {
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c.dataset.id === id); });
      const a = document.querySelector('.chip.active');
      if (a && a.scrollIntoView) a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    },
    setTitle: function (t) { $('propTitle').textContent = t; },
    setTool: function (id, on) { if (toolEls[id]) toolEls[id].classList.toggle('on', !!on); },
    showTool: function (id, show) { if (toolEls[id]) toolEls[id].classList.toggle('hidden', !show); },
    setToolLabel: function (id, txt) { const s = toolEls[id] && toolEls[id].querySelector('small'); if (s) s.textContent = txt; },
    hud: function (txt) { $('hud').textContent = txt; },
    loading: function (on, txt) {
      const el = $('loading');
      if (txt) $('loader-text').textContent = txt;
      el.classList.toggle('off', !on);
    },
    toast: function (msg) {
      const t = $('toast'); t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }
  };

  window.UI = UI;
})();
