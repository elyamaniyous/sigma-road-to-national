// ============================================
// SIGMA - Road to National
// Main Application (Enhanced Edition)
// ============================================

import { EXERCISES, LEVELS, BADGES, LEADERBOARD } from './data.js';

// ============ DARIJA MOTIVATIONAL MESSAGES ============
const DARIJA_CORRECT = [
  { text: 'Zwin! \u{1F525}', sub: 'Tu geres comme un boss' },
  { text: 'Nta l\'patron! \u{1F451}', sub: 'Mashi b7al ga3 nass' },
  { text: 'Alhamdulillah! \u{1F64F}', sub: 'Le travail paye' },
  { text: 'Tbarkallah! \u{1F31F}', sub: 'Niveau National en vue' },
  { text: 'Dima f\'l top! \u{1F4AA}', sub: '3andek l\'niveau' },
  { text: 'Sahbi! \u{1F389}', sub: 'Rak ghadi m3a ras' },
  { text: 'Khlass! \u2705', sub: 'Wahed, zid!' },
  { text: 'Ma3lem! \u{1F9E0}', sub: 'Hta l\'prof ghadi yefra7' },
];

const DARIJA_WRONG = [
  { text: 'Makayn Mouchkil \u{1F4AA}', sub: 'Zid 7awel, ghadi toksal' },
  { text: 'Ma tkhafch! \u{1F60A}', sub: 'L\'erreur kayna f\'ttari9' },
  { text: 'Rja3 liha! \u{1F504}', sub: 'Haz rrasek w kammel' },
  { text: '3adi a sahbi \u270B', sub: 'L\'Maths ma kayenchch bla khta2' },
];

const COMBO_MESSAGES = [
  '', // 0
  '', // 1
  '\u{1F525} x2 Combo!',
  '\u{1F525}\u{1F525} x3 On Fire!',
  '\u{1F525}\u{1F525}\u{1F525} x4 Blazing!',
  '\u{1F4A5} x5 UNSTOPPABLE!',
];

// ============ STATE ============
const state = {
  currentView: 'splash',
  branch: null,
  xp: 340,
  level: 2,
  xpToNext: 500,
  streak: 4,
  highestLevel: 2,
  skills: { monotonie: 65, recurrence: 30, limites: 45 },
  currentLevelId: null,
  currentExerciseIndex: 0,
  exerciseAnswers: {},
  exerciseStartTime: null,
  timerInterval: null,
  timerRemaining: 0,
  totalCompleted: 12,
  perfectLevels: 1,
  perfectExercises: 5,
  fastestTime: 15,
  perfectDD: 0,
  completedLimites: 2,
  unlockedBadges: ['first-blood', 'streak-3'],
  hintVisible: false,
  hintUsed: false,
  dragState: null,
  // Enhancement state
  combo: 0,
  energy: 5,
  maxEnergy: 5,
  energyRefillTime: null,
  dailyChallengeCompleted: false,
  showingFeedback: false,
};

// ============ LOAD / SAVE STATE ============
function loadState() {
  try {
    const saved = localStorage.getItem('sigma_state');
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch { /* fresh start */ }
}

function saveState() {
  try {
    const toSave = { ...state };
    delete toSave.timerInterval;
    delete toSave.dragState;
    delete toSave.showingFeedback;
    localStorage.setItem('sigma_state', JSON.stringify(toSave));
  } catch { /* ok */ }
}

// ============ SAFE DOM HELPERS ============
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') node.className = val;
    else if (key === 'textContent') node.textContent = val;
    else if (key.startsWith('on') && typeof val === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), val);
    }
    else if (key === 'style' && typeof val === 'object') {
      Object.assign(node.style, val);
    }
    else node.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child instanceof Node) node.appendChild(child);
  }
  return node;
}

// Safe HTML rendering for math content only (from our own trusted data)
function setMathContent(node, trustedContent) {
  // Content comes exclusively from our data.js - not user/web input
  node.innerHTML = trustedContent;
}

// ============ RENDER ============
function render() {
  const app = document.getElementById('app');
  app.textContent = '';

  // Background
  const bg = el('div', { className: 'zellige-bg' }, [el('div', { className: 'pattern' })]);
  const grain = el('div', { className: 'grain' });
  app.appendChild(bg);
  app.appendChild(grain);

  // View - wrapper needs position relative for absolute children
  const viewHtml = renderView();
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.minHeight = '100dvh';
  wrapper.style.zIndex = '1';
  // All content originates from our own trusted data.js module, not external sources
  setMathContent(wrapper, viewHtml);
  app.appendChild(wrapper);

  // Nav
  if (!['splash', 'exercise', 'results'].includes(state.currentView)) {
    const navWrapper = document.createElement('div');
    navWrapper.style.zIndex = '100';
    setMathContent(navWrapper, renderBottomNav());
    app.appendChild(navWrapper);
  }

  afterRender();
}

function renderView() {
  switch (state.currentView) {
    case 'splash': return renderSplash();
    case 'dashboard': return renderDashboard();
    case 'exercise': return renderExercise();
    case 'results': return renderResults();
    case 'leaderboard': return renderLeaderboard();
    case 'badges': return renderBadges();
    default: return renderDashboard();
  }
}

// ============ SPLASH ============
function renderSplash() {
  return `
    <div class="view active splash-screen">
      <div class="splash-logo">SIGMA</div>
      <div class="splash-subtitle">Suites Num\u00e9riques</div>
      <div class="splash-tagline">Ta route vers le <span>20/20</span></div>
      <div class="splash-branch-select">
        <button class="branch-btn" data-action="branch" data-branch="PC">
          <div class="icon pc">\u{1F52C}</div>
          <div>2 Bac Sciences Physiques</div>
        </button>
        <button class="branch-btn" data-action="branch" data-branch="SVT">
          <div class="icon svt">\u{1F9EC}</div>
          <div>2 Bac SVT</div>
        </button>
        <button class="branch-btn" data-action="branch" data-branch="SM">
          <div class="icon sm">\u{1F4D0}</div>
          <div>2 Bac Sciences Maths</div>
        </button>
      </div>
    </div>
  `;
}

// ============ DASHBOARD ============
function renderDashboard() {
  const daysUntilExam = getDaysUntilExam();
  const xpPercent = Math.min(100, (state.xp / state.xpToNext) * 100);

  return `
    <div class="view active dashboard">
      <div class="dash-header fade-in">
        <div class="dash-profile">
          <div class="avatar">${escapeText(state.branch ? state.branch[0] : 'S')}</div>
          <div class="avatar-info">
            <div class="name">Youssef</div>
            <div class="level">Niveau ${state.level} \u2022 ${escapeText(state.branch || 'PC')}</div>
          </div>
        </div>
        <div class="dash-streak">
          <span class="streak-fire">\u{1F525}</span>
          <span>${state.streak}</span>
        </div>
      </div>

      <div class="energy-bar fade-in stagger-1">
        <div class="energy-icon">\u2764\uFE0F</div>
        <div class="energy-info">
          <div class="energy-label">\u00c9nergie</div>
          <div class="energy-track">
            ${Array.from({ length: state.maxEnergy }, (_, i) =>
              `<span class="energy-heart ${i < state.energy ? '' : 'empty'}">\u2764\uFE0F</span>`
            ).join('')}
          </div>
        </div>
        <div class="energy-refill">${state.energy < state.maxEnergy ? '+1 dans 12min' : 'Plein'}</div>
      </div>

      <div class="daily-card fade-in stagger-1" data-action="startLevel" data-level="${state.highestLevel}">
        <div class="daily-icon">\u{1F3AF}</div>
        <div class="daily-info">
          <div class="daily-label">${state.dailyChallengeCompleted ? 'D\u00e9fi du jour termin\u00e9' : 'D\u00e9fi du jour'}</div>
          <div class="daily-title">${state.dailyChallengeCompleted ? 'Bien jou\u00e9 ! Reviens demain' : getDailyChallenge()}</div>
          <div class="daily-reward">${state.dailyChallengeCompleted ? '\u2705 +50 XP gagn\u00e9s' : '\u{1F381} +50 XP bonus'}</div>
        </div>
        ${state.dailyChallengeCompleted ? '' : '<div class="daily-arrow">\u2192</div>'}
      </div>

      <div class="countdown-card fade-in stagger-2">
        <div class="countdown-label">Examen National 2026</div>
        <div class="countdown-main">
          <span class="countdown-number">J-${daysUntilExam}</span>
          <span class="countdown-unit">jours</span>
        </div>
        <div class="countdown-sub">Session normale \u2022 Juin 2026</div>
      </div>

      <div class="xp-bar-container fade-in stagger-3">
        <div class="xp-info">
          <span class="xp-label">Progression XP</span>
          <span class="xp-value">${state.xp} / ${state.xpToNext} XP</span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" style="width: ${xpPercent}%"></div>
        </div>
      </div>

      <div class="skill-section-title fade-in stagger-3">\u{1F3AF} Arbre de comp\u00e9tences</div>
      <div class="skill-gauges fade-in stagger-3">
        ${renderSkillGauge('Monotonie', state.skills.monotonie, '#10b981')}
        ${renderSkillGauge('R\u00e9currence', state.skills.recurrence, '#3b82f6')}
        ${renderSkillGauge('Limites', state.skills.limites, '#f59e0b')}
      </div>

      <div class="map-section-title fade-in stagger-4">\u{1F5FA}\u{FE0F} Parcours : Suites Num\u00e9riques</div>
      <div class="progression-map fade-in stagger-5">
        ${LEVELS.map((lvl) => renderMapLevel(lvl)).join('')}
      </div>
    </div>
  `;
}

function getDailyChallenge() {
  const challenges = [
    'R\u00e9ussis 3 exos sans erreur',
    'Termine un niveau en -2min',
    'Fais un combo x3',
    'Utilise 0 astuces aujourd\'hui',
    'Finis le niveau Limites',
  ];
  const day = new Date().getDay();
  return challenges[day % challenges.length];
}

function renderSkillGauge(label, value, color) {
  const offset = 157 - (157 * value / 100);
  return `
    <div class="skill-gauge">
      <div class="gauge-ring">
        <svg viewBox="0 0 56 56">
          <circle class="bg" cx="28" cy="28" r="25" />
          <circle class="fill" cx="28" cy="28" r="25"
            stroke="${color}"
            style="stroke-dashoffset: ${offset}" />
        </svg>
        <div class="value" style="color: ${color}">${value}%</div>
      </div>
      <div class="label">${escapeText(label)}</div>
    </div>
  `;
}

function renderMapLevel(lvl) {
  const isCurrent = lvl.id === state.highestLevel;
  const isCompleted = lvl.id < state.highestLevel;
  const isLocked = lvl.id > state.highestLevel;
  const nodeClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
  const connClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';

  return `
    <div class="map-level" ${isLocked ? '' : `data-action="startLevel" data-level="${lvl.id}"`}>
      <div class="map-connector ${connClass}"></div>
      <div class="map-node ${nodeClass}">
        ${isCompleted ? '\u2713' : isLocked ? '\u{1F512}' : lvl.id}
      </div>
      <div class="map-info">
        <div class="map-title">${escapeText(lvl.title)}</div>
        <div class="map-subtitle">${lvl.subtitle}</div>
      </div>
      <div class="map-score ${isCompleted ? 'earned' : ''}">${escapeText(lvl.scoreTarget)}</div>
    </div>
  `;
}

// ============ EXERCISE ============
function renderExercise() {
  const level = LEVELS.find(l => l.id === state.currentLevelId);
  if (!level) return '';

  const exerciseId = level.exerciseIds[state.currentExerciseIndex];
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  if (!exercise) return '';

  const current = state.currentExerciseIndex;
  const total = level.exerciseIds.length;
  const timerPercent = exercise.timer > 0 ? (state.timerRemaining / exercise.timer) * 100 : 100;
  const circumTimer = 2 * Math.PI * 18;
  const timerOffset = circumTimer - (circumTimer * timerPercent / 100);

  return `
    <div class="view active exercise-view">
      <div class="exercise-header">
        <div class="exercise-topbar">
          <button class="exercise-back" data-action="exitExercise">\u2190</button>
          <div class="exercise-timer-wrap">
            <svg class="timer-ring" viewBox="0 0 40 40" width="40" height="40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(148,163,184,0.1)" stroke-width="3" />
              <circle cx="20" cy="20" r="18" fill="none"
                stroke="${state.timerRemaining < 10 ? 'var(--ruby)' : 'var(--amber)'}"
                stroke-width="3" stroke-linecap="round"
                stroke-dasharray="${circumTimer}"
                stroke-dashoffset="${timerOffset}"
                transform="rotate(-90 20 20)"
                style="transition: stroke-dashoffset 1s linear" />
            </svg>
            <div class="timer-text ${state.timerRemaining < 10 ? 'warning' : ''}" id="timer">
              ${formatTime(state.timerRemaining)}
            </div>
          </div>
          <div class="exercise-count">${current + 1}/${total}</div>
        </div>
        <div class="exercise-progress">
          ${level.exerciseIds.map((_, i) => `
            <div class="progress-dot ${i < current ? 'done' : i === current ? 'active' : ''}"></div>
          `).join('')}
        </div>
      </div>

      ${state.combo >= 2 ? `
        <div class="combo-indicator visible ${state.combo >= 4 ? 'blaze' : 'fire'}">
          ${COMBO_MESSAGES[Math.min(state.combo, 5)]}
        </div>
      ` : ''}

      <div class="problem-statement">
        <div class="problem-badge type-${exercise.type === 'mcq' ? 'mcq' : exercise.type === 'dragdrop' ? 'drag' : 'drop'}">
          ${exercise.type === 'mcq' ? '\u{1F3AF} QCM' : exercise.type === 'dragdrop' ? '\u{1F9E9} Glisser-D\u00e9poser' : '\u{1F4DD} Texte \u00e0 trous'}
        </div>
        <div class="problem-text">${exercise.statement}</div>
      </div>

      <div class="workspace">
        ${renderExerciseContent(exercise)}
      </div>

      <button class="hint-btn" data-action="toggleHint">
        \u{1F4A1} Astuce du Prof <span class="cost">-5 XP</span>
      </button>

      <div class="hint-popup ${state.hintVisible ? 'visible' : ''}" id="hintPopup">
        <div class="hint-title">\u{1F4A1} Astuce du Prof</div>
        <div class="hint-text">${exercise.hint || ''}</div>
      </div>

      <div class="validate-bar">
        <button class="validate-btn primary" id="validateBtn" data-action="validate" disabled>
          Valider ma r\u00e9ponse
        </button>
      </div>
    </div>
  `;
}

function renderExerciseContent(exercise) {
  switch (exercise.type) {
    case 'mcq': return renderMCQ(exercise);
    case 'dropdown': return renderDropdown(exercise);
    case 'dragdrop': return renderDragDrop(exercise);
    default: return '';
  }
}

function renderMCQ(exercise) {
  const letters = ['A', 'B', 'C', 'D'];
  const selected = state.exerciseAnswers[exercise.id];

  return `
    <div class="mcq-options">
      ${exercise.options.map((opt, i) => {
        let cls = '';
        if (selected !== undefined && selected === i) cls = 'selected';
        return `
          <div class="mcq-option ${cls}" data-action="selectMCQ" data-exercise="${exercise.id}" data-index="${i}">
            <div class="mcq-letter">${letters[i]}</div>
            <div class="mcq-text">${opt.text}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderDropdown(exercise) {
  const answers = state.exerciseAnswers[exercise.id] || {};

  return `
    <div class="dropdown-exercise">
      ${exercise.steps.map((step, i) => `
        <div style="margin-bottom: 1.25rem;">
          <div style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
            <strong>\u00c9tape ${i + 1}:</strong> ${step.text}
          </div>
          <select class="inline-dropdown ${answers[i] !== undefined ? (answers[i] === step.correct ? 'correct' : '') : ''}"
            data-action="selectDropdown" data-exercise="${exercise.id}" data-step="${i}">
            <option value="" ${!answers[i] ? 'selected' : ''}>Choisir...</option>
            ${step.options.map(opt => `
              <option value="${opt}" ${answers[i] === opt ? 'selected' : ''}>${stripLatex(opt)}</option>
            `).join('')}
          </select>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDragDrop(exercise) {
  const placed = state.exerciseAnswers[exercise.id] || {};
  const allBlocks = [...exercise.steps];
  if (exercise.distractors) allBlocks.push(...exercise.distractors);

  const shuffled = shuffleWithSeed(allBlocks, exercise.id.length * 7);

  return `
    <div class="drag-drop-area">
      <div class="drop-sequence">
        ${exercise.steps.map((_, i) => `
          <div class="drop-step">
            <div class="step-number">${i + 1}</div>
            <div class="drop-zone ${placed[i] !== undefined ? 'filled' : ''}"
              id="dropzone-${i}"
              data-action="clearDrop" data-exercise="${exercise.id}" data-slot="${i}">
              ${placed[i] !== undefined ? truncateText(allBlocks[placed[i]], 80) : 'Glisser ici...'}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="drag-blocks-label">Blocs disponibles \u2193</div>
      <div class="drag-blocks" id="dragBlocks">
        ${shuffled.map((block) => {
          const realIdx = allBlocks.indexOf(block);
          const isUsed = Object.values(placed).includes(realIdx);
          return `
            <div class="drag-block ${isUsed ? 'used' : ''}"
              draggable="true"
              data-block-idx="${realIdx}"
              data-action="blockTap">
              ${truncateText(block, 60)}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ============ RESULTS ============
function renderResults() {
  const level = LEVELS.find(l => l.id === state.currentLevelId);
  const total = level ? level.exerciseIds.length : 1;
  let correct = 0;

  if (level) {
    level.exerciseIds.forEach(exId => {
      const ex = EXERCISES.find(e => e.id === exId);
      if (isExerciseCorrect(ex, state.exerciseAnswers)) correct++;
    });
  }

  const scorePercent = Math.round((correct / total) * 100);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (circumference * scorePercent / 100);
  const color = scorePercent >= 80 ? 'var(--emerald)' : scorePercent >= 50 ? 'var(--amber)' : 'var(--ruby)';
  const xpEarned = correct * 15 + (scorePercent >= 80 ? 30 : 0);
  const shouldUnlockBadge = scorePercent === 100 && !state.unlockedBadges.includes('perfect-level');

  // Darija results messages
  let title, subtitle;
  if (scorePercent >= 80) {
    title = 'Tbarkallah 3lik! \u{1F525}';
    subtitle = 'Rak f ttari9 l 20/20';
  } else if (scorePercent >= 50) {
    title = 'Mashi khaib! \u{1F4AA}';
    subtitle = 'Zid chwiya w ghadi tossel';
  } else {
    title = 'Ma tya2sch! \u{1F60A}';
    subtitle = 'Rja3 liha, ghadi tfahem';
  }

  return `
    <div class="view active results-screen">
      <div class="results-score-ring">
        <svg viewBox="0 0 160 160">
          <circle class="bg" cx="80" cy="80" r="70" />
          <circle class="fill" cx="80" cy="80" r="70"
            stroke="${color}"
            style="stroke-dashoffset: ${offset}" />
        </svg>
        <div class="score-text">
          <div class="score-number" style="color: ${color}">${correct}/${total}</div>
          <div class="score-label">${scorePercent}%</div>
        </div>
      </div>

      <div class="results-title">${escapeText(title)}</div>
      <div class="results-subtitle">${escapeText(subtitle)}</div>

      <div class="results-stats">
        <div class="stat-item">
          <div class="stat-icon">\u{1F525}</div>
          <div class="stat-value">${state.combo > 0 ? state.combo : '-'}</div>
          <div class="stat-label">Max Combo</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">\u23F1</div>
          <div class="stat-value">${getTimeTaken()}</div>
          <div class="stat-label">Temps</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">\u{1F4A1}</div>
          <div class="stat-value">${state.hintUsed ? 'Oui' : 'Non'}</div>
          <div class="stat-label">Astuces</div>
        </div>
      </div>

      <div class="xp-gain">+ ${xpEarned} XP</div>

      ${shouldUnlockBadge ? `
        <div class="badge-unlock">
          <div class="badge-icon">\u{1F4AF}</div>
          <div class="badge-name">Badge d\u00e9bloqu\u00e9 : Sans Faute</div>
          <div class="badge-desc">Niveau compl\u00e9t\u00e9 sans erreur</div>
        </div>
      ` : ''}

      <div class="results-actions">
        <button class="result-btn primary" data-action="nextLevel">
          ${scorePercent >= 50 ? 'Niveau Suivant \u2192' : 'R\u00e9essayer \u{1F504}'}
        </button>
        <button class="result-btn secondary" data-action="goToDashboard">
          Retour au parcours
        </button>
        <button class="result-btn share" data-action="shareResults">
          \u{1F4F1} Partager mon score
        </button>
      </div>
    </div>
  `;
}

function getTimeTaken() {
  if (!state.exerciseStartTime) return '--';
  const elapsed = Math.round((Date.now() - state.exerciseStartTime) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return m > 0 ? `${m}m${s}s` : `${s}s`;
}

// ============ LEADERBOARD ============
function renderLeaderboard() {
  const allPlayers = [...LEADERBOARD, { name: 'Youssef (Toi)', xp: state.xp, school: 'Mon Lyc\u00e9e', isMe: true }];
  allPlayers.sort((a, b) => b.xp - a.xp);

  const top3 = allPlayers.slice(0, 3);
  const rest = allPlayers.slice(3);

  return `
    <div class="view active leaderboard-view">
      <div class="lb-header">
        <div class="lb-title">\u{1F3C6} Classement</div>
      </div>

      <div class="lb-tabs">
        <button class="lb-tab active">National</button>
        <button class="lb-tab">Acad\u00e9mie</button>
        <button class="lb-tab">Lyc\u00e9e</button>
      </div>

      <div class="lb-podium">
        ${[top3[1], top3[0], top3[2]].map((p, podIdx) => {
          const rank = podIdx === 0 ? 2 : podIdx === 1 ? 1 : 3;
          return `
            <div class="podium-place">
              <div class="pod-avatar">${escapeText(p.name[0])}</div>
              <div class="pod-name">${escapeText(p.name.split(' ')[0])}</div>
              <div class="pod-xp">${p.xp} XP</div>
              <div class="podium-bar">
                <span class="podium-rank">#${rank}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="lb-list">
        ${rest.map((p, i) => `
          <div class="lb-row ${p.isMe ? 'me' : ''}">
            <div class="lb-rank">${i + 4}</div>
            <div class="lb-avatar">${escapeText(p.name[0])}</div>
            <div class="lb-name">${escapeText(p.name)}</div>
            <div class="lb-xp">${p.xp} XP</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ BADGES ============
function renderBadges() {
  return `
    <div class="view active badges-view">
      <div class="badges-title">\u{1F3C5} Badges</div>
      <div class="badges-grid">
        ${BADGES.map(badge => {
          const unlocked = state.unlockedBadges.includes(badge.id);
          return `
            <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
              <div class="b-icon">${badge.icon}</div>
              <div class="b-name">${escapeText(badge.name)}</div>
              <div class="b-desc">${escapeText(badge.desc)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ============ BOTTOM NAV ============
function renderBottomNav() {
  const items = [
    { id: 'dashboard', icon: '\u{1F3E0}', label: 'Accueil' },
    { id: 'leaderboard', icon: '\u{1F3C6}', label: 'Classement' },
    { id: 'badges', icon: '\u{1F3C5}', label: 'Badges' },
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(item => `
        <button class="nav-item ${state.currentView === item.id ? 'active' : ''}"
          data-action="navigate" data-view="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${escapeText(item.label)}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// ============ EVENT DELEGATION ============
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case 'branch':
      selectBranch(target.dataset.branch);
      break;
    case 'navigate':
      navigate(target.dataset.view);
      break;
    case 'startLevel':
      startLevel(parseInt(target.dataset.level));
      break;
    case 'exitExercise':
      exitExercise();
      break;
    case 'selectMCQ':
      selectMCQ(target.dataset.exercise, parseInt(target.dataset.index));
      break;
    case 'toggleHint':
      toggleHint();
      break;
    case 'validate':
      validateAnswer();
      break;
    case 'nextLevel':
      nextLevel();
      break;
    case 'goToDashboard':
      goToDashboard();
      break;
    case 'blockTap':
      handleBlockTap(parseInt(target.dataset.blockIdx));
      break;
    case 'clearDrop':
      clearDropZone(target.dataset.exercise, parseInt(target.dataset.slot));
      break;
    case 'feedbackContinue':
      continuePastFeedback();
      break;
    case 'shareResults':
      shareResults();
      break;
  }
});

document.addEventListener('change', (e) => {
  const target = e.target.closest('[data-action="selectDropdown"]');
  if (!target) return;
  selectDropdown(target.dataset.exercise, parseInt(target.dataset.step), target.value);
});

// Drag and drop events
document.addEventListener('dragstart', (e) => {
  const block = e.target.closest('.drag-block');
  if (!block) return;
  state.dragState = parseInt(block.dataset.blockIdx);
  e.dataTransfer.setData('text/plain', block.dataset.blockIdx);
  block.classList.add('dragging');
});

document.addEventListener('dragover', (e) => {
  const zone = e.target.closest('.drop-zone');
  if (zone) {
    e.preventDefault();
    zone.classList.add('drag-over');
  }
});

document.addEventListener('dragleave', (e) => {
  const zone = e.target.closest('.drop-zone');
  if (zone) zone.classList.remove('drag-over');
});

document.addEventListener('drop', (e) => {
  const zone = e.target.closest('.drop-zone');
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove('drag-over');

  const blockIdx = parseInt(e.dataTransfer.getData('text/plain'));
  const slotMatch = zone.id.match(/dropzone-(\d+)/);
  if (!slotMatch) return;
  const slotIdx = parseInt(slotMatch[1]);

  const level = LEVELS.find(l => l.id === state.currentLevelId);
  if (!level) return;
  const exerciseId = level.exerciseIds[state.currentExerciseIndex];

  if (!state.exerciseAnswers[exerciseId]) state.exerciseAnswers[exerciseId] = {};
  state.exerciseAnswers[exerciseId][slotIdx] = blockIdx;

  render();
  checkDropdownComplete(exerciseId);
});

// ============ TOUCH EVENTS FOR MOBILE DRAG & DROP ============
let touchDragBlock = null;
let touchGhost = null;

document.addEventListener('touchstart', (e) => {
  const block = e.target.closest('.drag-block:not(.used)');
  if (!block) return;

  touchDragBlock = {
    idx: parseInt(block.dataset.blockIdx),
    el: block,
    startX: e.touches[0].clientX,
    startY: e.touches[0].clientY,
  };

  // Create ghost element
  touchGhost = block.cloneNode(true);
  touchGhost.style.position = 'fixed';
  touchGhost.style.zIndex = '10000';
  touchGhost.style.pointerEvents = 'none';
  touchGhost.style.opacity = '0.85';
  touchGhost.style.transform = 'scale(1.05)';
  touchGhost.style.boxShadow = '0 8px 32px rgba(245,158,11,0.3)';
  touchGhost.style.width = block.offsetWidth + 'px';
  touchGhost.style.left = (e.touches[0].clientX - block.offsetWidth / 2) + 'px';
  touchGhost.style.top = (e.touches[0].clientY - 20) + 'px';
  document.body.appendChild(touchGhost);

  block.style.opacity = '0.3';
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!touchDragBlock || !touchGhost) return;

  const touch = e.touches[0];
  touchGhost.style.left = (touch.clientX - touchGhost.offsetWidth / 2) + 'px';
  touchGhost.style.top = (touch.clientY - 20) + 'px';

  // Highlight drop zones on hover
  const zones = document.querySelectorAll('.drop-zone');
  zones.forEach(zone => {
    const rect = zone.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      zone.classList.add('drag-over');
    } else {
      zone.classList.remove('drag-over');
    }
  });

  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (!touchDragBlock) return;

  const touch = e.changedTouches[0];

  // Check if dropped on a zone
  const zones = document.querySelectorAll('.drop-zone');
  let dropped = false;

  zones.forEach(zone => {
    const rect = zone.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      zone.classList.remove('drag-over');

      const slotMatch = zone.id.match(/dropzone-(\d+)/);
      if (slotMatch) {
        const slotIdx = parseInt(slotMatch[1]);
        const level = LEVELS.find(l => l.id === state.currentLevelId);
        if (level) {
          const exerciseId = level.exerciseIds[state.currentExerciseIndex];
          if (!state.exerciseAnswers[exerciseId]) state.exerciseAnswers[exerciseId] = {};
          state.exerciseAnswers[exerciseId][slotIdx] = touchDragBlock.idx;
          dropped = true;
          render();
          checkDropdownComplete(exerciseId);
        }
      }
    }
  });

  // Clean up
  if (touchGhost && touchGhost.parentNode) {
    touchGhost.parentNode.removeChild(touchGhost);
  }
  if (touchDragBlock.el && !dropped) {
    touchDragBlock.el.style.opacity = '';
  }
  touchDragBlock = null;
  touchGhost = null;
});

// ============ ACTIONS ============
function selectBranch(branch) {
  state.branch = branch;
  state.currentView = 'dashboard';
  saveState();
  render();
}

function navigate(view) {
  state.currentView = view;
  render();
}

function startLevel(levelId) {
  if (state.energy <= 0) {
    showMotivationalToast('Plus d\'\u00e9nergie! Reviens dans 12min \u2764\uFE0F', 'encourage');
    return;
  }

  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  state.energy = Math.max(0, state.energy - 1);
  state.currentLevelId = levelId;
  state.currentExerciseIndex = 0;
  state.exerciseAnswers = {};
  state.hintVisible = false;
  state.hintUsed = false;
  state.combo = 0;
  state.exerciseStartTime = Date.now();
  state.currentView = 'exercise';

  const exercise = EXERCISES.find(e => e.id === level.exerciseIds[0]);
  if (exercise) {
    state.timerRemaining = exercise.timer;
    startTimer();
  }

  saveState();
  render();
}

function exitExercise() {
  clearInterval(state.timerInterval);
  state.currentView = 'dashboard';
  state.combo = 0;
  render();
}

function selectMCQ(exerciseId, optionIndex) {
  state.exerciseAnswers[exerciseId] = optionIndex;
  render();
  enableValidation();
}

function selectDropdown(exerciseId, stepIndex, value) {
  if (!state.exerciseAnswers[exerciseId]) state.exerciseAnswers[exerciseId] = {};
  state.exerciseAnswers[exerciseId][stepIndex] = value;
  checkDropdownComplete(exerciseId);
}

function checkDropdownComplete(exerciseId) {
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  const answers = state.exerciseAnswers[exerciseId];
  if (!exercise || !answers) return;

  const totalSteps = exercise.type === 'dropdown' ? exercise.steps.length : exercise.steps.length;
  if (Object.keys(answers).length >= totalSteps) {
    enableValidation();
  }
}

function handleBlockTap(blockIdx) {
  const level = LEVELS.find(l => l.id === state.currentLevelId);
  if (!level) return;
  const exerciseId = level.exerciseIds[state.currentExerciseIndex];
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  if (!exercise) return;

  if (!state.exerciseAnswers[exerciseId]) state.exerciseAnswers[exerciseId] = {};

  for (let i = 0; i < exercise.steps.length; i++) {
    if (state.exerciseAnswers[exerciseId][i] === undefined) {
      state.exerciseAnswers[exerciseId][i] = blockIdx;
      break;
    }
  }

  render();
  checkDropdownComplete(exerciseId);
}

function clearDropZone(exerciseId, slotIdx) {
  if (state.exerciseAnswers[exerciseId] && state.exerciseAnswers[exerciseId][slotIdx] !== undefined) {
    delete state.exerciseAnswers[exerciseId][slotIdx];
    render();
  }
}

function toggleHint() {
  state.hintVisible = !state.hintVisible;
  if (!state.hintUsed && state.hintVisible) {
    state.hintUsed = true;
    state.xp = Math.max(0, state.xp - 5);
  }
  render();
}

// ============ ENHANCED VALIDATE WITH FEEDBACK ============
function validateAnswer() {
  if (state.showingFeedback) return;

  const level = LEVELS.find(l => l.id === state.currentLevelId);
  if (!level) return;

  const exerciseId = level.exerciseIds[state.currentExerciseIndex];
  const exercise = EXERCISES.find(e => e.id === exerciseId);

  const isCorrect = isExerciseCorrect(exercise, state.exerciseAnswers);

  // Update state
  if (isCorrect) {
    state.xp += exercise.xp;
    state.totalCompleted++;
    state.combo++;
  } else {
    state.combo = 0;
  }

  // Screen flash
  showScreenFlash(isCorrect);

  // Show feedback overlay
  state.showingFeedback = true;
  showFeedbackOverlay(isCorrect, exercise.xp);

  // Confetti on correct
  if (isCorrect) {
    spawnConfetti();
    spawnFloatingXP(exercise.xp);
  }

  // Combo toast
  if (state.combo >= 2 && isCorrect) {
    setTimeout(() => {
      showMotivationalToast(COMBO_MESSAGES[Math.min(state.combo, 5)], 'hype');
    }, 600);
  }

  saveState();
}

function continuePastFeedback() {
  state.showingFeedback = false;

  // Remove feedback overlay
  const overlay = document.querySelector('.feedback-overlay');
  if (overlay) overlay.remove();

  const level = LEVELS.find(l => l.id === state.currentLevelId);
  if (!level) return;

  if (state.currentExerciseIndex < level.exerciseIds.length - 1) {
    state.currentExerciseIndex++;
    state.hintVisible = false;
    state.hintUsed = false;

    const nextExercise = EXERCISES.find(e => e.id === level.exerciseIds[state.currentExerciseIndex]);
    if (nextExercise) {
      state.timerRemaining = nextExercise.timer;
    }
    render();
    startTimer();
  } else {
    clearInterval(state.timerInterval);
    state.currentView = 'results';
    render();

    // Confetti on good results
    const total = level.exerciseIds.length;
    let correct = 0;
    level.exerciseIds.forEach(exId => {
      const ex = EXERCISES.find(e => e.id === exId);
      if (isExerciseCorrect(ex, state.exerciseAnswers)) correct++;
    });
    if (correct / total >= 0.8) {
      setTimeout(() => spawnConfetti(40), 500);
    }
  }
}

function nextLevel() {
  if (state.highestLevel <= state.currentLevelId) {
    state.highestLevel = Math.min(state.currentLevelId + 1, LEVELS.length);
  }
  state.currentLevelId = Math.min(state.currentLevelId + 1, LEVELS.length);
  state.currentExerciseIndex = 0;
  state.exerciseAnswers = {};
  state.hintVisible = false;
  state.hintUsed = false;
  state.combo = 0;
  state.currentView = 'dashboard';
  saveState();
  render();
}

function goToDashboard() {
  clearInterval(state.timerInterval);
  state.currentView = 'dashboard';
  state.combo = 0;
  render();
}

function shareResults() {
  const level = LEVELS.find(l => l.id === state.currentLevelId);
  const total = level ? level.exerciseIds.length : 1;
  let correct = 0;
  if (level) {
    level.exerciseIds.forEach(exId => {
      const ex = EXERCISES.find(e => e.id === exId);
      if (isExerciseCorrect(ex, state.exerciseAnswers)) correct++;
    });
  }
  const text = `\u{1F4CA} SIGMA - Road to National\n\u{1F3AF} Score: ${correct}/${total}\n\u{1F525} Streak: ${state.streak} jours\n\u{1F4AA} Niveau: ${state.level}\n\nTa3ala n7arbu l National! \u{1F1F2}\u{1F1E6}`;

  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showMotivationalToast('Copi\u00e9 ! Partage avec tes amis \u{1F4F1}', 'hype');
    }).catch(() => {});
  }
}

// ============ FEEDBACK OVERLAY ============
function showFeedbackOverlay(isCorrect, xp) {
  const msgs = isCorrect
    ? DARIJA_CORRECT[Math.floor(Math.random() * DARIJA_CORRECT.length)]
    : DARIJA_WRONG[Math.floor(Math.random() * DARIJA_WRONG.length)];

  const overlay = document.createElement('div');
  overlay.className = `feedback-overlay ${isCorrect ? 'correct' : 'wrong'}`;

  const content = `
    <div class="feedback-icon">${isCorrect ? '\u2705' : '\u274C'}</div>
    <div class="feedback-message">${escapeText(msgs.text)}</div>
    <div class="feedback-sub">${escapeText(msgs.sub)}</div>
    ${isCorrect ? `<div class="feedback-xp">+${xp} XP</div>` : ''}
    <button class="feedback-continue" data-action="feedbackContinue">
      ${isCorrect ? 'Continuer \u2192' : 'Compris \u{1F4AA}'}
    </button>
  `;
  setMathContent(overlay, content);

  document.body.appendChild(overlay);

  // Trigger visible
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  // Auto-continue after 3s
  setTimeout(() => {
    if (state.showingFeedback) {
      continuePastFeedback();
    }
  }, 3000);
}

// ============ SCREEN FLASH ============
function showScreenFlash(isCorrect) {
  const flash = document.createElement('div');
  flash.className = `screen-flash ${isCorrect ? 'correct' : 'wrong'}`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

// ============ CONFETTI ============
function spawnConfetti(count = 25) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#fbbf24', '#34d399', '#a78bfa'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (4 + Math.random() * 8) + 'px';
    piece.style.height = (4 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

// ============ FLOATING XP ============
function spawnFloatingXP(xp) {
  const floater = document.createElement('div');
  floater.className = 'floating-xp';
  floater.textContent = `+${xp} XP`;
  floater.style.left = '50%';
  floater.style.top = '45%';
  floater.style.transform = 'translateX(-50%)';
  document.body.appendChild(floater);
  setTimeout(() => floater.remove(), 1500);
}

// ============ MOTIVATIONAL TOAST ============
function showMotivationalToast(message, type = 'hype') {
  // Remove existing
  document.querySelectorAll('.moti-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `moti-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// ============ TIMER ============
function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timerRemaining--;

    // Update timer text
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      timerEl.textContent = formatTime(state.timerRemaining);
      if (state.timerRemaining < 10) timerEl.classList.add('warning');
    }

    // Update timer ring
    const level = LEVELS.find(l => l.id === state.currentLevelId);
    if (level) {
      const exerciseId = level.exerciseIds[state.currentExerciseIndex];
      const exercise = EXERCISES.find(e => e.id === exerciseId);
      if (exercise) {
        const ring = document.querySelector('.timer-ring circle:last-child');
        if (ring) {
          const circumTimer = 2 * Math.PI * 18;
          const pct = Math.max(0, state.timerRemaining / exercise.timer);
          ring.style.strokeDashoffset = circumTimer - (circumTimer * pct);
        }
      }
    }

    if (state.timerRemaining <= 0) {
      clearInterval(state.timerInterval);
      validateAnswer();
    }
  }, 1000);
}

function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============ HELPERS ============
function escapeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isExerciseCorrect(exercise, answers) {
  if (!exercise) return false;
  const answer = answers[exercise.id];

  switch (exercise.type) {
    case 'mcq':
      if (answer === undefined) return false;
      return exercise.options[answer]?.correct === true;

    case 'dropdown':
      if (!answer || typeof answer !== 'object') return false;
      return exercise.steps.every((step, i) => answer[i] === step.correct);

    case 'dragdrop':
      if (!answer || typeof answer !== 'object') return false;
      return exercise.steps.every((step, i) => {
        const blockIdx = answer[i];
        if (blockIdx === undefined) return false;
        const allBlocks = [...exercise.steps];
        if (exercise.distractors) allBlocks.push(...exercise.distractors);
        return allBlocks[blockIdx] === step;
      });

    default:
      return false;
  }
}

function enableValidation() {
  setTimeout(() => {
    const btn = document.getElementById('validateBtn');
    if (btn) btn.disabled = false;
  }, 100);
}

function stripLatex(str) {
  return str.replace(/\\\(/g, '').replace(/\\\)/g, '')
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\left/g, '').replace(/\\right/g, '')
    .replace(/\\infty/g, '\u221E')
    .replace(/\\lim/g, 'lim')
    .replace(/\\sqrt\{([^}]*)\}/g, '\u221A($1)')
    .replace(/\\sqrt/g, '\u221A')
    .replace(/\\leq/g, '\u2264')
    .replace(/\\geq/g, '\u2265')
    .replace(/\\forall/g, '\u2200')
    .replace(/\\in/g, '\u2208')
    .replace(/\\mathbb\{([^}]*)\}/g, '$1')
    .replace(/\\cdot/g, '\u00B7')
    .replace(/\\times/g, '\u00D7')
    .replace(/\\neq/g, '\u2260')
    .replace(/\\pm/g, '\u00B1')
    .replace(/\\;/g, ' ')
    .replace(/\\_/g, '_')
    .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
    .replace(/\$/g, '')
    .replace(/\\\\/g, '');
}

function truncateText(text, maxLen) {
  const stripped = stripLatex(text);
  if (stripped.length <= maxLen) return stripped;
  return stripped.substring(0, maxLen) + '...';
}

function shuffleWithSeed(arr, seed) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDaysUntilExam() {
  const exam = new Date(2026, 5, 15);
  const now = new Date();
  return Math.max(0, Math.ceil((exam - now) / (1000 * 60 * 60 * 24)));
}

// ============ AFTER RENDER ============
function afterRender() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(() => {});
  }
}

// ============ INIT ============
loadState();
if (state.branch) {
  state.currentView = 'dashboard';
}
render();
