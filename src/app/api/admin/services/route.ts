import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Teste simples sem importação
    return NextResponse.json({ 
      message: "API funcionando!", 
      timestamp: new Date().toISOString(),
      services: [
        { id: "1", name: "Teste 1", active: true },
        { id: "2", name: "Teste 2", active: false }
      ]
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({ 
      message: "Dados recebidos!", 
      data,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}
