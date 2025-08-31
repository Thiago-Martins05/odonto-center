import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Card className="p-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Serviço não encontrado
            </CardTitle>
            <p className="text-gray-600">
              O serviço que você está procurando não existe ou foi removido.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                O que você pode fazer:
              </h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left">
                <li>• Verificar se o link está correto</li>
                <li>• Navegar para a página de serviços</li>
                <li>• Entrar em contato conosco</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/servicos" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Ver todos os serviços
                </Link>
              </Button>

              <Button asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Ir para o início
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">
                Precisa de ajuda? Entre em contato:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-gray-500">📞</span>
                  <span className="text-gray-700">(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-gray-500">📧</span>
                  <span className="text-gray-700">
                    contato@odontocenter.com
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
