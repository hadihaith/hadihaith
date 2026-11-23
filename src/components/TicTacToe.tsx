import { useState } from 'react'
import { motion } from 'motion/react'

type Cell = 'X' | 'O' | null
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function winner(b: Cell[]) {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a]!, line: l }
  }
  return null
}

// Win if possible, block if needed, else center, corners, edges.
function computerMove(b: Cell[]): number {
  for (const who of ['O', 'X'] as const) {
    for (const [a, c, d] of LINES) {
      const trio = [a, c, d]
      const mine = trio.filter((i) => b[i] === who).length
      const empty = trio.filter((i) => !b[i])
      if (mine === 2 && empty.length === 1) return empty[0]
    }
  }
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7]
  const free = order.filter((i) => !b[i])
  // A little randomness among corners so every game isn't identical.
  if (!b[4]) return 4
  const corners = free.filter((i) => [0, 2, 6, 8].includes(i))
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  return free[0]
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [score, setScore] = useState({ you: 0, me: 0, draw: 0 })
  const win = winner(board)
  const full = board.every(Boolean)
  const over = Boolean(win) || full

  const status = win
    ? win.who === 'X' ? 'You win. Nicely done.' : 'I win this round.'
    : full ? 'Draw. Classic.' : 'Your move. You are X.'

  const play = (i: number) => {
    if (board[i] || over) return
    const next = [...board]
    next[i] = 'X'
    let w = winner(next)
    if (!w && !next.every(Boolean)) {
      next[computerMove(next)] = 'O'
      w = winner(next)
    }
    setBoard(next)
    if (w) setScore((s) => (w!.who === 'X' ? { ...s, you: s.you + 1 } : { ...s, me: s.me + 1 }))
    else if (next.every(Boolean)) setScore((s) => ({ ...s, draw: s.draw + 1 }))
  }

  return (
    <div className="ttt">
      <div className="ttt-grid" role="grid" aria-label="Tic-tac-toe board">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={`ttt-cell${win?.line.includes(i) ? ' is-win' : ''}`}
            onClick={() => play(i)}
            disabled={Boolean(cell) || over}
            aria-label={cell ? `Square ${i + 1}: ${cell}` : `Square ${i + 1}: empty`}
          >
            {cell && (
              <motion.span
                className={cell === 'X' ? 'ttt-x' : 'ttt-o'}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {cell}
              </motion.span>
            )}
          </button>
        ))}
      </div>
      <div className="ttt-side">
        <p className="ttt-status" aria-live="polite">{status}</p>
        <p className="ttt-score">You {score.you}, me {score.me}, draws {score.draw}</p>
        <button type="button" className="btn" onClick={() => setBoard(Array(9).fill(null))}>
          {over ? 'Play again' : 'Restart'}
        </button>
      </div>
    </div>
  )
}
