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
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.module').then(
        m => m.SettingsPageModule
      ),
  },
  {
    path: 'help-contact',
    loadChildren: () =>
      import('./features/help-contact/help-contact.module').then(
        m => m.HelpContactPageModule
      ),
  },
  {
    path: 'legal',
    loadChildren: () =>
      import('./features/legal/legal.module').then(
        m => m.LegalPageModule
      ),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./features/notifications/notifications.module').then(
        m => m.NotificationsPageModule
      ),
  },
  {
    path: 'data-protection',
    loadChildren: () =>
      import('./features/data-protection/data-protection.module').then(
        m => m.DataProtectionPageModule
      ),
  },
  {
    path: 'recover-password',
    loadChildren: () =>
      import('./features/auth/recover-password/recover-password.module').then(
        m => m.RecoverPasswordPageModule
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