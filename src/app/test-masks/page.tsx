"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { CpfInput } from "@/components/ui/cpf-input";
import { CepInput } from "@/components/ui/cep-input";
import { Input } from "@/components/ui/input";

export default function TestMasksPage() {
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Teste de Máscaras</h1>
          <p className="text-gray-600">
            Teste a formatação automática dos campos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (sem máscara)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com máscara automática)</Label>
              <PhoneInput
                id="phone"
                value={phone}
                onChange={setPhone}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (com máscara automática)</Label>
              <CpfInput
                id="cpf"
                value={cpf}
                onChange={setCpf}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP (com máscara automática)</Label>
              <CepInput
                id="cep"
                value={cep}
                onChange={setCep}
                placeholder="00000-000"
              />
            </div>
          </CardContent>
        </Card>

                 <Card>
           <CardHeader>
             <CardTitle>Valores Atuais</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <div>
               <strong>Nome:</strong> {name || "vazio"}
             </div>
             <div>
               <strong>Telefone (formatado):</strong> {phone || "vazio"}
             </div>
             <div>
               <strong>Telefone (apenas números):</strong> {phone.replace(/\D/g, "") || "vazio"}
             </div>
             <div>
               <strong>CPF (formatado):</strong> {cpf || "vazio"}
             </div>
             <div>
               <strong>CEP (formatado):</strong> {cep || "vazio"}
             </div>
           </CardContent>
         </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">📱 Telefone:</h4>
              <p className="text-sm text-gray-600">
                Digite apenas números. A formatação (XX) XXXXX-XXXX é aplicada automaticamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">🆔 CPF:</h4>
              <p className="text-sm text-gray-600">
                Digite apenas números. A formatação XXX.XXX.XXX-XX é aplicada automaticamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">📮 CEP:</h4>
              <p className="text-sm text-gray-600">
                Digite apenas números. A formatação XXXXX-XXX é aplicada automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
