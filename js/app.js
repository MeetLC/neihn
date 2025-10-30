// ===== navbar (mobile) =====
const btn = document.getElementById('responsiveMenu');
const nav = document.querySelector('.nav-links');

if (nav && btn) {
  // acessibilidade
  nav.id = 'primary-nav';
  btn.setAttribute('aria-controls', 'primary-nav');
  btn.setAttribute('aria-expanded', 'false');

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('active', isOpen);              // troca ícone
    btn.setAttribute('aria-expanded', String(isOpen));   // <— String, não string
  });

  // Fechar o menu ao clicar em um link
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== formspree contact form =====
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');  // use sempre a MESMA grafia

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = 'Enviando...';

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (resp.ok) {
        form.reset();
        if (statusEl) statusEl.textContent = 'Mensagem enviada com sucesso! Obrigado.';
      } else {
        if (statusEl) statusEl.textContent = 'Não foi possível enviar. Tente novamente.';
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Erro de conexão. Verifique sua internet.';
    }
  });
}