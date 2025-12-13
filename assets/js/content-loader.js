(function () {
  "use strict";

  async function loadJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text ?? "";
  }

  function renderHero(data) {
    const hero = data?.site?.hero;
    if (!hero) return;

    const typedEl = qs(".typed");
    if (typedEl && Array.isArray(hero.typedItems)) {
      typedEl.setAttribute("data-typed-items", hero.typedItems.join(", "));
    }

    const h1 = qs("#hero h1");
    if (h1) {
      const prefix = hero.headlinePrefix || "I'm";
      h1.innerHTML = `${prefix} <span class="typed" data-typed-items="${(hero.typedItems || []).join(", ")}"></span>`;
    }

    setText(qs("#hero p"), hero.subline || "");

    const ul = qs("#hero .list-social");
    if (ul && Array.isArray(hero.social)) {
      ul.innerHTML = hero.social
        .map(
          (s) =>
            `<li><a href="${s.url || "#"}" aria-label="${s.label || ""}"><i class="${s.iconClass || ""}"></i></a></li>`
        )
        .join("");
    }
  }

  function renderAbout(data) {
    const about = data?.site?.about;
    if (!about) return;

    const img = qs("#about img");
    if (img) {
      img.src = about.image || "";
      window.bindImgFallback(img, "About", 900, 1200);
      img.alt = "about";
    }

    // ✅ 支援 Quill：用 innerHTML 顯示格式（顏色/粗體/字級/連結）
    const leadEl = qs("#about .p-heading");
    if (leadEl) leadEl.innerHTML = about.lead || "";

    const bodyEl = qs("#about .separator");
    if (bodyEl) bodyEl.innerHTML = about.body || "";
  }

  function renderPortfolio(data) {
    const pf = data?.portfolio;
    if (!pf) return;

    const filtersUl = qs("#portfolio-flters");
    if (filtersUl && Array.isArray(pf.filters)) {
      filtersUl.innerHTML = pf.filters
        .map((f, idx) => {
          const key = f.key === "*" ? "*" : `.filter-${f.key}`;
          const active = idx === 0 ? "filter-active" : "";
          return `<li data-filter="${key}" class="${active}">${f.label || f.key}</li>`;
        })
        .join("");
    }

    const container = qs(".portfolio-container");
    if (container && Array.isArray(pf.items)) {
      container.innerHTML = pf.items
        .map((item) => {
          const filterClasses = (item.filters || []).map((k) => `filter-${k}`).join(" ");
          const title = item.title || "";
          const subtitle = item.subtitle || "";
          const thumb = item.thumb || "";
          const lightbox = item.lightbox || item.thumb || "";
          const detailsUrl = `portfolio-details.html?id=${encodeURIComponent(item.id)}`;

          return `
            <div class="col-lg-4 col-md-6 portfolio-item ${filterClasses}">
              <img src="${thumb}" class="img-fluid" alt="${title}">
              <div class="portfolio-info">
                <h4>${title}</h4>
                <p>${subtitle}</p>
                <a href="${lightbox}" data-gallery="portfolioGallery" class="portfolio-lightbox preview-link" title="${title}"><i class="bx bx-plus"></i></a>
                <a href="${detailsUrl}" class="details-link" title="More Details"><i class="bx bx-link"></i></a>
              </div>
            </div>
          `;
        })
        .join("");

      qsa(".portfolio-item img", container).forEach((imgEl) => {
        const label = imgEl.getAttribute("alt") || "Work";
        window.bindImgFallback(imgEl, label, 1200, 900);
      });

      qsa(".portfolio-item a.portfolio-lightbox", container).forEach((a) => {
        if (!a.getAttribute("href")) a.href = window.makePlaceholderDataUri(a.title || "Preview", 1600, 1200);
      });

      // ✅ 修正 Isotope 高度計算時機（避免 Portfolio 被 Journal 吃掉）
      requestAnimationFrame(() => {
        const iso = window.Isotope && Isotope.data(container);

        if (iso) {
          iso.layout();
        } else {
          setTimeout(() => {
            const retryIso = window.Isotope && Isotope.data(container);
            if (retryIso) retryIso.layout();
          }, 120);
        }
      });
    }
  }

  function renderJournal(data) {
    const journal = data?.journal;
    if (!journal?.posts) return;

    const row = qs("#journal .journal-block .row");
    if (!row) return;

    row.innerHTML = journal.posts
      .map((p) => {
        const url = `blog-single.html?id=${encodeURIComponent(p.id)}`;
        return `
          <div class="col-lg-4 col-md-6">
            <div class="journal-info">
              <a href="${url}"><img src="${p.cover || ""}" class="img-responsive" alt="${p.title || "post"}"></a>
              <div class="journal-txt">
                <h4><a href="${url}">${p.title || ""}</a></h4>
                <p class="separator">${p.excerpt || ""}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    qsa("#journal img").forEach((imgEl) => window.bindImgFallback(imgEl, "Post", 1200, 800));
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function renderPortfolioDetails(data) {
    const id = getQueryParam("id");
    if (!id) return;

    const items = data?.portfolio?.items || [];
    const item = items.find((x) => x.id === id);
    if (!item) return;

    setText(qs(".breadcrumbs h2"), item.title || "Portfolio Details");

    const infoUl = qs(".portfolio-info ul");
    if (infoUl) {
      const d = item.details || {};
      const projectUrl = d.projectUrl || "";
      infoUl.innerHTML = `
        <li><strong>Category</strong>: ${d.category || ""}</li>
        <li><strong>Client</strong>: ${d.client || ""}</li>
        <li><strong>Project date</strong>: ${d.date || ""}</li>
        <li><strong>Project URL</strong>: ${
          projectUrl ? `<a href="${projectUrl}" target="_blank" rel="noopener">${projectUrl}</a>` : "-"
        }</li>
      `;
    }

    setText(qs(".portfolio-description h2"), item.details?.descriptionTitle || "");
    const p = qs(".portfolio-description p");
    if (p) p.textContent = item.details?.descriptionBody || "";

    const wrapper = qs(".portfolio-details-slider .swiper-wrapper");
    if (wrapper) {
      const images = (item.details?.images || []).slice(0, 10);
      wrapper.innerHTML = images
        .map((src, idx) => `<div class="swiper-slide"><img src="${src || ""}" alt="${item.title || ""} ${idx + 1}"></div>`)
        .join("");

      qsa(".portfolio-details-slider img").forEach((imgEl, idx) =>
        window.bindImgFallback(imgEl, `${item.title || "Work"} ${idx + 1}`, 1600, 1200)
      );
    }
  }

  function renderBlogSingle(data) {
    const id = getQueryParam("id");
    if (!id) return;

    const posts = data?.journal?.posts || [];
    const post = posts.find((x) => x.id === id);
    if (!post) return;

    setText(qs(".breadcrumbs h2"), "Blog");

    const img = qs(".block-main img");
    if (img) {
      img.src = post.cover || "";
      window.bindImgFallback(img, post.title || "Post", 1600, 900);
    }

    const titleEl = qs(".journal-txt h4 a");
    if (titleEl) titleEl.textContent = post.title || "";

    const authorEl = qs(".post-meta .author a");
    if (authorEl) authorEl.textContent = post.author || "";

    const dateEl = qs(".post-meta .date a");
    if (dateEl) dateEl.textContent = post.date || "";

    const content = qs(".content-main");
    if (content) {
      const paras = qsa(".content-main > p, .content-main > blockquote");
      paras.forEach((n) => n.remove());

      const holder = document.createElement("div");
      holder.innerHTML = post.body || "";
      content.appendChild(holder);
    }
  }

  async function boot() {
    try {
      const data = await loadJson("assets/data/content.json");

      renderHero(data);
      renderAbout(data);
      renderPortfolio(data);
      renderJournal(data);

      renderPortfolioDetails(data);
      renderBlogSingle(data);
    } catch (e) {
      console.error(e);
    }
  }

  window.addEventListener("DOMContentLoaded", boot);
})();
