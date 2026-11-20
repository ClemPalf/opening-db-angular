import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./repertoires/repertoire-list').then((page) => page.RepertoireList),
  },
  {
    path: 'study/:id',
    loadComponent: () => import('./study/study-page').then((page) => page.StudyPage),
  },
  {
    path: 'study',
    loadComponent: () => import('./study/study-page').then((page) => page.StudyPage),
  },
  { path: '**', redirectTo: '' },
];
