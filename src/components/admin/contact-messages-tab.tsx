"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, MailOpen, Phone, Calendar, User, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function ContactMessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // Tentar primeiro a API do banco de dados (mensagens reais)
      const response = await fetch("/api/admin/contact-messages");
      
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          return;
        }
      }
      
      // Se não houver mensagens no banco, tentar a API do arquivo JSON
      const fileResponse = await fetch("/api/admin/contact-messages-file");
      
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        if (fileData.messages && fileData.messages.length > 0) {
          setMessages(fileData.messages);
          return;
        }
      }
      
      // Se não conseguir, usar a API mock para demonstração
      const mockResponse = await fetch("/api/admin/contact-messages-mock");
      
      if (mockResponse.ok) {
        const mockData = await mockResponse.json();
        setMessages(mockData.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      // Em caso de erro, tentar a API mock
      try {
        const mockResponse = await fetch("/api/admin/contact-messages-mock");
        if (mockResponse.ok) {
          const mockData = await mockResponse.json();
          setMessages(mockData.messages);
        } else {
          setMessages([]);
        }
      } catch (mockError) {
        console.error("Erro ao buscar mensagens mock:", mockError);
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string, read: boolean) => {
    try {
      // Tentar primeiro a API do arquivo JSON
      let response = await fetch("/api/admin/contact-messages-file", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: messageId, read }),
      });

      // Se não funcionar, tentar a API do banco de dados
      if (!response.ok) {
        response = await fetch("/api/admin/contact-messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: messageId, read }),
        });
      }

      // Se ainda não funcionar, tentar a API mock
      if (!response.ok) {
        response = await fetch("/api/admin/contact-messages-mock", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: messageId, read }),
        });
      }

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, read } : msg
          )
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, read } : null);
        }
        toast.success(read ? "Marcado como lido" : "Marcado como não lido");
      } else {
        toast.error("Erro ao atualizar mensagem");
      }
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
      toast.error("Erro ao atualizar mensagem");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Tentar primeiro a API do arquivo JSON
      let response = await fetch("/api/admin/contact-messages-file", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: messageId }),
      });

      // Se não funcionar, tentar a API do banco de dados
      if (!response.ok) {
        response = await fetch("/api/admin/contact-messages", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: messageId }),
        });
      }

      if (response.ok) {
        // Remover mensagem da lista
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Se a mensagem selecionada foi excluída, limpar seleção
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        
        toast.success("Mensagem excluída com sucesso");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao excluir mensagem");
      }
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Erro ao excluir mensagem");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mensagens de Contato</h2>
        </div>
        <div className="text-center py-8">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mensagens de Contato</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de mensagens */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Lista de Mensagens</h3>
                     {messages.length === 0 ? (
             <Card>
               <CardContent className="text-center py-8">
                 <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                 <p className="text-gray-500 mb-2">Nenhuma mensagem de contato ainda.</p>
                 <p className="text-sm text-gray-400">
                   As mensagens enviadas pelo formulário aparecem aqui quando o banco de dados estiver configurado.
                 </p>
                 <p className="text-sm text-gray-400 mt-2">
                   Por enquanto, verifique os logs do servidor para ver as mensagens processadas.
                 </p>
                 <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                   <p className="text-sm text-blue-700">
                     💡 <strong>Dica:</strong> Teste o formulário de contato na página "/contato" para ver as mensagens aparecerem aqui!
                   </p>
                 </div>
               </CardContent>
             </Card>
           ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-colors ${
                    !message.read ? 'border-blue-200 bg-blue-50' : ''
                  } ${selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!message.read ? (
                            <Mail className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MailOpen className="w-4 h-4 text-gray-400" />
                          )}
                          <h4 className="font-medium truncate">{message.name}</h4>
                          {!message.read && (
                            <Badge variant="secondary" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da mensagem selecionada */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Detalhes da Mensagem</h3>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedMessage.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {selectedMessage.email}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedMessage.read ? "outline" : "default"}
                      onClick={() => markAsRead(selectedMessage.id, !selectedMessage.read)}
                    >
                      {selectedMessage.read ? "Marcar como não lido" : "Marcar como lido"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedMessage.createdAt)}
                </div>
                
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {selectedMessage.phone}
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Assunto:</h4>
                  <p className="text-sm text-gray-700">{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mensagem:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Responder por Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Selecione uma mensagem para ver os detalhes.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
