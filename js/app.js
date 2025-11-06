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

// ===== Lightbox para portfólio =====
(() => {
  const galleryImgs = [...document.querySelectorAll('#portfolio .card img')];
  if (!galleryImgs.length) return;

  const lb = document.getElementById('lightbox');
  const back = document.getElementById('lbBackdrop');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCaption');
  const btnClose = document.getElementById('lbClose');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');

  let idx = 0;

  const open = (i) => {
    idx = i;
    const el = galleryImgs[idx];
    const full = el.dataset.full || el.currentSrc || el.src;
    lbImg.src = full;
    lbImg.alt = el.alt || '';
    lbCap.textContent = el.closest('.card')?.dataset.title || el.alt || '';
    back.hidden = false; lb.hidden = false;
    document.body.classList.add('no-scroll');
    btnClose.focus();
    document.addEventListener('keydown', onKey);
  };

  const close = () => {
    back.hidden = true; lb.hidden = true;
    lbImg.src = ''; lbCap.textContent = '';
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
  };

  const prev = () => open((idx - 1 + galleryImgs.length) % galleryImgs.length);
  const next = () => open((idx + 1) % galleryImgs.length);

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    // loop de foco básico
    if (e.key === 'Tab') {
      const focusables = [btnClose, btnPrev, btnNext];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  // abrir ao clicar no botão "Ampliar" ou na imagem
  document.getElementById('portfolio').addEventListener('click', (e) => {
    const btn = e.target.closest('.card-view');
    if (btn) {
      const img = btn.closest('.card').querySelector('img');
      const i = galleryImgs.indexOf(img);
      e.preventDefault(); open(i);
      return;
    }
    const img = e.target.closest('.card img');
    if (img) {
      const i = galleryImgs.indexOf(img);
      if (i >= 0) { e.preventDefault(); open(i); }
    }
  });

  back.addEventListener('click', close);
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
})();

// ===== ScrollSpy robusto (não deixa #home preso como ativo) =====
const headerH = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--header-h')
) || 72;

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const ids = navLinks.map(a => a.getAttribute('href')).filter(h => h && h.startsWith('#'));
const sections = ids.map(sel => document.querySelector(sel)).filter(Boolean);

function setActive(id) {
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function onScrollSpy() {
  const y = window.scrollY + headerH + 1; // compensa a navbar fixa
  let current = sections[0]?.id;

  // pega a ÚLTIMA seção cujo topo já passou do header
  for (const s of sections) {
    if (s.offsetTop <= y) current = s.id;
  }

  // correção de rodapé: ao chegar no fim, garante a última seção
  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  if (atBottom) current = sections[sections.length - 1].id;

  setActive(current);
}

window.addEventListener('scroll', onScrollSpy, { passive: true });
window.addEventListener('resize', onScrollSpy);
document.addEventListener('DOMContentLoaded', onScrollSpy);

/* 
██████████████████████████████████████████████
[ END_LOG :: NEIHN_v2025.10 ]
 > Interaction layer by Luiz Carmo
 > System integrity : OK
 > Status : ONLINE
██████████████████████████████████████████████
*/
