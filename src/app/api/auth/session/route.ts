export async function GET() {
  try {
    // Por enquanto, retornar sessão vazia
    // Em uma implementação real, você verificaria cookies/tokens
    return Response.json({
      user: null,
      expires: null,
    });
  } catch (error) {
    console.error("Erro na rota session:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

