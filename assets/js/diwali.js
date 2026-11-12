/*==================== DIWALI EASTER EGG 🧨 ====================
   A firecracker drifts around the page and dodges the cursor.
   Hit the pause button (bottom-left) to freeze it, then click it:
   it bursts into sparks, wishes "Happy Diwali" for a second and never returns.
   Self-removes after 20 November 2026 (IST). Delete this file + its <script> tag any time.
==================================================================*/
(() => {
    const END = new Date('2026-11-21T00:00:00+05:30');
    const KEY = 'diwali-cracker-2026';
    if (Date.now() >= END.getTime()) return;
    try { if (localStorage.getItem(KEY) === 'done') return; } catch (e) { /* storage blocked: still play */ }

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = matchMedia('(hover: none)').matches;
    const SIZE = 46;

    const style = document.createElement('style');
    style.textContent = `
.dc{position:fixed;left:0;top:0;z-index:250;width:${SIZE}px;height:${SIZE}px;display:grid;place-items:center;
  font-size:30px;line-height:1;border:0;padding:0;background:none;cursor:pointer;user-select:none;-webkit-user-select:none;
  will-change:transform;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));touch-action:none}
.dc__e{display:block;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.dc::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px dashed #E3BF5F;opacity:0;transform:scale(.6);
  transition:opacity .3s,transform .5s cubic-bezier(.16,1,.3,1)}
.dc.is-paused::before{opacity:1;transform:scale(1);animation:dc-spin 6s linear infinite}
.dc.is-paused .dc__e{transform:scale(1.15)}
.dc:not(.is-paused) .dc__e{animation:dc-wobble 1.2s ease-in-out infinite}
.dc__tip{position:fixed;z-index:251;padding:7px 12px;border-radius:999px;background:#0B0B0B;color:#F3F1EC;
  font:600 12px/1 'DM Sans',system-ui,sans-serif;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(6px);
  transition:opacity .3s,transform .5s cubic-bezier(.16,1,.3,1);box-shadow:0 10px 24px -10px rgba(0,0,0,.6)}
.dc__tip.is-on{opacity:1;transform:none}
.dc__tip kbd{font:700 11px 'Space Mono',monospace;padding:2px 6px;margin:0 2px;border-radius:5px;background:#E3BF5F;color:#1C1A1B}
.dc-ctrl{position:fixed;left:20px;bottom:20px;z-index:252;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 14px 0 10px;
  border:0;border-radius:999px;background:#0B0B0B;color:#F3F1EC;font:600 13px/1 'DM Sans',system-ui,sans-serif;cursor:pointer;
  box-shadow:0 10px 26px -12px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.08);opacity:0;transform:translateY(12px) scale(.9);
  transition:opacity .4s,transform .6s cubic-bezier(.16,1,.3,1),background-color .3s}
.dc-ctrl.is-on{opacity:1;transform:none}
.dc-ctrl:hover{background:#1f1d1e}
.dc-ctrl__e{font-size:18px}
.dc-ctrl__i{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#E3BF5F;color:#1C1A1B}
.dc-ctrl__i svg{width:12px;height:12px;fill:currentColor}
.dc-ctrl.is-paused .dc-ctrl__i{background:#A3393A;color:#F3F1EC}
.dc-ctrl.is-nudge{animation:dc-nudge .7s cubic-bezier(.16,1,.3,1) 2}
@keyframes dc-nudge{40%{transform:translateY(-6px) scale(1.06)}}
@media (max-width:900px){.dc-ctrl{bottom:calc(72px + 14px);left:14px}}
.dc-canvas{position:fixed;inset:0;z-index:260;pointer-events:none}
.dc-wish{position:fixed;z-index:261;pointer-events:none;transform:translate(-50%,-50%);text-align:center;
  font:800 clamp(28px,5vw,56px)/1 'Jost',system-ui,sans-serif;letter-spacing:-.03em;color:#E3BF5F;
  text-shadow:0 2px 0 #A3393A,0 10px 30px rgba(0,0,0,.45);animation:dc-wish 1s cubic-bezier(.16,1,.3,1) both;white-space:nowrap}
@keyframes dc-wish{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}
  30%{transform:translate(-50%,-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
@keyframes dc-wobble{50%{transform:rotate(-12deg) translateY(-2px)}}
@keyframes dc-spin{to{rotate:360deg}}`;
    document.head.appendChild(style);

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'dc';
    el.setAttribute('aria-label', 'A Diwali firecracker. Use the pause button to freeze it, then click it.');
    el.innerHTML = '<span class="dc__e" aria-hidden="true">🧨</span>';

    const PAUSE = '<svg viewBox="0 0 12 12"><rect x="2" y="1.5" width="3" height="9" rx="1"/><rect x="7" y="1.5" width="3" height="9" rx="1"/></svg>';
    const PLAY = '<svg viewBox="0 0 12 12"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z"/></svg>';
    const ctrl = document.createElement('button');
    ctrl.type = 'button';
    ctrl.className = 'dc-ctrl';
    const sfx = (n) => window.siteSound?.play(n);

    const tip = document.createElement('div');
    tip.className = 'dc__tip';
    tip.setAttribute('aria-hidden', 'true');

    let x = 0, y = 0, vx = 0, vy = 0;
    let px = -999, py = -999;
    let paused = false, gone = false, raf = 0, dodges = 0, tipTimer = 0;
    const base = reduce ? 0.45 : 1.3;

    const vw = () => document.documentElement.clientWidth;
    const vh = () => window.innerHeight;
    const bottomInset = () => (matchMedia('(max-width: 900px)').matches ? 76 : 0); // mobile bottom bar

    const say = (html, ms = 2200) => {
        tip.innerHTML = html;
        const tx = Math.min(Math.max(8, x + SIZE / 2 - 80), vw() - 200);
        const ty = y > 70 ? y - 40 : y + SIZE + 10;
        tip.style.left = `${tx}px`;
        tip.style.top = `${ty}px`;
        tip.classList.add('is-on');
        clearTimeout(tipTimer);
        tipTimer = setTimeout(() => tip.classList.remove('is-on'), ms);
    };
    const syncCtrl = () => {
        ctrl.classList.toggle('is-paused', paused);
        ctrl.setAttribute('aria-pressed', String(paused));
        ctrl.setAttribute('aria-label', paused ? 'Let the firecracker move again' : 'Freeze the firecracker');
        ctrl.innerHTML = `<span class="dc-ctrl__e" aria-hidden="true">🧨</span><span class="dc-ctrl__i" aria-hidden="true">${paused ? PLAY : PAUSE}</span><span>${paused ? 'Play' : 'Pause'}</span>`;
    };
    const hint = () => {
        say('Too quick? Hit <kbd>❚❚ Pause</kbd> bottom-left');
        ctrl.classList.remove('is-nudge'); void ctrl.offsetWidth; ctrl.classList.add('is-nudge');
    };

    const place = () => { el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(vx * 3).toFixed(1)}deg)`; };

    const tick = () => {
        raf = requestAnimationFrame(tick);
        if (paused || gone) return;
        const cx = x + SIZE / 2, cy = y + SIZE / 2;
        const dx = cx - px, dy = cy - py;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = touch ? 110 : 150;
        if (dist < reach) {
            const push = (1 - dist / reach) * (reduce ? 0.6 : 2.2);
            vx += (dx / dist) * push;
            vy += (dy / dist) * push;
        }
        // gentle wander
        vx += (Math.random() - 0.5) * 0.08;
        vy += (Math.random() - 0.5) * 0.08;
        const sp = Math.hypot(vx, vy) || 1;
        const max = reduce ? 3 : 11;
        if (sp > max) { vx = (vx / sp) * max; vy = (vy / sp) * max; }
        if (sp > base) { vx *= 0.97; vy *= 0.97; } else { vx = (vx / sp) * base; vy = (vy / sp) * base; }
        x += vx; y += vy;
        const maxX = vw() - SIZE - 4, maxY = vh() - SIZE - 4 - bottomInset();
        if (x < 4) { x = 4; vx = Math.abs(vx); }
        if (x > maxX) { x = maxX; vx = -Math.abs(vx); }
        if (y < 4) { y = 4; vy = Math.abs(vy); }
        if (y > maxY) { y = maxY; vy = -Math.abs(vy); }
        place();
    };

    const setPaused = (p) => {
        if (gone) return;
        paused = p;
        el.classList.toggle('is-paused', p);
        syncCtrl();
        sfx(p ? 'freeze' : 'unfreeze');
        if (p) say(touch ? 'Frozen! Now <b>tap</b> it 🪔' : 'Frozen! Now <b>click</b> it 🪔', 2600);
        else tip.classList.remove('is-on');
    };

    let lastWhoosh = 0;
    const dodge = () => {
        dodges += 1;
        if (performance.now() - lastWhoosh > 350) { lastWhoosh = performance.now(); sfx('whoosh'); }
        const a = Math.random() * Math.PI * 2;
        vx = Math.cos(a) * 12; vy = Math.sin(a) * 12;
        if (dodges === 2 || dodges % 5 === 0) hint();
    };

    /* ---------- the burst ---------- */
    const explode = () => {
        gone = true;
        cancelAnimationFrame(raf);
        try { localStorage.setItem(KEY, 'done'); } catch (e) {}
        const ox = x + SIZE / 2, oy = y + SIZE / 2;
        el.remove(); tip.remove(); ctrl.remove();
        sfx('bang'); sfx('chime');

        const canvas = document.createElement('canvas');
        canvas.className = 'dc-canvas';
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = vw() * dpr; canvas.height = vh() * dpr;
        canvas.style.width = `${vw()}px`; canvas.style.height = `${vh()}px`;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const colors = ['#E3BF5F', '#FFD166', '#FF8A3D', '#A3393A', '#E5484D', '#F3F1EC', '#3BA55C', '#7FB3FF'];
        const parts = [];
        const n = reduce ? 60 : 170;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = (reduce ? 2 : 4) + Math.random() * (reduce ? 4 : 10);
            parts.push({
                x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
                life: 0, max: 55 + Math.random() * 45,
                c: colors[(Math.random() * colors.length) | 0],
                w: 4 + Math.random() * 6, h: 2 + Math.random() * 4,
                r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
                spark: Math.random() < 0.35,
            });
        }
        let flash = 1;
        const draw = () => {
            ctx.clearRect(0, 0, vw(), vh());
            if (flash > 0) { // the bang
                const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 140 * flash + 20);
                g.addColorStop(0, `rgba(255, 220, 140, ${0.85 * flash})`);
                g.addColorStop(1, 'rgba(255, 140, 60, 0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(ox, oy, 160, 0, Math.PI * 2); ctx.fill();
                flash -= 0.08;
            }
            let alive = 0;
            for (const p of parts) {
                if (p.life > p.max) continue;
                alive++;
                p.life++;
                p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.16;
                p.x += p.vx; p.y += p.vy; p.r += p.vr;
                const fade = 1 - p.life / p.max;
                ctx.globalAlpha = Math.max(0, fade);
                if (p.spark) {
                    ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.lineCap = 'round';
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke();
                } else {
                    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
                    ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            }
            ctx.globalAlpha = 1;
            if (alive) requestAnimationFrame(draw); else canvas.remove();
        };
        requestAnimationFrame(draw);

        const wish = document.createElement('div');
        wish.className = 'dc-wish';
        wish.setAttribute('role', 'status');
        wish.textContent = 'Happy Diwali 🪔';
        wish.style.left = `${Math.min(Math.max(ox, 170), vw() - 170)}px`;
        wish.style.top = `${Math.min(Math.max(oy, 60), vh() - 60)}px`;
        document.body.appendChild(wish);
        setTimeout(() => wish.remove(), 1000);

        window.removeEventListener('pointermove', onMove);
    };

    /* ---------- input ---------- */
    const onMove = (e) => { px = e.clientX; py = e.clientY; };
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (paused) explode(); else dodge();
    });
    el.addEventListener('pointerenter', () => { if (!paused && !touch) dodge(); });

    ctrl.addEventListener('click', () => setPaused(!paused));
    // a finger landing near it should also make it flee
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { px = e.clientX; py = e.clientY; } }, { passive: true });

    const start = () => {
        x = Math.random() * (vw() - SIZE - 40) + 20;
        y = Math.random() * (vh() * 0.6) + vh() * 0.15;
        const a = Math.random() * Math.PI * 2;
        vx = Math.cos(a) * base; vy = Math.sin(a) * base;
        place();
        syncCtrl();
        document.body.append(el, tip, ctrl);
        requestAnimationFrame(() => ctrl.classList.add('is-on'));
        window.addEventListener('pointermove', onMove, { passive: true });
        raf = requestAnimationFrame(tick);
    };

    // wait until the name intro has finished
    const wait = () => {
        if (document.documentElement.getAttribute('data-intro') === 'play') setTimeout(wait, 400);
        else setTimeout(start, 1200);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait); else wait();
})();
