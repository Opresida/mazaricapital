'use client';
// Login do PORTAL = componente canônico aprovado no Claude Design
// (design/components/MazariLogin.tsx, animação "Fundação" 1b), agora
// plugado na autenticação REAL da API via onLogin — exatamente o plano
// registrado em ARCHITECTURE.md. O /login do SITE continua sendo vitrine.
// Modo DEMO não precisa de login: basta acessar o portal direto.
import { useRouter } from 'next/navigation';
import MazariLogin from '@/components/MazariLogin';
import { login } from '@/lib/api';
import { useDataMode } from '@/lib/data-mode';

export default function LoginPage() {
  const router = useRouter();
  const { setMode } = useDataMode();

  return (
    <MazariLogin
      onLogin={async ({ email, password }) => {
        await login(email, password);
        setMode('real');
        router.push('/');
      }}
      forgotHref="https://mazaricapital.vercel.app/#contato"
      firstAccessHref="https://mazaricapital.vercel.app/#contato"
    />
  );
}
