import { parseGames } from '@mliebelt/pgn-parser';
import { Chess, type Square } from 'chess.js';

export interface StudyPosition {
  readonly fen: string;
  readonly move: string | null;
  readonly comment?: string;
  readonly moveSquares?: readonly [Square, Square];
  readonly continuations: readonly StudyPosition[];
}

type ParsedMove = ReturnType<typeof parseGames>[number]['moves'][number];
type ImportPosition = Omit<StudyPosition, 'continuations'> & {
  continuations: ImportPosition[];
};

export function importRepertoire(pgn: string): StudyPosition {
  if (pgn.trim().length === 0) {
    throw new Error('Paste a PGN with at least one move.');
  }
  if (pgn.length > 75_000) {
    throw new Error('This import supports PGN up to 75,000 characters.');
  }

  const [game, ...additionalGames] = parseGames(pgn);
  if (!game?.moves.length || additionalGames.length) {
    throw new Error('Import one PGN game with at least one move at a time.');
  }

  const root: ImportPosition = {
    fen: new Chess(game.tags?.FEN).fen(),
    move: null,
    continuations: [],
  };
  addLine(root, game.moves);
  return root;
}

function addLine(start: ImportPosition, moves: readonly ParsedMove[]): void {
  let position = start;
  for (const move of moves) {
    const board = new Chess(position.fen);
    const played = board.move(move.notation.notation, { strict: true });
    const child: ImportPosition = {
      fen: board.fen(),
      move: played.san,
      moveSquares: [played.from, played.to],
      comment: move.commentAfter,
      continuations: [],
    };

    position.continuations.push(child);
    for (const variation of move.variations) {
      addLine(position, variation);
    }
    position = child;
  }
}

export const DEMO_PGN = '1. e4 e5 (1... c5 {Sicilian Defence} 2. Nf3 d6) 2. Nf3 Nc6 3. Bb5 *';
