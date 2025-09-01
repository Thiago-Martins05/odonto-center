import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    // TODO: Replace with actual database update operation
    console.log(`Updating appointment ${id} status to: ${status}`);
    
    return NextResponse.json({ 
      success: true, 
      appointmentId: id, 
      status: status 
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do agendamento" },
      { status: 500 }
    );
  }
}
