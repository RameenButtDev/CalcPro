// DOM Elements
const display = document.querySelector("#display");
const previousExpression = document.querySelector("#previousExpression");
const calciBINs = document.querySelectorAll(".calciBIN");
const clearBtn = document.querySelector("#clear");
const backspaceBtn = document.querySelector("#backspace");
const equalToBtn = document.querySelector("#equalTo");
const historyPanel = document.querySelector("#historyPanel");
const clearHistoryBtn = document.querySelector("#clearHistory");
const themeToggle = document.querySelector("#themeToggle");
const angleModeBtn = document.querySelector("#angleMode");
const memoryIndicator = document.querySelector("#memoryIndicator");

// Memory Functions
const mcBtn = document.querySelector("#mc");
const mrBtn = document.querySelector("#mr");
const mPlusBtn = document.querySelector("#mPlus");
const mMinusBtn = document.querySelector("#mMinus");
const msBtn = document.querySelector("#ms");

// State
let memory = 0;
let isDegree = true;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let isDark = localStorage.getItem('calcDarkMode') === 'true';

// Initialize
function init() {
  renderHistory();
  if (isDark) document.documentElement.classList.add('dark');
  updateThemeIcon();
}

// Number & Operator Buttons
calciBINs.forEach((el) => {
  el.addEventListener("click", () => {
    const val = el.value;
    if (display.value === "ERROR" || display.value === "Infinity" || display.value === "NaN") {
      display.value = val;
    } else {
      display.value += val;
    }
    display.focus();
  });
});

// Scientific Functions
document.querySelectorAll('[data-sci]').forEach(btn => {
  btn.addEventListener('click', () => {
    const func = btn.dataset.sci;
    let insert = '';

    switch(func) {
      case 'sin': insert = 'sin('; break;
      case 'cos': insert = 'cos('; break;
      case 'tan': insert = 'tan('; break;
      case 'log': insert = 'log10('; break;
      case 'ln': insert = 'log('; break;
      case 'sqrt': insert = 'sqrt('; break;
      case 'pow': insert = '^2'; break;
      case 'pi': insert = 'pi'; break;
      case 'e': insert = 'e'; break;
      case 'fact': insert = 'factorial('; break;
    }

    if (display.value === "ERROR") display.value = '';
    display.value += insert;
    display.focus();
  });
});

// Evaluate Expression
const evaluate = () => {
  if (display.value === "") return;

  let expression = display.value
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/%/g, '/100');

  // Handle degree mode for trig functions
  if (isDegree) {
    expression = expression
      .replace(/sin\(/g, 'sin(deg ')
      .replace(/cos\(/g, 'cos(deg ')
      .replace(/tan\(/g, 'tan(deg ');
  }

  try {
    let result = math.evaluate(expression);

    // Format result
    if (typeof result === 'number') {
      if (!Number.isFinite(result)) throw new Error('Infinity');
      // Round to avoid floating point issues
      result = Math.round(result * 1e10) / 1e10;
      // Format large/small numbers
      if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-10 && result !== 0)) {
        result = result.toExponential(6);
      }
    }

    // Add to history
    addToHistory(display.value, result);

    previousExpression.textContent = display.value + ' =';
    display.value = String(result);
  } catch (err) {
    display.value = "ERROR";
    previousExpression.textContent = '';
    setTimeout(() => {
      if (display.value === "ERROR") display.value = "";
    }, 2000);
  }
};

equalToBtn.addEventListener("click", evaluate);

// Clear
clearBtn.addEventListener("click", () => {
  display.value = "";
  previousExpression.textContent = '';
});

// Backspace
backspaceBtn.addEventListener("click", () => {
  if (display.value === "ERROR") {
    display.value = "";
  } else {
    display.value = display.value.slice(0, -1);
  }
});

// Memory Functions
mcBtn.addEventListener('click', () => {
  memory = 0;
  memoryIndicator.classList.remove('active');
});

mrBtn.addEventListener('click', () => {
  if (display.value === "ERROR") display.value = "";
  display.value += String(memory);
});

mPlusBtn.addEventListener('click', () => {
  try {
    const val = parseFloat(display.value) || 0;
    memory += val;
    memoryIndicator.classList.add('active');
  } catch(e) {}
});

mMinusBtn.addEventListener('click', () => {
  try {
    const val = parseFloat(display.value) || 0;
    memory -= val;
    memoryIndicator.classList.add('active');
  } catch(e) {}
});

msBtn.addEventListener('click', () => {
  try {
    memory = parseFloat(display.value) || 0;
    memoryIndicator.classList.add('active');
  } catch(e) {}
});

// Angle Mode Toggle
angleModeBtn.addEventListener('click', () => {
  isDegree = !isDegree;
  angleModeBtn.textContent = isDegree ? 'DEG' : 'RAD';
});

// History Functions
function addToHistory(expr, result) {
  const entry = { expr: expr, result: String(result), time: new Date().toLocaleTimeString() };
  history.unshift(entry);
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyPanel.innerHTML = '<div class="text-center text-gray-400 text-xs py-2">No history yet</div>';
    return;
  }

  historyPanel.innerHTML = history.map((item, index) => `
    <div class="history-item flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition" onclick="loadHistory(${index})">
      <div class="flex-1 min-w-0">
        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">${item.expr}</div>
        <div class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">= ${item.result}</div>
      </div>
      <span class="text-[10px] text-gray-400 ml-2">${item.time}</span>
    </div>
  `).join('');
}

function loadHistory(index) {
  display.value = history[index].result;
}

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('calcHistory');
  renderHistory();
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('calcDarkMode', isDark);
  updateThemeIcon();
});

function updateThemeIcon() {
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun text-yellow-400"></i>' : '<i class="fas fa-moon"></i>';
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' && e.target !== display) return;

  const key = e.key;

  if (/[0-9\.\+\-\*\/\(\)\%]/.test(key)) {
    e.preventDefault();
    if (display.value === "ERROR") display.value = "";
    display.value += key;
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluate();
  }

  if (key === 'Backspace') {
    e.preventDefault();
    if (display.value === "ERROR") {
      display.value = "";
    } else {
      display.value = display.value.slice(0, -1);
    }
  }

  if (key === 'Escape') {
    e.preventDefault();
    display.value = "";
    previousExpression.textContent = '';
  }

  if (key === 'm' || key === 'M') {
    e.preventDefault();
    // Quick memory store
    try {
      memory = parseFloat(display.value) || 0;
      memoryIndicator.classList.add('active');
    } catch(e) {}
  }
});

// Initialize on load
init();