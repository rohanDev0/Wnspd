import { useEffect, useState } from "react";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const TMDB_URL =
  "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie, onClick }) {
  return (
    <button className="movie-card" onClick={() => onClick(movie.id)}>
      {movie.poster_path ? (
        <img
          src={`${IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
          loading="lazy"
        />
      ) : (
        <div className="no-poster">No Poster</div>
      )}

      <div className="movie-title">{movie.title}</div>
    </button>
  );
}

function Home({ movies, loading, error, onMovieClick, search, setSearch, handleSearch, searchQuery, setSearchQuery }) {
  return (
    <main className="home">
      <header className="header">
        <div className="site-owner">By Rohan</div>
        <h1>WatchNowpd</h1>
        <p>Popular Movies</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </header>

      {loading && <div className="message">Loading movies...</div>}

      {error && <div className="message error">{error}</div>}

      {!loading && !error && (
        <section className="movie-grid">
          {movies.slice(0, 20).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieClick}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function Watch({ movieId, onBack }) {
  return (
    <main className="watch">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="player">
        <iframe
          title="Movie Player"
          src={`https://vidfast.vc/movie/${movieId}?theme=16A085&autoPlay=true`}
          allowFullScreen
          allow="encrypted-media"
        />
      </div>
    </main>
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movieId, setMovieId] = useState(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    async function getMovies() {
      try {
        if (!TMDB_TOKEN) {
          throw new Error("TMDB token is missing. Check your .env file.");
        }

        const response = await fetch(TMDB_URL, {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`TMDB request failed: ${response.status}`);
        }

        const data = await response.json();

        setMovies(data.results || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load movies.");
      } finally {
        setLoading(false);
      }
    }

    getMovies();
  }, []);

// 👇 PUT THE SEARCH FUNCTION HERE
async function handleSearch(e) {
  e.preventDefault();

  const query = searchQuery.trim();

  if (!query) return;

  setLoading(true);
  setError("");

  try {
    const params = new URLSearchParams({
      query: query,
      language: "en-US",
      page: "1",
      include_adult: "false",
    });

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          accept: "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("TMDB ERROR:", data);
      throw new Error(
        `TMDB request failed: ${response.status} ${
          data.status_message || ""
        }`
      );
    }

    setMovies((data.results || []).slice(0, 5));
  } catch (err) {
    console.error(err);
    setError(err.message || "Search failed.");
  } finally {
    setLoading(false);
  }
}

//end of search function
  if (movieId) {
    return (
      <Watch
        movieId={movieId}
        onBack={() => setMovieId(null)}
      />
    );
  }

  return (
    <Home
      movies={movies}
      loading={loading}
      error={error}
      onMovieClick={setMovieId}
      search={search}
      setSearch={setSearch}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
    />
  );
}