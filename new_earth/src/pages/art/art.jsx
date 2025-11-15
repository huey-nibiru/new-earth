import { useState, useRef, useEffect } from "react";
import MosaicGallery from "../../components/gallery/gallery";

import "./art.css";

const Art = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, playlist.length]);

  useEffect(() => {
    if (audioRef.current && playlist[currentTrackIndex]) {
      audioRef.current.src = playlist[currentTrackIndex].url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, playlist]);

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const audioFiles = files.filter(
      (file) => file.type === "audio/mpeg" || file.type === "audio/wav"
    );

    const newTracks = audioFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPlaylist([...playlist, ...newTracks]);

    if (playlist.length === 0 && newTracks.length > 0) {
      setCurrentTrackIndex(0);
    }
  };

  const skipForward = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    }
  };

  const skipBackward = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentTrack = playlist[currentTrackIndex];

  const imageArray = [
    "public/Christian Art/piece1.jpg",
    "public/Christian Art/piece2.jpg",
    "public/Christian Art/piece3.jpg",
  ];

  return (
    <div>
      <div className="page-content">
        <h1 style={{ textAlign: "center" }}>Art & Music</h1>
        <div className="music-player">
          <div className="track-info">
            <div className="track-title">
              {currentTrack
                ? currentTrack.name.replace(/\.(mp3|wav)$/i, "")
                : "No Track Selected"}
            </div>
            <div className="track-artist">
              {playlist.length > 0
                ? `Track ${currentTrackIndex + 1} of ${playlist.length}`
                : "Upload audio files to begin"}
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-bar" onClick={handleProgressClick}>
              <div
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls">
            <button
              className="control-btn"
              onClick={skipBackward}
              disabled={currentTrackIndex === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button className="control-btn play-btn" onClick={togglePlay}>
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              className="control-btn"
              onClick={skipForward}
              disabled={currentTrackIndex === playlist.length - 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
              </svg>
            </button>
          </div>

          <div className="volume-container">
            <div className="volume-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </div>
            <div className="volume-slider" onClick={handleVolumeChange}>
              <div
                className="volume-fill"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>

          <div className="file-input-container">
            <label htmlFor="audio-upload" className="file-input-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  display: "inline",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload MP3 or WAV Files
            </label>
            <input
              id="audio-upload"
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              multiple
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          {playlist.length > 0 && (
            <div className="playlist">
              {playlist.map((track, index) => (
                <div
                  key={index}
                  className={`playlist-item ${
                    index === currentTrackIndex ? "active" : ""
                  }`}
                  onClick={() => selectTrack(index)}
                >
                  <svg
                    className="playlist-item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 2v7.5" />
                    <path d="M12 14.5V22" />
                    <path d="m2 12 7.5 5" />
                    <path d="m14.5 7 7.5 5" />
                    <path d="m14.5 17 7.5-5" />
                    <path d="m2 12 7.5-5" />
                  </svg>
                  <span className="playlist-item-name">{track.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <audio ref={audioRef} />
      </div>
      <div className="gallery">
        <MosaicGallery images={imageArray} />
      </div>
    </div>
  );
};

export default Art;
