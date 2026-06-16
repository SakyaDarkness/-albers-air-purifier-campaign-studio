const STORAGE_KEY = "albersCampaignStudio.v2";
const PROJECT_LIBRARY_KEY = "albersCampaignStudio.projects.v1";

const defaultCompetitors = [
  {
    name: "竞品 A",
    cadr: 650,
    area: 72,
    noise: 35,
    price: 3299,
    filterPrice: 459,
    filterLife: 12,
    powerWatts: 62,
    source: "官方详情页",
    date: "2026-06-01",
  },
  {
    name: "竞品 B",
    cadr: 580,
    area: 65,
    noise: 32,
    price: 2799,
    filterPrice: 329,
    filterLife: 10,
    powerWatts: 48,
    source: "电商详情页",
    date: "2026-06-01",
  },
  {
    name: "竞品 C",
    cadr: 700,
    area: 80,
    noise: 38,
    price: 3699,
    filterPrice: 499,
    filterLife: 12,
    powerWatts: 70,
    source: "参数页",
    date: "2026-06-01",
  },
];

let competitors = structuredClone(defaultCompetitors);
let evidenceAssets = [];
let leadRecords = [];
let companyDatabase = null;
let selectedCompanyProductId = "";

const fields = {
  campaignName: document.querySelector("#campaignName"),
  cta: document.querySelector("#cta"),
  leadChannel: document.querySelector("#leadChannel"),
  offer: document.querySelector("#offer"),
  posterTheme: document.querySelector("#posterTheme"),
  posterLayout: document.querySelector("#posterLayout"),
  brand: document.querySelector("#brand"),
  model: document.querySelector("#model"),
  audience: document.querySelector("#audience"),
  scene: document.querySelector("#scene"),
  cadr: document.querySelector("#cadr"),
  area: document.querySelector("#area"),
  noise: document.querySelector("#noise"),
  price: document.querySelector("#price"),
  filterPrice: document.querySelector("#filterPrice"),
  filterLife: document.querySelector("#filterLife"),
  powerWatts: document.querySelector("#powerWatts"),
  hoursPerDay: document.querySelector("#hoursPerDay"),
  electricityPrice: document.querySelector("#electricityPrice"),
  warrantyYears: document.querySelector("#warrantyYears"),
  adBudget: document.querySelector("#adBudget"),
  costPerClick: document.querySelector("#costPerClick"),
  leadRate: document.querySelector("#leadRate"),
  dealRate: document.querySelector("#dealRate"),
  averageOrderValue: document.querySelector("#averageOrderValue"),
  grossMarginRate: document.querySelector("#grossMarginRate"),
  features: document.querySelector("#features"),
  riskWords: document.querySelector("#riskWords"),
  assetNote: document.querySelector("#assetNote"),
  leadName: document.querySelector("#leadName"),
  leadSource: document.querySelector("#leadSource"),
  leadInterest: document.querySelector("#leadInterest"),
  leadStatus: document.querySelector("#leadStatus"),
  leadNextStep: document.querySelector("#leadNextStep"),
};

const outputs = {
  meta: document.querySelector("#campaignMeta"),
  title: document.querySelector("#campaignTitle"),
  post: document.querySelector("#postOutput"),
  overview: document.querySelector("#overviewOutput"),
  overviewCards: document.querySelector("#overviewCards"),
  brief: document.querySelector("#briefOutput"),
  variants: document.querySelector("#variantsOutput"),
  posterScript: document.querySelector("#posterScript"),
  imagePrompt: document.querySelector("#imagePromptOutput"),
  comments: document.querySelector("#commentsOutput"),
  matrix: document.querySelector("#matrixOutput"),
  replies: document.querySelector("#repliesOutput"),
  compare: document.querySelector("#compareOutput"),
  compareTable: document.querySelector("#compareTable"),
  cost: document.querySelector("#costOutput"),
  costTable: document.querySelector("#costTable"),
  schedule: document.querySelector("#scheduleOutput"),
  scheduleTable: document.querySelector("#scheduleTable"),
  shooting: document.querySelector("#shootingOutput"),
  leads: document.querySelector("#leadsOutput"),
  kpi: document.querySelector("#kpiOutput"),
  kpiTable: document.querySelector("#kpiTable"),
  retro: document.querySelector("#retroOutput"),
  tasks: document.querySelector("#tasksOutput"),
  tasksTable: document.querySelector("#tasksTable"),
  report: document.querySelector("#reportOutput"),
  reportSheet: document.querySelector("#reportSheet"),
  dashboard: document.querySelector("#dashboardOutput"),
  dashboardView: document.querySelector("#dashboardView"),
  platform: document.querySelector("#platformOutput"),
  crm: document.querySelector("#crmOutput"),
  crmTable: document.querySelector("#crmTable"),
  companySummary: document.querySelector("#companyDbSummary"),
  companyTable: document.querySelector("#companyDbTable"),
  companyOutput: document.querySelector("#companyDbOutput"),
  review: document.querySelector("#reviewOutput"),
  poster: document.querySelector("#posterPreview"),
};

const competitorList = document.querySelector("#competitorList");
const assetList = document.querySelector("#assetList");
const projectLibrarySelect = document.querySelector("#projectLibrarySelect");
const toast = document.querySelector("#toast");
const aiStatus = document.querySelector("#aiStatus");
const aiTextOutput = document.querySelector("#aiTextOutput");
const aiImagePreview = document.querySelector("#aiImagePreview");
const companyGroupSelect = document.querySelector("#companyGroupSelect");
const companyRoleSelect = document.querySelector("#companyRoleSelect");
const companyProductSelect = document.querySelector("#companyProductSelect");

let lastAiImage = "";

function numberValue(id) {
  return Number(fields[id].value || 0);
}

function textValue(id) {
  return fields[id].value.trim();
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function setSelectedValue(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function productData() {
  return {
    campaignName: textValue("campaignName") || "空气净化器推广",
    cta: textValue("cta") || "评论“净化器”领取参数表",
    leadChannel: textValue("leadChannel") || "私信发送参数表",
    offer: textValue("offer") || "活动价以实时页面为准",
    posterTheme: fields.posterTheme.value || "teal",
    posterLayout: fields.posterLayout.value || "metric",
    brand: textValue("brand") || "艾伯斯",
    model: textValue("model") || "空气净化器",
    audience: textValue("audience") || "家庭用户",
    scene: textValue("scene") || "客厅、卧室",
    cadr: numberValue("cadr"),
    area: numberValue("area"),
    noise: numberValue("noise"),
    price: numberValue("price"),
    filterPrice: numberValue("filterPrice"),
    filterLife: numberValue("filterLife"),
    powerWatts: numberValue("powerWatts"),
    hoursPerDay: numberValue("hoursPerDay"),
    electricityPrice: numberValue("electricityPrice"),
    warrantyYears: numberValue("warrantyYears"),
    adBudget: numberValue("adBudget"),
    costPerClick: numberValue("costPerClick"),
    leadRate: numberValue("leadRate"),
    dealRate: numberValue("dealRate"),
    averageOrderValue: numberValue("averageOrderValue"),
    grossMarginRate: numberValue("grossMarginRate"),
    features: textValue("features")
      .split(/[、，,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
    riskWords: textValue("riskWords")
      .split(/[、，,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
    platform: selectedValue("platform"),
    tone: selectedValue("tone"),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeCompetitor(item) {
  return {
    name: item.name || "未命名竞品",
    cadr: Number(item.cadr || 0),
    area: Number(item.area || 0),
    noise: Number(item.noise || 0),
    price: Number(item.price || 0),
    filterPrice: Number(item.filterPrice || 0),
    filterLife: Number(item.filterLife || 12),
    powerWatts: Number(item.powerWatts || 0),
    source: item.source || "",
    date: item.date || "",
  };
}

function normalizeAllCompetitors() {
  competitors = competitors.map(normalizeCompetitor);
}

function renderCompetitors() {
  normalizeAllCompetitors();
  competitorList.innerHTML = competitors
    .map(
      (item, index) => `
        <div class="competitor-item" data-index="${index}">
          <label>
            名称
            <input data-key="name" type="text" value="${escapeHtml(item.name)}" />
          </label>
          <label>
            CADR
            <input data-key="cadr" type="number" min="0" value="${item.cadr}" />
          </label>
          <label>
            价格
            <input data-key="price" type="number" min="0" value="${item.price}" />
          </label>
          <label>
            面积
            <input data-key="area" type="number" min="0" value="${item.area}" />
          </label>
          <label>
            噪音
            <input data-key="noise" type="number" min="0" value="${item.noise}" />
          </label>
          <label>
            滤芯价
            <input data-key="filterPrice" type="number" min="0" value="${item.filterPrice}" />
          </label>
          <label>
            寿命月
            <input data-key="filterLife" type="number" min="1" value="${item.filterLife}" />
          </label>
          <label>
            功率 W
            <input data-key="powerWatts" type="number" min="0" value="${item.powerWatts}" />
          </label>
          <label class="wide">
            参数来源
            <input data-key="source" type="text" value="${escapeHtml(item.source || "")}" />
          </label>
          <label class="wide">
            核对日期
            <input data-key="date" type="date" value="${escapeHtml(item.date || "")}" />
          </label>
          <button type="button" data-remove="${index}">删除</button>
        </div>
      `,
    )
    .join("");
}

function syncCompetitors() {
  competitorList.querySelectorAll(".competitor-item").forEach((row) => {
    const index = Number(row.dataset.index);
    row.querySelectorAll("input").forEach((input) => {
      const key = input.dataset.key;
      const textKeys = ["name", "source", "date"];
      competitors[index][key] = textKeys.includes(key) ? input.value.trim() : Number(input.value || 0);
    });
  });
  normalizeAllCompetitors();
}

function compareMetrics(product) {
  const valid = competitors.filter((item) => item.name);
  const wins = [];
  const cautions = [];

  valid.forEach((item) => {
    if (product.cadr && item.cadr && product.cadr > item.cadr) wins.push(`CADR 比 ${item.name} 高 ${product.cadr - item.cadr}`);
    if (product.area && item.area && product.area > item.area) wins.push(`适用面积比 ${item.name} 多 ${product.area - item.area}㎡`);
    if (product.noise && item.noise && product.noise < item.noise) wins.push(`噪音比 ${item.name} 低 ${item.noise - product.noise}dB`);
    if (product.price && item.price && product.price < item.price) wins.push(`价格比 ${item.name} 低 ${item.price - product.price} 元`);
    if (!item.source || !item.date) cautions.push(`${item.name} 缺少参数来源或核对日期`);
  });

  if (!wins.length) {
    cautions.push("当前参数下没有明显数值领先项，建议突出滤芯、售后、检测报告或使用体验。");
  }

  return {
    valid,
    wins,
    cautions,
    headline: wins[0] || cautions[0],
  };
}

function formatMoney(value) {
  return value ? `￥${value.toLocaleString("zh-CN")}` : "待填";
}

function moneyNumber(value) {
  return Number.isFinite(value) ? `￥${Math.round(value).toLocaleString("zh-CN")}` : "待填";
}

function annualCost(item, product) {
  const filterLife = Number(item.filterLife || 0);
  const filterPrice = Number(item.filterPrice || 0);
  const powerWatts = Number(item.powerWatts || 0);
  const hoursPerDay = Number(product.hoursPerDay || 0);
  const electricityPrice = Number(product.electricityPrice || 0);
  const annualFilter = filterLife > 0 ? (filterPrice * 12) / filterLife : 0;
  const annualElectricity = (powerWatts * hoursPerDay * 365 * electricityPrice) / 1000;
  return {
    filter: annualFilter,
    electricity: annualElectricity,
    total: annualFilter + annualElectricity,
  };
}

function kpiForecast(product) {
  const budget = Number(product.adBudget || 0);
  const cpc = Number(product.costPerClick || 0);
  const clicks = cpc > 0 ? budget / cpc : 0;
  const leads = clicks * (Number(product.leadRate || 0) / 100);
  const orders = leads * (Number(product.dealRate || 0) / 100);
  const revenue = orders * Number(product.averageOrderValue || 0);
  const grossProfit = revenue * (Number(product.grossMarginRate || 0) / 100);
  const roas = budget > 0 ? revenue / budget : 0;
  const profitAfterAds = grossProfit - budget;

  return {
    budget,
    cpc,
    clicks,
    leads,
    orders,
    revenue,
    grossProfit,
    roas,
    profitAfterAds,
  };
}

function formatCount(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString("zh-CN") : "待填";
}

function formatRate(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function evidenceSummary() {
  if (!evidenceAssets.length) return "暂无证据素材。建议上传检测报告、竞品参数截图、价格截图、滤芯价格截图。";
  return evidenceAssets
    .map((asset, index) => `${index + 1}. ${asset.name}｜${asset.note || "未备注"}｜${asset.addedAt}`)
    .join("\n");
}

function sourceLine(item) {
  const source = item.source || "待补来源";
  const date = item.date || "待补日期";
  return `${source}，${date}`;
}

function renderAssets() {
  if (!evidenceAssets.length) {
    assetList.innerHTML = `<p class="empty-note">暂无素材。上传后会记录文件名、类型、大小和备注；文件内容不会写入项目 JSON。</p>`;
    return;
  }

  assetList.innerHTML = evidenceAssets
    .map(
      (asset, index) => `
        <div class="asset-item">
          <div>
            <strong>${escapeHtml(asset.name)}</strong>
            <span>${escapeHtml(asset.type || "未知类型")} / ${asset.sizeLabel || sizeLabel(asset.size || 0)} / ${asset.addedAt || "未记录日期"}</span>
            <em>${escapeHtml(asset.note || "未备注")}</em>
          </div>
          <button type="button" data-remove-asset="${index}">删除</button>
        </div>
      `,
    )
    .join("");
}

function renderLeads() {
  if (!leadRecords.length) {
    outputs.crmTable.innerHTML = `
      <table>
        <tbody>
          <tr><td>暂无线索。可在左侧“CRM 线索”添加评论/私信用户。</td></tr>
        </tbody>
      </table>
    `;
    return;
  }

  outputs.crmTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>客户</th>
          <th>来源</th>
          <th>关注点</th>
          <th>状态</th>
          <th>下一步</th>
          <th>创建时间</th>
        </tr>
      </thead>
      <tbody>
        ${leadRecords
          .map(
            (lead, index) => `
              <tr>
                <td>${escapeHtml(lead.name)}</td>
                <td>${escapeHtml(lead.source)}</td>
                <td>${escapeHtml(lead.interest)}</td>
                <td>${escapeHtml(lead.status)}</td>
                <td>${escapeHtml(lead.nextStep)}</td>
                <td>${escapeHtml(lead.createdAt)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function addLeadRecord() {
  leadRecords.push({
    name: textValue("leadName") || "未命名线索",
    source: textValue("leadSource") || "未记录来源",
    interest: textValue("leadInterest") || "未记录关注点",
    status: fields.leadStatus.value || "待联系",
    nextStep: textValue("leadNextStep") || "待跟进",
    createdAt: new Date().toLocaleDateString("zh-CN"),
  });
  renderLeads();
  generateAll();
  showToast("线索已添加");
}

function projectLibrary() {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_LIBRARY_KEY) || "[]");
  } catch {
    localStorage.removeItem(PROJECT_LIBRARY_KEY);
    return [];
  }
}

function saveProjectLibrary(projects) {
  localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(projects));
  renderProjectLibrary();
}

function renderProjectLibrary() {
  const projects = projectLibrary();
  projectLibrarySelect.innerHTML = projects.length
    ? projects
        .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}｜${escapeHtml(project.updatedAt)}</option>`)
        .join("")
    : `<option value="">暂无保存项目</option>`;
}

function metricNumbers(value) {
  return [...String(value || "").replace(/,/g, "").matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
}

function firstMetricNumber(value) {
  return metricNumbers(value)[0] || 0;
}

function minMetricNumber(value) {
  const numbers = metricNumbers(value);
  return numbers.length ? Math.min(...numbers) : 0;
}

function maxMetricNumber(value) {
  const numbers = metricNumbers(value);
  return numbers.length ? Math.max(...numbers) : 0;
}

function companyRoleLabel(product) {
  return product?.role === "own" ? "艾泊斯" : "竞品";
}

function companyAttr(product, label) {
  return product?.attributes?.[label] || "";
}

function findCompanyAttr(product, pattern) {
  const entry = Object.entries(product?.attributes || {}).find(([key]) => pattern.test(key));
  return entry ? entry[1] : "";
}

function companyFeatureSummary(product) {
  return companyAttr(product, "主要核心卖点")
    .split(/\r?\n|[;；]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join("、");
}

function companyBestCadr(product) {
  return (
    firstMetricNumber(product?.metrics?.particleCadr) ||
    firstMetricNumber(product?.metrics?.formaldehydeCadr) ||
    firstMetricNumber(product?.metrics?.tvocCadr) ||
    firstMetricNumber(product?.metrics?.benzeneCadr)
  );
}

function companyScene(product) {
  const type = product?.productType || "";
  if (type.includes("pet")) return "养宠家庭、客厅、卧室、猫砂盆周边";
  if (type.includes("formaldehyde")) return "新装修房间、客厅、卧室、母婴家庭";
  if (type.includes("all-purpose")) return "全屋空气管理、客厅、卧室、办公室";
  return "客厅、卧室、家庭空气管理";
}

function companyVisibleProducts() {
  if (!companyDatabase) return [];
  const group = companyGroupSelect.value;
  const role = companyRoleSelect.value;
  return companyDatabase.products.filter((product) => {
    const groupMatched = !group || product.group === group;
    const roleMatched = role === "all" || product.role === role;
    return groupMatched && roleMatched;
  });
}

function selectedCompanyProduct() {
  if (!companyDatabase) return null;
  return companyDatabase.products.find((product) => product.id === selectedCompanyProductId) || null;
}

function renderCompanyGroups() {
  if (!companyDatabase) return;
  const currentGroup = companyGroupSelect.value || companyDatabase.sheets[0]?.name || "";
  companyGroupSelect.innerHTML = companyDatabase.sheets
    .map((sheet) => `<option value="${escapeHtml(sheet.name)}">${escapeHtml(sheet.name)}</option>`)
    .join("");
  companyGroupSelect.value = companyDatabase.sheets.some((sheet) => sheet.name === currentGroup)
    ? currentGroup
    : companyDatabase.sheets[0]?.name || "";
}

function renderCompanyDatabase() {
  if (!companyDatabase) {
    outputs.companyOutput.textContent = "公司资料库加载中...";
    return;
  }

  const products = companyVisibleProducts();
  if (!products.some((product) => product.id === selectedCompanyProductId)) {
    selectedCompanyProductId = products[0]?.id || "";
  }

  companyProductSelect.innerHTML = products.length
    ? products
        .map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(companyRoleLabel(product))} / ${escapeHtml(product.model)}</option>`)
        .join("")
    : `<option value="">暂无产品</option>`;
  companyProductSelect.value = selectedCompanyProductId;

  const groupProducts = companyDatabase.products.filter((product) => product.group === companyGroupSelect.value);
  const ownProducts = groupProducts.filter((product) => product.role === "own");
  const competitorProducts = groupProducts.filter((product) => product.role === "competitor");
  const selected = selectedCompanyProduct();

  outputs.companySummary.innerHTML = [
    ["当前分组", groupProducts.length, companyGroupSelect.value || "未选择"],
    ["艾泊斯机型", ownProducts.length, ownProducts.map((product) => product.model).join("、") || "未记录"],
    ["竞品数量", competitorProducts.length, "可一键写入竞品对比"],
  ]
    .map(
      ([label, value, note]) => `
        <div class="summary-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <em>${escapeHtml(note)}</em>
        </div>
      `,
    )
    .join("");

  outputs.companyTable.innerHTML = products.length
    ? products
        .map((product) => {
          const selectedClass = product.id === selectedCompanyProductId ? " selected" : "";
          const features = companyFeatureSummary(product) || "未记录核心卖点";
          const image = product.image
            ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)}" loading="lazy" />`
            : `<div class="database-image-placeholder">无图</div>`;
          return `
            <article class="database-card${selectedClass}" data-company-product="${escapeHtml(product.id)}">
              <div class="database-image">${image}</div>
              <div class="database-card-body">
                <div class="database-card-title">
                  <strong>${escapeHtml(product.model)}</strong>
                  <span>${escapeHtml(companyRoleLabel(product))}</span>
                </div>
                <dl>
                  <div><dt>颗粒物 CADR</dt><dd>${escapeHtml(product.metrics?.particleCadr || "-")}</dd></div>
                  <div><dt>甲醛 CADR</dt><dd>${escapeHtml(product.metrics?.formaldehydeCadr || "-")}</dd></div>
                  <div><dt>适用面积</dt><dd>${escapeHtml(product.metrics?.area || "-")}</dd></div>
                  <div><dt>价格</dt><dd>${escapeHtml(product.metrics?.price || "-")}</dd></div>
                </dl>
                <p>${escapeHtml(features)}</p>
                ${product.link ? `<a href="${escapeHtml(product.link)}" target="_blank" rel="noreferrer">查看商品链接</a>` : ""}
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-note">当前筛选条件下没有产品。</p>`;

  outputs.companyOutput.textContent = selected
    ? [
        `选中：${companyRoleLabel(selected)} / ${selected.model}`,
        `分组：${selected.group}`,
        `CADR：颗粒物 ${selected.metrics?.particleCadr || "-"}；甲醛 ${selected.metrics?.formaldehydeCadr || "-"}`,
        `适用面积：${selected.metrics?.area || "-"}`,
        `价格：${selected.metrics?.price || "-"}`,
        `滤芯价格：${selected.metrics?.filterPrice || "-"}`,
        `核心卖点：${companyFeatureSummary(selected) || "未记录"}`,
      ].join("\n")
    : "未选择产品。";
}

async function loadCompanyDatabase() {
  if (!companyGroupSelect) return;
  outputs.companyOutput.textContent = "公司资料库加载中...";
  try {
    const response = await fetch("data/company-database.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    companyDatabase = await response.json();
    renderCompanyGroups();
    renderCompanyDatabase();
  } catch (error) {
    outputs.companySummary.innerHTML = "";
    outputs.companyTable.innerHTML = `<p class="empty-note">公司资料库暂未加载。请确认 data/company-database.json 已生成，并通过本地服务打开页面。</p>`;
    outputs.companyOutput.textContent = `加载失败：${error.message}`;
  }
}

function companyProductToCompetitor(product) {
  return normalizeCompetitor({
    name: product.model,
    cadr: companyBestCadr(product),
    area: maxMetricNumber(product.metrics?.area),
    noise: minMetricNumber(product.metrics?.noise),
    price: product.metrics?.priceNumber || 0,
    filterPrice: product.metrics?.filterPriceNumber || 0,
    filterLife: 12,
    powerWatts: firstMetricNumber(findCompanyAttr(product, /功率/)),
    source: "公司竞品表",
    date: "2026-04-01",
  });
}

function applySelectedCompanyProduct() {
  const selected = selectedCompanyProduct();
  if (!selected) {
    showToast("请先选择公司资料库里的产品");
    return;
  }

  const brand = selected.brand || (selected.role === "own" ? "艾泊斯" : "");
  fields.campaignName.value = `${brand || "公司产品"} ${selected.model} 宣传素材`;
  fields.brand.value = brand || "艾泊斯";
  fields.model.value = selected.model;
  fields.scene.value = companyScene(selected);
  fields.cadr.value = companyBestCadr(selected);
  fields.area.value = maxMetricNumber(selected.metrics?.area);
  fields.noise.value = minMetricNumber(selected.metrics?.noise);
  fields.price.value = selected.metrics?.priceNumber || "";
  fields.filterPrice.value = selected.metrics?.filterPriceNumber || "";
  fields.powerWatts.value = firstMetricNumber(findCompanyAttr(selected, /功率/)) || fields.powerWatts.value;
  fields.features.value = companyFeatureSummary(selected) || fields.features.value;

  const peers = companyDatabase.products.filter((product) => {
    if (product.group !== selected.group || product.id === selected.id) return false;
    return selected.role === "own" ? product.role === "competitor" : true;
  });
  competitors = peers.map(companyProductToCompetitor);

  const sourceName = companyDatabase.sources?.xlsx || "空气净化器竞品对比表";
  if (!evidenceAssets.some((asset) => asset.name === sourceName)) {
    evidenceAssets.push({
      name: sourceName,
      type: "company-database",
      sizeLabel: "已导入",
      note: `${selected.group} / ${selected.model} 产品参数与竞品对比`,
      addedAt: new Date().toLocaleDateString("zh-CN"),
    });
  }

  renderCompetitors();
  renderAssets();
  generateAll();
  showToast("公司资料已套用到当前项目");
}

function saveCurrentProjectToLibrary() {
  const state = currentState();
  const product = productData();
  const projects = projectLibrary();
  const id = `${Date.now()}`;
  projects.unshift({
    id,
    name: product.campaignName,
    updatedAt: new Date().toLocaleString("zh-CN"),
    state,
  });
  saveProjectLibrary(projects.slice(0, 30));
  projectLibrarySelect.value = id;
  showToast("已存入项目库");
}

function selectedLibraryProject() {
  const id = projectLibrarySelect.value;
  return projectLibrary().find((project) => project.id === id);
}

function loadProjectFromLibrary() {
  const project = selectedLibraryProject();
  if (!project) return showToast("请选择项目");
  applyState(project.state);
  renderCompetitors();
  renderAssets();
  renderLeads();
  generateAll();
  showToast("项目已载入");
}

function duplicateProjectFromLibrary() {
  const project = selectedLibraryProject();
  if (!project) return showToast("请选择项目");
  const projects = projectLibrary();
  const copy = {
    ...project,
    id: `${Date.now()}`,
    name: `${project.name} 副本`,
    updatedAt: new Date().toLocaleString("zh-CN"),
  };
  projects.unshift(copy);
  saveProjectLibrary(projects.slice(0, 30));
  projectLibrarySelect.value = copy.id;
  showToast("项目已复制");
}

function deleteProjectFromLibrary() {
  const id = projectLibrarySelect.value;
  if (!id) return showToast("请选择项目");
  saveProjectLibrary(projectLibrary().filter((project) => project.id !== id));
  showToast("项目已删除");
}

function makePost(product, comparison) {
  const featureLines = product.features.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const firstFeature = product.features[0] || "高效净化";
  const platformHook =
    product.platform === "小红书"
      ? "家里空气这件事，不能只看感觉。"
      : product.platform === "朋友圈"
        ? "最近给家里换了一台净化器，整理一版参数给需要的朋友。"
        : "一张图看懂家用空气净化器怎么选。";
  const toneLine =
    product.tone === "生活种草"
      ? `适合${product.audience}，尤其是${product.scene}这种每天都在用的空间。`
      : product.tone === "理性对比"
        ? "先看参数，再看预算，最后看长期滤芯和售后成本。"
        : "建议把 CADR、适用面积、噪音和滤芯等级一起看。";

  return `${platformHook}

今天整理的是 ${product.brand} ${product.model}。

它的重点不是把参数堆满，而是把家用净化器最容易被忽略的体验做扎实：
${featureLines}

核心参数：
- CADR：${product.cadr || "待填"}
- 适用面积：${product.area || "待填"}㎡
- 睡眠/低噪参考：${product.noise || "待填"}dB
- 参考价格：${formatMoney(product.price)}

和同价位竞品放在一起看，当前录入参数里最突出的点是：${comparison.headline}

${toneLine}

适合人群：${product.audience}
适合场景：${product.scene}

发布图片建议：
- 图片 1：${product.brand} ${product.model} + “${firstFeature}”
- 图片 2：CADR / 面积 / 噪音 / 价格参数卡
- 图片 3：同行竞品对比表，标注“基于当前公开/录入参数”
- 图片 4：滤芯、传感器、睡眠模式等细节
- 图片 5：购买前核对检测报告、售后和滤芯成本

行动引导：${product.cta}

#空气净化器 #新房除醛 #母婴家庭 #养宠家庭 #家电选购`;
}

function readinessItems(product) {
  const items = [
    ["产品 CADR", Boolean(product.cadr)],
    ["适用面积", Boolean(product.area)],
    ["噪音参数", Boolean(product.noise)],
    ["参考价格", Boolean(product.price)],
    ["核心卖点", product.features.length > 0],
    ["滤芯价格", Boolean(product.filterPrice)],
    ["滤芯寿命", Boolean(product.filterLife)],
    ["功率参数", Boolean(product.powerWatts)],
    ["竞品来源", competitors.every((item) => item.source && item.date)],
    ["证据素材", evidenceAssets.length > 0],
    ["承接方式", Boolean(product.leadChannel)],
    ["投放口径", Boolean(product.adBudget && product.costPerClick && product.leadRate && product.dealRate)],
  ];
  const done = items.filter(([, ok]) => ok).length;
  return {
    items,
    done,
    total: items.length,
    score: Math.round((done / items.length) * 100),
    missing: items.filter(([, ok]) => !ok).map(([name]) => name),
  };
}

function makeOverview(product, comparison) {
  const ready = readinessItems(product);
  const cost = annualCost(product, product);
  const kpi = kpiForecast(product);
  return `项目总览：

项目：${product.campaignName}
产品：${product.brand} ${product.model}
平台/语气：${product.platform} / ${product.tone}
目标人群：${product.audience}
使用场景：${product.scene}

关键指标：
- CADR：${product.cadr || "待填"}
- 适用面积：${product.area || "待填"}㎡
- 噪音参考：${product.noise || "待填"}dB
- 参考价格：${formatMoney(product.price)}
- 年使用成本：${moneyNumber(cost.total)}
- 预估 ROAS：${kpi.roas.toFixed(2)}
- 项目完备度：${ready.score}%

当前主结论：
${comparison.headline}

待补资料：
${ready.missing.length ? ready.missing.map((item) => `- ${item}`).join("\n") : "- 基础资料已齐，可以进入发布前人工复核。"}

下一步动作：
1. 补齐待补资料和证据素材。
2. 选择“文案版本”里的 A/B/C 组合做首轮测试。
3. 按“发布排期”准备 7 天内容。
4. 用“线索承接”统一评论和私信口径。
5. 投放后用“复盘模板”记录实际数据。`;
}

function renderOverviewCards(product, comparison) {
  const ready = readinessItems(product);
  const cost = annualCost(product, product);
  const kpi = kpiForecast(product);
  const cards = [
    ["完备度", `${ready.score}%`, `${ready.done}/${ready.total} 项已完成`],
    ["年使用成本", moneyNumber(cost.total), "滤芯 + 电费估算"],
    ["预估 ROAS", kpi.roas.toFixed(2), "销售额 / 广告费"],
    ["竞品数量", `${comparison.valid.length}`, "参与当前对比"],
    ["证据素材", `${evidenceAssets.length}`, "文件清单记录"],
    ["行动引导", product.cta, "评论区/私信承接"],
  ];

  outputs.overviewCards.innerHTML = cards
    .map(
      ([label, value, note]) => `
        <div class="summary-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <em>${escapeHtml(note)}</em>
        </div>
      `,
    )
    .join("");
}

function makeSalesBrief(product, comparison) {
  const cost = annualCost(product, product);
  return `销售简报：

一句话定位：
${product.brand} ${product.model} 是一款面向${product.audience}的家用空气净化器，适合${product.scene}，重点沟通“参数透明、使用成本可估算、竞品对比有来源”。

核心卖点：
${product.features.map((item, index) => `${index + 1}. ${item}`).join("\n")}

必须记住的参数：
- CADR：${product.cadr || "待填"}
- 适用面积：${product.area || "待填"}㎡
- 噪音参考：${product.noise || "待填"}dB
- 参考价格：${formatMoney(product.price)}
- 滤芯：${formatMoney(product.filterPrice)} / ${product.filterLife || "待填"}个月
- 年使用成本：约 ${moneyNumber(cost.total)}
- 质保：${product.warrantyYears || "待填"} 年

和竞品对比时怎么说：
${comparison.headline}。但竞品参数、活动价和版本会变化，必须带上来源和核对日期，不做绝对化承诺。

常见问答：
Q：我家面积够不够？
A：先看独立房间面积、层高、是否连通客餐厅。当前录入适用面积是 ${product.area || "待填"}㎡，开放空间建议留余量。

Q：滤芯贵不贵？
A：当前滤芯 ${formatMoney(product.filterPrice)} / ${product.filterLife || "待填"}个月，年滤芯成本约 ${moneyNumber(cost.filter)}。实际更换周期跟空气质量和使用时长有关。

Q：和竞品比哪个好？
A：我们可以按 CADR、面积、噪音、价格、滤芯成本做同口径对比。当前最突出的是：${comparison.headline}。

Q：有没有优惠？
A：${product.offer}

禁止话术：
- 不说“最强、第一、彻底、100%、零甲醛、医学级”等无法证明表达。
- 不承诺检测报告外的功效。
- 不冒充真实用户评价。
- 不用未核实竞品数据做攻击式对比。`;
}

function makeVariants(product, comparison) {
  const firstFeature = product.features[0] || "高效净化";
  const cost = annualCost(product, product);
  const titleOptions = [
    `新房空气怎么选？${product.brand} ${product.model} 参数先看这 4 个`,
    `${product.area || "大面积"}㎡家庭净化器对比：别只看价格`,
    `空气净化器不是越贵越好，关键看 CADR、滤芯和噪音`,
    `${product.brand} ${product.model}：适合${product.audience}的净化方案`,
    `同价位净化器怎么比？把年使用成本也算进去`,
    `${product.scene}空气管理清单：从参数到滤芯成本一次看懂`,
  ];

  const hooks = [
    `很多人买净化器只看价格，但真正长期影响体验的是 CADR、噪音、滤芯和使用成本。`,
    `如果家里是${product.scene}，建议先把空间面积、通风条件和滤芯成本算清楚。`,
    `我把 ${product.brand} ${product.model} 和同价位竞品放到一张表里，发现最值得看的不是单个宣传点。`,
    `新房、母婴、养宠家庭选净化器，参数越透明越省心。`,
  ];

  const ctas = [
    product.cta,
    "想要完整参数表，评论区留言“表格”。",
    "需要按户型估算适用面积，可以留言面积和使用场景。",
    "想看滤芯成本清单，评论“滤芯”。",
  ];

  return `标题备选：
${titleOptions.map((item, index) => `${index + 1}. ${item}`).join("\n")}

开头备选：
${hooks.map((item, index) => `${index + 1}. ${item}`).join("\n")}

CTA 备选：
${ctas.map((item, index) => `${index + 1}. ${item}`).join("\n")}

短视频/图文封面字：
1. ${product.brand} ${product.model} 参数表
2. ${product.area || "待填"}㎡、${product.noise || "待填"}dB、${formatMoney(product.price)}
3. 年使用成本约 ${moneyNumber(cost.total)}
4. ${comparison.headline}
5. ${firstFeature}

三版组合建议：
A 版｜理性参数：标题 1 + 开头 1 + CTA 1
B 版｜场景种草：标题 4 + 开头 2 + CTA 3
C 版｜成本对比：标题 5 + 开头 3 + CTA 4`;
}

function makePosterScript(product, comparison) {
  return `图片 1：封面
主标题：${product.brand} ${product.model}
副标题：${product.scene}的空气净化方案
角标：CADR ${product.cadr || "待填"} / ${product.area || "待填"}㎡ / ${product.noise || "待填"}dB

图片 2：核心卖点
${product.features.slice(0, 5).map((item) => `- ${item}`).join("\n")}

图片 3：同行竞品对比
标题：同价位先看四个硬指标
结论：${comparison.headline}
备注：所有竞品参数发布前需要核对来源和日期。

图片 4：适用场景
${product.audience}：${product.scene}

图片 5：行动引导
${product.cta}`;
}

function makeImagePrompt(product, comparison) {
  const features = product.features.slice(0, 4).join("，") || "高效空气净化";
  return `用途：给 AI 生图工具生成空气净化器宣传图背景或主视觉，再把具体文字放到设计工具里排版。

中文提示词：
一台现代家用空气净化器，外观简洁高级，白色机身，放在明亮通透的${product.scene}，环境干净有生活感，空气流动可视化，轻微粒子被吸入净化器，画面适合${product.audience}，强调${features}，真实产品广告摄影风格，柔和自然光，专业家电品牌视觉，构图留出上方和左侧文字区域，3:4 竖版海报，高清，细节清晰。

英文提示词：
Modern home air purifier product advertising image, clean white device, placed in a bright and realistic ${product.scene}, visible clean airflow, subtle particles moving into the purifier, suitable for ${product.audience}, key features: ${features}, premium appliance brand photography, soft natural light, realistic interior, clean composition with empty space for text on the top and left, vertical 3:4 poster, high resolution, sharp product details.

反向提示词：
不要夸张医疗场景，不要医院手术室，不要儿童直接贴脸吹风，不要烟雾过浓，不要廉价塑料质感，不要杂乱背景，不要把竞品 logo 放进画面，不要生成无法证明的功效数字。

建议叠加文字：
- ${product.brand} ${product.model}
- ${comparison.headline}
- CADR ${product.cadr || "待填"} / ${product.area || "待填"}㎡ / ${product.noise || "待填"}dB
- ${product.cta}`;
}

function makeComments(product) {
  return `说明：以下更适合做“互动话题”和“评论区引导”，不要冒充真实用户购买评价。

1. 新房刚装修，净化器主要看 CADR 还是甲醛数显？
2. ${product.area || "大面积"}㎡左右的客厅，一台够用吗？
3. 想看 ${product.brand} 和同价位热门款的滤芯成本对比。
4. 睡觉开低档会不会有明显噪音？
5. 家里有宠物，滤芯多久换一次更合适？
6. 除了 PM2.5，甲醛、异味、花粉分别要看哪些参数？
7. 这个价格段最该避开的坑是什么？
8. 能不能做一张 ${product.brand} ${product.model} 的参数表？

评论区置顶建议：
${product.cta}。参数表会标注来源和核对日期，方便自己二次确认。`;
}

function makeCommentMatrix(product, comparison) {
  return `评论矩阵使用说明：
这些是评论区运营素材，不建议伪装成真实购买评价。更适合由官方账号、导购号或内容号按场景发布。

一、种草型
1. 新房通风一阵子以后，还是想加一台净化器，主要图个安心。
2. ${product.scene}这种空间，能把 CADR、噪音和滤芯成本讲清楚就很加分。
3. 我更关心晚上开着会不会吵，${product.noise || "待填"}dB 这个参数可以重点看看。
4. ${product.brand} 这版参数表做得挺直观，适合先收藏再对比。

二、提问型
1. ${product.area || "待填"}㎡是封闭房间面积，还是客餐厅连通也能参考？
2. 滤芯多久换一次，养宠家庭会不会更快？
3. 甲醛数显和 PM2.5 数显分别看什么？
4. 能不能把 ${product.brand} 和同价位三款的滤芯价格也放进表里？

三、理性对比型
1. 单看价格意义不大，CADR、面积、噪音、滤芯后期成本要一起看。
2. 当前参数里最突出的点是：${comparison.headline}。
3. 建议把竞品具体型号和核对日期标出来，不然活动价变化后容易误判。
4. 如果是新装修房间，检测报告比口号更重要。

四、官方承接型
1. 想看完整参数表可以留言，我们会把来源和核对日期一起标注。
2. 不同户型的适用面积会有差异，可以按房间面积和层高估算。
3. 价格会随活动变化，建议以实时页面为准。
4. ${product.cta}`;
}

function makeReplies(product, comparison) {
  return `官方回复模板：

评论：新房刚装修，净化器主要看 CADR 还是甲醛数显？
回复：两项都要看。CADR 影响净化速度，甲醛/PM2.5 数显方便观察变化；发布前建议同时核对检测报告、适用面积和滤芯配置。
二级回复：如果是${product.scene}，可以按房间面积、通风条件和滤芯成本一起算，更接近真实使用。

评论：${product.area || "大面积"}㎡客厅一台够用吗？
回复：按当前录入参数，${product.brand} ${product.model} 标注适用面积为 ${product.area || "待填"}㎡。如果客厅连通餐厅或层高偏高，建议留出余量。
二级回复：可以把户型面积和使用场景发来，我们按 CADR 和空间估算一版。

评论：和竞品比优势在哪里？
回复：基于当前录入参数，主要差异是：${comparison.headline}。竞品参数会随版本和售价变化，发布前会按最新公开信息核对。
二级回复：如果你关注滤芯成本或睡眠噪音，也可以单独拉表对比。

评论：滤芯多久换？
回复：滤芯寿命通常和空气质量、使用时长、宠物毛发、装修污染有关。建议以机器提醒为准，同时观察异味和风量变化。
二级回复：养宠或新装修环境可以适当缩短检查周期。`;
}

function makeComparison(product, comparison) {
  const rows = comparison.valid
    .map((item) => {
      const cadr = product.cadr - item.cadr;
      const area = product.area - item.area;
      const noise = item.noise - product.noise;
      const price = item.price - product.price;
      const productCost = annualCost(product, product).total;
      const itemCost = annualCost(item, product).total;
      const costDiff = productCost - itemCost;
      return `${item.name}
- 参数来源：${sourceLine(item)}
- CADR：${product.cadr || "待填"} vs ${item.cadr || "待填"}（${cadr >= 0 ? "+" : ""}${cadr}）
- 面积：${product.area || "待填"}㎡ vs ${item.area || "待填"}㎡（${area >= 0 ? "+" : ""}${area}㎡）
- 噪音：${product.noise || "待填"}dB vs ${item.noise || "待填"}dB（${noise >= 0 ? "低 " + noise : "高 " + Math.abs(noise)}dB）
- 价格：${formatMoney(product.price)} vs ${formatMoney(item.price)}（${price >= 0 ? "低 " + price : "高 " + Math.abs(price)} 元）
- 估算年使用成本：${moneyNumber(productCost)} vs ${moneyNumber(itemCost)}（${costDiff <= 0 ? "低 " + Math.abs(Math.round(costDiff)) : "高 " + Math.round(costDiff)} 元）`;
    })
    .join("\n\n");

  return `对比口径：基于你在左侧录入的参数，发布前请核对参数来源、统计日期、具体型号和活动价格。

一句话结论：
${comparison.headline}

逐项对比：
${rows || "请先添加竞品参数。"}

可发布表达：
同价位空气净化器不要只看单项宣传，建议把 CADR、适用面积、噪音、滤芯配置和长期成本放在同一张表里看。以当前录入参数为例，${product.brand} ${product.model} 的重点是 ${comparison.headline}`;
}

function renderCompareTable(product, comparison) {
  const rows = comparison.valid
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.cadr || "待填"}</td>
          <td>${item.area || "待填"}㎡</td>
          <td>${item.noise || "待填"}dB</td>
          <td>${formatMoney(item.price)}</td>
          <td>${moneyNumber(annualCost(item, product).total)}</td>
          <td>${escapeHtml(sourceLine(item))}</td>
        </tr>
      `,
    )
    .join("");

  outputs.compareTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>产品</th>
          <th>CADR</th>
          <th>面积</th>
          <th>噪音</th>
          <th>价格</th>
          <th>年成本</th>
          <th>来源</th>
        </tr>
      </thead>
      <tbody>
        <tr class="highlight-row">
          <td>${escapeHtml(product.brand)} ${escapeHtml(product.model)}</td>
          <td>${product.cadr || "待填"}</td>
          <td>${product.area || "待填"}㎡</td>
          <td>${product.noise || "待填"}dB</td>
          <td>${formatMoney(product.price)}</td>
          <td>${moneyNumber(annualCost(product, product).total)}</td>
          <td>当前项目录入</td>
        </tr>
        ${rows}
      </tbody>
    </table>
  `;
}

function makeCostComparison(product, comparison) {
  const productCost = annualCost(product, product);
  const rows = comparison.valid
    .map((item) => {
      const itemCost = annualCost(item, product);
      const diff = productCost.total - itemCost.total;
      return `${item.name}
- 滤芯：${formatMoney(item.filterPrice)} / ${item.filterLife || "待填"}个月
- 电耗：${item.powerWatts || "待填"}W，按每天 ${product.hoursPerDay || "待填"} 小时、电价 ${product.electricityPrice || "待填"} 元/度估算
- 年滤芯成本：${moneyNumber(itemCost.filter)}
- 年电费：${moneyNumber(itemCost.electricity)}
- 年使用成本：${moneyNumber(itemCost.total)}
- 与 ${product.brand} 相比：${diff <= 0 ? "高 " + Math.abs(Math.round(diff)) : "低 " + Math.round(diff)} 元/年`;
    })
    .join("\n\n");

  return `估算口径：
- 年使用成本 = 年滤芯成本 + 年电费
- 年滤芯成本 = 滤芯价格 × 12 / 滤芯寿命（月）
- 年电费 = 功率 W × 每日使用小时 × 365 × 电价 / 1000
- 当前按每天 ${product.hoursPerDay || "待填"} 小时、电价 ${product.electricityPrice || "待填"} 元/度估算

${product.brand} ${product.model}：
- 滤芯：${formatMoney(product.filterPrice)} / ${product.filterLife || "待填"}个月
- 功率：${product.powerWatts || "待填"}W
- 年滤芯成本：${moneyNumber(productCost.filter)}
- 年电费：${moneyNumber(productCost.electricity)}
- 年使用成本：${moneyNumber(productCost.total)}
- 质保：${product.warrantyYears || "待填"} 年

竞品逐项：
${rows || "请先添加竞品参数。"}

可发布表达：
购买空气净化器不只看到手价，也要看滤芯价格、滤芯寿命和常开电费。以上是按统一口径估算，实际成本会随空气质量、使用时长和活动价变化。`;
}

function renderCostTable(product, comparison) {
  const rows = comparison.valid
    .map((item) => {
      const cost = annualCost(item, product);
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${formatMoney(item.filterPrice)}</td>
          <td>${item.filterLife || "待填"}个月</td>
          <td>${item.powerWatts || "待填"}W</td>
          <td>${moneyNumber(cost.filter)}</td>
          <td>${moneyNumber(cost.electricity)}</td>
          <td>${moneyNumber(cost.total)}</td>
        </tr>
      `;
    })
    .join("");
  const productCost = annualCost(product, product);

  outputs.costTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>产品</th>
          <th>滤芯价</th>
          <th>寿命</th>
          <th>功率</th>
          <th>年滤芯</th>
          <th>年电费</th>
          <th>年成本</th>
        </tr>
      </thead>
      <tbody>
        <tr class="highlight-row">
          <td>${escapeHtml(product.brand)} ${escapeHtml(product.model)}</td>
          <td>${formatMoney(product.filterPrice)}</td>
          <td>${product.filterLife || "待填"}个月</td>
          <td>${product.powerWatts || "待填"}W</td>
          <td>${moneyNumber(productCost.filter)}</td>
          <td>${moneyNumber(productCost.electricity)}</td>
          <td>${moneyNumber(productCost.total)}</td>
        </tr>
        ${rows}
      </tbody>
    </table>
  `;
}

function scheduleItems(product, comparison) {
  return [
    {
      day: "第 1 天",
      theme: "参数总览",
      content: `${product.brand} ${product.model} 核心参数卡`,
      asset: "产品主图、参数截图",
      check: "核对 CADR、面积、噪音、价格",
    },
    {
      day: "第 2 天",
      theme: "场景种草",
      content: `${product.scene}使用场景，突出${product.features[0] || "核心卖点"}`,
      asset: "家居场景图、产品摆放图",
      check: "避免承诺具体净化效果",
    },
    {
      day: "第 3 天",
      theme: "竞品对比",
      content: `同价位竞品对比，主结论：${comparison.headline}`,
      asset: "竞品详情页截图、参数来源",
      check: "标注来源和核对日期",
    },
    {
      day: "第 4 天",
      theme: "成本拆解",
      content: "滤芯成本、电费、年使用成本统一口径估算",
      asset: "滤芯价格截图、电价口径",
      check: "说明估算条件，不写绝对成本",
    },
    {
      day: "第 5 天",
      theme: "评论答疑",
      content: "整理常见问题：面积够不够、睡觉吵不吵、滤芯多久换",
      asset: "评论截图或 FAQ 卡片",
      check: "不要伪装真实用户评价",
    },
    {
      day: "第 6 天",
      theme: "证据背书",
      content: "检测报告、参数来源、售后和质保信息汇总",
      asset: "检测报告、售后政策截图",
      check: "敏感数据打码，报告信息真实",
    },
    {
      day: "第 7 天",
      theme: "转化收口",
      content: `${product.cta}，整理参数表和购买前检查清单`,
      asset: "合集封面、参数表",
      check: "价格以实时页面为准",
    },
  ];
}

function makeSchedule(product, comparison) {
  return `7 天发布排期：

${scheduleItems(product, comparison)
  .map(
    (item) => `${item.day}｜${item.theme}
- 内容：${item.content}
- 素材：${item.asset}
- 审核：${item.check}`,
  )
  .join("\n\n")}

执行建议：
- 每天发布前先刷新竞品价格和参数来源。
- 每条内容都保留“参数来源/核对日期/估算口径”。
- 评论区优先承接问题，不用夸张话术硬转化。`;
}

function renderScheduleTable(product, comparison) {
  outputs.scheduleTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>时间</th>
          <th>主题</th>
          <th>内容</th>
          <th>素材</th>
          <th>审核点</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleItems(product, comparison)
          .map(
            (item) => `
              <tr>
                <td>${item.day}</td>
                <td>${escapeHtml(item.theme)}</td>
                <td>${escapeHtml(item.content)}</td>
                <td>${escapeHtml(item.asset)}</td>
                <td>${escapeHtml(item.check)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function makeShootingPlan(product, comparison) {
  const productCost = annualCost(product, product);
  return `拍摄目标：
把 ${product.brand} ${product.model} 拍成“参数透明、适合家庭、能对比长期成本”的空气净化器内容，而不是只拍一个白色家电摆件。

必拍素材：
1. 产品全景：放在${product.scene}，机身完整、环境干净，留出文字区域。
2. 操作细节：按键/屏幕/数显/模式切换，突出“看得懂空气变化”。
3. 风道与出风：用轻薄纸条或安全可视化方式表现风量，不制造夸张烟雾。
4. 滤芯细节：滤芯外观、安装方式、滤芯型号和价格截图。
5. 使用场景：${product.audience}对应的家庭空间，避免医疗化、恐吓式画面。
6. 证据素材：检测报告、参数页、竞品截图、活动价截图。
7. 对比画面：把 CADR、面积、噪音、年成本做成表格卡片。

短视频 30 秒分镜：
0-3s：痛点开场
画面：${product.scene}空间 + 产品入镜
字幕：家用净化器别只看价格

4-9s：核心参数
画面：产品数显/参数卡
字幕：CADR ${product.cadr || "待填"}｜${product.area || "待填"}㎡｜${product.noise || "待填"}dB

10-16s：竞品对比
画面：对比表滚动或手指指向表格
字幕：${comparison.headline}

17-23s：长期成本
画面：滤芯 + 电费估算卡
字幕：年使用成本约 ${moneyNumber(productCost.total)}，按统一口径估算

24-30s：行动引导
画面：产品定格 + 参数表
字幕：${product.cta}

拍摄注意：
- 不拍“医疗级”“彻底除醛”“100%净化”等无法证明画面。
- 不用大量烟雾制造恐慌感。
- 检测报告、竞品截图出现时要能看清来源和日期。
- 价格、滤芯寿命、年成本都要保留“估算/以实时页面为准”的口径。`;
}

function makeLeadScripts(product, comparison) {
  const productCost = annualCost(product, product);
  return `线索承接目标：
把评论区的兴趣用户分成“要参数表”“问户型面积”“问竞品对比”“问滤芯成本”“问优惠购买”五类，分别承接，避免一句话硬推。

承接方式：
${product.leadChannel}

主推优惠/权益：
${product.offer}

1. 用户评论“净化器/参数表”
私信：
你好，这是 ${product.brand} ${product.model} 的参数整理口径：CADR ${product.cadr || "待填"}、适用面积 ${product.area || "待填"}㎡、低噪参考 ${product.noise || "待填"}dB。竞品对比我会标注来源和核对日期，方便你自己复核。
追问：
你主要是新房、卧室、客厅，还是养宠场景？我可以按场景把重点参数圈出来。

2. 用户问“我家面积够不够”
私信：
可以先按房间面积、层高、是否连通客餐厅、通风情况来估算。当前录入适用面积是 ${product.area || "待填"}㎡，如果空间连通或污染源多，建议留出余量。
追问：
你大概是几平米？是独立房间还是开放客餐厅？

3. 用户问“和竞品比优势”
私信：
基于当前录入参数，最明显的差异是：${comparison.headline}。不过竞品价格和参数会变，我建议看具体型号、来源日期和活动价。
追问：
你更在意净化速度、睡眠噪音、到手价，还是后期滤芯成本？

4. 用户问“滤芯贵不贵”
私信：
按当前口径，${product.brand} ${product.model} 滤芯 ${formatMoney(product.filterPrice)} / ${product.filterLife || "待填"}个月，年滤芯成本约 ${moneyNumber(productCost.filter)}；加上电费后年使用成本约 ${moneyNumber(productCost.total)}。实际会随使用时长和空气质量变化。
追问：
你是准备每天常开，还是只在新房/睡前/空气差时开？

5. 用户问“怎么买/有没有优惠”
私信：
${product.offer}。价格建议以实时页面为准，我可以先把参数表和购买前检查清单发你，避免只看活动价。
追问：
你要不要我顺手把滤芯价格、质保和竞品截图一起发你？

线索标签建议：
- A 类：明确户型 + 问价格，优先发参数表和购买清单。
- B 类：问竞品，优先发对比表和来源截图。
- C 类：问滤芯，优先发年成本表。
- D 类：只围观，评论区公开答疑即可。

禁用表达：
- 不说“保证除醛”“永久有效”“全网第一”。
- 不冒充真实用户评价。
- 不用竞品未核实数据刺激成交。`;
}

function makeKpiForecast(product) {
  const kpi = kpiForecast(product);
  return `投放预估口径：
- 预算：${formatMoney(product.adBudget)}
- 预估点击成本：${formatMoney(product.costPerClick)}
- 点击转线索率：${formatRate(product.leadRate)}
- 线索成交率：${formatRate(product.dealRate)}
- 客单价：${formatMoney(product.averageOrderValue)}
- 毛利率：${formatRate(product.grossMarginRate)}

预估结果：
- 点击量：${formatCount(kpi.clicks)}
- 线索量：${formatCount(kpi.leads)}
- 成交单数：${formatCount(kpi.orders)}
- 销售额：${moneyNumber(kpi.revenue)}
- 毛利：${moneyNumber(kpi.grossProfit)}
- ROAS：${kpi.roas.toFixed(2)}
- 扣广告费后毛利：${moneyNumber(kpi.profitAfterAds)}

判断建议：
${kpi.profitAfterAds >= 0 ? "- 按当前口径，预估毛利可以覆盖广告费。" : "- 按当前口径，预估毛利暂时不能覆盖广告费，需要降低 CPC、提高线索率/成交率，或提高客单价。"}
- 如果线索量不足，优先优化封面、标题和评论承接。
- 如果线索多但成交少，优先优化私信话术、参数表和优惠承接。
- 如果 ROAS 不低但利润差，检查毛利率、滤芯赠品、平台扣点和售后成本。`;
}

function renderKpiTable(product) {
  const kpi = kpiForecast(product);
  const rows = [
    ["预算", formatMoney(product.adBudget), "计划投入金额"],
    ["点击成本", formatMoney(product.costPerClick), "按平台近似 CPC 填写"],
    ["点击量", formatCount(kpi.clicks), "预算 / 点击成本"],
    ["线索量", formatCount(kpi.leads), "点击量 × 点击转线索率"],
    ["成交单数", formatCount(kpi.orders), "线索量 × 线索成交率"],
    ["销售额", moneyNumber(kpi.revenue), "成交单数 × 客单价"],
    ["毛利", moneyNumber(kpi.grossProfit), "销售额 × 毛利率"],
    ["ROAS", kpi.roas.toFixed(2), "销售额 / 广告费"],
    ["扣广告费后毛利", moneyNumber(kpi.profitAfterAds), "毛利 - 广告费"],
  ];

  outputs.kpiTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>指标</th>
          <th>预估值</th>
          <th>口径</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            ([name, value, note]) => `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(value)}</td>
                <td>${escapeHtml(note)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function makeRetroTemplate(product) {
  const kpi = kpiForecast(product);
  return `投放复盘模板：

一、基础信息
- 项目：${product.campaignName}
- 产品：${product.brand} ${product.model}
- 平台：${product.platform}
- 内容方向：${product.tone}
- 时间范围：____ 年 __ 月 __ 日 - __ 月 __ 日

二、计划目标
- 预算：${formatMoney(product.adBudget)}
- 预估点击：${formatCount(kpi.clicks)}
- 预估线索：${formatCount(kpi.leads)}
- 预估成交：${formatCount(kpi.orders)}
- 预估销售额：${moneyNumber(kpi.revenue)}
- 预估 ROAS：${kpi.roas.toFixed(2)}

三、实际数据
- 实际花费：
- 曝光：
- 点击：
- 点击率：
- 平均点击成本：
- 评论/私信：
- 有效线索：
- 成交单数：
- 销售额：
- 毛利：
- ROAS：
- 扣广告费后毛利：

四、内容表现
- 表现最好的标题：
- 表现最好的封面：
- 表现最好的评论承接：
- 被问最多的问题：
- 用户最关心的参数：
- 用户最犹豫的点：

五、转化问题诊断
- 曝光低：检查选题、封面、发布时间、账号权重。
- 点击低：检查标题和封面是否够具体。
- 线索低：检查 CTA、评论区置顶、参数表吸引力。
- 成交低：检查价格、竞品对比、私信承接、信任证据。
- 利润低：检查 CPC、赠品、滤芯成本、平台扣点和售后成本。

六、下轮动作
1. 保留：
2. 停止：
3. 优化：
4. 新测试：

复盘提醒：
不要只看点赞收藏。空气净化器这类产品要同时看有效线索、参数咨询、竞品问题、滤芯成本问题和最终成交。`;
}

function taskItems(product, comparison) {
  return [
    {
      owner: "产品/运营",
      priority: "高",
      task: "核对产品基础参数",
      output: `CADR ${product.cadr || "待填"}、面积 ${product.area || "待填"}㎡、噪音 ${product.noise || "待填"}dB、价格 ${formatMoney(product.price)}`,
      due: "发布前 2 天",
      check: "参数来源可追溯，型号一致",
    },
    {
      owner: "运营",
      priority: "高",
      task: "补齐竞品来源和核对日期",
      output: `${comparison.valid.length} 个竞品参数截图`,
      due: "发布前 2 天",
      check: "每个竞品有来源、日期、具体型号",
    },
    {
      owner: "设计/拍摄",
      priority: "高",
      task: "拍摄产品主图和场景图",
      output: `${product.scene}主视觉、滤芯细节、数显细节`,
      due: "发布前 1 天",
      check: "画面不夸大污染，不出现无法证明功效",
    },
    {
      owner: "内容",
      priority: "高",
      task: "确认首发图文版本",
      output: "标题、开头、封面字、5 张图片分镜",
      due: "发布当天",
      check: "无风险词，CTA 清楚",
    },
    {
      owner: "运营",
      priority: "中",
      task: "准备评论区置顶和互动评论",
      output: "置顶评论、8 条互动话题、评论矩阵",
      due: "发布当天",
      check: "不伪装真实用户评价",
    },
    {
      owner: "客服/销售",
      priority: "高",
      task: "统一私信承接话术",
      output: product.leadChannel,
      due: "发布当天",
      check: "能承接参数表、户型、竞品、滤芯、优惠问题",
    },
    {
      owner: "投放",
      priority: "中",
      task: "设置投放预估和观察指标",
      output: `预算 ${formatMoney(product.adBudget)}，目标 ROAS ${kpiForecast(product).roas.toFixed(2)}`,
      due: "投放前",
      check: "预算、CPC、线索率、成交率口径一致",
    },
    {
      owner: "复盘",
      priority: "中",
      task: "记录实际数据并复盘",
      output: "曝光、点击、线索、成交、销售额、ROAS",
      due: "发布后 7 天",
      check: "形成下轮保留/停止/优化/新测试动作",
    },
  ];
}

function makeTasks(product, comparison) {
  return `执行看板：

${taskItems(product, comparison)
  .map(
    (item, index) => `${index + 1}. 【${item.priority}】${item.task}
- 负责人：${item.owner}
- 交付物：${item.output}
- 截止：${item.due}
- 验收：${item.check}`,
  )
  .join("\n\n")}

推进建议：
- 高优先级任务先完成参数、证据、首发内容和私信承接。
- 每次发布后把用户问题回填到“评论矩阵”和“销售简报”。
- 如果素材或证据没齐，不要硬上竞品对比和除醛/杀菌类表达。`;
}

function renderTasksTable(product, comparison) {
  outputs.tasksTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>优先级</th>
          <th>任务</th>
          <th>负责人</th>
          <th>交付物</th>
          <th>截止</th>
          <th>验收</th>
        </tr>
      </thead>
      <tbody>
        ${taskItems(product, comparison)
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.priority)}</td>
                <td>${escapeHtml(item.task)}</td>
                <td>${escapeHtml(item.owner)}</td>
                <td>${escapeHtml(item.output)}</td>
                <td>${escapeHtml(item.due)}</td>
                <td>${escapeHtml(item.check)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function makeOnePageReport(product, comparison) {
  const ready = readinessItems(product);
  const cost = annualCost(product, product);
  const kpi = kpiForecast(product);
  return `一页汇报：

项目：${product.campaignName}
产品：${product.brand} ${product.model}
目标：面向${product.audience}，在${product.scene}场景中建立“参数透明、竞品可核对、长期成本清楚”的购买理由。

核心判断：
- 当前主结论：${comparison.headline}
- 项目完备度：${ready.score}%
- 年使用成本：${moneyNumber(cost.total)}
- 预估 ROAS：${kpi.roas.toFixed(2)}
- 证据素材：${evidenceAssets.length} 个
- 竞品样本：${comparison.valid.length} 个

本轮重点动作：
1. 补齐资料：${ready.missing.length ? ready.missing.join("、") : "基础资料已齐"}
2. 内容发布：按 7 天发布排期执行，首发优先用参数总览 + 场景种草。
3. 转化承接：${product.leadChannel}
4. 投放观察：重点看点击成本、有效线索、成交率和 ROAS。
5. 复盘沉淀：把用户高频问题回填到评论矩阵、销售简报和下一轮选题。

风险提醒：
- 竞品对比必须保留来源、日期和型号。
- 成本、投放、ROAS 都是估算口径，不对外承诺。
- 除醛、杀菌、医疗化表达必须有检测报告或权威依据。`;
}

function renderReportSheet(product, comparison) {
  const ready = readinessItems(product);
  const cost = annualCost(product, product);
  const kpi = kpiForecast(product);
  const missing = ready.missing.length ? ready.missing.join("、") : "基础资料已齐";

  outputs.reportSheet.innerHTML = `
    <article class="report-page">
      <header>
        <p>${escapeHtml(product.platform)} / ${escapeHtml(product.tone)}</p>
        <h4>${escapeHtml(product.campaignName)}</h4>
        <span>${escapeHtml(product.brand)} ${escapeHtml(product.model)}</span>
      </header>
      <section class="report-metrics">
        <div><strong>${ready.score}%</strong><span>项目完备度</span></div>
        <div><strong>${moneyNumber(cost.total)}</strong><span>年使用成本</span></div>
        <div><strong>${kpi.roas.toFixed(2)}</strong><span>预估 ROAS</span></div>
        <div><strong>${comparison.valid.length}</strong><span>竞品样本</span></div>
      </section>
      <section class="report-block">
        <h5>核心判断</h5>
        <p>${escapeHtml(comparison.headline)}</p>
      </section>
      <section class="report-block">
        <h5>目标人群与场景</h5>
        <p>${escapeHtml(product.audience)} / ${escapeHtml(product.scene)}</p>
      </section>
      <section class="report-block">
        <h5>本轮动作</h5>
        <ol>
          <li>首发参数总览和场景种草内容。</li>
          <li>用评论矩阵承接问题，用私信话术分层跟进。</li>
          <li>投放观察点击、线索、成交和 ROAS。</li>
          <li>复盘后更新销售简报和下一轮选题。</li>
        </ol>
      </section>
      <section class="report-block">
        <h5>待补资料</h5>
        <p>${escapeHtml(missing)}</p>
      </section>
    </article>
  `;
}

function makeDashboard(product, comparison) {
  const ready = readinessItems(product);
  const cost = annualCost(product, product);
  const kpi = kpiForecast(product);
  const activeLeads = leadRecords.filter((lead) => !["已成交", "无效"].includes(lead.status)).length;
  return `数据仪表盘：

- 项目完备度：${ready.score}%
- 年使用成本：${moneyNumber(cost.total)}
- 预估点击量：${formatCount(kpi.clicks)}
- 预估线索量：${formatCount(kpi.leads)}
- 预估成交：${formatCount(kpi.orders)}
- 预估 ROAS：${kpi.roas.toFixed(2)}
- CRM 线索：${leadRecords.length} 条
- 待跟进线索：${activeLeads} 条
- 竞品样本：${comparison.valid.length} 个
- 证据素材：${evidenceAssets.length} 个

判断：
${ready.score >= 80 ? "- 项目资料基本可进入发布前人工复核。" : "- 资料还不够完整，建议先补证据素材、竞品来源和成本参数。"}
${kpi.profitAfterAds >= 0 ? "- 当前投放预估能覆盖广告费。" : "- 当前投放预估利润压力较大，优先优化 CPC、线索率或成交率。"}
${activeLeads ? "- 有待跟进线索，建议每天固定时间处理私信和评论。" : "- 当前无线索待跟进。"} `;
}

function renderDashboard(product, comparison) {
  const ready = readinessItems(product);
  const kpi = kpiForecast(product);
  const bars = [
    ["完备度", ready.score, 100, `${ready.score}%`],
    ["线索率", product.leadRate, 30, formatRate(product.leadRate)],
    ["成交率", product.dealRate, 30, formatRate(product.dealRate)],
    ["ROAS", Math.min(kpi.roas, 10), 10, kpi.roas.toFixed(2)],
  ];
  outputs.dashboardView.innerHTML = `
    <div class="dashboard-grid">
      ${bars
        .map(([label, value, max, display]) => {
          const width = Math.max(4, Math.min(100, (Number(value) / Number(max)) * 100));
          return `
            <div class="dashboard-card">
              <div class="dashboard-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(display)}</span></div>
              <div class="bar-track"><i style="width:${width}%"></i></div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function makePlatformCheck(product) {
  const text = outputs.post.textContent || "";
  const tags = text.match(/#[\u4e00-\u9fa5A-Za-z0-9_]+/g) || [];
  const imageCount = 5;
  const riskWords = product.riskWords.length ? product.riskWords : [];
  const foundRiskWords = riskWords.filter((word) => text.includes(word));
  const rules = {
    小红书: ["建议标题具体，有参数或场景", "正文控制在 300-800 字更利于阅读", "标签建议 5-10 个", "图片建议 5-9 张"],
    朋友圈: ["开头要像朋友分享，不要太广告", "正文建议更短，突出实际场景", "图片建议 1-4 张", "避免刷屏式标签"],
    抖音图文: ["封面字要短，强对比", "前 3 秒信息要明确", "图片节奏要快", "评论区承接要清楚"],
  };
  return `平台发布检查：

当前平台：${product.platform}
正文字数：${text.length}
标签数量：${tags.length}
建议图片数：${imageCount}
风险词命中：${foundRiskWords.length ? foundRiskWords.join("、") : "无"}

平台建议：
${(rules[product.platform] || rules["小红书"]).map((item) => `- ${item}`).join("\n")}

发布前检查：
- 是否标注竞品来源和核对日期：${competitors.every((item) => item.source && item.date) ? "是" : "否"}
- 是否有证据素材：${evidenceAssets.length ? "是" : "否"}
- 是否有私信承接话术：${product.leadChannel ? "是" : "否"}
- 是否有成本估算口径：${product.filterPrice && product.filterLife && product.powerWatts ? "是" : "否"}

建议修改：
${text.length > 900 ? "- 正文字数偏长，建议拆成两篇或压缩参数解释。" : "- 正文字数可用。"}
${tags.length > 10 ? "- 标签数量偏多，建议保留高相关标签。" : "- 标签数量可用。"}
${foundRiskWords.length ? "- 删除或替换命中的风险词。" : "- 未命中当前风险词库。"} `;
}

function makeCrmOutput(product) {
  if (!leadRecords.length) {
    return `CRM 线索表：
暂无线索。建议把评论“参数表”、私信咨询户型、问滤芯成本、问竞品对比的用户录入到左侧 CRM 线索区。`;
  }
  const groups = leadRecords.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  return `CRM 线索表：

线索总数：${leadRecords.length}
状态分布：
${Object.entries(groups)
  .map(([status, count]) => `- ${status}：${count}`)
  .join("\n")}

线索明细：
${leadRecords
  .map(
    (lead, index) => `${index + 1}. ${lead.name}｜${lead.source}｜${lead.interest}｜${lead.status}
- 下一步：${lead.nextStep}`,
  )
  .join("\n\n")}

跟进建议：
- 待联系：优先发送参数表和场景问题。
- 已私信/跟进中：根据关注点发送竞品对比、成本表或优惠说明。
- 已成交：记录成交原因，回填销售简报。
- 无效：记录无效原因，优化内容定向。`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function tableToCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function exportCsvBundle() {
  generateAll();
  const product = productData();
  const comparison = compareMetrics(product);
  const productCost = annualCost(product, product);
  const kpi = kpiForecast(product);
  const sections = [];

  sections.push("竞品参数");
  sections.push(
    tableToCsv([
      ["产品", "CADR", "面积", "噪音", "价格", "年成本", "来源"],
      [`${product.brand} ${product.model}`, product.cadr, `${product.area}㎡`, `${product.noise}dB`, product.price, Math.round(productCost.total), "当前项目录入"],
      ...comparison.valid.map((item) => {
        const cost = annualCost(item, product);
        return [item.name, item.cadr, `${item.area}㎡`, `${item.noise}dB`, item.price, Math.round(cost.total), sourceLine(item)];
      }),
    ]),
  );

  sections.push("\r\n成本对比");
  sections.push(
    tableToCsv([
      ["产品", "滤芯价", "寿命月", "功率W", "年滤芯", "年电费", "年成本"],
      [`${product.brand} ${product.model}`, product.filterPrice, product.filterLife, product.powerWatts, Math.round(productCost.filter), Math.round(productCost.electricity), Math.round(productCost.total)],
      ...comparison.valid.map((item) => {
        const cost = annualCost(item, product);
        return [item.name, item.filterPrice, item.filterLife, item.powerWatts, Math.round(cost.filter), Math.round(cost.electricity), Math.round(cost.total)];
      }),
    ]),
  );

  sections.push("\r\n投放预估");
  sections.push(
    tableToCsv([
      ["指标", "数值"],
      ["预算", product.adBudget],
      ["点击成本", product.costPerClick],
      ["点击量", Math.round(kpi.clicks)],
      ["线索量", Math.round(kpi.leads)],
      ["成交单数", Math.round(kpi.orders)],
      ["销售额", Math.round(kpi.revenue)],
      ["毛利", Math.round(kpi.grossProfit)],
      ["ROAS", kpi.roas.toFixed(2)],
      ["扣广告费后毛利", Math.round(kpi.profitAfterAds)],
    ]),
  );

  sections.push("\r\n执行任务");
  sections.push(
    tableToCsv([
      ["优先级", "任务", "负责人", "交付物", "截止", "验收"],
      ...taskItems(product, comparison).map((item) => [item.priority, item.task, item.owner, item.output, item.due, item.check]),
    ]),
  );

  sections.push("\r\n证据素材");
  sections.push(
    tableToCsv([
      ["文件名", "类型", "大小", "备注", "添加日期"],
      ...evidenceAssets.map((asset) => [asset.name, asset.type, asset.sizeLabel || sizeLabel(asset.size || 0), asset.note, asset.addedAt]),
    ]),
  );

  downloadText("albers-campaign-tables.csv", `\ufeff${sections.join("\r\n")}`, "text/csv;charset=utf-8");
  showToast("已导出 CSV");
}

function htmlTable(title, rows) {
  return `<h2>${escapeHtml(title)}</h2><table border="1">${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("")}</table>`;
}

function exportExcelWorkbook() {
  generateAll();
  const product = productData();
  const comparison = compareMetrics(product);
  const productCost = annualCost(product, product);
  const kpi = kpiForecast(product);
  const html = `<!doctype html><html><head><meta charset="UTF-8"></head><body>
    ${htmlTable("竞品参数", [
      ["产品", "CADR", "面积", "噪音", "价格", "年成本", "来源"],
      [`${product.brand} ${product.model}`, product.cadr, `${product.area}㎡`, `${product.noise}dB`, product.price, Math.round(productCost.total), "当前项目录入"],
      ...comparison.valid.map((item) => {
        const cost = annualCost(item, product);
        return [item.name, item.cadr, `${item.area}㎡`, `${item.noise}dB`, item.price, Math.round(cost.total), sourceLine(item)];
      }),
    ])}
    ${htmlTable("投放预估", [
      ["指标", "数值"],
      ["预算", product.adBudget],
      ["点击量", Math.round(kpi.clicks)],
      ["线索量", Math.round(kpi.leads)],
      ["成交单数", Math.round(kpi.orders)],
      ["销售额", Math.round(kpi.revenue)],
      ["毛利", Math.round(kpi.grossProfit)],
      ["ROAS", kpi.roas.toFixed(2)],
    ])}
    ${htmlTable("执行任务", [
      ["优先级", "任务", "负责人", "交付物", "截止", "验收"],
      ...taskItems(product, comparison).map((item) => [item.priority, item.task, item.owner, item.output, item.due, item.check]),
    ])}
    ${htmlTable("CRM 线索", [
      ["客户", "来源", "关注点", "状态", "下一步", "创建时间"],
      ...leadRecords.map((lead) => [lead.name, lead.source, lead.interest, lead.status, lead.nextStep, lead.createdAt]),
    ])}
  </body></html>`;
  downloadText("albers-campaign-workbook.xls", html, "application/vnd.ms-excel;charset=utf-8");
  showToast("已导出 Excel");
}

function printReport() {
  document.body.classList.add("printing-report");
  window.print();
  window.setTimeout(() => document.body.classList.remove("printing-report"), 300);
}

function makeReview(product, comparison) {
  const missing = [];
  if (!product.cadr) missing.push("产品 CADR 值未填写");
  if (!product.area) missing.push("产品适用面积未填写");
  if (!product.noise) missing.push("产品噪音未填写");
  if (!product.price) missing.push("产品参考价格未填写");
  if (!product.filterPrice) missing.push("产品滤芯价格未填写");
  if (!product.filterLife) missing.push("产品滤芯寿命未填写");
  if (!product.powerWatts) missing.push("产品功率未填写");
  competitors.forEach((item) => {
    if (!item.source || !item.date) missing.push(`${item.name || "未命名竞品"} 缺少来源或核对日期`);
    if (!item.filterPrice || !item.filterLife || !item.powerWatts) missing.push(`${item.name || "未命名竞品"} 缺少使用成本参数`);
  });

  const riskWords = product.riskWords.length
    ? product.riskWords
    : ["最强", "第一", "永久", "彻底", "100%", "零甲醛", "医学级"];
  const generatedText = [
    outputs.post.textContent,
    outputs.variants.textContent,
    outputs.compare.textContent,
    outputs.cost.textContent,
    outputs.schedule.textContent,
    outputs.shooting.textContent,
    outputs.leads.textContent,
    outputs.kpi.textContent,
    outputs.retro.textContent,
    outputs.tasks.textContent,
    outputs.report.textContent,
  ].join("\n");
  const foundRiskWords = riskWords.filter((word) => generatedText.includes(word));

  return `发布前审核清单：

资料完整性：
${missing.length ? missing.map((item) => `- 待补：${item}`).join("\n") : "- 基础参数、竞品来源和核对日期已填写。"}

表达风险：
${foundRiskWords.length ? `- 检测到高风险词：${foundRiskWords.join("、")}。建议删除或换成可证明表述。` : "- 当前生成稿没有检测到常见绝对化用词。"}
- 当前词库：${riskWords.join("、")}
- 评论内容应作为互动话题或官方回复使用，不建议包装成真实用户购买评价。
- 竞品比较必须标注具体型号、来源、核对日期和活动价格口径。
- 除醛、杀菌、过敏防护等功效需要检测报告或权威依据支撑。
- 成本对比需要说明电价、每日使用时长、滤芯寿命的估算口径。
- 私信承接不能承诺检测报告外的功效，也不要诱导用户忽略竞品来源。
- 拍摄素材不建议制造夸张污染画面，避免恐吓式营销。
- 投放预估是计划口径，不应作为实际收益承诺对外发布。

证据素材：
${evidenceSummary()}

建议发布口径：
- 使用“基于当前录入参数”“以页面标注信息为准”“价格随活动变化”等限定语。
- 如果没有检测报告，不写“除醛率”“杀菌率”等精确功效数字。
- 如果要投放广告，发布前让法务或平台招商规则再审一遍。`;
}

function renderPoster(product, comparison) {
  outputs.poster.className = `poster-preview poster-${product.posterTheme} poster-${product.posterLayout}`;
  const subtitle =
    product.posterLayout === "cost"
      ? `年使用成本约 ${moneyNumber(annualCost(product, product).total)}，按统一口径估算。`
      : product.posterLayout === "scene"
        ? `适合${escapeHtml(product.audience)}，用于${escapeHtml(product.scene)}。`
        : `${escapeHtml(comparison.headline)}，适合${escapeHtml(product.audience)}。`;
  outputs.poster.innerHTML = `
    <div class="poster-content">
      <div class="poster-brand">${escapeHtml(product.brand)} AIR PURIFIER</div>
      <div class="poster-title">${escapeHtml(product.model)}<br />把看不见的空气变成看得懂的参数</div>
      <div class="poster-subtitle">${subtitle}</div>
      <div class="poster-metrics">
        <div class="metric"><strong>${product.cadr || "待填"}</strong><span>CADR</span></div>
        <div class="metric"><strong>${product.area || "待填"}㎡</strong><span>适用面积</span></div>
        <div class="metric"><strong>${product.noise || "待填"}dB</strong><span>低噪参考</span></div>
        <div class="metric"><strong>${formatMoney(product.price)}</strong><span>参考价格</span></div>
      </div>
    </div>
  `;
}

function generateAll() {
  syncCompetitors();
  const product = productData();
  const comparison = compareMetrics(product);
  outputs.meta.textContent = `${product.campaignName} / ${product.platform} / ${product.tone}`;
  outputs.title.textContent = `${product.brand} ${product.model} 推广草稿`;
  outputs.post.textContent = makePost(product, comparison);
  outputs.overview.textContent = makeOverview(product, comparison);
  outputs.brief.textContent = makeSalesBrief(product, comparison);
  outputs.variants.textContent = makeVariants(product, comparison);
  outputs.posterScript.textContent = makePosterScript(product, comparison);
  outputs.imagePrompt.textContent = makeImagePrompt(product, comparison);
  outputs.comments.textContent = makeComments(product);
  outputs.matrix.textContent = makeCommentMatrix(product, comparison);
  outputs.replies.textContent = makeReplies(product, comparison);
  outputs.compare.textContent = makeComparison(product, comparison);
  outputs.cost.textContent = makeCostComparison(product, comparison);
  outputs.schedule.textContent = makeSchedule(product, comparison);
  outputs.shooting.textContent = makeShootingPlan(product, comparison);
  outputs.leads.textContent = makeLeadScripts(product, comparison);
  outputs.kpi.textContent = makeKpiForecast(product);
  outputs.retro.textContent = makeRetroTemplate(product);
  outputs.tasks.textContent = makeTasks(product, comparison);
  outputs.report.textContent = makeOnePageReport(product, comparison);
  outputs.dashboard.textContent = makeDashboard(product, comparison);
  outputs.platform.textContent = makePlatformCheck(product);
  outputs.crm.textContent = makeCrmOutput(product);
  outputs.review.textContent = makeReview(product, comparison);
  renderOverviewCards(product, comparison);
  renderPoster(product, comparison);
  renderCompareTable(product, comparison);
  renderCostTable(product, comparison);
  renderScheduleTable(product, comparison);
  renderKpiTable(product);
  renderTasksTable(product, comparison);
  renderReportSheet(product, comparison);
  renderDashboard(product, comparison);
  renderLeads();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyText(id) {
  if (!id) return;
  const target = document.querySelector(`#${id}`);
  if (!target) return;
  const text = target.textContent;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制");
      return;
    } catch {
      // File URLs and older browsers can block the Clipboard API.
    }
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  document.body.removeChild(helper);
  showToast("已复制");
}

async function apiJson(url, payload) {
  const response = await fetch(url, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function checkAiStatus() {
  try {
    const data = await apiJson("/api/ai/status");
    aiStatus.textContent = data.configured
      ? `已配置：文案 ${data.textModel} / 图像 ${data.imageModel}`
      : `未配置 OPENAI_API_KEY：文案 ${data.textModel} / 图像 ${data.imageModel}`;
    aiStatus.classList.toggle("ok", data.configured);
  } catch (error) {
    aiStatus.textContent = `检查失败：${error.message}`;
    aiStatus.classList.remove("ok");
  }
}

function aiPayload(mode) {
  syncCompetitors();
  const product = productData();
  const comparison = compareMetrics(product);
  return {
    task: mode,
    instruction:
      "文案归文案。请只输出可复制的中文营销文案/策略建议。图片提示词可以写，但不要声称已经生成图片。竞品对比必须严格使用输入数据。",
    product,
    competitors,
    comparisonHeadline: comparison.headline,
    currentDrafts: {
      post: outputs.post.textContent,
      variants: outputs.variants.textContent,
      comments: outputs.comments.textContent,
      leads: outputs.leads.textContent,
      review: outputs.review.textContent,
    },
  };
}

async function generateAiText() {
  const mode = selectedValue("aiTextMode");
  aiTextOutput.textContent = "AI 文案生成中...";
  try {
    const data = await apiJson("/api/ai/text", aiPayload(mode));
    aiTextOutput.textContent = data.text || "模型没有返回文本。";
    showToast("AI 文案已生成");
  } catch (error) {
    aiTextOutput.textContent = `AI 文案失败：${error.message}`;
    showToast("AI 文案失败");
  }
}

function imagePromptForModel() {
  const product = productData();
  return `生成一张空气净化器营销主视觉，不要生成表格，不要生成可读小字，不要生成竞品对比图。画面是一台现代白色家用空气净化器，放在明亮真实的${product.scene}，适合${product.audience}，高级家电摄影，柔和自然光，干净空间，空气流动可视化，留出左上方大面积空白给后期排版。不要出现竞品 logo，不要出现夸张医疗场景，不要出现无法证明的功效数字。`;
}

async function generateAiImage() {
  aiImagePreview.textContent = "AI 主视觉生成中...";
  lastAiImage = "";
  try {
    const data = await apiJson("/api/ai/image", {
      prompt: imagePromptForModel(),
      size: "1024x1536",
      quality: "medium",
    });
    lastAiImage = data.image || "";
    aiImagePreview.innerHTML = lastAiImage
      ? `<img src="${lastAiImage}" alt="AI 生成空气净化器主视觉" />`
      : "模型没有返回图片。";
    showToast("AI 主视觉已生成");
  } catch (error) {
    aiImagePreview.textContent = `AI 图片失败：${error.message}`;
    showToast("AI 图片失败");
  }
}

function preciseCompareSvg() {
  const product = productData();
  const comparison = compareMetrics(product);
  const rows = [
    [`${product.brand} ${product.model}`, product.cadr || "待填", `${product.area || "待填"}㎡`, `${product.noise || "待填"}dB`, formatMoney(product.price), moneyNumber(annualCost(product, product).total), "当前项目录入"],
    ...comparison.valid.map((item) => [
      item.name,
      item.cadr || "待填",
      `${item.area || "待填"}㎡`,
      `${item.noise || "待填"}dB`,
      formatMoney(item.price),
      moneyNumber(annualCost(item, product).total),
      sourceLine(item),
    ]),
  ];
  const safe = (value) => escapeHtml(String(value));
  const header = ["产品", "CADR", "面积", "噪音", "价格", "年成本", "来源"];
  const widths = [250, 110, 120, 120, 140, 150, 300];
  const xPositions = widths.reduce((acc, width, index) => {
    acc.push(index ? acc[index - 1] + widths[index - 1] : 50);
    return acc;
  }, []);
  const rowHeight = 74;
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const height = 230 + rowHeight * rows.length;
  const cells = (row, y, isHeader = false, highlight = false) =>
    row
      .map((cell, index) => {
        const x = xPositions[index];
        const fill = highlight ? "#e8f5f3" : isHeader ? "#263436" : "#ffffff";
        const text = isHeader ? "#ffffff" : highlight ? "#0a5f58" : "#263436";
        return `<rect x="${x}" y="${y}" width="${widths[index]}" height="${rowHeight}" fill="${fill}" stroke="#dce5e3"/>
<text x="${x + 14}" y="${y + 42}" fill="${text}" font-size="${isHeader ? 22 : 19}" font-family="Microsoft YaHei, Arial" font-weight="${isHeader || highlight ? 800 : 500}">${safe(cell).slice(0, index === 6 ? 22 : 16)}</text>`;
      })
      .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tableWidth + 100}" height="${height}" viewBox="0 0 ${tableWidth + 100} ${height}">
<rect width="100%" height="100%" fill="#f5f7f8"/>
<text x="50" y="70" fill="#172224" font-size="42" font-family="Microsoft YaHei, Arial" font-weight="900">空气净化器竞品对比</text>
<text x="50" y="116" fill="#657376" font-size="22" font-family="Microsoft YaHei, Arial">确定性渲染：数字和中文由表单数据生成，不由图像模型猜写</text>
<text x="50" y="154" fill="#0a5f58" font-size="24" font-family="Microsoft YaHei, Arial" font-weight="800">${safe(comparison.headline)}</text>
${cells(header, 185, true)}
${rows.map((row, index) => cells(row, 185 + rowHeight * (index + 1), false, index === 0)).join("")}
<text x="50" y="${height - 30}" fill="#72510d" font-size="18" font-family="Microsoft YaHei, Arial">发布前请核对竞品型号、来源日期、检测报告和实时活动价。</text>
</svg>`;
}

function downloadPreciseCompareSvg() {
  downloadText("albers-precise-competitor-comparison.svg", preciseCompareSvg(), "image/svg+xml;charset=utf-8");
  showToast("已下载精准对比图");
}

function downloadAiImage() {
  if (!lastAiImage) {
    showToast("还没有 AI 图片");
    return;
  }
  const link = document.createElement("a");
  link.href = lastAiImage;
  link.download = "albers-ai-visual.png";
  link.click();
}

function currentState() {
  syncCompetitors();
  const product = productData();
  return {
    fields: Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value])),
    platform: product.platform,
    tone: product.tone,
    competitors,
    evidenceAssets,
    leadRecords,
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState()));
  showToast("已保存到浏览器");
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    applyState(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function applyState(state) {
  Object.entries(state.fields || {}).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });
  setSelectedValue("platform", state.platform);
  setSelectedValue("tone", state.tone);
  if (Array.isArray(state.competitors)) competitors = state.competitors.map(normalizeCompetitor);
  if (Array.isArray(state.evidenceAssets)) evidenceAssets = state.evidenceAssets;
  if (Array.isArray(state.leadRecords)) leadRecords = state.leadRecords;
}

function allOutputText() {
  const product = productData();
  return `# ${product.campaignName}

## 宣传图文
${outputs.post.textContent}

## 项目总览
${outputs.overview.textContent}

## 销售简报
${outputs.brief.textContent}

## 文案版本
${outputs.variants.textContent}

## 海报分镜
${outputs.posterScript.textContent}

## AI 生图提示词
${outputs.imagePrompt.textContent}

## 评论话题
${outputs.comments.textContent}

## 评论矩阵
${outputs.matrix.textContent}

## 官方回复与二级回复
${outputs.replies.textContent}

## 竞品对比
${outputs.compare.textContent}

## 成本对比
${outputs.cost.textContent}

## 发布排期
${outputs.schedule.textContent}

## 拍摄清单
${outputs.shooting.textContent}

## 线索承接
${outputs.leads.textContent}

## 投放预估
${outputs.kpi.textContent}

## 复盘模板
${outputs.retro.textContent}

## 执行看板
${outputs.tasks.textContent}

## 一页汇报
${outputs.report.textContent}

## 数据仪表盘
${outputs.dashboard.textContent}

## 平台发布检查
${outputs.platform.textContent}

## CRM 线索
${outputs.crm.textContent}

## 证据素材
${evidenceSummary()}

## 发布审核
${outputs.review.textContent}`;
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportAll() {
  generateAll();
  downloadText("albers-campaign-copy.txt", allOutputText(), "text/plain;charset=utf-8");
  showToast("已导出全部文案");
}

function exportProject() {
  const state = {
    version: 3,
    exportedAt: new Date().toISOString(),
    ...currentState(),
  };
  downloadText("albers-campaign-project.json", JSON.stringify(state, null, 2), "application/json;charset=utf-8");
  showToast("已导出项目");
}

async function importProject(file) {
  if (!file) return;
  try {
    const state = JSON.parse(await file.text());
    applyState(state);
    renderCompetitors();
    renderAssets();
    generateAll();
    saveState();
    showToast("项目已导入");
  } catch {
    showToast("导入失败，请检查 JSON 文件");
  }
}

function sizeLabel(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function addAssets(files) {
  const note = textValue("assetNote") || "未备注";
  const addedAt = new Date().toLocaleDateString("zh-CN");
  Array.from(files || []).forEach((file) => {
    evidenceAssets.push({
      name: file.name,
      type: file.type || "未知类型",
      size: file.size,
      sizeLabel: sizeLabel(file.size),
      note,
      addedAt,
    });
  });
  renderAssets();
  generateAll();
  showToast("素材已加入清单");
}

function posterSvg() {
  const product = productData();
  const comparison = compareMetrics(product);
  const safe = (value) => escapeHtml(String(value));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#0f7f75"/>
      <stop offset="1" stop-color="#2e6f9e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1200" fill="url(#bg)"/>
  <rect x="610" y="650" width="250" height="330" rx="18" fill="rgba(255,255,255,0.16)" stroke="white" stroke-width="5"/>
  <rect x="660" y="700" width="150" height="18" rx="9" fill="white" opacity=".88"/>
  <text x="72" y="112" fill="white" font-size="34" font-family="Microsoft YaHei, Arial" font-weight="700">${safe(product.brand)} AIR PURIFIER</text>
  <text x="72" y="236" fill="white" font-size="62" font-family="Microsoft YaHei, Arial" font-weight="900">${safe(product.model)}</text>
  <text x="72" y="310" fill="white" font-size="40" font-family="Microsoft YaHei, Arial" font-weight="800">把空气变成看得懂的参数</text>
  <text x="72" y="392" fill="white" font-size="26" font-family="Microsoft YaHei, Arial">${safe(comparison.headline).slice(0, 34)}</text>
  <rect x="72" y="760" width="230" height="120" rx="16" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.5)"/>
  <text x="98" y="816" fill="white" font-size="42" font-family="Arial" font-weight="900">${safe(product.cadr || "待填")}</text>
  <text x="98" y="850" fill="white" font-size="22" font-family="Microsoft YaHei, Arial">CADR</text>
  <rect x="330" y="760" width="230" height="120" rx="16" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.5)"/>
  <text x="356" y="816" fill="white" font-size="42" font-family="Arial" font-weight="900">${safe(product.area || "待填")}㎡</text>
  <text x="356" y="850" fill="white" font-size="22" font-family="Microsoft YaHei, Arial">适用面积</text>
  <rect x="72" y="910" width="230" height="120" rx="16" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.5)"/>
  <text x="98" y="966" fill="white" font-size="42" font-family="Arial" font-weight="900">${safe(product.noise || "待填")}dB</text>
  <text x="98" y="1000" fill="white" font-size="22" font-family="Microsoft YaHei, Arial">低噪参考</text>
  <rect x="330" y="910" width="230" height="120" rx="16" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.5)"/>
  <text x="356" y="966" fill="white" font-size="42" font-family="Arial" font-weight="900">${safe(formatMoney(product.price))}</text>
  <text x="356" y="1000" fill="white" font-size="22" font-family="Microsoft YaHei, Arial">参考价格</text>
  <text x="72" y="1125" fill="white" font-size="22" font-family="Microsoft YaHei, Arial" opacity=".75">参数和竞品结论发布前请核对检测报告及来源日期</text>
</svg>`;
}

function downloadSvg() {
  syncCompetitors();
  downloadText("albers-poster.svg", posterSvg(), "image/svg+xml;charset=utf-8");
  showToast("已生成 SVG");
}

document.querySelector("#generateBtn").addEventListener("click", generateAll);
document.querySelector("#saveBtn").addEventListener("click", saveState);
document.querySelector("#exportBtn").addEventListener("click", exportAll);
document.querySelector("#exportCsvBtn").addEventListener("click", exportCsvBundle);
document.querySelector("#exportExcelBtn").addEventListener("click", exportExcelWorkbook);
document.querySelector("#printBtn").addEventListener("click", printReport);
document.querySelector("#checkAiBtn").addEventListener("click", checkAiStatus);
document.querySelector("#aiTextBtn").addEventListener("click", generateAiText);
document.querySelector("#aiImageBtn").addEventListener("click", generateAiImage);
document.querySelector("#downloadAiImageBtn").addEventListener("click", downloadAiImage);
document.querySelector("#downloadCompareSvgBtn").addEventListener("click", downloadPreciseCompareSvg);
document.querySelector("#exportProjectBtn").addEventListener("click", exportProject);
document.querySelector("#saveProjectLibraryBtn").addEventListener("click", saveCurrentProjectToLibrary);
document.querySelector("#loadProjectLibraryBtn").addEventListener("click", loadProjectFromLibrary);
document.querySelector("#duplicateProjectBtn").addEventListener("click", duplicateProjectFromLibrary);
document.querySelector("#deleteProjectBtn").addEventListener("click", deleteProjectFromLibrary);
document.querySelector("#applyCompanyProductBtn").addEventListener("click", applySelectedCompanyProduct);
document.querySelector("#importProjectBtn").addEventListener("click", () => {
  document.querySelector("#projectFileInput").click();
});
document.querySelector("#projectFileInput").addEventListener("change", (event) => {
  importProject(event.target.files[0]);
  event.target.value = "";
});
document.querySelector("#addAssetBtn").addEventListener("click", () => {
  document.querySelector("#assetFileInput").click();
});
document.querySelector("#assetFileInput").addEventListener("change", (event) => {
  addAssets(event.target.files);
  event.target.value = "";
});
document.querySelector("#addLeadBtn").addEventListener("click", addLeadRecord);
document.querySelector("#addCompetitorBtn").addEventListener("click", () => {
  syncCompetitors();
  competitors.push({
    name: "新竞品",
    cadr: 0,
    area: 0,
    noise: 0,
    price: 0,
    filterPrice: 0,
    filterLife: 12,
    powerWatts: 0,
    source: "",
    date: "",
  });
  renderCompetitors();
  generateAll();
});
document.querySelector("#downloadSvgBtn").addEventListener("click", downloadSvg);

competitorList.addEventListener("input", generateAll);
competitorList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  syncCompetitors();
  competitors.splice(Number(button.dataset.remove), 1);
  renderCompetitors();
  generateAll();
});

assetList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-asset]");
  if (!button) return;
  evidenceAssets.splice(Number(button.dataset.removeAsset), 1);
  renderAssets();
  generateAll();
});

companyGroupSelect.addEventListener("change", renderCompanyDatabase);
companyRoleSelect.addEventListener("change", renderCompanyDatabase);
companyProductSelect.addEventListener("change", () => {
  selectedCompanyProductId = companyProductSelect.value;
  renderCompanyDatabase();
});
outputs.companyTable.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  const card = event.target.closest("[data-company-product]");
  if (!card) return;
  selectedCompanyProductId = card.dataset.companyProduct;
  companyProductSelect.value = selectedCompanyProductId;
  renderCompanyDatabase();
});

Object.values(fields).forEach((field) => field.addEventListener("input", generateAll));
document.querySelectorAll('input[name="platform"], input[name="tone"]').forEach((field) => {
  field.addEventListener("change", generateAll);
});
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});
document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy));
});

loadState();
renderCompetitors();
renderAssets();
renderProjectLibrary();
renderLeads();
loadCompanyDatabase();
generateAll();
