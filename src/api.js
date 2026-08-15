const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_TOKEN}`,
  "Content-Type": "application/json",
};

export async function getPopularMovies() {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
    { headers }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  return response.json();
}

export async function searchMovies(query) {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(
      query
    )}&language=en-US&page=1&include_adult=false`,
    { headers }
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  return response.json();
}