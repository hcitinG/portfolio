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

    d.portfolio.items.forEach((it) => {
      it.details = it.details || {};
      it.details.images = it.details.images || ["", "", ""];
      it.filters = Array.isArray(it.filters) ? it.filters : [];
    });

    return d;
  }

  const state = {
    data: null,
    draft: null,
    dirty: false,
    selectedId: null,
  };

  // Quill
  let quillLead = null;
  let quillBody = null;
  let quillSetting = false;

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
    } catch (_) {}

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
        renderItemsUI(false);
      });

      if (labelEl) labelEl.addEventListener("input", () => {
        f.label = labelEl.value;
        markDirty();
      });

      delBtn.addEventListener("click", () => {
        if (f.key === "*") return;
        const removedKey = f.key;

        state.draft.portfolio.filters.splice(idx, 1);
        state.draft.portfolio.items.forEach((it) => {
          it.filters = (it.filters || []).filter((k) => k !== removedKey);
        });

        markDirty();
        renderFilters();
        renderItemsUI(false);
      });

      box.appendChild(row);
    });

    renderFilterDropdown();
  }

  // ===== Items UI =====
  let sortable = null;

  function getFilterKeys() {
    return state.draft.portfolio.filters.map((f) => f.key).filter((k) => k && k !== "*");
  }

  function renderFilterDropdown() {
    const sel = $("itemFilter");
    if (!sel) return;

    const keys = getFilterKeys();
    const keep = sel.value || "*";

    sel.innerHTML = `<option value="*">全部</option>` + keys.map(k => `<option value="${k}">${k}</option>`).join("");
    sel.value = keys.includes(keep) ? keep : "*";
  }

  function setPreview(imgEl, label, w, h, url) {
    if (!imgEl) return;

    const setPh = () => {
      if (window.makePlaceholderDataUri) {
        imgEl.src = window.makePlaceholderDataUri(label || "Image", w || 1200, h || 800);
      } else {
        imgEl.src = "";
      }
    };

    if (!url) {
      setPh();
      return;
    }

    imgEl.onerror = () => setPh();
    imgEl.src = url;
  }

  function applySearchAndFilter(items) {
    const q = ($("itemSearch")?.value || "").trim().toLowerCase();
    const fk = $("itemFilter")?.value || "*";

    return items.filter((it) => {
      const okFilter = fk === "*" ? true : (it.filters || []).includes(fk);
      if (!okFilter) return false;

      if (!q) return true;
      const hay = `${it.title || ""} ${it.id || ""} ${it.subtitle || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderItemsList() {
    const box = $("itemsList");
    box.innerHTML = "";

    const items = applySearchAndFilter(state.draft.portfolio.items);

    items.forEach((it) => {
      const row = document.createElement("div");
      row.className = "item-row" + (it.id === state.selectedId ? " is-active" : "");
      row.setAttribute("data-id", it.id || "");

      const sub = (it.subtitle || "").trim();
      const meta2 = [
        (it.filters || []).length ? (it.filters || []).join(", ") : "no filters",
        sub ? ` · ${sub}` : ""
      ].join("");

      row.innerHTML = `
        <div class="dragHandle" title="拖曳排序">⋮⋮</div>
        <img class="listThumb" alt="${(it.title || "Work").replace(/"/g, "")}">
        <div class="itemMeta">
          <div class="title">${it.title || "(未命名作品)"}</div>
          <div class="sub">${it.id || ""}${meta2 ? " · " + meta2 : ""}</div>
        </div>
        <button class="btn btn-sm btn-outline-primary">編輯</button>
      `;

      const thumbEl = row.querySelector("img.listThumb");
      setPreview(thumbEl, it.title || "Work", 400, 400, (it.thumb || "").trim());

      const open = () => {
        if (!it.id) {
          it.id = `project-${Date.now()}`;
          markDirty();
        }
        state.selectedId = it.id;
        renderItemsUI(false);
      };

      row.querySelector("button").addEventListener("click", open);
      row.addEventListener("dblclick", open);

      box.appendChild(row);
    });

    setupSortable();
  }

  /**
   * 排序語意：把 A 拖到 B 前/後，就是改成你看到的順序
   * - 搜尋中：禁用拖曳（因為只是一小部分結果）
   * - 篩選中：允許拖曳，但只改「目前看到的集合」彼此順序，避免影響其他類別
   */
  function setupSortable() {
    const box = $("itemsList");
    if (!box || !window.Sortable) return;

    const hasQuery = ($("itemSearch")?.value || "").trim().length > 0;
    const canSort = !hasQuery;

    if (sortable) {
      sortable.option("disabled", !canSort);
      return;
    }

    sortable = new Sortable(box, {
      animation: 150,
      handle: ".dragHandle",
      disabled: !canSort,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onEnd: () => {
        const idsInView = Array.from(box.querySelectorAll(".item-row"))
          .map(el => el.getAttribute("data-id"))
          .filter(Boolean);

        // 只重排「目前視圖」這些 id 在全局陣列中的相對順序
        const viewSet = new Set(idsInView);
        const map = new Map(state.draft.portfolio.items.map(it => [it.id, it]));
        const reorderedSubset = idsInView.map(id => map.get(id)).filter(Boolean);

        let ptr = 0;
        state.draft.portfolio.items = state.draft.portfolio.items.map(it => {
          if (!viewSet.has(it.id)) return it;
          const next = reorderedSubset[ptr++];
          return next || it;
        });

        markDirty();
        renderItemsUI(false);
      }
    });
  }

  function getSelectedItem() {
    if (!state.selectedId) return null;
    return (state.draft.portfolio.items || []).find(it => it.id === state.selectedId) || null;
  }

  function bindEditorFilters(it) {
    const box = $("ed_filters");
    if (!box) return;

    const keys = getFilterKeys();
    const checked = (k) => (it.filters || []).includes(k);

    box.innerHTML = keys.map(k => `
      <label class="form-check form-check-inline m-0">
        <input class="form-check-input" type="checkbox" value="${k}" ${checked(k) ? "checked" : ""} />
        <span class="form-check-label">${k}</span>
      </label>
    `).join("");

    box.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", () => {
        const v = cb.value;
        const set = new Set(it.filters || []);
        if (cb.checked) set.add(v);
        else set.delete(v);
        it.filters = Array.from(set);
        markDirty();
        renderItemsList();
      });
    });
  }

  function debounce(fn, wait) {
    let t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn(), wait);
    };
  }

  function bindEditorFields(it) {
    const setTitleHeader = () => {
      $("editingTitle").textContent = `${it.title || "(未命名作品)"}  (${it.id || ""})`;
    };
    setTitleHeader();

    // id
    $("ed_id").value = it.id || "";
    $("ed_id").oninput = () => {
      const nextId = $("ed_id").value.trim();
      if (!nextId) return;

      const exists = state.draft.portfolio.items.some(x => x !== it && x.id === nextId);
      if (exists) return;

      const oldId = it.id;
      it.id = nextId;
      if (state.selectedId === oldId) state.selectedId = nextId;

      markDirty();
      setTitleHeader();
      renderItemsList();
    };

    // title
    $("ed_title").value = it.title || "";
    $("ed_title").oninput = () => {
      it.title = $("ed_title").value;
      markDirty();
      setTitleHeader();
      renderItemsList();
    };

    // subtitle
    $("ed_subtitle").value = it.subtitle || "";
    $("ed_subtitle").oninput = () => {
      it.subtitle = $("ed_subtitle").value;
      markDirty();
      renderItemsList();
    };

    // thumb + preview
    $("ed_thumb").value = it.thumb || "";
    const syncThumb = () => {
      const url = ($("ed_thumb").value || "").trim();
      it.thumb = url;
      markDirty();
      setPreview($("pv_thumb"), it.title || "Work", 400, 400, url);
      renderItemsList();
    };
    $("ed_thumb").oninput = debounce(syncThumb, 200);
    setPreview($("pv_thumb"), it.title || "Work", 400, 400, (it.thumb || "").trim());

    // projectUrl
    $("ed_projectUrl").value = it.details?.projectUrl || "";
    $("ed_projectUrl").oninput = () => {
      it.details = it.details || {};
      it.details.projectUrl = $("ed_projectUrl").value;
      markDirty();
    };

    // desc
    $("ed_desc").value = it.details?.descriptionBody || "";
    $("ed_desc").oninput = () => {
      it.details = it.details || {};
      it.details.descriptionBody = $("ed_desc").value;
      markDirty();
    };

    // filters
    bindEditorFilters(it);

    // detail images + previews
    it.details = it.details || {};
    it.details.images = it.details.images || ["", "", ""];

    const bindImg = (idx, inpId, pvId) => {
      const inp = $(inpId);
      const pv = $(pvId);

      inp.value = it.details.images[idx] || "";
      const sync = () => {
        const url = (inp.value || "").trim();
        it.details.images[idx] = url;
        markDirty();
        setPreview(pv, `${it.title || "Work"} ${idx + 1}`, 800, 600, url);
      };
      inp.oninput = debounce(sync, 200);
      setPreview(pv, `${it.title || "Work"} ${idx + 1}`, 800, 600, (it.details.images[idx] || "").trim());
    };

    bindImg(0, "ed_img0", "pv_img0");
    bindImg(1, "ed_img1", "pv_img1");
    bindImg(2, "ed_img2", "pv_img2");

    // delete
    $("btnDeleteItem").onclick = () => {
      const ok = confirm(`確定要刪除「${it.title || it.id || "未命名"}」嗎？`);
      if (!ok) return;

      const idx = state.draft.portfolio.items.findIndex(x => x === it);
      if (idx >= 0) state.draft.portfolio.items.splice(idx, 1);

      state.selectedId = null;
      markDirty();
      renderItemsUI(false);
    };
  }

  function renderItemEditor() {
    const it = getSelectedItem();

    // 你要求刪掉 empty state：這裡不再切換 itemEditorEmpty
    // 沒選到 item：就把右側欄位清空但仍保留畫面
    if (!it) {
      $("editingTitle").textContent = "";
      $("ed_id").value = "";
      $("ed_title").value = "";
      $("ed_subtitle").value = "";
      $("ed_thumb").value = "";
      $("ed_projectUrl").value = "";
      $("ed_desc").value = "";
      $("ed_filters").innerHTML = "";
      $("ed_img0").value = "";
      $("ed_img1").value = "";
      $("ed_img2").value = "";
      setPreview($("pv_thumb"), "Thumb", 400, 400, "");
      setPreview($("pv_img0"), "Image 1", 800, 600, "");
      setPreview($("pv_img1"), "Image 2", 800, 600, "");
      setPreview($("pv_img2"), "Image 3", 800, 600, "");
      $("btnDeleteItem").onclick = () => alert("請先選擇一個作品再刪除。");
      return;
    }

    it.details = it.details || {};
    it.details.images = it.details.images || ["", "", ""];

    bindEditorFields(it);
  }

  function renderItemsUI(resetEditor = false) {
    if (resetEditor) state.selectedId = null;
    renderFilterDropdown();
    renderItemsList();
    renderItemEditor();
  }

  function renderAll() {
    bindBasicFields();
    renderFilters();

    // 初次載入：如果有 item，就預設選第一個，避免右側空到不知道在幹嘛
    if (!state.selectedId && state.draft.portfolio.items.length) {
      state.selectedId = state.draft.portfolio.items[0].id;
    }

    renderItemsUI(false);
  }

  function applySave() {
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
    const id = `project-${String(n).padStart(2, "0")}`;

    state.draft.portfolio.items.push({
      id,
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

    state.selectedId = id;
    markDirty();
    renderItemsUI(false);
  });

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

  // Search / Filter controls
  const searchEl = $("itemSearch");
  const filterEl = $("itemFilter");
  const btnSearch = $("btnSearch");
  const btnClear = $("btnClearSearch");

  if (searchEl) {
    // 仍保留即時搜尋
    searchEl.addEventListener("input", () => renderItemsUI(false));
    // Enter 也可以觸發
    searchEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") renderItemsUI(false);
    });
  }
  if (btnSearch) btnSearch.addEventListener("click", () => renderItemsUI(false));
  if (btnClear) btnClear.addEventListener("click", () => {
    if (searchEl) searchEl.value = "";
    renderItemsUI(false);
  });
  if (filterEl) filterEl.addEventListener("change", () => renderItemsUI(false));

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

