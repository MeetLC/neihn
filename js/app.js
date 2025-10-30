// ===========================
// Navbar responsiva / mobile
// ===========================
const btn = document.getElementById('responsiveMenu');
const nav = document.querySelector('.nav-links');

if (nav && btn) {
  // Garantir atributos de acessibilidade (caso algo não esteja no HTML)
  if (!nav.id) {
    nav.id = 'primary-nav';
  }
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