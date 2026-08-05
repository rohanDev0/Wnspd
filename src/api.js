const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function getPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
  );

  const data = await res.json();

  return data.results;
}