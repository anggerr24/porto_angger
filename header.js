(function () {
    'use strict';

    var header = document.querySelector('header');
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    function onScroll() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu mobile
    function setMenu(open) {
        if (!navLinks || !toggle) return;
        navLinks.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        toggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            setMenu(!navLinks.classList.contains('open'));
        });
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });

    // Tandai menu sesuai section yang sedang terlihat
    var sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sectionLinks.length && 'IntersectionObserver' in window) {
        var linkById = {};
        sectionLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach(function (a) { a.classList.remove('active'); });
                var link = linkById[entry.target.id];
                if (link && !link.classList.contains('nav-cta')) link.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        Object.keys(linkById).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) observer.observe(section);
        });
    }
})();
