<<<<<<< HEAD
"use strict";

const drawForm = document.getElementById("sorteador-form");
const quantityInput = document.getElementById("quantidade");
const fromInput = document.getElementById("de");
const toInput = document.getElementById("ate");
const sortInput = document.getElementById("ordenar");
const resetButton = document.getElementById("btn-reiniciar");
const formMessage = document.getElementById("form-message");
const resultBox = document.getElementById("resultado");
const resultNumbers = document.getElementById("result-numbers");
const drawInputs = [quantityInput, fromInput, toInput];

function setFormError(message, invalidInput) {
  formMessage.textContent = message;
  drawInputs.forEach((input) => input.removeAttribute("aria-invalid"));

  invalidInput.setAttribute("aria-invalid", "true");
  invalidInput.focus();
}

function clearFormError() {
  formMessage.textContent = "";
  drawInputs.forEach((input) => input.removeAttribute("aria-invalid"));
}

function validateDraw(quantity, from, to) {
  if (quantityInput.value.trim() === "") {
    return { message: "Informe quantos números você quer sortear.", input: quantityInput };
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return { message: "A quantidade deve ser um número inteiro entre 1 e 100.", input: quantityInput };
  }

  if (fromInput.value.trim() === "" || !Number.isInteger(from)) {
    return { message: "Informe um valor inicial inteiro.", input: fromInput };
  }

  if (toInput.value.trim() === "" || !Number.isInteger(to)) {
    return { message: "Informe um valor final inteiro.", input: toInput };
  }

  if (from >= to) {
    return { message: "O valor inicial precisa ser menor que o valor final.", input: fromInput };
  }

  const availableNumbers = to - from + 1;

  if (!Number.isSafeInteger(availableNumbers)) {
    return { message: "Esse intervalo é grande demais. Use valores menores.", input: toInput };
  }

  if (quantity > availableNumbers) {
    const message = availableNumbers === 1
      ? "Esse intervalo possui apenas 1 número disponível."
      : `Esse intervalo possui apenas ${availableNumbers} números disponíveis.`;

    return { message, input: quantityInput };
  }

  return null;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueNumbers(quantity, from, to) {
  const numbers = new Set();

  while (numbers.size < quantity) {
    numbers.add(getRandomNumber(from, to));
  }

  return [...numbers];
}

function renderResult(numbers) {
  resultNumbers.replaceChildren();
  resultBox.classList.add("has-result");

  numbers.forEach((number, index) => {
    const chip = document.createElement("span");
    chip.className = "number-chip";
    chip.textContent = number;
    chip.style.animationDelay = `${Math.min(index * 45, 450)}ms`;
    resultNumbers.appendChild(chip);
  });
}

function resetResult() {
  const placeholder = document.createElement("p");
  placeholder.className = "result-placeholder";
  placeholder.textContent = "Seus números aparecerão aqui.";

  resultBox.classList.remove("has-result");
  resultNumbers.replaceChildren(placeholder);
}

drawForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const quantity = Number(quantityInput.value);
  const from = Number(fromInput.value);
  const to = Number(toInput.value);
  const error = validateDraw(quantity, from, to);

  if (error) {
    setFormError(error.message, error.input);
    return;
  }

  clearFormError();
  const numbers = generateUniqueNumbers(quantity, from, to);

  if (sortInput.checked) {
    numbers.sort((a, b) => a - b);
  }

  renderResult(numbers);
  resetButton.disabled = false;
});

drawForm.addEventListener("reset", () => {
  clearFormError();
  resetResult();
  resetButton.disabled = true;
  requestAnimationFrame(() => quantityInput.focus());
});

drawForm.addEventListener("input", () => {
  clearFormError();
  const hasValues = drawInputs.some((input) => input.value !== "") || sortInput.checked;
  resetButton.disabled = !hasValues;
});

const display = document.getElementById("display");
const historyDisplay = document.getElementById("calc-history");
const calculatorKeys = document.getElementById("calculator-keys");

const calculatorState = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForOperand: false,
  lastOperand: null,
  lastOperator: null,
  error: false
};

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷"
};

function normalizeNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Resultado inválido");
  }

  return Number.parseFloat(value.toPrecision(12));
}

function formatDisplayValue(value) {
  if (typeof value === "string" && (value.endsWith(".") || value === "-0")) {
    return value.replace(".", ",");
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Não foi possível calcular";
  }

  const absolute = Math.abs(number);
  if (absolute >= 1e12 || (absolute > 0 && absolute < 1e-7)) {
    return number.toExponential(7).replace(".", ",");
  }

  return String(number).replace(".", ",");
}

function updateCalculatorDisplay() {
  display.value = calculatorState.error
    ? "Não foi possível calcular"
    : formatDisplayValue(calculatorState.displayValue);

  display.classList.toggle("is-error", calculatorState.error);

  document.querySelectorAll("[data-operator]").forEach((button) => {
    const isActive = calculatorState.waitingForOperand
      && button.dataset.operator === calculatorState.operator;

    button.classList.toggle("is-active", isActive);
  });
}

function clearCalculator() {
  calculatorState.displayValue = "0";
  calculatorState.firstOperand = null;
  calculatorState.operator = null;
  calculatorState.waitingForOperand = false;
  calculatorState.lastOperand = null;
  calculatorState.lastOperator = null;
  calculatorState.error = false;
  historyDisplay.textContent = "\u00A0";
}

function inputDigit(digit) {
  if (calculatorState.error) {
    clearCalculator();
  }

  if (calculatorState.waitingForOperand) {
    calculatorState.displayValue = digit;
    calculatorState.waitingForOperand = false;

    if (calculatorState.operator === null) {
      calculatorState.lastOperator = null;
      calculatorState.lastOperand = null;
      historyDisplay.textContent = "\u00A0";
    }

    return;
  }

  calculatorState.displayValue = calculatorState.displayValue === "0"
    ? digit
    : (calculatorState.displayValue + digit).slice(0, 15);
}

function inputDecimal() {
  if (calculatorState.error) {
    clearCalculator();
  }

  if (calculatorState.waitingForOperand) {
    calculatorState.displayValue = "0.";
    calculatorState.waitingForOperand = false;

    if (calculatorState.operator === null) {
      calculatorState.lastOperator = null;
      calculatorState.lastOperand = null;
      historyDisplay.textContent = "\u00A0";
    }

    return;
  }

  if (!calculatorState.displayValue.includes(".")) {
    calculatorState.displayValue += ".";
  }
}

function calculate(firstOperand, secondOperand, operator) {
  let result;

  switch (operator) {
    case "+":
      result = firstOperand + secondOperand;
      break;
    case "-":
      result = firstOperand - secondOperand;
      break;
    case "*":
      result = firstOperand * secondOperand;
      break;
    case "/":
      if (secondOperand === 0) {
        throw new Error("Divisão por zero");
      }
      result = firstOperand / secondOperand;
      break;
    default:
      return secondOperand;
  }

  return normalizeNumber(result);
}

function setCalculatorError() {
  calculatorState.error = true;
  calculatorState.firstOperand = null;
  calculatorState.operator = null;
  calculatorState.waitingForOperand = true;
  historyDisplay.textContent = "Verifique a operação";
}

function handleOperator(nextOperator) {
  if (calculatorState.error) {
    clearCalculator();
    return;
  }

  const inputValue = Number.parseFloat(calculatorState.displayValue);

  if (calculatorState.operator && calculatorState.waitingForOperand) {
    calculatorState.operator = nextOperator;
    historyDisplay.textContent =
      `${formatDisplayValue(calculatorState.firstOperand)} ${operatorSymbols[nextOperator]}`;
    return;
  }

  if (calculatorState.firstOperand === null) {
    calculatorState.firstOperand = inputValue;
  } else if (calculatorState.operator) {
    try {
      const result = calculate(calculatorState.firstOperand, inputValue, calculatorState.operator);
      calculatorState.displayValue = String(result);
      calculatorState.firstOperand = result;
    } catch {
      setCalculatorError();
      return;
    }
  }

  calculatorState.operator = nextOperator;
  calculatorState.waitingForOperand = true;
  calculatorState.lastOperator = null;
  calculatorState.lastOperand = null;
  historyDisplay.textContent =
    `${formatDisplayValue(calculatorState.firstOperand)} ${operatorSymbols[nextOperator]}`;
}

function calculateResult() {
  if (calculatorState.error) {
    clearCalculator();
    return;
  }

  let operator = calculatorState.operator;
  let secondOperand = Number.parseFloat(calculatorState.displayValue);
  let firstOperand = calculatorState.firstOperand;

  if (!operator && calculatorState.lastOperator !== null) {
    operator = calculatorState.lastOperator;
    secondOperand = calculatorState.lastOperand;
    firstOperand = Number.parseFloat(calculatorState.displayValue);
  }

  if (!operator || firstOperand === null) {
    return;
  }

  if (calculatorState.waitingForOperand) {
    secondOperand = firstOperand;
  }

  try {
    const result = calculate(firstOperand, secondOperand, operator);
    historyDisplay.textContent =
      `${formatDisplayValue(firstOperand)} ${operatorSymbols[operator]} ${formatDisplayValue(secondOperand)} =`;
    calculatorState.displayValue = String(result);
    calculatorState.firstOperand = null;
    calculatorState.operator = null;
    calculatorState.waitingForOperand = true;
    calculatorState.lastOperator = operator;
    calculatorState.lastOperand = secondOperand;
  } catch {
    setCalculatorError();
  }
}

function toggleSign() {
  if (calculatorState.error) {
    clearCalculator();
    return;
  }

  calculatorState.displayValue = String(Number.parseFloat(calculatorState.displayValue) * -1);
}

function applyPercent() {
  if (calculatorState.error) {
    clearCalculator();
    return;
  }

  const current = Number.parseFloat(calculatorState.displayValue);
  calculatorState.displayValue = String(normalizeNumber(current / 100));
}

function backspace() {
  if (calculatorState.error) {
    clearCalculator();
    return;
  }

  if (calculatorState.waitingForOperand) {
    return;
  }

  calculatorState.displayValue = calculatorState.displayValue.length > 1
    ? calculatorState.displayValue.slice(0, -1)
    : "0";

  if (calculatorState.displayValue === "-") {
    calculatorState.displayValue = "0";
  }
}

function handleCalculatorAction(target) {
  const number = target.dataset.number;
  const operator = target.dataset.operator;
  const action = target.dataset.action;

  if (number !== undefined) {
    inputDigit(number);
  } else if (operator) {
    handleOperator(operator);
  } else if (action === "decimal") {
    inputDecimal();
  } else if (action === "clear") {
    clearCalculator();
  } else if (action === "sign") {
    toggleSign();
  } else if (action === "percent") {
    applyPercent();
  } else if (action === "equals") {
    calculateResult();
  }

  updateCalculatorDisplay();
}

calculatorKeys.addEventListener("click", (event) => {
  const key = event.target.closest(".key");

  if (key) {
    handleCalculatorAction(key);
  }
});

document.addEventListener("keydown", (event) => {
  if (document.activeElement?.matches("input[type='number']")) {
    return;
  }

  const keyMap = {
    Enter: '[data-action="equals"]',
    "=": '[data-action="equals"]',
    Escape: '[data-action="clear"]',
    Delete: '[data-action="clear"]',
    ",": '[data-action="decimal"]',
    ".": '[data-action="decimal"]',
    "+": '[data-operator="+"]',
    "-": '[data-operator="-"]',
    "*": '[data-operator="*"]',
    "/": '[data-operator="/"]',
    "%": '[data-action="percent"]'
  };

  let selector = keyMap[event.key];

  if (/^\d$/.test(event.key)) {
    selector = `[data-number="${event.key}"]`;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
    updateCalculatorDisplay();
    return;
  }

  if (!selector) {
    return;
  }

  const keyButton = calculatorKeys.querySelector(selector);

  if (!keyButton) {
    return;
  }

  event.preventDefault();
  handleCalculatorAction(keyButton);
  keyButton.classList.add("is-pressed");
  window.setTimeout(() => keyButton.classList.remove("is-pressed"), 110);
});

updateCalculatorDisplay();
=======
function sortear() {
    let quant = parseInt(document.getElementById("quantidade").value);
    let de = parseInt(document.getElementById('de').value);
    let ate = parseInt(document.getElementById('ate').value);

    if (de >= ate) {
        alert('tá de sacanagem né');
        reiniciar();
        ligarBotao();
    } else if (quant > (ate - de + 1)) {
        alert('safada');
        reiniciar();
        ligarBotao();
    } else {
        let sorteados = [];
        let numero;

        for (let i = 0; i < quant; i++) {
            numero = obterNumeroAleatorio(de, ate);

            while (sorteados.includes(numero)) {
                numero = obterNumeroAleatorio(de, ate);
            }

            sorteados.push(numero);
        }

        ligarBotao();

        document.getElementById('resultado').innerHTML =
          `<label>Numerus roubados: ${sorteados}</label>`;
    }
}

function ligarBotao() {
    let butao = document.getElementById('btn-reiniciar');

    if (butao.classList.contains('container__botao-desabilitado')) {
        butao.classList.remove('container__botao-desabilitado');
        butao.classList.add('container__botao');
    } else {
        butao.classList.remove('container__botao');
        butao.classList.add('container__botao-desabilitado');
    }
}

function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function reiniciar() {
    document.getElementById("quantidade").value = '';
    document.getElementById('de').value = '';
    document.getElementById('ate').value = '';

    document.getElementById('resultado').innerHTML =
      `<label>numerus roubados: <span>nenhum até agora</span></label>`;

    ligarBotao();
}

/* ——— CALCULADORA ——— */

function add(value) {
    document.getElementById("display").value += value;
}

function resultado() {
    try {
        document.getElementById("display").value =
            eval(document.getElementById("display").value);
    } catch {
        document.getElementById("display").value = "Erro";
    }
}
>>>>>>> 02fb7aab5e367ad81280d9ed5b1fe418030550be
