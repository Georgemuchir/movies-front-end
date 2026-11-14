import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "../api/client.js";
import PosterCard from "../components/PosterCard.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    // Wait for a short pause in typing, and cancel stale requests.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchMovies(q, controller.signal).then(setResults).catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  if (q.trim().length < 2) return <p className="page-message">Type at least two letters to search.</p>;
  if (!results) return <p className="page-message">Searching…</p>;

  return (
    <div className="page-top search-page">
      <h2 className="label">In your library</h2>
      {results.library.length ? (
        <div className="poster-grid">{results.library.map((m) => <PosterCard key={m.id} movie={m} />)}</div>
      ) : (
        <p className="muted">No movies in your library match “{q}”.</p>
      )}
      {results.more.length > 0 && (
        <>
          <h2 className="label">More movies</h2>
          <p className="muted">Not in your library. Open one to see where it's streaming or for rent.</p>
          <div className="poster-grid">{results.more.map((m) => <PosterCard key={m.tmdb_id} movie={m} />)}</div>
        </>
      )}
    </div>
  );
}
