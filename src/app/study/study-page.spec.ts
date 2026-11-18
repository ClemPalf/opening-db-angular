import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StudyPage } from './study-page';

describe('StudyPage', () => {
  it('lets the user choose a variation and return to the root', async () => {
    const fixture = TestBed.createComponent(StudyPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const click = async (text: string) => {
      const button = Array.from(page.querySelectorAll('button')).find(
        (candidate) => candidate.textContent.trim() === text,
      );
      expect(button).toBeDefined();
      button?.click();
      await fixture.whenStable();
    };

    await click('e4');
    await click('c5');
    expect(page.textContent).toContain('Sicilian Defence');
    expect(page.querySelector('[aria-current="step"]')?.textContent.trim()).toBe('c5');

    await click('Start');
    expect(page.querySelector('[aria-current="step"]')?.textContent.trim()).toBe('Start');
    expect(page.textContent).not.toContain('Sicilian Defence');
  });

  it('follows the chosen branch to its end and returns to the start', async () => {
    const fixture = TestBed.createComponent(StudyPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const click = async (selector: string) => {
      const button = page.querySelector<HTMLButtonElement>(selector);
      expect(button).toBeDefined();
      button?.click();
      await fixture.whenStable();
    };

    await click('[aria-label="Next move"]');
    const continuation = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent.trim() === 'c5',
    );
    expect(continuation).toBeDefined();
    continuation?.click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.last-move')).toHaveLength(2);

    await click('[aria-label="Go to end of line"]');
    expect(page.querySelector('[aria-current="step"]')?.textContent.trim()).toBe('d6');
    await click('[aria-label="Go to start"]');
    expect(page.querySelectorAll('.last-move')).toHaveLength(0);
  });
});
