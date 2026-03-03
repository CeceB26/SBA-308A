const BASE = "https://api.thecatapi.com/v1";

// Put your API key here (TheCatAPI requires it for favorites/votes in many cases)
const API_KEY = ""; // <-- paste your key

function headers() {
  const h = { "Content-Type": "application/json" };
  if (API_KEY) h["x-api-key"] = API_KEY;
  return h;
}

export async function getBreeds() {
  const res = await fetch(`${BASE}/breeds`);
  if (!res.ok) throw new Error(`Breeds request failed: ${res.status}`);
  return res.json();
}

// GET images with pagination + optional breed filter
export async function getImages({ page, limit, breedId }) {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    order: "DESC",
    has_breeds: "1",
  });

  if (breedId) params.set("breed_ids", breedId);

  const res = await fetch(`${BASE}/images/search?${params.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Images request failed: ${res.status}`);
  return res.json();
}

// Favorites require POST/DELETE (user manipulation)
export async function addFavorite(imageId) {
  const res = await fetch(`${BASE}/favourites`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ image_id: imageId }),
  });
  if (!res.ok) throw new Error(`Add favorite failed: ${res.status}`);
  return res.json();
}

export async function getFavorites({ page, limit }) {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    order: "DESC",
  });

  const res = await fetch(`${BASE}/favourites?${params.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Favorites request failed: ${res.status}`);
  return res.json();
}

export async function deleteFavorite(favId) {
  const res = await fetch(`${BASE}/favourites/${favId}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Delete favorite failed: ${res.status}`);
  return res.json();
}

// Optional: Votes (also a POST manipulation)
export async function vote(imageId, value /* 1 or 0 */) {
  const res = await fetch(`${BASE}/votes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ image_id: imageId, value }),
  });
  if (!res.ok) throw new Error(`Vote failed: ${res.status}`);
  return res.json();
}