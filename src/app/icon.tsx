import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
        }}
      >
        <div
          style={{
            fontSize: 300,
            lineHeight: 1,
          }}
        >
          🥗
        </div>
      </div>
    ),
    { ...size }
  );
}
