(function () {
  "use strict";

  const STORAGE_KEY = "portfolio_admin_content_v1";

  const $ = (id) => document.getElementById(id);
  const deepClone = (o) => JSON.parse(JSON.stringify(o));

  function ensureBaseStructure(d) {
    d = d || {};
    d.site = d.site || {};
    d.site.hero = d.site.hero || { headlinePrefix: "I'm", typedItems: [], subline: "" };
    d.site.about = d.site.about || { image: "", lead: "", body: "" };

    d.portfolio = d.portfolio || {};
    d.portfolio.filters = Array.isArray(d.portfolio.filters) && d.portfolio.filters.length
      ? d.portfolio.filters
      : [{ key: "*", label: "All" }];
    d.portfolio.items = Array.isArray(d.portfolio.items) ? d.portfolio.items : [];

    d.portfolio.items.forEach((it) => {
      it.filters = Array.isArray(it.filters) ? it.filters : [];
      it.details = it.details || {};
      it.details.images = it.details.images || ["", "", ""];
    });

    d.journal = d.journal || { posts: [] };
    return d;
  }

  const state = {
    data: null,
    draft: null,
    dirty: false,
    selectedId: null
  };

  function setDirty(v) {
    state.dirty = v;
    $("saveState").textContent = v ? "未儲存" : "已儲存";
    $("btnSave").disabled = !v;
  }

  function markDirty() {
    if (!state.dirty) setDirty(true);
  }

  function saveLocal() {
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
    } catch {}

    state.data = ensureBaseStructure({});
    state.draft = deepClone(state.data);
    saveLocal();
    renderAll();
    setDirty(false);
  }

  /* ---------- Hero / About ---------- */

  let quillLead = null;
  let quillBody = null;
  let quillSetting = false;

  function ensureQuill() {
    if (!window.Quill) return;

    if (!quillLead) {
      quillLead = new Quill("#aboutLead", { theme: "snow" });
      quillLead.on("text-change", () => {
        if (quillSetting) return;
        state.draft.site.about.lead = quillLead.root.innerHTML || "";
        markDirty();
      });
    }

    if (!quillBody) {
      quillBody = new Quill("#aboutBody", { theme: "snow" });
      quillBody.on("text-change", () => {
        if (quillSetting) return;
        state.draft.site.about.body = quillBody.root.innerHTML || "";
        markDirty();
      });
    }
  }

  function bindBasicFields() {
    const hero = state.draft.site.hero;

    $("heroPrefix").value = hero.headlinePrefix || "";
    $("heroTyped").value = (hero.typedItems || []).join(", ");
    $("heroSubline").value = hero.subline || "";

    $("heroPrefix").oninput = () => { hero.headlinePrefix = $("heroPrefix").value; markDirty(); };
    $("heroTyped").oninput = () => {
      hero.typedItems = $("heroTyped").value.split(",").map(s => s.trim()).filter(Boolean);
      markDirty();
    };
    $("heroSubline").oninput = () => { hero.subline = $("heroSubline").value; markDirty(); };

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

  /* ---------- Filters ---------- */

  function renderFilters() {
    const box = $("filtersList");
    box.innerHTML = "";

    state.draft.portfolio.filters.forEach((f, idx) => {
      const row = document.createElement("div");
      row.className = "item-box";
      row.innerHTML = `
        <div class="kv">
          <div class="small-muted">key</div>
          <input class="form-control form-control-sm" value="${f.key}" ${f.key === "*" ? "disabled" : ""}/>
          <div class="small-muted">label</div>
          <input class="form-control form-control-sm" value="${f.label || ""}"/>
        </div>
        <button class="btn btn-sm btn-outline-danger mt-2" ${f.key === "*" ? "disabled" : ""}>刪除</button>
      `;

      const [keyEl, labelEl] = row.querySelectorAll("input");
      const delBtn = row.querySelector("button");

      keyEl.oninput = () => { f.key = keyEl.value.trim(); markDirty(); renderItemsUI(); };
      labelEl.oninput = () => { f.label = labelEl.value; markDirty(); };

      delBtn.onclick = () => {
        state.draft.portfolio.filters.splice(idx, 1);
        state.draft.portfolio.items.forEach(it => {
          it.filters = it.filters.filter(k => k !== f.key);
        });
        markDirty();
        renderFilters();
        renderItemsUI();
      };

      box.appendChild(row);
    });

    renderFilterDropdown();
  }

  /* ---------- Items UI ---------- */

  function getFilterKeys() {
    return state.draft.portfolio.filters.map(f => f.key).filter(k => k !== "*");
  }

  function renderFilterDropdown() {
    const sel = $("itemFilter");
    sel.innerHTML =
      `<option value="*">全部</option>` +
      getFilterKeys().map(k => `<option value="${k}">${k}</option>`).join("");
  }

  function applySearch(items) {
    const q = $("itemSearch").value.trim().toLowerCase();
    const fk = $("itemFilter").value;
    return items.filter(it => {
      if (fk !== "*" && !it.filters.includes(fk)) return false;
      if (!q) return true;
      return `${it.title} ${it.id}`.toLowerCase().includes(q);
    });
  }

  let sortable = null;

  function renderItemsList() {
    const box = $("itemsList");
    box.innerHTML = "";

    const items = applySearch(state.draft.portfolio.items);

    items.forEach(it => {
      const row = document.createElement("div");
      row.className = "item-row" + (it.id === state.selectedId ? " is-active" : "");
      row.dataset.id = it.id;

      row.innerHTML = `
        <div class="dragHandle">⋮⋮</div>
        <img class="listThumb">
        <div class="itemMeta">
          <div class="title">${it.title || "(未命名)"}</div>
          <div class="sub">${it.id}</div>
        </div>
        <button class="btn btn-sm btn-outline-primary">編輯</button>
      `;

      const img = row.querySelector("img");
      if (window.bindImgFallback) {
        img.src = it.thumb || "";
        window.bindImgFallback(img, it.title || "Work", 400, 400);
      }

      row.querySelector("button").onclick = () => {
        state.selectedId = it.id;
        renderItemsUI(false);
      };

      box.appendChild(row);
    });

    if (!sortable) {
      sortable = new Sortable(box, {
        handle: ".dragHandle",
        animation: 150,
        onEnd() {
          const ids = [...box.children].map(el => el.dataset.id);
          state.draft.portfolio.items = ids.map(id =>
            state.draft.portfolio.items.find(it => it.id === id)
          );
          markDirty();
        }
      });
    }
  }

  function renderEditor() {
    const it = state.draft.portfolio.items.find(x => x.id === state.selectedId);
    $("itemEditorEmpty").classList.toggle("d-none", !!it);
    $("itemEditor").classList.toggle("d-none", !it);
    if (!it) return;

    $("editingTitle").textContent = it.title || it.id;

    $("ed_id").value = it.id;
    $("ed_title").value = it.title || "";
    $("ed_subtitle").value = it.subtitle || "";
    $("ed_thumb").value = it.thumb || "";
    $("ed_projectUrl").value = it.details.projectUrl || "";
    $("ed_desc").value = it.details.descriptionBody || "";

    const pv = $("pv_thumb");
    pv.src = it.thumb || "";
    if (window.bindImgFallback) window.bindImgFallback(pv, it.title, 400, 400);

    $("ed_title").oninput = () => { it.title = $("ed_title").value; markDirty(); renderItemsList(); };
    $("ed_subtitle").oninput = () => { it.subtitle = $("ed_subtitle").value; markDirty(); };
    $("ed_thumb").oninput = () => {
      it.thumb = $("ed_thumb").value;
      pv.src = it.thumb;
      if (window.bindImgFallback) window.bindImgFallback(pv, it.title, 400, 400);
      markDirty();
      renderItemsList();
    };

    $("btnDeleteItem").onclick = () => {
      if (!confirm("確定刪除？")) return;
      state.draft.portfolio.items =
        state.draft.portfolio.items.filter(x => x !== it);
      state.selectedId = null;
      markDirty();
      renderItemsUI();
    };
  }

  function renderItemsUI(reset = true) {
    if (reset) state.selectedId = null;
    renderFilterDropdown();
    renderItemsList();
    renderEditor();
  }

  /* ---------- Overall ---------- */

  function renderAll() {
    bindBasicFields();
    renderFilters();
    renderItemsUI();
  }

  $("btnAddFilter").onclick = () => {
    state.draft.portfolio.filters.push({ key: "new", label: "New" });
    markDirty();
    renderFilters();
  };

  $("btnAddItem").onclick = () => {
    const n = state.draft.portfolio.items.length + 1;
    const id = `project-${String(n).padStart(2, "0")}`;
    state.draft.portfolio.items.push({
      id, title: `Work ${n}`, subtitle: "", filters: [], thumb: "",
      details: { images: ["", "", ""] }
    });
    state.selectedId = id;
    markDirty();
    renderItemsUI(false);
  };

  $("btnSave").onclick = () => {
    state.data = deepClone(state.draft);
    saveLocal();
    setDirty(false);
    alert("已儲存");
  };

  $("btnExport").onclick = () => {
    if (state.dirty) return alert("請先儲存");
    const blob = new Blob([JSON.stringify(state.data, null, 2)]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    a.click();
  };

  $("btnImport").onclick = () => $("fileInput").click();
  $("fileInput").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.data = ensureBaseStructure(JSON.parse(await f.text()));
    state.draft = deepClone(state.data);
    saveLocal();
    renderAll();
    setDirty(false);
  };

  $("itemSearch").oninput = () => renderItemsUI(false);
  $("itemFilter").onchange = () => renderItemsUI(false);

  setDirty(false);
  loadLocal() ? renderAll() : loadDefault();
})();
