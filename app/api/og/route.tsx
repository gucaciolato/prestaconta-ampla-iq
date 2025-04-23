import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ?title=<title>
    const hasTitle = searchParams.has("title")
    const title = hasTitle ? searchParams.get("title")?.slice(0, 100) : "PrestaConta - AMPLA"

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src={`${process.env.VERCEL_URL || "http://localhost:3000"}/presta-conta-logo.svg`}
            alt="PrestaConta Logo"
            width={400}
            height={200}
          />
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: "bold",
            textAlign: "center",
            color: "#333",
            marginTop: "20px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 20,
            textAlign: "center",
            color: "#666",
            marginTop: "10px",
          }}
        >
          Portal de transparência da Associação de Assistência ao Menor de Platina
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
