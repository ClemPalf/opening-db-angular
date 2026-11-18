import { Component, computed, signal } from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { Chessboard } from './chessboard';
import { DEMO_PGN, importRepertoire, StudyPosition } from './repertoire';

@Component({
  selector: 'app-study-page',
  imports: [Chessboard, FormField],
  templateUrl: './study-page.html',
  styleUrl: './study-page.css',
})
export class StudyPage {
  private readonly pgn = signal({ text: DEMO_PGN });
  protected readonly importForm = form(this.pgn, (path) => maxLength(path.text, 75_000));
  protected readonly error = signal('');
  protected readonly flipped = signal(false);
  protected readonly path = signal<readonly StudyPosition[]>([importRepertoire(DEMO_PGN)]);
  protected readonly position = computed(() => this.path()[this.path().length - 1]);

  protected loadPgn(event: Event): void {
    event.preventDefault();
    try {
      const repertoire = importRepertoire(this.pgn().text);
      this.path.set([repertoire]);
      this.error.set('');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not read this PGN.');
    }
  }

  protected choose(position: StudyPosition): void {
    this.path.update((path) => [...path, position]);
  }

  protected rewind(index: number): void {
    this.path.update((path) => path.slice(0, index + 1));
  }
}
