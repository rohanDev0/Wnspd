const IMG_BASE = "https://image.tmdb.org/t/p/w342";
const TMDB_BASE = "https://api.themoviedb.org/3";
const KEY_STORAGE = "reel_tmdb_key";

// Preferred: env var set at build/deploy time (VITE_TMDB_API_KEY).
// Fallback: localStorage, so this still works during local dev without a .env file.
const ENV_KEY = import.meta.env.VITE_TMDB_API_KEY || "";

const els = {
  search: document.getElementById("search"),
  searchResults: document.getElementById("search-results"),
  popularTitle: document.getElementById("popular-title"),
  popularGrid: document.getElementById("popular-grid"),
  keyBtn: document.getElementById("key-btn"),
  keyModal: document.getElementById("key-modal"),
  keyInput: document.getElementById("key-input"),
  keySave: document.getElementById("key-save"),
  playerOverlay: document.getElementById("player-overlay"),
  playerFrameWrap: document.getElementById("player-frame-wrap"),
  playerTitle: document.getElementById("player-title"),
  closePlayer: document.getElementById("close-player"),
};

function getKey() {
  return ENV_KEY || localStorage.getItem(KEY_STORAGE) || "";
}
function setKey(k) {
  localStorage.setItem(KEY_STORAGE, k);
}
function openKeyModal() {
  els.keyInput.value = localStorage.getItem(KEY_STORAGE) || "";
  els.keyModal.classList.add("open");
}
function closeKeyModal() {
  els.keyModal.classList.remove("open");
}

// Only show the manual-key button/flow at all if no env var is set.
if (!ENV_KEY) {
  els.keyBtn.hidden = false;
  els.keyBtn.addEventListener("click", openKeyModal);
  els.keySave.addEventListener("click", () => {
    setKey(els.keyInput.value.trim());
    closeKeyModal();
    loadPopular();
  });
}

async function tmdbFetch(path, params) {
  const key = getKey();
  if (!key) {
    if (!ENV_KEY) openKeyModal();
    throw new Error("No TMDB key set");
  }
  const usp = new URLSearchParams(params || {});
  // v4 read access tokens are long JWTs; v3 API keys are short hex strings.
  if (key.length > 100) {
    const url = `${TMDB_BASE}${path}?${usp.toString()}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    return res.json();
  } else {
    usp.set("api_key", key);
    const url = `${TMDB_BASE}${path}?${usp.toString()}`;
    const res = await fetch(url);
    return res.json();
  }
}

function posterUrl(path) {
  return path ? IMG_BASE + path : "";
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function renderGrid(container, movies) {
  container.innerHTML = "";
  if (!movies || !movies.length) {
    container.innerHTML = '<div class="empty-state">No results.</div>';
    return;
  }
  movies.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card";
    const year = m.release_date ? m.release_date.slice(0, 4) : "—";
    card.innerHTML = `
      <img src="${posterUrl(m.poster_path)}" alt="${escapeHtml(m.title)}" loading="lazy" />
      <div class="meta">
        <div class="title">${escapeHtml(m.title)}</div>
        <div class="year">${year}</div>
      </div>
    `;
    card.addEventListener("click", () => openPlayer(m));
    container.appendChild(card);
  });
}

function openPlayer(movie) {
  els.playerTitle.textContent = `${movie.title}${movie.release_date ? " (" + movie.release_date.slice(0, 4) + ")" : ""}`;
  const src = `https://vidsync.live/embed/movie/${movie.id}?autoPlay=true`;
  els.playerFrameWrap.innerHTML = `<iframe src="${src}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
  els.playerOverlay.classList.add("open");
}
function closePlayer() {
  els.playerOverlay.classList.remove("open");
  els.playerFrameWrap.innerHTML = "";
}
els.closePlayer.addEventListener("click", closePlayer);

async function loadPopular() {
  try {
    const data = await tmdbFetch("/movie/popular", { language: "en-US", page: 1 });
    renderGrid(els.popularGrid, data.results);
  } catch (e) {
    if (getKey()) console.error(e);
  }
}

let searchTimeout;
els.search.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const q = els.search.value.trim();
  if (!q) {
    els.searchResults.innerHTML = "";
    els.popularTitle.style.display = "";
    els.popularGrid.style.display = "";
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const data = await tmdbFetch("/search/movie", { query: q, language: "en-US", page: 1 });
      els.popularTitle.style.display = "none";
      els.popularGrid.style.display = "none";
      els.searchResults.innerHTML =
        '<div class="section-title">Results for "' + escapeHtml(q) + '"</div><div class="grid" id="live-search-grid"></div>';
      renderGrid(document.getElementById("live-search-grid"), data.results);
    } catch (e) {
      if (getKey()) console.error(e);
    }
  }, 350);
});

// Init
if (!getKey()) {
  openKeyModal();
} else {
  loadPopular();
}
