import { Routes } from '@angular/router';
import { LandingComponent } from './landing';
import { LegalComponent } from './legal';
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'privacy', component: LegalComponent, data: { page: 'privacy' } },
  { path: 'terms', component: LegalComponent, data: { page: 'terms' } },
  { path: '**', redirectTo: '' },
];
