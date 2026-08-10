/* PRIDE INVESTS — landing page behaviour */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero slideshow engine (ambient background videos) ──
     Transition design: the incoming video starts PLAYING first, then
     dissolves in on top of the still-playing outgoing scene. The old
     slide never fades toward black underneath, so the cut reads as one
     continuous piece of film. */
  var slides = Array.prototype.slice.call(document.querySelectorAll('#heroSlides .slide'));
  var caption = document.getElementById('heroCaption');
  var rail = document.getElementById('heroRail');
  var current = 0;
  var DURATION = 3200;   // ~3s per scene, per the brief
  var FADE = 1100;       // matches the CSS dissolve duration
  var timer = null;
  var pending = [];      // in-flight transition timeouts, so a resync can cancel them

  function later(fn, ms) {
    var t = setTimeout(function () {
      pending.splice(pending.indexOf(t), 1);
      fn();
    }, ms);
    pending.push(t);
  }
  function clearPending() {
    pending.forEach(clearTimeout);
    pending = [];
  }

  function videoOf(i) { return slides[i].querySelector('video'); }

  function playVideo(i) {
    if (reducedMotion) return;
    var v = videoOf(i);
    if (v) { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }

  // build rail dots
  slides.forEach(function (_, i) {
    var d = document.createElement('span');
    d.className = 'rail-dot' + (i === 0 ? ' on' : '');
    d.addEventListener('click', function () { goTo(i, true); });
    rail.appendChild(d);
  });
  var dots = rail.children;

  function goTo(i, manual) {
    // Never start a dissolve while the tab is hidden. requestAnimationFrame does not
    // run in a background tab, so the incoming slide would never receive .is-active
    // while the outgoing one has already lost it — leaving the hero blank. On return,
    // syncToCurrent() puts everything back and restart() resumes the rotation.
    if (document.hidden) return;
    var next = i % slides.length;
    if (next === current) return;
    var prev = current;
    current = next;

    // 1. outgoing keeps playing, fully visible, one layer down
    slides[prev].classList.remove('is-active');
    slides[prev].classList.add('is-under');
    dots[prev].classList.remove('on');

    // 2. incoming is already rolling before a single pixel of it shows
    playVideo(next);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        slides[next].classList.add('is-active');
        dots[next].classList.add('on');
      });
    });

    // 3. once the dissolve completes, quietly retire the old scene
    later(function () {
      slides[prev].classList.remove('is-under');
      var v = videoOf(prev);
      if (v && prev !== current) v.pause();
    }, FADE + 150);

    caption.classList.add('fading');
    later(function () {
      caption.innerHTML = slides[current].getAttribute('data-caption');
      caption.classList.remove('fading');
    }, 450);

    if (manual) restart();
  }

  function restart() {
    clearInterval(timer);
    if (!reducedMotion) timer = setInterval(function () { goTo(current + 1); }, DURATION);
  }
  restart();

  /* ── Tab-switch resync ──
     Background tabs throttle timers and suspend video playback, so coming back can
     leave a half-finished dissolve or a frozen frame. Rather than trying to resume
     mid-transition, snap the slideshow to a known-good state built from `current`:
     exactly one slide active, nothing left under, one video rolling. */
  function syncToCurrent() {
    clearPending();
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === current);
      s.classList.remove('is-under');
      var v = s.querySelector('video');
      if (!v) return;
      if (i === current && !reducedMotion) {
        var p = v.play();                       // resumes where it left off, no reset
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('on', d === current);
    caption.classList.remove('fading');
    caption.innerHTML = slides[current].getAttribute('data-caption');
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(timer);
      clearPending();
    } else {
      syncToCurrent();
      restart();
    }
  });

  // Safari's back/forward cache restores the page without a visibilitychange
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { syncToCurrent(); restart(); }
  });

  /* ── Preloader → hero logo handoff ── */
  window.addEventListener('load', function () {
    var pre = document.getElementById('preloader');
    var mark = pre.querySelector('.preloader-mark');
    var hero = document.getElementById('hero');
    var heroMark = hero.querySelector('.hero-mark');

    // returning visitors this session skip straight to the live homepage
    // (the flag is written at first parse by the inline head script)
    if (reducedMotion || document.documentElement.classList.contains('skip-intro')) {
      pre.classList.add('done');
      hero.classList.add('ready');
      if (!reducedMotion) { playVideo(current); restart(); }
      return;
    }

    // step 2 — fill the outlines once drawing completes
    // the two towers finish rising (navy 1.15s, gray ends ~1.5s) before the ink fills
    setTimeout(function () { mark.classList.add('filled'); }, 1080);

    // step 3 + 4 — lift the curtain (background motion begins) and fly the mark home
    setTimeout(function () {
      var from = mark.getBoundingClientRect();
      var to = heroMark.getBoundingClientRect();
      var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
      var s = to.width / from.width;

      pre.classList.add('lift');
      mark.classList.add('in-flight');
      mark.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
      playVideo(current);          // the dusk clouds begin to drift as the curtain melts
      restart();                   // slot timer starts in sync with the first video
    }, 1350);

    // step 5 — seamless swap: reveal the real mark, retire the preloader
    setTimeout(function () {
      hero.classList.add('ready');
      pre.classList.add('done');
    }, 2120);
  });

  /* ── Navbar: solid on scroll ── */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('solid', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    // closest() rather than target.tagName: the contact pills wrap an icon and a
    // label, so the click often lands on the <svg> or <span> inside the anchor
    if (e.target.closest && e.target.closest('a')) {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Scroll reveals ── */
  var statement = document.querySelector('.statement');
  if (statement && !reducedMotion) {
    var wordIndex = 0;
    var splitWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (/^\s+$/.test(part) || part === '') {
              frag.appendChild(document.createTextNode(part));
            } else {
              var w = document.createElement('span');
              w.className = 'wd';
              w.textContent = part;
              w.style.transitionDelay = (wordIndex++ * 40) + 'ms';
              frag.appendChild(w);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          splitWords(child);
        }
      });
    };
    splitWords(statement);
  }

  ['.fact-row .fact', '.dest-row .dest'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.style.transitionDelay = (i * 130) + 'ms';
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
