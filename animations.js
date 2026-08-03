(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Typing effect
    var typingEl = document.getElementById('typing-text');
    var cursorEl = document.getElementById('typing-cursor');
    var typingPhrase = 'My Portfolio';
    var typingSpeed = 120;
    var pauseEnd = 2500;
    var pauseStart = 600;

    if (typingEl) {
        if (prefersReducedMotion) {
            typingEl.innerHTML = '<span>' + typingPhrase + '</span>';
            if (cursorEl) cursorEl.style.display = 'none';
        } else {
        var index = 0;
        var isDeleting = false;
        var cursorVisible = true;

        function typeStep() {
            var text = typingPhrase.slice(0, index);
            typingEl.innerHTML = text ? '<span>' + text + '</span>' : '';
            if (cursorEl) cursorEl.style.opacity = cursorVisible ? '1' : '0';
            cursorVisible = !cursorVisible;

            if (!isDeleting) {
                if (index < typingPhrase.length) {
                    index++;
                    setTimeout(typeStep, typingSpeed);
                } else {
                    isDeleting = true;
                    setTimeout(typeStep, pauseEnd);
                }
            } else {
                if (index > 0) {
                    index--;
                    setTimeout(typeStep, typingSpeed / 2);
                } else {
                    isDeleting = false;
                    setTimeout(typeStep, pauseStart);
                }
            }
        }

        setTimeout(function () {
            typeStep();
        }, 400);
        }
    }

    // Parallax effect
    var parallaxBg = document.getElementById('parallax-bg');
    if (parallaxBg && !prefersReducedMotion) {
        window.addEventListener('scroll', function () {
            var scrolled = window.pageYOffset;
            var move = scrolled * 0.4;
            parallaxBg.style.transform = 'translate3d(0, ' + move + 'px, 0) scale(1.4)';
        }, { passive: true });
    }

    // Fade-in on scroll
    var observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(function (el) {
        if (prefersReducedMotion) el.classList.add('reveal');
        else revealObserver.observe(el);
    });

    // Section reveal
    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-section');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('section').forEach(function (section) {
        if (prefersReducedMotion) section.classList.add('reveal-section');
        else sectionObserver.observe(section);
    });

})();
