import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Função para ler mensagens do arquivo JSON
async function readMessagesFromFile() {
  try {
    const messagesPath = path.join(process.cwd(), "contact-messages.json");
    
    // Tentar ler mensagens existentes
    const existingData = await fs.readFile(messagesPath, "utf-8");
    const messages = JSON.parse(existingData);
    
    return messages;
  } catch (error) {
    // Arquivo não existe ou erro de leitura
    return [];
  }
}

// Função para atualizar status de leitura
async function updateMessageStatus(messageId: string, read: boolean) {
  try {
    const messagesPath = path.join(process.cwd(), "contact-messages.json");
    
    // Ler mensagens existentes
    const messages = await readMessagesFromFile();
    
    // Encontrar e atualizar a mensagem
    const messageIndex = messages.findIndex((msg: any) => msg.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].read = read;
      
      // Salvar de volta no arquivo
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
      
      return messages[messageIndex];
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error);
    return null;
  }
}

// Função para excluir mensagem
async function deleteMessage(messageId: string) {
  try {
    const messagesPath = path.join(process.cwd(), "contact-messages.json");
    
    // Ler mensagens existentes
    const messages = await readMessagesFromFile();
    
    // Encontrar e remover a mensagem
    const messageIndex = messages.findIndex((msg: any) => msg.id === messageId);
    if (messageIndex !== -1) {
      const deletedMessage = messages[messageIndex];
      messages.splice(messageIndex, 1);
      
      // Salvar de volta no arquivo
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
      
      return deletedMessage;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao excluir mensagem:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Para demonstração, não verificar autenticação
    // Em produção, sempre verificar autenticação
    
    const messages = await readMessagesFromFile();
    
    return NextResponse.json({ 
      messages,
      note: messages.length > 0 
        ? "Mensagens carregadas do arquivo JSON" 
        : "Nenhuma mensagem encontrada. Envie uma mensagem pelo formulário de contato!"
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Para demonstração, não verificar autenticação
    // Em produção, sempre verificar autenticação

    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: "ID e status de leitura são obrigatórios" },
        { status: 400 }
      );
    }

    const updatedMessage = await updateMessageStatus(id, read);

    if (updatedMessage) {
      return NextResponse.json({ 
        message: updatedMessage,
        note: "Status atualizado no arquivo JSON"
      });
    } else {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Para demonstração, não verificar autenticação
    // Em produção, sempre verificar autenticação

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    const deletedMessage = await deleteMessage(id);

    if (deletedMessage) {
      return NextResponse.json({ 
        message: deletedMessage,
        note: "Mensagem excluída do arquivo JSON"
      });
    } else {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erro ao excluir mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
