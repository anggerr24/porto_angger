document.addEventListener('DOMContentLoaded', function () {
  var slider = document.querySelector('.bengkel-slider');
  if (!slider) return;

  var track = slider.querySelector('.bengkel-track');
  var slides = Array.from(slider.querySelectorAll('.bengkel-slide'));
  var prev = slider.querySelector('.bengkel-prev');
  var next = slider.querySelector('.bengkel-next');
  var dotsWrap = slider.querySelector('.bengkel-dots');
  var index = 0;

  // build dots
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'bengkel-dot';
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.dataset.index = i;
    dotsWrap.appendChild(d);
  });

  var dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    updateAria();
  }

  function go(i) { index = (i + slides.length) % slides.length; update(); }

  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index + 1); });
  dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.dataset.index)); }); });

  // keyboard
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prev.click();
    if (e.key === 'ArrowRight') next.click();
  });

  // Autoplay + in-view observer
  var autoplayDelay = 3500; // ms
  var autoplayTimer = null;
  function startAutoplay() { if (autoplayTimer) return; autoplayTimer = setInterval(function () { go(index + 1); }, autoplayDelay); }
  function stopAutoplay() { if (!autoplayTimer) return; clearInterval(autoplayTimer); autoplayTimer = null; }

  // Pause on hover/focus, resume when leaving
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', function () { if (slider.classList.contains('in-view')) startAutoplay(); });
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', function () { if (slider.classList.contains('in-view')) startAutoplay(); });

  // IntersectionObserver: start autoplay only when visible
  try {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { slider.classList.add('in-view'); startAutoplay(); }
        else { slider.classList.remove('in-view'); stopAutoplay(); }
      });
    }, { threshold: 0.45 });
    obs.observe(slider);
  } catch (e) {
    // fallback: start autoplay immediately
    slider.classList.add('in-view'); startAutoplay();
  }

  // swipe support
  var startX = null;
  track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; });
  track.addEventListener('touchend', function (e) {
    if (startX === null) return; var dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) { if (dx < 0) go(index + 1); else go(index - 1); } startX = null;
  });

  // make slides full-width and initialize
  update();

  // accessibility: allow keyboard navigation and mark up dots
  slider.tabIndex = 0;
  prev.type = 'button'; next.type = 'button';

  // update ARIA state for dots inside update()
  function updateAria() {
    dots.forEach(function (d, i) {
      d.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      d.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }
});
