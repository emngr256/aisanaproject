import model from './local-model.json';
import { features } from '../../ml/features';
import { demoAnalyze, type EntryInput, type Analysis } from './analysis';
const descriptions: Record<string, {title:string; trigger:string; emotion:string; action:string; detail:string}> = {
 deadline:{title:'Волнение перед проверкой знаний',trigger:'Предстоящая сдача работы или проверка знаний',emotion:'Волнение',action:'Сделай короткую репетицию',detail:'Выбери один вопрос и попробуй объяснить его своими словами. Отметь, что уже понятно и что стоит повторить.'},
 avoid:{title:'Трудно приступить к задаче',trigger:'Откладывание или частые отвлечения',emotion:'Неуверенность',action:'Уменьши первый шаг',detail:'Выбери действие на пять минут: открыть документ, написать заголовок или прочитать один абзац. Убери телефон на это время.'},
 fatigue:{title:'Возможно, тебе нужен отдых',trigger:'Ощущение усталости и недостаток восстановления',emotion:'Усталость',action:'Оставь место для восстановления',detail:'Выбери необязательную задачу, которую можно перенести. Сделай короткую паузу и оцени, есть ли силы продолжать.'},
 overload:{title:'Кажется, задач стало слишком много',trigger:'Несколько конкурирующих учебных обязанностей',emotion:'Напряжение',action:'Разгрузи список задач',detail:'Раздели дела на три группы: сегодня, позже, нужна помощь. Выбери одно главное дело и обсуди нереалистичные сроки с преподавателем.'},
 balance:{title:'Ты находишь свой ритм',trigger:'Посильная нагрузка и время на восстановление',emotion:'Спокойствие',action:'Сохрани то, что помогает',detail:'Запиши, какое действие сегодня помогло чувствовать себя лучше. Попробуй повторить его завтра.'}
};
export function classify(text:string) {
 const tokens = features(text); const vocabulary = new Set(model.vocabulary); const known = tokens.filter(t => vocabulary.has(t));
 const ranked = Object.entries(model.classes).map(([label, c]) => ({label,score:known.reduce((sum,t) => sum + Math.log(((c.counts as Record<string,number>)[t] || 0)+1) - Math.log(c.total + vocabulary.size),0)/Math.max(known.length,1)})).sort((a,b)=>b.score-a.score);
 const coverage = known.length/Math.max(tokens.length,1);
 const uncertain = known.length < 3 || coverage < .2 || ranked[0].score-ranked[1].score < .08;
 return {label:ranked[0].label, uncertain, coverage};
}
export function localAnalyze(input:EntryInput):Analysis {
 const base=demoAnalyze(input); const prediction=classify(input.text);
 if (prediction.label === 'overload' && input.workload === 0) prediction.uncertain = true;
 const chosen=descriptions[prediction.label];
 const deadline = /дедлайн|экзамен|сесси|контрольн|зач[её]т|срок|deadline|exam|test|assessment|емтихан|мерзім|бақылау/.test(input.text.toLowerCase());
 const explanation = ` Расчёт: настроение ${(6-input.mood)*1.35} + сон ${input.sleep<6?1:0} + учёба ${input.workload>7?1:0} + упоминание сроков ${deadline?1:0}; округление и ограничение до 1–10. Движение (${input.activity} мин) не входит в формулу. Это условный индекс, а не измерение объёма работы или продуктивности.${input.workload===0?' Указано 0 часов учёбы: фактическая учебная перегрузка этими данными не подтверждается. Причину отсутствия занятий нужно уточнить.':''}`;
 if (input.workload === 0) base.recommendations[2] = {title:'Проверь, была ли задача на сегодня',detail:'Если планировал учиться, выбери одно действие на пять минут и отметь факт выполнения. Если сегодня был запланирован отдых, отсутствие занятий само по себе не проблема.'};
 return {...base,source:'local',title:prediction.uncertain ? 'Давай уточним, что сейчас важнее' : chosen.title,
 summary: (prediction.uncertain ? 'Недостаточно данных для уверенного определения темы. Уточни, что произошло, какие задачи были запланированы и что помешало их выполнить.' : `Модель предполагает тему: «${chosen.title.toLowerCase()}». Обучение на ${model.examples} искусственных примерах не позволяет надёжно понимать мотивы или оценивать правдивость текста.`) + explanation,
 emotions:prediction.uncertain ? ['Нужно уточнение'] : [chosen.emotion],
 triggers:prediction.uncertain ? ['Недостаточно данных для уверенного вывода'] : [chosen.trigger],
 recommendations:prediction.uncertain ? [{title:'Уточни ситуацию',detail:'Опиши один конкретный момент: что произошло, что ты почувствовал и что хотелось бы изменить.'},...base.recommendations.slice(1)] : [{title:chosen.action,detail:chosen.detail},...base.recommendations.slice(1)]};
}
