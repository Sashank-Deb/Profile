/*==================== UI SOUNDS ====================
   Tiny synthesised sounds (Web Audio, no audio files).
   - window.siteSound.play(name)   name: tick | soft | toggle-on | toggle-off | whoosh | freeze | unfreeze | bang | chime
   - A sound on/off button (#sound-button) persists the choice in localStorage.
   - Subtle click sounds are attached to buttons and links across the site.
=====================================================*/
(() => {
    const KEY = 'site-sound';
    let enabled = true;
    try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (e) {}

    let ctx = null;
    let master = null;
    const audio = () => {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    };

    const tone = (c, { type = 'sine', from, to = from, dur = 0.06, vol = 0.05, at = 0 }) => {
        const t = c.currentTime + at;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(from, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + dur + 0.02);
    };

    const noise = (c, { dur = 0.2, vol = 0.2, at = 0, filter = 'lowpass', f0 = 2000, f1 = 200, q = 0.7 }) => {
        const t = c.currentTime + at;
        const len = Math.ceil(c.sampleRate * dur);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const bq = c.createBiquadFilter();
        bq.type = filter;
        bq.Q.value = q;
        bq.frequency.setValueAtTime(f0, t);
        bq.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        const g = c.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bq).connect(g).connect(master);
        src.start(t);
        src.stop(t + dur + 0.02);
    };

    const sounds = {
        // low, rounded "thock": a short sine drop plus a hint of muffled body
        tick: (c) => {
            tone(c, { type: 'sine', from: 380, to: 210, dur: 0.07, vol: 0.05 });
            noise(c, { dur: 0.03, vol: 0.025, f0: 900, f1: 300 });
        },
        soft: (c) => {
            tone(c, { type: 'sine', from: 300, to: 170, dur: 0.09, vol: 0.05 });
            noise(c, { dur: 0.035, vol: 0.02, f0: 700, f1: 250 });
        },
        'toggle-on': (c) => { tone(c, { from: 620, dur: 0.06, vol: 0.04 }); tone(c, { from: 930, dur: 0.08, vol: 0.04, at: 0.06 }); },
        'toggle-off': (c) => { tone(c, { from: 930, dur: 0.06, vol: 0.04 }); tone(c, { from: 620, dur: 0.08, vol: 0.04, at: 0.06 }); },
        whoosh: (c) => noise(c, { dur: 0.22, vol: 0.12, filter: 'bandpass', f0: 600, f1: 3200, q: 1.2 }),
        freeze: (c) => {
            tone(c, { type: 'sine', from: 1800, to: 1200, dur: 0.18, vol: 0.05 });
            tone(c, { type: 'sine', from: 2400, to: 1600, dur: 0.22, vol: 0.03, at: 0.04 });
            noise(c, { dur: 0.12, vol: 0.04, filter: 'highpass', f0: 5000, f1: 7000 });
        },
        unfreeze: (c) => tone(c, { type: 'triangle', from: 500, to: 900, dur: 0.12, vol: 0.045 }),
        bang: (c) => {
            tone(c, { type: 'sine', from: 140, to: 40, dur: 0.45, vol: 0.5 });          // thump
            noise(c, { dur: 0.5, vol: 0.55, f0: 4000, f1: 120 });                         // blast
            for (let i = 0; i < 26; i++) {                                                 // crackle
                noise(c, { dur: 0.03 + Math.random() * 0.03, vol: 0.06 + Math.random() * 0.12, at: 0.12 + Math.random() * 0.9, filter: 'bandpass', f0: 2000 + Math.random() * 5000, f1: 1500, q: 2 });
            }
        },
        chime: (c) => [784, 988, 1175, 1568].forEach((f, i) => tone(c, { type: 'sine', from: f, dur: 0.35, vol: 0.035, at: 0.25 + i * 0.07 })),
    };

    const play = (name) => {
        if (!enabled || !sounds[name]) return;
        const c = audio();
        if (c) sounds[name](c);
    };

    /* ---------- on/off button ---------- */
    const btn = document.getElementById('sound-button');
    const sync = () => {
        if (!btn) return;
        btn.classList.toggle('is-muted', !enabled);
        btn.setAttribute('aria-pressed', String(enabled));
        btn.setAttribute('aria-label', enabled ? 'Turn sound effects off' : 'Turn sound effects on');
        btn.title = enabled ? 'Sound on' : 'Sound off';
    };
    btn?.addEventListener('click', () => {
        enabled = !enabled;
        try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {}
        if (enabled) { audio(); sounds['toggle-on'](ctx); }
        sync();
    });
    sync();

    /* ---------- subtle click sounds across the site ---------- */
    const SOFT = '.tabs__btn, .more-btn, .rec__more, #theme-button, .nav__toggle, .nav__close, .feat__card';
    const TICK = '.button, .pill, .nav__link, .link-arrow, .count-chip, .hero__social a, .footer__socials a, .footer__links a, .cert, .work, .post, .post-feature, .blog-banner, .cta__link, .cta__copy, .rec__link, .scrollup, .footer__replay';
    document.addEventListener('click', (e) => {
        const t = e.target.closest?.(`${SOFT}, ${TICK}`);
        if (!t || t.id === 'sound-button' || t.closest('.dc, .dc-ctrl')) return;
        play(t.matches(SOFT) ? 'soft' : 'tick');
    }, true);

    window.siteSound = { play, get enabled() { return enabled; } };
})();
