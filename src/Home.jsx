import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPopularMovies } from "./api";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPopularMovies().then(setMovies);
  }, []);

  return (
    <div className="container">

      <h1>Popular Movies</h1>

      <div className="grid">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="card"
            onClick={() => navigate(`/watch/${movie.id}`)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />

            <h3>{movie.title}</h3>

          </div>
        ))}
      </div>

    </div>
  );
}