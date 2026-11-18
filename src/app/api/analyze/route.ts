import { localAnalyze } from '@/lib/local-ml';
import { NextResponse } from 'next/server';
import { inputSchema, analysisSchema, demoAnalyze } from '@/lib/analysis';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length')) > 20000) return NextResponse.json({ error: 'Слишком большой запрос.' }, { status: 413 });
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Проверь текст и параметры дня.' }, { status: 400 });
    if (process.env.RUST_API_URL) {
      const response = await fetch(`${process.env.RUST_API_URL}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error('AI service unavailable');
      const analysis = analysisSchema.parse(await response.json());
      return NextResponse.json(analysis);
    }
    return NextResponse.json(localAnalyze(parsed.data));
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить анализ. Запись формы сохранена на экране — попробуй ещё раз.' }, { status: 503 });
  }
}
