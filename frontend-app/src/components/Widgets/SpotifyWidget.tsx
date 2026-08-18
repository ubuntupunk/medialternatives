"use client";

import React from "react";

export interface SpotifyWidgetProps {
  showId?: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
}

const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({
  showId = "0341WZjkt7aJOEDQnAJgzO",
  title = "Listen on Spotify",
  className = "",
  width = 500,
  height = 352,
  theme = "light",
}) => {
  const embedUrl = new URL(`https://open.spotify.com/embed/show/${showId}`);
  embedUrl.searchParams.set("utm_source", "generator");
  embedUrl.searchParams.set("theme", theme === "dark" ? "0" : "1");

  return (
    <div className={`widget spotify-widget ${className}`}>
      <h3 className="widget-title">{title}</h3>
      <div className="spotify-embed-container">
        <div style={{ width: `${width}px`, maxWidth: "100%" }}>
          <iframe
            src={embedUrl.toString()}
            style={{
              display: "block",
              borderRadius: "12px",
              border: "none",
              height: `${height}px`,
              width: `${width}px`,
              maxWidth: "100%",
            }}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default SpotifyWidget;
