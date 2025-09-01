import { NextRequest, NextResponse } from "next/server";
import { toggleServiceStatus } from "@/server/admin/services";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await toggleServiceStatus(id);
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error toggling service status:", error);
    return NextResponse.json(
      { error: "Erro ao alternar status do serviço" },
      { status: 500 }
    );
  }
}
