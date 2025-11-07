/* 
██████████████████████████████████████████████
[ INIT_SCRIPT :: NEIHN_v2025.11 ]
 > Author : Luiz Carmo
 > Module : Interactive Engine
 > Status : RUNNING
██████████████████████████████████████████████
*/

/* ===========================
   Helpers
=========================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
const setHidden = (el, v) => { if (el) el.hidden = !!v; };

/* Foco preso dentro de um container (modal/lightbox) */
function trapFocus(container) {
  const focusables = $$(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    container
  );
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  function cycle(e) {
    if (e.key !== 'Tab') return;
    if (!focusables.length) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  container.__trapHandler = cycle;
  document.addEventListener('keydown', cycle);
  first?.focus();
}
function untrapFocus(container) {
  if (container?.__trapHandler) {
    document.removeEventListener('keydown', container.__trapHandler);
    delete container.__trapHandler;
  }
}

/* ===========================
   Navbar responsiva / mobile
=========================== */
(() => {
  const btn = $('#responsiveMenu');
  const nav = $('#primary-nav');
  if (!btn || !nav) return;

  // Acessibilidade garantida
  btn.setAttribute('aria-controls', 'primary-nav');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Abrir menu');

  const openMenu  = () => {
    nav.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('no-scroll');
  };
  const closeMenu = () => {
    nav.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('no-scroll');
  };
  const toggleMenu = () => (nav.classList.contains('open') ? closeMenu() : openMenu());

  on(btn, 'click', toggleMenu);

  // Fechar ao clicar num link
  $$('#primary-nav a', nav).forEach(a => on(a, 'click', closeMenu));

  // Fechar ao clicar fora do menu (somente quando aberto)
  on(document, 'click', (e) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    closeMenu();
  });

  // Fechar com ESC
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });
})();

/* =============================================
   Formulário: AJAX + Modal "Obrigado" (hardened)
============================================= */
(() => {
  const form = $('#contactForm');
  if (!form) return;

  // Status (ARIA)
  let status = $('#formStatus');
  if (!status) {
    status = document.createElement('p');
    status.id = 'formStatus';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    form.insertAdjacentElement('afterend', status);
  }
  const setStatus = (msg) => { status.textContent = msg || ''; };

  // Modal (usa existente ou cria)
  let back   = $('#thanksBackdrop');
  let modal  = $('#thanksModal');
  let closeB = $('#thanksClose');

  if (!back || !modal || !closeB) {
    const frag = document.createRange().createContextualFragment(`
      <div class="modal__backdrop" id="thanksBackdrop" hidden></div>
      <div class="modal" id="thanksModal" role="dialog" aria-modal="true"
           aria-labelledby="thanksTitle" aria-describedby="thanksDesc" hidden>
        <div class="modal__card">
          <h3 id="thanksTitle">Mensagem enviada!</h3>
          <p id="thanksDesc">Obrigado. Vou te responder em breve.</p>
          <button id="thanksClose" class="btn-small" type="button">Fechar</button>
        </div>
      </div>
    `);
    document.body.appendChild(frag);
    back   = $('#thanksBackdrop');
    modal  = $('#thanksModal');
    closeB = $('#thanksClose');
  }

  const openModal = () => {
    setHidden(back, false);
    setHidden(modal, false);
    document.body.classList.add('no-scroll');
    trapFocus(modal);
  };
  const closeModal = () => {
    setHidden(back, true);
    setHidden(modal, true);
    document.body.classList.remove('no-scroll');
    untrapFocus(modal);
  };

  on(back,   'click', closeModal);
  on(closeB, 'click', closeModal);
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Envio com fetch + proteção + timeout
  let sending = false;
  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    sending = true;

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button');
    const original  = submitBtn?.textContent;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }
    setStatus('');

    // Timeout (12s) — evita travar em rede lenta
    const ctrl = new AbortController();
    const tId  = setTimeout(() => ctrl.abort(), 12000);

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
        signal: ctrl.signal
      });

      if (resp.ok) {
        form.reset();
        setStatus('Mensagem enviada com sucesso.');
        openModal();
      } else {
        let msg = 'Não foi possível enviar. Tente novamente.';
        try {
          const data = await resp.json();
          if (Array.isArray(data?.errors) && data.errors.length) {
            msg = data.errors.map(e => e.message).join(' ');
          }
        } catch {/* ignora JSON inválido */}
        setStatus(msg);
      }
    } catch (err) {
      setStatus(err?.name === 'AbortError'
        ? 'Tempo de rede esgotado. Tente novamente.'
        : 'Sem conexão ou bloqueio de rede.');
      console.error('[Form]', err);
    } finally {
      clearTimeout(tId);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original || 'Enviar'; }
      sending = false;
    }
  });
})();

/* ==================================
   Portfólio: cards + lupa + lightbox
================================== */
(() => {
  const cards = $$('.card[data-full]');
  if (!cards.length) return;

  // Lightbox elems
  const lbBackdrop = $('#lbBackdrop');
  const lightbox   = $('#lightbox');
  const lbImg      = $('#lbImg');
  const lbCaption  = $('#lbCaption');
  const lbClose    = $('#lbClose');
  const lbPrev     = $('#lbPrev');
  const lbNext     = $('#lbNext');

  // Cache dos dados dos cards
  const items = cards.map(card => ({
    full:  card.dataset.full,
    title: card.dataset.title || '',
    alt:   card.querySelector('img')?.alt || card.dataset.title || ''
  }));

  let index = -1;

  const show = (i) => {
    if (i < 0 || i >= items.length) return;
    index = i;
    const it = items[i];
    if (lbImg) {
      lbImg.src = it.full;
      lbImg.alt = it.alt;
    }
    if (lbCaption) lbCaption.textContent = it.title;
  };

  const open = (i) => {
    show(i);
    setHidden(lbBackdrop, false);
    setHidden(lightbox, false);
    document.body.classList.add('no-scroll');
    trapFocus(lightbox);
  };

  const close = () => {
    setHidden(lbBackdrop, true);
    setHidden(lightbox, true);
    document.body.classList.remove('no-scroll');
    if (lbImg) lbImg.src = ''; // libera memória do decode
    untrapFocus(lightbox);
  };

  const next = () => show((index + 1) % items.length);
  const prev = () => show((index - 1 + items.length) % items.length);

  // Click no card e na lupa
  cards.forEach((card, i) => {
    on(card, 'click', () => open(i));
    const zoomBtn = $('.card-zoom', card);
    if (zoomBtn) {
      on(zoomBtn, 'click', (e) => { e.stopPropagation(); open(i); });
    }
    // Teclado (Enter/Espaço) no card
    card.tabIndex = 0;
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); open(i);
      }
    });
  });

  // Controles do lightbox
  on(lbBackdrop, 'click', close);
  on(lbClose,   'click', close);
  on(lbNext,    'click', next);
  on(lbPrev,    'click', prev);

  // Teclado no lightbox
  on(document, 'keydown', (e) => {
    if (lightbox?.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });
})();

/* 
██████████████████████████████████████████████
[ END_LOG :: NEIHN_v2025.11 ]
 > Interaction layer by Luiz Carmo
 > System integrity : OK
 > Status : ONLINE
██████████████████████████████████████████████
*/
