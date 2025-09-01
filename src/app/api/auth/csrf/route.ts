export async function GET() {
  try {
    // Gerar um token CSRF simples
    const csrfToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    return Response.json({ csrfToken });
  } catch (error) {
    console.error("Erro na rota CSRF:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

