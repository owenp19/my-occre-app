import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  {
    path: 'welcome',
    loadChildren: () =>
      import('./features/welcome/welcome.module').then(
        m => m.WelcomePageModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/login/login.module').then(
        m => m.LoginPageModule
      ),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./features/auth/register/register.module').then(
        m => m.RegisterPageModule
      ),
  },

  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then(
        m => m.HomePageModule
      ),
  },
  {
    path: 'procedures',
    loadChildren: () =>
      import('./features/procedures/procedures.module').then(
        m => m.ProceduresPageModule
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then(
        m => m.ProfilePageModule
      ),
  },

  {
    path: '**',
    redirectTo: 'welcome',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}