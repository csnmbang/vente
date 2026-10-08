import { ImageResponse } from "next/og";
import { store } from "@/lib/store";
import { verdict } from "@/lib/verdict";

// Link preview for WhatsApp, iMessage, X…  The score comes from the
// database, so a shared link can't be faked by editing the URL.

export const alt = "Mi resultado en Vente";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = /^[0-9a-f-]{36}$/i.test(id) ? await store().getAttempt(id) : null;
  const score = attempt && attempt.status !== "in_progress" ? attempt.correct_count : null;
  const total = attempt?.question_ids.length ?? 5;
  const v = score === null ? null : verdict(score, total);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#e5322d",
          color: "white",
          padding: 64,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: 320,
            background: "#ffc93c",
          }}
        />
        <div style={{ fontSize: 44, fontWeight: 800 }}>Vente</div>
        {score === null ? (
          <div style={{ fontSize: 120, fontWeight: 800 }}>Vente pa&apos;cá</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>He sacado</div>
            <div style={{ fontSize: 200, fontWeight: 800, lineHeight: 1 }}>{score}/{total}</div>
            <div style={{ fontSize: 48, fontWeight: 800 }}>{v}</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36 }}>
          <div style={{ color: "#ffc93c", fontWeight: 800 }}>Vente pa&apos;cá</div>
          <div>vengavente.com</div>
        </div>
      </div>
    ),
    size,
  );
}
