import { forwardRef } from "react"
import PropTypes from "prop-types";

const CanvasBoard = forwardRef(({ score, onKeyDown }, ref) => (
  <div role="button" tabIndex="0" onKeyDown={onKeyDown} >
    <canvas ref={ref} />
    <div>
      <span>Score</span>:
      <span className="score"> {score} </span>
    </div>
  </div>)
);

CanvasBoard.propTypes = {
  onKeyDown: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired,
}
CanvasBoard.displayName = "CanvasBoard";

export default CanvasBoard;
