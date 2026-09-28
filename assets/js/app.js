/* 中台 · 行情白名单 Demo */

const OPERATOR = "林晓";
const TYPE_LABEL = {
  retail: "个人散户",
  eam: "EAM / IPI",
};
const EN_NAME_TYPES = new Set(["eam"]);
const MARKET_LABEL = { HK: "港股L2", US: "美股", ALL: "全部" };

const PAGE_COPY = {
  list: {
    title: "行情白名单",
    desc: "列表内用户即具备实时行情资格。个人散户显示中文名称，EAM / IPI 显示英文名称。",
  },
  fees: {
    title: "行情收费配置",
    desc: "港股L2默认每月 270 HKD，美股默认每月 100 HKD。修改后用于本月扣费导出，全部市场按两项合计。",
  },
};

/** Demo：个人散户用中文名，EAM / IPI 用英文名。 */
const MASTER = [
  { tradeAccount: "88010286", accountId: "GH100286", type: "retail", nameZh: "陈志远", nameEn: "CHAN CHI YUEN" },
  { tradeAccount: "88010412", accountId: "GH100412", type: "retail", nameZh: "李婉婷", nameEn: "LI WAN TING" },
  { tradeAccount: "88010655", accountId: "GH100655", type: "retail", nameZh: "张浩然", nameEn: "CHEUNG HO YIN" },
  { tradeAccount: "88010901", accountId: "GH100901", type: "retail", nameZh: "王启明", nameEn: "WONG KAI MING" },
  { tradeAccount: "88011028", accountId: "GH101028", type: "retail", nameZh: "谭小文", nameEn: "TAM SIU MAN" },
  { tradeAccount: "55009021", accountId: "LPOA-9021", type: "eam", nameZh: "顶点财富合伙", nameEn: "Apex Wealth Partners" },
  { tradeAccount: "55007740", accountId: "LPOA-7740", type: "eam", nameZh: "北极星投资", nameEn: "Northstar IPI" },
  { tradeAccount: "55003318", accountId: "LPOA-3318", type: "eam", nameZh: "港湾巷资产管理", nameEn: "Harbour Lane Asset Management" },
];

const PAGE_SIZE = 3;
let listPage = 1;

const fees = {
  HK: { amount: 270, updatedAt: "", updatedBy: "" },
  US: { amount: 100, updatedAt: "", updatedBy: "" },
};

/** @type {Array<{at: string, operator: string, content: string}>} */
const feeLogs = [];

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(s) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function shiftDate(fromStr, days) {
  const d = parseDate(fromStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

let demoToday = formatDate(new Date());

function nowStamp() {
  const d = new Date();
  return `${demoToday} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextMonthFirst(fromStr) {
  const d = parseDate(fromStr || demoToday);
  return formatDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
}

function currentMonthStr(fromStr) {
  return (fromStr || demoToday).slice(0, 7);
}

function monthEndDate(ym) {
  const [y, m] = ym.split("-").map(Number);
  return formatDate(new Date(y, m, 0));
}

function money(n) {
  const v = Math.round(Number(n) * 100) / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function monthlyAmount(market) {
  const hk = fees.HK.amount;
  const us = fees.US.amount;
  const sum = market === "ALL" ? hk + us : market === "HK" ? hk : market === "US" ? us : 0;
  return Math.round(sum * 100) / 100;
}

function displayName(u) {
  if (!u) return "";
  if (EN_NAME_TYPES.has(u.type)) return u.nameEn || u.nameZh || "";
  return u.nameZh || u.nameEn || "";
}

const seedExpire = nextMonthFirst(demoToday);
const ADDR_ZH = "香港中環康樂廣場8號交易廣場1座43樓4306-4307室";
const ADDR_EN = "Unit 2107,China Merchants Tower, Shun Tak Centre,168-200 Connaught Road Central,Hong Kong";

function seedLog(at, action, content, operator) {
  return { at, action, content, operator };
}

/** @type {Array<object>} */
let users = [
  {
    id: "u2",
    type: "retail",
    tradeAccount: "88010412",
    accountId: "GH100412",
    nameZh: "李婉婷",
    nameEn: "LI WAN TING",
    address: ADDR_ZH,
    market: "ALL",
    charge: "yes",
    openAt: "2026-07-18",
    effectiveAt: seedExpire,
    expireAt: null,
    pendingAction: "market",
    pendingMarket: "HK",
    logs: [
      seedLog(
        `${shiftDate(demoToday, -7)} 10:22`,
        "减少市场",
        `开通市场由全部改为港股L2，预计生效 ${seedExpire}，此前仍为全部`,
        "周宁"
      ),
      seedLog("2026-07-18 09:40", "新增", "新增白名单，开通全部，实时生效", "林晓"),
    ],
  },
  {
    id: "u4",
    type: "eam",
    tradeAccount: "55007740",
    accountId: "LPOA-7740",
    nameZh: "北极星投资",
    nameEn: "Northstar IPI",
    address: ADDR_EN,
    market: "US",
    charge: "no",
    openAt: "2026-03-01",
    effectiveAt: null,
    expireAt: seedExpire,
    pendingAction: "remove",
    pendingMarket: null,
    logs: [
      seedLog(
        `${shiftDate(demoToday, -4)} 16:05`,
        "移除行情",
        `已标记整笔移除，预计失效 ${seedExpire}，到期前仍保留`,
        "林晓"
      ),
      seedLog("2026-03-01 11:12", "新增", "新增白名单，开通美股，实时生效", "周宁"),
    ],
  },
  {
    id: "u1",
    type: "retail",
    tradeAccount: "88010286",
    accountId: "GH100286",
    nameZh: "陈志远",
    nameEn: "CHAN CHI YUEN",
    address: ADDR_ZH,
    market: "HK",
    charge: "no",
    openAt: "2025-11-03",
    effectiveAt: null,
    expireAt: null,
    pendingAction: null,
    pendingMarket: null,
    logs: [
      seedLog("2025-11-03 14:18", "新增", "新增白名单，开通港股L2，实时生效", "林晓"),
    ],
  },
  {
    id: "u5",
    type: "retail",
    tradeAccount: "88010901",
    accountId: "GH100901",
    nameZh: "王启明",
    nameEn: "WONG KAI MING",
    address: ADDR_ZH,
    market: "US",
    charge: "yes",
    openAt: "2026-08-05",
    effectiveAt: null,
    expireAt: null,
    pendingAction: null,
    pendingMarket: null,
    logs: [
      seedLog("2026-08-05 10:06", "新增", "新增白名单，开通美股，实时生效", "周宁"),
    ],
  },
  {
    id: "u3",
    type: "eam",
    tradeAccount: "55009021",
    accountId: "LPOA-9021",
    nameZh: "顶点财富合伙",
    nameEn: "Apex Wealth Partners",
    address: ADDR_EN,
    market: "HK",
    charge: "yes",
    openAt: "2026-01-12",
    effectiveAt: null,
    expireAt: null,
    pendingAction: null,
    pendingMarket: null,
    logs: [
      seedLog("2026-01-12 11:03", "新增", "新增白名单，开通港股L2，实时生效", "周宁"),
    ],
  },
];

/** @type {Array<{at: string, action: string, detail: string, operator: string}>} */
let audit = [
  {
    at: `${shiftDate(demoToday, -4)} 16:05`,
    action: "移除行情",
    operator: "林晓",
    detail: `Northstar IPI（交易账号 55007740，LPOA-7740）已标记整笔移除，预计失效 ${seedExpire}，到期前仍保留`,
  },
  {
    at: `${shiftDate(demoToday, -7)} 10:22`,
    action: "减少市场",
    operator: "周宁",
    detail: `李婉婷（交易账号 88010412，GH100412）开通市场由全部改为港股L2，预计生效 ${seedExpire}，此前仍为全部`,
  },
];

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadCsv(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")].concat(
    rows.map((r) => r.map(escape).join(","))
  );
  const blob = new Blob(["\ufeff" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 3200);
}

function pushLog(user, action, content) {
  const entry = { at: nowStamp(), action, content, operator: OPERATOR };
  if (user) {
    if (!user.logs) user.logs = [];
    user.logs.unshift(entry);
  }
  audit.unshift({
    at: entry.at,
    action,
    operator: OPERATOR,
    detail: user
      ? `${displayName(user)}（交易账号 ${user.tradeAccount}，${user.accountId}）${content}`
      : content,
  });
}

function matchByTrade(tradeAccount) {
  const key = String(tradeAccount || "").trim().toLowerCase();
  if (!key) return null;
  return MASTER.find((m) => m.tradeAccount.toLowerCase() === key) || null;
}

function matchByLpoa(lpoa) {
  const key = String(lpoa || "").trim().toLowerCase();
  if (!key) return null;
  return MASTER.find((m) => m.type === "eam" && m.accountId.toLowerCase() === key) || null;
}

function marketChangeKind(from, to) {
  if (from === to) return "none";
  if (to === "ALL") return "increase";
  return "reduce";
}

function isSwitch(from, to) {
  return (from === "HK" && to === "US") || (from === "US" && to === "HK");
}

function pendingNote(u) {
  if (u.pendingAction === "remove" && u.expireAt) {
    return `预计 ${u.expireAt} 移除行情（到期前仍保留）`;
  }
  if (u.pendingAction === "open" && u.effectiveAt) {
    return `预计 ${u.effectiveAt} 开通${MARKET_LABEL[u.pendingMarket]}`;
  }
  if (u.pendingAction === "market" && u.effectiveAt) {
    return `预计 ${u.effectiveAt} 开通市场由${MARKET_LABEL[u.market]}改为${MARKET_LABEL[u.pendingMarket]}（此前仍为${MARKET_LABEL[u.market]}）`;
  }
  return "";
}

function scheduledDate(u) {
  if (u.pendingAction === "market" || u.pendingAction === "open") return u.effectiveAt;
  if (u.pendingAction === "remove") return u.expireAt;
  return null;
}

function clearPending(u) {
  u.effectiveAt = null;
  u.expireAt = null;
  u.pendingAction = null;
  u.pendingMarket = null;
}

function chargeLabel(charge) {
  return charge === "yes" ? "收费" : "不收费";
}

function filteredUsers() {
  const type = document.getElementById("filterType").value;
  const charge = document.getElementById("filterCharge").value;
  const market = document.getElementById("filterMarket").value;
  const kw = document.getElementById("filterKeyword").value.trim().toLowerCase();

  return users.filter((u) => {
    if (type !== "all" && u.type !== type) return false;
    if (charge !== "all" && u.charge !== charge) return false;
    if (market !== "all") {
      if (u.pendingAction === "open") return false;
      if (u.market !== market) return false;
    }
    if (kw) {
      const hay = [displayName(u), u.nameZh, u.nameEn, u.tradeAccount, u.accountId]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
}

function marketNote(u) {
  if (u.pendingAction === "market" && u.effectiveAt) {
    return `${u.effectiveAt} 改为${MARKET_LABEL[u.pendingMarket] || ""}`;
  }
  if (u.pendingAction === "open" && u.effectiveAt) {
    return `${u.effectiveAt} 开通${MARKET_LABEL[u.pendingMarket] || ""}`;
  }
  if (u.pendingAction === "remove" && u.expireAt) {
    return `${u.expireAt} 删除记录`;
  }
  return "";
}

function marketCell(u) {
  const note = marketNote(u);
  const sub = note ? `<div class="sub">${esc(note)}</div>` : "";
  if (u.pendingAction === "open") return `<span class="muted">待开通</span>${sub}`;
  return `${esc(MARKET_LABEL[u.market] || u.market)}${sub}`;
}

function renderPager(total, pages) {
  const el = document.getElementById("userPager");
  el.innerHTML = `
    <span class="pager-total">共 ${total} 条，每页 ${PAGE_SIZE} 条</span>
    <button class="btn ghost sm" type="button" data-page="prev" ${listPage <= 1 ? "disabled" : ""}>上一页</button>
    <span>${listPage} / ${pages}</span>
    <button class="btn ghost sm" type="button" data-page="next" ${listPage >= pages ? "disabled" : ""}>下一页</button>
  `;
}

function renderUsers() {
  const list = filteredUsers();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (listPage > pages) listPage = pages;
  if (listPage < 1) listPage = 1;
  const pageRows = list.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const tbody = document.querySelector("#usersTable tbody");
  renderPager(list.length, pages);
  if (!pageRows.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="8">无匹配记录</td></tr>`;
    return;
  }
  tbody.innerHTML = pageRows
    .map((u) => {
      const marked = u.pendingAction === "remove";
      return `
    <tr>
      <td><span class="badge ${esc(u.type)}">${esc(TYPE_LABEL[u.type] || u.type)}</span></td>
      <td>${esc(displayName(u))}</td>
      <td class="num">${esc(u.tradeAccount)}</td>
      <td class="num">${esc(u.accountId)}</td>
      <td>${marketCell(u)}</td>
      <td><span class="badge ${u.charge === "yes" ? "charge" : "free"}">${chargeLabel(u.charge)}</span></td>
      <td>${esc(u.openAt)}</td>
      <td>
        <div class="ops">
          <button class="btn ghost sm" data-action="edit" data-id="${esc(u.id)}" type="button">修改</button>
          <button class="btn danger sm" data-action="remove" data-id="${esc(u.id)}" type="button" ${marked ? "disabled" : ""} title="${marked ? "已标记移除，不可重复操作" : "标记移除，下月 1 日生效"}">${marked ? "已标记移除" : "移除行情"}</button>
        </div>
      </td>
    </tr>`;
    })
    .join("");
}

let feeEditing = false;

function syncFeeActions() {
  document.getElementById("btnFeeEdit").hidden = feeEditing;
  document.getElementById("btnFeeCancel").hidden = !feeEditing;
  document.getElementById("btnFeeSave").hidden = !feeEditing;
}

function renderFees() {
  const body = document.querySelector("#feeTable tbody");
  const rows = [
    ["HK", "港股L2"],
    ["US", "美股"],
  ];
  body.innerHTML = rows
    .map(([key, label]) => {
      const f = fees[key];
      return `<tr>
        <td>${label}</td>
        <td><input class="fee-input" id="fee-${key}" type="number" min="0" step="0.01" value="${f.amount}" ${feeEditing ? "" : "disabled"} /></td>
      </tr>`;
    })
    .join("");
  syncFeeActions();
}

function renderAll() {
  document.getElementById("demoDate").textContent = `业务日 ${demoToday}`;
  document.getElementById("feeHint").textContent =
    `当前收费：港股L2每月 HKD ${money(fees.HK.amount)}，美股每月 HKD ${money(fees.US.amount)}（可在行情收费配置中修改）。`;
  renderUsers();
  renderFees();
}

function applyDue(asOf) {
  const next = [];
  let changed = 0;
  users.forEach((u) => {
    if (u.pendingAction === "remove" && u.expireAt && u.expireAt <= asOf) {
      pushLog(u, "到期删除", `已到达失效日 ${u.expireAt}，记录已删除`);
      changed += 1;
      return;
    }
    if (
      (u.pendingAction === "market" || u.pendingAction === "open") &&
      u.effectiveAt &&
      u.effectiveAt <= asOf
    ) {
      const opening = u.pendingAction === "open";
      const from = MARKET_LABEL[u.market];
      const to = MARKET_LABEL[u.pendingMarket];
      const effectiveAt = u.effectiveAt;
      u.market = u.pendingMarket;
      clearPending(u);
      pushLog(
        u,
        opening ? "到期开通" : "到期变更市场",
        opening
          ? `已到达生效日 ${effectiveAt}，已开通${to}`
          : `已到达生效日 ${effectiveAt}，开通市场已由${from}改为${to}`
      );
      changed += 1;
    }
    next.push(u);
  });
  users = next;
  return changed;
}

function selectedAddType() {
  return document.getElementById("fType").value;
}

function clearLookupFields() {
  const jinma = document.getElementById("fJinma");
  const nameInput = document.getElementById("fName");
  jinma.value = "";
  nameInput.value = "";
  jinma.classList.remove("unmatched");
  nameInput.classList.remove("unmatched");
}

function refreshLookup() {
  const nameInput = document.getElementById("fName");
  const jinma = document.getElementById("fJinma");
  clearLookupFields();
  if (selectedAddType() === "eam") {
    const raw = document.getElementById("fLpoa").value.trim();
    if (!raw) return;
    const master = matchByLpoa(raw);
    if (!master) {
      nameInput.value = "未匹配到客户主数据";
      nameInput.classList.add("unmatched");
      return;
    }
    nameInput.value = displayName(master);
    return;
  }
  const raw = document.getElementById("fTrade").value.trim();
  if (!raw) return;
  const master = matchByTrade(raw);
  if (!master || master.type === "eam") {
    jinma.value = "未匹配到客户主数据";
    jinma.classList.add("unmatched");
    return;
  }
  if (master.type !== selectedAddType()) {
    jinma.value = `用户类型为${TYPE_LABEL[master.type]}`;
    jinma.classList.add("unmatched");
    return;
  }
  jinma.value = master.accountId;
  nameInput.value = displayName(master);
}

function toggleIdFields() {
  const eam = selectedAddType() === "eam";
  const tradeField = document.getElementById("tradeField");
  const jinmaField = document.getElementById("jinmaField");
  const lpoaField = document.getElementById("lpoaField");
  const trade = document.getElementById("fTrade");
  const lpoa = document.getElementById("fLpoa");
  const nameInput = document.getElementById("fName");
  tradeField.hidden = eam;
  jinmaField.hidden = eam;
  lpoaField.hidden = !eam;
  trade.required = !eam;
  lpoa.required = eam;
  nameInput.placeholder = eam ? "输入 LPOA号后自动填充英文名称" : "输入交易账号后自动填充";
  if (eam) trade.value = "";
  else lpoa.value = "";
  refreshLookup();
}

function openAddModal() {
  document.getElementById("userForm").reset();
  document.getElementById("fType").value = "retail";
  document.getElementById("fMarket").value = "HK";
  toggleIdFields();
  document.getElementById("modal").hidden = false;
  document.getElementById("fTrade").focus();
}

function closeModal() {
  document.getElementById("modal").hidden = true;
}

function closeEditModal() {
  document.getElementById("editModal").hidden = true;
}

function showEffectiveDate(show, min) {
  const field = document.getElementById("effectiveDateField");
  const input = document.getElementById("eEffectiveAt");
  field.hidden = !show;
  input.required = show;
  if (!show) return;
  input.min = min;
  if (!input.value || input.value < min) input.value = min;
}

function updateEditHint() {
  const id = document.getElementById("editUserId").value;
  const u = users.find((x) => x.id === id);
  const hint = document.getElementById("editHint");
  if (!u) return;
  const target = document.getElementById("eMarket").value;
  if (u.pendingAction === "open") {
    showEffectiveDate(true, demoToday);
    const picked = document.getElementById("eEffectiveAt").value;
    hint.textContent = `该用户尚未开通。预计生效日期 ${picked || "当天"}：选当天立即开通${MARKET_LABEL[target]}，选未来日期则到期开通。`;
    return;
  }
  if (u.pendingAction === "remove") {
    showEffectiveDate(false);
    hint.textContent = `已标记移除，预计 ${u.expireAt} 删除记录。到期前不可再次移除。收费变更仍当月生效。`;
    return;
  }
  const kind = marketChangeKind(u.market, target);
  const reducing = kind === "reduce";
  showEffectiveDate(reducing, nextMonthFirst(demoToday));
  const picked = document.getElementById("eEffectiveAt").value;
  let marketText = "市场无变化。";
  if (kind === "increase") marketText = "增加市场，保存后实时生效。";
  else if (reducing && isSwitch(u.market, target)) {
    marketText = `更换市场：请填写预计生效日期（${picked || "下月 1 日起"}）。在此之前仍为${MARKET_LABEL[u.market]}，到达该日期后改为${MARKET_LABEL[target]}。`;
  } else if (reducing) {
    marketText = `减少市场：请填写预计生效日期（${picked || "下月 1 日起"}）。在此之前仍为${MARKET_LABEL[u.market]}，到达该日期后改为${MARKET_LABEL[target]}。`;
  } else if (u.pendingAction === "market" && target === u.market) {
    marketText = "将取消待生效的市场变更，当前市场保持不变。";
  }
  hint.textContent = `${marketText}收费变更当月生效。`;
}

function addressValue(id) {
  return document.getElementById(id).value.trim();
}

function applyAddress(u, next, msgs) {
  const prev = (u.address || "").trim();
  if (next === prev) return false;
  u.address = next;
  msgs.push("地址已更新");
  pushLog(u, "修改地址", next ? `地址改为 ${next}` : "已清空地址");
  return true;
}

function openEditModal(id) {
  const u = users.find((x) => x.id === id);
  if (!u) return;
  document.getElementById("editUserId").value = id;
  document.getElementById("editUserLabel").textContent =
    `${TYPE_LABEL[u.type]} · ${displayName(u)} · 交易账号 ${u.tradeAccount} · ${u.accountId}`;
  const expireLine = document.getElementById("editExpireLine");
  if (u.pendingAction === "market" && u.effectiveAt) {
    expireLine.hidden = false;
    expireLine.textContent = `预计生效时间 ${u.effectiveAt}。${pendingNote(u)}`;
  } else if (u.pendingAction === "open" && u.effectiveAt) {
    expireLine.hidden = false;
    expireLine.textContent = `预计生效时间 ${u.effectiveAt}。${pendingNote(u)}`;
  } else if (u.pendingAction === "remove" && u.expireAt) {
    expireLine.hidden = false;
    expireLine.textContent = `预计失效时间 ${u.expireAt}。${pendingNote(u)}`;
  } else {
    expireLine.hidden = true;
    expireLine.textContent = "";
  }
  const marketSel = document.getElementById("eMarket");
  marketSel.disabled = u.pendingAction === "remove";
  marketSel.value =
    u.pendingAction === "open"
      ? u.pendingMarket || u.market
      : u.pendingAction === "market" && u.pendingMarket
        ? u.pendingMarket
        : u.market;
  document.getElementById("eCharge").value = u.charge;
  document.getElementById("eAddress").value = u.address || "";
  document.getElementById("eEffectiveAt").value =
    (u.pendingAction === "market" || u.pendingAction === "open") && u.effectiveAt
      ? u.effectiveAt
      : nextMonthFirst(demoToday);
  updateEditHint();
  document.getElementById("editModal").hidden = false;
}

function exportMarketLabel(u) {
  if (u.pendingAction === "open") return "待开通";
  return MARKET_LABEL[u.market] || u.market;
}

function exportHkex() {
  const month = currentMonthStr(demoToday);
  const rows = users.map((u) => [
    month,
    TYPE_LABEL[u.type] || u.type,
    displayName(u),
    u.tradeAccount,
    u.accountId,
    exportMarketLabel(u),
    chargeLabel(u.charge),
    u.openAt,
    u.pendingAction === "market" || u.pendingAction === "open" ? u.effectiveAt || "" : "",
    u.pendingAction === "remove" ? u.expireAt || "" : "",
    pendingNote(u),
  ]);
  downloadCsv(
    `港交所上报表_${month}.csv`,
    [
      "报表月",
      "用户类型",
      "客户名称",
      "交易账号",
      "金马号 / LPOA号",
      "开通市场",
      "是否收费",
      "开通时间",
      "预计生效时间",
      "预计失效时间",
      "待生效说明",
    ],
    rows
  );
  toast(`已导出港交所上报表单（${month}，共 ${rows.length} 条，含预计生效时间与预计失效时间）。`);
}

function billRemark(u, month) {
  const market =
    u.market === "ALL" ? "港股L2+美股" : MARKET_LABEL[u.market] || u.market || "";
  return `Realtime MD ${market} · ${month} · ${displayName(u)} · ${u.accountId}`;
}

function exportBilling(kind) {
  const month = currentMonthStr(demoToday);
  const date = monthEndDate(month);
  const charged = users.filter((u) => {
    if (u.charge !== "yes" || u.pendingAction === "open") return false;
    if (kind === "eam") return u.type === "eam";
    return u.type !== "eam";
  });
  const rows = charged.map((u) => [
    date,
    u.tradeAccount,
    "HKD",
    monthlyAmount(u.market).toFixed(2),
    billRemark(u, month),
  ]);
  const label = kind === "retail" ? "交易账户" : "EAM";
  downloadCsv(
    `${label}扣费表_${month}.csv`,
    ["Date", "Client a/c", "Currency", "Amount", "Remark"],
    rows
  );
  toast(
    charged.length
      ? `已导出${label}扣费表单（收费 ${charged.length} 条）。`
      : `当前没有收费的${label}，已导出空表。`
  );
}

function switchView(view) {
  if (view !== "fees") feeEditing = false;
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("viewList").classList.toggle("active", view === "list");
  document.getElementById("viewFees").classList.toggle("active", view === "fees");
  const copy = PAGE_COPY[view] || PAGE_COPY.list;
  document.getElementById("pageTitle").textContent = copy.title;
  document.getElementById("pageDesc").textContent = copy.desc;
  if (view === "fees") renderFees();
}

function parseFee(raw) {
  if (String(raw).trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function beginFeeEdit() {
  feeEditing = true;
  renderFees();
  const first = document.getElementById("fee-HK");
  if (first) first.focus();
}

function cancelFeeEdit() {
  feeEditing = false;
  renderFees();
}

function saveFees() {
  const updates = ["HK", "US"].map((key) => {
    const input = document.getElementById(`fee-${key}`);
    return { key, input, next: parseFee(input.value), prev: fees[key].amount };
  });
  const invalid = updates.find((item) => item.next == null);
  if (invalid) {
    toast("请输入不小于 0 的每月费用");
    invalid.input.focus();
    return;
  }
  const changed = updates.filter((item) => Math.round(item.next * 100) !== Math.round(item.prev * 100));
  if (!changed.length) {
    toast("费用未变化");
    return;
  }
  const parts = changed.map((item) => {
    fees[item.key].amount = item.next;
    fees[item.key].updatedAt = nowStamp();
    fees[item.key].updatedBy = OPERATOR;
    const content = `${MARKET_LABEL[item.key]}每月费用由 HKD ${money(item.prev)} 改为 HKD ${money(item.next)}`;
    feeLogs.unshift({ at: nowStamp(), operator: OPERATOR, content });
    return content;
  });
  feeEditing = false;
  renderFees();
  document.getElementById("feeHint").textContent =
    `当前收费：港股L2每月 HKD ${money(fees.HK.amount)}，美股每月 HKD ${money(fees.US.amount)}（可在行情收费配置中修改）。`;
  toast(`已更新${parts.join("；")}。`);
}

let logHideTimer = null;

function hideLogPopover() {
  clearTimeout(logHideTimer);
  const pop = document.getElementById("logPopover");
  if (pop) pop.hidden = true;
}

function placeLogPopover(anchor) {
  const pop = document.getElementById("logPopover");
  const rect = anchor.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + 6;
  if (left + popRect.width > window.innerWidth - 12) {
    left = window.innerWidth - popRect.width - 12;
  }
  if (top + popRect.height > window.innerHeight - 12) {
    top = Math.max(8, rect.top - popRect.height - 6);
  }
  pop.style.left = `${Math.max(8, left)}px`;
  pop.style.top = `${Math.max(8, top)}px`;
}

function showLogPopover(anchor) {
  const u = users.find((x) => x.id === anchor.dataset.logId);
  if (!u || !(u.logs || []).length) return;
  clearTimeout(logHideTimer);
  const pop = document.getElementById("logPopover");
  pop.innerHTML = `
    <div class="log-pop-title">${esc(displayName(u))} · 操作日志</div>
    <table class="log-mini">
      <thead>
        <tr><th>操作时间</th><th>操作内容</th><th>操作人</th></tr>
      </thead>
      <tbody>
        ${u.logs
          .map(
            (l) => `<tr><td>${esc(l.at)}</td><td>${esc(l.content)}</td><td>${esc(l.operator)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
  pop.hidden = false;
  placeLogPopover(anchor);
}

function scheduleHideLog() {
  clearTimeout(logHideTimer);
  logHideTimer = setTimeout(() => {
    document.getElementById("logPopover").hidden = true;
  }, 180);
}

function bindLogPopover() {
  const table = document.getElementById("usersTable");
  const pop = document.getElementById("logPopover");
  table.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-log-id]");
    if (!el || !table.contains(el)) return;
    showLogPopover(el);
  });
  table.addEventListener("mouseout", (e) => {
    const el = e.target.closest("[data-log-id]");
    if (!el) return;
    const to = e.relatedTarget;
    if (to && (el.contains(to) || pop.contains(to))) return;
    scheduleHideLog();
  });
  table.addEventListener("focusin", (e) => {
    const el = e.target.closest("[data-log-id]");
    if (el) showLogPopover(el);
  });
  table.addEventListener("focusout", (e) => {
    const to = e.relatedTarget;
    if (to && pop.contains(to)) return;
    scheduleHideLog();
  });
  pop.addEventListener("mouseenter", () => clearTimeout(logHideTimer));
  pop.addEventListener("mouseleave", scheduleHideLog);
  window.addEventListener("scroll", hideLogPopover, true);
}

function bind() {
  ["filterType", "filterCharge", "filterMarket", "filterKeyword"].forEach((id) => {
    const onFilter = () => {
      listPage = 1;
      renderUsers();
    };
    document.getElementById(id).addEventListener("input", onFilter);
    document.getElementById(id).addEventListener("change", onFilter);
  });
  document.getElementById("userPager").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    const pages = Math.max(1, Math.ceil(filteredUsers().length / PAGE_SIZE));
    if (btn.dataset.page === "prev") listPage = Math.max(1, listPage - 1);
    if (btn.dataset.page === "next") listPage = Math.min(pages, listPage + 1);
    renderUsers();
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.getElementById("btnAdd").addEventListener("click", openAddModal);
  document.getElementById("btnOpenFees").addEventListener("click", () => switchView("fees"));
  document.getElementById("btnExportHkex").addEventListener("click", exportHkex);
  document.getElementById("btnExportRetail").addEventListener("click", () => exportBilling("retail"));
  document.getElementById("btnExportEam").addEventListener("click", () => exportBilling("eam"));
  document.getElementById("btnFeeEdit").addEventListener("click", beginFeeEdit);
  document.getElementById("btnFeeCancel").addEventListener("click", cancelFeeEdit);
  document.getElementById("btnFeeSave").addEventListener("click", saveFees);

  document.getElementById("btnRollDate").addEventListener("click", () => {
    const dates = users
      .map((u) => scheduledDate(u))
      .filter(Boolean)
      .sort();
    if (!dates.length) {
      toast("当前没有待生效或待失效记录");
      return;
    }
    demoToday = dates[0];
    const n = applyDue(demoToday);
    renderAll();
    toast(`已演示到达 ${demoToday}，${n} 笔预定变更已落库。`);
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.getElementById("fType").addEventListener("change", toggleIdFields);
  document.getElementById("fTrade").addEventListener("input", refreshLookup);
  document.getElementById("fLpoa").addEventListener("input", refreshLookup);

  document.getElementById("userForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = selectedAddType();
    let master = null;
    if (type === "eam") {
      const raw = document.getElementById("fLpoa").value.trim();
      if (!raw) {
        toast("请输入 LPOA号");
        return;
      }
      master = matchByLpoa(raw);
      if (!master) {
        toast("客户主数据未找到该 LPOA号，无法回填客户名称");
        return;
      }
    } else {
      const raw = document.getElementById("fTrade").value.trim();
      if (!raw) {
        toast("请输入交易账号");
        return;
      }
      master = matchByTrade(raw);
      if (!master || master.type === "eam") {
        toast("客户主数据未找到该交易账号，无法带出金马号");
        return;
      }
      if (master.type !== type) {
        toast(`该交易账号的用户类型是${TYPE_LABEL[master.type]}，请切换用户类型后再加入`);
        return;
      }
    }
    if (
      users.some(
        (u) =>
          u.tradeAccount.toLowerCase() === master.tradeAccount.toLowerCase() ||
          u.accountId.toLowerCase() === master.accountId.toLowerCase()
      )
    ) {
      toast("同一交易账号或金马号 / LPOA号不可重复加入");
      return;
    }
    const market = document.getElementById("fMarket").value;
    const user = {
      id: "u" + Date.now(),
      type: master.type,
      tradeAccount: master.tradeAccount,
      accountId: master.accountId,
      nameZh: master.nameZh,
      nameEn: master.nameEn,
      address: addressValue("fAddress"),
      market,
      charge: document.getElementById("fCharge").value,
      openAt: demoToday,
      effectiveAt: null,
      expireAt: null,
      pendingAction: null,
      pendingMarket: null,
      logs: [],
    };
    users.unshift(user);
    pushLog(user, "新增", `新增白名单，开通${MARKET_LABEL[market]}，实时生效`);
    closeModal();
    renderAll();
    toast(`已加入行情白名单（${MARKET_LABEL[market]}），实时生效。`);
  });

  document.querySelector("#usersTable").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn || btn.disabled) return;
    const u = users.find((x) => x.id === btn.dataset.id);
    if (!u) return;

    if (btn.dataset.action === "edit") {
      openEditModal(u.id);
      return;
    }
    if (btn.dataset.action === "remove") {
      if (u.pendingAction === "remove") {
        toast("已标记移除，不可重复操作");
        return;
      }
      const expireAt = nextMonthFirst(demoToday);
      const ok = window.confirm(
        `确认移除 ${displayName(u)} 的实时行情？\n预计失效 ${expireAt}（下月 1 日）。到期前记录仍保留在列表，到达失效日后才删除。`
      );
      if (!ok) return;
      u.pendingAction = "remove";
      u.pendingMarket = null;
      u.effectiveAt = null;
      u.expireAt = expireAt;
      pushLog(u, "移除行情", `已标记整笔移除，预计失效 ${expireAt}，到期前仍保留`);
      renderAll();
      toast(`${displayName(u)} 已标记移除，预计失效 ${expireAt}。到期前仍保留在列表。`);
    }
  });

  document.getElementById("editModalClose").addEventListener("click", closeEditModal);
  document.getElementById("editModalCancel").addEventListener("click", closeEditModal);
  document.getElementById("eMarket").addEventListener("change", updateEditHint);
  document.getElementById("eEffectiveAt").addEventListener("change", updateEditHint);
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editUserId").value;
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const target = document.getElementById("eMarket").value;
    const newCharge = document.getElementById("eCharge").value;
    const pickedDate = document.getElementById("eEffectiveAt").value;
    const msgs = [];

    if (u.pendingAction === "open") {
      if (!pickedDate) {
        toast("请选择预计生效日期");
        return;
      }
      if (pickedDate < demoToday) {
        toast(`预计生效日期不能早于今天（${demoToday}）`);
        return;
      }
      const marketSame = target === (u.pendingMarket || u.market);
      const dateSame = pickedDate === u.effectiveAt;
      const chargeSame = newCharge === u.charge;
      const newAddress = addressValue("eAddress");
      const addressSame = newAddress === (u.address || "").trim();
      if (marketSame && dateSame && chargeSame && addressSame) {
        closeEditModal();
        toast("无变更");
        return;
      }
      if (!chargeSame) {
        u.charge = newCharge;
        pushLog(u, "收费变更", `改为${chargeLabel(newCharge)}，当月生效`);
        msgs.push(`收费状态 → ${chargeLabel(newCharge)}（当月生效）`);
      }
      if (!marketSame || !dateSame) {
        if (pickedDate <= demoToday) {
          u.market = target;
          clearPending(u);
          pushLog(u, "开通市场", `开通${MARKET_LABEL[target]}，预计生效 ${pickedDate}，已开通`);
          msgs.push(`已开通${MARKET_LABEL[target]}`);
        } else {
          u.market = target;
          u.pendingAction = "open";
          u.pendingMarket = target;
          u.effectiveAt = pickedDate;
          u.expireAt = null;
          pushLog(u, "调整开通", `开通${MARKET_LABEL[target]}，预计生效 ${pickedDate}`);
          msgs.push(`预计 ${pickedDate} 开通${MARKET_LABEL[target]}`);
        }
      }
      applyAddress(u, newAddress, msgs);
      closeEditModal();
      renderAll();
      toast(msgs.join("；"));
      return;
    }

    if (u.pendingAction === "remove") {
      const newAddress = addressValue("eAddress");
      const msgs = [];
      if (newCharge !== u.charge) {
        u.charge = newCharge;
        pushLog(
          u,
          "收费变更",
          `改为${chargeLabel(newCharge)}，当月生效；移除仍于 ${u.expireAt}`
        );
        msgs.push(`收费变更当月生效。移除仍预计于 ${u.expireAt} 删除。`);
      }
      applyAddress(u, newAddress, msgs);
      closeEditModal();
      if (!msgs.length) {
        toast("无变更");
        return;
      }
      renderAll();
      toast(msgs.join("；"));
      return;
    }

    const reducing = marketChangeKind(u.market, target) === "reduce";
    const dateChanged = u.pendingAction === "market" && pickedDate !== u.effectiveAt;
    const intended =
      u.pendingAction === "market" && u.pendingMarket ? u.pendingMarket : u.market;
    const newAddress = addressValue("eAddress");
    const addressSame = newAddress === (u.address || "").trim();
    if (target === intended && newCharge === u.charge && !dateChanged && addressSame) {
      closeEditModal();
      toast("无变更");
      return;
    }

    let effectiveAt = null;
    if (reducing) {
      const min = nextMonthFirst(demoToday);
      if (!pickedDate) {
        toast("请填写预计生效日期");
        return;
      }
      if (pickedDate < min) {
        toast(`预计生效日期不能早于下月 1 日（${min}）`);
        return;
      }
      effectiveAt = pickedDate;
    }

    if (newCharge !== u.charge) {
      u.charge = newCharge;
      msgs.push(`收费状态 → ${chargeLabel(newCharge)}（当月生效）`);
      pushLog(u, "收费变更", `改为${chargeLabel(newCharge)}，当月生效`);
    }

    const marketUnchanged =
      u.pendingAction === "market" ? target === u.pendingMarket : target === u.market;
    if (marketUnchanged && reducing && effectiveAt && effectiveAt !== u.effectiveAt) {
      u.effectiveAt = effectiveAt;
      msgs.push(`预计生效日期 → ${effectiveAt}，此前仍为${MARKET_LABEL[u.market]}`);
      pushLog(
        u,
        "调整生效日期",
        `预计生效日期改为 ${effectiveAt}，此前仍为${MARKET_LABEL[u.market]}，到期改为${MARKET_LABEL[u.pendingMarket]}`
      );
    }
    if (!marketUnchanged) {
      if (target === u.market) {
        clearPending(u);
        msgs.push("已取消待生效的市场变更");
        pushLog(u, "取消市场变更", `取消待生效市场变更，维持${MARKET_LABEL[u.market]}`);
      } else {
        const kind = marketChangeKind(u.market, target);
        if (kind === "increase") {
          const from = MARKET_LABEL[u.market];
          u.market = target;
          clearPending(u);
          msgs.push(`开通市场 → ${MARKET_LABEL[target]}（实时生效）`);
          pushLog(u, "增加市场", `${from} → ${MARKET_LABEL[target]}，实时生效`);
        } else {
          const action = isSwitch(u.market, target) ? "更换市场" : "减少市场";
          u.pendingAction = "market";
          u.pendingMarket = target;
          u.effectiveAt = effectiveAt;
          u.expireAt = null;
          msgs.push(
            `${action} → ${MARKET_LABEL[target]}（预计生效 ${effectiveAt}，此前仍为${MARKET_LABEL[u.market]}）`
          );
          pushLog(
            u,
            action,
            `开通市场由${MARKET_LABEL[u.market]}改为${MARKET_LABEL[target]}，预计生效 ${effectiveAt}，此前仍为${MARKET_LABEL[u.market]}`
          );
        }
      }
    }

    applyAddress(u, newAddress, msgs);
    closeEditModal();
    renderAll();
    toast(msgs.join("；"));
  });

}

document.addEventListener("DOMContentLoaded", () => {
  bind();
  renderAll();
});
