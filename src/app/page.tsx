import Image from "next/image";
import {
  Heart,
  Shield,
  Zap,
  Sparkles,
  Microscope,
  Clock3,
  Stethoscope,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-hero-bg via-hero-bg/95 to-slate-900 py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30px_30px,rgba(255,255,255,0.03)_2px,transparent_0)] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium border border-primary/30 backdrop-blur-sm">
                <Heart className="w-4 h-4 mr-2" />
                Atendimento humanizado
              </div>

              <h1 className="text-5xl lg:text-7xl font-dm-serif font-bold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  Odonto Center
                </span>
                <br />
                <span className="text-2xl lg:text-3xl font-plus-jakarta font-normal text-gray-300 mt-4 block">
                  Sorrisos saudáveis, atendimento humanizado.
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg">
                Agende online sua consulta, avaliação ou limpeza com poucos
                cliques.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/agenda"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
                >
                  Agendar agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#"
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>

            <div className="relative group">
              {/* Main Image Container */}
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                <Image
                  src="/odonto1hero.png"
                  alt="Clínica Odonto Center - Ambiente moderno e acolhedor"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Floating Elements */}
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm opacity-80">
                      Anos de experiência
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-primary/90 backdrop-blur-md rounded-2xl p-4 text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-sm opacity-90">
                      Pacientes atendidos
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Equipe experiente
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Profissionais qualificados e dedicados com mais de 5 anos de
                experiência
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ambiente confortável
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Clínica moderna e acolhedora com tecnologia de ponta
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Agendamento fácil
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reserve sua consulta em poucos cliques, 24 horas por dia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por que escolher a Odonto Center */}
      <section className="py-24 bg-gradient-to-br from-light-bg to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(0,0,0,0.02)_2px,transparent_0)]"></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-dm-serif font-bold text-text-primary mb-6">
              Por que escolher a Odonto Center?
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Nossa missão é proporcionar tratamentos odontológicos de
              excelência com foco no conforto e bem-estar dos pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl mb-6">
                <Sparkles className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-dm-serif font-bold text-text-primary mb-4">
                Transparência nos procedimentos
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Explicamos detalhadamente cada tratamento, com orçamentos claros
                e sem surpresas.
              </p>
              <div className="flex items-center text-primary font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                Sem custos ocultos
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl mb-6">
                <Microscope className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-dm-serif font-bold text-text-primary mb-4">
                Tecnologia e biossegurança
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Equipamentos de última geração e protocolos rigorosos de higiene
                e segurança.
              </p>
              <div className="flex items-center text-primary font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                Certificação de qualidade
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl mb-6">
                <Clock3 className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-dm-serif font-bold text-text-primary mb-4">
                Horários flexíveis
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Atendimento em horários convenientes, incluindo finais de
                semana.
              </p>
              <div className="flex items-center text-primary font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                Agendamento 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Highlight Strip */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-dm-serif font-bold text-text-primary mb-6">
              Nossos Serviços
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Tratamentos completos para sua saúde bucal com a melhor tecnologia
              disponível
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-light-bg to-white p-8 rounded-3xl text-center border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                Consulta
              </h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Avaliação completa da saúde bucal com diagnóstico detalhado
              </p>
              <div className="text-3xl font-bold text-primary mb-2">R$ 120</div>
              <div className="text-sm text-text-secondary mb-4">30 minutos</div>
              <a
                href="/agenda"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Agendar <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-light-bg to-white p-8 rounded-3xl text-center border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Microscope className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                Avaliação
              </h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Exame detalhado e planejamento personalizado do tratamento
              </p>
              <div className="text-3xl font-bold text-primary mb-2">R$ 150</div>
              <div className="text-sm text-text-secondary mb-4">45 minutos</div>
              <a
                href="/agenda"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Agendar <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-light-bg to-white p-8 rounded-3xl text-center border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                Limpeza
              </h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Higienização profissional completa com tecnologia avançada
              </p>
              <div className="text-3xl font-bold text-primary mb-2">R$ 200</div>
              <div className="text-sm text-text-secondary mb-4">60 minutos</div>
              <a
                href="/agenda"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Agendar <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-hero-bg to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-40"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-dm-serif font-bold text-white mb-6">
            Pronto para transformar seu sorriso?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Agende sua consulta hoje mesmo e descubra como podemos ajudar você a
            ter uma saúde bucal perfeita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/agenda"
              className="group inline-flex items-center justify-center px-10 py-5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
            >
              Agendar Consulta
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contato"
              className="group inline-flex items-center justify-center px-10 py-5 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Falar Conosco
            </a>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <a
          href="/agenda"
          className="group flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-110"
        >
          <Stethoscope className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </a>
      </div>
    </div>
  );
}
