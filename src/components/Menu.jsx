import { Link, Outlet } from "react-router-dom";

export function Menu() {
  return (
    <ul className="menu">
      <li>
        <Link to="game/tetris"> Tetris </Link>
      </li>
      <li>
        <Link to="game/snake"> Snake </Link>
      </li>
      <li>
        <Link to="game/tictacktoe"> TickTacToe </Link>
      </li>

      <Outlet />
    </ul>
  )
}
