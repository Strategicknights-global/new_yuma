import React, { useState } from "react";
import "./SocialMedia.css";
import { Leaf, Heart, Sparkles, Instagram, Facebook, Twitter } from "lucide-react";
const instagramReels = [
  { id: 1, url: "https://www.instagram.com/p/DMNetXrzVmO/embed" },
  { id: 2, url: "https://www.instagram.com/p/C7txaVJz9Zl/embed" },
  { id: 3, url: "https://www.instagram.com/reel/DNvtg4hZC-_embed" },
  { id: 4, url: "https://www.instagram.com/reel/DMrpgkevSoz_embed" },
  { id: 5, url: "https://www.instagram.com/p/C6mnA4kKxL_/embed" },
];

const SocialMedia = () => {
  const [manualOffset] = useState(0);

  return (
    <section className="social-media-section">

         <div className="flex items-center justify-center gap-3 mb-2">
  <Leaf className="w-6 h-6 text-pink-500" />
  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
    Follow us on <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">Social Media</span>
  </h2>
  <Leaf className="w-6 h-6 text-orange-500" />
</div>
<p className="text-slate-600">Join our community for fresh updates & healthy recipes</p>
       
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
                    <iframe
                      src={reel.url}
                      frameBorder="0"
                      scrolling="no"
                      allow="encrypted-media"
                      title={`Instagram Reel ${reel.id}`}
                      className="reel-iframe"
                    ></iframe>
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
      "https://www.instagram.com/strategic_knights?igsh=dzR6dGRlcjc3N3Q%3D",
      "_blank"
    )
  }
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
  Follow us on Instagram
</button>

    </section>
  );
};

export default SocialMedia;