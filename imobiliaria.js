// números crescendo na seção Sobre nós
(function () {
  var els = document.querySelectorAll('.nums b[data-alvo]');
  if (!els.length) return;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mostrar(el, v) { el.textContent = (el.dataset.pref || '') + v.toLocaleString('pt-BR') + (el.dataset.suf || ''); }
  function animar(el) {
    var alvo = +el.dataset.alvo, ini = null, dur = 1600;
    function passo(t) {
      if (ini === null) ini = t;
      var p = Math.min(1, (t - ini) / dur), e = 1 - Math.pow(1 - p, 3);
      mostrar(el, Math.round(alvo * e));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  if (reduz || !('IntersectionObserver' in window)) return; // mantém o número final
  els.forEach(function (el) { mostrar(el, 0); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { animar(e.target); io.unobserve(e.target); } });
  }, { threshold: .4 });
  els.forEach(function (el) { io.observe(el); });
})();
