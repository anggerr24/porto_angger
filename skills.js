(function () {
    var carousel = document.querySelector('.skills-carousel');
    if (!carousel) return;

    var trackInner = carousel.querySelector('.skills-track-inner');
    var slides = carousel.querySelectorAll('.skill-slide');
    var dots = carousel.querySelectorAll('.skills-dot');
    var prevBtn = carousel.querySelector('.skills-prev');
    var nextBtn = carousel.querySelector('.skills-next');
    var total = slides.length;
    var current = 0;

    function goTo(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        if (trackInner) {
            var offset = (100 / total) * current;
            trackInner.style.transform = 'translateX(-' + offset + '%)';
        }
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === current);
            d.setAttribute('aria-selected', i === current);
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { goTo(i); });
    });

    goTo(0);
})();
