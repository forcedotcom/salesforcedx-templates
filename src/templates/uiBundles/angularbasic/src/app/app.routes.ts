import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];
