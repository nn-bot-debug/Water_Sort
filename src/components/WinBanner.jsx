export default function WinBanner({ moves, onNext }) {
  return (
    <div className="win" role="status">
      <div className="win__text">
        <p className="win__title">Sorted</p>
        <p className="win__meta">
          Solved in {moves} {moves === 1 ? 'move' : 'moves'}
        </p>
      </div>
      <button type="button" className="btn btn--primary" onClick={onNext} autoFocus>
        Next puzzle
      </button>
    </div>
  )
}
