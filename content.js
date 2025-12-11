console.log("https://github.com/arnilrashid");



console.log("Tender Filler: table-cell-aware content script loaded");

function setNativeAndFire(el, value) {
  if (!el) return false;
  try {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
  } catch (e) {
    try { el.value = value; } catch(e) {}
  }

  ["keydown","keyup","input","change","blur","focusout"].forEach(evt => {
    try {
      if (evt === "keydown" || evt === "keyup") {
        el.dispatchEvent(new KeyboardEvent(evt, { bubbles: true, cancelable: true }));
      } else {
        el.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true }));
      }
    } catch (err) {}
  });

  return true;
}

// detect table ids in DOM order
function detectTableIds() {
  const ids = [];
  // primary: hidden inputs with hdnTblNum
  const hidden = Array.from(document.querySelectorAll('input[name="hdnTblNum"], input[id="hdnTblNum"]'));
  hidden.forEach(h => {
    const v = (h.value || "").toString().trim();
    if (v && !ids.includes(v)) ids.push(v);
  });

  // fallback: row tr ids
  if (!ids.length) {
    const rows = Array.from(document.querySelectorAll("tr[id^='row']"));
    rows.forEach(r => {
      const m = r.id.match(/^row(\d+)_/);
      if (m && !ids.includes(m[1])) ids.push(m[1]);
    });
  }

  // final fallback: parse from any name attributes
  if (!ids.length) {
    const inputs = Array.from(document.querySelectorAll('[name]'));
    inputs.forEach(i => {
      const n = i.name || "";
      const m = n.match(/^row(\d+)_\d+_\d+/);
      if (m && !ids.includes(m[1])) ids.push(m[1]);
    });
  }

  console.log("Tender Filler: detected tableIds (DOM order):", ids);
  return ids;
}

// For a given tableId, return list of data-cells (first visible input/textarea/select in each td)
function collectCellsForTable(tableId) {
  const rows = Array.from(document.querySelectorAll(`tr[id^="row${tableId}_"]`));
  const cells = [];
  rows.forEach(row => {
    // only use td children (preserve column order)
    const tds = Array.from(row.querySelectorAll("td"));
    tds.forEach(td => {
      // skip tds that look like purely checkbox/selectors (but we'll still try)
      // find first candidate element inside td
      const candidate = td.querySelector("input, textarea, select");
      if (!candidate) return;
      // skip hidden or disabled ones
      if (candidate.type === "hidden" || candidate.hidden) return;
      // treat checkbox specially: if it's the only element in the td and it's a checkbox column, skip it
      if (candidate.type === "checkbox" && td.querySelectorAll("input, textarea, select").length === 1) {
        return;
      }
      // ensure visibility: offsetParent != null OR tag is textarea (textareas may be in flow)
      const visible = (candidate.offsetParent !== null) || candidate.tagName === "TEXTAREA";
      if (!visible) return;
      cells.push(candidate);
    });
  });
  return cells;
}

/**
 * Main filling function:
 * mapping: object with numeric-string keys "1".."13" mapping to desired values
 */
function fillUsingTableCells(mapping) {
  if (!mapping || typeof mapping !== "object") {
    console.warn("Tender Filler: invalid mapping");
    return { setCount: 0, error: "invalid mapping" };
  }

  // Normalize mapping indices
  const keys = Object.keys(mapping).map(k => Number(k)).filter(n => !isNaN(n)).sort((a,b)=>a-b);
  if (!keys.length) {
    console.warn("Tender Filler: no numeric mapping keys found");
    return { setCount: 0, error: "no mapping keys" };
  }
  const maxIndex = keys[keys.length-1];

  // collect all candidate cells in DOM table order
  const tableIds = detectTableIds();
  let allCells = [];
  tableIds.forEach(tid => {
    const cells = collectCellsForTable(tid);
    console.log(`Tender Filler: table ${tid} -> ${cells.length} data-cells found`);
    allCells = allCells.concat(cells);
  });

  // fallback: if nothing collected, try generic tr row scanning
  if (!allCells.length) {
    const rows = Array.from(document.querySelectorAll("tr[id^='row']"));
    rows.forEach(row => {
      const tds = Array.from(row.querySelectorAll("td"));
      tds.forEach(td => {
        const cand = td.querySelector("input, textarea, select");
        if (cand && cand.type !== "hidden" && !cand.hidden) {
          if (!(cand.type === "checkbox" && td.querySelectorAll("input,textarea,select").length === 1)) {
            if ((cand.offsetParent !== null) || cand.tagName === "TEXTAREA") allCells.push(cand);
          }
        }
      });
    });
  }

  console.log("Tender Filler: total candidate cells:", allCells.length);

  const report = [];
  let setCount = 0;
  let cellPtr = 0;

  for (let index = 1; index <= maxIndex; index++) {
    const key = String(index);
    const value = mapping.hasOwnProperty(key) ? mapping[key] : undefined;
    if (value === undefined) {
      report.push({ index, status: "no mapping value" });
      continue;
    }

    // find next available cell
    while (cellPtr < allCells.length && (!allCells[cellPtr] || allCells[cellPtr].type === "hidden")) {
      cellPtr++;
    }
    if (cellPtr >= allCells.length) {
      report.push({ index, status: "no available cell", value });
      continue;
    }

    const el = allCells[cellPtr++];
    const info = { index, value, tag: el.tagName, name: el.name || null, id: el.id || null };

    try {
      const ok = setNativeAndFire(el, String(value));
      info.status = ok ? "set" : "failed";
      if (ok) setCount++;
    } catch (e) {
      info.status = "error";
      info.error = String(e);
    }
    report.push(info);
  }

  console.log("Tender Filler: fill result:", { setCount, totalCells: allCells.length, report });
  return { setCount, totalCells: allCells.length, report };
}

/* message listener */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.action !== "fillAllRows") return;
  try {
    const result = fillUsingTableCells(msg.mapping || {});
    sendResponse({ done: true, ...result });
  } catch (err) {
    console.error("Tender Filler: unexpected error", err);
    sendResponse({ done: false, error: err && err.message });
  }
});

