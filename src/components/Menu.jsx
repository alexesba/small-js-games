import { Link, Outlet } from "react-router-dom";

export function Menu() {
  return (
    <div>
      <Link to="game/tetris"> Tetris </Link>
      <Link to="game/snake"> Snake </Link>

      <Outlet/>
    </div>
  )
}
