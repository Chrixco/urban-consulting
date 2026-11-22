/* Proxima Urban — interactive charts (vanilla SVG, no dependencies).
 *
 * Projection data: IPCC AR6 Working Group I, Summary for Policymakers (2021),
 * Table SPM.1 (global surface temperature, very likely range, relative to
 * 1850–1900) and section B.5.3 / Chapter 9 (global mean sea-level rise, likely
 * range, relative to 1995–2014). Observed warming 2011–2020: 1.1 °C (SPM A.1.2).
 * Adaptation pathways are illustrative (after Haasnoot et al. 2013); tipping
 * points are examples and are determined locally in each study.
 */
(function () {
  "use strict";

  var PHI = 1.618;
  var NS = "http://www.w3.org/2000/svg";
  var SCEN = ["SSP1-2.6", "SSP2-4.5", "SSP5-8.5"];
  var SCEN_NAME = { "SSP1-2.6": "low emissions", "SSP2-4.5": "intermediate", "SSP5-8.5": "very high" };

  var DATA = {
    sea: {
      title: "Global mean sea-level rise",
      unit: "m", digits: 2, range: "likely range",
      domainX: [2000, 2100], domainY: [0, 1.1], ticksY: [0, 0.25, 0.5, 0.75, 1], ticksX: [2020, 2040, 2060, 2080, 2100],
      points: [
        { year: 2005, label: "1995–2014 baseline" },
        { year: 2050, label: "2050" },
        { year: 2100, label: "2100" }
      ],
      s: {
        "SSP1-2.6": [[0, 0, 0], [0.19, 0.16, 0.25], [0.44, 0.32, 0.62]],
        "SSP2-4.5": [[0, 0, 0], [0.20, 0.17, 0.26], [0.56, 0.44, 0.76]],
        "SSP5-8.5": [[0, 0, 0], [0.23, 0.20, 0.29], [0.77, 0.63, 1.01]]
      },
      horizonIndex: { "2050": 1, "2100": 2 }
    },
    temp: {
      title: "Global surface warming",
      unit: "°C", digits: 1, range: "very likely range",
      domainX: [2010, 2100], domainY: [0, 6], ticksY: [0, 1, 2, 3, 4, 5, 6], ticksX: [2020, 2040, 2060, 2080, 2100],
      points: [
        { year: 2015, label: "2011–2020 observed" },
        { year: 2030, label: "2021–2040" },
        { year: 2050, label: "2041–2060" },
        { year: 2090, label: "2081–2100" }
      ],
      s: {
        "SSP1-2.6": [[1.1, 1.1, 1.1], [1.5, 1.2, 1.8], [1.7, 1.3, 2.2], [1.8, 1.3, 2.4]],
        "SSP2-4.5": [[1.1, 1.1, 1.1], [1.5, 1.2, 1.8], [2.0, 1.6, 2.5], [2.7, 2.1, 3.5]],
        "SSP5-8.5": [[1.1, 1.1, 1.1], [1.6, 1.3, 1.9], [2.4, 1.9, 3.0], [4.4, 3.3, 5.7]]
      },
      horizonIndex: { "2050": 2, "2100": 3 }
    }
  };

  var MEASURES = [
    { name: "Existing drainage and quay walls", tip: 0.20 },
    { name: "Blue-green retention in parks and streets", tip: 0.50 },
    { name: "Flood-adapted building codes", tip: 0.70 },
    { name: "Raised quay walls with pumping", tip: 0.90 },
    { name: "Managed realignment of the waterfront", tip: null }
  ];
  var TRANSFERS = [[0, 1], [1, 2], [1, 3], [3, 4]];

  var state = { scenario: "SSP2-4.5", horizon: "2100" };
  var charts = [];

  /* ---------- helpers ---------- */
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = el("text", { x: x, y: y, class: cls || "", "text-anchor": anchor || "start" }, parent);
    t.textContent = s;
    return t;
  }
  function css(node, name) { return getComputedStyle(node).getPropertyValue(name).trim(); }
  function fmt(v, d) { return v.toFixed(d); }
  function lin(d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); }; }
  function reduceMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- tooltip ---------- */
  function makeTip(host) {
    var tip = document.createElement("div");
    tip.className = "viz-tip";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    host.appendChild(tip);
    return tip;
  }
  function placeTip(tip, host, x, y) {
    tip.hidden = false;
    var hw = host.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = x + 14; if (left + tw > hw - 4) left = Math.max(4, x - tw - 14);
    var top = y - th - 12; if (top < 4) top = y + 18;
    tip.style.left = left + "px"; tip.style.top = top + "px";
  }
  function tipRow(tip, keyClass, strong, light) {
    var row = document.createElement("div"); row.className = "viz-tip-row";
    var key = document.createElement("span"); key.className = "viz-key " + keyClass; row.appendChild(key);
    var s = document.createElement("strong"); s.textContent = strong; row.appendChild(s);
    var l = document.createElement("span"); l.textContent = light; row.appendChild(l);
    tip.appendChild(row);
  }
  function tipHead(tip, s) {
    var h = document.createElement("div"); h.className = "viz-tip-head"; h.textContent = s; tip.appendChild(h);
  }

  /* ---------- projection line chart ---------- */
  function lineChart(host, key) {
    var D = DATA[key];
    var tip = makeTip(host);
    var svg, cur = null, lastSel = null;

    function draw() {
      var w = host.clientWidth; if (!w) return;
      var h = Math.max(220, Math.round(w / PHI));
      var m = { t: 30, r: 82, b: 30, l: 40 };
      host.querySelectorAll("svg").forEach(function (s) { s.remove(); });
      svg = el("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": D.title + ", " + SCEN.join(", ") + ". Selected: " + state.scenario + "." });
      host.insertBefore(svg, tip);
      var x = lin(D.domainX[0], D.domainX[1], m.l, w - m.r);
      var y = lin(D.domainY[0], D.domainY[1], h - m.b, m.t);

      var g = el("g", { class: "viz-grid" }, svg);
      D.ticksY.forEach(function (v) {
        el("line", { x1: m.l, x2: w - m.r, y1: y(v), y2: y(v), class: v === 0 ? "viz-axis" : "viz-gridline" }, g);
        txt(g, m.l - 8, y(v) + 4, (D.digits === 2 ? fmt(v, v % 1 ? 2 : 0) : String(v)), "viz-tick", "end");
      });
      D.ticksX.forEach(function (v) { txt(g, x(v), h - m.b + 18, String(v), "viz-tick", "middle"); });
      txt(g, m.l - 8, m.t - 16, D.unit, "viz-tick", "end");

      var hi = D.horizonIndex[state.horizon];
      var hx = x(D.points[hi].year);
      el("line", { x1: hx, x2: hx, y1: m.t, y2: h - m.b, class: "viz-horizon" }, svg);

      // band for selected scenario
      var S = D.s[state.scenario];
      var up = D.points.map(function (p, i) { return x(p.year) + "," + y(S[i][2]); });
      var dn = D.points.map(function (p, i) { return x(p.year) + "," + y(S[i][1]); }).reverse();
      el("polygon", { points: up.concat(dn).join(" "), class: "viz-band" }, svg);

      // lines: muted first, selected last
      var order = SCEN.filter(function (s) { return s !== state.scenario; }).concat([state.scenario]);
      var ends = [];
      order.forEach(function (s) {
        var sel = s === state.scenario;
        var pts = D.points.map(function (p, i) { return x(p.year) + "," + y(D.s[s][i][0]); }).join(" ");
        var line = el("polyline", { points: pts, class: sel ? "viz-line is-sel" : "viz-line" }, svg);
        if (sel && !reduceMotion() && lastSel !== state.scenario) {
          var len = line.getTotalLength ? line.getTotalLength() : 0;
          if (len) { line.style.strokeDasharray = len; line.style.strokeDashoffset = len; requestAnimationFrame(function () { line.style.transition = "stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)"; line.style.strokeDashoffset = 0; }); }
        }
        var last = D.points.length - 1;
        ends.push({ s: s, sel: sel, y: y(D.s[s][last][0]), x: x(D.points[last].year) });
      });
      // end labels (all three, nudged apart only if they would overlap)
      ends.sort(function (a, b) { return a.y - b.y; });
      for (var i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;
      ends.forEach(function (e) {
        txt(svg, e.x + 8, e.y + 4, e.s, e.sel ? "viz-endlabel is-sel" : "viz-endlabel", "start");
      });
      lastSel = state.scenario;
      // markers on selected line
      D.points.forEach(function (p, i) {
        if (i === 0) return;
        el("circle", { cx: x(p.year), cy: y(S[i][0]), r: i === hi ? 5 : 4, class: i === hi ? "viz-dot is-h" : "viz-dot" }, svg);
      });

      // hover / focus layer
      var cross = el("line", { y1: m.t, y2: h - m.b, class: "viz-cross", visibility: "hidden" }, svg);
      var hit = el("rect", { x: m.l, y: m.t, width: w - m.l - m.r + 40, height: h - m.t - m.b, class: "viz-hit", tabindex: "0", "aria-label": "Inspect values. Use left and right arrow keys." }, svg);
      function show(idx, px, py) {
        cur = idx;
        var p = D.points[idx], X = x(p.year);
        cross.setAttribute("x1", X); cross.setAttribute("x2", X); cross.setAttribute("visibility", "visible");
        tip.textContent = "";
        tipHead(tip, p.label);
        SCEN.slice().reverse().forEach(function (s) {
          var v = D.s[s][idx];
          var val = fmt(v[0], D.digits) + " " + D.unit;
          var rng = idx === 0 ? "" : " (" + fmt(v[1], D.digits) + "–" + fmt(v[2], D.digits) + ")";
          tipRow(tip, s === state.scenario ? "is-sel" : "", val + rng, s);
        });
        placeTip(tip, host, px === undefined ? X : px, py === undefined ? y(S[idx][0]) : py);
      }
      function hide() { cross.setAttribute("visibility", "hidden"); tip.hidden = true; }
      function nearest(px) {
        var best = 0, bd = 1e9;
        D.points.forEach(function (p, i) { var d = Math.abs(x(p.year) - px); if (d < bd) { bd = d; best = i; } });
        return best;
      }
      hit.addEventListener("pointermove", function (e) { var r = svg.getBoundingClientRect(); var px = e.clientX - r.left, py = e.clientY - r.top; show(nearest(px), px, py); });
      hit.addEventListener("pointerleave", hide);
      hit.addEventListener("focus", function () { show(hi); });
      hit.addEventListener("blur", hide);
      hit.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var n = (cur === null ? hi : cur) + (e.key === "ArrowRight" ? 1 : -1);
          show(Math.max(0, Math.min(D.points.length - 1, n)));
        } else if (e.key === "Escape") { hide(); }
      });
    }
    return { draw: draw };
  }

  /* ---------- adaptation pathways ---------- */
  function pathwaysChart(host) {
    var tip = makeTip(host);
    function draw() {
      var w = host.clientWidth; if (!w) return;
      var rowH = 46, m = { t: 34, r: 24, b: 40, l: 16 };
      var h = Math.max(Math.round(w / PHI), m.t + m.b + rowH * MEASURES.length);
      rowH = (h - m.t - m.b) / MEASURES.length;
      host.querySelectorAll("svg").forEach(function (s) { s.remove(); });
      var svg = el("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": "Illustrative adaptation pathways for five measures against sea-level rise." });
      host.insertBefore(svg, tip);
      var x = lin(0, 1.1, m.l, w - m.r);
      var sea = DATA.sea.s[state.scenario][DATA.sea.horizonIndex[state.horizon]];

      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        el("line", { x1: x(v), x2: x(v), y1: m.t - 6, y2: h - m.b, class: v === 0 ? "viz-axis" : "viz-gridline" }, svg);
        txt(svg, x(v), h - m.b + 18, fmt(v, v % 1 ? 2 : 0) + (v === 1 ? " m" : ""), "viz-tick", "middle");
      });
      txt(svg, w - m.r, h - 6, "Sea-level rise", "viz-tick", "end");

      // selected scenario band and marker
      el("rect", { x: x(sea[1]), y: m.t - 6, width: Math.max(1, x(sea[2]) - x(sea[1])), height: h - m.b - m.t + 6, class: "viz-band" }, svg);
      el("line", { x1: x(sea[0]), x2: x(sea[0]), y1: m.t - 6, y2: h - m.b, class: "viz-marker" }, svg);
      var lab = state.scenario + " · " + state.horizon + ": " + fmt(sea[0], 2) + " m";
      var lx = x(sea[0]), anchor = lx > w * 0.62 ? "end" : "start";
      txt(svg, lx + (anchor === "end" ? -6 : 6), m.t - 14, lab, "viz-endlabel is-sel", anchor);

      var rowY = function (i) { return m.t + rowH * i + rowH * 0.68; };
      // transfers
      TRANSFERS.forEach(function (tpair) {
        var a = MEASURES[tpair[0]], X = x(a.tip);
        el("line", { x1: X, x2: X, y1: rowY(tpair[0]), y2: rowY(tpair[1]), class: "viz-transfer" }, svg);
      });
      MEASURES.forEach(function (ms, i) {
        var Y = rowY(i), end = ms.tip === null ? 1.1 : ms.tip;
        var past = ms.tip !== null && ms.tip < sea[0];
        var g = el("g", { class: past ? "viz-row is-past" : "viz-row", tabindex: "0", role: "listitem",
          "aria-label": ms.name + ": " + (ms.tip === null ? "effective beyond 1.1 m" : "effective up to " + fmt(ms.tip, 2) + " m") + (past ? ", tipping point reached in this scenario" : "") }, svg);
        txt(g, m.l, Y - 11, ms.name, "viz-rowlabel", "start");
        el("line", { x1: x(0), x2: x(end), y1: Y, y2: Y, class: "viz-path" }, g);
        if (ms.tip !== null) el("line", { x1: x(end), x2: x(end), y1: Y - 7, y2: Y + 7, class: "viz-tipmark" }, g);
        else el("polyline", { points: (x(end) - 6) + "," + (Y - 5) + " " + x(end) + "," + Y + " " + (x(end) - 6) + "," + (Y + 5), class: "viz-arrow" }, g);
        el("rect", { x: m.l, y: Y - rowH * 0.62, width: w - m.l - m.r, height: rowH * 0.8, class: "viz-hit" }, g);
        function show(px, py) {
          tip.textContent = "";
          tipHead(tip, ms.name);
          tipRow(tip, past ? "" : "is-sel", ms.tip === null ? "Beyond 1.1 m" : "Up to " + fmt(ms.tip, 2) + " m", past ? "tipping point reached" : "effective");
          placeTip(tip, host, px, py);
        }
        g.addEventListener("pointermove", function (e) { var r = svg.getBoundingClientRect(); show(e.clientX - r.left, e.clientY - r.top); });
        g.addEventListener("pointerleave", function () { tip.hidden = true; });
        g.addEventListener("focus", function () { show(x(end), Y); });
        g.addEventListener("blur", function () { tip.hidden = true; });
      });
    }
    return { draw: draw };
  }

  /* ---------- diverging bars (Copenhagen) ---------- */
  function divergingChart(host) {
    var rows = [
      { name: "Blue-green strategy", v: 3 },
      { name: "Conventional sewer strategy", v: -4 }
    ];
    var tip = makeTip(host);
    function draw() {
      var w = host.clientWidth; if (!w) return;
      var barH = 18, gap = 52, m = { t: 26, r: 34, b: 22, l: 34 };
      var h = m.t + m.b + gap * rows.length;
      host.querySelectorAll("svg").forEach(function (s) { s.remove(); });
      var svg = el("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": "Net result of Copenhagen cloudburst strategies: blue-green plus 3 billion kroner, conventional minus 4 billion kroner." });
      host.insertBefore(svg, tip);
      var x = lin(-5, 5, m.l, w - m.r), x0 = x(0);
      el("line", { x1: x0, x2: x0, y1: 4, y2: h - 4, class: "viz-axis" }, svg);
      rows.forEach(function (r, i) {
        var Y = m.t + gap * i + 10, X = x(r.v), left = Math.min(x0, X), wd = Math.abs(X - x0);
        txt(svg, 0, Y - 8, r.name, "viz-rowlabel", "start");
        var rad = 4, y0 = Y, y1 = Y + barH, d;
        if (r.v >= 0) d = "M" + x0 + "," + y0 + "H" + (X - rad) + "Q" + X + "," + y0 + " " + X + "," + (y0 + rad) + "V" + (y1 - rad) + "Q" + X + "," + y1 + " " + (X - rad) + "," + y1 + "H" + x0 + "Z";
        else d = "M" + x0 + "," + y0 + "H" + (X + rad) + "Q" + X + "," + y0 + " " + X + "," + (y0 + rad) + "V" + (y1 - rad) + "Q" + X + "," + y1 + " " + (X + rad) + "," + y1 + "H" + x0 + "Z";
        var bar = el("path", { d: d, class: r.v >= 0 ? "viz-bar" : "viz-bar is-neg", tabindex: "0", "aria-label": r.name + ": " + (r.v > 0 ? "+" : "−") + Math.abs(r.v) + " billion kroner" }, svg);
        txt(svg, r.v >= 0 ? X + 6 : X - 6, Y + 13, (r.v > 0 ? "+" : "−") + Math.abs(r.v), "viz-value", r.v >= 0 ? "start" : "end");
        function show(px, py) { tip.textContent = ""; tipHead(tip, r.name); tipRow(tip, r.v >= 0 ? "is-sel" : "", (r.v > 0 ? "+" : "−") + "DKK " + Math.abs(r.v) + " bn", "net result"); placeTip(tip, host, px, py); }
        bar.addEventListener("pointermove", function (e) { var b = svg.getBoundingClientRect(); show(e.clientX - b.left, e.clientY - b.top); });
        bar.addEventListener("pointerleave", function () { tip.hidden = true; });
        bar.addEventListener("focus", function () { show(X, Y); });
        bar.addEventListener("blur", function () { tip.hidden = true; });
      });
      txt(svg, x0, h - 2, "DKK bn, 100-year horizon", "viz-tick", "middle");
    }
    return { draw: draw };
  }

  /* ---------- readout, table, controls ---------- */
  function setText(id, s) { var n = document.getElementById(id); if (n) n.textContent = s; }
  function updateReadout() {
    var sea = DATA.sea.s[state.scenario][DATA.sea.horizonIndex[state.horizon]];
    var ti = DATA.temp.horizonIndex[state.horizon], t = DATA.temp.s[state.scenario][ti];
    setText("ro-scenario", state.scenario + " · " + SCEN_NAME[state.scenario] + " · " + state.horizon);
    setText("ro-sea", fmt(sea[0], 2) + " m");
    setText("ro-sea-range", "Likely " + fmt(sea[1], 2) + "–" + fmt(sea[2], 2) + " m, relative to 1995–2014");
    setText("ro-temp", fmt(t[0], 1) + " °C");
    setText("ro-temp-range", "Very likely " + fmt(t[1], 1) + "–" + fmt(t[2], 1) + " °C, " + DATA.temp.points[ti].label + ", relative to 1850–1900");
    var tipped = MEASURES.filter(function (ms) { return ms.tip !== null && ms.tip < sea[0]; }).length;
    var tippedHi = MEASURES.filter(function (ms) { return ms.tip !== null && ms.tip < sea[2]; }).length;
    setText("ro-paths", tipped + " of " + MEASURES.length);
    setText("ro-paths-range", tippedHi + " of " + MEASURES.length + " at the upper end of the likely range");
  }
  function buildTable() {
    var host = document.getElementById("viz-table"); if (!host) return;
    host.textContent = "";
    ["sea", "temp"].forEach(function (k) {
      var D = DATA[k];
      var tbl = document.createElement("table");
      var cap = document.createElement("caption"); cap.textContent = D.title + " (" + D.unit + ", median and " + D.range + ")"; tbl.appendChild(cap);
      var thead = document.createElement("thead"), tr = document.createElement("tr");
      ["Scenario"].concat(D.points.slice(1).map(function (p) { return p.label; })).forEach(function (s) { var th = document.createElement("th"); th.scope = "col"; th.textContent = s; tr.appendChild(th); });
      thead.appendChild(tr); tbl.appendChild(thead);
      var tb = document.createElement("tbody");
      SCEN.forEach(function (s) {
        var r = document.createElement("tr"), th = document.createElement("th"); th.scope = "row"; th.textContent = s; r.appendChild(th);
        D.s[s].slice(1).forEach(function (v) { var td = document.createElement("td"); td.textContent = fmt(v[0], D.digits) + " (" + fmt(v[1], D.digits) + "–" + fmt(v[2], D.digits) + ")"; r.appendChild(td); });
        tb.appendChild(r);
      });
      tbl.appendChild(tb); host.appendChild(tbl);
    });
    var t2 = document.createElement("table");
    var c2 = document.createElement("caption"); c2.textContent = "Adaptation pathways (illustrative): sea-level rise at which each measure stops meeting its target"; t2.appendChild(c2);
    var b2 = document.createElement("tbody");
    MEASURES.forEach(function (ms) { var r = document.createElement("tr"), th = document.createElement("th"); th.scope = "row"; th.textContent = ms.name; var td = document.createElement("td"); td.textContent = ms.tip === null ? "beyond 1.1 m" : fmt(ms.tip, 2) + " m"; r.appendChild(th); r.appendChild(td); b2.appendChild(r); });
    t2.appendChild(b2); host.appendChild(t2);
  }
  function bindControls() {
    document.querySelectorAll("[data-control]").forEach(function (group) {
      var name = group.getAttribute("data-control");
      var btns = group.querySelectorAll("button");
      function sync() { btns.forEach(function (b) { var on = b.getAttribute("data-value") === state[name]; b.setAttribute("aria-checked", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; }); }
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { state[name] = b.getAttribute("data-value"); sync(); redraw(); });
        b.addEventListener("keydown", function (e) {
          var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!d) return; e.preventDefault();
          var n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click();
        });
      });
      sync();
    });
  }
  function redraw() { charts.forEach(function (c) { c.draw(); }); updateReadout(); }

  /* ---------- simple tooltips for static SVG marks (hero figure) ---------- */
  function bindStaticTips() {
    document.querySelectorAll("[data-tip-host]").forEach(function (host) {
      var tip = makeTip(host);
      host.querySelectorAll("[data-tip]").forEach(function (mark) {
        mark.setAttribute("tabindex", "0");
        function show(px, py) {
          tip.textContent = "";
          tipHead(tip, mark.getAttribute("data-tip-title") || "");
          var row = document.createElement("div"); row.className = "viz-tip-text"; row.textContent = mark.getAttribute("data-tip"); tip.appendChild(row);
          placeTip(tip, host, px, py);
        }
        mark.addEventListener("pointermove", function (e) { var r = host.getBoundingClientRect(); show(e.clientX - r.left, e.clientY - r.top); });
        mark.addEventListener("pointerleave", function () { tip.hidden = true; });
        mark.addEventListener("focus", function () { var r = host.getBoundingClientRect(), b = mark.getBoundingClientRect(); show(b.left - r.left + b.width / 2, b.top - r.top); });
        mark.addEventListener("blur", function () { tip.hidden = true; });
      });
    });
  }


  /* ---------- urban resilience framework matrix ----------
   * Lêdo Marques (2024), Table 17: analytical framework integrating resilience
   * factors (rows) and urban dimensions (columns). Empty cells are empty in the source.
   */
  var RF_DIMS = ["Governance", "Ecological", "Urban", "Socioeconomic"];
  var RF = [
    { f: "Diversity and redundancy", c: {
      Ecological: ["Land use diversity", "Food diversity", "Green infrastructure diversity"],
      Urban: ["Diversity of land use", "Diversity of energy sources (renewable)", "Diversity of mobility modes favouring active mode"],
      Socioeconomic: ["Business diversity", "Social cohesion"],
      Governance: ["Diversity of institutional settings for planning and participation", "Mobilising different types of knowledge and actors"] } },
    { f: "Managing connectivity and modularity", c: {
      Ecological: ["Ecological connectivity (green corridors, parks, green spaces)"],
      Urban: ["Urban connectivity (prioritise pedestrians, active mobility and public transport)", "Density", "Mixed uses", "Proximity to services"],
      Socioeconomic: ["Polycentric economic development based on local potentialities and sustainability"],
      Governance: ["Coordination and support", "Strategic planning with a multiscalar perspective", "Polycentric governance"] } },
    { f: "Flexibility and innovation", c: {
      Ecological: ["Foster innovation", "Professional training (education)"],
      Urban: ["Pilot projects (testing)"],
      Socioeconomic: ["Foster innovation"],
      Governance: ["Participation of multiple stakeholders", "Incremental process", "Monitoring"] } },
    { f: "Circularity and climate neutrality", c: {
      Ecological: ["Restoring and maintaining the water cycle", "Food and biomass production"],
      Urban: ["Water, waste and energy", "Mobility", "Circular construction practices", "Self-sufficient buildings", "Re-development and adaptation"],
      Socioeconomic: ["Circular, low-carbon economy"],
      Governance: [] } },
    { f: "Culture", c: {
      Ecological: ["Integration of ecological and historical heritage"],
      Urban: ["Enhancing the value of existing heritage", "Re-development"],
      Socioeconomic: ["Foster creative industries"],
      Governance: ["Coordination", "Technical support", "Financial support", "Participation", "Awareness"] } },
    { f: "Equity", c: {
      Ecological: ["Equitable distribution of and access to ecological infrastructure"],
      Urban: ["Housing", "Equitable distribution of and access to facilities and services"],
      Socioeconomic: ["Professional training (education)", "Employment opportunities"],
      Governance: [] } },
    { f: "Risk management", c: {
      Ecological: ["Nature-based solutions (green and blue infrastructure)"],
      Urban: ["Infrastructure (e.g. flooding)", "Housing", "Climate shelters"],
      Socioeconomic: ["Participation", "Awareness and education"],
      Governance: [] } }
  ];
  function buildMatrix(host) {
    var max = 0;
    RF.forEach(function (r) { RF_DIMS.forEach(function (d) { max = Math.max(max, r.c[d].length); }); });
    var tbl = document.createElement("table"); tbl.className = "rf-table";
    var cap = document.createElement("caption"); cap.className = "sr-only";
    cap.textContent = "Resilience factors by urban dimension, after Lêdo Marques (2024), Table 17. Each cell lists the number of planning elements; select a cell for the list.";
    tbl.appendChild(cap);
    var thead = document.createElement("thead"), hr = document.createElement("tr");
    var th0 = document.createElement("th"); th0.scope = "col"; th0.textContent = "Factor"; hr.appendChild(th0);
    RF_DIMS.forEach(function (d) { var th = document.createElement("th"); th.scope = "col"; var full = document.createElement("span"); full.className = "rf-full"; full.textContent = d; var ab = document.createElement("span"); ab.className = "rf-abbr"; ab.setAttribute("aria-hidden", "true"); ab.textContent = d.charAt(0); th.appendChild(full); th.appendChild(ab); hr.appendChild(th); });
    thead.appendChild(hr); tbl.appendChild(thead);
    var tb = document.createElement("tbody"), buttons = [];
    var dimEl = document.getElementById("rf-detail-dim"), facEl = document.getElementById("rf-detail-factor"), list = document.getElementById("rf-detail-items");
    function select(btn, r, d) {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      if (dimEl) dimEl.textContent = d + " dimension";
      if (facEl) facEl.textContent = r.f;
      if (list) {
        list.textContent = "";
        var items = r.c[d];
        if (!items.length) { var li = document.createElement("li"); li.className = "rf-empty"; li.textContent = "No elements assigned in the source framework."; list.appendChild(li); }
        items.forEach(function (it) { var li = document.createElement("li"); li.textContent = it; list.appendChild(li); });
      }
    }
    var initial = null;
    RF.forEach(function (r, ri) {
      var tr = document.createElement("tr");
      var th = document.createElement("th"); th.scope = "row"; th.textContent = r.f; tr.appendChild(th);
      RF_DIMS.forEach(function (d) {
        var td = document.createElement("td"), n = r.c[d].length;
        var b = document.createElement("button"); b.type = "button"; b.className = "rf-cell" + (n ? "" : " is-empty");
        b.style.setProperty("--w", n ? (0.14 + 0.86 * n / max).toFixed(3) : 0);
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", r.f + ", " + d + ": " + (n ? n + " element" + (n > 1 ? "s" : "") : "no elements"));
        b.textContent = n ? String(n) : "–";
        b.addEventListener("click", function () { select(b, r, d); });
        b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") select(b, r, d); });
        b.addEventListener("focus", function () { select(b, r, d); });
        buttons.push(b); td.appendChild(b); tr.appendChild(td);
        if (ri === 1 && d === "Urban") initial = [b, r, d];
      });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb); host.appendChild(tbl);
    if (initial) select(initial[0], initial[1], initial[2]);
  }

  function init() {
    document.querySelectorAll("[data-chart]").forEach(function (host) {
      var k = host.getAttribute("data-chart");
      if (k === "sea" || k === "temp") charts.push(lineChart(host, k));
      else if (k === "paths") charts.push(pathwaysChart(host));
      else if (k === "copenhagen") charts.push(divergingChart(host));
    });
    bindControls();
    buildTable();
    bindStaticTips();
    document.querySelectorAll("[data-matrix]").forEach(buildMatrix);
    redraw();
    var t;
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { clearTimeout(t); t = setTimeout(redraw, 80); }) : null;
    if (ro) document.querySelectorAll("[data-chart]").forEach(function (h) { ro.observe(h); });
    else window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(redraw, 120); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
