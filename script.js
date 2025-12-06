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

// Projects slider controls
document.querySelectorAll('.slider-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    const row = document.querySelector(`.projects-row[data-slider="${target}"]`);
    if (!row) return;

    const card = row.querySelector('.card.project');
    if (!card) return;

    const direction = button.classList.contains('prev') ? -1 : 1;

    // 取得 gap（row 上的 gap 值，可能叫 gap 或 columnGap）
    const styles = window.getComputedStyle(row);
    const gap =
      parseInt(styles.columnGap || styles.gap || '0', 10) || 0;

    // 一張卡片寬度 + gap，作為每次滑動距離
    const cardWidth = card.getBoundingClientRect().width + gap;

    row.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth',
    });
  });
});
;
