import { Navigation } from "@/components/navigation";
import { SchedulingFlow } from "@/components/scheduling-flow";

export default function AgendaPage() {
  return (
    <div>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary font-dm-serif mb-4">
            Agendar Consulta
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Escolha o serviço, horário e preencha seus dados para agendar sua consulta
          </p>
        </div>
        <SchedulingFlow />
      </div>
    </div>
  );
}
