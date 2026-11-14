import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "./Icons.jsx";
import PosterCard from "./PosterCard.jsx";

export default function PosterRow({ title, movies, small = false, className = "" }) {
  const track = useRef(null);
  const scroll = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className={`poster-row ${className}`}>
      <div className="poster-row__head">
        <h2 className="label">{title}</h2>
        <div className="poster-row__arrows">
          <button className="icon-btn" onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft /></button>
          <button className="icon-btn" onClick={() => scroll(1)} aria-label="Scroll right"><ChevronRight /></button>
        </div>
      </div>
      <div className="poster-row__track" ref={track}>
        {movies.map((m) => <PosterCard key={m.id || m.tmdb_id} movie={m} small={small} />)}
      </div>
    </section>
  );
}
