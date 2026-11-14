import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovie, getProgress } from "../api/client.js";
import { BackIcon } from "../components/Icons.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(null);

  useEffect(() => {
    getMovie(id).then((m) => setTitle(m.title)).catch(() => {});
    getProgress(id).then((p) => setStartAt(p.position_sec)).catch(() => setStartAt(0));
  }, [id]);

  return (
    <div className="player">
      <button className="player__back" onClick={() => navigate(-1)} aria-label="Back">
        <BackIcon /> {title}
      </button>
      {startAt !== null && <VideoPlayer movieId={id} startAt={startAt} />}
    </div>
  );
}
