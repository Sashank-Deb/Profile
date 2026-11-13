const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/*==================== MOBILE MENU ====================*/
const navMenu = $('#nav-menu');
const navToggle = $('#nav-toggle');

const setMenu = (open) => {
    navMenu.classList.toggle('show-menu', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
navToggle?.addEventListener('click', () => setMenu(!navMenu.classList.contains('show-menu')));
$('#nav-close')?.addEventListener('click', () => setMenu(false));
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('show-menu') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
});
$$('.nav__link').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/*==================== THEME ====================*/
const root = document.documentElement;
$('#theme-button')?.addEventListener('click', () => {
    const dark = root.classList.toggle('dark-theme');
    try { localStorage.setItem('selected-theme', dark ? 'dark' : 'light'); } catch (e) {}
});

/*==================== HEADER / SCROLL UP ====================*/
const header = $('#header');
const scrollUpBtn = $('#scroll-up');
let scrollTicking = false;
const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle('scroll-header', y > 12);
        scrollUpBtn.classList.toggle('show-scroll', y > 640);
        scrollTicking = false;
    });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/*==================== PAUSE OFF-SCREEN LOOPS ====================*/
// The morphing blobs, spinning ring and floating dots loop forever; only run them while visible.
const loopObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
}, { rootMargin: '100px 0px' });
$$('.portrait, .post-feature, .feat').forEach((el) => loopObserver.observe(el));

/*==================== ACTIVE NAV LINK ====================*/
const navLinks = new Map($$('.nav__link').map((a) => [a.getAttribute('href').slice(1), a]));
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('active-link'));
        navLinks.get(entry.target.id)?.classList.add('active-link');
    });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach((s) => sectionObserver.observe(s));

/*==================== REVEAL ON SCROLL ====================*/
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
    });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

// stagger siblings that reveal together
$$('[data-reveal]').forEach((el) => {
    const siblings = $$(':scope > [data-reveal]', el.parentElement);
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
    revealObserver.observe(el);
});

/*==================== EXPERIENCE TABS ====================*/
const tabs = $$('.tabs__btn');
const indicator = $('.tabs__indicator');

const moveIndicator = (tab) => {
    if (!indicator || !tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
};

const activateTab = (tab, focus = false) => {
    tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = $(t.dataset.target);
        if (panel) {
            panel.hidden = !on;
            panel.classList.toggle('is-active', on);
        }
    });
    moveIndicator(tab);
    if (focus) tab.focus();
};

tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        activateTab(next, true);
    });
});
const initIndicator = () => moveIndicator($('.tabs__btn.is-active'));
window.addEventListener('resize', initIndicator);
document.fonts?.ready.then(initIndicator);
initIndicator();

/*==================== FEATURED PROJECTS: EXPANDING CARDS ====================*/
const feat = $('#feat');
if (feat) {
    const cards = $$('.feat__card', feat);
    const wide = matchMedia('(min-width: 901px)');
    let active = 0;
    let hoverTimer;

    const setActive = (index) => {
        if (index === active && cards[index].classList.contains('is-active')) return;
        active = (index + cards.length) % cards.length;
        cards.forEach((card, i) => {
            const on = i === active;
            card.classList.toggle('is-active', on);
            card.setAttribute('aria-expanded', String(on));
            $$('a', card).forEach((a) => { a.tabIndex = on || !wide.matches ? 0 : -1; });
            // restart the progress bar
            const fill = $('.feat__fill', card);
            fill.style.animation = 'none';
            void fill.offsetWidth;
            fill.style.animation = '';
        });
    };

    cards.forEach((card, i) => {
        // advance to the next card when the progress bar completes
        $('.feat__fill', card).addEventListener('animationend', () => {
            if (wide.matches && i === active) setActive(active + 1);
        });
        card.addEventListener('click', () => { if (wide.matches) setActive(i); });
        card.addEventListener('mouseenter', () => {
            if (!wide.matches) return;
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => setActive(i), 120);
        });
        card.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
        card.addEventListener('keydown', (e) => {
            if (!wide.matches) return;
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target === card) { e.preventDefault(); setActive(i); }
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
                setActive(next);
                cards[next].focus();
            }
        });
    });

    // pause while the pointer or focus is inside, and only play while on screen
    feat.addEventListener('mouseenter', () => feat.classList.add('is-paused'));
    feat.addEventListener('mouseleave', () => feat.classList.remove('is-paused'));
    feat.addEventListener('focusin', () => feat.classList.add('is-paused'));
    feat.addEventListener('focusout', (e) => { if (!feat.contains(e.relatedTarget)) feat.classList.remove('is-paused'); });

    new IntersectionObserver(([entry]) => {
        feat.classList.toggle('is-playing', entry.isIntersecting && !reduceMotion);
    }, { threshold: 0.35 }).observe(feat);

    setActive(0);
}

/*==================== ABOUT: VIDEO + TILT ====================*/
const media = $('#about-media-wrapper');
const video = $('#about-video');
if (media && video) {
    const stop = () => {
        video.pause();
        video.currentTime = 0;
        media.classList.remove('is-playing');
    };
    media.addEventListener('click', () => {
        if (media.classList.contains('is-playing')) return stop();
        media.classList.add('is-playing');
        video.play().catch(stop);
    });
    video.addEventListener('ended', stop);

    if (!reduceMotion && matchMedia('(hover: hover)').matches) {
        media.addEventListener('mousemove', (e) => {
            const r = media.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            media.style.transition = 'transform .15s ease-out';
            media.style.transform = `perspective(900px) rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
        });
        media.addEventListener('mouseleave', () => {
            media.style.transition = '';
            media.style.transform = '';
        });

        // pop-cat cursor easter egg
        const cursors = ['../img/meme-pop-cat-cursor.png', '../img/meme-pop-cat-pointer.png']
            .map((src) => `url("assets/img/${src.split('/').pop()}") 32 32, pointer`);
        let frame = 0, timer, idle;
        media.addEventListener('mousemove', () => {
            if (!timer) timer = setInterval(() => { frame ^= 1; media.style.cursor = cursors[frame]; }, 150);
            clearTimeout(idle);
            idle = setTimeout(() => { clearInterval(timer); timer = null; frame = 0; media.style.cursor = cursors[0]; }, 80);
        });
    }
}

/*==================== SPLIT-FLAP BOARD (footer) ====================*/
// Hand-rolled split-flap board: each tile has two static halves and two hinged leaves.
// It starts flipping when it scrolls into view, and only makes sound while visible.
const initFlapboard = (board) => {
    const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'!?&-";
    const cols = Number(board.dataset.cols) || 8;
    const screens = board.dataset.lines.split(';').map((s) => s.split('|'));
    const rows = Math.max(...screens.map((s) => s.length));
    board.style.setProperty('--cols', cols);

    const face = (span, ch) => {
        span.textContent = ch === ' ' ? ' ' : ch;
        span.classList.toggle('is-dot', ch === '.');
    };
    const half = (cls) => {
        const d = document.createElement('span');
        d.className = `flap__half ${cls}`;
        const s = document.createElement('span');
        d.appendChild(s);
        return { el: d, span: s };
    };

    const tiles = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const el = document.createElement('span');
            el.className = 'flap';
            const sTop = half('flap__half--top');
            const sBot = half('flap__half--bottom');
            const lTop = half('flap__half--top flap__leaf flap__leaf--top');
            const lBot = half('flap__half--bottom flap__leaf flap__leaf--bottom');
            el.append(sTop.el, sBot.el, lTop.el, lBot.el);
            [sTop, sBot, lTop, lBot].forEach((h) => face(h.span, ' '));
            board.appendChild(el);
            tiles.push({ r, c, cur: ' ', sTop, sBot, lTop, lBot });
        }
    }

    let visible = false;
    // many tiles land at once: throttle the clicks into a soft clatter
    let lastClick = 0;
    const click = () => {
        if (!visible || document.hidden) return;
        const now = performance.now();
        if (now - lastClick < 28) return;
        lastClick = now;
        window.siteSound?.play('flap');
    };

    const flipOnce = async (t, next, dur) => {
        face(t.sTop.span, next);
        face(t.lTop.span, t.cur);
        face(t.lBot.span, next);
        await t.lTop.el.animate(
            [{ transform: 'rotateX(0deg)', filter: 'brightness(1)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.55)' }],
            { duration: dur * 0.5, easing: 'cubic-bezier(.55, 0, 1, .45)', fill: 'forwards' },
        ).finished;
        await t.lBot.el.animate(
            [{ transform: 'rotateX(90deg)', filter: 'brightness(1.5)' }, { transform: 'rotateX(0deg)', filter: 'brightness(1)' }],
            { duration: dur * 0.5, easing: 'cubic-bezier(0, .55, .45, 1)', fill: 'forwards' },
        ).finished;
        click();
        face(t.sBot.span, next);
        face(t.lTop.span, next);
        t.lTop.el.getAnimations().forEach((a) => a.cancel());
        t.lBot.el.getAnimations().forEach((a) => a.cancel());
        t.cur = next;
    };

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const spin = async (t, target, delay) => {
        if (t.cur === target) return;
        await wait(delay);
        const steps = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < steps; i++) {
            let ch;
            do { ch = CHARS[(Math.random() * CHARS.length) | 0]; } while (ch === target || ch === t.cur);
            await flipOnce(t, ch, 84);
        }
        await flipOnce(t, target, 150);
    };

    const textFor = (screen) => tiles.map((t) => ((screen[t.r] || '').padEnd(cols).slice(0, cols))[t.c].toUpperCase());
    const show = (i) => {
        const chars = textFor(screens[i]);
        if (reduceMotion) {
            tiles.forEach((t, k) => { [t.sTop, t.sBot, t.lTop, t.lBot].forEach((h) => face(h.span, chars[k])); t.cur = chars[k]; });
            return Promise.resolve();
        }
        return Promise.all(tiles.map((t, k) => spin(t, chars[k], t.c * 55 + t.r * 140)));
    };

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe(board);
    let idx = 0;
    const waitVisible = async () => { while (!visible || document.hidden) await wait(250); };
    (async () => {
        await waitVisible();            // first flip happens when the footer comes into view
        await show(idx);
        if (reduceMotion || screens.length < 2) return;
        for (;;) {
            await wait(idx === 0 ? 5200 : 3400);
            await waitVisible();
            idx = (idx + 1) % screens.length;
            await show(idx);
        }
    })();
};
$$('[data-flap]').forEach(initFlapboard);

/*==================== LOAD MORE (earlier work, certificates) ====================*/
const setupLoadMore = (grid, btn, itemSel, scrollTarget) => {
    if (!grid || !btn) return;
    const label = $('.more-btn__label', btn);
    const items = () => $$(itemSel, grid);
    const hidden = () => items().filter((w) => getComputedStyle(w).display === 'none');
    const sync = () => {
        const open = grid.classList.contains('is-expanded');
        const n = open ? 0 : hidden().length;
        btn.closest('.more-wrap').hidden = !open && n === 0;
        label.textContent = open ? 'Show less' : `Load more (${n})`;
    };
    btn.addEventListener('click', () => {
        const opening = !grid.classList.contains('is-expanded');
        if (opening) {
            const toShow = hidden();
            grid.classList.add('is-expanded');
            toShow.forEach((w, i) => {
                w.classList.add('is-in', 'is-revealed');
                w.style.setProperty('--wd', `${i * 0.07}s`);
            });
        } else {
            grid.classList.remove('is-expanded');
            items().forEach((w) => w.classList.remove('is-revealed'));
            scrollTarget?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
        btn.setAttribute('aria-expanded', String(opening));
        sync();
    });
    window.addEventListener('resize', sync);
    sync();
};
setupLoadMore($('#work-grid'), $('#work-more'), '.work', $('#earlier'));
setupLoadMore($('#cert-grid'), $('#cert-more'), '.cert', $('#certifications'));

/*==================== RECOMMENDATIONS: SHOW MORE ====================*/
$$('.rec').forEach((rec) => {
    const text = $('.rec__text', rec);
    const btn = $('.rec__more', rec);
    const collapsed = () => parseFloat(getComputedStyle(text).lineHeight) * 6;
    const measure = () => rec.classList.toggle('is-short', text.scrollHeight <= collapsed() + 4);
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    btn.addEventListener('click', () => {
        const open = !rec.classList.contains('is-open');
        text.style.maxHeight = open ? `${text.scrollHeight}px` : '';
        rec.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Show less' : 'Show more';
    });
});

/*==================== COPY EMAIL ====================*/
const copyBtn = $('#copy-email');
copyBtn?.addEventListener('click', async () => {
    const note = $('.cta__copied', copyBtn);
    try {
        await navigator.clipboard.writeText(copyBtn.dataset.email);
        note.textContent = 'Copied';
    } catch (e) {
        window.location.href = `mailto:${copyBtn.dataset.email}`;
    }
    setTimeout(() => { note.textContent = ''; }, 1800);
});

/*==================== NAME INTRO (first visit only) ====================*/
(() => {
    const op = $('[data-opener]');
    if (!op) return;
    let cleanup = null;
    const done = () => {
        cleanup?.();
        op.hidden = true;
        op.classList.remove('is-play', 'is-static');
        root.removeAttribute('data-intro');
        $$('[data-replay-intro]').forEach((b) => { b.hidden = false; });
    };
    const play = () => {
        cleanup?.();
        window.__opPlaying = true;
        try { localStorage.setItem('introSeen', '1'); } catch (e) {}
        op.classList.remove('is-play', 'is-static');
        op.hidden = false;
        void op.offsetWidth;
        op.classList.add(reduceMotion ? 'is-static' : 'is-play');
        const fade = reduceMotion ? op.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 1200, easing: 'ease', fill: 'forwards' }) : null;
        if (fade) fade.onfinish = done;
        const onKey = (e) => { if (e.key === 'Escape') done(); };
        const onEnd = (e) => { if (!reduceMotion && e.target === op) done(); };
        const timer = setTimeout(done, reduceMotion ? 1900 : 4300);
        document.addEventListener('keydown', onKey);
        op.addEventListener('animationend', onEnd);
        op.addEventListener('click', done);
        cleanup = () => {
            clearTimeout(timer);
            fade?.cancel();
            document.removeEventListener('keydown', onKey);
            op.removeEventListener('animationend', onEnd);
            op.removeEventListener('click', done);
            cleanup = null;
        };
    };
    const mode = root.getAttribute('data-intro');
    const url = new URL(location.href);
    if (url.searchParams.get('intro') === 'replay') {
        url.searchParams.delete('intro');
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    if (mode === 'play') {
        // short beat so fonts and the photo are ready before the first frame
        const fonts = document.fonts?.ready ?? Promise.resolve();
        Promise.all([new Promise((r) => setTimeout(r, 300)), Promise.race([fonts, new Promise((r) => setTimeout(r, 700))])]).then(play);
    } else {
        $$('[data-replay-intro]').forEach((b) => { b.hidden = false; });
        if (mode === 'skip') setTimeout(() => root.removeAttribute('data-intro'), 700);
    }
    $$('[data-replay-intro]').forEach((b) => b.addEventListener('click', () => { window.scrollTo(0, 0); play(); }));
})();

/*==================== YEAR ====================*/
const year = $('#year');
if (year) year.textContent = new Date().getFullYear();
