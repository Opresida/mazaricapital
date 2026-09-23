/* MAZARI CAPITAL — Intro do logo, variação 2c "Sinal → Fundação" (APROVADA).
   Port em JavaScript puro do componente canônico design/components/MazariIntro.tsx
   (Next.js/React), com paridade de comportamento:
   - Toca uma vez por sessão (sessionStorage). Clique ou Esc pula.
   - Respeita prefers-reduced-motion (não exibe).
   - Fases: sinal desenha o M (0–1.7s) → porta surge com onda (1.7–2.8s) →
     MAZARI sai do desfoque letra a letra (1.9s+) → CAPITAL entra da direita (2.5–3.2s).
   - DURATION 3.3s + HOLD 0.7s, fade de saída 600ms. */
(function () {
  "use strict";

  var overlay = document.getElementById("mazari-intro");
  if (!overlay) return;

  var KEY = "mazari-intro-seen";
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (seen || reduce) { overlay.parentNode.removeChild(overlay); return; }

  /* ---------- geometria do M ---------- */
  var PTS = [[6, 52], [6, 8], [30, 30], [54, 8], [54, 52]];
  var SEGS = [], LEN = 0, i;
  for (i = 1; i < PTS.length; i++) {
    var d = Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]);
    SEGS.push(d);
    LEN += d;
  }

  var DURATION = 3.3, HOLD = 0.7, FADE_MS = 600;

  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var easeInOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var easeBack = function (x) { var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  function pointAt(s) {
    for (var j = 0; j < SEGS.length; j++) {
      if (s <= SEGS[j]) {
        var f = s / SEGS[j];
        return [PTS[j][0] + (PTS[j + 1][0] - PTS[j][0]) * f, PTS[j][1] + (PTS[j + 1][1] - PTS[j][1]) * f];
      }
      s -= SEGS[j];
    }
    return PTS[PTS.length - 1];
  }

  var doorTransform = function (s) { return "translate(30 46) scale(" + s + ") translate(-30 -46)"; };

  /* ---------- monta o DOM da intro ---------- */
  var FONT = "'Space Grotesk',system-ui,sans-serif";
  var letters = "MAZARI".split("").map(function (ch, k) {
    return '<span class="mi-letter" style="display:inline-block;opacity:0">' + ch + "</span>";
  }).join("");

  overlay.innerHTML =
    '<div id="mi-inner" style="display:flex;align-items:center;gap:clamp(16px,2.4vw,28px);transition:transform ' + FADE_MS + 'ms ease">' +
      '<svg viewBox="0 0 60 56" style="width:clamp(64px,9vw,112px);height:auto;overflow:visible">' +
        '<polyline points="6,52 6,8 30,30 54,8 54,52" fill="none" stroke="#F5F7FA" stroke-width="7" opacity="0.08"></polyline>' +
        '<polyline id="mi-poly" points="6,52 6,8 30,30 54,8 54,52" fill="none" stroke="#F5F7FA" stroke-width="7" stroke-dasharray="' + LEN + '" stroke-dashoffset="' + LEN + '"></polyline>' +
        '<rect id="mi-ring" x="26" y="40" width="8" height="12" fill="none" stroke="#52FF9D" stroke-width="1" opacity="0"></rect>' +
        '<rect id="mi-door" x="26" y="40" width="8" height="12" fill="#52FF9D" transform="' + doorTransform(0) + '"></rect>' +
        '<circle id="mi-dot" cx="6" cy="52" r="3.2" fill="#52FF9D" opacity="0" style="filter:drop-shadow(0 0 4px #52FF9D)"></circle>' +
      '</svg>' +
      '<div>' +
        '<div id="mi-cap" style="font-family:' + FONT + ';font-size:clamp(10px,1.2vw,14px);letter-spacing:.62em;color:#91A4B4;text-align:right;margin-bottom:clamp(6px,.8vw,10px);clip-path:inset(0 0 0 100%)">CAPITAL</div>' +
        '<div style="font-family:' + FONT + ';font-weight:600;font-size:clamp(30px,4.2vw,50px);letter-spacing:.22em;line-height:1;color:#F5F7FA;display:flex">' + letters + '</div>' +
      '</div>' +
    '</div>';

  var inner = document.getElementById("mi-inner");
  var poly = document.getElementById("mi-poly");
  var dot = document.getElementById("mi-dot");
  var door = document.getElementById("mi-door");
  var ring = document.getElementById("mi-ring");
  var cap = document.getElementById("mi-cap");
  var letterEls = Array.prototype.slice.call(overlay.querySelectorAll(".mi-letter"));

  var prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    overlay.style.opacity = "0";
    inner.style.transform = "scale(.98)";
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    }, FADE_MS);
  }

  overlay.addEventListener("click", finish);
  function onKey(e) { if (e.key === "Escape") finish(); }
  window.addEventListener("keydown", onKey);

  /* ---------- timeline ---------- */
  function apply(t) {
    // 1) Sinal desenha o M
    var q = easeInOut(seg(t, 0, 1.7));
    poly.setAttribute("stroke-dashoffset", String(LEN * (1 - q)));
    var p = pointAt(LEN * q);
    dot.setAttribute("cx", String(p[0]));
    dot.setAttribute("cy", String(p[1]));
    dot.setAttribute("opacity", String(q > 0 && q < 1 ? 1 : q >= 1 ? 1 - seg(t, 1.7, 1.9) : 0));
    // 2) Fundação: porta surge + onda
    door.setAttribute("transform", doorTransform(easeBack(seg(t, 1.7, 2.2))));
    var r = seg(t, 2.0, 2.8);
    ring.setAttribute("opacity", String(r > 0 && r < 1 ? (1 - r) * 0.8 : 0));
    ring.setAttribute("transform", doorTransform(1 + r * 2.6));
    // 3) MAZARI sai do desfoque, letra a letra
    letterEls.forEach(function (el, k) {
      var v = easeOut(seg(t, 1.9 + k * 0.08, 2.5 + k * 0.08));
      el.style.opacity = String(v);
      el.style.filter = "blur(" + ((1 - v) * 8) + "px)";
    });
    // 4) CAPITAL entra da direita
    cap.style.clipPath = "inset(0 0 0 " + ((1 - easeInOut(seg(t, 2.5, 3.2))) * 100) + "%)";
  }

  var t0 = performance.now();
  function tickIntro(now) {
    if (finished) return;
    var t = (now - t0) / 1000;
    apply(Math.min(t, DURATION));
    if (t >= DURATION + HOLD) { finish(); return; }
    requestAnimationFrame(tickIntro);
  }
  requestAnimationFrame(tickIntro);
})();
