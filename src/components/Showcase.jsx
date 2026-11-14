import { Link } from "react-router-dom";
import { backdropUrl, formatRuntime } from "../theme.js";
import { FilmIcon, PlayIcon } from "./Icons.jsx";
import PosterRow from "./PosterRow.jsx";

const clock = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};

// Full-screen movie feature: backdrop, play ring, title block and a poster strip.
export default function Showcase({ movie, strip, onTrailer, showMoreInfo = false, resumeAt = 0 }) {
  const rating = movie.imdb_rating ?? movie.tmdb_rating;
  const stars = movie.cast?.slice(0, 3).map((c) => c.name).join(", ");
  const runtime = formatRuntime(movie.runtime);

  return (
    <section className="showcase">
      <div className="showcase__backdrop" style={{ backgroundImage: `url(${backdropUrl(movie.backdrop_path, "original")})` }} />
      <div className="showcase__shade" />

      {movie.in_library && (
        <Link to={`/watch/${movie.id}`} className="play-ring" aria-label={`Play ${movie.title}`}>
          {resumeAt > 0 ? (
            <span className="label play-ring__runtime play-ring__runtime--resume">Resume {clock(resumeAt)}</span>
          ) : (
            runtime && <span className="label play-ring__runtime">{runtime}</span>
          )}
          <span className="play-ring__circle"><PlayIcon /></span>
        </Link>
      )}

      <div className="showcase__content">
        <div className="showcase__info">
          {rating ? (
            <p className="label rating">
              Rating <b>{rating.toFixed(1)}</b> / 10
              {movie.imdb_rating != null && <span className="rating__source">IMDb</span>}
            </p>
          ) : null}
          {movie.genres?.length > 0 && <p className="label genres">{movie.genres.join("  |  ")}</p>}
          <h1 className="showcase__title">{movie.title}</h1>
          <p className="credits">
            {movie.year && <span>{movie.year}</span>}
            {movie.year && movie.director && <i>|</i>}
            {movie.director && <span><b>Director:</b> {movie.director}</span>}
          </p>
          {stars && <p className="credits"><span><b>Stars:</b> {stars}</span></p>}
          {movie.overview && <p className="showcase__overview">{movie.overview}</p>}
          <div className="showcase__links">
            {showMoreInfo && <Link to={`/movie/${movie.id}`} className="text-link">More info</Link>}
            {movie.trailer_key && onTrailer && (
              <button className="text-link text-link--gold" onClick={onTrailer}><FilmIcon /> Watch trailer</button>
            )}
          </div>
        </div>

        {strip?.movies.length > 0 && (
          <PosterRow title={strip.title} movies={strip.movies} small className="showcase__strip" />
        )}
      </div>
    </section>
  );
}
