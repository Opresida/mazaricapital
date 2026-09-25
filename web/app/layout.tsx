import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { DataModeProvider } from '@/lib/data-mode';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600'] });
// Fontes oficiais (definição de Humberto, 2026-09-26):
// Space Grotesk 400/500/600 — títulos, números importantes, valores financeiros
// Inter 400/500/600 — textos, tabelas, menus e botões
// JetBrains Mono 400/500 — rótulos técnicos em caixa alta, códigos, metadados
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', weight: ['400', '500', '600'] });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'MAZARI COMMAND',
  description: 'MAZARI CAPITAL — portal de gestão',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Extensões de navegador (ex.: LanguageTool injeta data-lt-installed)
    // alteram o <html> antes da hidratação; suprime só neste elemento.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} ${jbmono.variable}`}>
        <DataModeProvider>{children}</DataModeProvider>
      </body>
    </html>
  );
}
