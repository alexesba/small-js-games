import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types'
import { createBoard } from "../utils";

function snakeParts(snake) {
  const [tail, ...body] = snake;
  const last = body[body.length - 1]
  return [tail, body, last]
}

export function Board({ width, height, size }) {
  const board_width = size * width;
  const board_height = size * height;

  const canvasRef = useRef(0);
  const requestRef = useRef(0)

  const [snake, setSnake] = useState([[0, 0], [1, 0]]);

  const getCords = useCallback(() => {
    console.log('Calling getCords')
    const x = Math.floor(Math.random() * (width - 1))
    const y = Math.floor(Math.random() * (height - 1))
    return [x, y]
  }, [width, height])

  const setRandomItem = useCallback(() => {
    const cords = getCords();

    if (snake.find(pos => pos[0] === cords[0] && pos[1] === cords[1])) {
      console.log('WARNING:', snake, cords)
      return getCords()
    }

    return cords;
  }, [snake, getCords])

  const [board, setBoard] = useState(createBoard(width, height, setRandomItem()))
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
    setBoard(createBoard(width, height, setRandomItem()))
  }, [height, width, setRandomItem]);

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
        position = validPosition(x - 1, y) ? [x - 1, y] : [width - 1, y]
        break;
      }

      case 'y': {
        position = validPosition(x, y + 1) ? [x, y + 1] : [x, 0]
        break;
      }
      case '-y': {
        position = validPosition(x, y - 1) ? [x, y - 1] : [x, height - 1]
        break;
      }
    }
    return position
  }, [height, width, snake, validPosition])

  const updateBoard = useCallback((time) => {
    // console.log(time);
    //
    if (updatedTime == null) setUpdatedTime(time)

    const timeout = (time - updatedTime)

    if (timeout >= 300) {
      setUpdatedTime(time)
      const newHead = getPosition(currentDirection)
      if (checkGameOver(newHead)) {
        return endGame();
      }
      snakeWalk(newHead)
    }

    const canvas = canvasRef.current;
    canvas.width = board_width
    canvas.height = board_height
    const context = canvas.getContext('2d');
    context.scale(size, size);
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
    board,
    board_height,
    board_width,
    size,
    snake,
    checkGameOver,
    currentDirection,
    drawItem,
    getPosition,
    endGame,
    snakeWalk,
    updatedTime,
  ]);

  function moveSnake(event) {
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
      // console.log('Unmounted')
      cancelAnimationFrame(requestRef.current)
    }

  }, [updateBoard]);

  return (
    <div role="button" tabIndex="0" onKeyDown={moveSnake} >
      <canvas ref={canvasRef} />
      <div>
        <span>Score</span>:
        <span className="score"> {score} </span>
      </div>
    </div>
  )
}

Board.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
}
