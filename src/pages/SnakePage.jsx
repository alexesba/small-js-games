import { useCallback, useEffect, useRef, useState } from "react";
import CanvasBoard from "../components/CanvasBoard"
import { createBoard } from "../utils";

function snakeParts(snake) {
  const [tail, ...body] = snake;
  const last = body[body.length - 1]
  return [tail, body, last]
}

const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;
const SHAPE_SIZE = 23;

function getCords(snake) {
  const validCords = [];
  const temp = new Array(BOARD_HEIGHT).fill(0).map(() => new Array(BOARD_WIDTH).fill(0))

  temp.forEach((row, y) => {
    row.forEach((_, x) => {

      if (!snake?.find((posx, posy) => posx === x && posy === y)) {
        validCords.push([x, y])
      }
    })
  })

  const cords = validCords[Math.floor(Math.random() * validCords.length - 1)]

  return cords
}

export function SnakePage() {
  const canvasRef = useRef(0);
  const requestRef = useRef(0);
  const [snake, setSnake] = useState([[0,1], [1, 1]]);


  const [board, setBoard] = useState(createBoard(BOARD_WIDTH, BOARD_HEIGHT, getCords(snake)))
  const [score, setScore] = useState(0);

  const [pause, setPause] = useState(false);

  const togglePause = useCallback(() => {
    return setPause(!pause)
  },
    [pause]
  )

  const [updatedTime, setUpdatedTime] = useState(null);
  const [currentDirection, setDirection] = useState('y')

  const drawItem = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'yellow'
    context.fillRect(x, y, 1, 1)
  }, [canvasRef])

  const checkGameOver = useCallback(([x, y]) => {
    if (snake.find(([pieceX, pieceY]) => pieceX === x && pieceY === y)) {
      return true;
    }
    return false;
  }, [snake])

  const resetBoard = useCallback(() => {
    setBoard(createBoard(BOARD_WIDTH, BOARD_HEIGHT, getCords(snake)))
  }, [snake]);

  const endGame = useCallback(() => {
    alert('Game Over');
    const newSnake = [[0, 0], [1, 0]];
    setDirection('y');
    setSnake(newSnake)
    resetBoard()
    setScore(0);
  }, [resetBoard])

  const eat = useCallback((position) => {
    const newSnake = [...snake, position];
    setSnake(newSnake)
    resetBoard()
  }, [snake, resetBoard])

  const walk = useCallback((position) => {
    const [, body,] = snakeParts(snake);
    setSnake([...body, position])
  }, [snake])

  const shouldEat = useCallback(([y, x]) => {
    return board[x][y] === 1
  }, [board])

  const snakeWalk = useCallback((position) => {
    if (shouldEat(position)) {
      eat(position)
      return setScore(score + 10);
    }
    return walk(position);
  }, [eat, walk, shouldEat, score])

  const validPosition = useCallback((y, x) => {
    return board[x]?.[y] != undefined
  }, [board])

  const getPosition = useCallback((direction) => {
    const [, , [x, y]] = snakeParts(snake)

    let position = [x, y]
    switch (direction) {
      case 'x': {
        position = validPosition(x + 1, y) ? [x + 1, y] : [0, y]
        break;
      }
      case '-x': {
        position = validPosition(x - 1, y) ? [x - 1, y] : [BOARD_WIDTH - 1, y]
        break;
      }

      case 'y': {
        position = validPosition(x, y + 1) ? [x, y + 1] : [x, 0]
        break;
      }
      case '-y': {
        position = validPosition(x, y - 1) ? [x, y - 1] : [x, BOARD_HEIGHT - 1]
        break;
      }
    }
    return position
  }, [snake, validPosition])

  const updateBoard = useCallback((time) => {
    if (updatedTime == null) setUpdatedTime(time)

    const timeout = (time - updatedTime)

    if (timeout >= 300) {
      setUpdatedTime(time)
      if (!pause) {
        const newHead = getPosition(currentDirection)
        if (checkGameOver(newHead)) {
          return endGame();
        }
        snakeWalk(newHead)
      }
    }

    const canvas = canvasRef.current;
    canvas.width = BOARD_WIDTH * SHAPE_SIZE;
    canvas.height = BOARD_HEIGHT * SHAPE_SIZE;
    const context = canvas.getContext('2d');
    context.scale(SHAPE_SIZE, SHAPE_SIZE);
    context.fillStyle = '#000'

    context.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          context.fillStyle = 'green'
          context.fillRect(x, y, 1, 1)
        }
      });
    });

    snake.forEach(([x, y]) => {
      drawItem(x, y);
    })

    requestRef.current = requestAnimationFrame(updateBoard);
  }, [
    pause,
    board,
    snake,
    checkGameOver,
    currentDirection,
    drawItem,
    getPosition,
    endGame,
    snakeWalk,
    updatedTime,
  ]);


  const onKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowLeft': {
        if (currentDirection === 'x' || currentDirection === '-x') return;
        const newHead = getPosition('-x')
        if (checkGameOver(newHead)) {
          endGame();
          break;
        }
        setDirection('-x');
        snakeWalk(newHead)
        break;
      }

      case 'ArrowRight': {
        if (currentDirection === 'x' || currentDirection === '-x') return;
        const newHead = getPosition('x')
        if (checkGameOver(newHead)) {
          endGame();
          break;
        }
        setDirection('x');
        snakeWalk(newHead)
        break;
      }

      case 'ArrowDown': {
        if (currentDirection === 'y' || currentDirection === '-y') return;
        const newHead = getPosition('y')
        if (checkGameOver(newHead)) {
          endGame();
          break;
        }
        setDirection('y');
        snakeWalk(newHead)
        break;
      }

      case 'ArrowUp': {
        if (currentDirection == 'y' || currentDirection === '-y') return;
        const newHead = getPosition('-y')

        if (checkGameOver(newHead)) {
          endGame();
          break;
        }
        setDirection('-y');
        snakeWalk(newHead)
        break;
      }
      case 'p': {
        togglePause()
        break;
      }
    }
  }

  useEffect(() => {

    requestRef.current = requestAnimationFrame(updateBoard)

    return () => {
      cancelAnimationFrame(requestRef.current)
    }

  }, [updateBoard])

  return (
    <div>
      <h1> Snake Game </h1>
      <CanvasBoard ref={canvasRef} score={score} onKeyDown={onKeyDown} />
      {/* <Board width={14} height={30} size={23} /> */}
    </div>
  )
}
