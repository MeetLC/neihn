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

// ===== Formulário: AJAX + Modal Obrigado =====
(() => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  const m = document.getElementById('thanksModal');
  const back = document.getElementById('thanksBackdrop');
  const closeBtn = document.getElementById('thanksClose');

  const openModal = () => {
    back.hidden = false;
    m.hidden = false;
    document.body.classList.add('no-scroll');
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  };
  const closeModal = () => {
    back.hidden = true;
    m.hidden = true;
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape') closeModal(); };

  back.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // impede o redirect do Formspree
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;

    // UX de envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    status.textContent = '';

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (resp.ok) {
        form.reset();                // limpa o formulário
        openModal();                 // mostra "Obrigado"
        status.textContent = 'Mensagem enviada com sucesso.';
      } else {
        // tenta ler detalhes do erro, se houver
        let msg = 'Não foi possível enviar. Tente novamente.';
        try {
          const data = await resp.json();
          if (data?.errors?.length) msg = data.errors.map(e => e.message).join(' ');
        } catch { /* ignore */ }
        status.textContent = msg;
      }
    } catch (err) {
      status.textContent = 'Sem conexão. Verifique sua internet e tente de novo.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
/* 
██████████████████████████████████████████████
[ END_LOG :: NEIHN_v2025.10 ]
 > Interaction layer by Luiz Carmo
 > System integrity : OK
 > Status : ONLINE
██████████████████████████████████████████████
*/
