"use client";

export function ContactMessagesTabSimple() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mensagens de Contato</h2>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>✅ Aba de Mensagens Funcionando!</strong>
        <p className="mt-2">
          Esta é a aba de mensagens de contato. Aqui você pode ver e gerenciar todas as mensagens enviadas através do formulário de contato.
        </p>
        <p className="mt-2">
          <strong>Teste:</strong> Vá para a página "/contato" e envie uma mensagem para ver como funciona!
        </p>
        <p className="mt-2 text-xs">
          Atualizado em: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
