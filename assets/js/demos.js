/*
 * Product mockup choreography.
 *
 * Each demo is a script of beats (wait, move the cursor, press, change state).
 * A demo plays only while it is on screen. With reduced motion it shows its
 * poster frame: the payoff, with the result left on screen.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STOP = {};

  // ─── Fit each fixed-size stage to its column ───────────────────────
  function fit(frame) {
    var stage = frame.querySelector('.stage');
    var W = +frame.dataset.w, H = +frame.dataset.h;
    var min = +(frame.dataset.minScale || 0);
    var avail = frame.clientWidth;
    // A window demo gets its own compact design in a phone column, not a squeeze
    var compact = !!frame.dataset.cw && avail < W * 0.8;
    stage.classList.toggle('is-compact', compact);
    if (compact) { W = +frame.dataset.cw; H = +frame.dataset.ch; min = 0; }
    var s = Math.min(1, avail / W);
    if (min && s < min) s = min; // below this, crop the sides instead of shrinking type further
    stage.style.width = W + 'px';
    stage.style.height = H + 'px';
    var left = (avail - W * s) / 2; // centred; negative means both sides are cropped
    stage.style.transform = 'translate(' + left + 'px, 0) scale(' + s + ')';
    stage.dataset.scale = s;
    frame.style.height = Math.round(H * s) + 'px';
  }
  var frames = Array.prototype.slice.call(document.querySelectorAll('.stage-frame'));
  frames.forEach(fit);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
    frames.forEach(function (f) { ro.observe(f); });
  } else {
    window.addEventListener('resize', function () { frames.forEach(fit); });
  }

  // ─── Helpers ───────────────────────────────────────────────────────
  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  // Centre of an element in the stage's own (unscaled) coordinates
  function centre(stage, el) {
    var s = +stage.dataset.scale || 1;
    var a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return { x: (a.left - b.left + a.width / 2) / s, y: (a.top - b.top + a.height / 2) / s };
  }

  // Run a number from a to b, writing it with fmt; resolves when done
  function tween(t, ms, from, to, each) {
    return new Promise(function (resolve, reject) {
      var start = performance.now();
      function frame(now) {
        if (t.gen !== t.stage._gen) return reject(STOP);
        var k = Math.min(1, (now - start) / ms);
        each(from + (to - from) * k, k);
        if (k < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function toolkit(stage) {
    var gen = stage._gen;
    var cursor = $(stage, '.cursor');
    var touch = $(stage, '.touch');
    var t = {
      stage: stage,
      gen: gen,
      wait: function (ms) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () { stage._gen === gen ? resolve() : reject(STOP); }, ms);
        });
      },
      // Cursor: glide to a target, offset a little so the tip lands inside it
      point: function (el, dx, dy) {
        var p = centre(stage, el);
        cursor.style.setProperty('--x', (p.x + (dx || 0) - 3) + 'px');
        cursor.style.setProperty('--y', (p.y + (dy || 0) - 3) + 'px');
        return t.wait(950);
      },
      click: function (el) {
        cursor.classList.add('is-down');
        el.classList.add('is-down');
        return t.wait(140).then(function () {
          cursor.classList.remove('is-down');
          el.classList.remove('is-down');
        });
      },
      // Touch: a finger appears on a target
      touchOn: function (el) {
        var p = centre(stage, el);
        touch.style.setProperty('--x', p.x + 'px');
        touch.style.setProperty('--y', p.y + 'px');
        touch.classList.add('is-on');
        return t.wait(260);
      },
      touchDown: function () { touch.classList.add('is-down'); },
      touchUp: function () { touch.classList.remove('is-down'); },
      touchOff: function () { touch.classList.remove('is-on', 'is-down'); },
      tween: function (ms, a, b, each) { return tween(t, ms, a, b, each); }
    };
    return t;
  }

  // Move the cursor somewhere without animating (for resets)
  function park(stage, x, y) {
    var c = $(stage, '.cursor');
    if (!c) return;
    c.style.transition = 'none';
    c.style.setProperty('--x', x + 'px');
    c.style.setProperty('--y', y + 'px');
    void c.offsetWidth;
    c.style.transition = '';
  }

  // Apply a reset without letting its transitions play
  function instantly(stage, fn) {
    stage.classList.add('no-anim');
    fn();
    void stage.offsetWidth;
    stage.classList.remove('no-anim');
  }
  var css = document.createElement('style');
  css.textContent = '.stage.no-anim, .stage.no-anim * { transition: none !important; }';
  document.head.appendChild(css);

  function mmss(sec) {
    sec = Math.round(sec);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  // ─── 1. reUNITEme SOS ──────────────────────────────────────────────
  var sos = {
    reset: function (st) {
      st.dataset.s = '';
      $$(st, '[data-row]').forEach(function (r) { r.dataset.r = ''; });
      $(st, '.notif').classList.remove('is-on');
      $(st, '.touch').classList.remove('is-on', 'is-down');
    },
    poster: function (st) {
      st.dataset.s = 'sent';
      $$(st, '[data-row]').forEach(function (r) { r.dataset.r = 'ok'; });
      $(st, '.notif').classList.add('is-on');
    },
    run: async function (st, t) {
      var btn = $(st, '[data-target="sos"]');
      var rows = $$(st, '[data-row]');
      await t.wait(900);
      // Press and hold: the ring fills
      await t.touchOn(btn);
      t.touchDown();
      st.dataset.s = 'hold';
      await t.wait(1900);
      // Released: alert sent
      st.dataset.s = 'sent';
      var pulse = $(st, '.sos-pulse');
      pulse.classList.remove('is-on'); void pulse.offsetWidth; pulse.classList.add('is-on');
      t.touchUp();
      await t.wait(220);
      t.touchOff();
      // Each contact is reached in turn
      for (var i = 0; i < rows.length; i++) { rows[i].dataset.r = 'wait'; await t.wait(140); }
      await t.wait(380);
      rows[0].dataset.r = 'ok';
      await t.wait(260);
      $(st, '.notif').classList.add('is-on'); // what the contact sees
      await t.wait(160);
      rows[1].dataset.r = 'ok';
      await t.wait(420);
      rows[2].dataset.r = 'ok';
      // Payoff holds
      await t.wait(3400);
      // Tap to stop sharing: everything returns, with a cause
      await t.touchOn(btn);
      t.touchDown();
      await t.wait(150);
      t.touchUp();
      st.dataset.s = '';
      rows.forEach(function (r) { r.dataset.r = ''; });
      $(st, '.notif').classList.remove('is-on');
      await t.wait(240);
      t.touchOff();
      await t.wait(900);
    }
  };

  // ─── 2. SkillResy interview assistant ──────────────────────────────
  var interview = {
    init: function (st) {
      var q = $(st, '[data-stream]');
      q.innerHTML = q.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
      // A live clock that only ever counts up
      var timer = $(st, '[data-timer]');
      var secs = 12 * 60 + 48;
      setInterval(function () { if (st._playing) { secs++; timer.textContent = mmss(secs); } }, 1000);
    },
    reset: function (st) {
      st.dataset.s = '';
      $$(st, '.w').forEach(function (w) { w.classList.remove('is-on'); });
      $$(st, '[data-pt]').forEach(function (p) { p.classList.remove('is-on'); });
      $(st, '.iv-thinking').firstChild.textContent = 'Listening';
      $(st, '.iv-line--answer').classList.remove('is-on');
      $$(st, '.iv-line--answer b').forEach(function (b) { b.classList.remove('is-on'); });
      park(st, 640, 470);
    },
    poster: function (st) {
      st.dataset.s = 'pinned';
      $$(st, '.w').forEach(function (w) { w.classList.add('is-on'); });
      $$(st, '[data-pt]').forEach(function (p) { p.classList.add('is-on'); });
      $(st, '.iv-line--answer').classList.add('is-on');
      $$(st, '.iv-line--answer b').forEach(function (b) { b.classList.add('is-on'); });
      var pin = $(st, '[data-target="pin"]');
      var p = centre(st, pin);
      park(st, p.x + 34, p.y + 14);
    },
    run: async function (st, t) {
      var words = $$(st, '.w');
      var pts = $$(st, '[data-pt]');
      var think = $(st, '.iv-thinking').firstChild;
      await t.wait(500);
      st.dataset.s = 'listen';
      for (var i = 0; i < words.length; i++) { words[i].classList.add('is-on'); await t.wait(120); }
      await t.wait(300);
      st.dataset.s = 'think';
      think.textContent = 'Drafting';
      await t.wait(900);
      st.dataset.s = 'answer';
      for (var j = 0; j < pts.length; j++) { pts[j].classList.add('is-on'); await t.wait(480); }
      await t.wait(300);
      var pin = $(st, '[data-target="pin"]');
      await t.point(pin, 18, 4);
      await t.click(pin);
      st.dataset.s = 'pinned';
      await t.wait(500);
      // Step the cursor off the result
      var p = centre(st, pin);
      $(st, '.cursor').style.setProperty('--x', (p.x + 34) + 'px');
      $(st, '.cursor').style.setProperty('--y', (p.y + 14) + 'px');
      // The candidate answers, following the pinned structure
      var ans = $(st, '.iv-line--answer');
      ans.classList.add('is-on');
      var ab = $$(ans, 'b');
      for (var k = 0; k < ab.length; k++) { ab[k].classList.add('is-on'); await t.wait(700); }
      await t.wait(2200);
      // The next question arrives: the card clears for it
      ans.classList.remove('is-on');
      ab.forEach(function (b) { b.classList.remove('is-on'); });
      pts.forEach(function (x) { x.classList.remove('is-on'); });
      words.forEach(function (w) { w.classList.remove('is-on'); });
      st.dataset.s = '';
      think.textContent = 'Listening';
      await t.wait(900);
    }
  };

  // ─── 3. reUNITEme LifeLine ─────────────────────────────────────────
  var lifeline = {
    reset: function (st) {
      $(st, '[data-me]').classList.remove('is-on');
      $(st, '.ll-typing').classList.remove('is-on');
      $(st, '[data-ai]').classList.remove('is-on');
      $$(st, '[data-l]').forEach(function (l) { l.classList.remove('is-on'); });
      $(st, '.ll-tts').classList.remove('is-on');
      $(st, '.ll-thread').classList.remove('is-leaving');
    },
    poster: function (st) {
      $(st, '[data-me]').classList.add('is-on');
      $(st, '[data-ai]').classList.add('is-on');
      $$(st, '[data-l]').forEach(function (l) { l.classList.add('is-on'); });
      $(st, '.ll-tts').classList.add('is-on');
    },
    run: async function (st, t) {
      var lines = $$(st, '[data-l]');
      await t.wait(600);
      $(st, '[data-me]').classList.add('is-on');
      await t.wait(700);
      $(st, '.ll-typing').classList.add('is-on');
      await t.wait(1300);
      $(st, '.ll-typing').classList.remove('is-on');
      $(st, '[data-ai]').classList.add('is-on');
      for (var i = 0; i < lines.length; i++) { lines[i].classList.add('is-on'); await t.wait(i === 0 ? 800 : 620); }
      $(st, '.ll-tts').classList.add('is-on');
      await t.wait(4000);
      // A new conversation: the thread moves up and away
      $(st, '.ll-thread').classList.add('is-leaving');
      await t.wait(550);
      instantly(st, function () { lifeline.reset(st); });
      await t.wait(400);
    }
  };

  // ─── 4. SKYWIREme broadcast ────────────────────────────────────────
  var TOTAL = 248;
  function setMeter(m, v) {
    $(m, '[data-count]').textContent = Math.round(v);
    $(m, '.bc-meter__bar b').style.setProperty('--p', v / TOTAL);
  }
  var broadcast = {
    reset: function (st) {
      st.dataset.s = '';
      $(st, '[data-target="voice"]').classList.remove('is-on');
      $$(st, '.bc-meter').forEach(function (m) { setMeter(m, 0); });
      $(st, '[data-ch="voice"]').classList.add('is-off');
      $(st, '[data-ack]').textContent = '0';
      $(st, '.bc-status').style.opacity = '';
      park(st, 640, 470);
    },
    poster: function (st) {
      st.dataset.s = 'sent';
      $(st, '[data-target="voice"]').classList.add('is-on');
      $(st, '[data-ch="voice"]').classList.remove('is-off');
      $$(st, '.bc-meter').forEach(function (m) { setMeter(m, TOTAL); });
      $(st, '[data-ack]').textContent = '191';
      var send = $(st, '[data-target="send"]');
      var p = centre(st, send);
      park(st, p.x + 90, p.y + 22);
    },
    run: async function (st, t) {
      var voice = $(st, '[data-target="voice"]');
      var send = $(st, '[data-target="send"]');
      var meters = { text: $(st, '[data-ch="text"]'), voice: $(st, '[data-ch="voice"]'), email: $(st, '[data-ch="email"]') };
      await t.wait(700);
      await t.point(voice, 8, 2);
      await t.click(voice);
      voice.classList.add('is-on');
      meters.voice.classList.remove('is-off');
      await t.wait(450);
      await t.point(send, 20, 4);
      await t.click(send);
      st.dataset.s = 'sent';
      // Channels deliver at their own pace
      t.tween(1100, 0, TOTAL, function (v) { setMeter(meters.text, v); }).catch(function () {});
      t.tween(1700, 0, TOTAL, function (v) { setMeter(meters.email, v); }).catch(function () {});
      var p = centre(st, send);
      $(st, '.cursor').style.setProperty('--x', (p.x + 90) + 'px');
      $(st, '.cursor').style.setProperty('--y', (p.y + 22) + 'px');
      var ack = $(st, '[data-ack]');
      t.tween(4200, 0, 1, function (v, k) { ack.textContent = Math.round(191 * (1 - Math.pow(1 - k, 3))); }).catch(function () {});
      await t.tween(2600, 0, TOTAL, function (v) { setMeter(meters.voice, v); });
      await t.wait(3200);
      // The alert closes; the composer is ready for the next one
      $(st, '.bc-status').style.transition = 'opacity .4s';
      $(st, '.bc-status').style.opacity = '0';
      await t.wait(450);
      instantly(st, function () {
        st.dataset.s = '';
        voice.classList.remove('is-on');
        meters.voice.classList.add('is-off');
        Object.keys(meters).forEach(function (k) { setMeter(meters[k], 0); });
        ack.textContent = '0';
      });
      $(st, '.bc-status').style.opacity = '';
      await t.wait(900);
    }
  };

  // ─── 5. Beantown Pals ──────────────────────────────────────────────
  var START = 252, END = 300; // 4:12 → 5:00
  function setPlay(st, sec) {
    $(st, '[data-bar]').style.setProperty('--p', sec / END);
    $(st, '[data-elapsed]').textContent = mmss(sec);
  }
  var beans = {
    reset: function (st) {
      st.dataset.s = '';
      setPlay(st, START);
      $(st, '[data-beans]').textContent = '120';
      $(st, '.bt-toast').classList.remove('is-on');
      $(st, '.bt-next').classList.remove('is-hot');
      $(st, '.app-bt').style.opacity = '';
    },
    poster: function (st) {
      st.dataset.s = 'done';
      setPlay(st, END);
      $(st, '[data-beans]').textContent = '130';
      $(st, '.bt-toast').classList.add('is-on');
    },
    run: async function (st, t) {
      var count = $(st, '[data-beans]');
      var pill = $(st, '.bt-beans');
      await t.wait(400);
      // The story plays out (compressed)
      await t.tween(3400, START, END, function (v) { setPlay(st, v); });
      st.dataset.s = 'done';
      await t.wait(350);
      $(st, '.bt-toast').classList.add('is-on');
      await t.wait(450);
      pill.classList.add('is-bump');
      await t.tween(700, 120, 130, function (v) { count.textContent = Math.round(v); });
      pill.classList.remove('is-bump');
      await t.wait(2200);
      $(st, '.bt-toast').classList.remove('is-on');
      $(st, '.bt-next').classList.add('is-hot');
      await t.wait(1600);
      // Next session: the screen cross-fades back to the story
      var screen = $(st, '.app-bt');
      screen.style.transition = 'opacity .35s';
      screen.style.opacity = '0';
      await t.wait(380);
      instantly(st, function () { beans.reset(st); screen.style.opacity = '0'; });
      screen.style.opacity = '';
      await t.wait(500);
    }
  };

  var DEMOS = { sos: sos, interview: interview, lifeline: lifeline, broadcast: broadcast, beans: beans };

  // ─── Playback: loop while visible ──────────────────────────────────
  var stages = $$(document, '.stage[data-demo]');
  stages.forEach(function (st) {
    var d = DEMOS[st.dataset.demo];
    st._gen = 0;
    if (d.init) d.init(st);
    instantly(st, function () { d.reset(st); d.poster(st); });
  });

  async function loop(st) {
    var d = DEMOS[st.dataset.demo];
    var gen = ++st._gen;
    st._playing = true;
    instantly(st, function () { d.reset(st); });
    try {
      while (st._gen === gen) {
        await d.run(st, toolkit(st));
      }
    } catch (e) {
      if (e !== STOP) throw e;
    }
  }
  function stop(st) {
    st._gen++;
    st._playing = false;
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var st = e.target.querySelector('.stage');
        if (e.isIntersecting) { if (!st._playing) loop(st); }
        else if (st._playing) stop(st);
      });
    }, { threshold: 0.35 });
    frames.forEach(function (f) { io.observe(f); });
  }

  // Re-fit after fonts load (text metrics change target positions)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { frames.forEach(fit); });

  // ─── Nav border on scroll ──────────────────────────────────────────
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
