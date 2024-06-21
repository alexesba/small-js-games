export function createBoard(width, height, [x, y]) {
  const board = new Array(height).fill(0).map(() => {
    return new Array(width).fill(0)
  });

  if (board[y]?.[x] == 0) {
    board[y][x] = 1
  }
  return board;
}
