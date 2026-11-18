import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./study/study-page').then((page) => page.StudyPage),
  },
  { path: '**', redirectTo: '' },
];
