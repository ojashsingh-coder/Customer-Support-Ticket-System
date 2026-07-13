// effects.js
// Counter animations, enhanced bar growth, donut draw-in, sparkline trails
// Ojash Singh

'use strict';

/* ══════════════════════════════════════════════════
   1. COUNTER / NUMBER ROLL — 0 → target
══════════════════════════════════════════════════ */

/**
 * Animate a numeric text node from 0 to its displayed value.
 * Handles formats: "1,482" "4.2h" "4.7/5" "81.9%" "₹1,200"
 */
function odCountUp(el, duration) {
  if (!el || el._odCounted) return;
  el._odCounted = true;

  const raw   = el.textContent.trim();
  // Extract leading numeric part (including commas & decimals)
  const match = raw.match(/^([₹$€£]?)([0-9,]+(?:\.[0-9]*)?)(.*)$/);
  if (!match) return;

  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const target = parseFloat(numStr);
  if (isNaN(target) || target === 0) return;

  const decimals   = (numStr.includes('.')) ? (numStr.split('.')[1] || '').length : 0;
  const start      = performance.now();
  const dur        = duration || 1200;
  const hasCommas  = match[2].includes(',');

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function fmt(v) {
    let s = v.toFixed(decimals);
    if (hasCommas) {
      const parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = parts.join('.');
    }
    return prefix + s + suffix;
  }

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / dur, 1);
    const value = easeOutExpo(progress) * target;
    el.textContent = fmt(value);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = fmt(target); // ensure exact final value
  }

  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════════
   2. DONUT DRAW-IN — stroke-dasharray from 0
══════════════════════════════════════════════════ */

function odAnimateDonut(svgEl, delay) {
  if (!svgEl || svgEl._odDonut) return;
  svgEl._odDonut = true;

  const circles = svgEl.querySelectorAll('circle[stroke-dasharray]');
  circles.forEach((circle, i) => {
    const da = circle.getAttribute('stroke-dasharray');
    const parts = da.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (parts.length < 2) return;
    const [filled, empty] = parts;
    const total = filled + empty;

    // Start collapsed
    circle.setAttribute('stroke-dasharray', `0 ${total}`);

    setTimeout(() => {
      circle.style.transition = `stroke-dasharray ${700 + i * 120}ms cubic-bezier(.22,.68,0,1.2)`;
      circle.setAttribute('stroke-dasharray', `${filled} ${empty}`);
    }, (delay || 400) + i * 80);
  });
}

/* ══════════════════════════════════════════════════
   3. BAR CHART — glow trail on hover (additive only)
══════════════════════════════════════════════════ */

function odEnhanceBars() {
  document.querySelectorAll('.chart-bar-fill, .bar').forEach(bar => {
    if (bar._odGlow) return;
    bar._odGlow = true;

    bar.addEventListener('mouseenter', function () {
      this.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(124,58,237,.6))';
      this.style.transition = 'filter .15s ease';
    });
    bar.addEventListener('mouseleave', function () {
      this.style.filter = '';
    });
  });
}

/* ══════════════════════════════════════════════════
   4. PROGRESS BARS — shimmer pulse (additive only)
══════════════════════════════════════════════════ */

function odPulseProgress() {
  document.querySelectorAll('.progress-fill').forEach(fill => {
    if (fill._odPulse) return;
    fill._odPulse = true;

    const w = parseFloat(fill.style.width) || 0;
    if (w === 0) return;

    // Animate from 0 → target width
    fill.style.width = '0%';
    fill.style.transition = 'width 1.1s cubic-bezier(.22,.68,0,1.2)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = w + '%';
      });
    });
  });
}

/* ══════════════════════════════════════════════════
   5. INTERSECTION OBSERVER — trigger on viewport entry
══════════════════════════════════════════════════ */

const odObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    odObserver.unobserve(entry.target);

    const el = entry.target;

    // Stat values (big numbers in cards)
    el.querySelectorAll('.stat-value, .home-stat-value, .kpi-value, .metric-value').forEach(n => {
      odCountUp(n, 1300);
    });

    // Standalone numbers: any element explicitly tagged
    el.querySelectorAll('[data-count]').forEach(n => {
      odCountUp(n, 1200);
    });

    // Donut SVGs
    el.querySelectorAll('.donut-wrap svg').forEach(svg => {
      odAnimateDonut(svg, 300);
    });

    // Donut center numbers
    el.querySelectorAll('.donut-center [style*="font-size:1"]').forEach(n => {
      odCountUp(n, 1000);
    });

    // Progress bars
    odPulseProgress();

    // Bars
    odEnhanceBars();
  });
}, { threshold: 0.15 });

/* ══════════════════════════════════════════════════
   6. STAT CARDS — scan all pages
══════════════════════════════════════════════════ */

function odScanPage() {
  // Observe every stat card container
  document.querySelectorAll(
    '.stats-grid, .home-grid, .stat-card, .home-stat-card, ' +
    '.kpi-grid, .metrics-row, .billing-plan, .chart-card, ' +
    '.donut-wrap, .page-body'
  ).forEach(el => {
    if (!el._odObserved) {
      el._odObserved = true;
      odObserver.observe(el);
    }
  });

  // Also handle any numbers not inside observed containers
  document.querySelectorAll('.stat-value, .home-stat-value').forEach(n => {
    if (!n._odCounted) {
      const rect = n.getBoundingClientRect();
      if (rect.top < window.innerHeight) odCountUp(n, 1200);
    }
  });

  odEnhanceBars();
}

/* ══════════════════════════════════════════════════
   7. SPARKLINE HOVER TOOLTIP on bar charts
══════════════════════════════════════════════════ */

function odBarTooltip() {
  document.querySelectorAll('.chart-bar-col').forEach(col => {
    if (col._odTip) return;
    col._odTip = true;

    const fill  = col.querySelector('.chart-bar-fill');
    const label = col.querySelector('.chart-bar-label');
    const val   = col.querySelector('.chart-bar-val');
    if (!fill) return;

    let tip;
    col.addEventListener('mouseenter', function (e) {
      tip = document.createElement('div');
      tip.style.cssText = `
        position:fixed;z-index:9000;
        background:rgba(26,26,46,0.97);
        border:1px solid rgba(124,58,237,.4);
        border-radius:8px;padding:6px 11px;
        font-size:0.75rem;color:#f0f0ff;
        pointer-events:none;
        box-shadow:0 4px 16px rgba(0,0,0,.5);
        transform:translateX(-50%) translateY(-110%);
        white-space:nowrap;
        animation:odTipIn .15s ease;
      `;
      const labelText = label ? label.textContent : '';
      const valText   = val   ? val.textContent   : '';
      tip.innerHTML   = valText
        ? `<strong>${valText}</strong><span style="color:rgba(255,255,255,.5);margin-left:5px;">${labelText}</span>`
        : labelText;

      if (!document.getElementById('_odTipStyle')) {
        const s = document.createElement('style');
        s.id = '_odTipStyle';
        s.textContent = `@keyframes odTipIn { from { opacity:0;transform:translateX(-50%) translateY(-90%) } to { opacity:1;transform:translateX(-50%) translateY(-110%) } }`;
        document.head.appendChild(s);
      }

      document.body.appendChild(tip);
      moveTip(e);
    });

    col.addEventListener('mousemove', moveTip);
    col.addEventListener('mouseleave', function () {
      if (tip) { tip.remove(); tip = null; }
    });

    function moveTip(e) {
      if (!tip) return;
      tip.style.left = e.clientX + 'px';
      tip.style.top  = e.clientY + 'px';
    }
  });
}

/* ══════════════════════════════════════════════════
   8. INIT
══════════════════════════════════════════════════ */

function odEffectsInit() {
  odScanPage();
  odBarTooltip();

  // Re-scan after JS-rendered content (app.js populates some tables after load)
  setTimeout(() => {
    odScanPage();
    odBarTooltip();
  }, 800);

  // Watch for DOM changes (dynamically injected stat cards)
  const mo = new MutationObserver(() => {
    odScanPage();
    odBarTooltip();
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', odEffectsInit);
} else {
  odEffectsInit();
}