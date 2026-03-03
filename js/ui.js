import { state } from "./state.js";

export function els() {
  return {
    grid: document.getElementById("grid"),
    status: document.getElementById("status"),
    breedSelect: document.getElementById("breedSelect"),
    limitSelect: document.getElementById("limitSelect"),
    refreshBtn: document.getElementById("refreshBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    pageLabel: document.getElementById("pageLabel"),
    viewFavoritesBtn: document.getElementById("viewFavoritesBtn"),
  };
}

export function setStatus(message, type = "good") {
  const { status } = els();
  status.textContent = message;
  status.classList.remove("hidden", "good", "bad");
  status.classList.add(type);
  if (!message) status.classList.add("hidden");
}

export function clearGrid() {
  els().grid.innerHTML = "";
}

export function setPager() {
  const { prevBtn, pageLabel } = els();
  pageLabel.textContent = `Page ${state.page + 1} • ${state.mode === "favorites" ? "Favorites" : "Gallery"}`;
  prevBtn.disabled = state.page === 0;
}

export function populateBreeds(breeds) {
  const { breedSelect } = els();
  for (const b of breeds) {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    breedSelect.appendChild(opt);
  }
}

export function renderImages(images, handlers) {
  const { grid } = els();

  for (const img of images) {
    const breedName =
      img.breeds && img.breeds.length ? img.breeds[0].name : "Unknown breed";

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img src="${img.url}" alt="Cat image" loading="lazy" />
      <div class="card-body">
        <div class="row">
          <span class="badge">${escapeHtml(breedName)}</span>
          <span class="badge">id: ${escapeHtml(img.id)}</span>
        </div>
        <div class="actions">
          <button class="iconbtn good" data-action="fav" data-id="${img.id}">☆ Favorite</button>
          <button class="iconbtn" data-action="up" data-id="${img.id}">👍 Vote</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === "fav") handlers.onFavorite(id);
      if (action === "up") handlers.onVote(id, 1);
    });

    grid.appendChild(card);
  }
}

export function renderFavorites(favs, handlers) {
  const { grid } = els();

  for (const fav of favs) {
    const img = fav.image;
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img src="${img.url}" alt="Favorite cat image" loading="lazy" />
      <div class="card-body">
        <div class="row">
          <span class="badge">favorite_id: ${escapeHtml(String(fav.id))}</span>
          <span class="badge">image_id: ${escapeHtml(String(fav.image_id))}</span>
        </div>
        <div class="actions">
          <button class="iconbtn bad" data-action="unfav" data-id="${fav.id}">★ Remove</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      handlers.onUnfavorite(btn.dataset.id);
    });

    grid.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}