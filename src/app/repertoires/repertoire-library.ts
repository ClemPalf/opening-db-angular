import { DestroyRef, DOCUMENT, inject, Service, signal } from '@angular/core';
import { importRepertoire, type StudyPosition } from '../study/repertoire';

export type RepertoireSide = 'white' | 'black';

export interface SavedRepertoire {
  readonly id: string;
  readonly name: string;
  readonly side: RepertoireSide;
  readonly pgn: string | null;
  readonly moveCount: number;
}

const STORAGE_KEY = 'chessbook.repertoires';

@Service()
export class RepertoireLibrary {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly entries = signal<readonly SavedRepertoire[]>([]);
  private readonly error = signal('');

  readonly repertoires = this.entries.asReadonly();
  readonly storageError = this.error.asReadonly();

  constructor() {
    this.reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) this.reload();
    };
    this.browser?.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => this.browser?.removeEventListener('storage', onStorage));
  }

  create(name: string, side: RepertoireSide, pgn: string | null): void {
    const normalizedName = requiredName(name);
    const moveCount = pgn === null ? 0 : countMoves(importRepertoire(pgn));
    const id = this.browser?.crypto.randomUUID();
    if (!id) throw new Error('Repertoire storage requires HTTPS or localhost.');
    this.save((entries) => [...entries, { id, name: normalizedName, side, pgn, moveCount }]);
  }

  rename(id: string, name: string): void {
    const normalizedName = requiredName(name);
    this.save((entries) =>
      entries.map((entry) => (entry.id === id ? { ...entry, name: normalizedName } : entry)),
    );
  }

  remove(id: string): void {
    this.save((entries) => entries.filter((entry) => entry.id !== id));
  }

  private reload(): void {
    try {
      this.entries.set(this.read());
      this.error.set('');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not read saved repertoires.');
    }
  }

  private read(): readonly SavedRepertoire[] {
    let raw: string | null | undefined;
    try {
      raw = this.browser?.localStorage.getItem(STORAGE_KEY);
    } catch {
      throw new Error('Browser storage is unavailable.');
    }
    if (!raw) return [];
    try {
      const data: unknown = JSON.parse(raw);
      if (
        typeof data === 'object' &&
        data !== null &&
        'version' in data &&
        data.version === 1 &&
        'entries' in data &&
        Array.isArray(data.entries) &&
        data.entries.every(isSavedRepertoire)
      ) {
        return data.entries;
      }
    } catch {
      // Leave the stored data intact if the browser cannot read this version.
    }
    throw new Error(
      'Could not read saved repertoires. The saved data is still in browser storage.',
    );
  }

  private save(update: (entries: readonly SavedRepertoire[]) => readonly SavedRepertoire[]): void {
    const entries = update(this.read());
    try {
      if (!this.browser) throw new Error();
      this.browser.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries }));
    } catch {
      throw new Error('Could not save repertoires. Check that browser storage is available.');
    }
    this.entries.set(entries);
    this.error.set('');
  }
}

function requiredName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Enter a repertoire name.');
  return trimmed;
}

function countMoves(root: StudyPosition): number {
  let count = 0;
  const pending = [root];
  for (let position = pending.pop(); position; position = pending.pop()) {
    for (const child of position.continuations) pending.push(child);
    count += position.continuations.length;
  }
  return count;
}

function isSavedRepertoire(value: unknown): value is SavedRepertoire {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry['id'] === 'string' &&
    typeof entry['name'] === 'string' &&
    (entry['side'] === 'white' || entry['side'] === 'black') &&
    (entry['pgn'] === null || typeof entry['pgn'] === 'string') &&
    typeof entry['moveCount'] === 'number' &&
    Number.isSafeInteger(entry['moveCount']) &&
    entry['moveCount'] >= 0
  );
}
