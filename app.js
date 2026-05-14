/* ===== COMBINATORICS APP — app.js ===== */

/* ─── Factorial helper ─── */
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/* ─── Format large numbers with spaces ─── */
function fmt(n) {
  return n.toLocaleString('bg-BG');
}

/* ══════════════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════════════ */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + target);
    panel.classList.add('active');
    panel.hidden = false;
  });
});

/* ══════════════════════════════════════════
   CALCULATOR
══════════════════════════════════════════ */
let currentMode = 'P';
const calcHistory = [];

const modeBtns     = document.querySelectorAll('.mode-btn');
const formulaText  = document.getElementById('formula-text');
const defBox       = document.getElementById('calc-definition');
const kField       = document.getElementById('k-field');
const inpN         = document.getElementById('inp-n');
const inpK         = document.getElementById('inp-k');
const calcGoBtn    = document.getElementById('calc-go');
const resultLabel  = document.getElementById('result-label');
const resultNumber = document.getElementById('result-number');
const resultReading= document.getElementById('result-reading');
const stepsToggle  = document.getElementById('steps-toggle');
const stepsBody    = document.getElementById('steps-body');
const stepsList    = document.getElementById('steps-list');
const stepsChevron = document.getElementById('steps-chevron');
const historyList  = document.getElementById('history-list');

const MODE_META = {
  P: {
    formula: 'P(n) = n!',
    def: 'Наредби на <strong>всички n елемента</strong> — редът има значение, всеки елемент се използва точно веднъж.',
    hasK: false,
  },
  C: {
    formula: 'C(n, k) = n! / (k! · (n−k)!)',
    def: 'Избор на <strong>k елемента от n</strong> — редът <em>няма</em> значение; важно е само кои са избрани.',
    hasK: true,
  },
  V: {
    formula: 'V(n, k) = n! / (n−k)!',
    def: 'Наредби на <strong>k елемента от n</strong> — редът <em>има</em> значение; избираме само k от всичките n.',
    hasK: true,
  },
};

function setMode(mode) {
  currentMode = mode;
  const meta = MODE_META[mode];
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  formulaText.textContent = meta.formula;
  defBox.innerHTML = meta.def;
  kField.style.display = meta.hasK ? '' : 'none';
}

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

/* ─── Steps generation ─── */
function buildSteps(mode, n, k, result) {
  const steps = [];

  if (mode === 'P') {
    steps.push(`Записваме формулата: <code>P(${n}) = ${n}!</code>`);
    if (n <= 1) {
      steps.push(`По дефиниция: <code>${n}! = ${factorial(n)}</code>`);
    } else {
      const seq = Array.from({length: n}, (_, i) => n - i).join(' × ');
      steps.push(`Разписваме факториела: <code>${n}! = ${seq}</code>`);
      steps.push(`Пресмятаме: <code>${seq} = ${fmt(result)}</code>`);
    }
  }

  if (mode === 'C') {
    steps.push(`Записваме формулата: <code>C(${n},${k}) = ${n}! / (${k}! · ${n-k}!)</code>`);
    steps.push(`Пресмятаме числителя: <code>${n}! = ${fmt(factorial(n))}</code>`);
    steps.push(`Пресмятаме знаменателя: <code>${k}! = ${fmt(factorial(k))}</code>, <code>${n-k}! = ${fmt(factorial(n-k))}</code>`);
    steps.push(`Знаменател: <code>${fmt(factorial(k))} × ${fmt(factorial(n-k))} = ${fmt(factorial(k) * factorial(n-k))}</code>`);
    steps.push(`Делим: <code>${fmt(factorial(n))} ÷ ${fmt(factorial(k) * factorial(n-k))} = ${fmt(result)}</code>`);
  }

  if (mode === 'V') {
    steps.push(`Записваме формулата: <code>V(${n},${k}) = ${n}! / (${n}-${k})! = ${n}! / ${n-k}!</code>`);
    steps.push(`Пресмятаме числителя: <code>${n}! = ${fmt(factorial(n))}</code>`);
    steps.push(`Пресмятаме знаменателя: <code>${n-k}! = ${fmt(factorial(n-k))}</code>`);
    const seq = Array.from({length: k}, (_, i) => n - i).join(' × ');
    steps.push(`Съкращаваме — остава: <code>${seq}</code>`);
    steps.push(`Пресмятаме: <code>${seq} = ${fmt(result)}</code>`);
  }

  return steps;
}

/* ─── Reading sentence ─── */
function buildReading(mode, n, k, result) {
  if (mode === 'P') return `${n} елемента могат да се наредят по <strong>${fmt(result)}</strong> различни начина.`;
  if (mode === 'C') return `От ${n} елемента могат да се изберат ${k} по <strong>${fmt(result)}</strong> различни начина.`;
  if (mode === 'V') return `От ${n} елемента могат да се изберат и наредят ${k} по <strong>${fmt(result)}</strong> различни начина.`;
}

/* ─── Calculate ─── */
function calculate() {
  const n = parseInt(inpN.value, 10);
  const k = parseInt(inpK.value, 10);
  const mode = currentMode;

  // Validation
  if (isNaN(n) || n < 0 || n > 20) {
    flashError(inpN, 'n трябва да е от 0 до 20');
    return;
  }
  if ((mode === 'C' || mode === 'V') && (isNaN(k) || k < 0 || k > n)) {
    flashError(inpK, 'k трябва да е от 0 до n');
    return;
  }

  let result;
  let label;

  if (mode === 'P') {
    result = factorial(n);
    label = `P(${n})`;
  } else if (mode === 'C') {
    result = factorial(n) / (factorial(k) * factorial(n - k));
    label = `C(${n}, ${k})`;
  } else {
    result = factorial(n) / factorial(n - k);
    label = `V(${n}, ${k})`;
  }

  // Display result
  resultLabel.textContent = label;
  resultNumber.textContent = fmt(result);
  resultReading.innerHTML = buildReading(mode, n, k, result);

  // Animate number
  resultNumber.style.animation = 'none';
  void resultNumber.offsetWidth;
  resultNumber.style.animation = 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)';

  // Build steps
  stepsList.innerHTML = '';
  buildSteps(mode, n, k, result).forEach((text, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="step-num">${i + 1}</span><span class="step-text">${text}</span>`;
    stepsList.appendChild(li);
  });

  // Auto-open steps
  if (stepsBody.hidden) {
    stepsBody.hidden = false;
    stepsChevron.classList.add('open');
    stepsToggle.setAttribute('aria-expanded', 'true');
  }

  // History
  calcHistory.unshift({ mode, label, result });
  if (calcHistory.length > 8) calcHistory.pop();
  renderHistory();
}

function flashError(input, msg) {
  input.style.borderColor = 'var(--c-hard)';
  input.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.15)';
  input.title = msg;
  setTimeout(() => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  }, 1500);
}

function renderHistory() {
  if (calcHistory.length === 0) {
    historyList.innerHTML = '<div class="history-empty">Все още няма изчисления.</div>';
    return;
  }
  historyList.innerHTML = calcHistory.map(h =>
    `<div class="history-row">
      <span class="history-expr">
        <span class="hist-badge hist-badge-${h.mode}">${h.mode}</span>${h.label}
      </span>
      <span class="history-val">${fmt(h.result)}</span>
    </div>`
  ).join('');
}

calcGoBtn.addEventListener('click', calculate);

[inpN, inpK].forEach(inp => {
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
});

/* ─── Steps toggle ─── */
stepsToggle.addEventListener('click', () => {
  const isHidden = stepsBody.hidden;
  stepsBody.hidden = !isHidden;
  stepsChevron.classList.toggle('open', isHidden);
  stepsToggle.setAttribute('aria-expanded', String(isHidden));
});

stepsToggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepsToggle.click(); }
});

/* ─── Pop-in animation (injected) ─── */
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes popIn {
    0%   { transform: scale(0.85); opacity: 0.4; }
    100% { transform: scale(1);    opacity: 1;   }
  }
`;
document.head.appendChild(styleEl);

/* ─── Auto-calculate on load ─── */
calculate();

/* ══════════════════════════════════════════
   THEORY NAVIGATION
══════════════════════════════════════════ */
const theoryPills    = document.querySelectorAll('.theory-pill');
const theorySections = document.querySelectorAll('.theory-section');

theoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const target = pill.dataset.theory;
    theoryPills.forEach(p => p.classList.remove('active'));
    theorySections.forEach(s => { s.classList.remove('active'); s.hidden = true; });
    pill.classList.add('active');
    const sec = document.getElementById('theory-' + target);
    sec.classList.add('active');
    sec.hidden = false;
  });
});

// Ensure first theory section visible
document.getElementById('theory-P').hidden = false;

/* ══════════════════════════════════════════
   PRACTICE — TASK DATA
══════════════════════════════════════════ */
const TASKS = [
  // ── PERMUTATIONS — EASY ──
  { id: 1,  topic: 'P', level: 'easy',   text: 'По колко начина могат да се наредят 3 различни книги на рафт?',                                                           hint: 'Използвай P(n) = n!', answer: 6 },
  { id: 2,  topic: 'P', level: 'easy',   text: 'Колко различни реда може да има плейлист от 4 песни?',                                                                    hint: 'P(4) = ?', answer: 24 },
  { id: 3,  topic: 'P', level: 'easy',   text: 'По колко начина могат да седнат 2 човека на 2 стола?',                                                                    hint: 'P(2) = 2!', answer: 2 },
  { id: 4,  topic: 'P', level: 'easy',   text: 'Колко наредби има множеството {А, Б, В, Г, Д}?',                                                                          hint: 'P(5) = 5!', answer: 120 },
  { id: 5,  topic: 'P', level: 'easy',   text: 'Колко е P(1)?',                                                                                                           hint: '1! = ?', answer: 1 },

  // ── PERMUTATIONS — MEDIUM ──
  { id: 6,  topic: 'P', level: 'medium', text: '6 отбора участват в турнир. По колко начина може да изглежда крайното класиране?',                                         hint: 'P(6) = 6!', answer: 720 },
  { id: 7,  topic: 'P', level: 'medium', text: 'По колко начина могат да наредим буквите на думата „MATH" (4 различни букви)?',                                           hint: 'P(4) = 4!', answer: 24 },
  { id: 8,  topic: 'P', level: 'medium', text: '7 деца застават в редица. По колко начина могат да се наредят?',                                                          hint: 'P(7) = 7!', answer: 5040 },
  { id: 9,  topic: 'P', level: 'medium', text: 'Имаш 5 различни флага и трябва да ги наредиш на стълб. По колко начина?',                                                hint: 'P(5) = 5!', answer: 120 },
  { id: 10, topic: 'P', level: 'medium', text: 'Колко е 8! ?',                                                                                                            hint: '8 × 7 × 6 × … × 1', answer: 40320 },

  // ── PERMUTATIONS — HARD ──
  { id: 11, topic: 'P', level: 'hard',   text: '10 бегачи участват в маратон. Колко различни наредби на финала са възможни?',                                             hint: 'P(10) = 10!', answer: 3628800 },
  { id: 12, topic: 'P', level: 'hard',   text: 'Колко е 9! ?',                                                                                                            hint: '9 × 8!', answer: 362880 },
  { id: 13, topic: 'P', level: 'hard',   text: 'Имаш 8 различни картини. По колко начина можеш да ги наредиш по стената?',                                               hint: 'P(8) = 8!', answer: 40320 },

  // ── COMBINATIONS — EASY ──
  { id: 14, topic: 'C', level: 'easy',   text: 'От 5 ученика трябва да изберем 2 за проекта. По колко начина?',                                                           hint: 'C(5, 2) — редът не е важен', answer: 10 },
  { id: 15, topic: 'C', level: 'easy',   text: 'Колко е C(4, 1)?',                                                                                                        hint: 'C(n,1) = n', answer: 4 },
  { id: 16, topic: 'C', level: 'easy',   text: 'По колко начина може да избереш 3 добавки от 5 налични?',                                                                hint: 'C(5, 3) = ?', answer: 10 },
  { id: 17, topic: 'C', level: 'easy',   text: 'Колко е C(6, 6)?',                                                                                                        hint: 'C(n,n) = 1', answer: 1 },
  { id: 18, topic: 'C', level: 'easy',   text: 'Колко е C(5, 0)?',                                                                                                        hint: 'C(n,0) = 1', answer: 1 },

  // ── COMBINATIONS — MEDIUM ──
  { id: 19, topic: 'C', level: 'medium', text: 'От 10 играча трябва да изберем 4 за отбора. По колко начина?',                                                            hint: 'C(10, 4) = ?', answer: 210 },
  { id: 20, topic: 'C', level: 'medium', text: 'По колко начина може да изберем 2 цвята от 7 налични?',                                                                  hint: 'C(7, 2) = ?', answer: 21 },
  { id: 21, topic: 'C', level: 'medium', text: 'От клас от 12 ученика избираме комисия от 3. По колко начина?',                                                           hint: 'C(12, 3) = ?', answer: 220 },
  { id: 22, topic: 'C', level: 'medium', text: 'Колко е C(8, 3)?',                                                                                                        hint: 'C(8,3) = 8!/(3!·5!)', answer: 56 },
  { id: 23, topic: 'C', level: 'medium', text: 'Колко е C(9, 4)?',                                                                                                        hint: 'C(9,4) = 9!/(4!·5!)', answer: 126 },

  // ── COMBINATIONS — HARD ──
  { id: 24, topic: 'C', level: 'hard',   text: 'От 52 карти теглим 2. Колко различни двойки са възможни?',                                                               hint: 'C(52, 2) = ?', answer: 1326 },
  { id: 25, topic: 'C', level: 'hard',   text: 'От 15 играча избираме 6 за отбор. По колко начина?',                                                                     hint: 'C(15, 6) = ?', answer: 5005 },
  { id: 26, topic: 'C', level: 'hard',   text: 'Колко е C(10, 5)?',                                                                                                       hint: 'C(10,5) = 10!/(5!·5!)', answer: 252 },

  // ── VARIATIONS — EASY ──
  { id: 27, topic: 'V', level: 'easy',   text: 'По колко начина може да наредим 2 от 4 различни обекта (редът е важен)?',                                                hint: 'V(4, 2) = 4!/(4-2)!', answer: 12 },
  { id: 28, topic: 'V', level: 'easy',   text: 'Колко е V(3, 1)?',                                                                                                        hint: 'V(n,1) = n', answer: 3 },
  { id: 29, topic: 'V', level: 'easy',   text: 'По колко начина могат да се разпределят 3 различни награди (1-во, 2-ро, 3-то) между 5 участника?',                       hint: 'V(5, 3) = ?', answer: 60 },
  { id: 30, topic: 'V', level: 'easy',   text: 'Колко е V(4, 4)?',                                                                                                        hint: 'V(n,n) = P(n) = n!', answer: 24 },
  { id: 31, topic: 'V', level: 'easy',   text: 'По колко начина могат да заемат 2 места от 6 кандидата (ред важен)?',                                                    hint: 'V(6, 2) = ?', answer: 30 },

  // ── VARIATIONS — MEDIUM ──
  { id: 32, topic: 'V', level: 'medium', text: '8 спортисти се борят за злато, сребро и бронз. По колко начина могат да се раздадат медалите?',                          hint: 'V(8, 3) = ?', answer: 336 },
  { id: 33, topic: 'V', level: 'medium', text: 'Колко 2-цифрени числа могат да се образуват от цифрите 1, 2, 3, 4, 5 без повторение?',                                   hint: 'V(5, 2) = ?', answer: 20 },
  { id: 34, topic: 'V', level: 'medium', text: 'Колко е V(7, 2)?',                                                                                                        hint: 'V(7,2) = 7 × 6', answer: 42 },
  { id: 35, topic: 'V', level: 'medium', text: 'От 10 кандидати избираме председател, секретар и касиер (3 различни роли). По колко начина?',                             hint: 'V(10, 3) = ?', answer: 720 },
  { id: 36, topic: 'V', level: 'medium', text: 'Колко е V(6, 3)?',                                                                                                        hint: 'V(6,3) = 6!/3!', answer: 120 },

  // ── VARIATIONS — HARD ──
  { id: 37, topic: 'V', level: 'hard',   text: '4-цифрен PIN се образува от цифри 1–9 без повторение. Колко различни PIN-а са възможни?',                                 hint: 'V(9, 4) = ?', answer: 3024 },
  { id: 38, topic: 'V', level: 'hard',   text: 'Колко е V(10, 4)?',                                                                                                       hint: 'V(10,4) = 10 × 9 × 8 × 7', answer: 5040 },
  { id: 39, topic: 'V', level: 'hard',   text: 'От 12 ученика избираме 5 за различни длъжности (ред важен). По колко начина?',                                            hint: 'V(12, 5) = ?', answer: 95040 },
];

/* ══════════════════════════════════════════
   PRACTICE — STATE & PROGRESS
══════════════════════════════════════════ */
const STORAGE_KEY = 'combinatorics_solved';

function loadSolved() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []); }
  catch { return new Set(); }
}

function saveSolved(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

let solved = loadSolved();
let filterTopic = 'all';
let filterLevel = 'all';

/* ─── Progress update ─── */
function updateProgress() {
  const count = solved.size;
  const total = TASKS.length;

  // Sidebar
  document.getElementById('stat-solved').textContent = count;
  const pct = (count / total) * 100;
  document.getElementById('sidebar-progress-fill').style.width = pct + '%';

  // Header pill
  document.getElementById('progress-fraction').textContent = `${count}/${total}`;
  document.getElementById('progress-mini-fill').style.width = pct + '%';
}

/* ══════════════════════════════════════════
   PRACTICE — RENDER
══════════════════════════════════════════ */
function renderTasks() {
  const list = document.getElementById('tasks-list');
  const visible = TASKS.filter(t =>
    (filterTopic === 'all' || t.topic === filterTopic) &&
    (filterLevel === 'all' || t.level === filterLevel)
  );

  if (visible.length === 0) {
    list.innerHTML = '<p style="color:var(--c-text-3);font-size:14px;padding:1rem 0;">Няма задачи за избраните филтри.</p>';
    return;
  }

  list.innerHTML = visible.map(t => {
    const isSolved = solved.has(t.id);
    return `
      <div class="task-card${isSolved ? ' solved' : ''}" data-id="${t.id}">
        <div class="task-header" data-toggle="${t.id}">
          <div class="task-meta">
            <div class="topic-badge topic-${t.topic}">${t.topic}</div>
            <div class="level-dot level-${t.level}"></div>
          </div>
          <div class="task-body-text">${t.text}</div>
          <div class="task-expand-icon" id="expand-icon-${t.id}">▶</div>
        </div>
        <div class="task-solve-area" id="solve-area-${t.id}">
          <div class="task-hint">💡 ${t.hint}</div>
          <div class="answer-row">
            <input type="number" class="answer-input" id="ans-${t.id}" placeholder="Твоят отговор…" ${isSolved ? 'disabled' : ''} />
            <button class="check-btn" data-check="${t.id}" ${isSolved ? 'disabled' : ''}>Провери</button>
          </div>
          <div class="feedback-msg${isSolved ? ' show correct-msg' : ''}" id="fb-${t.id}">
            ${isSolved ? '✓ Правилно! Задачата е решена.' : ''}
          </div>
          ${isSolved ? '<div class="solved-stamp">✓ Решена</div>' : ''}
        </div>
      </div>`;
  }).join('');

  // Events
  list.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => toggleTask(parseInt(header.dataset.toggle, 10)));
  });

  list.querySelectorAll('[data-check]').forEach(btn => {
    btn.addEventListener('click', () => checkAnswer(parseInt(btn.dataset.check, 10)));
  });

  list.querySelectorAll('.answer-input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const id = parseInt(inp.id.replace('ans-', ''), 10);
        checkAnswer(id);
      }
    });
  });
}

function toggleTask(id) {
  const area = document.getElementById('solve-area-' + id);
  const icon = document.getElementById('expand-icon-' + id);
  const isOpen = area.classList.contains('open');
  area.classList.toggle('open', !isOpen);
  icon.classList.toggle('open', !isOpen);
}

function checkAnswer(id) {
  const task = TASKS.find(t => t.id === id);
  const inp  = document.getElementById('ans-' + id);
  const fb   = document.getElementById('fb-' + id);
  const btn  = document.querySelector(`[data-check="${id}"]`);

  const val = parseFloat(inp.value);
  if (isNaN(val)) { inp.classList.add('wrong'); return; }

  if (val === task.answer) {
    inp.classList.remove('wrong');
    inp.classList.add('correct');
    inp.disabled = true;
    btn.disabled = true;
    fb.textContent = `✓ Правилно! Отговорът е ${fmt(task.answer)}.`;
    fb.className = 'feedback-msg show correct-msg';

    const card = document.querySelector(`.task-card[data-id="${id}"]`);
    card.classList.add('solved');

    solved.add(id);
    saveSolved(solved);
    updateProgress();
  } else {
    inp.classList.remove('correct');
    inp.classList.add('wrong');
    fb.textContent = `✗ Не е точно. Опитай отново!`;
    fb.className = 'feedback-msg show wrong-msg';

    // Shake
    inp.style.animation = 'none';
    void inp.offsetWidth;
    inp.style.animation = 'shake 0.35s ease';
  }
}

/* ─── Shake animation ─── */
styleEl.textContent += `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;

/* ─── Filters ─── */
document.querySelectorAll('[data-filter-topic]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-topic]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterTopic = btn.dataset.filterTopic;
    renderTasks();
  });
});

document.querySelectorAll('[data-filter-level]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-level]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterLevel = btn.dataset.filterLevel;
    renderTasks();
  });
});

/* ─── Reset ─── */
document.getElementById('reset-progress').addEventListener('click', () => {
  if (!confirm('Сигурен ли си? Всички решени задачи ще бъдат изтрити.')) return;
  solved.clear();
  saveSolved(solved);
  updateProgress();
  renderTasks();
});

/* ─── Init ─── */
renderTasks();
updateProgress();