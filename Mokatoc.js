
// -----------------------------
// הגדרות כלליות
// -----------------------------

// כאן נגדיר את סוג המשחק (שחקן מול שחקן, מחשב קל, מחשב חכם)
let gameMode = "player"; // player, easy-ai, hard-ai

// הגדרת נתיבי תמונות ואחיזות של רכיבים HTML
const centaurImg = "centaur.png"; // תמונת הקנטאור
const minotaurImg = "minotaur.png"; // תמונת המינוטאור
const minotaurButton = document.getElementById('minotaurButton');
const centaurButton = document.getElementById('centaurButton');
const characterSelection = document.querySelector('.characters');
const battleGrid = document.querySelector('.battle-grid');
const winnerDisplay = document.querySelector('.winner-display');

// כאן נתחיל את מצב השחקן הנוכחי והלוח
let currentPlayer = "centaur";
let board = Array(9).fill(null);
const cells = document.querySelectorAll('.cell');

// הגדרת תנאי ניצחון
const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// -----------------------------
// מסך פתיחה – בחירת סוג משחק
// -----------------------------

document.getElementById('vs-player').onclick = () => startGame('player');
document.getElementById('easy-ai').onclick = () => startGame('easy-ai');
document.getElementById('hard-ai').onclick = () => startGame('hard-ai');

function startGame(mode) {
  gameMode = mode;
  document.querySelector('.intro-screen').style.display = 'none';
  characterSelection.style.display = 'flex'; // מציגים את בחירת הדמויות
  console.log("Game mode selected:", mode);
}

// -----------------------------
// שלב בחירת דמות
// -----------------------------

centaurButton.addEventListener('click', () => {
  currentPlayer = "centaur";
  characterSelection.style.display = 'none';
  battleGrid.style.display = 'grid';
});

minotaurButton.addEventListener('click', () => {
  currentPlayer = "minotaur";
  characterSelection.style.display = 'none';
  battleGrid.style.display = 'grid';
  if (gameMode.includes('ai')) {
    setTimeout(hardAIMove, 500); // המחשב מתחיל לשחק אם זה AI
  }
});

// -----------------------------
// האזנה ללחיצות על תאים בלוח
// -----------------------------

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = +cell.dataset.index;
    // אם התא תפוס או אם תור המחשב – לא לעשות כלום
    if (board[index] || (gameMode.includes('ai') && currentPlayer === "minotaur")) return;

    makeMove(index); // ביצוע מהלך

    const winningCombo = getWinningCombo(currentPlayer);
    if (winningCombo) {
      highlightWinningCells(winningCombo);
      return;
    }

    if (!board.includes(null)) {
      showWinnerButton("draw"); // תיקו
      return;
    }

    currentPlayer = currentPlayer === "centaur" ? "minotaur" : "centaur";

    // אם עכשיו תור המחשב – לקרוא לפונקציית AI
    if (gameMode.includes('ai') && currentPlayer === "minotaur") {
      setTimeout(hardAIMove, 600);
    }
  });
});

// -----------------------------
// פעולת ביצוע מהלך
// -----------------------------

function makeMove(index) {
  board[index] = currentPlayer;
  cells[index].classList.add('taken');
  const img = document.createElement('img');
  img.src = currentPlayer === "centaur" ? centaurImg : minotaurImg;
  img.alt = currentPlayer;
  cells[index].appendChild(img);
}

// -----------------------------
// בדיקת תנאי ניצחון
// -----------------------------

function getWinningCombo(player) {
  return winConditions.find(combo => combo.every(index => board[index] === player));
}

// -----------------------------
// אפקטים לאחר ניצחון
// -----------------------------

function highlightWinningCells(winningCombo) {
  cells.forEach(cell => cell.classList.add('taken'));
  cells.forEach((cell, index) => {
    if (!winningCombo.includes(index)) {
      setTimeout(() => {
        cell.classList.add('fade');
        setTimeout(() => cell.innerHTML = '', 500);
      }, index * 100);
    }
  });
  setTimeout(() => showWinnerButton(currentPlayer), 1200);
}

// -----------------------------
// הצגת תוצאה בסיום המשחק
// -----------------------------

function showWinnerButton(winner) {
  winnerDisplay.innerHTML = '';
  winnerDisplay.style.display = 'flex';
  if (winner === "draw") {
    [centaurImg, minotaurImg].forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = "Restart";
      img.onclick = () => location.reload();
      winnerDisplay.appendChild(img);
    });
  } else {
    const img = document.createElement('img');
    img.src = winner === "centaur" ? centaurImg : minotaurImg;
    img.alt = "Winner";
    img.onclick = () => location.reload();
    winnerDisplay.appendChild(img);
  }
}

// -----------------------------
// לוגיקה פשוטה של מחשב "חכם"
// -----------------------------

function hardAIMove() {
  // אם המרכז פנוי – לקחת אותו
  if (!board[4]) return makeAIMove(4);

  // אחרת – אם הפינה הראשונה פנויה
  if (!board[0]) return makeAIMove(0);

  // בדיקת מצבים בסיסיים לתגובה
  const playerMoves = board.map((v, i) => v === "centaur" ? i : null).filter(i => i !== null);
  const aiMoves = board.map((v, i) => v === "minotaur" ? i : null).filter(i => i !== null);

  // אם שחקן במרכז והמחשב בפינה – לנסות לחסום
  if (aiMoves.includes(4) && playerMoves.includes(0)) {
    const blockIndex = [1, 3, 5, 7].find(i => !board[i]);
    if (blockIndex !== undefined) return makeAIMove(blockIndex);
  }

  // ברירת מחדל – בחר את התא הפנוי הראשון
  const empty = board.findIndex(cell => cell === null);
  if (empty !== -1) makeAIMove(empty);
}

// אנו משתמשים בלוגיקה של hard גם למצב easy כרגע
const easyAIMove = hardAIMove;

// -----------------------------
// ביצוע מהלך של המחשב
// -----------------------------

function makeAIMove(index) {
  board[index] = "minotaur";
  const cell = cells[index];
  cell.classList.add('taken');
  const img = document.createElement('img');
  img.src = minotaurImg;
  img.alt = "minotaur";
  cell.appendChild(img);

  const winningCombo = getWinningCombo("minotaur");
  if (winningCombo) {
    highlightWinningCells(winningCombo);
    return;
  }

  if (!board.includes(null)) {
    showWinnerButton("draw");
    return;
  }

  currentPlayer = "centaur";
}
