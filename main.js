(function () {
    'use strict';

    var root = document.documentElement;

    // Tema terang/gelap
    var themeBtn = document.querySelector('.theme-toggle');
    function currentTheme() {
        var t = root.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // Header: garis bawah saat discroll
    var header = document.querySelector('.site-header');
    function onScroll() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu mobile
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    function setMenu(open) {
        if (!navLinks || !toggle) return;
        navLinks.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        toggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
    }
    if (toggle && navLinks) {
        toggle.addEventListener('click', function () { setMenu(!navLinks.classList.contains('open')); });
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }

    // Tandai menu sesuai section yang terlihat
    var sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sectionLinks.length && 'IntersectionObserver' in window) {
        var linkById = {};
        sectionLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach(function (a) { a.classList.remove('active'); });
                var link = linkById[entry.target.id];
                if (link) link.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(linkById).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) navObserver.observe(el);
        });
    }

    // Animasi muncul saat discroll
    var revealEls = document.querySelectorAll('.reveal');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    // Tahun di footer
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });
})();
