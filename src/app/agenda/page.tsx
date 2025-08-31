import { Metadata } from "next";
import { SchedulingFlow } from "@/components/scheduling-flow";

export const metadata: Metadata = {
  title: "Agendar Consulta | Odonto Center - Agendamento Online",
  description:
    "Agende sua consulta odontológica online com facilidade. Escolha o serviço, horário e preencha seus dados. Agendamento rápido e seguro.",
  openGraph: {
    title: "Agendar Consulta | Odonto Center",
    description:
      "Agende sua consulta odontológica online com facilidade. Escolha o serviço, horário e preencha seus dados.",
  },
};

export default function AgendaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary font-dm-serif mb-4">
          Agendar Consulta
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Escolha o serviço, horário e preencha seus dados para agendar sua
          consulta
        </p>
      </div>
      <SchedulingFlow />
    </div>
  );
}
