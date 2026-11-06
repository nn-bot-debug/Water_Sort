import { useWaterSort } from '../hooks/useWaterSort.js'
import GameBoard from './GameBoard.jsx'
import Hud from './Hud.jsx'
import WinBanner from './WinBanner.jsx'

export default function GameScreen() {
  const game = useWaterSort()
  const won = game.status === 'won'

  return (
    <main className="screen">
      <Hud
        levelId={game.levelId}
        busy={game.status === 'pouring'}
        onRestart={game.restart}
        onNext={game.next}
      />
      <section className="stage" aria-label="Puzzle">
        <GameBoard
          tubes={game.tubes}
          selected={game.selected}
          reject={game.reject}
          pour={game.pour}
          moves={game.moves}
          status={game.status}
          onTap={game.tap}
          onRejectEnd={game.clearReject}
          onPourEnd={game.finishPour}
        />
      </section>
      <footer className="footer">
        {won ? (
          <WinBanner moves={game.moves} onNext={game.next} />
        ) : (
          <p className="hint">
            {game.selected === null
              ? 'Pick a tube, then pick where to pour.'
              : 'Pour onto the same color or into an empty tube.'}
          </p>
        )}
      </footer>
    </main>
  )
}
