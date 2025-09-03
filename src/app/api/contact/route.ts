import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/server/email";
import { promises as fs } from "fs";
import path from "path";

// Função para salvar mensagens em arquivo JSON
async function saveMessageToFile(messageData: any) {
  try {
    const messagesPath = path.join(process.cwd(), "contact-messages.json");
    
    // Tentar ler mensagens existentes
    let messages = [];
    try {
      const existingData = await fs.readFile(messagesPath, "utf-8");
      messages = JSON.parse(existingData);
    } catch (error) {
      // Arquivo não existe, começar com array vazio
      messages = [];
    }
    
    // Adicionar nova mensagem
    const newMessage = {
      id: Date.now().toString(),
      ...messageData,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    messages.unshift(newMessage); // Adicionar no início
    
    // Salvar de volta no arquivo
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
    
    return newMessage;
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validação básica
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Salvar mensagem no arquivo JSON
    const savedMessage = await saveMessageToFile({
      name,
      email,
      phone: phone || null,
      subject,
      message,
    });

    // Tentar enviar email para o administrador
    const emailResult = await sendContactEmail({
      name,
      email,
      phone: phone || "Não informado",
      subject,
      message,
    });

    if (!emailResult.success) {
      console.log("Email não enviado (serviço não configurado), mas mensagem salva no arquivo");
    } else {
      console.log("Email enviado com sucesso para o administrador");
    }

    return NextResponse.json(
      { 
        message: "Mensagem enviada com sucesso!",
        emailSent: emailResult.success,
        messageId: savedMessage?.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na API de contato:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
