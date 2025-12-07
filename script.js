const nav = document.getElementById('mainNav');
const menuToggle = document.getElementById('menuToggle');
const backToTop = document.getElementById('backToTop');
const headerHeight = document.querySelector('.site-header').offsetHeight;

// 漢堡選單開關
function toggleMenu() {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
}

menuToggle.addEventListener('click', toggleMenu);

// 導覽點擊平滑捲動
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      event.preventDefault();
      const offsetTop =
        target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 4;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });

      // 關掉手機版選單
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// 回到頂部按鈕顯示 / 隱藏
function handleBackToTop() {
  if (window.scrollY > 250) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

window.addEventListener('scroll', handleBackToTop);

// 回到頂部平滑捲動
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Projects slider controls：左右箭頭，每次滑一張卡片寬度
document.querySelectorAll('.slider-btn').forEach((button) => {
  button.addEventListener('click', () => {
    // 找到這個按鈕所在的 slider 容器
    const slider = button.closest('.projects-slider');
    if (!slider) return;

    const row = slider.querySelector('.projects-row');
    if (!row) return;

    const card = row.querySelector('.card.project');
    if (!card) return;

    const direction = button.classList.contains('prev') ? -1 : 1;

    // 取得 gap（避免卡片之間的間距影響計算）
    const styles = window.getComputedStyle(row);
    const gap = parseInt(styles.columnGap || styles.gap || '0', 10) || 0;

    // 一張卡片寬度 + gap，作為每次滑動距離
    const cardWidth = card.getBoundingClientRect().width + gap;

    row.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth',
    });
  });
});
