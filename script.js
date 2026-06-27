const cards = Array.isArray(window.CARD_DATA) ? window.CARD_DATA : [];

const searchInput = document.querySelector("#searchInput");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const networkFilter = document.querySelector("#networkFilter");
const kycFilter = document.querySelector("#kycFilter");
const custodyFilter = document.querySelector("#custodyFilter");
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

let activeFilter = "all";
let selectedIds = [];

const cardThemes = ["card-black", "card-blue", "card-yellow", "card-steel", "card-green", "card-purple"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCashback(value) {
  if (typeof value !== "number") return "N/A";
  return value === 0 ? "0%" : `Up to ${value}%`;
}

function cardTheme(card) {
  return cardThemes[Math.abs(hashString(card.id)) % cardThemes.length];
}

function cardTypeMeta(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "credit") return { code: "CR", label: "Credit" };
  if (normalized === "debit") return { code: "DB", label: "Debit" };
  if (normalized === "prepaid") return { code: "PP", label: "Prepaid" };
  return { code: "??", label: type || "Unknown type" };
}

function cardStatusMeta(card) {
  const status = String(card.status || "verify").toLowerCase();
  if (status === "active") return { code: "Active", label: "Active", className: "status-active" };
  if (status === "inactive") return { code: "Inactive", label: "Inactive or legacy", className: "status-inactive" };
  if (status === "waitlist") return { code: "Waitlist", label: "Waitlist or limited rollout", className: "status-waitlist" };
  return { code: "Needs check", label: "Needs official verification", className: "status-verify" };
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
    card.availabilityNote,
    card.cardForm,
    card.cryptoRole,
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

function filteredCards() {
  const query = searchInput.value.trim().toLowerCase();
  const list = cards.filter((card) => {
    const matchesType = activeFilter === "all" || card.type === activeFilter;
    const matchesNetwork = !networkFilter.value || card.network === networkFilter.value;
    const matchesKyc = !kycFilter.value || card.kyc === kycFilter.value;
    const matchesCustody = !custodyFilter.value || card.custody === custodyFilter.value;
    const matchesSearch = !query || normalizeSearch(card).includes(query);
    return matchesType && matchesNetwork && matchesKyc && matchesCustody && matchesSearch;
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
        <h3>No matching cards</h3>
        <p>검색어 또는 타입 필터를 줄여보세요.</p>
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
      return `
        <article class="model-card product-card ${cardTheme(card)}" data-card-id="${escapeHtml(card.id)}">
          <div class="card-top">
            <span class="type-badge type-${escapeHtml(typeMeta.label.toLowerCase())}" aria-label="${escapeHtml(typeMeta.label)} card type" title="${escapeHtml(typeMeta.label)}">
              ${escapeHtml(typeMeta.code)}
            </span>
            <button class="plus-btn ${selected ? "is-added" : ""}" type="button" data-select-card="${escapeHtml(card.id)}" aria-label="Toggle ${escapeHtml(card.name)} comparison">
              ${selected ? "✓" : "+"}
            </button>
          </div>
          <button class="bank-card" type="button" data-open-card="${escapeHtml(card.id)}">
            <span>${escapeHtml(card.issuer)}</span>
            <strong>${escapeHtml(formatCashback(card.cashbackMax))}</strong>
            <small>${escapeHtml(card.type)} · ${escapeHtml(card.network)}</small>
          </button>
          <div class="model-copy">
            <div class="title-row">
              <h3>${escapeHtml(card.name)}</h3>
              <div class="title-badges">
                <span>${escapeHtml(card.kyc)}</span>
                <span class="status-pill ${escapeHtml(statusMeta.className)}" title="${escapeHtml(statusMeta.label)}">${escapeHtml(statusMeta.code)}</span>
              </div>
            </div>
            <p>${escapeHtml(card.regions)} · ${escapeHtml(card.custody)}${card.cryptoRole ? ` · ${escapeHtml(card.cryptoRole)}` : ""}</p>
            <div class="meta-grid">
              <div><span>Annual fee</span><strong>${escapeHtml(card.annualFee)}</strong></div>
              <div><span>FX fee</span><strong>${escapeHtml(card.fxFee)}</strong></div>
            </div>
            <ul class="tag-list">
              ${perks.map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}
            </ul>
            <div class="product-actions">
              <button class="secondary-btn" type="button" data-open-card="${escapeHtml(card.id)}">Details</button>
              <a class="primary-link" href="${escapeHtml(card.officialLink)}" target="_blank" rel="noreferrer">Issuer site</a>
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
        <h3>Select cards to compare</h3>
        <p>상품 카드의 + 버튼을 눌러 최대 6개까지 비교할 수 있습니다.</p>
      </div>
    `;
    return;
  }

  const rows = [
    ["Type", (card) => card.type],
    ["Network", (card) => card.network],
    ["Max cashback", (card) => formatCashback(card.cashbackMax)],
    ["Annual fee", (card) => card.annualFee],
    ["FX fee", (card) => card.fxFee],
    ["Signup bonus", (card) => card.signupBonus],
    ["Status", (card) => cardStatusMeta(card).code],
    ["Crypto role", (card) => card.cryptoRole || "Needs check"],
    ["Card form", (card) => card.cardForm || "Needs check"],
    ["Availability note", (card) => card.availabilityNote || "Needs official verification"],
    ["Custody", (card) => card.custody],
    ["KYC", (card) => card.kyc],
    ["Regions", (card) => card.regions],
    ["Currencies", (card) => card.supportedCurrencies.join(", ")],
    ["Supported assets", (card) => card.supportedAssets],
    ["ATM limit", (card) => card.atmLimit],
    ["Mobile pay", (card) => (card.mobilePay ? "Apple/Google Pay supported" : "Not specified")],
    ["Staking", (card) => card.stakingRequired],
    ["Key perks", (card) => (card.perks || []).slice(0, 4).join(" · ")],
  ];

  comparePanel.innerHTML = `
    <div class="compare-scroll">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Field</th>
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
    sortSelect.value !== "rank",
    Boolean(searchInput.value.trim()),
  ].filter(Boolean).length;
}

function toggleSelection(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
  } else {
    if (selectedIds.length >= 6) {
      window.alert("최대 6개 상품까지 비교할 수 있습니다.");
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

  modalContent.innerHTML = `
    <div class="modal-hero">
      <div class="bank-card ${cardTheme(card)}">
        <span>${escapeHtml(card.issuer)}</span>
        <strong>${escapeHtml(formatCashback(card.cashbackMax))}</strong>
        <small>${escapeHtml(card.type)} · ${escapeHtml(card.network)}</small>
      </div>
      <div>
        <p class="eyebrow">${escapeHtml(card.issuer)}</p>
        <h2 id="modalTitle">${escapeHtml(card.name)}</h2>
        <p>${escapeHtml(card.regions)} · ${escapeHtml(card.custody)} · ${escapeHtml(card.kyc)} KYC</p>
        <div class="modal-badges">
          <span class="status-pill ${escapeHtml(statusMeta.className)}">${escapeHtml(statusMeta.code)}</span>
          ${card.cryptoRole ? `<span>${escapeHtml(card.cryptoRole)}</span>` : ""}
          ${card.cardForm ? `<span>${escapeHtml(card.cardForm)}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="detail-grid">
      ${detailItem("Type", card.type)}
      ${detailItem("Network", card.network)}
      ${detailItem("Status", statusMeta.code)}
      ${detailItem("Availability", card.availabilityNote || "Needs official verification")}
      ${detailItem("Max cashback", formatCashback(card.cashbackMax))}
      ${detailItem("Annual fee", card.annualFee)}
      ${detailItem("FX fee", card.fxFee)}
      ${detailItem("Signup bonus", card.signupBonus)}
      ${detailItem("ATM limit", card.atmLimit)}
      ${detailItem("Mobile pay", card.mobilePay ? "Supported" : "Not specified")}
      ${detailItem("Staking", card.stakingRequired)}
      ${detailItem("Currencies", card.supportedCurrencies.join(", "))}
      ${detailItem("Assets", card.supportedAssets)}
    </div>
    <div class="detail-perks">
      <h3>Features</h3>
      <ul>${(card.perks || []).map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}</ul>
    </div>
    <div class="modal-actions">
      <button class="filter-btn is-selected" type="button" data-select-card="${escapeHtml(card.id)}">
        ${selectedIds.includes(card.id) ? "Remove from compare" : "Add to compare"}
      </button>
      <a class="primary-link" href="${escapeHtml(card.officialLink)}" target="_blank" rel="noreferrer">Open official site</a>
      ${card.evidenceUrl ? `<a class="secondary-btn" href="${escapeHtml(card.evidenceUrl)}" target="_blank" rel="noreferrer">Verification source</a>` : ""}
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
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    renderCards();
  });
});

searchInput.addEventListener("input", renderCards);
[networkFilter, kycFilter, custodyFilter, sortSelect].forEach((select) => {
  select.addEventListener("change", renderCards);
});
clearCompare.addEventListener("click", () => {
  selectedIds = [];
  renderCards();
  renderCompare();
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
renderCards();
renderCompare();
