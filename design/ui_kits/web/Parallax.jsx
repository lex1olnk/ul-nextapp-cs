// CS2 Parser Stats — parallax layer
// Scroll parallax for ghost watermarks + the hero operators background,
// mouse parallax for hero background + crosses. Waits for React to mount.
(function () {
  var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, scrollY = 0;
  var watermarks = [], heroLayers = [], bgEl = null;
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function collect() {
    watermarks = Array.prototype.slice.call(document.querySelectorAll(".watermark"));
    heroLayers = [];
    bgEl = document.querySelector(".hero-bg");
    var hero = document.getElementById("events");
    if (hero) {
      var crosses = hero.querySelector(".crosses");
      if (crosses) heroLayers.push({ el: crosses, depth: 30 });
    }
    return (watermarks.length > 0) || !!bgEl;
  }

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight;
    for (var i = 0; i < watermarks.length; i++) {
      var el = watermarks[i];
      var rect = el.getBoundingClientRect();
      var offset = rect.top + rect.height / 2 - vh / 2;
      var speed = el.__pspeed || (el.__pspeed = 0.12 + (i % 3) * 0.05);
      el.style.transform = "translate3d(0," + (-offset * speed).toFixed(1) + "px,0)";
      el.style.willChange = "transform";
    }
  }

  function onMouse(e) {
    var w = window.innerWidth, h = window.innerHeight;
    targetX = (e.clientX / w - 0.5) * 2;   // -1..1
    targetY = (e.clientY / h - 0.5) * 2;
  }

  function raf() {
    mouseX += (targetX - mouseX) * 0.06;
    mouseY += (targetY - mouseY) * 0.06;

    // hero operators background: float in space (mouse) + scroll lag
    if (bgEl) {
      var bx = (-mouseX * 26).toFixed(1);
      var by = (-mouseY * 18 + scrollY * 0.12).toFixed(1);
      var rot = (mouseX * 0.6).toFixed(2);
      bgEl.style.transform = "scale(1.12) translate3d(" + bx + "px," + by + "px,0) rotate(" + rot + "deg)";
    }
    for (var i = 0; i < heroLayers.length; i++) {
      var L = heroLayers[i];
      var dx = (mouseX * L.depth).toFixed(1);
      var dy = (mouseY * L.depth).toFixed(1);
      L.el.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
      L.el.style.willChange = "transform";
    }
    requestAnimationFrame(raf);
  }

  function start() {
    onScroll();
    window.addEventListener("scroll", function () { window.requestAnimationFrame(onScroll); }, { passive: true });
    window.addEventListener("resize", function () { window.requestAnimationFrame(onScroll); }, { passive: true });
    if (!prefersReduced) window.addEventListener("mousemove", onMouse, { passive: true });
    requestAnimationFrame(raf); // bg scroll-lag still applies even if mouse disabled
  }

  var tries = 0;
  (function waitMount() {
    if (collect()) { start(); return; }
    if (tries++ < 120) requestAnimationFrame(waitMount);
  })();
})();
