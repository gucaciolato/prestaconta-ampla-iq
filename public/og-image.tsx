import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontSize: 40,
        color: "black",
        background: "white",
        width: "100%",
        height: "100%",
        padding: 40,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={`${process.env.VERCEL_URL || "http://localhost:3000"}/presta-conta-logo.svg`}
        alt="PrestaConta Logo"
        width={800}
        height={400}
      />
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
