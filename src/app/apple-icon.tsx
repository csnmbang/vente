import { ImageResponse } from "next/og";

// Home-screen icon on iPhone: the Spanish flag (no crest). iOS rounds the corners.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "#AA151B" }} />
        <div style={{ flex: 2, background: "#F1BF00" }} />
        <div style={{ flex: 1, background: "#AA151B" }} />
      </div>
    ),
    size,
  );
}
