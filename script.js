const nav = document.getElementById('mainNav');
const menuToggle = document.getElementById('menuToggle');
const backToTop = document.getElementById('backToTop');
const headerHeight = document.querySelector('.site-header').offsetHeight;

function toggleMenu() {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
}

menuToggle.addEventListener('click', toggleMenu);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      event.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 4;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

function handleBackToTop() {
  if (window.scrollY > 250) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

window.addEventListener('scroll', handleBackToTop);

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
