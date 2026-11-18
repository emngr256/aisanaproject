import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Aisana — учёба в твоём ритме', description: 'Дневник учебного состояния: замечай эмоции, находи баланс и отслеживай прогресс.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
