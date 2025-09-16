import React from "react";

interface Level5ExportA4Props {
  playerName: string;
  stars: number;
  artworkSvg: string; // SVG string hasil mewarnai
}

const A4_WIDTH = 794; // px (210mm @ 96dpi)
const A4_HEIGHT = 1123; // px (297mm @ 96dpi)

export default function Level5ExportA4({
  playerName,
  stars,
  artworkSvg,
}: Level5ExportA4Props) {
  return (
    <div
      style={{
        width: `${A4_WIDTH}px`,
        height: `${A4_HEIGHT}px`,
        background: "#fdfdfd",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "0",
      }}
      className="export-a4"
    >
      {/* Header Nama & Hasil */}
      <div
        style={{
          border: "3px dotted #222",
          borderRadius: "32px",
          margin: "32px auto 0 auto",
          width: "90%",
          padding: "24px 32px",
          fontSize: "2rem",
          fontFamily: "inherit",
          background: "#fff",
        }}
      >
        <div>
          Nama : <span style={{ fontWeight: 700 }}>{playerName || "...."}</span>
        </div>
        <div>
          Hasil : <span style={{ fontWeight: 700 }}>{stars ?? "...."}</span>
          <span style={{ fontSize: "2rem", marginLeft: 8 }}>⭐</span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "800px", 
          margin: "48px auto 0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "visible",
          background: "none",
          border: "none",
          padding: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "visible",
            background: "none",
            border: "none",
            padding: 0,
            position: "relative",
          }}
          className="svg-artwork-wrapper"
          dangerouslySetInnerHTML={{ __html: artworkSvg }}
        />
        <style>{`
          .svg-artwork-wrapper svg {
            width: 550px !important;
            height: 800px !important;
            max-width: none !important;
            max-height: none !important;
            transform: rotate(90deg) scale(1.5);
            display: block;
            background: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}
