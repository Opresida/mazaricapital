/* MAZARI CAPITAL — Tela de login.
   Port em JS puro do componente canônico design/components/MazariLogin.tsx (Next.js/React/TS).
   - Logo com animação "Fundação" (1b), executada uma única vez ao abrir; quem usa
     prefers-reduced-motion vê o logo já pronto.
   - Formulário com validação, mostrar/ocultar senha e mensagens de erro.
   - Sem backend nesta fase: envio válido exibe aviso de portal em implantação
     e direciona para o consultor (nenhum login é simulado). */
(function () {
  "use strict";

  /* ---------------- animação "Fundação" (1b) ---------------- */
  var DURATION = 3.0;
  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var easeInOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var easeBack = function (x) { var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  var doorT = function (s) { return "translate(30 46) scale(" + s + ") translate(-30 -46)"; };

  var door = document.getElementById("lg-door");
  var ring = document.getElementById("lg-ring");
  var l1 = document.getElementById("lg-l1");
  var l2 = document.getElementById("lg-l2");
  var d1 = document.getElementById("lg-d1");
  var d2 = document.getElementById("lg-d2");
  var poly = document.getElementById("lg-poly");
  var word = document.getElementById("lg-word");
  var cap = document.getElementById("lg-cap");
  var tag = document.getElementById("lg-tag");
  var tagShown = false;

  function apply(t) {
    door.setAttribute("transform", doorT(easeBack(seg(t, 0, 0.5))));
    var r = seg(t, 0.45, 1.2);
    ring.setAttribute("opacity", String(r > 0 && r < 1 ? (1 - r) * 0.7 : 0));
    ring.setAttribute("transform", doorT(1 + r * 2.2));
    var lg = easeInOut(seg(t, 0.5, 1.2));
    l1.setAttribute("stroke-dashoffset", String(44 * (1 - lg)));
    l2.setAttribute("stroke-dashoffset", String(44 * (1 - lg)));
    var dg = easeInOut(seg(t, 1.1, 1.7));
    d1.setAttribute("stroke-dashoffset", String(32.6 * (1 - dg)));
    d2.setAttribute("stroke-dashoffset", String(32.6 * (1 - dg)));
    var done = t >= 1.7;
    poly.setAttribute("opacity", done ? "1" : "0");
    [l1, l2, d1, d2].forEach(function (el) { el.setAttribute("opacity", done ? "0" : "1"); });
    word.style.clipPath = "inset(0 " + ((1 - easeInOut(seg(t, 1.6, 2.4))) * 100) + "% 0 0)";
    cap.style.clipPath = "inset(0 0 0 " + ((1 - easeInOut(seg(t, 2.1, 2.9))) * 100) + "%)";
    if (t > 2.4 && !tagShown) {
      tagShown = true;
      tag.style.opacity = "1";
      tag.style.transform = "none";
    }
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply(DURATION);
  } else {
    var t0 = performance.now();
    var tickLogo = function (now) {
      var t = (now - t0) / 1000;
      apply(Math.min(t, DURATION));
      if (t < DURATION) requestAnimationFrame(tickLogo);
    };
    requestAnimationFrame(tickLogo);
  }

  /* ---------------- formulário ---------------- */
  var form = document.getElementById("login-form");
  var email = document.getElementById("lg-email");
  var pass = document.getElementById("lg-pass");
  var toggle = document.getElementById("lg-toggle");
  var errBox = document.getElementById("lg-error");
  var infoBox = document.getElementById("lg-info");
  var submit = document.getElementById("lg-submit");

  toggle.addEventListener("click", function () {
    var showing = pass.type === "text";
    pass.type = showing ? "password" : "text";
    toggle.textContent = showing ? "MOSTRAR" : "OCULTAR";
    toggle.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
  });

  function showError(msg) {
    infoBox.style.display = "none";
    errBox.textContent = msg;
    errBox.style.display = "block";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errBox.style.display = "none";
    infoBox.style.display = "none";
    if (!/^\S+@\S+\.\S+$/.test(email.value)) return showError("Informe um e-mail válido.");
    if (pass.value.length < 6) return showError("A senha precisa ter pelo menos 6 caracteres.");
    submit.disabled = true;
    submit.style.opacity = ".8";
    submit.style.cursor = "wait";
    submit.textContent = "Verificando…";
    window.setTimeout(function () {
      submit.disabled = false;
      submit.style.opacity = "1";
      submit.style.cursor = "pointer";
      submit.textContent = "Entrar";
      infoBox.innerHTML = "O Portal MAZARI PARTNERS está em fase de implantação. O seu acesso é liberado pelo consultor — <a href=\"../#contato\" style=\"color:#52FF9D\">fale com a gente</a>.";
      infoBox.style.display = "block";
    }, 900);
  });
})();
