(function () {
  "use strict";

  // 產生簡易 SVG placeholder，回傳 data URI
  window.makePlaceholderDataUri = function makePlaceholderDataUri(text, w, h) {
    const safe = String(text || "").replace(/[<>&"]/g, "");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<rect width="100%" height="100%" fill="#e9ecef"/>` +
      `<rect x="12" y="12" width="${Math.max(0, w - 24)}" height="${Math.max(0, h - 24)}" fill="#f8f9fa" stroke="#ced4da"/>` +
      `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="${Math.max(14, Math.floor(Math.min(w, h) / 14))}" fill="#6c757d">${safe}</text>` +
      `</svg>`;

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };

  // img.src 若為空或載入失敗 → 自動塞 placeholder
  window.bindImgFallback = function bindImgFallback(imgEl, label, w, h) {
    if (!imgEl) return;
    const setPh = () => {
      imgEl.src = window.makePlaceholderDataUri(label || "Image", w || 1200, h || 800);
    };

    // 空字串或未設定
    if (!imgEl.getAttribute("src") || imgEl.getAttribute("src") === "") setPh();

    imgEl.addEventListener("error", () => setPh());
  };
})();
