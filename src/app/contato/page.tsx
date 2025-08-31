"use client";

import { ContactForm } from "@/components/contact-form";
import { WhatsAppContact } from "@/components/whatsapp-contact";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-6xl">
        {/* Header centralizado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-text-primary font-dm-serif mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Escolha a melhor forma de entrar em contato conosco. Nossa equipe
            está pronta para ajudar!
          </p>
        </div>

        {/* Tabs centralizados */}
        <div className="flex justify-center mb-12">
          <Tabs defaultValue="whatsapp" className="w-full max-w-4xl">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="whatsapp"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="form" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Formulário
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="whatsapp" className="space-y-6">
              <div className="flex justify-center">
                <WhatsAppContact />
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-6">
              <div className="flex justify-center">
                <ContactForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Informações de contato centralizadas */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-text-primary mb-8">
            Outras formas de contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Telefone</h3>
              <p className="text-text-secondary">(11) 9999-9999</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-text-secondary">contato@odontocenter.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Endereço</h3>
              <p className="text-text-secondary">Natal-RN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
