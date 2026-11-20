import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app.routes';
import { RepertoireLibrary } from './repertoire-library';

describe('Repertoire library', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding({ queryParams: false }))],
    });
  });
  afterEach(() => localStorage.clear());

  it('imports a black repertoire and opens its saved variations', async () => {
    const harness = await RouterTestingHarness.create('/');
    const page = harness.routeNativeElement!;
    const dialog = page.querySelector('dialog')!;
    // jsdom exposes the dialog element without its modal methods.
    Object.assign(dialog, {
      showModal: () => (dialog.open = true),
      close: () => (dialog.open = false),
    });
    const click = async (label: string) => {
      const button = [...page.querySelectorAll('button')].find(
        (candidate) => candidate.textContent.trim() === label,
      );
      expect(button).toBeDefined();
      button?.click();
      await harness.fixture.whenStable();
    };
    const setText = (selector: string, value: string) => {
      const field = page.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    };

    await click('↑ Import PGN');
    setText('#repertoire-name', '  Sicilian  ');
    page.querySelector<HTMLInputElement>('input[value="black"]')!.click();
    setText('#repertoire-pgn', '1. e5 *');
    await click('Import');
    expect(page.querySelector('dialog[open] [role="alert"]')).toBeTruthy();
    expect(page.querySelectorAll('li')).toHaveLength(0);

    setText('#repertoire-pgn', '1. e4 e5 (1... c5 {Sicilian}) *');
    await click('Import');
    expect(page.querySelector('dialog[open]')).toBeNull();
    const link = page.querySelector<HTMLAnchorElement>('li a')!;
    expect(link.textContent).toContain('black side');
    expect(link.textContent).toContain('3 moves');
    await harness.navigateByUrl(link.pathname);

    const study = harness.routeNativeElement!;
    expect(study.querySelector('h1')?.textContent).toBe('Sicilian');
    expect(study.querySelector('[aria-label="Flip board"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    study.querySelector<HTMLButtonElement>('[aria-label="Next move"]')?.click();
    await harness.fixture.whenStable();
    expect(study.textContent).toContain('c5');
  });

  it('persists creation, rename, and deletion across a fresh service instance', () => {
    const library = TestBed.inject(RepertoireLibrary);
    library.create('My openings', 'white', null);
    const [entry] = library.repertoires();
    library.rename(entry.id, 'Open games');

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(RepertoireLibrary);
    expect(reloaded.repertoires()).toEqual([{ ...entry, name: 'Open games' }]);
    reloaded.remove(entry.id);

    TestBed.resetTestingModule();
    expect(TestBed.inject(RepertoireLibrary).repertoires()).toEqual([]);
  });

  it('preserves storage from an unsupported version', () => {
    const key = 'chessbook.repertoires';
    const futureData = '{"version":2,"entries":[]}';
    localStorage.setItem(key, futureData);

    const library = TestBed.inject(RepertoireLibrary);
    expect(library.storageError()).toContain('Could not read saved repertoires');
    expect(() => library.create('New', 'white', null)).toThrow();
    expect(localStorage.getItem(key)).toBe(futureData);
  });
});
