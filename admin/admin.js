(function () {
  "use strict";

  const STORAGE_KEY = "portfolio_admin_content_v1";

  function $(id) { return document.getElementById(id); }

  const state = {
    data: null
  };

  async function loadDefault() {
    // 從專案讀取現有 content.json 作為初始值
    try {
      const res = await fetch("../assets/data/content.json", { cache: "no-store" });
      if (res.ok) {
        state.data = await res.json();
        saveLocal();
        renderAll();
        return;
      }
    } catch (_) {}
    // 若抓不到（例如你還沒放檔），就用最小結構
    state.data = {
      site: { title: "Portfolio", hero: { headlinePrefix: "I'm", typedItems: [], subline: "", social: [] }, about: { image: "", lead: "", body: "" } },
      portfolio: { filters: [{ key: "*", label: "All" }], items: [] },
      journal: { posts: [] }
    };
    saveLocal();
    renderAll();
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data, null, 2));
  }

  function loadLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      state.data = JSON.parse(raw);
      return true;
    } catch {
      return false;
    }
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bindBasicFields() {
    const hero = state.data.site.hero;
    $("heroPrefix").value = hero.headlinePrefix || "";
    $("heroTyped").value = (hero.typedItems || []).join(", ");
    $("heroSubline").value = hero.subline || "";

    $("aboutLead").value = state.data.site.about.lead || "";
    $("aboutBody").value = state.data.site.about.body || "";
    $("aboutImage").value = state.data.site.about.image || "";

    // change listeners
    $("heroPrefix").addEventListener("input", () => { hero.headlinePrefix = $("heroPrefix").value; saveLocal(); });
    $("heroTyped").addEventListener("input", () => {
      hero.typedItems = $("heroTyped").value.split(",").map(s => s.trim()).filter(Boolean);
      saveLocal();
    });
    $("heroSubline").addEventListener("input", () => { hero.subline = $("heroSubline").value; saveLocal(); });

    $("aboutLead").addEventListener("input", () => { state.data.site.about.lead = $("aboutLead").value; saveLocal(); });
    $("aboutBody").addEventListener("input", () => { state.data.site.about.body = $("aboutBody").value; saveLocal(); });
    $("aboutImage").addEventListener("input", () => { state.data.site.about.image = $("aboutImage").value; saveLocal(); });
  }

  function renderFilters() {
    const box = $("filtersList");
    box.innerHTML = "";

    state.data.portfolio.filters.forEach((f, idx) => {
      const row = document.createElement("div");
      row.className = "item-box";

      row.innerHTML = `
        <div class="kv">
          <div class="small-muted">key</div>
          <input class="form-control form-control-sm" data-k="key" value="${f.key || ""}" ${f.key === "*" ? "disabled" : ""} />
          <div class="small-muted">label</div>
          <input class="form-control form-control-sm" data-k="label" value="${f.label || ""}" />
        </div>
        <div class="mt-2 d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" ${f.key === "*" ? "disabled" : ""}>刪除</button>
        </div>
      `;

      const keyEl = row.querySelector('input[data-k="key"]');
      const labelEl = row.querySelector('input[data-k="label"]');
      const delBtn = row.querySelector("button");

      if (keyEl) keyEl.addEventListener("input", () => { f.key = keyEl.value.trim(); saveLocal(); });
      if (labelEl) labelEl.addEventListener("input", () => { f.label = labelEl.value; saveLocal(); });

      delBtn.addEventListener("click", () => {
        if (f.key === "*") return;
        state.data.portfolio.filters.splice(idx, 1);
        // 同步移除 items.filters 中相同 key
        state.data.portfolio.items.forEach(it => {
          it.filters = (it.filters || []).filter(k => k !== f.key);
        });
        saveLocal();
        renderFilters();
        renderItems();
      });

      box.appendChild(row);
    });
  }

  function renderItems() {
    const box = $("itemsList");
    box.innerHTML = "";

    const filterKeys = state.data.portfolio.filters.map(f => f.key).filter(k => k !== "*");

    state.data.portfolio.items.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "item-box";

      const checked = (k) => (it.filters || []).includes(k) ? "checked" : "";

      row.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <strong>${it.title || "(未命名作品)"}</strong>
          <button class="btn btn-sm btn-outline-danger">刪除</button>
        </div>

        <div class="kv mt-2">
          <div class="small-muted">id</div>
          <input class="form-control form-control-sm" data-k="id" value="${it.id || ""}" placeholder="project-xxx" />
          <div class="small-muted">title</div>
          <input class="form-control form-control-sm" data-k="title" value="${it.title || ""}" />
          <div class="small-muted">subtitle</div>
          <input class="form-control form-control-sm" data-k="subtitle" value="${it.subtitle || ""}" />
          <div class="small-muted">thumb</div>
          <input class="form-control form-control-sm" data-k="thumb" value="${it.thumb || ""}" placeholder="留空＝自動 placeholder" />
          <div class="small-muted">projectUrl</div>
          <input class="form-control form-control-sm" data-k="projectUrl" value="${(it.details && it.details.projectUrl) || ""}" />
          <div class="small-muted">description</div>
          <textarea class="form-control form-control-sm" data-k="desc" rows="3">${(it.details && it.details.descriptionBody) || ""}</textarea>
        </div>

        <div class="mt-2">
          <div class="small-muted mb-1">filters</div>
          <div class="d-flex flex-wrap gap-2">
            ${filterKeys.map(k => `
              <label class="form-check form-check-inline m-0">
                <input class="form-check-input" type="checkbox" value="${k}" ${checked(k)} />
                <span class="form-check-label">${k}</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="mt-2">
          <div class="small-muted mb-1">detail images（最多 3 張，留空＝placeholder）</div>
          <div class="row g-2">
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="0" value="${(it.details?.images?.[0]) || ""}" /></div>
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="1" value="${(it.details?.images?.[1]) || ""}" /></div>
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="2" value="${(it.details?.images?.[2]) || ""}" /></div>
          </div>
        </div>
      `;

      // bind
      const delBtn = row.querySelector("button.btn-outline-danger");
      delBtn.addEventListener("click", () => {
        state.data.portfolio.items.splice(idx, 1);
        saveLocal();
        renderItems();
      });

      row.querySelector('input[data-k="id"]').addEventListener("input", (e) => { it.id = e.target.value.trim(); saveLocal(); });
      row.querySelector('input[data-k="title"]').addEventListener("input", (e) => { it.title = e.target.value; saveLocal(); renderItems(); });
      row.querySelector('input[data-k="subtitle"]').addEventListener("input", (e) => { it.subtitle = e.target.value; saveLocal(); });
      row.querySelector('input[data-k="thumb"]').addEventListener("input", (e) => { it.thumb = e.target.value; saveLocal(); });

      row.querySelector('input[data-k="projectUrl"]').addEventListener("input", (e) => {
        it.details = it.details || {};
        it.details.projectUrl = e.target.value;
        saveLocal();
      });

      row.querySelector('textarea[data-k="desc"]').addEventListener("input", (e) => {
        it.details = it.details || {};
        it.details.descriptionBody = e.target.value;
        saveLocal();
      });

      row.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
          const v = cb.value;
          const set = new Set(it.filters || []);
          if (cb.checked) set.add(v); else set.delete(v);
          it.filters = Array.from(set);
          saveLocal();
        });
      });

      row.querySelectorAll("input[data-img]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const i = Number(inp.getAttribute("data-img"));
          it.details = it.details || {};
          it.details.images = it.details.images || ["", "", ""];
          it.details.images[i] = inp.value;
          saveLocal();
        });
      });

      box.appendChild(row);
    });
  }

  function renderAll() {
    bindBasicFields();
    renderFilters();
    renderItems();
  }

  // Buttons
  $("btnAddFilter").addEventListener("click", () => {
    state.data.portfolio.filters.push({ key: "new", label: "New" });
    saveLocal();
    renderFilters();
  });

  $("btnAddItem").addEventListener("click", () => {
    const n = state.data.portfolio.items.length + 1;
    state.data.portfolio.items.push({
      id: `project-${String(n).padStart(2, "0")}`,
      title: `Work ${n}`,
      subtitle: "",
      filters: [],
      thumb: "",
      lightbox: "",
      externalUrl: "",
      details: {
        category: "",
        client: "",
        date: "",
        projectUrl: "",
        descriptionTitle: "",
        descriptionBody: "",
        images: ["", "", ""]
      }
    });
    saveLocal();
    renderItems();
  });

  $("btnExport").addEventListener("click", () => {
    downloadJson("content.json", state.data);
  });

  $("btnImport").addEventListener("click", () => $("fileInput").click());

  $("fileInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const txt = await f.text();
    try {
      state.data = JSON.parse(txt);
      saveLocal();
      renderAll();
      alert("匯入成功");
    } catch {
      alert("JSON 解析失敗");
    } finally {
      e.target.value = "";
    }
  });

  // init
  if (!loadLocal()) loadDefault();
  else renderAll();
})();
