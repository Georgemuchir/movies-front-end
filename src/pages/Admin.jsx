import { useEffect, useState } from "react";
import { fixMatch, getUnmatched, refreshRatings, scanLibrary, searchMovies } from "../api/client.js";
import { posterUrl } from "../theme.js";

function FixMatch({ movie, onFixed }) {
  const [query, setQuery] = useState(movie.title);
  const [options, setOptions] = useState([]);
  const [busy, setBusy] = useState(false);

  const find = async (e) => {
    e.preventDefault();
    const data = await searchMovies(query);
    setOptions(data.more.slice(0, 6));
  };

  const pick = async (tmdbId) => {
    setBusy(true);
    await fixMatch(movie.id, tmdbId);
    onFixed();
  };

  return (
    <li className="unmatched">
      <div className="unmatched__file">{movie.title}{movie.year ? ` (${movie.year})` : ""}</div>
      <form onSubmit={find} className="unmatched__form">
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Movie title" />
        <button className="btn btn--glass" type="submit">Find</button>
      </form>
      <div className="unmatched__options">
        {options.map((o) => (
          <button key={o.tmdb_id} disabled={busy} onClick={() => pick(o.tmdb_id)} className="unmatched__option">
            {o.poster_path ? <img src={posterUrl(o.poster_path, "w92")} alt="" /> : <div className="cast__blank" />}
            <span>{o.title} {o.year ? `(${o.year})` : ""}</span>
          </button>
        ))}
      </div>
    </li>
  );
}

export default function Admin() {
  const [unmatched, setUnmatched] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => getUnmatched().then(setUnmatched).catch(() => setStatus("Couldn't reach the server."));
  useEffect(() => { load(); }, []);

  const run = async (label, fn, describe) => {
    setBusy(true);
    setStatus(`${label}…`);
    try {
      setStatus(describe(await fn()));
      load();
    } catch {
      setStatus(`${label} failed. Check the Flask logs.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-top admin">
      <h1>Library</h1>
      <div className="actions">
        <button className="btn btn--primary" disabled={busy} onClick={() =>
          run("Scanning", scanLibrary, (r) =>
            `Scan done: ${r.added} added, ${r.removed} removed, ${r.unmatched} unmatched, ${r.total} files. ${r.ratings.updated} IMDb ratings updated.`)
        }>Scan media folder</button>
        <button className="btn btn--glass" disabled={busy} onClick={() =>
          run("Refreshing ratings", refreshRatings, (r) => `${r.updated} IMDb ratings updated.`)
        }>Refresh IMDb ratings</button>
      </div>
      {status && <p className="muted">{status}</p>}

      <h2 className="label">Unmatched files</h2>
      {unmatched.length ? (
        <ul className="unmatched-list">
          {unmatched.map((m) => <FixMatch key={m.id} movie={m} onFixed={load} />)}
        </ul>
      ) : (
        <p className="muted">Every file is matched.</p>
      )}
    </div>
  );
}
