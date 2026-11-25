import { useState } from 'react'

type Cell = 'X' | 'O' | null
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const winner = (b: Cell[]) => {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a]!, line: l }
  }
  return null
}

// Win if possible, block if needed, else centre, a random corner, an edge.
const computerMove = (b: Cell[]): number => {
  for (const who of ['O', 'X'] as const) {
    for (const trio of LINES) {
      const mine = trio.filter((i) => b[i] === who).length
      const empty = trio.filter((i) => !b[i])
      if (mine === 2 && empty.length === 1) return empty[0]
    }
  }
  if (!b[4]) return 4
  const corners = [0, 2, 6, 8].filter((i) => !b[i])
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  return [1, 3, 5, 7].find((i) => !b[i])!
}

/** The playable screen on the workshop's device. */
export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [score, setScore] = useState({ you: 0, me: 0 })
  const win = winner(board)
  const full = board.every(Boolean)
  const over = Boolean(win) || full
  const status = win ? (win.who === 'X' ? 'you win' : 'i win') : full ? 'draw' : 'your move, x'

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
  }

  return (
    <div className="ttt">
      <div className="ttt-grid" role="group" aria-label="Tic-tac-toe board">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={`ttt-cell${win?.line.includes(i) ? ' is-win' : ''}`}
            onClick={() => play(i)}
            disabled={Boolean(cell) || over}
            aria-label={`Square ${i + 1}: ${cell ?? 'empty'}`}
          >
            {cell && <span className={cell === 'X' ? 'ttt-x' : 'ttt-o'}>{cell}</span>}
          </button>
        ))}
      </div>
      <div className="ttt-bar">
        <span aria-live="polite">{status}</span>
        <span>
          {score.you}–{score.me}
        </span>
        <button type="button" className="ttt-reset" onClick={() => setBoard(Array(9).fill(null))}>
          {over ? 'again' : 'reset'}
        </button>
      </div>
    </div>
  )
}
