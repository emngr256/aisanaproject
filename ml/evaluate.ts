import { classify } from '../src/lib/local-ml';
const examples=[
 ['deadline','Переживаю перед экзаменом боюсь получить плохую оценку'],
 ['avoid','Все время отвлекаюсь на телефон вместо работы над заданием'],
 ['fatigue','Хочу спать после занятий совсем нет сил'],
 ['overload','Много заданий одновременно не хватает времени на все предметы'],
 ['balance','Сегодня спокойно сделал задания и успел отдохнуть']
];
let correct=0;
for(const [expected,text] of examples){const result=classify(text);if(result.label===expected)correct++;console.log({expected,...result});}
console.log(`${correct}/${examples.length} on small synthetic holdout. Not a real-world accuracy estimate.`);
