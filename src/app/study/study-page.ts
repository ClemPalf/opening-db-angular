import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
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
  private readonly savedPgn = computed(() => this.entry()?.pgn);
  private readonly repertoire = computed((): StudyPosition | null => {
    const pgn = this.savedPgn();
    if (this.id() && pgn === undefined) return null;
    try {
      return pgn === null
        ? { fen: new Chess().fen(), move: null, continuations: [] }
        : importRepertoire(pgn ?? DEMO_PGN);
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
  protected readonly isRepertoireTurn = computed(() => {
    const activeColor = this.position()?.fen.split(' ')[1];
    const repertoireColor = this.entry()?.side === 'black' ? 'b' : 'w';
    return activeColor === repertoireColor;
  });

  private readonly pageHeading = viewChild.required<ElementRef<HTMLElement>>('pageHeading');
  private readonly playedMoves = viewChild<ElementRef<HTMLElement>>('playedMoves');
  private readonly injector = inject(Injector);
  protected readonly boardWidth = signal(55);
  private drag:
    { pointerId: number; startX: number; startWidth: number; totalWidth: number } | undefined;

  constructor() {
    afterNextRender(() => this.pageHeading().nativeElement.focus());
  }

  protected startResize(event: PointerEvent, layout: HTMLElement): void {
    if (event.button !== 0 || !event.isPrimary) return;
    const separator = event.currentTarget as HTMLElement;
    separator.setPointerCapture(event.pointerId);
    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: this.boardWidth(),
      totalWidth: layout.clientWidth,
    };
  }

  protected resize(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    this.setBoardWidth(drag.startWidth + ((event.clientX - drag.startX) / drag.totalWidth) * 100);
  }

  protected stopResize(event: PointerEvent): void {
    if (this.drag?.pointerId === event.pointerId) this.drag = undefined;
  }

  protected resizeWithKeyboard(event: KeyboardEvent): void {
    let nextWidth: number;
    switch (event.key) {
      case 'ArrowLeft':
        nextWidth = this.boardWidth() - 2;
        break;
      case 'ArrowRight':
        nextWidth = this.boardWidth() + 2;
        break;
      case 'Home':
        nextWidth = 30;
        break;
      case 'End':
        nextWidth = 70;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setBoardWidth(nextWidth);
  }

  private setBoardWidth(width: number): void {
    this.boardWidth.set(Math.min(70, Math.max(30, Math.round(width))));
  }

  protected navigateWithKeyboard(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    switch (event.key.toLowerCase()) {
      case 'arrowleft':
        if (this.path().length > 1) this.rewind(this.path().length - 2);
        break;
      case 'arrowright':
        this.advance(false);
        break;
      case 'home':
        this.rewind(0);
        break;
      case 'end':
        this.advance(true);
        break;
      case 'f':
        this.flipped.update((flipped) => !flipped);
        break;
      default:
        return;
    }
    event.preventDefault();
    const focused = event.target;
    afterNextRender(
      () => {
        if (focused instanceof HTMLButtonElement && focused.disabled) {
          focused.closest('nav')?.focus();
        }
      },
      { injector: this.injector },
    );
  }

  protected choose(position: StudyPosition): void {
    this.path.update((path) => [...path, position]);
    afterNextRender(() => this.playedMoves()?.nativeElement.focus(), { injector: this.injector });
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
