export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    return Response.json({
      url: callbackUrl,
      ok: true,
    });
  } catch (error) {
    console.error("Erro na rota signout:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST() {
  try {
    return Response.json({
      url: "/",
      ok: true,
    });
  } catch (error) {
    console.error("Erro na rota signout POST:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

