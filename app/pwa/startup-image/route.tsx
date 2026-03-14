import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const DEFAULT_WIDTH = 1290;
const DEFAULT_HEIGHT = 2796;

function getCanvasSize(request: NextRequest) {
  const width = Number(request.nextUrl.searchParams.get("width")) || DEFAULT_WIDTH;
  const height =
    Number(request.nextUrl.searchParams.get("height")) || DEFAULT_HEIGHT;

  return {
    width: Math.max(width, 320),
    height: Math.max(height, 568),
  };
}

export async function GET(request: NextRequest) {
  const { width, height } = getCanvasSize(request);
  const logoSize = Math.round(Math.min(width, height) * 0.18);
  const titleSize = Math.round(Math.min(width, height) * 0.058);
  const subtitleSize = Math.round(titleSize * 0.44);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, rgba(255,179,71,0.24), transparent 34%), linear-gradient(180deg, #3b2418 0%, #1c1917 64%, #120f0d 100%)",
          color: "#fff7ed",
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,141,93,0.18), transparent 42%, rgba(255,179,71,0.08) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: Math.round(height * 0.03),
          }}
        >
          <div
            style={{
              width: logoSize,
              height: logoSize,
              borderRadius: Math.round(logoSize * 0.24),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ff8d5d, #ffb347)",
              boxShadow: "0 24px 90px rgba(0, 0, 0, 0.32)",
            }}
          >
              <div
                style={{
                  width: Math.round(logoSize * 0.54),
                  height: Math.round(logoSize * 0.54),
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                  background: "#1c1917",
                  color: "#ffe7d6",
                  fontSize: Math.round(logoSize * 0.19),
                  fontWeight: 700,
                  letterSpacing: -4,
                }}
              >
                KM
              </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: Math.round(height * 0.01),
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                letterSpacing: -1,
              }}
            >
              Kotoba Mate
            </div>
            <div
              style={{
                fontSize: subtitleSize,
                color: "rgba(255, 237, 213, 0.84)",
              }}
            >
              Japanese speaking drills for Korean learners
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height },
  );
}
