const WHATSAPP = "5517997397270"; // troque pelo seu número: 55 + DDD + número, sem espaços
const $ = s => document.querySelector(s);

// link do botão de WhatsApp
$("#wa-float").href = $("#wa").href =  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo seu portfólio e gostaria de um orçamento de site.")}`;

// menu no celular
$("#burger").onclick = () => {
  const aberto = $("#menu").classList.toggle("open");
  $("#burger").setAttribute("aria-expanded", aberto);
};
document.querySelectorAll("#menu a").forEach(a => a.onclick = () => {
  $("#menu").classList.remove("open");
  $("#burger").setAttribute("aria-expanded", "false");
});

// elementos aparecendo ao rolar
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("show")), { threshold: .15 });
document.querySelectorAll(".rv").forEach(el => io.observe(el));

// cards de serviços expansíveis (um aberto por vez)
const svcCards = document.querySelectorAll(".svc");
function setSvc(card, open) {
  card.classList.toggle("open", open);
  const btn = card.querySelector(".svc-more");
  btn.setAttribute("aria-expanded", open);
  btn.querySelector(".svc-more-txt").textContent = open ? "Ocultar detalhes" : "Ver detalhes";
  card.querySelector(".svc-panel").inert = !open;
}
svcCards.forEach(card => {
  // clique em qualquer parte da área superior (ou no botão "Ver detalhes") abre/fecha
  card.querySelector(".svc-head").addEventListener("click", () => {
    const abrir = !card.classList.contains("open");
    svcCards.forEach(c => setSvc(c, c === card && abrir));
  });
});

// linha da timeline preenchendo conforme a rolagem
const tl = $("#tl"), fill = $("#fill");
function tlScroll() {
  const r = tl.getBoundingClientRect(), h = innerHeight;
  const p = Math.min(1, Math.max(0, (h * .7 - r.top) / r.height));
  fill.style.height = p * 100 + "%";
}
addEventListener("scroll", tlScroll, { passive: true }); tlScroll();

// prévia real dos sites nos cards
function scalePrev() {
  document.querySelectorAll(".prev").forEach(p => p.firstElementChild.style.transform = `scale(${p.clientWidth / 1200})`);
}
addEventListener("resize", scalePrev); addEventListener("load", scalePrev); scalePrev();

// ===== formulário: validação, envio com animação e WhatsApp =====
const form = $("#form"), ovl = $("#ovl");
const temLetra = /[\p{L}]/u;

const regras = {
  nome(v) {
    v = v.trim();
    if (!v) return "Informe o seu nome.";
    if (!/^[\p{L}][\p{L}' .-]*$/u.test(v)) return "Use apenas letras no nome.";
    if (v.replace(/[^\p{L}]/gu, "").length < 3) return "O nome precisa ter pelo menos 3 letras.";
    return "";
  },
  empresa(v) {
    v = v.trim();
    if (v && !/[\p{L}\p{N}]/u.test(v)) return "Digite um nome de empresa válido.";
    return "";
  },
  whats(v) {
    const d = v.replace(/\D/g, "");
    if (!d) return "Informe o seu WhatsApp.";
    if (d.length < 10 || d.length > 11) return "Digite o WhatsApp com DDD, por exemplo (17) 99999-9999.";
    if (+d.slice(0, 2) < 11) return "DDD inválido.";
    if (d.length === 11 && d[2] !== "9") return "Número de celular inválido.";
    return "";
  },
  email(v) {
    v = v.trim();
    if (!v) return "Informe o seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Digite um e-mail válido, como nome@empresa.com.br.";
    return "";
  },
  msg(v) {
    v = v.trim();
    if (!v) return "Conte o que a sua empresa precisa.";
    if (/https?:\/\/|www\./i.test(v)) return "Não é permitido colocar links na mensagem.";
    if (/(.)\1{5,}/.test(v) || !temLetra.test(v)) return "A mensagem parece inválida. Escreva com as suas palavras.";
    if (v.length < 20 || v.split(/\s+/).length < 4) return "Descreva melhor: escreva uma frase sobre o que a sua empresa precisa.";
    return "";
  }
};

function mostrarErro(el, msg) {
  const box = el.closest(".fld");
  box.classList.toggle("bad", !!msg);
  box.querySelector(".err").textContent = msg;
  el.setAttribute("aria-invalid", msg ? "true" : "false");
}
function validar(nome) {
  const el = form.elements[nome], msg = regras[nome](el.value);
  mostrarErro(el, msg);
  return msg ? el : null;
}

// máscara do WhatsApp: (17) 99999-9999
form.elements.whats.addEventListener("input", e => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
  const corte = d.length > 10 ? 7 : 6;
  let f = d;
  if (d.length > 0) f = "(" + d.slice(0, 2);
  if (d.length > 2) f += ") " + d.slice(2, corte);
  if (d.length > corte) f += "-" + d.slice(corte);
  e.target.value = f;
});

Object.keys(regras).forEach(nome => {
  const el = form.elements[nome];
  el.addEventListener("blur", () => { if (el.value.trim() || el.closest(".fld").classList.contains("bad")) validar(nome); });
  el.addEventListener("input", () => { if (el.closest(".fld").classList.contains("bad")) validar(nome); });
});

let enviando = false;
form.addEventListener("submit", e => {
  e.preventDefault();
  if (enviando || form.elements.site.value) return; // campo escondido preenchido = robô

  const invalidos = Object.keys(regras).map(validar).filter(Boolean);
  const aviso = $("#e-form");
  aviso.classList.toggle("on", invalidos.length > 0);
  aviso.textContent = invalidos.length ? "Corrija os campos destacados em vermelho para enviar." : "";
  if (invalidos.length) { invalidos[0].focus(); return; }

  enviando = true;
  const d = Object.fromEntries(new FormData(form));
  const t = `Olá! Meu nome é ${d.nome.trim()}${d.empresa.trim() ? " (" + d.empresa.trim() + ")" : ""}.\nTipo de site: ${d.tipo}\nWhatsApp: ${d.whats}\nE-mail: ${d.email.trim()}\n${d.msg.trim()}`;
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;

  // 1) carregando
  $("#spin").className = "spin";
  $("#ovl-t").textContent = "Enviando sua solicitação";
  $("#ovl-p").textContent = "Aguarde um instante.";
  $("#ovl-act").hidden = true;
  ovl.hidden = false; ovl.focus();

  // 2) mensagem de agradecimento
  setTimeout(() => {
    $("#spin").className = "spin ok";
    $("#ovl-t").textContent = "Obrigado por entrar em contato conosco!";
    $("#ovl-p").textContent = "Você será encaminhado para o WhatsApp para concluir o atendimento.";
    $("#ovl-wa").href = url;
    $("#ovl-act").hidden = false;
  }, 1800);

  // 3) encaminha para o WhatsApp
  setTimeout(() => { location.href = url; }, 4300);
});

// ao voltar do WhatsApp, a página volta limpa
addEventListener("pageshow", () => { ovl.hidden = true; form.reset(); enviando = false; });

// carrossel 3D de projetos (card central em destaque, sem movimento automático)
(function () {
  const g = document.querySelector("#projetos .grid3");
  if (!g) return;
  const cards = [...g.children], n = cards.length;
  let idx = 0, startX = 0, dragging = false, moved = 0;

  g.tabIndex = 0;
  g.setAttribute("role", "region");
  g.setAttribute("aria-roledescription", "carrossel");
  g.setAttribute("aria-label", "Projetos de exemplo");

  // setas e bolinhas
  const nav = document.createElement("div");
  nav.className = "c3d-nav";
  nav.innerHTML = '<button type="button" class="c3d-btn" aria-label="Projeto anterior">←</button><div class="c3d-dots"></div><button type="button" class="c3d-btn" aria-label="Próximo projeto">→</button>';
  g.insertAdjacentElement("afterend", nav);
  const btns = nav.querySelectorAll(".c3d-btn"), dotsBox = nav.querySelector(".c3d-dots");
  const dots = cards.map((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "c3d-dot";
    b.setAttribute("aria-label", `Projeto ${i + 1}: ${c.querySelector("h3").textContent}`);
    b.onclick = () => go(i);
    dotsBox.appendChild(b);
    return b;
  });

  // posiciona cada card conforme a distância (d) do card central
  function render() {
    cards.forEach((c, i) => {
      let d = i - idx;
      if (d > n / 2) d -= n; else if (d < -n / 2) d += n;
      const a = Math.abs(d);
      c.style.setProperty("--d", d);
      c.style.setProperty("--a", a);
      c.classList.add("show");
      c.classList.toggle("on", d === 0);
      c.classList.toggle("far", a === 2);
      c.classList.toggle("off", a > 2);
      c.querySelectorAll("a").forEach(l => l.tabIndex = d === 0 ? 0 : -1);
    });
    dots.forEach((b, i) => b.setAttribute("aria-current", i === idx));
  }
  function go(i) { idx = (i + n) % n; render(); }

  btns[0].onclick = () => go(idx - 1);
  btns[1].onclick = () => go(idx + 1);

  // teclado: setas esquerda/direita com o carrossel em foco
  g.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
  });

  // arrastar / deslizar o dedo
  g.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true; startX = e.clientX; moved = 0;
  });
  addEventListener("pointermove", e => { if (dragging) moved = Math.max(moved, Math.abs(e.clientX - startX)); });
  addEventListener("pointerup", e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (dx > 50) go(idx - 1); else if (dx < -50) go(idx + 1);
  });
  addEventListener("pointercancel", () => { dragging = false; });
  g.addEventListener("dragstart", e => e.preventDefault());

  // clicar num card lateral traz ele para o centro (só o central abre o link)
  g.addEventListener("click", e => {
    if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; return; }
    const c = e.target.closest(".proj");
    if (!c) return;
    const i = cards.indexOf(c);
    if (i !== idx) { e.preventDefault(); go(i); }
  }, true);

  render();
})();