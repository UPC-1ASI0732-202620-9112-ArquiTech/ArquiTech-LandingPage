import { Routes } from '@angular/router';
import { LandingComponent } from './landing';
import { LegalComponent } from './legal';
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'experimento/ec10', loadComponent: () => import('./ec10-landing').then((m) => m.Ec10LandingComponent) },
  // Earlier links to the experiment keep working.
  { path: 'experiment/ec10', redirectTo: 'experimento/ec10' },
  { path: 'privacy', component: LegalComponent, data: { page: 'privacy' } },
  { path: 'terms', component: LegalComponent, data: { page: 'terms' } },
  { path: '**', redirectTo: '' },
];
