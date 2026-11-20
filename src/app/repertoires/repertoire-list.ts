import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { RepertoireLibrary, type RepertoireSide, type SavedRepertoire } from './repertoire-library';

type Action = 'create' | 'import' | 'options';

@Component({
  selector: 'app-repertoire-list',
  imports: [FormField, RouterLink],
  templateUrl: './repertoire-list.html',
  styleUrl: './repertoire-list.css',
})
export class RepertoireList {
  protected readonly library = inject(RepertoireLibrary);
  private readonly injector = inject(Injector);
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly draft = signal({ name: '', side: 'white' as RepertoireSide, pgn: '' });
  protected readonly editorForm = form(this.draft, (fields) => {
    required(fields.name);
    maxLength(fields.pgn, 75_000);
  });
  protected readonly action = signal<Action>('create');
  protected readonly target = signal<SavedRepertoire | null>(null);
  protected readonly confirmingDelete = signal(false);
  protected readonly error = signal('');
  protected readonly sides = ['white', 'black'] as const;

  protected open(action: Action, target: SavedRepertoire | null = null): void {
    this.action.set(action);
    this.target.set(target);
    this.draft.set({ name: target?.name ?? '', side: target?.side ?? 'white', pgn: '' });
    this.editorForm().reset();
    this.confirmingDelete.set(false);
    this.error.set('');
    afterNextRender(() => this.dialog().nativeElement.showModal(), { injector: this.injector });
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const { name, side, pgn } = this.draft();
    const target = this.target();
    try {
      if (target && this.confirmingDelete()) this.library.remove(target.id);
      else if (target) this.library.rename(target.id, name);
      else this.library.create(name, side, this.action() === 'import' ? pgn : null);
      this.close();
      if (this.confirmingDelete()) {
        this.dialog().nativeElement.ownerDocument.getElementById('library-title')?.focus();
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not save the repertoire.');
    }
  }

  protected confirmDelete(): void {
    this.error.set('');
    this.confirmingDelete.set(true);
    this.cancelButton().nativeElement.focus();
  }
}
