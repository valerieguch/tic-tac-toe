// Assumptions:
// - number of rows and columns are equal
// - canvas is square
// - X always makes a move first (TODO unnecessary limitation)

const SIZE     = 19; // Number of rows (equal to columns)
const SIZE_WIN = 6;  // Row length needed to win

const WIDTH    = 850;          // canvas width in px, TODO hardcode
const CELL_W   = WIDTH / SIZE; // width of one cell in px

const nextPlayer = getNextPlayer666;

const cell = {
  Empty: 0,
  X:     1,
  O:     2,
};

const canvas = document.querySelector("#board");
const ctx    = canvas.getContext("2d");

canvas.width  = WIDTH;
canvas.height = WIDTH;

// Mutable state
const board = new Uint8Array(SIZE * SIZE).fill(cell.Empty);

let currentPlayer = cell.X;
let freeCellsNum  = SIZE * SIZE;

// TODO which is better?
// board[row * SIZE + col];
// board[x + y * SIZE];

drawEmptyField();
updatePage(`Ход игрока ${currentPlayer === cell.X ? "X" : "O"}`);

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x    = e.clientX - rect.left;
  const y    = e.clientY - rect.top;
  handleClick(x, y);
});

function drawEmptyField() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, WIDTH, WIDTH);

  ctx.strokeStyle = "black";
  ctx.lineWidth   = 1;
  // Vertical lines
  for (let i = 0; i < SIZE - 1; i++) {
    const x = (i + 1) * CELL_W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WIDTH);
    ctx.stroke();
  }
  // Horizontal lines
  for (let i = 0; i < SIZE - 1; i++) {
    const y = (i + 1) * CELL_W;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCross(row, col) {
  ctx.save();

  ctx.lineWidth   = CELL_W / 10;
  ctx.strokeStyle = "#66b3ff";
  ctx.lineCap     = "round";

  const scale      = CELL_W * 2 / 3;
  const translateX = CELL_W * (col + 1) - (5 * CELL_W / 6);
  const translateY = CELL_W * (row + 1) - (5 * CELL_W / 6);
  ctx.save();
  ctx.transform(scale, 0, 0, scale, translateX, translateY);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(1, 1);
  ctx.moveTo(0, 1);
  ctx.lineTo(1, 0);
  ctx.restore();
  ctx.stroke();

  ctx.restore();
}

function drawCircle(row, col) {
  ctx.save();

  ctx.lineWidth   = CELL_W / 10;
  ctx.strokeStyle = "#ffaa80";

  const x      = CELL_W * (col + 1) - (CELL_W / 2);
  const y      = CELL_W * (row + 1) - (CELL_W / 2);
  const radius = CELL_W / 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawLine([row1, col1, row2, col2]) {
  ctx.save();

  ctx.lineWidth   = CELL_W / 10;
  ctx.strokeStyle = "red";
  ctx.lineCap     = "round";

  const offset    = CELL_W / 2.5;

  const x1 = CELL_W * (col1 + 1) - (CELL_W / 2);
  const y1 = CELL_W * (row1 + 1) - (CELL_W / 2);
  const x2 = CELL_W * (col2 + 1) - (CELL_W / 2);
  const y2 = CELL_W * (row2 + 1) - (CELL_W / 2);

  const offx = Math.sign(col2 - col1) * offset;
  const offy = Math.sign(row2 - row1) * offset;

  ctx.beginPath();
  ctx.moveTo(x1 - offx, y1 - offy);
  ctx.lineTo(x2 + offx, y2 + offy);
  ctx.stroke();

  ctx.restore();
}

function checkCombo(row, col, rowInc, colInc) {
  function outOfBorders(row, col) {
    return (row < 0 || col < 0 || row >  SIZE - 1 || col > SIZE - 1);
  }

  player = board[row * SIZE + col];

  // TODO hard to reason about
  // If we can move to a cell and that cell is player, move here
  while (!outOfBorders(row - rowInc, col - colInc) &&
         board[(row - rowInc) * SIZE + (col - colInc)] === player) {
    row -= rowInc;
    col -= colInc;
  }

  const startRow = row;
  const startCol = col;

  let combo = 0;

  // If this cell is valid and is player, move further, increase combo
  while (!outOfBorders(row, col) && board[row * SIZE + col] === player) {
    combo++;
    row += rowInc;
    col += colInc;
  }

  const endRow = row - rowInc;
  const endCol = col - colInc;

  if (combo < SIZE_WIN)
    return false;
  // return true;
  return [startRow, startCol, endRow, endCol];
}

function checkWin(row, col) {
  return (checkCombo(row, col, 1, 0) ||
          checkCombo(row, col, 0, 1) ||
          checkCombo(row, col, 1, 1) ||
          checkCombo(row, col, -1, 1));
}

function getNextPlayer666() {
  const movesMade = SIZE * SIZE - freeCellsNum;
  if (Math.floor((movesMade - 1) / 2) % 2 === 0)
    return cell.O;
  return cell.X;
}

function getNextPlayer() {
  if (currentPlayer === cell.X)
    return cell.O;
  return cell.X;
}

function handleClick(x, y) {
  [row, col] = getCellPos(x, y);
  console.log(`x: ${x}, y: ${y}, row: ${row}, col: ${col}`);

  if (board[row * SIZE + col] !== cell.Empty)
    return;

  board[row * SIZE + col] = currentPlayer;

  updateState();

  let victoryLine = null;
  if ((victoryLine = checkWin(row, col))) {
    updatePage(`Победа игрока ${currentPlayer === cell.X ? "X" : "O"}`);
    drawLine(victoryLine);
  }
  else if (freeCellsNum === 0)
    updatePage("Ничья!");
  else
    updatePage(`Ход игрока ${nextPlayer() === cell.X ? "X" : "O"}`);

  // currentPlayer = getNextPlayer();
  currentPlayer = nextPlayer();
}

function updateState() {
  freeCellsNum--;

  if (currentPlayer === cell.X) {
    drawCross(row, col);
  } else {
    drawCircle(row, col);
  }

  // currentPlayer = nextPlayer();
}

function reset() {
  board.fill(0);
  console.log(board);
  drawEmptyField();
  currentPlayer = cell.X; // TODO maybe make this customizable
  updatePage(`Ход игрока ${nextPlayer() === cell.X ? "X" : "O"}`);
}

function updatePage(info) {
  document.querySelector("#playerMove").innerHTML = info;
}

// TODO maybe return x and y instead of row and col (swapped order)
function getCellPos(x, y) {
  return [Math.floor(y / CELL_W), Math.floor(x / CELL_W)];
}
