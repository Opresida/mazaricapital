import { redirect } from 'next/navigation';

// A página completa da operação vive em /operacoes/[code] (Mapa de Telas
// separa Oportunidades = captação de Operações = prontuário).
export default async function LegacyOpportunityDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/operacoes/${code}`);
}
