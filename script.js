const pageOne = document.getElementById("page-one");
const pageTwo = document.getElementById("page-two");
const openLetter = document.getElementById("open-letter");
const linesContainer = document.getElementById("lines");
const choices = document.getElementById("choices");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const finale = document.getElementById("finale");
const yesScreen = document.getElementById("yes-screen");
const countdown = document.getElementById("countdown");
const confetti = document.getElementById("confetti");
const sushiImages = document.querySelectorAll(".sushi-grid img");
const countdownNumber = document.getElementById("countdown-number");
const bgMusic = document.getElementById("bg-music");

const coffee = document.getElementById("coffee");
const heartPop = document.getElementById("heart-pop");
const flame = document.getElementById("flame");
const hearts = document.getElementById("hearts");
const catRow = document.getElementById("cat-row");

const lines = [
  "Maddy",
  "No day will be the same without you",
  "Seeing you in the morning is like holding a cup of hot coffee in my cold hands",
  "You warm my palms and make me feel hopeful and excited for the day",
  "Just the feeling of holding you close makes my heart smile",
  "You melt me with your lively expression and enthusiasm to life",
  "Your little engine inside you",
  "Turning and burning with the flame of your soul",
  "This valentine's day won't be the same without you",
  "Will you be my valentine?",
];

const triggers = {
  2: () => showEffect(coffee, "show", 2600),
  4: () => showEffect(heartPop, "show", 1800),
  7: () => showEffect(flame, "show", 2200),
  8: () => showEffect(hearts, "show", 2000),
};

let currentLine = 0;
let letterActive = false;
let noBase = null;
let revealArmed = false;
let revealRunning = false;
let musicStarted = false;

function getCurrentOffset(el) {
  const style = window.getComputedStyle(el);
  const transform = style.transform;
  if (!transform || transform === "none") {
    return { x: 0, y: 0 };
  }
  const matrixMatch = transform.match(/^matrix\((.+)\)$/);
  if (matrixMatch) {
    const parts = matrixMatch[1].split(",").map((part) => parseFloat(part.trim()));
    return { x: parts[4] || 0, y: parts[5] || 0 };
  }
  const matrix3dMatch = transform.match(/^matrix3d\((.+)\)$/);
  if (matrix3dMatch) {
    const parts = matrix3dMatch[1].split(",").map((part) => parseFloat(part.trim()));
    return { x: parts[12] || 0, y: parts[13] || 0 };
  }
  return { x: 0, y: 0 };
}

function startMusic() {
  if (!bgMusic || musicStarted) return;
  const playPromise = bgMusic.play();
  if (!playPromise || typeof playPromise.then !== "function") {
    musicStarted = true;
    return;
  }
  playPromise
    .then(() => {
      musicStarted = true;
    })
    .catch(() => {
      musicStarted = false;
    });
}

function showEffect(element, className, duration) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  setTimeout(() => element.classList.remove(className), duration);
}

function openSequence() {
  if (openLetter.classList.contains("opening")) return;
  openLetter.classList.add("opening");
  startMusic();

  setTimeout(() => {
    pageOne.style.display = "none";
    pageTwo.classList.add("show");
    pageTwo.setAttribute("aria-hidden", "false");
    letterActive = true;
    showNextLine();
  }, 650);
}

openLetter.addEventListener("click", openSequence);
openLetter.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSequence();
  }
});

["click", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, startMusic);
});

function showNextLine() {
  if (currentLine >= lines.length) return;
  if (currentLine === lines.length - 1) {
    linesContainer.innerHTML = "";
    linesContainer.classList.add("final");
    catRow.classList.add("show");
  } else {
    linesContainer.classList.remove("final");
    catRow.classList.remove("show");
  }
  addLine(lines[currentLine]);
  if (currentLine === lines.length - 1) {
    linesContainer.appendChild(catRow);
  }
  if (triggers[currentLine]) {
    triggers[currentLine]();
  }
  if (currentLine === lines.length - 1) {
    setTimeout(() => {
      choices.classList.add("show");
      cacheNoBase();
    }, 400);
  }
  currentLine += 1;
}

function addLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  if (catRow.parentElement === linesContainer) {
    linesContainer.insertBefore(line, catRow);
  } else {
    linesContainer.appendChild(line);
  }
}

function moveNoButton() {
  if (!noBase) return;
  const bounds = choices.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 6;
  const escapeBoost = 60;
  const minDistance = 120;
  const currentOffset = getCurrentOffset(noBtn);

  const minX = padding - noBase.x - escapeBoost;
  const maxX = bounds.width - btnRect.width - padding - noBase.x + escapeBoost;
  const minY = padding - noBase.y - escapeBoost;
  const maxY = bounds.height - btnRect.height - padding - noBase.y + escapeBoost;

  const maxDistance = Math.max(
    Math.hypot(minX - currentOffset.x, minY - currentOffset.y),
    Math.hypot(minX - currentOffset.x, maxY - currentOffset.y),
    Math.hypot(maxX - currentOffset.x, minY - currentOffset.y),
    Math.hypot(maxX - currentOffset.x, maxY - currentOffset.y),
  );
  const effectiveMin = Math.min(minDistance, maxDistance);

  let nextX = 0;
  let nextY = 0;
  let attempts = 0;

  do {
    nextX = randBetween(minX, maxX);
    nextY = randBetween(minY, maxY);
    attempts += 1;
  } while (
    attempts < 12 &&
    Math.hypot(nextX - currentOffset.x, nextY - currentOffset.y) < effectiveMin
  );

  if (
    Math.hypot(nextX - currentOffset.x, nextY - currentOffset.y) < effectiveMin
  ) {
    const candidates = [
      { x: minX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
    ];
    candidates.sort(
      (a, b) =>
        Math.hypot(b.x - currentOffset.x, b.y - currentOffset.y) -
        Math.hypot(a.x - currentOffset.x, a.y - currentOffset.y),
    );
    nextX = candidates[0].x;
    nextY = candidates[0].y;
  }

  noBtn.style.transform = `translate(${nextX}px, ${nextY}px)`;
}

function cacheNoBase() {
  noBtn.style.transform = "translate(0, 0)";
  noBase = { x: noBtn.offsetLeft, y: noBtn.offsetTop };
}

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

pageTwo.addEventListener("click", (event) => {
  if (!letterActive) return;
  if (choices.classList.contains("show")) return;
  if (event.target.closest("button")) return;
  showNextLine();
});

pageTwo.addEventListener("keydown", (event) => {
  if (!letterActive) return;
  if (choices.classList.contains("show")) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showNextLine();
  }
});

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("focus", moveNoButton);
noBtn.addEventListener("touchstart", moveNoButton);

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener("click", () => {
  pageTwo.classList.add("celebrate");
  yesScreen.setAttribute("aria-hidden", "false");
  launchConfetti();
  showEffect(hearts, "show", 2400);
  letterActive = false;
  revealArmed = true;
});

yesScreen.addEventListener("click", () => {
  if (!revealArmed || revealRunning) return;
  startCountdown();
});

function startCountdown() {
  revealRunning = true;
  revealArmed = false;
  countdown.classList.add("show");
  const numbers = [3, 2, 1];
  let index = 0;

  const tick = () => {
    if (index >= numbers.length) {
      if (countdownNumber) {
        countdownNumber.textContent = "";
      }
      countdown.classList.remove("show");
      finale.classList.add("show");
      revealSushi();
      launchConfetti();
      revealRunning = false;
      return;
    }
    if (countdownNumber) {
      countdownNumber.textContent = numbers[index];
      countdownNumber.classList.remove("pop");
      void countdownNumber.offsetWidth;
      countdownNumber.classList.add("pop");
    }
    index += 1;
    setTimeout(tick, 1400);
  };

  tick();
}

function revealSushi() {
  sushiImages.forEach((img, i) => {
    setTimeout(() => {
      img.classList.add("pop");
    }, i * 420);
  });
}

function launchConfetti() {
  if (!confetti) return;
  confetti.innerHTML = "";
  const colors = ["#ff6aa8", "#ffd1e4", "#ffb6d1", "#ff5d9e", "#ffe4f1", "#ff90c2"];
  const total = 70;
  for (let i = 0; i < total; i += 1) {
    const piece = document.createElement("span");
    const color = colors[i % colors.length];
    const delay = Math.random() * 0.8;
    const duration = 3.5 + Math.random() * 2;
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--c", color);
    piece.style.setProperty("--delay", `${delay}s`);
    piece.style.setProperty("--d", `${duration}s`);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
  }
}
