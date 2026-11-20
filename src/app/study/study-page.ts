import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chess } from 'chess.js';
import { RepertoireLibrary } from '../repertoires/repertoire-library';
import { Chessboard } from './chessboard';
import { DEMO_PGN, importRepertoire, StudyPosition } from './repertoire';

@Component({
  selector: 'app-study-page',
  imports: [Chessboard, RouterLink],
  templateUrl: './study-page.html',
  styleUrl: './study-page.css',
})
export class StudyPage {
  readonly id = input<string>();
  private readonly library = inject(RepertoireLibrary);
  protected readonly libraryError = this.library.storageError;
  protected readonly entry = computed(() =>
    this.library.repertoires().find(({ id }) => id === this.id()),
  );
  protected readonly title = computed(
    () => this.entry()?.name ?? (this.id() ? 'Repertoire unavailable' : 'Study repertoire'),
  );
  private readonly repertoire = computed((): StudyPosition | null => {
    const entry = this.entry();
    if (this.id() && !entry) return null;
    try {
      const pgn = entry ? entry.pgn : DEMO_PGN;
      return pgn === null
        ? { fen: new Chess().fen(), move: null, continuations: [] }
        : importRepertoire(pgn);
    } catch {
      return null;
    }
  });
  protected readonly flipped = linkedSignal(() => this.entry()?.side === 'black');
  protected readonly path = linkedSignal<readonly StudyPosition[]>(() => {
    const root = this.repertoire();
    return root ? [root] : [];
  });
  protected readonly position = computed(() => this.path().at(-1));

  protected choose(position: StudyPosition): void {
    this.path.update((path) => [...path, position]);
  }

  protected advance(toEnd: boolean): void {
    const continuation = this.position()?.continuations[0];
    if (!continuation) return;
    const path = [...this.path(), continuation];
    if (toEnd) {
      let next = continuation.continuations[0];
      while (next) {
        path.push(next);
        next = next.continuations[0];
      }
    }
    this.path.set(path);
  }

  protected rewind(index: number): void {
    this.path.update((path) => path.slice(0, index + 1));
  }
}
