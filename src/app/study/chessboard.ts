import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Chess, type Square } from 'chess.js';

@Component({
  selector: 'app-chessboard',
  imports: [NgOptimizedImage],
  template: `
    <figure aria-label="Chess position">
      <div class="board" aria-hidden="true">
        @for (square of squares(); track square.label) {
          <div [class.dark]="square.dark" [class.last-move]="square.lastMove">
            @if (square.image; as image) {
              <img [ngSrc]="image" alt="" fill loading="eager" />
            }
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
      grid-template-columns: repeat(8, minmax(0, 1fr));
      grid-template-rows: repeat(8, minmax(0, 1fr));
      aspect-ratio: 1;
      overflow: hidden;
      background: #f0d9b5;
      container-type: inline-size;
    }
    .board > div {
      position: relative;
      display: grid;
      place-items: center;
      color: #1f2c29;
    }
    .board > .dark {
      background: #b58863;
    }
    .board > .last-move {
      box-shadow: inset 0 0 0 100vmax #9cc70080;
    }
    img {
      object-fit: contain;
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
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class Chessboard {
  readonly fen = input.required<string>();
  readonly flipped = input(false);
  readonly lastMove = input<readonly [Square, Square]>();

  protected readonly squares = computed(() => {
    const board = new Chess(this.fen()).board().flat();
    if (this.flipped()) {
      board.reverse();
    }
    const lastMove = new Set<string>(this.lastMove());
    return board.map((piece, index) => {
      const row = Math.floor(index / 8);
      const col = index % 8;
      const files = this.flipped() ? 'hgfedcba' : 'abcdefgh';
      const rank = this.flipped() ? row + 1 : 8 - row;
      const label = files[col] + rank;
      return {
        label,
        lastMove: lastMove.has(label),
        dark: (row + col) % 2 === 1,
        image: piece ? 'pieces/' + piece.color + piece.type + '.svg' : null,
        showRank: col === 0,
        showFile: row === 7,
      };
    });
  });
}
