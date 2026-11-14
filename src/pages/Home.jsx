import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFreeElsewhere, getRows } from "../api/client.js";
import PosterRow from "../components/PosterRow.jsx";
import Showcase from "../components/Showcase.jsx";
import TrailerModal from "../components/TrailerModal.jsx";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [free, setFree] = useState([]);

  useEffect(() => {
    getRows().then(setData).catch(() => setError("Couldn't reach the server. Is Flask running?"));
    getFreeElsewhere().then(setFree).catch(() => {});
  }, []);

  if (error) return <p className="page-message">{error}</p>;
  if (!data) return <p className="page-message">Loading…</p>;
  if (!data.rows.length)
    return (
      <p className="page-message">
        Your library is empty. Add movie files to the media folder, then run a scan from the{" "}
        <Link to="/admin">Library</Link> page.
      </p>
    );

  const [first, ...rest] = data.rows;
  const lower = data.hero ? rest : data.rows;
  // Free-elsewhere movies go after the first row of your own films.
  const freeRow = free.length ? [{ title: "Free to watch on other apps", movies: free }] : [];
  const rows = [...lower.slice(0, 1), ...freeRow, ...lower.slice(1)];
  return (
    <>
      {data.hero ? (
        <Showcase
          movie={data.hero}
          strip={first}
          showMoreInfo
          onTrailer={() => setShowTrailer(true)}
        />
      ) : (
        <div className="page-top" />
      )}
      <div className="rows">
        {rows.map((row) => (
          <PosterRow key={row.title} title={row.title} movies={row.movies} />
        ))}
      </div>
      {showTrailer && <TrailerModal trailerKey={data.hero.trailer_key} onClose={() => setShowTrailer(false)} />}
    </>
  );
}
