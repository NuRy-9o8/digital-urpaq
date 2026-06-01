import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export const ClickToPlayVideo = ({ src, title, className = 'aspect-video w-full', autoLoop = false }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={`video-shell ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        loop={autoLoop}
        playsInline
        preload="metadata"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" className="video-play-button" onClick={togglePlayback} aria-label={playing ? 'Пауза' : `Воспроизвести ${title}`}>
        {playing ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
      </button>
    </div>
  );
};
