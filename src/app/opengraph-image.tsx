import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tournex — Organiza tu torneo de pádel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(173, 255, 47, 0.14), transparent 50%), radial-gradient(circle at 80% 70%, rgba(173, 255, 47, 0.08), transparent 50%)",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
          color: "#FFFFFF",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 50,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#ADFF2F" fillOpacity="0.18" />
            <path d="M8 10h4v4H8zM8 18h4v4H8zM16 14h8v4H16z" fill="#ADFF2F" />
            <path d="M12 12h4v2h-4zM12 20h4v2h-4z" fill="#ADFF2F" opacity="0.5" />
          </svg>
          <span
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#FFFFFF",
            }}
          >
            Tournex
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#FFFFFF",
            maxWidth: 1000,
          }}
        >
          Organiza tu torneo
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#ADFF2F",
            maxWidth: 1000,
            marginTop: 4,
          }}
        >
          de pádel en minutos.
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 40,
            fontSize: 26,
            color: "#A1A1AA",
            lineHeight: 1.4,
          }}
        >
          Brackets · Horarios · Resultados en vivo · 30 días gratis
        </div>

        {/* Bottom pill */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(173, 255, 47, 0.12)",
            color: "#ADFF2F",
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 600,
            border: "1px solid rgba(173, 255, 47, 0.3)",
          }}
        >
          tournex.app
        </div>
      </div>
    ),
    { ...size },
  );
}
