export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get("error");

    if (error) {
      return Response.json({ error });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro no callback GET:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const email = body.get("email") as string;
    const password = body.get("password") as string;
    const csrfToken = body.get("csrfToken") as string;

    // Simular autenticação
    if (email === "admin@odontocenter.com" && password === "admin123") {
      return Response.json({
        url: "/admin",
        ok: true,
        error: null,
      });
    } else {
      return Response.json({
        url: null,
        ok: false,
        error: "CredentialsSignin",
      });
    }
  } catch (error) {
    console.error("Erro no callback POST:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
