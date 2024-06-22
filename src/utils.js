export function createBoard(width, height, position) {

  const board = new Array(height).fill(0).map(() => {
    return new Array(width).fill(0)
  });

  if (position) {
    board[position[1]][position[0]] = 1
  }

  return board;
}
