/* PRIDE INVESTS — project pages behaviour (finder, rail form, lightbox) */
(function () {
  'use strict';

  /* nav: always solid on inner pages, burger works */
  var nav = document.getElementById('nav');
  if (nav) nav.classList.add('solid');
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', function (e) {
      // closest(): the contact pills wrap an icon + label, so the click target is
      // often the <svg> or <span> rather than the anchor itself
      if (e.target.closest && e.target.closest('a')) {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* scroll reveals */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ── Unit finder ── */
  var grid = document.getElementById('unitGrid');
  if (grid && window.PI_UNITS) {
    var F = {};
    ['fLoc','fType','fBeds','fSize','fSort','fFloor','fGarden','fTerr','fPrice'].forEach(function (id) {
      F[id] = document.getElementById(id);
    });
    var count = document.getElementById('finderCount');
    var empty = document.getElementById('finderEmpty');
    var revealBtn = document.getElementById('plansReveal');
    var moreBtn = document.getElementById('plansMore');
    var resetBtn = document.getElementById('fReset');

    /* the full list stays collapsed behind "Available floor plans" —
       136 open cards made the page endless */
    var BATCH = 12;
    var opened = !revealBtn;   // pages without the toggle behave as before
    var shown = BATCH;

    var fmtPrice = function (p) {
      return p ? 'US$ ' + p.toLocaleString('en-US') : 'Price on request';
    };

    /* small stroke icons, one per spec line */
    var ICO = {
      bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 18v2M21 18v2M6 9V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V9"/></svg>',
      floor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m4.6 12.4 7.4 4.1 7.4-4.1"/><path d="m4.6 15.9 7.4 4.1 7.4-4.1"/></svg>',
      leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20c0-8 4.5-13.5 14-15-1 9.5-6 14-11.5 14.5"/><path d="M5 20c2.8-4.4 6.6-7.6 10.5-9.5"/></svg>',
      sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></svg>'
    };

    var filtered = function () {
      var v = {};
      for (var k in F) v[k] = F[k] ? F[k].value : 'all';
      /* a grid can be locked to one project (e.g. the Louayzeh finder) */
      var lockLoc = grid.getAttribute('data-location');
      var list = window.PI_UNITS.filter(function (u) {
        if (lockLoc && u.location !== lockLoc) return false;
        if (v.fLoc !== 'all' && u.location !== v.fLoc) return false;
        if (v.fType !== 'all' && u.type !== v.fType) return false;
        if (v.fBeds !== 'all' && u.beds !== +v.fBeds) return false;
        if (v.fSize === 's1' && u.size >= 200) return false;
        if (v.fSize === 's2' && (u.size < 200 || u.size >= 300)) return false;
        if (v.fSize === 's3' && (u.size < 300 || u.size >= 400)) return false;
        if (v.fSize === 's4' && u.size < 400) return false;
        if (v.fFloor !== 'all') {
          var multi = u.floor.indexOf('+') > -1 || u.floor.indexOf('to Roof') > -1;
          if (v.fFloor === 'multi') { if (!multi) return false; }
          else if (multi || u.floor !== v.fFloor + ' Floor') return false;
        }
        if (v.fGarden === 'yes' && !u.garden) return false;
        if (v.fGarden === 'no' && u.garden) return false;
        if (v.fTerr === 'yes' && !u.terrace) return false;
        if (v.fTerr === 'no' && u.terrace) return false;
        if (v.fPrice === 'r1' && !(u.price && u.price <= 2000000)) return false;
        if (v.fPrice === 'r2' && !(u.price && u.price > 2000000 && u.price <= 3000000)) return false;
        if (v.fPrice === 'r3' && !(u.price && u.price > 3000000)) return false;
        if (v.fPrice === 'req' && u.price) return false;
        return true;
      });
      var by = {
        'size-asc': function (a, b) { return a.size - b.size; },
        'size-desc': function (a, b) { return b.size - a.size; },
        'price-asc': function (a, b) { return (a.price || 9e9) - (b.price || 9e9); },
        'price-desc': function (a, b) { return (b.price || 0) - (a.price || 0); }
      }[v.fSort];
      if (by) list.sort(by);
      return list;
    };

    var card = function (u, i) {
      var feats = [
        '<li>' + ICO.bed + '<span><b>' + u.beds + '</b> master bedrooms</span></li>',
        '<li>' + ICO.floor + '<span>' + u.floor + '</span></li>'
      ];
      if (u.garden) feats.push('<li>' + ICO.leaf + '<span>Garden · <b>' + u.garden + ' m²</b></span></li>');
      if (u.terrace) feats.push('<li>' + ICO.sun + '<span>Terrace · <b>' + u.terrace + ' m²</b></span></li>');
      return '<article class="ucard" style="animation-delay:' + Math.min(i * 35, 500) + 'ms">' +
        '<div class="ucard-head"><span class="ucard-proj">' + u.project + '</span>' +
        '<span class="ucard-type">' + u.type + '</span></div>' +
        '<div class="ucard-title"><h4>' + u.name + '</h4>' +
        '<span class="ucard-size">' + u.size + ' m²</span></div>' +
        '<ul class="ucard-feat">' + feats.join('') + '</ul>' +
        '<div class="ucard-foot"><span class="ucard-price">' + fmtPrice(u.price) + '</span>' +
        '<a class="ucard-link" href="' + u.url + '">View residence</a></div></article>';
    };

    var render = function () {
      var list = filtered();
      count.textContent = list.length + ' home' + (list.length === 1 ? '' : 's') + ' available';
      if (revealBtn) {
        revealBtn.querySelector('span').textContent = 'Available floor plans · ' + list.length;
      }
      if (!opened) {
        grid.innerHTML = '';
        empty.style.display = 'none';
        if (moreBtn) moreBtn.hidden = true;
        return;
      }
      empty.style.display = list.length ? 'none' : 'block';
      grid.innerHTML = list.slice(0, shown).map(card).join('');
      if (moreBtn) {
        moreBtn.hidden = list.length <= shown;
        if (!moreBtn.hidden) {
          moreBtn.textContent = 'Show more homes · ' + (list.length - shown) + ' remaining';
        }
      }
    };

    if (revealBtn) {
      revealBtn.addEventListener('click', function () {
        opened = true;
        shown = BATCH;
        revealBtn.setAttribute('aria-expanded', 'true');
        revealBtn.hidden = true;
        render();
      });
    }
    if (moreBtn) {
      moreBtn.addEventListener('click', function () { shown += BATCH; render(); });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        for (var k in F) { if (F[k]) F[k].selectedIndex = 0; }
        shown = BATCH;
        render();
      });
    }
    for (var k in F) {
      if (F[k]) F[k].addEventListener('change', function () { shown = BATCH; render(); });
    }
    render();
  }

  /* ── Floor-plan disclosures on project pages ── */
  document.querySelectorAll('.plans-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.closest('.plans').classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });

  /* ── Gallery room tabs: one room strip visible at a time ── */
  var roomTabs = document.getElementById('roomTabs');
  if (roomTabs) {
    var rBtns = roomTabs.querySelectorAll('button');
    rBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        rBtns.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        document.querySelectorAll('.room-group').forEach(function (g) {
          g.classList.toggle('on', g.id === 'room-' + b.getAttribute('data-room'));
        });
      });
    });
  }

  /* ── Embedded 360° walkthrough: tabs swap the iframe source ── */
  var walkTabs = document.getElementById('walkTabs');
  var walkFrame = document.getElementById('walkFrame');
  var walkExt = document.getElementById('walkExt');
  if (walkTabs && walkFrame) {
    walkTabs.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        walkTabs.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var src = b.getAttribute('data-src');
        walkFrame.src = src;
        if (walkExt) walkExt.href = src;
      });
    });
  }

  /* ── FAQ accordion ── */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
      q.setAttribute('aria-expanded', open);
    });
  });
  // the first answer starts open, so visitors instantly see how it works
  if (faqItems.length) {
    var f0 = faqItems[0];
    f0.classList.add('open');
    f0.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
    f0.querySelector('.faq-a').style.maxHeight = 'none';
  }

  /* ── Gallery slider: auto-advances, fully manual too ── */
  var slider = document.getElementById('gallerySlider');
  if (slider) {
    var items = Array.prototype.slice.call(slider.querySelectorAll('.sl-item'));
    var dotsWrap = slider.querySelector('.sl-dots');
    var cap = slider.querySelector('.sl-caption');
    var idx = 0, sTimer = null;

    items.forEach(function (_, i) {
      var b = document.createElement('button');
      b.className = 'sl-dot' + (i === 0 ? ' on' : '');
      b.setAttribute('aria-label', 'Image ' + (i + 1));
      b.addEventListener('click', function () { show(i); rest(); });
      dotsWrap.appendChild(b);
    });
    var sDots = dotsWrap.children;
    cap.textContent = items[0].getAttribute('data-cap') || '';

    function show(i) {
      items[idx].classList.remove('on');
      sDots[idx].classList.remove('on');
      idx = (i + items.length) % items.length;
      items[idx].classList.add('on');
      sDots[idx].classList.add('on');
      cap.textContent = items[idx].getAttribute('data-cap') || '';
    }
    function rest() { // manual interaction restarts the clock
      clearInterval(sTimer);
      sTimer = setInterval(function () { show(idx + 1); }, 4500);
    }
    slider.querySelector('.sl-prev').addEventListener('click', function () { show(idx - 1); rest(); });
    slider.querySelector('.sl-next').addEventListener('click', function () { show(idx + 1); rest(); });
    slider.addEventListener('mouseenter', function () { clearInterval(sTimer); });
    slider.addEventListener('mouseleave', rest);

    // click the image → open full size in the lightbox (as a single view)
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        var lbx = document.getElementById('lightbox');
        if (!lbx) return;
        lbx.querySelector('img').src = it.getAttribute('data-full');
        var dl = lbx.querySelector('.lb-dl');
        if (dl) dl.href = it.getAttribute('data-full');
        var c = lbx.querySelector('.lb-count');
        if (c) c.textContent = '';
        lbx.classList.remove('has-group');
        lbx.classList.add('open');
      });
    });

    // touch swipe
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { show(idx + (dx < 0 ? 1 : -1)); rest(); }
      x0 = null;
    }, { passive: true });

    rest();
  }

  /* ── Floor strips: arrow paging + mouse drag ── */
  document.querySelectorAll('.strip-wrap').forEach(function (wrap) {
    var strip = wrap.querySelector('.int-strip');
    var step = function () { return Math.max(strip.clientWidth * 0.8, 280); };
    var prev = wrap.querySelector('.st-prev'), next = wrap.querySelector('.st-next');
    if (prev) prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: 'smooth' }); });
    // desktop drag-to-scroll
    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener('mousedown', function (e) {
      down = true; moved = false; startX = e.pageX; startL = strip.scrollLeft;
      strip.style.cursor = 'grabbing'; e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 5) moved = true;
      strip.scrollLeft = startL - dx;
    });
    window.addEventListener('mouseup', function () { down = false; strip.style.cursor = ''; });
    // a drag shouldn't fire the lightbox
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ── Quick-nav scroll spy ── */
  var qn = document.querySelector('.quick-nav');
  if (qn) {
    var qLinks = Array.prototype.slice.call(qn.querySelectorAll('a[href^="#"]'));
    var qTargets = qLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var spy = function () {
      var pos = window.scrollY + 150;
      var current = -1;
      qTargets.forEach(function (t, i) { if (t && t.offsetTop <= pos) current = i; });
      qLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* ── Back to top ── */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ── Contact rail form (front-end only for now) ── */
  document.querySelectorAll('.rail-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      var ok = form.parentElement.querySelector('.rail-success');
      if (ok) ok.style.display = 'block';
    });
  });

  /* ── Lightbox: single images + swipeable groups (floor plans, interiors) ── */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbDl = lb.querySelector('.lb-dl');
    var lbCount = lb.querySelector('.lb-count');
    var lbCap = lb.querySelector('.lb-cap');
    var lbGroup = [], lbIdx = 0, lbCaps = [];

    function lbShow(i) {
      lbIdx = (i + lbGroup.length) % lbGroup.length;
      var src = lbGroup[lbIdx];
      lbImg.src = src;
      if (lbDl) lbDl.href = src;
      if (lbCount) lbCount.textContent = lbGroup.length > 1 ? (lbIdx + 1) + ' / ' + lbGroup.length : '';
      if (lbCap) lbCap.textContent = lbCaps[lbIdx] || '';
    }
    function lbOpen(group, start, caps) {
      lbGroup = group; lbCaps = caps || []; lbShow(start);
      lb.classList.toggle('has-group', group.length > 1);
      lb.classList.add('open');
    }

    // solo items keep the old attribute…
    document.querySelectorAll('[data-lightbox]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        lbOpen([a.getAttribute('href')], 0, [a.getAttribute('data-cap') || '']);
      });
    });
    // …grouped items (data-group) navigate as a set
    var groups = {};
    document.querySelectorAll('[data-group]').forEach(function (a) {
      var g = a.getAttribute('data-group');
      (groups[g] = groups[g] || []).push(a);
    });
    Object.keys(groups).forEach(function (g) {
      var srcs = groups[g].map(function (a) { return a.getAttribute('href'); });
      var caps = groups[g].map(function (a) { return a.getAttribute('data-cap') || ''; });
      groups[g].forEach(function (a, i) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          lbOpen(srcs, i, caps);
        });
      });
    });

    var prevB = lb.querySelector('.lb-prev'), nextB = lb.querySelector('.lb-next');
    if (prevB) prevB.addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIdx - 1); });
    if (nextB) nextB.addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIdx + 1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-close')) lb.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (lbGroup.length > 1 && e.key === 'ArrowLeft') lbShow(lbIdx - 1);
      if (lbGroup.length > 1 && e.key === 'ArrowRight') lbShow(lbIdx + 1);
    });
    // swipe between images on touch
    var lx0 = null;
    lb.addEventListener('touchstart', function (e) { lx0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (lx0 === null || lbGroup.length < 2) { lx0 = null; return; }
      var dx = e.changedTouches[0].clientX - lx0;
      if (Math.abs(dx) > 40) lbShow(lbIdx + (dx < 0 ? 1 : -1));
      lx0 = null;
    }, { passive: true });
  }
})();
