import { Board } from "../components/Board";

export function SnakePage() {
  return (
    <div>
      <h1> Snake Game </h1>
      <Board width={14} height={30} size={20} />
    </div>
  )
}
