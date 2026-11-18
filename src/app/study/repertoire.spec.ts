import { describe, expect, it } from 'vitest';
import { importRepertoire } from './repertoire';

describe('importRepertoire', () => {
  it('attaches an alternative to the position before the move it replaces', () => {
    const [e4] = importRepertoire('1. e4 e5 (1... c5 {Sicilian} 2. Nf3) 2. Bc4 *').continuations;
    const [e5, c5] = e4.continuations;
    expect(e5.move).toBe('e5');
    expect(e5.continuations[0].move).toBe('Bc4');
    expect(c5.move).toBe('c5');
    expect(c5.comment).toBe('Sicilian');
    expect(c5.continuations[0].move).toBe('Nf3');
  });

  it('supports a PGN starting from a custom FEN and preserves the side to move', () => {
    const tree = importRepertoire(
      '[SetUp "1"]\n[FEN "8/8/8/8/8/3k4/8/3K4 b - - 0 40"]\n\n40... Ke3 *',
    );
    expect(tree.fen).toContain(' b ');
    expect(tree.continuations[0].move).toBe('Ke3');
    expect(tree.continuations[0].fen).toContain(' w ');
  });

  it('rejects an impossible move', () => {
    expect(() => importRepertoire('1. e5 *')).toThrow();
  });

  it('rejects empty and multiple-game imports', () => {
    expect(() => importRepertoire('')).toThrow('Paste a PGN');
    expect(() => importRepertoire('1. d4 *\n\n1. e4 *')).toThrow('one PGN game');
  });
});
