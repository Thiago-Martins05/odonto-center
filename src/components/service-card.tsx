import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ArrowRight, Star, Calendar } from "lucide-react";
import { brl, durationLabel } from "@/lib/format";

interface ServiceCardProps {
  slug: string;
  name: string;
  description?: string | null;
  priceCents: number;
  durationMin: number;
}

export function ServiceCard({
  slug,
  name,
  description,
  priceCents,
  durationMin,
}: ServiceCardProps) {
  const fallbackDescription =
    "Atendimento realizado por profissionais qualificados.";
  const displayDescription = description || fallbackDescription;

  return (
    <Card className="group rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 border-0 bg-white h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Ativo
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{durationLabel(durationMin)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium">{brl.format(priceCents / 100)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pb-6">
        <div className="flex-1 space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {displayDescription}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>Profissional especializado</span>
            </div>
            <span>•</span>
            <span>Equipamentos modernos</span>
          </div>
        </div>

        {/* Botões sempre na parte inferior */}
        <div className="pt-6 space-y-3 mt-auto">
          {/* Botão principal - Ver detalhes */}
          <Button
            asChild
            className="w-full rounded-xl group-hover:bg-blue-600 transition-colors"
          >
            <Link
              href={`/servicos/${slug}`}
              className="flex items-center gap-2"
            >
              Ver detalhes completos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* Botão secundário - Agendar diretamente */}
          <Button
            variant="outline"
            asChild
            className="w-full rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Link
              href={`/agenda?service=${slug}`}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Agendar diretamente
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
