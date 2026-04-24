const searchInput = document.querySelector("#searchInput");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const modelCards = Array.from(document.querySelectorAll(".model-card"));
const visibleCount = document.querySelector("#visibleCount");
const plusButtons = Array.from(document.querySelectorAll(".plus-btn"));

let activeFilter = "all";

function updateCards() {
  const query = searchInput.value.trim().toLowerCase();
  let count = 0;

  modelCards.forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.type === activeFilter;
    const searchableText = `${card.dataset.name} ${card.textContent}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    const isVisible = matchesFilter && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) count += 1;
  });

  visibleCount.textContent = count.toString();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateCards();
  });
});

searchInput.addEventListener("input", updateCards);

plusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-added");
    button.textContent = button.classList.contains("is-added") ? "✓" : "+";
  });
});
