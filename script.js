// Tabs in the example panel. Results are hand-written examples; the diff
// works like the app's: removed words struck through, new words highlighted,
// and the plain result when most of the text changed.
(function () {
  var original = "hey, can u send me the report by friday? i need it for the meeting and its kind of urgent";

  var examples = {
    improve: {
      head: "Fixed capitals, punctuation and “its”",
      text: "Hey, can you send me the report by Friday? I need it for the meeting, and it's kind of urgent."
    },
    rephrase: {
      head: "Said another way",
      text: "Hey, could you get me the report by Friday? I need it for the meeting, so it's fairly urgent."
    },
    translate: {
      head: "Translated to Spanish",
      text: "Hola, ¿me puedes enviar el informe para el viernes? Lo necesito para la reunión y es algo urgente."
    },
    shorten: {
      head: "Shorter",
      text: "Can you send me the report by Friday? It's urgent for the meeting."
    },
    friendly: {
      head: "Warmer",
      text: "Hi! Could you send me the report by Friday? I need it for the meeting, so it's a little urgent."
    },
    formal: {
      head: "More formal",
      text: "Hello, could you please send me the report by Friday? I need it for the meeting, and it is somewhat urgent."
    }
  };

  var tabs = document.querySelectorAll("#panel-demo .tab");
  var head = document.getElementById("demo-head");
  var out = document.getElementById("demo-text");
  var orig = document.getElementById("demo-original");
  if (!tabs.length || !head || !out) return;
  orig.textContent = "“" + original + "”";

  function words(s) { return s.split(/\s+/).filter(Boolean); }

  // Longest common subsequence over words.
  function diff(a, b) {
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var segs = [];
    i = 0; j = 0;
    function push(kind, w) {
      var last = segs[segs.length - 1];
      if (last && last.kind === kind) last.words.push(w); else segs.push({ kind: kind, words: [w] });
    }
    while (i < n && j < m) {
      if (a[i] === b[j]) { push("same", a[i]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { push("del", a[i]); i++; }
      else { push("ins", b[j]); j++; }
    }
    while (i < n) push("del", a[i++]);
    while (j < m) push("ins", b[j++]);
    return { segs: segs, same: dp[0][0] };
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var panel = document.getElementById("panel-demo");
  var keys = Array.prototype.map.call(tabs, function (t) { return t.getAttribute("data-tab"); });
  var current = "improve";
  var writingTimer = null;

  function fill(ex, animate) {
    out.textContent = "";
    var a = words(original), b = words(ex.text);
    var d = diff(a, b);
    var changeRatio = 1 - d.same / Math.max(a.length, b.length);
    var n = 0;
    function add(parent, text) {
      if (!animate) { parent.appendChild(document.createTextNode(text)); return; }
      text.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { parent.appendChild(document.createTextNode(piece)); return; }
        var w = document.createElement("span");
        w.className = "w";
        w.style.animationDelay = (n++ * 28) + "ms";
        w.textContent = piece;
        parent.appendChild(w);
      });
    }
    if (changeRatio > 0.6) { add(out, ex.text); return; }
    d.segs.forEach(function (seg, idx) {
      if (idx > 0) out.appendChild(document.createTextNode(" "));
      var text = seg.words.join(" ");
      if (seg.kind === "same") { add(out, text); return; }
      // Changed runs appear as a whole, so their highlight and
      // strike-through never show up empty.
      var el = document.createElement(seg.kind);
      el.textContent = text;
      if (animate) {
        el.className = "w";
        el.style.animationDelay = (n * 28) + "ms";
        n += seg.words.length;
      }
      out.appendChild(el);
    });
  }

  function render(key, animate) {
    current = key;
    var ex = examples[key];
    clearTimeout(writingTimer);
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === key;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      // Restart the tab's progress bar.
      if (on) { t.classList.remove("on"); void t.offsetWidth; t.classList.add("on"); }
    });
    if (!animate) { head.textContent = ex.head; fill(ex, false); return; }
    // Like the app: a moment of "Writing…", then the words stream in.
    head.innerHTML = '<span class="writing"><span class="dots"><i></i><i></i><i></i></span>Writing…</span>';
    out.textContent = "";
    writingTimer = setTimeout(function () {
      head.textContent = ex.head;
      fill(ex, true);
    }, 650);
  }

  // Step through the tabs on their own while the panel is on screen,
  // until the visitor picks one or points at the panel.
  var CYCLE = 5000;
  var cycleTimer = null, visible = false, hovered = false, stopped = reduce;
  panel.style.setProperty("--cycle", CYCLE + "ms");
  function schedule() {
    clearTimeout(cycleTimer);
    var running = !stopped && visible && !hovered;
    panel.classList.toggle("auto", running);
    if (!running) return;
    cycleTimer = setTimeout(function () {
      render(keys[(keys.indexOf(current) + 1) % keys.length], true);
      schedule();
    }, CYCLE);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      stopped = true;
      schedule();
      render(tab.getAttribute("data-tab"), !reduce);
    });
  });
  panel.addEventListener("mouseenter", function () { hovered = true; schedule(); });
  panel.addEventListener("mouseleave", function () { hovered = false; schedule(); });
  panel.addEventListener("focusin", function () { stopped = true; schedule(); });

  render("improve", false);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.5 }).observe(panel);
  }
})();

// Scroll reveals and the nav shadow.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = document.querySelector(".nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var mock = document.querySelector(".hero-visual");
  if (reduce || !("IntersectionObserver" in window)) { if (mock) mock.classList.add("play"); return; }
  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) { mock.classList.add("play"); obs.disconnect(); }
  }, { threshold: 0.35 }).observe(mock);
  var groups = [
    ".section-head", ".demo-copy", "#panel-demo", ".privacy-card", ".apps-note",
    ".req-grid > div:first-child", ".final-card",
    ".cards > *", ".apps li", ".req-list li", ".faq details"
  ];
  var items = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      // Stagger siblings in grids and lists.
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      if (/>|li|details/.test(sel)) el.style.setProperty("--i", Math.min(i, 8));
      el.classList.add("reveal");
      items.push(el);
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

// Download buttons. Releases are published on this repository's GitHub
// releases by the app's Release workflow. Until the first one exists, or if
// GitHub can't be reached, the page keeps its "Coming soon" state.
(function () {
  var API = "https://api.github.com/repos/thistinct/lexio-web/releases/latest";
  var CACHE_KEY = "lexio-latest-release";
  var CACHE_MS = 60 * 60 * 1000;

  function el(name) { return document.querySelector('[data-download="' + name + '"]'); }

  function fromCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && Date.now() - c.at < CACHE_MS) return c.release;
    } catch (e) {}
    return null;
  }
  function toCache(release) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), release: release })); } catch (e) {}
  }

  // Keeps only what the page needs from GitHub's answer.
  function pick(data) {
    if (!data || data.draft || data.prerelease || !data.tag_name) return null;
    var version = String(data.tag_name).replace(/^v/, "");
    var assets = data.assets || [];
    var dmg = null;
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].name === "Lexio-" + version + ".dmg") { dmg = assets[i]; break; }
      if (assets[i].name === "Lexio.dmg") dmg = assets[i];
    }
    if (!dmg) return null;
    return { version: version, url: dmg.browser_download_url, size: dmg.size, notes: data.html_url };
  }

  function show(r) {
    var mb = r.size ? " · " + Math.max(1, Math.round(r.size / 1048576)) + " MB" : "";

    var nav = el("nav");
    if (nav) {
      nav.textContent = "Download";
      nav.href = r.url;
      nav.setAttribute("aria-label", "Download Lexio " + r.version);
    }
    var hero = el("hero");
    if (hero) {
      hero.href = r.url;
      var label = hero.querySelector("[data-download-label]");
      if (label) label.textContent = "Download for Mac";
    }
    var title = el("final-title");
    if (title) title.textContent = "Get Lexio";
    var text = el("final-text");
    if (text) text.textContent = "Signed and checked by Apple. For Macs with Apple silicon and macOS 26 or later.";
    var final = el("final");
    if (final) {
      final.textContent = "Download Lexio " + r.version;
      final.href = r.url;
      final.classList.remove("is-disabled");
      final.removeAttribute("aria-disabled");
    }
    var notes = el("notes");
    if (notes) {
      notes.textContent = "Version " + r.version + mb + " · ";
      var a = document.createElement("a");
      a.href = r.notes;
      a.textContent = "What's new";
      notes.appendChild(a);
      notes.hidden = false;
    }
    var faq = el("faq");
    if (faq) faq.textContent = "Now. Lexio " + r.version + " is ready to download from this page, and new versions appear here as soon as they're released.";
  }

  var cached = fromCache();
  if (cached) { show(cached); return; }
  if (!window.fetch) return;
  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      var r = pick(data);
      if (r) { toCache(r); show(r); }
    })
    .catch(function () {});
})();
