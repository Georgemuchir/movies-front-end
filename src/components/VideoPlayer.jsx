import { useEffect, useRef } from "react";
import { saveProgress, saveProgressOnExit, streamUrl } from "../api/client.js";

const SAVE_EVERY_MS = 10_000;

// Plays a movie from the saved position and saves progress every 10 s, on pause and when leaving.
export default function VideoPlayer({ movieId, startAt = 0 }) {
  const video = useRef(null);
  const lastSaved = useRef(-1);

  const save = (onExit = false) => {
    const v = video.current;
    if (!v || !v.duration || Math.abs(v.currentTime - lastSaved.current) < 1) return;
    lastSaved.current = v.currentTime;
    if (onExit) saveProgressOnExit(movieId, v.currentTime, v.duration);
    else saveProgress(movieId, v.currentTime, v.duration).catch(() => {});
  };

  useEffect(() => {
    const timer = setInterval(() => !video.current?.paused && save(), SAVE_EVERY_MS);
    const onExit = () => save(true);
    window.addEventListener("pagehide", onExit);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", onExit);
      save(true); // leaving the player inside the app
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const onLoaded = (e) => {
    if (startAt > 0 && startAt < e.currentTarget.duration - 5) e.currentTarget.currentTime = startAt;
  };

  return (
    <video
      ref={video}
      className="video-player"
      src={streamUrl(movieId)}
      controls
      autoPlay
      playsInline
      preload="metadata"
      onLoadedMetadata={onLoaded}
      onPause={() => save()}
      onEnded={() => save()}
    />
  );
}
