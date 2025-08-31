import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Phone, Clock, MapPin } from "lucide-react";

export function WhatsAppContact() {
  const handleWhatsAppClick = () => {
    // Substitua pelo número do WhatsApp empresarial
    const phoneNumber = "5511999999999";
    const message =
      "Olá! Gostaria de falar com um atendente sobre os serviços odontológicos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-dm-serif">
          Fale com um atendente
        </CardTitle>
        <CardDescription>
          Conecte-se diretamente com nossa equipe via WhatsApp para atendimento
          imediato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button
            onClick={handleWhatsAppClick}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Abrir WhatsApp
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Phone className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold">Telefone</p>
              <p className="text-sm text-text-secondary">(11) 9999-9999</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold">Horário</p>
              <p className="text-sm text-text-secondary">Seg-Sex: 8h-18h</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold">Localização</p>
              <p className="text-sm text-text-secondary">Natal, RN</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Por que usar o WhatsApp?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Atendimento rápido e personalizado</li>
            <li>• Envio de fotos e documentos</li>
            <li>• Agendamento de consultas</li>
            <li>• Respostas em tempo real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
