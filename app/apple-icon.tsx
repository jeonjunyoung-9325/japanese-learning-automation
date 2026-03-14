import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #ff8d5d, #ffb347)",
          position: "relative",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: 30,
            border: "3px solid rgba(255,255,255,0.22)",
            background: "rgba(28,25,23,0.12)",
          }}
        />
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1c1917",
            color: "#ffe7d6",
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          KM
        </div>
        <div
          style={{
            position: "absolute",
            right: 28,
            bottom: 28,
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "rgba(255,247,237,0.95)",
          }}
        />
      </div>
    ),
    size,
  );
}
