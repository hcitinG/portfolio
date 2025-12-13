(function () {
  "use strict";

  const STORAGE_KEY = "portfolio_admin_content_v1";

  function $(id) {
    return document.getElementById(id);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function ensureBaseStructure(d) {
    d = d || {};
    d.site = d.site || {};
    d.site.title = d.site.title || "Portfolio";
    d.site.hero =
      d.site.hero || { headlinePrefix: "I'm", typedItems: [], subline: "", social: [] };
    d.site.about = d.site.about || { image: "", lead: "", body: "" };

    d.portfolio = d.portfolio || { filters: [{ key: "*", label: "All" }], items: [] };
    d.portfolio.filters =
      Array.isArray(d.portfolio.filters) && d.portfolio.filters.length
        ? d.portfolio.filters
        : [{ key: "*", label: "All" }];
    d.portfolio.items = Array.isArray(d.portfolio.items) ? d.portfolio.items : [];

    d.journal = d.journal || { posts: [] };
    d.journal.posts = Array.isArray(d.journal.posts) ? d.journal.posts : [];

    // 確保 items 的 details 結構不會缺
    d.portfolio.items.forEach((it) => {
      it.details = it.details || {};
      it.details.images = it.details.images || ["", "", ""];
    });

    return d;
  }

  const state = {
    data: null,   // 已儲存版本（基準）
    draft: null,  // 正在編輯版本（草稿）
    dirty: false,
  };

  // Quill
  let quillLead = null;
  let quillBody = null;
  let quillSetting = false; // 填值時不要觸發 text-change

  function setDirty(v) {
    state.dirty = v;

    const s = $("saveState");
    if (s) s.textContent = v ? "未儲存" : "已儲存";

    const btn = $("btnSave");
    if (btn) btn.disabled = !v;
  }

  function markDirty() {
    if (!state.dirty) setDirty(true);
  }

  function saveLocal() {
    // 只保存「已儲存版本」
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data, null, 2));
  }

  function loadLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      state.data = ensureBaseStructure(JSON.parse(raw));
      state.draft = deepClone(state.data);
      return true;
    } catch {
      return false;
    }
  }

  async function loadDefault() {
    // 從專案讀取現有 content.json 作為初始值（基準）
    try {
      const res = await fetch("../assets/data/content.json", { cache: "no-store" });
      if (res.ok) {
        state.data = ensureBaseStructure(await res.json());
        state.draft = deepClone(state.data);
        saveLocal();
        renderAll();
        setDirty(false);
        return;
      }
    } catch (_) {}

    // 若抓不到（例如你還沒放檔），就用最小結構
    state.data = ensureBaseStructure({
      site: {
        title: "Portfolio",
        hero: { headlinePrefix: "I'm", typedItems: [], subline: "", social: [] },
        about: { image: "", lead: "", body: "" },
      },
      portfolio: { filters: [{ key: "*", label: "All" }], items: [] },
      journal: { posts: [] },
    });

    state.draft = deepClone(state.data);
    saveLocal();
    renderAll();
    setDirty(false);
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

  function ensureQuill() {
    if (!window.Quill) return;

    if (!quillLead) {
      quillLead = new Quill("#aboutLead", {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      quillLead.on("text-change", () => {
        if (quillSetting) return;
        state.draft.site.about.lead = quillLead.root.innerHTML || "";
        markDirty();
      });
    }

    if (!quillBody) {
      quillBody = new Quill("#aboutBody", {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      quillBody.on("text-change", () => {
        if (quillSetting) return;
        state.draft.site.about.body = quillBody.root.innerHTML || "";
        markDirty();
      });
    }
  }

  function bindBasicFields() {
    const hero = state.draft.site.hero;

    // ===== Hero（讀 draft -> UI）=====
    $("heroPrefix").value = hero.headlinePrefix || "";
    $("heroTyped").value = (hero.typedItems || []).join(", ");
    $("heroSubline").value = hero.subline || "";

    $("heroPrefix").oninput = () => {
      hero.headlinePrefix = $("heroPrefix").value;
      markDirty();
    };

    $("heroTyped").oninput = () => {
      hero.typedItems = $("heroTyped")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      markDirty();
    };

    $("heroSubline").oninput = () => {
      hero.subline = $("heroSubline").value;
      markDirty();
    };

    // ===== About（Quill + image）=====
    ensureQuill();

    $("aboutImage").value = state.draft.site.about.image || "";
    $("aboutImage").oninput = () => {
      state.draft.site.about.image = $("aboutImage").value;
      markDirty();
    };

    if (quillLead && quillBody) {
      quillSetting = true;
      quillLead.root.innerHTML = state.draft.site.about.lead || "";
      quillBody.root.innerHTML = state.draft.site.about.body || "";
      quillSetting = false;
    }
  }

  function renderFilters() {
    const box = $("filtersList");
    box.innerHTML = "";

    state.draft.portfolio.filters.forEach((f, idx) => {
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

      if (keyEl) keyEl.addEventListener("input", () => {
        f.key = keyEl.value.trim();
        markDirty();
      });

      if (labelEl) labelEl.addEventListener("input", () => {
        f.label = labelEl.value;
        markDirty();
      });

      delBtn.addEventListener("click", () => {
        if (f.key === "*") return;
        const removedKey = f.key;

        state.draft.portfolio.filters.splice(idx, 1);

        // 同步移除 items.filters 中相同 key
        state.draft.portfolio.items.forEach((it) => {
          it.filters = (it.filters || []).filter((k) => k !== removedKey);
        });

        markDirty();
        renderFilters();
        renderItems();
      });

      box.appendChild(row);
    });
  }

  function renderItems() {
    const box = $("itemsList");
    box.innerHTML = "";

    const filterKeys = state.draft.portfolio.filters.map((f) => f.key).filter((k) => k !== "*");

    state.draft.portfolio.items.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "item-box";

      const checked = (k) => ((it.filters || []).includes(k) ? "checked" : "");

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
            ${filterKeys
              .map(
                (k) => `
              <label class="form-check form-check-inline m-0">
                <input class="form-check-input" type="checkbox" value="${k}" ${checked(k)} />
                <span class="form-check-label">${k}</span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="mt-2">
          <div class="small-muted mb-1">detail images（最多 3 張，留空＝placeholder）</div>
          <div class="row g-2">
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="0" value="${it.details?.images?.[0] || ""}" /></div>
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="1" value="${it.details?.images?.[1] || ""}" /></div>
            <div class="col-12 col-md-4"><input class="form-control form-control-sm" data-img="2" value="${it.details?.images?.[2] || ""}" /></div>
          </div>
        </div>
      `;

      // delete item
      const delBtn = row.querySelector("button.btn-outline-danger");
      delBtn.addEventListener("click", () => {
        state.draft.portfolio.items.splice(idx, 1);
        markDirty();
        renderItems();
      });

      row.querySelector('input[data-k="id"]').addEventListener("input", (e) => {
        it.id = e.target.value.trim();
        markDirty();
      });

      row.querySelector('input[data-k="title"]').addEventListener("input", (e) => {
        it.title = e.target.value;
        markDirty();
        renderItems(); // header 即時更新
      });

      row.querySelector('input[data-k="subtitle"]').addEventListener("input", (e) => {
        it.subtitle = e.target.value;
        markDirty();
      });

      row.querySelector('input[data-k="thumb"]').addEventListener("input", (e) => {
        it.thumb = e.target.value;
        markDirty();
      });

      row.querySelector('input[data-k="projectUrl"]').addEventListener("input", (e) => {
        it.details = it.details || {};
        it.details.projectUrl = e.target.value;
        markDirty();
      });

      row.querySelector('textarea[data-k="desc"]').addEventListener("input", (e) => {
        it.details = it.details || {};
        it.details.descriptionBody = e.target.value;
        markDirty();
      });

      row.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
          const v = cb.value;
          const set = new Set(it.filters || []);
          if (cb.checked) set.add(v);
          else set.delete(v);
          it.filters = Array.from(set);
          markDirty();
        });
      });

      row.querySelectorAll("input[data-img]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const i = Number(inp.getAttribute("data-img"));
          it.details = it.details || {};
          it.details.images = it.details.images || ["", "", ""];
          it.details.images[i] = inp.value;
          markDirty();
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

  function applySave() {
    // 把草稿套用到已儲存版本，並寫入 localStorage
    state.data = deepClone(state.draft);
    saveLocal();
    setDirty(false);
  }

  // Buttons
  $("btnAddFilter").addEventListener("click", () => {
    state.draft.portfolio.filters.push({ key: "new", label: "New" });
    markDirty();
    renderFilters();
  });

  $("btnAddItem").addEventListener("click", () => {
    const n = state.draft.portfolio.items.length + 1;
    state.draft.portfolio.items.push({
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
        images: ["", "", ""],
      },
    });
    markDirty();
    renderItems();
  });

  // ✅ 新增：儲存按鈕
  const btnSave = $("btnSave");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      applySave();
      alert("已儲存");
    });
  }

  $("btnExport").addEventListener("click", () => {
    if (state.dirty) {
      alert("你有未儲存的變更，請先按「儲存變更」再匯出。");
      return;
    }
    downloadJson("content.json", state.data);
  });

  $("btnImport").addEventListener("click", () => $("fileInput").click());

  $("fileInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const txt = await f.text();
    try {
      const imported = ensureBaseStructure(JSON.parse(txt));
      // 匯入視為新的「已儲存版本」
      state.data = imported;
      state.draft = deepClone(state.data);
      saveLocal();
      renderAll();
      setDirty(false);
      alert("匯入成功");
    } catch {
      alert("JSON 解析失敗");
    } finally {
      e.target.value = "";
    }
  });

  // init
  setDirty(false);

  if (!loadLocal()) {
    loadDefault();
  } else {
    state.data = ensureBaseStructure(state.data);
    state.draft = ensureBaseStructure(state.draft);
    renderAll();
    setDirty(false);
  }
})();
