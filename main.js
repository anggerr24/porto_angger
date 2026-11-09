(function () {
    'use strict';

    var root = document.documentElement;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Refresh selalu mulai dari paling atas ---------- */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var isReload = navEntry ? navEntry.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
    if (isReload) {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        window.addEventListener('load', function () { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });
    }

    /* ---------- Intro singkat (sekali per sesi) ---------- */
    var intro = document.querySelector('.intro');
    if (intro) {
        var seen = false;
        try { seen = sessionStorage.getItem('introSeen') === '1'; sessionStorage.setItem('introSeen', '1'); } catch (e) {}
        if (seen || reduced) {
            intro.remove();
        } else {
            var hideIntro = function () {
                intro.classList.add('done');
                setTimeout(function () { intro.remove(); }, 700);
            };
            var started = Date.now();
            var finish = function () { setTimeout(hideIntro, Math.max(0, 1100 - (Date.now() - started))); };
            if (document.readyState === 'complete') finish(); else window.addEventListener('load', finish);
            setTimeout(hideIntro, 3000); /* pengaman kalau load lama */
        }
    }

    /* ---------- Sapaan sesuai jam ---------- */
    var greet = document.getElementById('greet');
    if (greet) {
        var h = new Date().getHours();
        var w = h >= 4 && h < 11 ? 'pagi' : h >= 11 && h < 15 ? 'siang' : h >= 15 && h < 18 ? 'sore' : 'malam';
        var ic = { pagi: '☀️', siang: '🌤️', sore: '🌇', malam: '🌙' }[w];
        greet.textContent = '// selamat ' + w + ' ' + ic + ' saya';
    }

    /* ---------- Tooltip keahlian (melayang, tidak terpotong kartu) ---------- */
    var tipChips = document.querySelectorAll('.chips li[data-tip]');
    if (tipChips.length) {
        var tip = document.createElement('div');
        tip.className = 'skill-tip';
        tip.setAttribute('role', 'tooltip');
        document.body.appendChild(tip);
        var showTip = function (el) {
            tip.innerHTML = '';
            var lbl = document.createElement('small'); lbl.textContent = 'dipakai di';
            tip.appendChild(lbl);
            tip.appendChild(document.createTextNode(el.getAttribute('data-tip')));
            var r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
            var x = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
            var y = r.top - t.height - 10;
            if (y < 70) y = r.bottom + 10;
            tip.style.left = x + 'px'; tip.style.top = y + 'px';
            tip.classList.add('show');
        };
        var hideTip = function () { tip.classList.remove('show'); };
        tipChips.forEach(function (el) {
            el.addEventListener('mouseenter', function () { showTip(el); });
            el.addEventListener('focus', function () { showTip(el); });
            el.addEventListener('mouseleave', hideTip);
            el.addEventListener('blur', hideTip);
        });
        window.addEventListener('scroll', hideTip, { passive: true });
    }

    function cssVar(name) {
        return getComputedStyle(root).getPropertyValue(name).trim();
    }

    /* ---------- Tema ---------- */
    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            if (net) net.recolor();
        });
    }

    /* ---------- Header, progress scroll, timeline ---------- */
    var header = document.querySelector('.site-header');
    var progress = document.querySelector('.progress');
    var timeline = document.querySelector('.timeline');
    var tlItems = timeline ? timeline.querySelectorAll('.tl-item') : [];
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (header) header.classList.toggle('scrolled', y > 10);
        if (progress) progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

        if (timeline) {
            var r = timeline.getBoundingClientRect();
            var mid = window.innerHeight * 0.6;
            var fill = Math.min(1, Math.max(0, (mid - r.top) / r.height));
            timeline.style.setProperty('--fill', fill.toFixed(3));
            /* baca semua posisi dulu, baru ubah class (hindari layout berulang) */
            var tops = tlItems.map ? tlItems.map(function (it) { return it.getBoundingClientRect().top; })
                : Array.prototype.map.call(tlItems, function (it) { return it.getBoundingClientRect().top; });
            Array.prototype.forEach.call(tlItems, function (it, i) { it.classList.toggle('lit', tops[i] + 30 < mid); });
        }
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---------- Menu mobile ---------- */
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
        navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }

    /* ---------- Menu aktif sesuai section ---------- */
    var sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sectionLinks.length && 'IntersectionObserver' in window) {
        var linkById = {};
        sectionLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });
        var navObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                sectionLinks.forEach(function (a) { a.classList.remove('active'); });
                if (linkById[en.target.id]) linkById[en.target.id].classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(linkById).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) navObs.observe(el);
        });
    }

    /* ---------- Teks "decrypt" pada judul section ---------- */
    var GLYPHS = '!<>-_\\/[]{}=+*^?#01';
    function scramble(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        var nodes = [];
        (function walk(n) {
            n.childNodes.forEach(function (c) {
                if (c.nodeType === 3 && c.textContent.trim()) nodes.push({ node: c, text: c.textContent });
                else if (c.nodeType === 1) walk(c);
            });
        })(el);
        var start = performance.now();
        var dur = 900;
        function frame(now) {
            var t = Math.min(1, (now - start) / dur);
            nodes.forEach(function (o) {
                var reveal = Math.floor(o.text.length * t);
                var out = '';
                for (var i = 0; i < o.text.length; i++) {
                    var ch = o.text[i];
                    if (i < reveal || ch === ' ') out += ch;
                    else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
                }
                o.node.textContent = out;
            });
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ---------- Counter angka ---------- */
    function countUp(el) {
        var target = parseFloat(el.dataset.count);
        var dec = parseInt(el.dataset.decimals || '0', 10);
        var start = performance.now();
        var dur = 1400;
        function frame(now) {
            var t = Math.min(1, (now - start) / dur);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = (target * eased).toFixed(dec).replace('.', ',');
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ---------- Reveal saat discroll ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var revObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var el = en.target;
                el.classList.add('in');
                el.querySelectorAll('[data-scramble]').forEach(scramble);
                el.querySelectorAll('[data-count]').forEach(countUp);
                if (el.querySelector('#term')) typeTerminal();
                revObs.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revObs.observe(el); });
    }

    /* ---------- Efek mengetik peran di hero ---------- */
    var typingEl = document.getElementById('typing');
    var roles = ['Programmer', 'System Analyst', 'Data Analyst', 'Web Developer', 'IT Support'];
    if (typingEl && !reduced) {
        var ri = 0, ci = roles[0].length, deleting = true;
        (function step() {
            var word = roles[ri];
            typingEl.textContent = word.slice(0, ci);
            if (deleting) {
                if (ci > 0) { ci--; setTimeout(step, 40); }
                else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(step, 250); }
            } else if (ci < roles[ri].length) { ci++; setTimeout(step, 85); }
            else { deleting = true; setTimeout(step, 2000); }
        })();
    }

    /* ---------- Terminal mengetik ---------- */
    var termEl = document.getElementById('term');
    var termDone = false;
    function typeTerminal() {
        if (!termEl || termDone) return;
        termDone = true;
        var parts;
        try { parts = JSON.parse(termEl.dataset.lines); } catch (e) { return; }
        termEl.textContent = '';
        if (reduced) {
            parts.forEach(function (p) { addSpan(p[0], p[1]); });
            addSpan('cur', '');
            return;
        }
        var pi = 0, ch = 0, span = null;
        function addSpan(cls, text) {
            var s = document.createElement('span');
            if (cls) s.className = cls;
            s.textContent = text || '';
            termEl.appendChild(s);
            return s;
        }
        (function step() {
            if (pi >= parts.length) { addSpan('cur', ''); return; }
            var p = parts[pi];
            if (p[0] !== 'c') {
                /* output: muncul per potongan, jeda kecil tiap baris baru */
                addSpan(p[0], p[1]); pi++;
                setTimeout(step, p[1].indexOf(String.fromCharCode(10)) > -1 ? 90 : 0);
                return;
            }
            /* perintah: diketik huruf per huruf */
            if (!span) span = addSpan(p[0], '');
            span.textContent += p[1].charAt(ch++);
            if (ch >= p[1].length) { pi++; ch = 0; span = null; setTimeout(step, 260); return; }
            setTimeout(step, 55);
        })();
    }
    if (termEl && (reduced || !('IntersectionObserver' in window))) typeTerminal();

    /* ---------- Marquee: gandakan isi supaya loop mulus ---------- */
    document.querySelectorAll('.marquee-track').forEach(function (track) {
        Array.prototype.slice.call(track.children).forEach(function (c) {
            var clone = c.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    });

    /* ---------- Filter proyek ---------- */
    var filters = document.querySelectorAll('.filter');
    var projects = document.querySelectorAll('.project[data-category]');
    filters.forEach(function (btn) {
        var f = btn.dataset.filter;
        var n = f === 'all' ? projects.length : Array.prototype.filter.call(projects, function (p) {
            return p.dataset.category.split(' ').indexOf(f) !== -1;
        }).length;
        var c = document.createElement('span');
        c.className = 'count';
        c.textContent = n;
        btn.appendChild(c);

        btn.addEventListener('click', function () {
            filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
            projects.forEach(function (p) {
                var match = f === 'all' || p.dataset.category.split(' ').indexOf(f) !== -1;
                p.classList.toggle('hidden', !match);
                if (match) p.classList.add('in');
            });
            setupShots();
        });
    });

    /* ---------- Preview web: auto-scroll saat hover ---------- */
    function setupShots() {
        document.querySelectorAll('.shot').forEach(function (shot) {
            var img = shot.querySelector('img');
            if (!img) return;
            function calc() {
                var shift = shot.clientHeight - img.clientHeight;
                if (shift < -4) {
                    shot.style.setProperty('--shift', shift + 'px');
                    shot.style.setProperty('--dur', Math.max(2, Math.abs(shift) / 260).toFixed(2) + 's');
                } else {
                    shot.style.setProperty('--shift', '0px');
                    shot.removeAttribute('data-hint');
                }
            }
            if (img.complete) calc(); else img.addEventListener('load', calc, { once: true });
        });
    }
    setupShots();
    var shotsW = window.innerWidth;
    window.addEventListener('resize', function () {
        if (window.innerWidth === shotsW) return;
        shotsW = window.innerWidth; setupShots();
    });

    /* Di layar sentuh tidak ada hover: preview discroll otomatis saat kartunya terlihat */
    if (!finePointer && !reduced && 'IntersectionObserver' in window) {
        var shotIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { en.target.classList.toggle('autoscroll', en.isIntersecting); });
        }, { threshold: 0.75 });
        document.querySelectorAll('.shot').forEach(function (shot) {
            if (shot.hasAttribute('data-hint')) shot.setAttribute('data-hint', 'auto scroll ↓');
            shotIO.observe(shot);
        });
    }

    /* ---------- Spotlight + tilt pada kartu ---------- */
    if (finePointer && !reduced) {
        document.querySelectorAll('.glass').forEach(function (card) {
            var tilt = card.classList.contains('tilt');
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                var x = e.clientX - r.left, y = e.clientY - r.top;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
                if (tilt) {
                    var rx = ((y / r.height) - 0.5) * -5;
                    var ry = ((x / r.width) - 0.5) * 6;
                    card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
                }
            });
            if (tilt) {
                card.addEventListener('pointerenter', function () {
                    card.style.transition = 'transform .18s ease-out, border-color .3s, box-shadow .4s';
                });
                card.addEventListener('pointerleave', function () {
                    card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1), border-color .3s, box-shadow .4s';
                    card.style.transform = '';
                });
            }
        });

        /* Tombol magnetik */
        document.querySelectorAll('.magnetic').forEach(function (btn) {
            btn.addEventListener('pointermove', function (e) {
                var r = btn.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
                btn.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.25).toFixed(1) + 'px)';
            });
            btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
        });

        /* Cahaya kursor */
        var glow = document.querySelector('.cursor-glow');
        if (glow) {
            window.addEventListener('pointermove', function (e) {
                glow.style.setProperty('--cx', e.clientX + 'px');
                glow.style.setProperty('--cy', e.clientY + 'px');
            }, { passive: true });
        }
    }

    /* ---------- Salin email ---------- */
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.dataset.copy;
            var label = btn.querySelector('span');
            function done() {
                btn.classList.add('copied');
                if (label) label.textContent = 'Tersalin!';
                setTimeout(function () { btn.classList.remove('copied'); if (label) label.textContent = 'Salin email'; }, 1800);
            }
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
        });
    });

    /* ---------- Lightbox (sertifikat & dashboard) ---------- */
    // Tiap galeri punya daftar slide sendiri; satu kartu boleh berisi beberapa gambar
    // (data-full="a.png|b.png", data-caption="cap a|cap b").
    var lb = document.querySelector('.lightbox');
    var lbCards = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
    if (lb && lbCards.length && typeof lb.showModal === 'function') {
        var lbImg = lb.querySelector('.lb-img');
        var lbCap = lb.querySelector('.lb-cap');
        var slides = [], lbIndex = 0, lastFocus = null;

        function slidesFor(gallery) {
            var out = [];
            gallery.querySelectorAll('[data-full]').forEach(function (c) {
                var srcs = c.dataset.full.split('|');
                var caps = (c.dataset.caption || '').split('|');
                var alt = c.querySelector('img') ? c.querySelector('img').alt : '';
                srcs.forEach(function (src, k) {
                    out.push({ card: c, src: src, cap: caps[k] || caps[0], alt: alt });
                });
            });
            return out;
        }
        function show(i) {
            lbIndex = (i + slides.length) % slides.length;
            var sl = slides[lbIndex];
            lbImg.style.animation = 'none';
            void lbImg.offsetWidth;
            lbImg.style.animation = '';
            lbImg.src = sl.src;
            lbImg.alt = sl.alt;
            lbCap.textContent = sl.cap + (slides.length > 1 ? '  ·  ' + (lbIndex + 1) + '/' + slides.length : '');
        }
        lbCards.forEach(function (c) {
            c.addEventListener('click', function () {
                var gallery = c.closest('.cert-gallery') || c.closest('.project') || c.parentElement;
                slides = slidesFor(gallery);
                lastFocus = c;
                for (var k = 0; k < slides.length; k++) { if (slides[k].card === c) break; }
                show(k);
                var multi = slides.length > 1;
                lb.querySelector('.lb-prev').style.visibility = multi ? '' : 'hidden';
                lb.querySelector('.lb-next').style.visibility = multi ? '' : 'hidden';
                lb.showModal();
            });
        });
        document.querySelectorAll('.open-gallery').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var t = btn.closest('.project') && btn.closest('.project').querySelector('[data-full]');
                if (t) t.click();
            });
        });
        lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
        lb.querySelector('.lb-prev').addEventListener('click', function () { show(lbIndex - 1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { show(lbIndex + 1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
        lb.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') show(lbIndex - 1);
            if (e.key === 'ArrowRight') show(lbIndex + 1);
        });
        lb.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
        var sx = null;
        lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            if (sx === null) return;
            var dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
            sx = null;
        });
    }

    /* ---------- Tahun footer ---------- */
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Jeda animasi berulang saat tidak terlihat ---------- */
    if ('IntersectionObserver' in window) {
        var pauseIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { en.target.classList.toggle('paused', !en.isIntersecting); });
        }, { rootMargin: '100px 0px' });
        document.querySelectorAll('.hero, .marquee, .viz, .contact-card, .browser-bar').forEach(function (el) { pauseIO.observe(el); });
    }

    /* ---------- Jaringan partikel di hero ---------- */
    var net = null;
    var canvas = document.getElementById('net');
    if (canvas && !reduced && canvas.getContext) {
        net = (function () {
            var ctx = canvas.getContext('2d');
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = 0, h = 0, pts = [], mouse = { x: -9999, y: -9999 };
            var c1 = '', c2 = '', running = true, raf = 0;

            function hexToRgb(hex) {
                hex = hex.replace('#', '');
                if (hex.length === 3) hex = hex.split('').map(function (x) { return x + x; }).join('');
                var n = parseInt(hex, 16);
                return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
            }
            function recolor() { c1 = hexToRgb(cssVar('--accent')); c2 = hexToRgb(cssVar('--accent-2')); }

            function resize() {
                var r = canvas.getBoundingClientRect();
                w = r.width; h = r.height;
                canvas.width = w * dpr; canvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                var count = Math.round(Math.min(w < 700 ? 34 : 90, (w * h) / (w < 700 ? 22000 : 16000)));
                pts = [];
                for (var i = 0; i < count; i++) {
                    pts.push({
                        x: Math.random() * w, y: Math.random() * h,
                        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                        r: Math.random() * 1.6 + 0.6, alt: Math.random() < 0.3
                    });
                }
            }

            function draw() {
                ctx.clearRect(0, 0, w, h);
                var link = 130;
                for (var i = 0; i < pts.length; i++) {
                    var p = pts[i];
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;

                    var dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.sqrt(dxm * dxm + dym * dym);
                    if (dm < 140) { p.x += dxm / dm * 0.8; p.y += dym / dm * 0.8; }

                    for (var j = i + 1; j < pts.length; j++) {
                        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
                        if (d < link * link) {
                            ctx.strokeStyle = 'rgba(' + c1 + ',' + (0.22 * (1 - Math.sqrt(d) / link)).toFixed(3) + ')';
                            ctx.lineWidth = 1;
                            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                        }
                    }
                    if (dm < 180) {
                        ctx.strokeStyle = 'rgba(' + c2 + ',' + (0.35 * (1 - dm / 180)).toFixed(3) + ')';
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                    }
                    ctx.fillStyle = 'rgba(' + (p.alt ? c2 : c1) + ',0.75)';
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                }
                if (running) raf = requestAnimationFrame(draw);
            }

            canvas.parentElement.addEventListener('pointermove', function (e) {
                var r = canvas.getBoundingClientRect();
                mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
            });
            canvas.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
            var lastW = window.innerWidth;
            window.addEventListener('resize', function () {
                if (window.innerWidth === lastW) return; /* address bar HP: tinggi saja yang berubah */
                lastW = window.innerWidth; resize();
            });

            // Hemat CPU: berhenti saat hero tidak terlihat atau tab disembunyikan
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (en) {
                    var vis = en[0].isIntersecting;
                    if (vis && !running) { running = true; raf = requestAnimationFrame(draw); }
                    else if (!vis) { running = false; cancelAnimationFrame(raf); }
                }).observe(canvas);
            }
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) { running = false; cancelAnimationFrame(raf); }
                else if (!running) { running = true; raf = requestAnimationFrame(draw); }
            });

            recolor(); resize(); draw();
            return { recolor: recolor };
        })();
    }
})();
