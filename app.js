(function () {
  'use strict';
  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var PLANS = [
    { id: 'mini', name: 'Mini', tag: 'Pra começar a coleção', base: 69.9, bg: 'c-lilac', items: ['3 a 4 itens surpresa', '1 colecionável do tema', 'Pins e adesivos exclusivos', 'Cartão colecionável numerado'] },
    { id: 'classica', name: 'Surpresinha', tag: 'O equilíbrio perfeito', base: 119.9, bg: 'c-lime', hot: true, items: ['5 a 7 itens surpresa', 'Camiseta exclusiva do tema', '1 colecionável + 1 item útil', 'Guloseima nerd importada', 'Revista digital do mês'] },
    { id: 'surpresona', name: 'Surpresona', tag: 'Pra quem quer tudo', base: 199.9, bg: 'c-pink', items: ['8 a 10 itens surpresa', 'Camiseta + item premium do mês', 'Acesso antecipado às pré-vendas', 'Brinde extra no aniversário', 'Tudo da Surpresinha'] }
  ];
  var BILL = [
    { id: 'mensal', label: 'Mensal', off: 0, months: 1, note: 'Cobrado todo mês. Cancele quando quiser.' },
    { id: 'trimestral', label: 'Trimestral', off: 0.1, months: 3 },
    { id: 'anual', label: 'Anual', off: 0.2, months: 12 }
  ];
  var FAQ = [
    ["O que vem na Surpresinha?", "Cada Surpresinha é sempre surpresa, mas você pode esperar produtos como cartas e boosters de TCG, pelúcias, bonecos, roupas, blind boxes, chaveiros, acessórios e itens de decoração, tudo ligado aos filmes, games, séries, quadrinhos, desenhos e animes que a gente ama."],
    ["Se eu assinar hoje, qual caixa eu recebo?", "As vendas de cada tema acontecem do dia 15 de um mês até o dia 14 do mês seguinte. O tema da vez aparece sempre nas imagens da página do plano."],
    ["Quando a caixa é enviada? Quando recebo o código de rastreio?", "Os envios não são imediatos: a janela começa todo dia 15 e pode levar até 10 dias úteis para todas as caixas saírem. Se você assinar hoje, a sua primeira Surpresinha será enviada a partir do próximo dia 15. Assim que ela sair do nosso centro de distribuição, você recebe por e-mail o link para acompanhar a entrega."],
    ["Quais as diferenças entre os planos?", "Mensal: cancele quando quiser, sem multa. A assinatura renova todo mês no valor do plano escolhido + frete.\nTrimestral: você recebe as próximas 3 caixas. Se cancelar antes de completar os 3 meses, é cobrada uma multa de 20% sobre o valor que ainda falta pagar. Renova automaticamente a cada 3 meses.\nAnual: você recebe as próximas 12 caixas. Se cancelar antes de completar os 12 meses, é cobrada uma multa de 20% sobre o valor que ainda falta pagar. Renova automaticamente a cada 12 meses."],
    ["A renovação da assinatura é automática?", "Sim. A assinatura se renova sozinha, então você não precisa comprar de novo no mês seguinte. Se houver algum problema na cobrança, avisamos por e-mail e você pode trocar o cartão ou mudar a data de pagamento."],
    ["Posso cancelar a assinatura?", "Sim, pelo chat do nosso site. Existem dois tipos de cancelamento:\n• Cancelar a renovação: pode ser feito a qualquer momento, sem multa.\n• Cancelar a assinatura em andamento: nos planos trimestral e anual, pode haver multa de 20% sobre o valor restante. No plano mensal não há multa."],
    ["Qual o valor do frete?", "O frete tem preço fixo por caixa enviada e varia conforme a região:\n• Sul e Sudeste: R$ 15,99\n• Centro-Oeste e Nordeste: R$ 20,99\n• Norte: R$ 25,99"]
  ];
  var S = { billing: 'mensal', faq: 0, newsDone: false, newsEmail: '',
    co: { open: false, step: 1, plan: 'classica', size: 'M', gift: false, name: '', email: '', cep: '' } };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
  function bill() { return BILL.filter(function (b) { return b.id === S.billing; })[0]; }
  function price(p) { return p.base * (1 - bill().off); }
  function nextMonth() {
    var n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), 25, 23, 59, 59);
    if (n > t) t = new Date(n.getFullYear(), n.getMonth() + 1, 25);
    return MONTHS[(t.getMonth() + 1) % 12];
  }
  function validCo() {
    var c = S.co;
    return c.name.trim().length > 1 && /.+@.+\..+/.test(c.email) && c.cep.replace(/\D/g, '').length === 8;
  }

  function segs(extraStyle, withOff) {
    return BILL.map(function (b) {
      var on = b.id === S.billing;
      return '<button class="seg' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="bill" data-v="' + b.id + '"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '>' + b.label +
        (withOff && b.off ? '<span style="padding: 4px 8px; border-radius: 999px; background: #F07DF0; color: #0B0614; font: 700 11px/1 \'Rubik\', sans-serif">-' + Math.round(b.off * 100) + '%</span>' : '') + '</button>';
    }).join('');
  }

  function renderPlans() {
    $('billing').innerHTML = segs('', true);
    var b = bill();
    $('plans').innerHTML = PLANS.map(function (p) {
      var note = b.months === 1 ? b.note : money(price(p) * b.months) + ' a cada ' + (b.months === 3 ? '3 meses' : '12 meses') + ' (economia de ' + money((p.base - price(p)) * b.months) + ')';
      return '<article class="plancard' + (p.hot ? ' hot' : '') + '">' +
        '<div class="' + p.bg + '" style="border-radius: 16px; height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; position: relative">' +
        (p.hot ? '<span style="position: absolute; top: 12px; right: 12px; padding: 7px 12px; border-radius: 999px; background: #0B0614; color: #F2E86B; font: 700 10px/1 \'Rubik\', sans-serif; letter-spacing: 0.1em; text-transform: uppercase">Mais pedida</span>' : '') +
        '<span style="font: 400 34px/1 \'Lilita One\', sans-serif; color: #0B0614">' + p.name + '</span>' +
        '<span style="font: 500 13px/1 \'Rubik\', sans-serif; color: #0B0614; opacity: 0.75">' + p.tag + '</span></div>' +
        '<div style="padding: 0 8px"><div style="display: flex; align-items: baseline; gap: 6px"><span style="font: 700 42px/1 \'Bricolage Grotesque\', sans-serif; letter-spacing: -0.02em">' + money(price(p)) + '</span><span style="font: 500 14px/1 \'Rubik\', sans-serif; color: #A39CB0">/mês</span></div>' +
        '<p style="margin: 8px 0 0; font: 400 13px/1.45 \'Rubik\', sans-serif; color: #A39CB0">' + note + '</p></div>' +
        '<ul style="list-style: none; margin: 0; padding: 0 8px; display: flex; flex-direction: column; gap: 11px; flex: 1">' +
        p.items.map(function (it) { return '<li style="display: flex; gap: 10px; align-items: center; font: 400 14px/1.4 \'Rubik\', sans-serif; color: #E8E2EF"><span class="' + p.bg + '" style="width: 9px; height: 9px; border-radius: 50%; flex: none"></span>' + it + '</li>'; }).join('') +
        '</ul><button class="btn ' + (p.hot ? 'btn-main' : 'btn-alt') + '" style="width: 100%" data-act="open" data-v="' + p.id + '">Assinar ' + p.name + '</button></article>';
    }).join('');
  }

  function renderFaq() {
    $('faqs').innerHTML = FAQ.map(function (f, i) {
      var open = S.faq === i;
      return '<div style="border-bottom: 1px solid #2E2B36"><button class="faqq" aria-expanded="' + open + '" data-act="faq" data-v="' + i + '">' + f[0] +
        '<span class="' + (open ? 'c-lime' : 'c-purple') + '" style="width: 34px; height: 34px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; color: #0B0614; font: 400 22px/1 \'Lilita One\', sans-serif">' + (open ? '−' : '+') + '</span></button>' +
        (open ? '<p style="margin: 0 0 22px; padding-right: 50px; font: 400 15px/1.65 \'Rubik\', sans-serif; color: #CFC8D8; white-space: pre-line">' + f[1] + '</p>' : '') + '</div>';
    }).join('');
  }

  function renderNews() {
    if (!S.newsDone) {
      $('news').innerHTML = '<form data-form="news" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end"><div class="field" style="flex: 1 1 240px"><label for="news-email">Seu e-mail</label><input id="news-email" type="email" required placeholder="voce@exemplo.com"></div><button type="submit" class="btn btn-main">Quero spoilers</button></form>';
    } else {
      $('news').innerHTML = '<div style="padding: 20px 24px; border-radius: 20px; background: #1C1A21; border: 2px solid #7ED957"><p style="margin: 0; font: 400 22px/1.2 \'Lilita One\', sans-serif; color: #7ED957">Prontinho!</p><p style="margin: 6px 0 0; font: 400 14px/1.5 \'Rubik\', sans-serif; color: #CFC8D8">Os próximos spoilers vão chegar em ' + esc(S.newsEmail) + '.</p></div>';
    }
  }

  function renderModal() {
    var c = S.co, el = $('modal');
    if (!c.open) { el.innerHTML = ''; document.body.style.overflow = ''; return; }
    document.body.style.overflow = 'hidden';
    var b = bill(), cp = PLANS.filter(function (p) { return p.id === c.plan; })[0];
    var title = c.step === 4 ? 'Assinatura feita!' : (c.gift ? 'Presentear com a Surpresinha' : 'Assinar a Surpresinha');
    var h = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + title + '" data-act="backdrop"><div style="width: 100%; max-width: 640px; background: #1C1A21; border: 3px solid #2E2B36; border-radius: 32px; padding: 32px; display: flex; flex-direction: column; gap: 24px">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px"><h2 style="margin: 0; font: 400 28px/1.1 \'Lilita One\', sans-serif">' + title + '</h2>' +
      '<button class="btn btn-ghost" style="padding: 0; width: 48px" aria-label="Fechar" data-act="close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>';
    if (c.step < 4) {
      h += '<div style="display: flex; gap: 8px">' + ['Plano', 'Entrega', 'Revisão'].map(function (l, i) {
        return '<div style="flex: 1; display: flex; flex-direction: column; gap: 8px"><div class="' + (i + 1 <= c.step ? 'c-lime' : 'c-purple') + '" style="height: 6px; border-radius: 999px"></div><span style="font: 700 11px/1 \'Rubik\', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #CFC8D8">' + l + '</span></div>';
      }).join('') + '</div>';
    }
    if (c.step === 1) {
      h += '<div style="display: flex; flex-direction: column; gap: 20px"><div style="display: flex; flex-direction: column; gap: 10px">' +
        PLANS.map(function (p) {
          var on = p.id === c.plan;
          return '<button class="pickrow' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="plan" data-v="' + p.id + '"><span class="' + p.bg + '" style="width: 18px; height: 18px; border-radius: 50%; border: 3px solid #0B0614; flex: none"></span><span style="flex: 1; font-weight: 700">' + p.name + '</span><span style="font: 800 18px/1 \'Bricolage Grotesque\', sans-serif">' + money(price(p)) + '<span style="font: 400 13px \'Rubik\', sans-serif; color: #A39CB0">/mês</span></span></button>';
        }).join('') + '</div>' +
        '<div role="group" aria-label="Período" style="display: flex; gap: 4px; padding: 5px; border-radius: 999px; background: #0E0C12; flex-wrap: wrap">' + segs('flex: 1; justify-content: center', false) + '</div>' +
        '<div style="display: flex; flex-direction: column; gap: 10px"><span style="font: 700 12px/1 \'Rubik\', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #CFC8D8">Tamanho da camiseta</span><div style="display: flex; gap: 8px; flex-wrap: wrap">' +
        ['P', 'M', 'G', 'GG', 'XGG'].map(function (z) { var on = z === c.size; return '<button class="size' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="size" data-v="' + z + '">' + z + '</button>'; }).join('') +
        '</div></div><button class="btn btn-main" data-act="next">Continuar</button></div>';
    } else if (c.step === 2) {
      h += '<div style="display: flex; flex-direction: column; gap: 16px">' +
        '<label style="display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 0 16px; border-radius: 14px; background: #0E0C12; cursor: pointer; font: 500 15px/1.3 \'Rubik\', sans-serif"><input type="checkbox" data-in="gift"' + (c.gift ? ' checked' : '') + ' style="width: 20px; height: 20px; accent-color: #7ED957"> É presente? (a gente inclui um cartão personalizado)</label>' +
        '<div class="field"><label for="co-name" id="co-name-label">' + (c.gift ? 'Nome de quem vai receber' : 'Seu nome completo') + '</label><input id="co-name" data-in="name" type="text" autocomplete="name" value="' + esc(c.name) + '"></div>' +
        '<div class="field"><label for="co-email">Seu e-mail</label><input id="co-email" data-in="email" type="email" autocomplete="email" value="' + esc(c.email) + '"></div>' +
        '<div class="field"><label for="co-cep">CEP de entrega</label><input id="co-cep" data-in="cep" type="text" inputmode="numeric" placeholder="00000-000" value="' + esc(c.cep) + '"></div>' +
        '<div style="display: flex; gap: 12px; flex-wrap: wrap"><button class="btn btn-ghost" data-act="back">Voltar</button><button class="btn btn-main" id="co-next" style="flex: 1" data-act="next"' + (validCo() ? '' : ' disabled') + '>Revisar pedido</button></div></div>';
    } else if (c.step === 3) {
      var row = function (k, v) { return '<div style="display: flex; justify-content: space-between; gap: 12px"><span style="color: #A39CB0">' + k + '</span><strong>' + v + '</strong></div>'; };
      h += '<div style="display: flex; flex-direction: column; gap: 18px"><div style="background: #0E0C12; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; gap: 12px; font: 400 15px/1.4 \'Rubik\', sans-serif">' +
        row('Plano', cp.name + ' · ' + b.label) + row('Camiseta', c.size) + row('Para', esc(c.name) + (c.gift ? ' (presente)' : '')) + row('CEP', esc(c.cep)) +
        '<div style="height: 2px; background: #2E2B36"></div><div style="display: flex; justify-content: space-between; gap: 12px; align-items: baseline"><span style="color: #A39CB0">Total ' + (b.months === 1 ? 'por mês' : (b.months === 3 ? 'do trimestre' : 'do ano')) + '</span><strong style="font: 800 30px/1 \'Bricolage Grotesque\', sans-serif; color: #7ED957">' + money(price(cp) * b.months) + '</strong></div>' +
        '<span style="font-size: 13px; color: #A39CB0">+ frete calculado na próxima etapa de pagamento</span></div>' +
        '<div style="display: flex; gap: 12px; flex-wrap: wrap"><button class="btn btn-ghost" data-act="back">Voltar</button><button class="btn btn-main" style="flex: 1" data-act="next">Ir para o pagamento</button></div></div>';
    } else {
      h += '<div style="display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; padding: 10px 0"><img src="assets/blob-risada.png" alt="" class="bob" style="width: 180px; height: auto">' +
        '<p style="margin: 0; font: 800 32px/1.1 \'Bricolage Grotesque\', sans-serif">Bem-vindo(a) ao clube, ' + esc(c.name.trim().split(' ')[0] || 'nerd') + '!</p>' +
        '<p style="margin: 0; font: 400 16px/1.55 \'Rubik\', sans-serif; color: #CFC8D8; max-width: 440px">Aqui entraria o gateway de pagamento. Depois de confirmado, a primeira caixa (' + nextMonth() + ') é despachada e o rastreio chega em ' + esc(c.email) + '.</p>' +
        '<button class="btn btn-main" data-act="close">Fechar</button></div>';
    }
    el.innerHTML = h + '</div></div>';
  }

  function setCo(p) { for (var k in p) S.co[k] = p[k]; renderModal(); }
  function openCheckout(plan) {
    $('mobilemenu').classList.remove('on');
    S.co.open = true; S.co.step = 1; if (plan) S.co.plan = plan; renderModal();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]'); if (!t) return;
    var a = t.getAttribute('data-act'), v = t.getAttribute('data-v');
    if (a === 'backdrop') { if (e.target === t) setCo({ open: false, step: 1 }); return; }
    if (a === 'open') openCheckout(v || 'classica');
    else if (a === 'menu') $('mobilemenu').classList.toggle('on');
    else if (a === 'closemenu') $('mobilemenu').classList.remove('on');
    else if (a === 'bill') { S.billing = v; renderPlans(); renderModal(); }
    else if (a === 'faq') { var i = +v; S.faq = S.faq === i ? -1 : i; renderFaq(); }
    else if (a === 'close') setCo({ open: false, step: 1 });
    else if (a === 'plan') setCo({ plan: v });
    else if (a === 'size') setCo({ size: v });
    else if (a === 'back') setCo({ step: Math.max(1, S.co.step - 1) });
    else if (a === 'next') { if (S.co.step === 2 && !validCo()) return; setCo({ step: S.co.step + 1 }); }
  });
  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-in'); if (!k) return;
    if (k === 'gift') { S.co.gift = e.target.checked; $('co-name-label').textContent = S.co.gift ? 'Nome de quem vai receber' : 'Seu nome completo'; }
    else if (k === 'cep') {
      var d = e.target.value.replace(/\D/g, '').slice(0, 8);
      S.co.cep = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; e.target.value = S.co.cep;
    } else S.co[k] = e.target.value;
    var n = $('co-next'); if (n) n.disabled = !validCo();
  });
  document.addEventListener('change', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('data-in') === 'gift') { S.co.gift = e.target.checked; $('co-name-label').textContent = S.co.gift ? 'Nome de quem vai receber' : 'Seu nome completo'; }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.getAttribute('data-form') !== 'news') return;
    e.preventDefault(); S.newsEmail = $('news-email').value; S.newsDone = true; renderNews();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.co.open) setCo({ open: false, step: 1 }); });

  // personagens seguindo o mouse (bem sutil)
  var gnome = $('gnome'), mush = $('mush'), pend = null, raf1 = null;
  window.addEventListener('mousemove', function (e) {
    pend = { mx: (e.clientX / window.innerWidth) * 2 - 1, my: (e.clientY / window.innerHeight) * 2 - 1 };
    if (raf1) return;
    raf1 = requestAnimationFrame(function () {
      raf1 = null;
      gnome.style.transform = 'translate(' + (pend.mx * 5).toFixed(1) + 'px, ' + (pend.my * 1.5).toFixed(1) + 'px) rotate(' + (pend.mx * 1).toFixed(2) + 'deg)';
      mush.style.transform = 'translate(' + (pend.mx * 3).toFixed(1) + 'px, ' + (pend.my * 1).toFixed(1) + 'px) rotate(' + (pend.mx * 0.6).toFixed(2) + 'deg)';
    });
  });

  // caixa 3D
  var stage = $('boxstage'), cube = $('cube');
  var rot = { x: -14, y: 24 }, vel = { x: 0, y: 0 }, drag = null, idleAt = 0;
  function tick(ts) {
    if (!drag) {
      rot.x += vel.x; rot.y += vel.y; vel.x *= 0.94; vel.y *= 0.94;
      if (Math.abs(vel.x) + Math.abs(vel.y) < 0.08 && ts - idleAt > 1400) {
        var rx = -14 + Math.sin(ts / 1500) * 3, ry = 24 + Math.sin(ts / 2200) * 7;
        var ty = ry + 360 * Math.round((rot.y - ry) / 360);
        rot.x += (rx - rot.x) * 0.035; rot.y += (ty - rot.y) * 0.035;
      }
    }
    rot.x = Math.max(-85, Math.min(85, rot.x));
    cube.style.transform = 'rotateX(' + rot.x.toFixed(2) + 'deg) rotateY(' + rot.y.toFixed(2) + 'deg)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  stage.addEventListener('pointerdown', function (e) {
    stage.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; vel = { x: 0, y: 0 }; stage.style.cursor = 'grabbing';
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    rot.y += dx * 0.45; rot.x -= dy * 0.45; vel = { x: -dy * 0.45, y: dx * 0.45 }; drag = { x: e.clientX, y: e.clientY };
  });
  function up() { if (!drag) return; drag = null; idleAt = performance.now(); stage.style.cursor = 'grab'; }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('keydown', function (e) {
    var k = { ArrowLeft: [0, -6], ArrowRight: [0, 6], ArrowUp: [6, 0], ArrowDown: [-6, 0] }[e.key];
    if (!k) return; e.preventDefault(); vel = { x: k[0], y: k[1] }; idleAt = performance.now();
  });

  renderPlans(); renderFaq(); renderNews();
})();
