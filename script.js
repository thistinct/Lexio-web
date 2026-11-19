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

  function render(key) {
    var ex = examples[key];
    head.textContent = ex.head;
    out.textContent = "";
    var a = words(original), b = words(ex.text);
    var d = diff(a, b);
    var changeRatio = 1 - d.same / Math.max(a.length, b.length);
    if (changeRatio > 0.6) {
      out.textContent = ex.text;
    } else {
      d.segs.forEach(function (seg, idx) {
        if (idx > 0) out.appendChild(document.createTextNode(" "));
        var text = seg.words.join(" ");
        if (seg.kind === "same") { out.appendChild(document.createTextNode(text)); return; }
        var el = document.createElement(seg.kind);
        el.textContent = text;
        out.appendChild(el);
      });
    }
    out.classList.remove("fade");
    void out.offsetWidth;
    out.classList.add("fade");
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("on"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("on");
      tab.setAttribute("aria-selected", "true");
      render(tab.getAttribute("data-tab"));
    });
  });

  render("improve");
})();
