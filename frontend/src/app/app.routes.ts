import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardPageComponent } from './dashboard-page.component';
import { NotFoundComponent } from './not-found.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];
