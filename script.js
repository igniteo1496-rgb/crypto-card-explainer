const cards = Array.isArray(window.CARD_DATA) ? window.CARD_DATA : [];

const searchInput = document.querySelector("#searchInput");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const networkFilter = document.querySelector("#networkFilter");
const kycFilter = document.querySelector("#kycFilter");
const custodyFilter = document.querySelector("#custodyFilter");
const statusFilter = document.querySelector("#statusFilter");
const sortSelect = document.querySelector("#sortSelect");
const modelGrid = document.querySelector("#modelGrid");
const visibleCount = document.querySelector("#visibleCount");
const heroCardCount = document.querySelector("#heroCardCount");
const selectedCount = document.querySelector("#selectedCount");
const selectedCountHero = document.querySelector("#selectedCountHero");
const activeFilterCount = document.querySelector("#activeFilterCount");
const clearCompare = document.querySelector("#clearCompare");
const comparePanel = document.querySelector("#comparePanel");
const detailModal = document.querySelector("#detailModal");
const modalContent = document.querySelector("#modalContent");
const languageButtons = Array.from(document.querySelectorAll("[data-language]"));

let activeFilter = "all";
let selectedIds = [];
let currentLanguage =
  localStorage.getItem("atlasLanguage") || (navigator.language && navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en");
currentLanguage = currentLanguage === "ko" ? "ko" : "en";
let openCardId = null;

const cardThemes = ["card-black", "card-blue", "card-yellow", "card-steel", "card-green", "card-purple"];
const translations = {
  en: {
    navExplore: "EXPLORE",
    pageTitle: "Atlas | Crypto Card Finder",
    navCompare: "COMPARE",
    sidebarProducts: "{count} card products",
    sidebarWorkflow: "Search, filter, compare",
    sidebarCompareLimit: "Up to 6 side by side",
    heroEyebrow: "Crypto card search and comparison",
    heroTitle: "Crypto Card Finder",
    heroSubtitle: "Search active crypto cards by issuer, region, network, rewards, custody, and verification status.",
    browseCards: "Browse cards",
    openCompare: "Open compare",
    liveCards: "Live cards",
    networks: "Networks",
    activeFilters: "Active filters",
    selectedToCompare: "Selected to compare",
    catalogTitle: "Explore crypto cards",
    catalogSubtitle: "Browse card products, then select only the cards you want to compare.",
    searchPlaceholder: "SEARCH MODEL...",
    filterAll: "ALL",
    filterCredit: "CREDIT",
    filterDebit: "DEBIT",
    filterPrepaid: "PREPAID",
    allNetworks: "All networks",
    allKyc: "All KYC",
    allCustody: "All custody",
    allStatus: "All status",
    statusActive: "Active only",
    statusVerify: "Needs check",
    statusInactive: "Inactive / legacy",
    sortFeatured: "Featured",
    sortCashback: "Highest cashback",
    sortName: "Name A-Z",
    showing: "SHOWING",
    models: "MODELS",
    compareTitle: "Compare selected cards",
    compareSubtitle: "Compare only the selected cards in a table.",
    cardsSelected: "cards selected",
    clearComparison: "Clear comparison",
    noMatchingCards: "No matching cards",
    reduceFilters: "Try removing a search term or type filter.",
    details: "Details",
    issuerSite: "Issuer site",
    field: "Field",
    selectCardsTitle: "Select cards to compare",
    selectCardsHint: "Press the + button on product cards to compare up to 6 cards.",
    maxCompareAlert: "You can compare up to 6 products.",
    removeFromCompare: "Remove from compare",
    addToCompare: "Add to compare",
    openOfficialSite: "Open official site",
    verificationSource: "Verification source",
    features: "Features",
    active: "Active",
    inactive: "Inactive",
    waitlist: "Waitlist",
    needsCheck: "Needs check",
    activeLabel: "Active",
    inactiveLabel: "Inactive or legacy",
    waitlistLabel: "Waitlist or limited rollout",
    verifyLabel: "Needs official verification",
    notSpecified: "Not specified",
    supported: "Supported",
    appleGooglePaySupported: "Apple/Google Pay supported",
    needsOfficialVerification: "Needs official verification",
    type: "Type",
    network: "Network",
    maxCashback: "Max cashback",
    annualFee: "Annual fee",
    fxFee: "FX fee",
    signupBonus: "Signup bonus",
    status: "Status",
    cryptoRole: "Crypto role",
    cardForm: "Card form",
    availabilityNote: "Availability note",
    custody: "Custody",
    kyc: "KYC",
    regions: "Regions",
    currencies: "Currencies",
    supportedAssets: "Supported assets",
    atmLimit: "ATM limit",
    mobilePay: "Mobile pay",
    staking: "Staking",
    keyPerks: "Key perks",
    availability: "Availability",
    assets: "Assets",
  },
  ko: {
    navExplore: "탐색",
    pageTitle: "Atlas | 크립토 카드 찾기",
    navCompare: "비교",
    sidebarProducts: "카드 상품 {count}개",
    sidebarWorkflow: "검색, 필터, 비교",
    sidebarCompareLimit: "최대 6개 동시 비교",
    heroEyebrow: "크립토 카드 검색과 비교",
    heroTitle: "크립토 카드 찾기",
    heroSubtitle: "발급사, 지역, 네트워크, 리워드, 수탁 방식, 검증 상태별로 실제 크립토 카드를 검색하세요.",
    browseCards: "카드 둘러보기",
    openCompare: "비교 열기",
    liveCards: "카드 수",
    networks: "네트워크",
    activeFilters: "적용된 필터",
    selectedToCompare: "비교 선택",
    catalogTitle: "크립토 카드 탐색",
    catalogSubtitle: "상품을 바로 살펴보고, 필요한 카드만 선택해 표로 비교합니다.",
    searchPlaceholder: "카드명, 발급사, 지역 검색...",
    filterAll: "전체",
    filterCredit: "신용",
    filterDebit: "체크/직불",
    filterPrepaid: "선불",
    allNetworks: "전체 네트워크",
    allKyc: "전체 KYC",
    allCustody: "전체 수탁 방식",
    allStatus: "전체 상태",
    statusActive: "활성 카드만",
    statusVerify: "검증 필요",
    statusInactive: "중단/레거시",
    sortFeatured: "추천순",
    sortCashback: "캐시백 높은순",
    sortName: "이름순",
    showing: "표시 중",
    models: "개 상품",
    compareTitle: "선택 카드 비교",
    compareSubtitle: "선택한 카드만 표 형태로 빠르게 비교합니다.",
    cardsSelected: "개 선택됨",
    clearComparison: "비교 비우기",
    noMatchingCards: "조건에 맞는 카드가 없습니다",
    reduceFilters: "검색어나 타입 필터를 줄여보세요.",
    details: "상세",
    issuerSite: "발급사 사이트",
    field: "항목",
    selectCardsTitle: "비교할 카드를 선택하세요",
    selectCardsHint: "상품 카드의 + 버튼으로 최대 6개까지 비교할 수 있습니다.",
    maxCompareAlert: "최대 6개 상품까지 비교할 수 있습니다.",
    removeFromCompare: "비교에서 제거",
    addToCompare: "비교에 추가",
    openOfficialSite: "공식 사이트 열기",
    verificationSource: "검증 출처",
    features: "주요 기능",
    active: "활성",
    inactive: "중단/레거시",
    waitlist: "대기/제한",
    needsCheck: "검증 필요",
    activeLabel: "현재 활성",
    inactiveLabel: "중단 또는 레거시",
    waitlistLabel: "대기자 명단 또는 제한 출시",
    verifyLabel: "공식 확인 필요",
    notSpecified: "명시 없음",
    supported: "지원",
    appleGooglePaySupported: "Apple/Google Pay 지원",
    needsOfficialVerification: "공식 확인 필요",
    type: "카드 타입",
    network: "네트워크",
    maxCashback: "최대 캐시백",
    annualFee: "연회비",
    fxFee: "해외 결제/환전 수수료",
    signupBonus: "가입 보너스",
    status: "상태",
    cryptoRole: "크립토 활용 방식",
    cardForm: "카드 형태",
    availabilityNote: "이용 가능 조건",
    custody: "수탁 방식",
    kyc: "본인 인증",
    regions: "지원 지역",
    currencies: "통화",
    supportedAssets: "지원 자산",
    atmLimit: "ATM 한도",
    mobilePay: "모바일 결제",
    staking: "스테이킹",
    keyPerks: "주요 혜택",
    availability: "이용 가능 여부",
    assets: "자산",
  },
};

const valueTranslations = {
  ko: {
    Credit: "신용",
    Debit: "체크/직불",
    Prepaid: "선불",
    Custodial: "수탁형",
    "Self-Custody": "셀프 커스터디",
    "Non-Custodial": "비수탁형",
    Hybrid: "혼합형",
    Required: "필수",
    None: "없음",
    Free: "무료",
    "Not specified": "명시 없음",
    "Needs check": "검증 필요",
    Active: "활성",
    Inactive: "중단/레거시",
    Waitlist: "대기/제한",
    "Spend crypto": "크립토로 결제",
    "Stablecoin spend": "스테이블코인 결제",
    "Crypto rewards only": "크립토 리워드 전용",
    "Crypto-funded prepaid card": "크립토 충전 선불카드",
    "Legacy/discontinued card": "중단된 레거시 카드",
    Virtual: "가상 카드",
    Legacy: "레거시",
    "Virtual + physical": "가상 + 실물 카드",
    "Physical + virtual": "실물 + 가상 카드",
    "Virtual + physical where available": "지역별 가상 + 실물 카드",
  },
};

function t(key, replacements = {}) {
  const template = translations[currentLanguage]?.[key] || translations.en[key] || key;
  return Object.entries(replacements).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function translateValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return valueTranslations[currentLanguage]?.[value] || value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCashback(value) {
  if (typeof value !== "number") return t("notSpecified");
  return value === 0 ? "0%" : currentLanguage === "ko" ? `최대 ${value}%` : `Up to ${value}%`;
}

function cardTheme(card) {
  return cardThemes[Math.abs(hashString(card.id)) % cardThemes.length];
}

function cardTypeMeta(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "credit") return { code: "CR", label: translateValue("Credit") };
  if (normalized === "debit") return { code: "DB", label: translateValue("Debit") };
  if (normalized === "prepaid") return { code: "PP", label: translateValue("Prepaid") };
  return { code: "??", label: type || "Unknown type" };
}

function cardStatusMeta(card) {
  const status = String(card.status || "verify").toLowerCase();
  if (status === "active") return { code: t("active"), label: t("activeLabel"), className: "status-active" };
  if (status === "inactive") return { code: t("inactive"), label: t("inactiveLabel"), className: "status-inactive" };
  if (status === "waitlist") return { code: t("waitlist"), label: t("waitlistLabel"), className: "status-waitlist" };
  return { code: t("needsCheck"), label: t("verifyLabel"), className: "status-verify" };
}

function hashString(value) {
  return String(value).split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function normalizeSearch(card) {
  return [
    card.name,
    card.issuer,
    card.type,
    card.network,
    card.cashbackMax,
    card.annualFee,
    card.fxFee,
    card.signupBonus,
    card.custody,
    card.regions,
    card.stakingRequired,
    card.atmLimit,
    card.supportedAssets,
    card.kyc,
    card.status,
    cardStatusMeta(card).code,
    card.availabilityNote,
    card.cardForm,
    translateValue(card.cardForm),
    card.cryptoRole,
    translateValue(card.cryptoRole),
    translateValue(card.type),
    translateValue(card.custody),
    translateValue(card.kyc),
    card.supportedCurrencies?.join(" "),
    card.perks?.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function populateSelect(select, values) {
  const options = values
    .filter(Boolean)
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("");
  select.insertAdjacentHTML("beforeend", options);
}

function setupFilters() {
  populateSelect(networkFilter, [...new Set(cards.map((card) => card.network))].sort());
  populateSelect(kycFilter, [...new Set(cards.map((card) => card.kyc))].sort());
  populateSelect(custodyFilter, [...new Set(cards.map((card) => card.custody))].sort());
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n, { count: cards.length.toString() });
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  languageButtons.forEach((button) => {
    const selected = button.dataset.language === currentLanguage;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function setLanguage(language) {
  currentLanguage = language === "ko" ? "ko" : "en";
  localStorage.setItem("atlasLanguage", currentLanguage);
  applyStaticTranslations();
  renderCards();
  renderCompare();
  if (openCardId) openDetail(openCardId);
}

function filteredCards() {
  const query = searchInput.value.trim().toLowerCase();
  const list = cards.filter((card) => {
    const matchesType = activeFilter === "all" || card.type === activeFilter;
    const matchesNetwork = !networkFilter.value || card.network === networkFilter.value;
    const matchesKyc = !kycFilter.value || card.kyc === kycFilter.value;
    const matchesCustody = !custodyFilter.value || card.custody === custodyFilter.value;
    const cardStatus = String(card.status || "verify").toLowerCase();
    const matchesStatus = !statusFilter.value || cardStatus === statusFilter.value;
    const matchesSearch = !query || normalizeSearch(card).includes(query);
    return matchesType && matchesNetwork && matchesKyc && matchesCustody && matchesStatus && matchesSearch;
  });

  return list.sort((a, b) => {
    if (sortSelect.value === "cashback") {
      return (typeof b.cashbackMax === "number" ? b.cashbackMax : -1) - (typeof a.cashbackMax === "number" ? a.cashbackMax : -1);
    }
    if (sortSelect.value === "name") return a.name.localeCompare(b.name);
    return a.rank - b.rank;
  });
}

function renderCards() {
  const list = filteredCards();
  visibleCount.textContent = list.length.toString();
  heroCardCount.textContent = cards.length.toString();
  activeFilterCount.textContent = countActiveFilters().toString();

  if (!list.length) {
    modelGrid.innerHTML = `
      <div class="empty-state">
        <h3>${escapeHtml(t("noMatchingCards"))}</h3>
        <p>${escapeHtml(t("reduceFilters"))}</p>
      </div>
    `;
    return;
  }

  modelGrid.innerHTML = list
    .map((card) => {
      const selected = selectedIds.includes(card.id);
      const perks = (card.perks || []).slice(0, 3);
      const typeMeta = cardTypeMeta(card.type);
      const statusMeta = cardStatusMeta(card);
      const typeClass = String(card.type || "").toLowerCase();
      return `
        <article class="model-card product-card ${cardTheme(card)}" data-card-id="${escapeHtml(card.id)}">
          <div class="card-top">
            <span class="type-badge type-${escapeHtml(typeClass)}" aria-label="${escapeHtml(typeMeta.label)} card type" title="${escapeHtml(typeMeta.label)}">
              ${escapeHtml(typeMeta.code)}
            </span>
            <button class="plus-btn ${selected ? "is-added" : ""}" type="button" data-select-card="${escapeHtml(card.id)}" aria-label="Toggle ${escapeHtml(card.name)} comparison">
              ${selected ? "✓" : "+"}
            </button>
          </div>
          <button class="bank-card" type="button" data-open-card="${escapeHtml(card.id)}">
            <span>${escapeHtml(card.issuer)}</span>
            <strong>${escapeHtml(formatCashback(card.cashbackMax))}</strong>
            <small>${escapeHtml(translateValue(card.type))} · ${escapeHtml(card.network)}</small>
          </button>
          <div class="model-copy">
            <div class="title-row">
              <h3>${escapeHtml(card.name)}</h3>
              <div class="title-badges">
                <span>${escapeHtml(translateValue(card.kyc))}</span>
                <span class="status-pill ${escapeHtml(statusMeta.className)}" title="${escapeHtml(statusMeta.label)}">${escapeHtml(statusMeta.code)}</span>
              </div>
            </div>
            <p>${escapeHtml(card.regions)} · ${escapeHtml(translateValue(card.custody))}${card.cryptoRole ? ` · ${escapeHtml(translateValue(card.cryptoRole))}` : ""}</p>
            <div class="meta-grid">
              <div><span>${escapeHtml(t("annualFee"))}</span><strong>${escapeHtml(translateValue(card.annualFee))}</strong></div>
              <div><span>${escapeHtml(t("fxFee"))}</span><strong>${escapeHtml(translateValue(card.fxFee))}</strong></div>
            </div>
            <ul class="tag-list">
              ${perks.map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}
            </ul>
            <div class="product-actions">
              <button class="secondary-btn" type="button" data-open-card="${escapeHtml(card.id)}">${escapeHtml(t("details"))}</button>
              <a class="primary-link" href="${escapeHtml(card.officialLink)}" target="_blank" rel="noreferrer">${escapeHtml(t("issuerSite"))}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function selectedCards() {
  return selectedIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean);
}

function renderCompare() {
  const selected = selectedCards();
  selectedCount.textContent = selected.length.toString();
  selectedCountHero.textContent = selected.length.toString();

  if (!selected.length) {
    comparePanel.innerHTML = `
      <div class="empty-state compare-empty">
        <h3>${escapeHtml(t("selectCardsTitle"))}</h3>
        <p>${escapeHtml(t("selectCardsHint"))}</p>
      </div>
    `;
    return;
  }

  const rows = [
    [t("type"), (card) => translateValue(card.type)],
    [t("network"), (card) => card.network],
    [t("maxCashback"), (card) => formatCashback(card.cashbackMax)],
    [t("annualFee"), (card) => translateValue(card.annualFee)],
    [t("fxFee"), (card) => translateValue(card.fxFee)],
    [t("signupBonus"), (card) => translateValue(card.signupBonus)],
    [t("status"), (card) => cardStatusMeta(card).code],
    [t("cryptoRole"), (card) => translateValue(card.cryptoRole || t("needsCheck"))],
    [t("cardForm"), (card) => translateValue(card.cardForm || t("needsCheck"))],
    [t("availabilityNote"), (card) => card.availabilityNote || t("needsOfficialVerification")],
    [t("custody"), (card) => translateValue(card.custody)],
    [t("kyc"), (card) => translateValue(card.kyc)],
    [t("regions"), (card) => card.regions],
    [t("currencies"), (card) => card.supportedCurrencies.join(", ")],
    [t("supportedAssets"), (card) => card.supportedAssets],
    [t("atmLimit"), (card) => card.atmLimit],
    [t("mobilePay"), (card) => (card.mobilePay ? t("appleGooglePaySupported") : t("notSpecified"))],
    [t("staking"), (card) => translateValue(card.stakingRequired)],
    [t("keyPerks"), (card) => (card.perks || []).slice(0, 4).join(" · ")],
  ];

  comparePanel.innerHTML = `
    <div class="compare-scroll">
      <table class="compare-table">
        <thead>
          <tr>
            <th>${escapeHtml(t("field"))}</th>
            ${selected
              .map(
                (card) => `
                  <th>
                    <button type="button" data-open-card="${escapeHtml(card.id)}">${escapeHtml(card.name)}</button>
                    <span>${escapeHtml(card.issuer)}</span>
                  </th>
                `,
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              ([label, getValue]) => `
                <tr>
                  <th>${escapeHtml(label)}</th>
                  ${selected.map((card) => `<td>${escapeHtml(getValue(card))}</td>`).join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function countActiveFilters() {
  return [
    activeFilter !== "all",
    Boolean(networkFilter.value),
    Boolean(kycFilter.value),
    Boolean(custodyFilter.value),
    Boolean(statusFilter.value),
    sortSelect.value !== "rank",
    Boolean(searchInput.value.trim()),
  ].filter(Boolean).length;
}

function toggleSelection(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
  } else {
    if (selectedIds.length >= 6) {
      window.alert(t("maxCompareAlert"));
      return;
    }
    selectedIds = [...selectedIds, id];
  }
  renderCards();
  renderCompare();
}

function openDetail(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) return;
  const statusMeta = cardStatusMeta(card);
  openCardId = id;

  modalContent.innerHTML = `
    <div class="modal-hero">
      <div class="bank-card ${cardTheme(card)}">
        <span>${escapeHtml(card.issuer)}</span>
        <strong>${escapeHtml(formatCashback(card.cashbackMax))}</strong>
        <small>${escapeHtml(translateValue(card.type))} · ${escapeHtml(card.network)}</small>
      </div>
      <div>
        <p class="eyebrow">${escapeHtml(card.issuer)}</p>
        <h2 id="modalTitle">${escapeHtml(card.name)}</h2>
        <p>${escapeHtml(card.regions)} · ${escapeHtml(translateValue(card.custody))} · ${escapeHtml(translateValue(card.kyc))} KYC</p>
        <div class="modal-badges">
          <span class="status-pill ${escapeHtml(statusMeta.className)}">${escapeHtml(statusMeta.code)}</span>
          ${card.cryptoRole ? `<span>${escapeHtml(translateValue(card.cryptoRole))}</span>` : ""}
          ${card.cardForm ? `<span>${escapeHtml(translateValue(card.cardForm))}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="detail-grid">
      ${detailItem(t("type"), translateValue(card.type))}
      ${detailItem(t("network"), card.network)}
      ${detailItem(t("status"), statusMeta.code)}
      ${detailItem(t("availability"), card.availabilityNote || t("needsOfficialVerification"))}
      ${detailItem(t("maxCashback"), formatCashback(card.cashbackMax))}
      ${detailItem(t("annualFee"), translateValue(card.annualFee))}
      ${detailItem(t("fxFee"), translateValue(card.fxFee))}
      ${detailItem(t("signupBonus"), translateValue(card.signupBonus))}
      ${detailItem(t("atmLimit"), card.atmLimit)}
      ${detailItem(t("mobilePay"), card.mobilePay ? t("supported") : t("notSpecified"))}
      ${detailItem(t("staking"), translateValue(card.stakingRequired))}
      ${detailItem(t("currencies"), card.supportedCurrencies.join(", "))}
      ${detailItem(t("assets"), card.supportedAssets)}
    </div>
    <div class="detail-perks">
      <h3>${escapeHtml(t("features"))}</h3>
      <ul>${(card.perks || []).map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}</ul>
    </div>
    <div class="modal-actions">
      <button class="filter-btn is-selected" type="button" data-select-card="${escapeHtml(card.id)}">
        ${escapeHtml(selectedIds.includes(card.id) ? t("removeFromCompare") : t("addToCompare"))}
      </button>
      <a class="primary-link" href="${escapeHtml(card.officialLink)}" target="_blank" rel="noreferrer">${escapeHtml(t("openOfficialSite"))}</a>
      ${card.evidenceUrl ? `<a class="secondary-btn" href="${escapeHtml(card.evidenceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("verificationSource"))}</a>` : ""}
    </div>
  `;

  detailModal.classList.add("is-open");
  detailModal.setAttribute("aria-hidden", "false");
}

function detailItem(label, value) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "N/A")}</strong>
    </div>
  `;
}

function closeDetail() {
  detailModal.classList.remove("is-open");
  detailModal.setAttribute("aria-hidden", "true");
  openCardId = null;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    renderCards();
  });
});

searchInput.addEventListener("input", renderCards);
[networkFilter, kycFilter, custodyFilter, statusFilter, sortSelect].forEach((select) => {
  select.addEventListener("change", renderCards);
});
clearCompare.addEventListener("click", () => {
  selectedIds = [];
  renderCards();
  renderCompare();
});
languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
  });
});

document.addEventListener("click", (event) => {
  const selectButton = event.target.closest("[data-select-card]");
  if (selectButton) {
    toggleSelection(selectButton.dataset.selectCard);
    return;
  }

  const openButton = event.target.closest("[data-open-card]");
  if (openButton) {
    openDetail(openButton.dataset.openCard);
    return;
  }

  if (event.target.closest("[data-close-modal]")) {
    closeDetail();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDetail();
});

setupFilters();
selectedIds = cards.slice(0, 3).map((card) => card.id);
applyStaticTranslations();
renderCards();
renderCompare();
