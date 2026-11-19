import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# 1. Initialize Presentation with 16:9 widescreen layout
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]  # Blank slide

# 2. Color Palette (StudyFlow Light Theme)
BG_COLOR = RGBColor(250, 249, 252)       # #FAF9FC (Soft lavender off-white)
WHITE = RGBColor(255, 255, 255)          # #FFFFFF
BORDER_COLOR = RGBColor(238, 230, 243)   # #EEE6F3 (Soft lavender border)
INK = RGBColor(53, 51, 66)               # #353342 (Dark charcoal text)
HEADING_COLOR = RGBColor(85, 67, 99)     # #554363 (Plum charcoal)
PURPLE = RGBColor(140, 117, 180)         # #8C75B4 (Primary accent)
PURPLE_DARK = RGBColor(114, 91, 158)     # #725B9E
MUTED = RGBColor(130, 117, 142)          # #82758E (Secondary text)
LAVENDER = RGBColor(241, 237, 247)       # #F1EDF7 (Pill background)
GREEN_BG = RGBColor(239, 244, 235)       # #EFF4EB
GREEN_TEXT = RGBColor(108, 137, 100)     # #6C8964
PEACH_BG = RGBColor(252, 240, 231)       # #FCF0E7
PEACH_TEXT = RGBColor(182, 125, 84)      # #B67D54
FRAME_BG = RGBColor(247, 244, 250)       # #F7F4FA

IMG_DIR = os.path.join(os.path.dirname(__file__), "public", "presentation")

def set_slide_background(slide):
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = BG_COLOR
    bg_shape.line.fill.background()

def add_header(slide, tag_text, category_text, slide_num):
    # Top banner bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.85))
    bar.fill.solid()
    bar.fill.fore_color.rgb = WHITE
    bar.line.color.rgb = BORDER_COLOR
    bar.line.width = Pt(1)

    # Logo Mark
    mark = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.18), Inches(0.48), Inches(0.48))
    mark.fill.solid()
    mark.fill.fore_color.rgb = LAVENDER
    mark.line.color.rgb = BORDER_COLOR
    tf = mark.text_frame
    tf.margin_top = tf.margin_bottom = tf.margin_left = tf.margin_right = 0
    p = tf.paragraphs[0]
    p.text = "🌸"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(14)

    # Brand Title
    title_box = slide.shapes.add_textbox(Inches(1.2), Inches(0.12), Inches(3.5), Inches(0.6))
    tf2 = title_box.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    r1 = p2.add_run()
    r1.text = "studyflow"
    r1.font.bold = True
    r1.font.size = Pt(17)
    r1.font.color.rgb = HEADING_COLOR
    r2 = p2.add_run()
    r2.text = "."
    r2.font.bold = True
    r2.font.size = Pt(17)
    r2.font.color.rgb = PURPLE

    p_sub = tf2.add_paragraph()
    p_sub.text = "учёба в твоём ритме"
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = MUTED

    # Tag Badge
    tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(0.24), Inches(4.6), Inches(0.38))
    tag.fill.solid()
    tag.fill.fore_color.rgb = LAVENDER
    tag.line.color.rgb = BORDER_COLOR
    tag_tf = tag.text_frame
    tag_tf.margin_top = tag_tf.margin_bottom = tag_tf.margin_left = tag_tf.margin_right = 0
    p_tag = tag_tf.paragraphs[0]
    p_tag.text = tag_text
    p_tag.alignment = PP_ALIGN.CENTER
    p_tag.font.bold = True
    p_tag.font.size = Pt(10)
    p_tag.font.color.rgb = PURPLE

    # Category / Slide Counter
    counter_box = slide.shapes.add_textbox(Inches(9.8), Inches(0.18), Inches(2.9), Inches(0.5))
    c_tf = counter_box.text_frame
    p_c = c_tf.paragraphs[0]
    p_c.alignment = PP_ALIGN.RIGHT
    r_cat = p_c.add_run()
    r_cat.text = category_text + "  |  "
    r_cat.font.size = Pt(10)
    r_cat.font.color.rgb = MUTED
    r_num = p_c.add_run()
    r_num.text = f"Слайд {slide_num:02d} / 06"
    r_num.font.bold = True
    r_num.font.size = Pt(10.5)
    r_num.font.color.rgb = PURPLE

def add_footer(slide, slide_num):
    # Subtle footer line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(7.05), Inches(12.133), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_COLOR
    line.line.fill.background()

    f_box = slide.shapes.add_textbox(Inches(0.6), Inches(7.08), Inches(8.0), Inches(0.35))
    f_tf = f_box.text_frame
    p_f = f_tf.paragraphs[0]
    p_f.text = "StudyFlow — Интеллектуальный веб-ассистент академического баланса студентов"
    p_f.font.size = Pt(9)
    p_f.font.color.rgb = MUTED

    num_box = slide.shapes.add_textbox(Inches(10.0), Inches(7.08), Inches(2.733), Inches(0.35))
    n_tf = num_box.text_frame
    p_n = n_tf.paragraphs[0]
    p_n.alignment = PP_ALIGN.RIGHT
    p_n.text = f"Презентация для экспертной комиссии · Слайд {slide_num}"
    p_n.font.size = Pt(9)
    p_n.font.color.rgb = MUTED

def add_card(slide, left, top, width, height, bg_color=WHITE, border_color=BORDER_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)
    return card

def add_mockup_image(slide, img_path, left, top, width, height, caption=None):
    # Container box with frame bar
    container = add_card(slide, left, top, width, height, bg_color=WHITE)
    
    # Browser bar at top of mockup
    bar_height = Inches(0.32)
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, bar_height)
    bar.fill.solid()
    bar.fill.fore_color.rgb = FRAME_BG
    bar.line.color.rgb = BORDER_COLOR
    bar.line.width = Pt(1)

    # 3 Mac dots
    dot_colors = [RGBColor(248, 113, 113), RGBColor(251, 191, 36), RGBColor(52, 211, 153)]
    for i, col in enumerate(dot_colors):
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.15 + i*0.14), top + Inches(0.1), Inches(0.1), Inches(0.1))
        dot.fill.solid()
        dot.fill.fore_color.rgb = col
        dot.line.fill.background()

    # Image itself
    img_top = top + bar_height + Inches(0.06)
    img_height = height - bar_height - Inches(0.12)
    img_left = left + Inches(0.06)
    img_width = width - Inches(0.12)
    
    slide.shapes.add_picture(img_path, img_left, img_top, img_width, img_height)

    if caption:
        c_box = slide.shapes.add_textbox(left, top + height + Inches(0.06), width, Inches(0.3))
        c_tf = c_box.text_frame
        p_c = c_tf.paragraphs[0]
        p_c.alignment = PP_ALIGN.CENTER
        p_c.text = caption
        p_c.font.size = Pt(8.5)
        p_c.font.color.rgb = MUTED

# ==========================================
# SLIDE 1: ТИТУЛЬНЫЙ / КОНЦЕПЦИЯ
# ==========================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1)
add_header(s1, "СЛАЙД 01 · КОНЦЕПЦИЯ И АКТУАЛЬНОСТЬ", "Введение & Позиционирование", 1)
add_footer(s1, 1)

# Left Column (Content)
left_card = add_card(s1, Inches(0.6), Inches(1.15), Inches(5.4), Inches(5.6))
ltf = left_card.text_frame
ltf.word_wrap = True
ltf.margin_left = Inches(0.35)
ltf.margin_right = Inches(0.35)
ltf.margin_top = Inches(0.35)

p = ltf.paragraphs[0]
p.text = "ПРОСТРАНСТВО ОСОЗНАННОЙ УЧЁБЫ"
p.font.bold = True
p.font.size = Pt(9.5)
p.font.color.rgb = PURPLE

p_h = ltf.add_paragraph()
p_h.text = "StudyFlow — учёба в твоём ритме"
p_h.font.bold = True
p_h.font.size = Pt(22)
p_h.font.color.rgb = HEADING_COLOR
p_h.space_before = Pt(6)
p_h.space_after = Pt(8)

p_desc = ltf.add_paragraph()
p_desc.text = "Веб-сервис предиктивного мониторинга академического стресса и профилактики выгорания студентов с локальным машинным интеллектом."
p_desc.font.size = Pt(11)
p_desc.font.color.rgb = MUTED
p_desc.space_after = Pt(16)

# Key points cards inside left column
features = [
    ("Проблема студенческого выгорания", "До 68% студентов испытывают острый стресс перед дедлайнами и сессиями, что приводит к прокрастинации и срыву режима."),
    ("Решение StudyFlow", "Ежедневный 60-секундный чекап, выявление скрытых триггеров на основе локального ML и тактика посильных микро-шагов."),
    ("Принцип Privacy-First", "Полная конфиденциальность: текстовый анализ дневника выполняется на устройстве студента без передачи в публичные LLM-сети.")
]

for title, desc in features:
    p_t = ltf.add_paragraph()
    p_t.text = "• " + title
    p_t.font.bold = True
    p_t.font.size = Pt(11)
    p_t.font.color.rgb = HEADING_COLOR
    p_t.space_before = Pt(8)
    
    p_d = ltf.add_paragraph()
    p_d.text = "   " + desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = MUTED

# Right Column (Screenshot)
img1 = os.path.join(IMG_DIR, "slide1_hero.png")
add_mockup_image(s1, img1, Inches(6.3), Inches(1.15), Inches(6.4), Inches(5.3), "Рис. 1: Главный экран сервиса — эстетичный интерфейс, снижающий когнитивную тревожность.")

# ==========================================
# SLIDE 2: СБОР ДАННЫХ И UX ДНЕВНИКА
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
set_slide_background(s2)
add_header(s2, "СЛАЙД 02 · СБОР ДАННЫХ И ЭРГОНОМИКА UX", "Пользовательский опыт", 2)
add_footer(s2, 2)

left_card2 = add_card(s2, Inches(0.6), Inches(1.15), Inches(7.4), Inches(5.6))
ltf2 = left_card2.text_frame
ltf2.word_wrap = True
ltf2.margin_left = Inches(0.35)
ltf2.margin_right = Inches(0.35)
ltf2.margin_top = Inches(0.35)

p = ltf2.paragraphs[0]
p.text = "МУЛЬТИМОДАЛЬНЫЙ ЭКСПРЕСС-ЧЕКАП"
p.font.bold = True
p.font.size = Pt(9.5)
p.font.color.rgb = PURPLE

p_h = ltf2.add_paragraph()
p_h.text = "Быстрая фиксация качественных и количественных данных"
p_h.font.bold = True
p_h.font.size = Pt(19)
p_h.font.color.rgb = HEADING_COLOR
p_h.space_before = Pt(4)
p_h.space_after = Pt(8)

p_desc = ltf2.add_paragraph()
p_desc.text = "Форма оптимизирована под минимальную когнитивную нагрузку: заполнение занимает до 90 секунд и не требует усилий."
p_desc.font.size = Pt(11)
p_desc.font.color.rgb = MUTED
p_desc.space_after = Pt(14)

points_s2 = [
    ("5-позиционная шкала эмоций", "Интуитивные смайлы от «Очень тяжело» до «Отлично» для мгновенной эмоциональной самоидентификации."),
    ("Свободная рефлексия (до 3000 символов)", "Поле ввода для описания задач, переживаний и контекста дня на русском, казахском или английском языке."),
    ("Физиологические маркеры нагрузки", "Высокоточные слайдеры: продолжительность сна (0–16 ч), физическая активность (0–180 мин) и время на учёбу (0–16 ч)."),
    ("Адаптивная тональность помощника", "Выбор психологического режима: «Мягко» (эмпатия), «По делу» (структурированный план) или «Как тренер» (мотивация)."),
    ("Smart-валидация и детектор противоречий", "Алгоритм автоматически сопоставляет текст и цифры (например, жалоба на бессонницу при 8 ч сна) и уточняет данные перед сохранением.")
]

for title, desc in points_s2:
    p_t = ltf2.add_paragraph()
    p_t.text = "✓ " + title
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = HEADING_COLOR
    p_t.space_before = Pt(6)
    
    p_d = ltf2.add_paragraph()
    p_d.text = "    " + desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = MUTED

img2 = os.path.join(IMG_DIR, "slide2_diary.png")
add_mockup_image(s2, img2, Inches(8.3), Inches(1.15), Inches(4.4), Inches(5.3), "Рис. 2: Модальное окно дневника — простой ввод без перегрузки.")

# ==========================================
# SLIDE 3: ЛОКАЛЬНЫЙ ML И АНАЛИЗ
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
set_slide_background(s3)
add_header(s3, "СЛАЙД 03 · АЛГОРИТМИЧЕСКОЕ ЯДРО (EDGE AI)", "Локальный классификатор", 3)
add_footer(s3, 3)

left_card3 = add_card(s3, Inches(0.6), Inches(1.15), Inches(7.4), Inches(5.6))
ltf3 = left_card3.text_frame
ltf3.word_wrap = True
ltf3.margin_left = Inches(0.35)
ltf3.margin_right = Inches(0.35)
ltf3.margin_top = Inches(0.35)

p = ltf3.paragraphs[0]
p.text = "EDGE COMPUTING & BROWSER NLP"
p.font.bold = True
p.font.size = Pt(9.5)
p.font.color.rgb = PURPLE

p_h = ltf3.add_paragraph()
p_h.text = "Локальная ML-модель: классификация и расчёт индекса"
p_h.font.bold = True
p_h.font.size = Pt(19)
p_h.font.color.rgb = HEADING_COLOR
p_h.space_before = Pt(4)
p_h.space_after = Pt(8)

p_desc = ltf3.add_paragraph()
p_desc.text = "Вся аналитика текста выполняется на клиенте. Обученные веса входят в JS-бандл, исключая внешние API-запросы и утечку данных."
p_desc.font.size = Pt(11)
p_desc.font.color.rgb = MUTED
p_desc.space_after = Pt(12)

points_s3 = [
    ("Модель Multinomial Naive Bayes", "Мультиязычная n-gram токенизация (префиксы слов и биграммы), устойчивая к опечаткам и студенческому сленгу."),
    ("5 классов психоэмоционального состояния", "Волнение перед сдачей, откладывание задач (прокрастинация), хроническая усталость, академическая перегрузка и баланс."),
    ("Объективный условный индекс нагрузки (1–10)", "Прозрачная формула объединяет самооценку, дефицит сна (<7 ч), аномальную учёбу (>8 ч), дефицит движения и семантический вес стрессоров."),
    ("Мгновенный отклик и офлайн-режим", "Время инференса менее 15 мс прямо в браузере; сайт полноценно анализирует записи даже без интернет-соединения."),
    ("Экономическая эффективность", "Нулевая себестоимость вычислений — проект не требует оплаты токенов коммерческих LLM при масштабировании на тысячи студентов.")
]

for title, desc in points_s3:
    p_t = ltf3.add_paragraph()
    p_t.text = "⚡ " + title
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = HEADING_COLOR
    p_t.space_before = Pt(6)
    
    p_d = ltf3.add_paragraph()
    p_d.text = "    " + desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = MUTED

img3 = os.path.join(IMG_DIR, "slide3_ml_analysis.png")
add_mockup_image(s3, img3, Inches(8.3), Inches(1.15), Inches(4.4), Inches(5.3), "Рис. 3: Результат локального разбора — индекс 3/10, теги и рекомендации.")

# ==========================================
# SLIDE 4: АНАЛИТИКА И ДИНАМИКА
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
set_slide_background(s4)
add_header(s4, "СЛАЙД 04 · МОНИТОРИНГ ДИНАМИКИ И ТРЕНДОВ", "Продольный анализ", 4)
add_footer(s4, 4)

left_card4 = add_card(s4, Inches(0.6), Inches(1.15), Inches(5.4), Inches(5.6))
ltf4 = left_card4.text_frame
ltf4.word_wrap = True
ltf4.margin_left = Inches(0.35)
ltf4.margin_right = Inches(0.35)
ltf4.margin_top = Inches(0.35)

p = ltf4.paragraphs[0]
p.text = "ЛОНГИТЮДНЫЙ ТРЕКИНГ СОСТОЯНИЯ"
p.font.bold = True
p.font.size = Pt(9.5)
p.font.color.rgb = PURPLE

p_h = ltf4.add_paragraph()
p_h.text = "Аналитический дашборд: видимый прогресс студента"
p_h.font.bold = True
p_h.font.size = Pt(20)
p_h.font.color.rgb = HEADING_COLOR
p_h.space_before = Pt(4)
p_h.space_after = Pt(8)

p_desc = ltf4.add_paragraph()
p_desc.text = "Перевод субъективных эмоций в наглядные тренды. Студент видит, как соблюдение режима сна напрямую снимает ощущение академического тупика."
p_desc.font.size = Pt(11)
p_desc.font.color.rgb = MUTED
p_desc.space_after = Pt(14)

points_s4 = [
    ("Интерактивная кривая стресса", "График динамики «Твой ритм за неделю» сглаживает кратковременные колебания и фиксирует реальный тренд (падение индекса с 8 до 3 баллов)."),
    ("Агрегированные показатели", "Автоматический подсчёт средних значений сна (6.7 ч), числа записей и общей дельты стресса (-5 пунктов за период наблюдения)."),
    ("Карточка «Фокус на сегодня»", "Антидот против паралича решений: рекомендация сосредоточиться всего на одной посильной задаче освобождает когнитивный ресурс."),
    ("Психологическое подкрепление", "Визуализация позитивных сдвигов формирует чувство устойчивости и веру в успешное прохождение учебного семестра.")
]

for title, desc in points_s4:
    p_t = ltf4.add_paragraph()
    p_t.text = "📈 " + title
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = HEADING_COLOR
    p_t.space_before = Pt(6)
    
    p_d = ltf4.add_paragraph()
    p_d.text = "    " + desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = MUTED

img4 = os.path.join(IMG_DIR, "slide4_dashboard.png")
add_mockup_image(s4, img4, Inches(6.3), Inches(1.15), Inches(6.4), Inches(5.3), "Рис. 4: Недельный дашборд — объективное снижение стресса на 5 пунктов.")

# ==========================================
# SLIDE 5: ПОВЕДЕНЧЕСКАЯ ПОДДЕРЖКА
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
set_slide_background(s5)
add_header(s5, "СЛАЙД 05 · ПОВЕДЕНЧЕСКАЯ ПОДДЕРЖКА И ИНТЕРВЕНЦИИ", "Практика микро-шагов", 5)
add_footer(s5, 5)

left_card5 = add_card(s5, Inches(0.6), Inches(1.15), Inches(6.2), Inches(5.6))
ltf5 = left_card5.text_frame
ltf5.word_wrap = True
ltf5.margin_left = Inches(0.35)
ltf5.margin_right = Inches(0.35)
ltf5.margin_top = Inches(0.35)

p = ltf5.paragraphs[0]
p.text = "МИКРО-ИНТЕРВЕНЦИИ И ПСИХОГИГИЕНА"
p.font.bold = True
p.font.size = Pt(9.5)
p.font.color.rgb = PURPLE

p_h = ltf5.add_paragraph()
p_h.text = "«Твоя опора на сегодня»: персональные рекомендации"
p_h.font.bold = True
p_h.font.size = Pt(19)
p_h.font.color.rgb = HEADING_COLOR
p_h.space_before = Pt(4)
p_h.space_after = Pt(8)

p_desc = ltf5.add_paragraph()
p_desc.text = "Вместо общих абстрактных лозунгов сервис формирует ровно 3 прикладных действия, основанных на когнитивно-поведенческой терапии (CBT)."
p_desc.font.size = Pt(11)
p_desc.font.color.rgb = MUTED
p_desc.space_after = Pt(14)

points_s5 = [
    ("1. Запланируй небольшой шаг (Micro-stepping)", "Декомпозиция масштабной учебной задачи на элементарное 15-минутное действие снимает страх перед началом работы."),
    ("2. Сделай паузу без экрана (Digital Detox)", "Короткая смена обстановки и отдых для зрительного анализатора снижают сенсорную перегрузку и нормализуют дофамин."),
    ("3. Заметь, что уже получилось (Positive Reinforcement)", "Фиксация завершённого микро-результата включает внутреннюю мотивацию и подкрепляет веру в свои силы."),
    ("Экспорт и интеграция с кураторами", "Студент может в 1 клик выгрузить структурированный недельный отчёт в TXT/JSON для консультации со школьным или вузовским психологом.")
]

for title, desc in points_s5:
    p_t = ltf5.add_paragraph()
    p_t.text = "🌱 " + title
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = HEADING_COLOR
    p_t.space_before = Pt(6)
    
    p_d = ltf5.add_paragraph()
    p_d.text = "    " + desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = MUTED

img5 = os.path.join(IMG_DIR, "slide5_recommendations.png")
add_mockup_image(s5, img5, Inches(7.1), Inches(1.7), Inches(5.6), Inches(4.2), "Рис. 5: Модуль «Твоя опора на сегодня» — прикладные шаги психоэмоциональной поддержки.")

# ==========================================
# SLIDE 6: АРХИТЕКТУРА И СТЕК
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
set_slide_background(s6)
add_header(s6, "СЛАЙД 06 · АРХИТЕКТУРА, СТЕК И БЕЗОПАСНОСТЬ", "Техническая зрелость", 6)
add_footer(s6, 6)

# Main Title text
top_box = s6.shapes.add_textbox(Inches(0.6), Inches(1.05), Inches(12.133), Inches(0.9))
t_tf = top_box.text_frame
t_tf.word_wrap = True
p1 = t_tf.paragraphs[0]
p1.text = "ТЕХНОЛОГИЧЕСКАЯ ПЛАТФОРМА И ПЕРСПЕКТИВЫ ВНЕДРЕНИЯ"
p1.font.bold = True
p1.font.size = Pt(9.5)
p1.font.color.rgb = PURPLE

p2 = t_tf.add_paragraph()
p2.text = "Гибридный enterprise-стек, бескомпромиссная безопасность и масштабируемость"
p2.font.bold = True
p2.font.size = Pt(20)
p2.font.color.rgb = HEADING_COLOR

# 3 Pillars Cards
col_width = Inches(3.88)
col_gap = Inches(0.24)
start_left = Inches(0.6)
top_y = Inches(2.05)
card_h = Inches(3.3)

pillars = [
    ("Frontend & Edge ML", [
        ("Next.js 16 (App Router)", "Серверный рендеринг и оптимизация клиентских компонентов."),
        ("TypeScript & React 19", "Строгая типизация без единой ошибки сборки."),
        ("Client-side ML-движок", "Инференс Naive Bayes непосредственно в браузере студента."),
        ("Zustand & LocalStorage", "Offline-first кэширование и мгновенное сохранение записей.")
    ]),
    ("Backend & Data Sync", [
        ("Rust / Axum Microservice", "Высокопроизводительный асинхронный API-сервис на Rust."),
        ("PostgreSQL Database", "Облачная реляционная СУБД на мощностях Render."),
        ("Двусторонняя синхронизация", "Автоматический sync локальных и облачных записей."),
        ("CI/CD & Zero-Downtime", "Автоматизированная сборка и деплой каждого коммита.")
    ]),
    ("Безопасность & Аудит", [
        ("Google OAuth 2.0", "Официальная авторизация без хранения пользовательских паролей."),
        ("HMAC-SHA256 подпись", "Криптографическая защита сессионных токенов (HttpOnly)."),
        ("Ролевая модель (Admin)", "Изолированная панель администратора для мониторинга."),
        ("22 / 22 автотеста", "100% покрытие Unit, AST-анализа переводов и ML-тестов.")
    ])
]

for idx, (p_title, p_items) in enumerate(pillars):
    c_left = start_left + idx * (col_width + col_gap)
    c_shape = add_card(s6, c_left, top_y, col_width, card_h)
    c_tf = c_shape.text_frame
    c_tf.word_wrap = True
    c_tf.margin_left = Inches(0.25)
    c_tf.margin_right = Inches(0.25)
    c_tf.margin_top = Inches(0.25)

    p = c_tf.paragraphs[0]
    p.text = p_title.upper()
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = PURPLE
    p.space_after = Pt(10)

    for item_t, item_d in p_items:
        p_it = c_tf.add_paragraph()
        p_it.text = "• " + item_t
        p_it.font.bold = True
        p_it.font.size = Pt(10)
        p_it.font.color.rgb = HEADING_COLOR
        p_it.space_before = Pt(4)

        p_id = c_tf.add_paragraph()
        p_id.text = "   " + item_d
        p_id.font.size = Pt(8.5)
        p_id.font.color.rgb = MUTED

# Bottom Banner: Potential for University Deployment
bot_card = add_card(s6, Inches(0.6), Inches(5.55), Inches(12.133), Inches(1.3), bg_color=LAVENDER)
b_tf = bot_card.text_frame
b_tf.word_wrap = True
b_tf.margin_left = Inches(0.35)
b_tf.margin_right = Inches(0.35)
b_tf.margin_top = Inches(0.2)

p_b1 = b_tf.paragraphs[0]
p_b1.text = "🚀 ПОТЕНЦИАЛ ВНЕДРЕНИЯ И ПЕРСПЕКТИВЫ РАЗВИТИЯ ДЛЯ ЭКСПЕРТНОЙ КОМИССИИ"
p_b1.font.bold = True
p_b1.font.size = Pt(10.5)
p_b1.font.color.rgb = PURPLE_DARK
p_b1.space_after = Pt(4)

p_b2 = b_tf.add_paragraph()
p_b2.text = "• Интеграция в университетские LMS (Canvas, Moodle, Platonus): встраивание чекапа без риска утечки персональных дневников.\n• Анонимизированная аналитика для факультетов: предиктивное выявление недель пикового стресса для оптимизации графика дедлайнов.\n• Нулевая стоимость масштабирования: клиентский ML позволяет обслуживать десятки тысяч учащихся без затрат на серверную инфраструктуру."
p_b2.font.size = Pt(9.2)
p_b2.font.color.rgb = INK

# Save PPTX in target locations
output_proj = os.path.join(os.path.dirname(__file__), "StudyFlow_Presentation.pptx")
output_pub = os.path.join(IMG_DIR, "StudyFlow_Presentation.pptx")
output_art = r"C:\Users\Alan\.gemini\antigravity\brain\c9f9fff9-2810-4169-9d1d-b5b4631fd46f\StudyFlow_Presentation.pptx"

prs.save(output_proj)
prs.save(output_pub)
prs.save(output_art)
print("SUCCESS: StudyFlow_Presentation.pptx created successfully in all target paths!")
