import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [board, setBoard] = useState(createBoard(width, height, setRandomItem()))
  const [snake, setSnake] = useState([[0, 0], [1, 0], [2, 0]]);

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


  const updateBoard = useCallback((time) => {
    // console.log(time);
    //
    if (updatedTime == null) setUpdatedTime(time)

    const timeout = (time - updatedTime)

    if (timeout >= 300) {
      setUpdatedTime(time)
      const newHead = getPosition(currentDirection)
      if (checkGameOver(newHead)) {
        return resetGame();
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
  }, [snake, drawItem, board_height, board_width]);

  function checkGameOver([x, y]) {
    if (snake.find(([pieceX, pieceY]) => pieceX === x && pieceY === y)) {
      return true;
    }

    return false;
  }

  function resetGame() {
    alert('Game Over');
    const newSnake = [[0, 0], [1, 0], [2, 0]];
    setDirection('y');
    setSnake(newSnake)
    setBoard(createBoard(width, height, setRandomItem()))
  }

  function snakeWalk(position) {
    if (shouldEat(position)) {
      return eat(position)
    }
    return walk(position);
  }


  function moveSnake(event) {
    switch (event.key) {
      case 'ArrowLeft': {
        if (currentDirection === 'x' || currentDirection === '-x') return;
        const newHead = getPosition('-x')
        if (checkGameOver(newHead)) {
          resetGame();
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
          resetGame();
          break;
        }
        setDirection('x');
        snakeWalk(newHead)
        break;
      }

      case 'ArrowDown': {
        if (currentDirection == 'y' || currentDirection === '-y') return;
        const newHead = getPosition('y')
        if (checkGameOver(newHead)) {
          resetGame();
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
          resetGame();
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

  function validPosition(y, x) {
    return board[x]?.[y] != undefined
  }

  function shouldEat([y, x]) {
    return board[x][y] === 1
  }

  function eat(position) {
    const newSnake = [...snake, position];
    setSnake(newSnake)
    setBoard(createBoard(width, height, setRandomItem()))
  }

  function walk(position) {
    const [, body,] = snakeParts(snake);
    setSnake([...body, position])
  }


  function setRandomItem() {
    const x = Math.floor(Math.random() * (width - 1))
    const y = Math.floor(Math.random() * (height - 1))
    return [x, y]
  }

  function getPosition(direction) {
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
  }


  useEffect(() => {

    requestRef.current = requestAnimationFrame(updateBoard)

    return () => {
      console.log('Unmounted')
      cancelAnimationFrame(requestRef.current)
    }

  }, [updateBoard]);

  return (
    <div role="button" tabIndex="0" onKeyDown={moveSnake} >
      <canvas ref={canvasRef} />
    </div>
  )
}

Board.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
}
