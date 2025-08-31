import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {displayDescription}
        </p>

        <div className="text-sm text-gray-700 font-medium">
          Preço: {brl.format(priceCents / 100)} • Duração:{" "}
          {durationLabel(durationMin)}
        </div>

        <Button asChild className="w-full rounded-xl">
          <Link href={`/servicos/${slug}`}>Ver detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
