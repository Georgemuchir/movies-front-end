import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMovie, getProgress, getSimilar, getTmdbMovie } from "../api/client.js";
import Showcase from "../components/Showcase.jsx";
import TrailerModal from "../components/TrailerModal.jsx";
import { logoUrl, posterUrl } from "../theme.js";

function Providers({ providers, region }) {
  const groups = [
    ["Free (with ads)", providers.free || []],
    ["Subscription", providers.stream],
    ["Rent", providers.rent],
    ["Buy", providers.buy],
  ].filter(
    ([, list]) => list.length
  );
  if (!groups.length) return <p className="muted">Not available to stream, rent or buy in {region} right now.</p>;
  return (
    <div className="providers">
      {groups.map(([label, list]) => (
        <div key={label}>
          <h4 className="label">{label}</h4>
          <div className="providers__logos">
            {list.map((p) => (
              <a key={p.name} href={providers.link} target="_blank" rel="noreferrer" title={p.name}>
                <img src={logoUrl(p.logo_path)} alt={p.name} />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MovieDetail({ external = false }) {
  const { id, tmdbId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [resumeAt, setResumeAt] = useState(0);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setMovie(null);
    setSimilar([]);
    setResumeAt(0);
    setError(null);
    window.scrollTo(0, 0);
    const load = external ? getTmdbMovie(tmdbId) : getMovie(id);
    load
      .then((data) => (data.redirect_id ? navigate(`/movie/${data.redirect_id}`, { replace: true }) : setMovie(data)))
      .catch(() => setError("Movie not found."));
    if (!external) {
      getSimilar(id).then(setSimilar).catch(() => {});
      getProgress(id).then((p) => setResumeAt(p.position_sec)).catch(() => {});
    }
  }, [id, tmdbId, external, navigate]);

  if (error) return <p className="page-message">{error}</p>;
  if (!movie) return <p className="page-message">Loading…</p>;

  return (
    <>
      <Showcase
        movie={movie}
        strip={{ title: "More like this", movies: similar }}
        resumeAt={resumeAt}
        onTrailer={() => setShowTrailer(true)}
      />
      <div className="detail-sections">
        {movie.match_status === "unmatched" && (
          <p className="muted">
            No details found for this file. Fix the match on the <Link to="/admin">Library</Link> page.
          </p>
        )}
        {!movie.in_library && (
          <section>
            <h3 className="label">Where to watch</h3>
            {movie.providers.free?.length > 0 && movie.providers.link && (
              <a className="btn btn--primary watch-free" href={movie.providers.link} target="_blank" rel="noreferrer">
                Watch free on {movie.providers.free[0].name} ↗
              </a>
            )}
            <Providers providers={movie.providers} region={movie.region} />
            <p className="muted providers__note">Opens the movie's page with links to each app. Watching happens in that app.</p>
          </section>
        )}
        {movie.cast?.length > 0 && (
          <section>
            <h3 className="label">Cast</h3>
            <ul className="cast">
              {movie.cast.map((c) => (
                <li key={c.name}>
                  {c.profile_path ? (
                    <img src={posterUrl(c.profile_path, "w185")} alt="" loading="lazy" />
                  ) : (
                    <div className="cast__blank" />
                  )}
                  <b>{c.name}</b>
                  <small>{c.character}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {showTrailer && <TrailerModal trailerKey={movie.trailer_key} onClose={() => setShowTrailer(false)} />}
    </>
  );
}
