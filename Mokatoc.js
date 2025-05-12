
             //WebSocket
                         //זוהי טכנולוגיה שמאפשרת לדפדפן לתקשר עם שרת בזמן אמת
                        //היא מאפשרת לנו לשלוח ולקבל נתונים מהשרת מבלי לטעון מחדש את הדף
                       //היא מאוד שימושית למשחקים מרובי משתתפים   
let socket = null;    // מגגדיר משתנה שיהיה החיבור מול השרת (שורה17) וכרגע לא הוגדר החיבור
let mySymbol = null;  // הסמל של האיקס או אפס עדיין לא נבחר
let isMyTurn = false;  // משתנה שבודק אם תור השחקן הנוכחי או לא
                                        //gameMode = מגדיר את מערכת הכללילים של המשחק - איך שחקנים מצתרפים, הפסקת משחק, רמות וכדומה
function startGame(mode) {             //לאחר שהשחקן בחר את סוג המשחק (מולטי, קל, קשה), הפונקציה הזו תתחיל את המשחק
  gameMode = mode;                    //מגדיר את מצב המשחק (שחקן מול שחקן, קל, קשה)
  document.querySelector('.intro-screen').style.display = 'none';  //מסתיר את מסך הפתיחה (התמונה של זאוס עם כפתורי הבחירה).
  characterSelection.style.display = 'flex';                      //מציג את המסך שבו בוחרים דמות: קנטאור או מינוטאור.
  console.log("Game mode selected:", mode);                      //רושם הודעה בקונסול על סוג המשחק שנבחר.

  if (mode === "player") {                                                  //אם המשחק הוא מול שחקן אחר (לא מחשב)
    socket = new WebSocket('wss://www.mokafullstack.com/ws/');             //פעולה שמיצרת לנו את החיבור לשרת רק אם אנחנו משחקים מול שחקן אחר
    socket.onopen = () => {                                               //פונקציה שמופעלת כשיש חיבור לשרת
    console.log('🟢 Connected to multiplayer server');                  //רושם הודעה בקונסול שיש חיבור לשרת
    };

                                             //פונקצית חץ שבה אנחנו מגדירים מה יקרה כאשר מתקבלת הודעה מהשרת
    socket.onmessage = (event) => {         // נכנסת ההודעה שהתקבלה מהשרת  event לתוך האוביקט
      const msg = JSON.parse(event.data);  //הודעה שהתקבלה מהשרת מומרת לאוביקט ג'ייסון 
                                          //הנתונים שנשלחים מהשרת מגיעים כטקסט (מחרוזת).
                                         //כדי לעבוד עם הנתונים האלה, אנחנו צריכים להמיר אותם לאובייקט ג'ייסון.
                                        //with json.parse we translate the string to an object that js can understand
      console.log('📨 Received:', msg);// רושם את ההודעה שהתקבלה בקונסול

      if (msg.type === 'start') {                //אם ההודעה מהשרת להתחיל
        mySymbol = msg.symbol;                  //mySymbol מהשרת נשלח הסימן איקס או אפס ונשמר במשתנה  
        isMyTurn = (mySymbol === 'X');         //אים השחקן הוא איקס אז זה התור שלו (איקס זה הקנטור)
        console.log('🎮 You are', mySymbol);  // רושם בקונסולה את הסימן
      }

      if (msg.type === 'move') {
        makeMove(msg.index, msg.symbol);
        const winningCombo = getWinningCombo(msg.symbol);
        if (winningCombo) {
          highlightWinningCells(winningCombo, msg.symbol);
          return;
        }
        isMyTurn = (msg.symbol !== mySymbol);
      }
    };
  } else {
                                // במצב משחק מול המחשב השחקן בוחר בקנטור
    mySymbol = "centaur";
    isMyTurn = true;
  }
}

// -----------------------------
// הגדרות כלליות
// -----------------------------

                       // כאן נגדיר את סוג המשחק (שחקן מול שחקן, קל, קשה)
let gameMode = "player";                                                              // מצב משחק קל או קשה
                    // הגדרת נתיב לתמונות ורכיבים 
const centaurImg = "centaur.png";                                                   // תמונת הקנטאור
const minotaurImg = "minotaur.png";                                                // תמונת המינוטאור
const minotaurButton = document.getElementById('minotaurButton');                 // כפתור מינוטאור 
const centaurButton = document.getElementById('centaurButton');                  // כפתור קנטאור
const characterSelection = document.querySelector('.characters');               // מסך בחירת דמויות
const battleGrid = document.querySelector('.battle-grid');                     // לוח הקרב
const winnerDisplay = document.querySelector('.winner-display');              // אנימציה של המנצח

        // כאן נתחיל את מצב השחקן הנוכחי והלוח
let currentPlayer = "centaur";                                 // השחקן הנוכחי הוא קנטאור 
let board = Array(9).fill(null);                              // נגדיר את הלוח כמשתנה ריק (לא תפוס)  
const cells = document.querySelectorAll('.cell');            // כל התאים בלוח המשחק

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
  if (currentPlayer === "minotaur") {
    setTimeout(() => {
      if (gameMode === "easy-ai") {
        easyAIMove();
      } else if (gameMode === "hard-ai") {
        hardAIMove();
      }
    }, 600);
  }
  
});

// -----------------------------
// האזנה ללחיצות על תאים בלוח
// -----------------------------

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = +cell.dataset.index;
        if (!isMyTurn) return;                                                                // אם זה לא התור שלך אל תאפשר לעשות מהלך

    // אם התא תפוס או אם תור המחשב – לא לעשות כלום
    if (board[index] || (gameMode.includes('ai') && currentPlayer === "minotaur")) return;

          makeMove(index, mySymbol);

    if (gameMode === "player") {
      socket.send(JSON.stringify({ type: 'move', index, symbol: mySymbol }));
      isMyTurn = false;
    } else if (gameMode === "easy-ai") {
      setTimeout(easyAIMove, 600);
    } else if (gameMode === "hard-ai") {
      setTimeout(hardAIMove, 600);
    }

 // ביצוע מהלך

    const winningCombo = getWinningCombo(mySymbol);

    if (winningCombo) {
      highlightWinningCells(winningCombo, mySymbol);

      return;
    }

    if (!board.includes(null)) {
      showWinnerButton("draw");                               // תיקו
      return;
    }

   

    //  עכשיו תור המחשב – לקרוא לפונקציית 
    if (currentPlayer === "minotaur") {
      setTimeout(() => {
        if (gameMode === "easy-ai") {
          easyAIMove();
        } else if (gameMode === "hard-ai") {
          hardAIMove();
        }
      }, 600);
    }
    
  });
});

// -----------------------------
// פעולת ביצוע מהלך
// -----------------------------

function makeMove(index, symbol) {
  if (board[index]) return;

  board[index] = symbol;
  cells[index].classList.add('taken');
  const img = document.createElement('img');
 img.src = symbol === "centaur" || symbol === "X" ? centaurImg : minotaurImg;

  img.alt = symbol;
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

function highlightWinningCells(winningCombo, symbol) {
  cells.forEach(cell => cell.classList.add('taken'));
  cells.forEach((cell, index) => {
    if (!winningCombo.includes(index)) {
      setTimeout(() => {
        cell.classList.add('fade');
        setTimeout(() => cell.innerHTML = '', 500);
      }, index * 100);
    }
  });
  setTimeout(() => showWinnerButton(symbol), 1200);
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
// חתירה לניצחון של המחשב
// -----------------------------

function hardAIMove() {
  // 1. Try to win if possible
  for (const combo of winConditions) {
    const [a, b, c] = combo;
    const values = [board[a], board[b], board[c]];
    const aiCount = values.filter(v => v === "minotaur").length;
    const emptyIndex = [a, b, c].find(i => board[i] === null);
    if (aiCount === 2 && emptyIndex !== undefined) {
      return makeAIMove(emptyIndex); // WIN
    }
  }

  // חסימה של המחשב לרצף של שניים
  for (const combo of winConditions) {
    const [a, b, c] = combo;
    const values = [board[a], board[b], board[c]];
    const playerCount = values.filter(v => v === "centaur").length;
    const emptyIndex = [a, b, c].find(i => board[i] === null);
    if (playerCount === 2 && emptyIndex !== undefined) {
      return makeAIMove(emptyIndex); // BLOCK
    }
  }

  // אם המרכז פנוי תקח אותו
  if (!board[4]) return makeAIMove(4);

  // שלב הבא תקח פינה של הלוח
  const corners = [0, 2, 6, 8];
  const freeCorner = corners.find(i => !board[i]);
  if (freeCorner !== undefined) return makeAIMove(freeCorner);

  // תקח תא פנוי
  const empty = board.findIndex(cell => cell === null);
  if (empty !== -1) makeAIMove(empty);
}

// גם במצב קל אותה הלוגיקה של מצב קשה
function easyAIMove() {
  // תחסום אם לשחקן יש רצף של שניים
  for (const combo of winConditions) {
    const [a, b, c] = combo;
    const values = [board[a], board[b], board[c]];
    const playerCount = values.filter(v => v === "centaur").length;
    const emptyIndex = [a, b, c].find(i => board[i] === null);
    if (playerCount === 2 && emptyIndex !== undefined) {
      return makeAIMove(emptyIndex); 
    }
  }

  // תבחר תא אקראי
  const emptyIndices = board
    .map((value, index) => value === null && index !== 4 ? index : null)
    .filter(index => index !== null);

  if (emptyIndices.length > 0) {
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    makeAIMove(randomIndex);
  } else if (board[4] === null) {
    // fallback: if center is the only option left
    makeAIMove(4);
  }
}


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
  currentPlayer = "centaur";
}
