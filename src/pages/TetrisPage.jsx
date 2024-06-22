import { useCallback, useEffect, useRef, useState } from "react";
import CanvasBoard from "../components/CanvasBoard";

const SHAPES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1]
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0]
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1]
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 0]
  ],
  [
    [0, 1],
    [0, 1],
    [0, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1]
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0]
  ],
  [
    [1, 0, 1],
    [1, 1, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
];

const SHAPE_COLORS = ['black', 'yellow', 'blue', 'red', 'green', 'white', 'cyan', 'pink']

const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const noblackColors = SHAPE_COLORS.filter(color => color != 'black')

const randomColor = () => noblackColors[Math.floor(Math.random() * noblackColors.length)];

const getRandomShape = () => {
  const color = randomColor();
  const indexColor = SHAPE_COLORS.indexOf(color);
  const shape = randomShape().map(row => row.map(value => value != 0 ? indexColor : value))
  return shape;
}

const createNewShape = () => {
  return {
    position: { x: 5, y: 0 },
    shape: getRandomShape(),
    moveInY: function(value) {
      this.position.y = this.position.y + value;
    }
  }
};


const getNewBoard = (width, height) => new Array(height).fill(0).map(() => new Array(width).fill(0))

export function TetrisPage() {
  const BOARD_WIDTH = 15
  const BOARD_HEIGHT = 30
  const SHAPE_SIZE = 23
  const canvasRef = useRef(0);
  const requestRef = useRef(0)
  const [board, setBoard] = useState(getNewBoard(BOARD_WIDTH, BOARD_HEIGHT));

  const [pause, setPause] = useState(false);

  const togglePause = useCallback(() => setPause(!pause), [pause]);

  const [shapeFigure, setShapeFigure] = useState(
    createNewShape()
  )

  const [lastTime, setLastTime] = useState(null)
  const [score, setScore] = useState(0);


  const drawBoard = useCallback(() => {
    const context = canvasRef.current.getContext('2d');

    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const color = SHAPE_COLORS[value]
          context.fillStyle = color
          context.fillRect(x, y, 1, 1)
        }
      })
    })
  }, [board]);

  const drawShape = useCallback(() => {
    const context = canvasRef.current.getContext('2d');
    shapeFigure.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          context.strokeStyle = SHAPE_COLORS[value]
          context.lineWidth = 0.2;
          context.strokeRect(
            x + shapeFigure.position.x,
            y + shapeFigure.position.y,
            1,
            1
          )
        }
      });
    });
  }, [shapeFigure])

  const hasCollide = useCallback(() => {
    const collide = shapeFigure.shape.find((row, y) => {
      return row.find((value, x) => {
        return (
          value !== 0 &&
          board[y + shapeFigure.position.y]?.[x + shapeFigure.position.x] !== 0
        )
      });
    }) || false

    return collide;
  }, [shapeFigure, board])

  const removeCompletedRows = useCallback(() => {
    const completedRows = []
    const newBoard = [...board]

    newBoard.forEach((row, index) => {
      if (row.every(value => value != 0)) {
        completedRows.push(index);
      }
    });

    if (completedRows.length == 0) return;

    completedRows.forEach(rowIndex => {
      newBoard.splice(rowIndex, 1);
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    });

    setScore(score + completedRows.length * 10)
    setBoard(newBoard);
  }, [board])

  const rotateShape = useCallback(() => {
    const prevShape = shapeFigure.shape;
    const newShape = shapeFigure.shape[0].map((_val, index) => shapeFigure.shape.map(row => row[index]).reverse())

    shapeFigure.shape = newShape;

    if (hasCollide()) {
      shapeFigure.shape = prevShape;
    }
  }, [hasCollide, shapeFigure])

  const saveShape = useCallback(() => {
    let newBoard = [...board]

    shapeFigure.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          newBoard = newBoard.map((row, by) => {
            return row.map((currentValue, bx) => {
              const posy = (y + shapeFigure.position.y)
              const posx = (x + shapeFigure.position.x)
              return (by === posy && bx === posx) && value || currentValue
            })
          });
        }
      })
    });

    setBoard(newBoard);
    setShapeFigure(createNewShape());
  }, [board, shapeFigure]);

  const updateBoard = useCallback((time = 0) => {

    initializeBoard();
    drawBoard();
    removeCompletedRows();
    drawShape();


    if (!lastTime) setLastTime(time);

    const timeout = (time - lastTime);

    if (timeout >= 1000) {
      setLastTime(time);
      if (!pause) {
        shapeFigure.moveInY(1);

        if (hasCollide()) {
          shapeFigure.moveInY(-1);
          saveShape(shapeFigure);
        }
      }
    }

    requestRef.current = requestAnimationFrame(updateBoard);
  }, [drawShape, drawBoard, hasCollide, lastTime, removeCompletedRows, saveShape, setLastTime, shapeFigure])

  const onKeyDown = useCallback(event => {
    if (event.key === 'ArrowLeft') {
      shapeFigure.position.x--

      if (hasCollide()) {
        shapeFigure.position.x++
      }
    }

    if (event.key === 'k') {
      rotateShape()
    }

    if (event.key === 'ArrowRight') {
      shapeFigure.position.x++

      if (hasCollide()) {
        shapeFigure.position.x--
      }
    }

    if (event.key === 'p') {
      togglePause()
    }

    if (event.key === 'ArrowDown') {
      shapeFigure.position.y++

      if (hasCollide()) {
        shapeFigure.position.y--
        saveShape(shapeFigure);
        removeCompletedRows();
      }
    }
  }, [hasCollide, removeCompletedRows, rotateShape, saveShape, shapeFigure, togglePause])

  const initializeBoard = () => {
    const canvas = canvasRef.current

    const context = canvas.getContext('2d');

    canvas.width = BOARD_WIDTH * SHAPE_SIZE;
    canvas.height = BOARD_HEIGHT * SHAPE_SIZE;

    context.scale(SHAPE_SIZE, SHAPE_SIZE);

    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
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
    </div>
  )
}
