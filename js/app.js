/* 
██████████████████████████████████████████████
[ INIT_SCRIPT :: NEIHN_v2025.10 ]
 > Author : Luiz Carmo
 > Module : Interactive Engine
 > Status : RUNNING
██████████████████████████████████████████████
*/

// ===========================
// Navbar responsiva / mobile
// ===========================
const btn = document.getElementById('responsiveMenu');
const nav = document.querySelector('#primary-nav');

if (nav && btn) {
  // Garantir atributos de acessibilidade (caso algo não esteja no HTML)
 
  btn.setAttribute('aria-controls', 'primary-nav');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Abrir menu');

  // Abrir / fechar menu
  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fechar quando clicar em um link do menu
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

;

// ===== Formulário: AJAX + Modal Obrigado (hardened) =====
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // 1) Status: cria se não existir
  let status = document.getElementById('formStatus');
  if (!status) {
    status = document.createElement('p');
    status.id = 'formStatus';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', status);
  }

  // 2) Modal: pega se existir, senão cria
  let back   = document.getElementById('thanksBackdrop');
  let modal  = document.getElementById('thanksModal');
  let closeB = document.getElementById('thanksClose');

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
    back   = document.getElementById('thanksBackdrop');
    modal  = document.getElementById('thanksModal');
    closeB = document.getElementById('thanksClose');
  }

  const onKey = e => { if (e.key === 'Escape') closeModal(); };
  const openModal = () => {
    back.hidden = false;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    closeB?.focus();
    document.addEventListener('keydown', onKey);
  };
  const closeModal = () => {
    back.hidden = true;
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
  };

  back?.addEventListener('click', closeModal);
  closeB?.addEventListener('click', closeModal);

  // 3) Envio com fetch + proteção de múltiplos cliques + timeout
  let sending = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    sending = true;

    const submitBtn = form.querySelector('button[type="submit"], button, input[type="submit"]');
    const original  = submitBtn?.textContent;

    submitBtn && (submitBtn.disabled = true, submitBtn.textContent = 'Enviando…');
    status.textContent = '';

    // Timeout educado (12s) para redes lerdas
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
        openModal();
        status.textContent = 'Mensagem enviada com sucesso.';
      } else {
        let msg = 'Não foi possível enviar. Tente novamente.';
        try {
          const data = await resp.json();
          if (data?.errors?.length) msg = data.errors.map(e => e.message).join(' ');
        } catch {}
        status.textContent = msg;
      }
    } catch (err) {
      status.textContent = (err.name === 'AbortError')
        ? 'Tempo de rede esgotado. Tente novamente.'
        : 'Sem conexão ou bloqueio de rede.';
      console.error('[Form]', err);
    } finally {
      clearTimeout(tId);
      submitBtn && (submitBtn.disabled = false, submitBtn.textContent = original || 'Enviar');
      sending = false;
    }
  });
})();
/* 
██████████████████████████████████████████████
[ END_LOG :: NEIHN_v2025.10 ]g
 > Interaction layer by Luiz Carmo
 > System integrity : OK
 > Status : ONLINE
██████████████████████████████████████████████
*/
