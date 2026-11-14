import { Link } from "react-router-dom";
import { posterUrl } from "../theme.js";

export default function PosterCard({ movie, small = false }) {
  const to = movie.in_library ? `/movie/${movie.id}` : `/title/${movie.tmdb_id}`;
  const src = posterUrl(movie.poster_path, small ? "w185" : "w342");

  return (
    <Link to={to} className={`poster-card ${small ? "poster-card--small" : ""}`} title={movie.title}>
      <div className="poster-card__image">
        {src ? (
          <img src={src} alt="" loading="lazy" />
        ) : (
          <div className="poster-fallback">{movie.title}</div>
        )}
        {!movie.in_library && <span className="badge-external">Not in library</span>}
        {movie.progress > 0 && (
          <div className="poster-progress"><div style={{ width: `${movie.progress * 100}%` }} /></div>
        )}
      </div>
      <span className="poster-card__title">{movie.title}</span>
      {!small && movie.year && <span className="poster-card__year">{movie.year}</span>}
    </Link>
  );
}
