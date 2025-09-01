"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const [loginResult, setLoginResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    setIsLoading(true);
    setLoginResult(null);

    try {
      // Simular login direto na API
      const response = await fetch("/api/auth/signin/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: "admin@odontocenter.com",
          password: "admin123",
          csrfToken: "test-token",
        }),
      });

      const result = await response.json();
      setLoginResult(result);
      console.log("Resultado do login:", result);

      if (result.ok) {
        alert("✅ Login bem-sucedido! Redirecionando para /admin...");
        window.location.href = "/admin";
      } else {
        alert("❌ Login falhou: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setLoginResult({ error: error.message });
      alert("❌ Erro no login: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogout = async () => {
    try {
      const response = await fetch("/api/auth/signout");
      const result = await response.json();
      console.log("Resultado do logout:", result);
      alert("✅ Logout realizado!");
      setLoginResult(null);
    } catch (error) {
      console.error("Erro no logout:", error);
      alert("❌ Erro no logout: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Teste de Autenticação</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Teste de Login Direto</h2>
          <p className="mb-4 text-gray-600">
            Esta página testa o login diretamente na API, sem depender do
            NextAuth client.
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleTestLogin}
              disabled={isLoading}
              className="mr-4"
            >
              {isLoading ? "Testando..." : "Testar Login Admin"}
            </Button>

            {loginResult && (
              <Button onClick={handleTestLogout} variant="outline">
                Testar Logout
              </Button>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Resultado do Teste</h2>
          {loginResult ? (
            <div className="bg-white p-3 rounded border">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum teste executado ainda.</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Credenciais de Teste</h2>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> admin@odontocenter.com
            </p>
            <p>
              <strong>Senha:</strong> admin123
            </p>
            <p>
              <strong>URL de Login:</strong> /login
            </p>
            <p>
              <strong>URL do Admin:</strong> /admin
            </p>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
          <p>
            <strong>NEXTAUTH_URL:</strong>{" "}
            {process.env.NEXTAUTH_URL || "Não definido"}
          </p>
          <p>
            <strong>NEXTAUTH_SECRET:</strong>{" "}
            {process.env.NEXTAUTH_SECRET ? "Definido" : "Não definido"}
          </p>
        </div>
      </div>
    </div>
  );
}
