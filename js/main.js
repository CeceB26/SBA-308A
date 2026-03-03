import { state, nextRequestId } from "./state.js";
import {
  getBreeds,
  getImages,
  addFavorite,
  getFavorites,
  deleteFavorite,
  vote,
} from "./api.js";
import {
  els,
  setStatus,
  clearGrid,
  setPager,
  populateBreeds,
  renderImages,
  renderFavorites,
} from "./ui.js";

async function loadBreeds() {
  try {
    const breeds = await getBreeds();
    populateBreeds(breeds);
  } catch (e) {
    setStatus(`Could not load breeds: ${e.message}`, "bad");
  }
}

async function loadGallery() {
  // event loop / out-of-order protection:
  const reqId = nextRequestId();

  setPager();
  setStatus("Loading cats…", "good");
  clearGrid();

  try {
    const data = await getImages({
      page: state.page,
      limit: state.limit,
      breedId: state.breedId,
    });

    // If another request started after this one, ignore stale results.
    if (reqId !== state.requestId) return;

    if (!data.length) {
      setStatus("No results. Try another breed or refresh.", "bad");
      return;
    }

    renderImages(data, {
      onFavorite: onFavorite,
      onVote: onVote,
    });
    setStatus("", "good");
  } catch (e) {
    if (reqId !== state.requestId) return;
    setStatus(`Gallery failed: ${e.message}`, "bad");
  }
}

async function loadFavorites() {
  const reqId = nextRequestId();

  setPager();
  setStatus("Loading favorites…", "good");
  clearGrid();

  try {
    const favs = await getFavorites({ page: state.page, limit: state.limit });

    if (reqId !== state.requestId) return;

    if (!favs.length) {
      setStatus("No favorites yet. Add some from the gallery!", "bad");
      return;
    }

    renderFavorites(favs, {
      onUnfavorite: onUnfavorite,
    });
    setStatus("", "good");
  } catch (e) {
    if (reqId !== state.requestId) return;
    setStatus(`Favorites failed: ${e.message}`, "bad");
  }
}

async function refresh() {
  if (state.mode === "favorites") await loadFavorites();
  else await loadGallery();
}

// POST (user manipulation)
async function onFavorite(imageId) {
  try {
    setStatus("Saving favorite…", "good");
    await addFavorite(imageId);
    setStatus("Saved to favorites!", "good");
  } catch (e) {
    setStatus(`Favorite failed: ${e.message}`, "bad");
  }
}

// DELETE (user manipulation)
async function onUnfavorite(favId) {
  try {
    setStatus("Removing favorite…", "good");
    await deleteFavorite(favId);
    setStatus("Removed!", "good");
    await refresh();
  } catch (e) {
    setStatus(`Remove failed: ${e.message}`, "bad");
  }
}

// POST vote (user manipulation)
async function onVote(imageId, value) {
  try {
    setStatus("Submitting vote…", "good");
    await vote(imageId, value);
    setStatus("Vote submitted!", "good");
  } catch (e) {
    setStatus(`Vote failed: ${e.message}`, "bad");
  }
}

function wireUI() {
  const {
    breedSelect,
    limitSelect,
    refreshBtn,
    prevBtn,
    nextBtn,
    viewFavoritesBtn,
  } = els();

  breedSelect.addEventListener("change", async () => {
    state.breedId = breedSelect.value;
    state.page = 0;
    state.mode = "gallery";
    viewFavoritesBtn.textContent = "View Favorites";
    await refresh();
  });

  limitSelect.addEventListener("change", async () => {
    state.limit = Number(limitSelect.value);
    state.page = 0;
    await refresh();
  });

  refreshBtn.addEventListener("click", async () => {
    await refresh();
  });

  prevBtn.addEventListener("click", async () => {
    if (state.page === 0) return;
    state.page -= 1;
    await refresh();
  });

  nextBtn.addEventListener("click", async () => {
    state.page += 1;
    await refresh();
  });

  viewFavoritesBtn.addEventListener("click", async () => {
    state.page = 0;
    if (state.mode === "gallery") {
      state.mode = "favorites";
      viewFavoritesBtn.textContent = "Back to Gallery";
      await refresh();
    } else {
      state.mode = "gallery";
      viewFavoritesBtn.textContent = "View Favorites";
      await refresh();
    }
  });
}

(async function init() {
  wireUI();
  await loadBreeds();
  await loadGallery();
})();