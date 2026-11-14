import { useEffect, useState } from "react";
import { addFromArchive, errorMessage, fixMatch, getUnmatched, refreshRatings, scanLibrary, searchMovies } from "../api/client.js";
import Accounts from "../components/Accounts.jsx";
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

function AddFromArchive() {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { status, title } = await addFromArchive(link);
      setMessage(status === "added" ? `Added ${title}. It's on the home page now.` : `${title} is already in the library.`);
      setLink("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't add that film"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <h3 className="panel__title">Add from Internet Archive</h3>
      <p className="muted panel__text">
        Paste a film's link from <a href="https://archive.org/details/feature_films" target="_blank" rel="noreferrer">archive.org</a>.
        It plays straight from there, with nothing to upload. Only add films that are public domain.
      </p>
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="https://archive.org/details/…" value={link} onChange={(e) => setLink(e.target.value)} required aria-label="archive.org link" />
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Adding…" : "Add film"}</button>
      </form>
      {message && <p className="muted">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
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
      <h1>Library &amp; accounts</h1>
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
      <AddFromArchive />

      <Accounts />

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
