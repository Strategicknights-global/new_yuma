import React, { useState } from "react";
import "./SocialMedia.css";

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
      <h2 className="social-title">Follow us on Social Media</h2>

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
        className="cta-button"
      >
        Follow us on Instagram
      </button>
    </section>
  );
};

export default SocialMedia;