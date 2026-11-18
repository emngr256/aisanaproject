import { z } from 'zod';
export const inputSchema = z.object({ text: z.string().trim().min(15, 'Опиши ситуацию чуть подробнее — хотя бы 15 символов.').max(3000), mood: z.number().int().min(1).max(5), sleep: z.number().min(0).max(16), activity: z.number().min(0).max(300), workload: z.number().min(0).max(16) });
export type EntryInput = z.infer<typeof inputSchema>;
export const analysisSchema = z.object({ score: z.number().int().min(1).max(10), title: z.string().min(1).max(100), summary: z.string().min(1).max(1200), emotions: z.array(z.string().max(60)).min(1).max(5), triggers: z.array(z.string().max(200)).min(1).max(5), recommendations: z.array(z.object({ title: z.string().max(100), detail: z.string().max(700) })).min(1).max(4), source: z.enum(['demo', 'ai', 'local']) });
export type Analysis = z.infer<typeof analysisSchema>;
export type Entry = EntryInput & { id: string; createdAt: string; analysis: Analysis; sample?: boolean; clarifications?: string[] };
export function demoAnalyze(input: EntryInput): Analysis {
  const text = input.text.toLowerCase();
  const deadline = /дедлайн|экзамен|сесси|контрольн|зач[её]т|срок|deadline|exam|test|assessment|емтихан|мерзім|бақылау/.test(text);
  const avoid = /откладыв|прокраст|не могу начать|телефон|соцсет/.test(text);
  const tired = /устал|вымот|не высыпа|недосып/.test(text) || input.sleep < 6;
  const score = Math.max(1, Math.min(10, Math.round((6 - input.mood) * 1.35 + (input.sleep < 6 ? 1 : 0) + (input.workload > 7 ? 1 : 0) + (deadline ? 1 : 0))));
  const triggers = [deadline && 'Приближающиеся сроки и проверка знаний', avoid && 'Трудно приступить к большой или неясной задаче', tired && 'Недостаточно времени на восстановление', input.workload > 7 && 'Плотная учебная нагрузка'].filter(Boolean) as string[];
  return { score, source: 'demo', title: score >= 7 ? 'Похоже, накопилась нагрузка' : avoid ? 'Начать бывает сложнее всего' : score >= 4 ? 'Сейчас важно сохранить баланс' : 'Кажется, ты в своём ритме', summary: 'Это демонстрационный разбор по самооценке, параметрам дня и ключевым словам. Он помогает заметить возможные закономерности, но может не учитывать контекст твоей ситуации.', emotions: score >= 7 ? ['Напряжение', tired ? 'Усталость' : 'Беспокойство'] : avoid ? ['Неуверенность', 'Напряжение'] : score >= 4 ? ['Беспокойство', 'Надежда'] : ['Спокойствие', 'Уверенность'], triggers: triggers.length ? triggers : ['Повседневные учебные задачи и текущий ритм дня'], recommendations: [
    { title: avoid ? 'Начни с пяти минут' : deadline ? 'Выбери одну главную задачу' : 'Запланируй небольшой шаг', detail: avoid ? 'Открой нужный файл и запиши первый пункт. Через пять минут реши, готов ли продолжить.' : 'Выпиши задачи на сегодня и выбери одну посильную. Раздели её на конкретные действия.' },
    { title: tired ? 'Освободи время для отдыха' : 'Сделай паузу без экрана', detail: tired ? 'Подумай, какую необязательную задачу можно перенести, чтобы сегодня лечь в удобное для тебя время.' : 'Отойди от рабочего места на несколько минут. Пройдись, посмотри в окно или выпей воды.' },
    { title: score >= 7 ? 'Обсуди нагрузку с человеком, которому доверяешь' : 'Заметь, что уже получилось', detail: score >= 7 ? 'Можно попросить одногруппника помочь с темой или обсудить сроки с преподавателем.' : 'Запиши один завершённый шаг. Завтра вернись к дневнику и сравни своё состояние.' }
  ] };
}
export function makeSamples(): Entry[] {
  const scenarios = [
    ['Много заданий и скоро экзамен. Устал и переживаю, что не успею подготовиться.', 2, 5.5, 15, 9],
    ['Готовлюсь к контрольной. План помогает, но пока чувствую напряжение.', 3, 6, 20, 7],
    ['Снова откладываю курсовую и отвлекаюсь на телефон. Не могу начать.', 2, 6.5, 10, 8],
    ['Разобрал сложную тему с одногруппником. Стало спокойнее и понятнее.', 4, 7, 40, 5],
    ['Сегодня много занятий. Немного устал, но выполнил основную часть плана.', 3, 6.5, 25, 7],
    ['Хорошо выспался, погулял и закончил задание. Доволен этим днём.', 4, 8, 50, 4],
    ['Удалось распределить задания и оставить время на отдых. Чувствую себя спокойно.', 4, 7.5, 35, 5]
  ] as const;
  return scenarios.map(([text, mood, sleep, activity, workload], i) => { const day = new Date(); day.setDate(day.getDate() - 6 + i); day.setHours(18, 0, 0, 0); const input = { text, mood, sleep, activity, workload }; return { ...input, id: `sample-${i}`, createdAt: day.toISOString(), analysis: demoAnalyze(input), sample: true }; });
}
