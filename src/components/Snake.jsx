import { useRef } from "react";

export function Snake() {

  const canvasRef = useRef(0);
  return (
      <canvas ref={canvasRef} />
  )
}
