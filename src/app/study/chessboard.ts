import { Component, computed, input } from '@angular/core';
import { Chess } from 'chess.js';

const PIECES = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' } as const;

@Component({
  selector: 'app-chessboard',
  template: `
    <figure aria-label="Chess position">
      <div class="board" aria-hidden="true">
        @for (square of squares(); track square.label) {
          <div [class.dark]="square.dark" [class.white]="square.white">
            <span>{{ square.symbol }}</span>
            @if (square.showRank) {
              <small class="rank">{{ square.label[1] }}</small>
            }
            @if (square.showFile) {
              <small class="file">{{ square.label[0] }}</small>
            }
          </div>
        }
      </div>
      <figcaption>
        FEN <code>{{ fen() }}</code>
      </figcaption>
    </figure>
  `,
  styles: `
    figure {
      margin: 0;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 0.55rem;
      background: #eae2cb;
      container-type: inline-size;
    }
    .board > div {
      position: relative;
      display: grid;
      place-items: center;
      color: #1f2c29;
    }
    .board > .dark {
      background: #748b77;
    }
    .board > .white {
      color: #fffdf6;
    }
    span {
      font:
        9cqw/1 'Arial Unicode MS',
        'DejaVu Sans',
        'Segoe UI Symbol',
        serif;
      text-shadow:
        0 1px 1px #1b2b21,
        0 0 1px #1b2b21;
    }
    small {
      position: absolute;
      font: 700 2cqw/1 system-ui;
      color: #19251f;
    }
    .rank {
      top: 0.2rem;
      left: 0.25rem;
    }
    .file {
      bottom: 0.2rem;
      right: 0.25rem;
    }
    figcaption {
      margin-top: 0.7rem;
      font-size: 0.8rem;
      overflow-wrap: anywhere;
    }
  `,
})
export class Chessboard {
  readonly fen = input.required<string>();
  readonly flipped = input(false);

  protected readonly squares = computed(() => {
    const board = new Chess(this.fen()).board().flat();
    if (this.flipped()) {
      board.reverse();
    }
    return board.map((piece, index) => {
      const row = Math.floor(index / 8);
      const col = index % 8;
      const files = this.flipped() ? 'hgfedcba' : 'abcdefgh';
      const rank = this.flipped() ? row + 1 : 8 - row;
      return {
        label: files[col] + rank,
        dark: (row + col) % 2 === 1,
        white: piece?.color === 'w',
        symbol: piece ? PIECES[piece.type] : '',
        showRank: col === 0,
        showFile: row === 7,
      };
    });
  });
}
