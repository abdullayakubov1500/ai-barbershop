"use client";

import { useEffect, useState } from "react";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80";

const CUT_VIDEOS = [
  "w3IRlWTt-QQ",
  "aIGRrQRgVXc",
  "61yUif3pS3Q",
  "csmvtPunIO4",
  "bAkRO5hT3Z4",
];

function pickVideo() {
  return CUT_VIDEOS[Math.floor(Math.random() * CUT_VIDEOS.length)];
}

function embedUrl(id) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    loop: "1",
    playlist: id,
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export default function HeroBackground() {
  const [videoId, setVideoId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      return undefined;
    }
    setVideoId(pickVideo());
  }, []);

  return (
    <div className="hero-media" aria-hidden="true">
      <img className="hero-poster" src={HERO_POSTER} alt="" />
      {videoId && (
        <div className={`hero-video ${ready ? "is-on" : ""}`}>
          <iframe
            src={embedUrl(videoId)}
            title="Стрижка"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            tabIndex={-1}
            onLoad={() => {
              window.setTimeout(() => setReady(true), 700);
            }}
          />
        </div>
      )}
      <div className="hero-dim" />
    </div>
  );
}
