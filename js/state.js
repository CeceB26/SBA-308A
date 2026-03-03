export const state = {
  page: 0,
  limit: 12,
  breedId: "",
  mode: "gallery", // "gallery" | "favorites"
  // event-loop/race condition protection:
  requestId: 0,
};

export function nextRequestId() {
  state.requestId += 1;
  return state.requestId;
}