/* MAZARI CAPITAL — lógica do site.
   Convertido do handoff Claude Design (DCLogic/React) para JavaScript puro, sem dependências.
   Comportamentos preservados: feed ao vivo, ciclo de 9 etapas com auto-avanço, animações
   (pacotes, ticker, pulso, reveal, contadores, barras), simulador de participação, abas do
   portal e FAQ em acordeão. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- dados ---------------- */
  var STEPS = [
    { title: "Oportunidade", status: "CADASTRADA", desc: "Um terreno ou imóvel com potencial é identificado e cadastrado pela Presidência da MAZARI.", actions: ["Cadastro do ativo e código", "Localização, fotos e descrição", "Valor e capital necessário"] },
    { title: "Análise e estruturação", status: "EM ESTRUTURAÇÃO", desc: "Documentos, orçamento, cronograma e estrutura jurídica são definidos. Só avança o que está em ordem.", actions: ["Data Room criado", "Orçamento e cronograma aprovados", "Estrutura jurídica definida"] },
    { title: "Publicação", status: "ABERTA", desc: "A operação é liberada para uma unidade MAZARI e passa a aparecer no portal.", actions: ["Unidade autorizada", "Equipe comercial notificada", "Oportunidade visível no portal"] },
    { title: "Sua participação", status: "EM CAPTAÇÃO", desc: "Com o apoio de um consultor, você analisa a documentação e formaliza. O capital só conta quando é confirmado.", actions: ["Cadastro analisado e aprovado", "Contrato formalizado", "Aporte confirmado"] },
    { title: "Execução", status: "EM EXECUÇÃO", desc: "A obra acontece com cronograma, orçamento e fornecedores controlados.", actions: ["Diário com fotos e medições", "Compras e fornecedores", "Percentual físico e financeiro"] },
    { title: "Venda", status: "EM VENDA", desc: "Com o ativo pronto, a operação entra em venda e você acompanha cada movimento.", actions: ["Preço e propostas", "Visitas e compradores", "Venda concluída"] },
    { title: "Apuração", status: "EM APURAÇÃO", desc: "Receitas, custos, tributos, despesas e reservas são apurados com memória de cálculo.", actions: ["Receita da venda", "Custos, tributos e despesas", "Memória de cálculo publicada"] },
    { title: "Distribuição", status: "DISTRIBUIÇÃO", desc: "Após as aprovações, o valor de cada participante é calculado, pago e registrado.", actions: ["Cálculo individual", "Aprovação e pagamento", "Comprovante anexado"] },
    { title: "Encerramento", status: "ENCERRADA", desc: "A operação é encerrada e todo o histórico continua disponível na sua carteira.", actions: ["Relatório final", "Documentos arquivados", "Histórico permanente"] }
  ];

  var POOL = [
    { tag: "APORTE", text: "Participação confirmada · MH-001", color: "#52FF9D" },
    { tag: "OBRA", text: "Fundação concluída · MH-002", color: "#91A4B4" },
    { tag: "DOCUMENTO", text: "Relatório de medição v1 · MH-001", color: "#91A4B4" },
    { tag: "FOTOS", text: "12 novas fotos publicadas · MH-002", color: "#91A4B4" },
    { tag: "VENDA", text: "Proposta registrada · MH-003", color: "#E8C468" },
    { tag: "AUDITORIA", text: "Alteração de cronograma registrada", color: "#91A4B4" },
    { tag: "DISTRIB.", text: "Comprovante anexado · MH-003", color: "#52FF9D" },
    { tag: "OBRA", text: "Estrutura 40% · MH-001", color: "#91A4B4" }
  ];

  /* ---------------- feed de eventos (hero) ---------------- */
  var fmtTime = function (d) { return d.toTimeString().slice(0, 8); };
  var poolIdx = 5;
  var events = POOL.slice(0, 5).map(function (e, i) {
    return { tag: e.tag, text: e.text, color: e.color, time: fmtTime(new Date(Date.now() - i * 7000)) };
  });
  var feedEl = $("#event-feed");

  function renderEvents() {
    feedEl.innerHTML = events.map(function (ev, i) {
      return '<div style="display:grid;grid-template-columns:70px 96px 1fr;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12.5px;opacity:' + (1 - i * 0.16) + '">' +
        '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10.5px;color:#91A4B4">' + ev.time + '</span>' +
        '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9.5px;letter-spacing:.1em;color:' + ev.color + '">' + ev.tag + '</span>' +
        '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ev.text + '</span>' +
        '</div>';
    }).join("");
  }
  renderEvents();
  setInterval(function () {
    var e = POOL[poolIdx++ % POOL.length];
    events.unshift({ tag: e.tag, text: e.text, color: e.color, time: fmtTime(new Date()) });
    events = events.slice(0, 5);
    renderEvents();
  }, 2600);

  /* ---------------- como funciona: 9 etapas ---------------- */
  var STEP_MS = 5000;
  var step = 0, auto = true, stepStart = performance.now();
  var pad = function (n) { return String(n).padStart(2, "0"); };

  var stepsList = $("#steps-list");
  stepsList.innerHTML = STEPS.map(function (s, i) {
    return '<button class="step-btn" data-i="' + i + '" style="display:grid;grid-template-columns:44px 1fr;align-items:center;gap:8px;padding:15px 18px;text-align:left;background:transparent;border:1px solid rgba(255,255,255,.07);border-radius:12px;color:#91A4B4;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-size:17px;transition:all .3s">' +
      '<span class="step-num" style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#91A4B4">' + pad(i + 1) + '</span><span>' + s.title + '</span>' +
      '</button>';
  }).join("");
  $$(".step-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { goStep(parseInt(btn.getAttribute("data-i"), 10)); });
  });

  var stepBar = $("#stepbar");
  var autoBtn = $("#auto-btn");

  function renderStep() {
    $$(".step-btn").forEach(function (btn, i) {
      btn.style.background = i === step ? "#091923" : "transparent";
      btn.style.borderColor = i === step ? "rgba(82,255,157,.55)" : "rgba(255,255,255,.07)";
      btn.style.color = i === step ? "#F5F7FA" : (i < step ? "#C9D3DC" : "#91A4B4");
      btn.querySelector(".step-num").style.color = i <= step ? "#52FF9D" : "#91A4B4";
    });
    var c = STEPS[step];
    $("#step-n").textContent = pad(step + 1);
    $("#step-status").textContent = c.status;
    $("#step-title").textContent = c.title;
    $("#step-desc").textContent = c.desc;
    $("#step-actions").innerHTML = c.actions.map(function (a) {
      return '<div style="display:flex;align-items:center;gap:12px;padding:13px 14px;background:#091923;border-radius:10px;font-size:14px">' +
        '<span style="width:16px;height:16px;border-radius:50%;border:1px solid #52FF9D;display:flex;align-items:center;justify-content:center">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:#52FF9D"></span></span>' + a + '</div>';
    }).join("");
    var pct = Math.round(((step + 1) / STEPS.length) * 100) + "%";
    $("#step-pct").textContent = pct;
    $("#step-pct-bar").style.width = pct;
  }

  function renderAuto() { autoBtn.textContent = auto ? "❚❚ PAUSAR" : "▶ REPRODUZIR"; }

  function goStep(i) {
    stepStart = performance.now();
    step = i;
    auto = false;
    renderAuto();
    if (stepBar) stepBar.style.width = "100%";
    renderStep();
  }

  autoBtn.addEventListener("click", function () {
    stepStart = performance.now();
    auto = !auto;
    renderAuto();
  });

  renderStep();
  renderAuto();

  /* ---------------- animações contínuas ---------------- */
  var packets = $$("[data-packet]");
  var tickerEl = $("[data-ticker]");
  var pulses = $$("[data-pulse]");

  function tick(t) {
    requestAnimationFrame(tick);
    if (auto) {
      var p = (t - stepStart) / STEP_MS;
      if (p >= 1) { stepStart = t; step = (step + 1) % STEPS.length; renderStep(); }
      if (stepBar) stepBar.style.width = Math.min(100, p * 100) + "%";
    }
    if (REDUCED) return;
    packets.forEach(function (el) {
      var off = parseFloat(el.getAttribute("data-packet"));
      el.style.left = (((t / 5200) + off) % 1) * 100 + "%";
    });
    if (tickerEl) {
      var w = tickerEl.scrollWidth / 2;
      tickerEl.style.transform = "translateX(" + (-((t / 40) % w)) + "px)";
    }
    var ph = (Math.sin(t / 420) + 1) / 2;
    pulses.forEach(function (el) {
      el.style.boxShadow = "0 0 0 " + (ph * 5) + "px rgba(82,255,157," + (0.25 - ph * 0.2) + ")";
    });
  }
  requestAnimationFrame(tick);

  /* ---------------- reveal / contadores / barras ---------------- */
  if (!REDUCED && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        if (el.hasAttribute("data-reveal")) {
          var d = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () { el.style.opacity = "1"; el.style.transform = "none"; }, d);
        }
        if (el.hasAttribute("data-count")) {
          var target = parseInt(el.getAttribute("data-count"), 10);
          var t0 = performance.now();
          var run = function (t) {
            var p = Math.min(1, (t - t0) / 1400);
            var e = 1 - Math.pow(1 - p, 3);
            el.textContent = "R$ " + Math.round(target * e).toLocaleString("pt-BR");
            if (p < 1) requestAnimationFrame(run);
          };
          requestAnimationFrame(run);
        }
        if (el.hasAttribute("data-fill")) {
          requestAnimationFrame(function () { el.style.width = el.getAttribute("data-fill") + "%"; });
        }
      });
    }, { threshold: 0.15 });

    $$("[data-reveal],[data-count],[data-fill]").forEach(function (el) {
      if (el.hasAttribute("data-reveal")) {
        el.style.opacity = "0";
        el.style.transform = "translateY(28px)";
        el.style.transition = "opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1)";
      }
      if (el.hasAttribute("data-fill")) {
        el.style.transition = "width 1.4s cubic-bezier(.2,.8,.2,1)";
        el.style.width = "0%";
      }
      io.observe(el);
    });
  }

  /* ---------------- simulador de participação ---------------- */
  var sim = { cotas: 1, total: 20, custo: 200000, vgv: 350000, metodo: "alvenaria" };
  var MESES = { alvenaria: 12, monolev: 7, gablok: 5 };
  var brl = function (n) {
    return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };
  var BTN_BASE = "padding:11px 8px;border-radius:10px;font-family:'Space Grotesk',sans-serif;font-size:14px;cursor:pointer;transition:all .2s;background:transparent;border:1px solid rgba(255,255,255,.1);color:#91A4B4";

  var totWrap = $("#sim-totais");
  [10, 20, 40].forEach(function (n) {
    var b = document.createElement("button");
    b.textContent = n + " cotas";
    b.style.cssText = BTN_BASE;
    b.setAttribute("data-val", n);
    b.addEventListener("click", function () {
      sim.total = n;
      sim.cotas = Math.min(sim.cotas, n);
      renderSim();
    });
    totWrap.appendChild(b);
  });

  var metWrap = $("#sim-metodos");
  [["alvenaria", "Alvenaria"], ["monolev", "MONOLEV"], ["gablok", "GABLOK"]].forEach(function (pair) {
    var b = document.createElement("button");
    b.innerHTML = "<span>" + pair[1] + "</span><span style=\"font-family:'JetBrains Mono',monospace;font-size:10px;opacity:.75\">" + MESES[pair[0]] + " meses*</span>";
    b.style.cssText = BTN_BASE + ";display:flex;flex-direction:column;gap:3px;align-items:center";
    b.setAttribute("data-val", pair[0]);
    b.addEventListener("click", function () { sim.metodo = pair[0]; renderSim(); });
    metWrap.appendChild(b);
  });

  $("#sim-cotas-range").addEventListener("input", function (e) { sim.cotas = +e.target.value; renderSim(); });
  $("#sim-custo-range").addEventListener("input", function (e) { sim.custo = +e.target.value; renderSim(); });
  $("#sim-vgv-range").addEventListener("input", function (e) { sim.vgv = +e.target.value; renderSim(); });

  function markActive(wrap, val) {
    $$("button", wrap).forEach(function (b) {
      var on = b.getAttribute("data-val") === String(val);
      b.style.background = on ? "#091923" : "transparent";
      b.style.borderColor = on ? "rgba(82,255,157,.6)" : "rgba(255,255,255,.1)";
      b.style.color = on ? "#F5F7FA" : "#91A4B4";
    });
  }

  function renderSim() {
    var bruto = Math.max(0, sim.vgv - sim.custo);
    var trib = bruto * 0.10;
    var liq = bruto - trib;
    var mz = liq * 0.25;
    var cot = liq * 0.75;
    var vCota = sim.custo / sim.total;
    var porCota = cot / sim.total;
    var cotas = Math.min(sim.cotas, sim.total);
    var aporte = cotas * vCota;
    var lucro = cotas * porCota;
    var meses = MESES[sim.metodo];
    var retPct = vCota ? (porCota / vCota) * 100 : 0;
    var pctW = function (x) { return (sim.vgv ? (x / sim.vgv) * 100 : 0).toFixed(2) + "%"; };

    var range = $("#sim-cotas-range");
    range.max = sim.total;
    range.value = cotas;
    $("#sim-cotas-txt").textContent = cotas + (cotas > 1 ? " cotas" : " cota");
    $("#sim-custo-txt").textContent = brl(sim.custo);
    $("#sim-vgv-txt").textContent = brl(sim.vgv);
    markActive(totWrap, sim.total);
    markActive(metWrap, sim.metodo);

    $("#r-lucro").textContent = brl(lucro);
    $("#r-aporte").textContent = brl(aporte);
    $("#r-total").textContent = brl(aporte + lucro);
    $("#r-ret").textContent = retPct.toFixed(1).replace(".", ",") + "%";
    $("#w-custo").style.width = pctW(sim.custo);
    $("#w-trib").style.width = pctW(trib);
    $("#w-mz").style.width = pctW(mz);
    $("#w-cot").style.width = pctW(cot);
    $("#r-bruto").textContent = brl(bruto);
    $("#r-trib").textContent = brl(trib);
    $("#r-liq").textContent = brl(liq);
    $("#r-cotmz").textContent = brl(cot) + " · " + brl(mz);
    $("#r-cota").textContent = brl(vCota) + " · " + brl(porCota);
    $("#r-prazo").textContent = meses + " meses · " + (retPct / meses).toFixed(2).replace(".", ",") + "% ao mês";
  }
  renderSim();

  /* ---------------- portal (abas) ---------------- */
  $$("#portal-tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = btn.getAttribute("data-tab");
      $$("#portal-tabs button").forEach(function (b) {
        var on = b.getAttribute("data-tab") === k;
        b.style.background = on ? "#091923" : "transparent";
        b.style.color = on ? "#F5F7FA" : "#91A4B4";
      });
      $$(".portal-panel").forEach(function (p) {
        p.style.display = p.getAttribute("data-panel") === k ? "" : "none";
      });
    });
  });

  /* ---------------- FAQ (acordeão) ---------------- */
  $$(".faq-item").forEach(function (item) {
    item.querySelector(".faq-q").addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      $$(".faq-item").forEach(function (it) {
        it.classList.remove("open");
        it.querySelector(".faq-a").style.display = "none";
        it.querySelector(".faq-sign").textContent = "+";
      });
      if (!wasOpen) {
        item.classList.add("open");
        item.querySelector(".faq-a").style.display = "";
        item.querySelector(".faq-sign").textContent = "−";
      }
    });
  });
})();
