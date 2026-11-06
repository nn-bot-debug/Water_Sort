export default function Hud({ levelId, canUndo, busy, onUndo, onRestart, onNext }) {
  return (
    <header className="hud">
      <div className="hud__title">
        <h1 className="hud__wordmark">Water Sort</h1>
        <p className="hud__meta">Level {levelId + 1}</p>
      </div>
      <div className="hud__actions">
        <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className="btn" onClick={onRestart} disabled={busy}>
          Restart
        </button>
        <button type="button" className="btn" onClick={onNext} disabled={busy}>
          Skip
        </button>
      </div>
    </header>
  )
}
