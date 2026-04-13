import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MealPact — AI Calorie Tracker with WLD Commitment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "#052e16",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
            top: -100,
            left: 250,
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 36,
            background: "rgba(16,185,129,0.15)",
            border: "2px solid rgba(16,185,129,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            marginBottom: 32,
          }}
        >
          🥗
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          MealPact
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          AI Calorie Tracker + WLD Commitment Challenge
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(16,185,129,0.15)",
            border: "1.5px solid rgba(16,185,129,0.5)",
            borderRadius: 32,
            padding: "10px 28px",
            color: "#6ee7b7",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          ✦ World App Mini App
        </div>
      </div>
    ),
    { ...size }
  );
}
