import { Metadata } from "next";
import { getServiceBySlug } from "@/server/admin/services";

interface ServiceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ServiceLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Serviço não encontrado | Odonto Center",
      description: "O serviço solicitado não foi encontrado.",
    };
  }

  return {
    title: `${service.name} | Odonto Center`,
    description:
      service.description ||
      `Saiba mais sobre ${service.name} e agende sua consulta.`,
    keywords: [
      service.name.toLowerCase(),
      "odontologia",
      "consulta",
      "tratamento",
      "agendamento",
      "saúde bucal",
    ],
    openGraph: {
      title: `${service.name} | Odonto Center`,
      description:
        service.description ||
        `Saiba mais sobre ${service.name} e agende sua consulta.`,
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary",
      title: `${service.name} | Odonto Center`,
      description:
        service.description ||
        `Saiba mais sobre ${service.name} e agende sua consulta.`,
    },
  };
}

export default function ServiceLayout({ children }: ServiceLayoutProps) {
  return children;
}
