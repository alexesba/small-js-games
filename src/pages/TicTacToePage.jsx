import { useEffect, useMemo, useRef, useState } from 'react';
import CanvasBoard from '../components/CanvasBoard';

const BOARD_WIDTH = 3;
const BOARD_HEIGHT = 3;
const SHAPE_SIZE = 150;
const player1 = 'o'
const player2 = 'x'
const draw = 'draw'
const winnerRules = [
  // horizontales
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],

  // verticales
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],

  // diagonales
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
]

function checkWinner(board) {
  if (winnerRules.find(rule => rule.every(([x, y]) => {
    return board[y][x] === player1
  }))) {
    return player1;
  }

  if (winnerRules.find(rule => rule.every(([x, y]) => board[y][x] === player2))) {
    return player2;
  }

  if (board.every(row => row.every(value => value != null))) {
    return draw;
  }
}

const INITIAL_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export function TicTacToePage() {
  const canvasRef = useRef(0);
  const [winner, setWinner] = useState(null);

  const [nextPlayer, setNextPlayer] = useState(undefined)

  const [score, setScore] = useState({
    [player1]: 0,
    [player2]: 0,
    [draw]: 0
  });

  const [board, updateBoard] = useState(INITIAL_BOARD)
  const [start, setStart] = useState(false)

  function drawMesh() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = BOARD_WIDTH * SHAPE_SIZE;
    canvas.height = BOARD_HEIGHT * SHAPE_SIZE;
    context.scale(SHAPE_SIZE, SHAPE_SIZE)
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.beginPath()

    context.strokeStyle = 'gray';
    context.lineWidth = 0.02;

    context.moveTo(0, 1)
    context.lineTo(3, 1)
    context.stroke()

    context.moveTo(1, 0)
    context.lineTo(1, 3)
    context.stroke()

    context.moveTo(0, 2)
    context.lineTo(3, 2)
    context.stroke()

    context.moveTo(2, 0)
    context.lineTo(2, 3)
    context.stroke()
    context.closePath();
  }

  function drawBoard() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineWidth = 0.04;
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === player1) {
          context.strokeStyle = 'violet'
          context.beginPath();
          context.arc(x + 0.5, y + 0.5, 0.25, 0, 2 * Math.PI)
          context.stroke();
          context.closePath();
        }
        if (value === player2) {
          context.beginPath();
          context.strokeStyle = 'blueviolet'
          context.moveTo(x + 0.75, y + 0.25)
          context.lineTo(x + 0.25, y + 0.75)
          context.moveTo(x + 0.25, y + 0.25)
          context.lineTo(x + 0.75, y + 0.75)
          context.stroke();
          context.closePath();
        }
      })
    })
  }

  useEffect(() => {
    drawMesh()
    drawBoard();
  });

  useEffect(() => {
    const winner = checkWinner(board);

    if (winner) {
      setWinner(winner);
      setScore(score => ({ ...score, [winner]: score[winner] + 1 }))
    }

  }, [board])

  function onClick(event) {
    const canvas = canvasRef.current;
    const x = event.offsetX;
    const y = event.offsetY;

    const w = canvas.width / 3;
    const h = canvas.height / 3;

    const posx = Math.ceil(x / w) - 1;
    const posy = Math.ceil(y / h) - 1;

    if (board[posy][posx] !== null) return;

    setNextPlayer(nextPlayer === player1 ? player2 : player1)

    updateBoard(board => {
      const newboard = board.map((row, y) => {
        return row.map((value, x) => {
          return (x === posx && y === posy && value === null) ? nextPlayer : value;
        })
      })
      return newboard;
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener('click', onClick)

    return () => canvas.removeEventListener('click', onClick);
  })

  const scoreText = useMemo(() => {
    return `P${player1}: ${score[player1]}, P${player2}: ${score[player2]}, Draw: ${score[draw]} `
  }, [score])

  return (
    <div className="container">
      {(winner === player1 || winner === player2 || winner === draw) && <div className="overlay">
        <ul>
          <li>
            The Winner is: Player {winner}
          </li>
          <li>
            <button onClick={() => {
              updateBoard(INITIAL_BOARD);
              setWinner(null);
            }}>Play Again</button>
          </li>
        </ul>
      </div>
      }
      {start === false &&
        <div className="overlay">
          <ul>
            <li>
              <button onClick={() => {
                setNextPlayer(player1)
                setStart(true);
              }}>Player O </button>
            </li>
            <li>
              <button onClick={() => {
                setNextPlayer(player2)
                setStart(true);
              }}>Player X</button>
            </li>
          </ul>
        </div>}
      <CanvasBoard ref={canvasRef} score={scoreText} />
    </div>
  )
}

export default TicTacToePage;
