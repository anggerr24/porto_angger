(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Typing effect: ganti-ganti peran di hero
    var typingEl = document.getElementById('typing-text');
    var roles = ['Programmer', 'System Analyst', 'Data Analyst', 'Social Media Specialist'];

    if (typingEl && !prefersReducedMotion) {
        var roleIndex = 0;
        var charIndex = roles[0].length;
        var isDeleting = true;

        function typeStep() {
            var role = roles[roleIndex];
            typingEl.textContent = role.slice(0, charIndex);

            if (isDeleting) {
                if (charIndex > 0) {
                    charIndex--;
                    setTimeout(typeStep, 45);
                } else {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeStep, 300);
                }
            } else if (charIndex < roles[roleIndex].length) {
                charIndex++;
                setTimeout(typeStep, 90);
            } else {
                isDeleting = true;
                setTimeout(typeStep, 2200);
            }
        }

        setTimeout(typeStep, 2200);
    }

    // Fade-in saat discroll
    var fadeEls = document.querySelectorAll('.fade-in-up');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        fadeEls.forEach(function (el) { el.classList.add('reveal'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(function (el) { revealObserver.observe(el); });
    }

    // Filter proyek
    var filters = document.querySelectorAll('.filter');
    var projects = document.querySelectorAll('.project[data-category]');

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var filter = btn.dataset.filter;
            filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
            projects.forEach(function (p) {
                var match = filter === 'all' || p.dataset.category.split(' ').indexOf(filter) !== -1;
                p.classList.toggle('hidden', !match);
                if (match) p.classList.add('reveal');
            });
        });
    });
})();
