import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 120,
          background: "linear-gradient(135deg, #ff8d5d, #ffb347)",
          position: "relative",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 48,
            borderRadius: 104,
            border: "10px solid rgba(255,255,255,0.2)",
            background: "rgba(28,25,23,0.12)",
          }}
        />
        <div
          style={{
            width: 228,
            height: 228,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1c1917",
            color: "#ffe7d6",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -6,
          }}
        >
          KM
        </div>
        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: 90,
            width: 42,
            height: 42,
            borderRadius: 9999,
            background: "rgba(255,247,237,0.95)",
          }}
        />
      </div>
    ),
    size,
  );
}
