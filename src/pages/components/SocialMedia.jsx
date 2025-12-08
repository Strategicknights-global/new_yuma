import React, { useState, useRef, useEffect } from "react";
import "./SocialMedia.css";
import { Leaf, Instagram, Play, Pause, Volume2, VolumeX } from "lucide-react";

// Import your local video files
import reel1 from "../../assets/video/reel1.mp4";
import reel2 from "../../assets/video/reel2.mp4";
import reel3 from "../../assets/video/reel3.mp4";
import reel4 from "../../assets/video/reel4.mp4";
import reel5 from "../../assets/video/reel5.mp4";

const instagramReels = [
  { id: 1, url: "https://www.instagram.com/reel/DP_kVLriapp/", video: reel1 },
  { id: 2, url: "https://www.instagram.com/reel/DOxElkLCXmY/", video: reel2 },
  { id: 3, url: "https://www.instagram.com/reel/DMnbRLEPYtT/", video: reel3 },
  { id: 4, url: "https://www.instagram.com/reel/DLmRSeCvlIo/", video: reel4 },
  { id: 5, url: "https://www.instagram.com/reel/DMeYuDHPJxu/", video: reel5 },
];

const SocialMedia = () => {
  const [manualOffset] = useState(0);
  const [playingStates, setPlayingStates] = useState(
    Array(instagramReels.length).fill(false)
  );
  const [mutedStates, setMutedStates] = useState(
    Array(instagramReels.length).fill(true)
  );
  const videoRefs = useRef([]);

  // Autoplay videos on mount (muted to comply with browser policies)
  useEffect(() => {
    const playAllVideos = async () => {
      for (let i = 0; i < videoRefs.current.length; i++) {
        const video = videoRefs.current[i];
        if (video) {
          try {
            await video.play();
            setPlayingStates(prev => {
              const newStates = [...prev];
              newStates[i] = true;
              return newStates;
            });
          } catch (error) {
            console.log(`Video ${i} autoplay blocked:`, error);
          }
        }
      }
    };

    // Small delay to ensure videos are loaded
    const timer = setTimeout(() => {
      playAllVideos();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const togglePlay = async (index, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const video = videoRefs.current[index];
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        const newStates = [...playingStates];
        newStates[index] = true;
        setPlayingStates(newStates);
      } else {
        video.pause();
        const newStates = [...playingStates];
        newStates[index] = false;
        setPlayingStates(newStates);
      }
    } catch (error) {
      console.error("Error playing video:", error);
    }
  };

  const toggleMute = (index, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const video = videoRefs.current[index];
    if (!video) return;

    const newMutedStates = [...mutedStates];
    newMutedStates[index] = !newMutedStates[index];
    setMutedStates(newMutedStates);
    video.muted = newMutedStates[index];
  };

  return (
    <section className="social-media-section">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Leaf className="w-6 h-6 text-pink-500" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Follow us on{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Social Media
          </span>
        </h2>
        <Leaf className="w-6 h-6 text-orange-500" />
      </div>
      <p className="text-slate-600">
        Watch our latest reels • Videos play automatically (muted)
      </p>

      <div className="carousel-container">
        <div className="carousel">
          <div
            className="carousel-rotation-direction"
            style={{ "--manual-offset": `${manualOffset}deg` }}
          >
            <ul
              className="carousel-item-wrapper"
              style={{ "--_num-elements": instagramReels.length }}
            >
              {instagramReels.map((reel, index) => (
                <li
                  key={reel.id}
                  className="carousel-item"
                  style={{ "--_index": index + 1 }}
                >
                  <div className="carousel-content">
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-black">
                      {/* Video Element with autoplay attributes */}
                      <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        preload="auto"
                        playsInline
                        webkit-playsinline="true"
                        autoPlay
                        loop
                        muted={mutedStates[index]}
                        className="w-full h-full object-cover"
                        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
                        onLoadedData={(e) => {
                          // Try to play when video data is loaded
                          e.target.play().catch(err => console.log("Autoplay prevented:", err));
                        }}
                      >
                        <source src={reel.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                      {/* Instagram Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] p-2.5 rounded-xl shadow-lg z-10">
                        <Instagram className="w-5 h-5 text-white" />
                      </div>

                      {/* Play/Pause Button (center) - only shows when paused */}
                      {!playingStates[index] && (
                        <button
                          onClick={(e) => togglePlay(index, e)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-5 rounded-full shadow-2xl hover:scale-110 transition-all z-20 cursor-pointer"
                          type="button"
                        >
                          <Play className="w-10 h-10 text-gray-800 fill-gray-800 ml-1" />
                        </button>
                      )}

                      {/* Pause button (top-left, appears when playing) */}
                      {playingStates[index] && (
                        <button
                          onClick={(e) => togglePlay(index, e)}
                          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/90 transition-all z-20 cursor-pointer"
                          type="button"
                        >
                          <Pause className="w-5 h-5 text-white" />
                        </button>
                      )}

                      {/* Mute/Unmute Button (top-right) */}
                      <button
                        onClick={(e) => toggleMute(index, e)}
                        className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/90 transition-all z-20 cursor-pointer"
                        type="button"
                      >
                        {mutedStates[index] ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>

                      {/* Click overlay for video play/pause */}
                      <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={(e) => togglePlay(index, e)}
                      ></div>

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold drop-shadow-lg">
                            Reel #{reel.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(reel.url, "_blank");
                            }}
                            className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium hover:bg-white/30 transition-all flex items-center gap-1 cursor-pointer"
                            type="button"
                          >
                            <Instagram className="w-3 h-3" />
                            View on IG
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              <li className="carousel-ground"></li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() =>
          window.open(
            "https://www.instagram.com/yumasfreshfoods?igsh=MW5raHFuNndqYWU1MA==",
            "_blank"
          )
        }
        className="flex items-center gap-2 mx-auto"
        style={{
          background:
            "linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4)",
          color: "#fff",
          padding: "1rem 2rem",
          fontWeight: "bold",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        <Instagram className="w-5 h-5" />
        Follow us on Instagram
      </button>
    </section>
  );
};

export default SocialMedia;