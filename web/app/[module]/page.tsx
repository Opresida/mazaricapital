'use client';
import Shell from '@/components/Shell';
import { notFound, useParams } from 'next/navigation';

const SOON: Record<string, { title: string; desc: string }> = {
  estrutura: {
    title: 'Estrutura',
    desc: 'Árvore comercial: Unidade → Diretor → Supervisor → Consultor → Cotista. Convites, transferências com vigência e motivo, ficha do membro.',
  },
  comissoes: {
    title: 'Comissões',
    desc: 'Regras versionadas (quem recebe × quem vendeu), eventos por capital confirmado, saldos e extrato imutável. Aguardando os percentuais definidos pela Presidência para ganhar vida.',
  },
  pagamentos: {
    title: 'Pagamentos',
    desc: 'Central de saques e distribuições: fila, dupla aprovação acima do limite, comprovante obrigatório para marcar como pago.',
  },
  metas: {
    title: 'Metas e prêmios',
    desc: 'Campanhas, níveis, catálogo de prêmios e ranking. Venda própria do supervisor conta na meta da equipe dele.',
  },
  auditoria: {
    title: 'Auditoria',
    desc: 'Registro permanente: quem, o quê, quando, antes → depois. Já está gravando no backend — a tela de consulta vem em breve.',
  },
  configuracoes: {
    title: 'Configurações',
    desc: 'Tabulações, canais, plano de contas, parâmetros financeiros, perfis e integrações (3C Plus, banco/PIX).',
  },
};

export default function ComingSoon() {
  const { module } = useParams<{ module: string }>();
  const info = SOON[module];
  if (!info) notFound();
  return (
    <Shell title={info.title} crumb={info.title}>
      <h1 className="h-page">{info.title}</h1>
      <div className="card empty">
        <div className="title">Módulo em construção</div>
        <p style={{ maxWidth: 560, margin: '0 auto' }}>{info.desc}</p>
      </div>
    </Shell>
  );
}
