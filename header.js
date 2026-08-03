window.addEventListener('scroll', function() {
    var header = document.querySelector('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.querySelectorAll('.nav-links a').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (!href) return;
        // Only intercept same-page hash links (scroll to section). Allow normal navigation for page links.
        if (href.trim().charAt(0) === '#') {
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Fallback: ensure `.btn` links navigate even if other handlers prevent default
document.querySelectorAll('a.btn').forEach(function(link){
    link.addEventListener('click', function(e){
        try {
            var href = this.getAttribute('href');
            if (!href) return;
            // ignore same-page anchors
            if (href.trim().charAt(0) === '#') return;
            // stop other handlers from blocking navigation and navigate explicitly
            e.stopImmediatePropagation();
            window.location.href = this.href;
        } catch (err) {
            // fallback: allow default behavior
        }
    }, { passive: false });
});

// Capture-phase handler: ensure `.btn` anchors navigate on Edge
document.addEventListener('click', function(e){
    try {
        if (e.button !== 0) return; // only left-click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow modified clicks
        var link = e.target.closest && e.target.closest('a.btn');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href) return;
        if (href.trim().charAt(0) === '#') return;
        e.preventDefault();
        window.location.href = link.href;
    } catch (err) {
        // ignore
    }
}, true);