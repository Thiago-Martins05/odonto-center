export async function GET() {
  try {
    return Response.json({
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
        signinUrl: "/api/auth/signin/credentials",
        callbackUrl: "/api/auth/callback/credentials",
      },
    });
  } catch (error) {
    console.error("Erro na rota providers:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

