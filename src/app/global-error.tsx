"use client";

// Last-resort error boundary. Only fires when even the root layout crashes,
// so it can't use any of the global styles or fonts.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: "center",
            padding: 40,
            border: "1px solid #1E1E1E",
            borderRadius: 16,
            backgroundColor: "#111",
          }}
        >
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: 2,
              color: "#FF4D4D",
              margin: 0,
            }}
          >
            ERROR CRÍTICO
          </p>
          <h1 style={{ margin: "10px 0 14px 0", fontSize: 22 }}>
            Tournex no pudo cargar
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 1.5 }}>
            La aplicación se rompió antes de iniciar. Recarga la página, y si
            el problema persiste, espera un momento e intenta de nuevo.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10,
                color: "#71717A",
                marginTop: 18,
              }}
            >
              Código: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 22px",
              backgroundColor: "#ADFF2F",
              color: "#0A0A0A",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
