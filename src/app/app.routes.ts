import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ContentComponent } from './shared/content/content.component';
import { UpdateAccountComponent } from './pages/update-account/update-account.component';
import { LogbookComponent } from './pages/logbook/logbook.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MonevComponent } from './pages/monev/monev.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ListUserComponent } from './pages/list-user/list-user.component';
import { DetailLogbookComponent } from './pages/detail-logbook/detail-logbook.component';
import { DetailMonevComponent } from './pages/detail-monev/detail-monev.component';
import { DetailUsersComponent } from './pages/detail-users/detail-users.component';
import { SettingComponent } from './pages/setting/setting.component';

export const routes: Routes = [
  {path: "", component: LandingPageComponent},
  {path: "login", component: LoginComponent},
  {path: "register", component: RegisterComponent},
  {path: "forget-password", component:ForgetPasswordComponent},
  // {path: "page-404", component:PageNotFoundComponent},
  {path: "update-account", component:UpdateAccountComponent},

  {path: "",
    component:ContentComponent,
    children: [
      {path: "", redirectTo: 'home', pathMatch: 'full'},
      {path: "dashboard", component:DashboardComponent},
      {path: "logbook", component:LogbookComponent},
      {path:"logbook/1",component:DetailLogbookComponent},
      {path: "monev", component:MonevComponent},
      {path:"monev/1",component:DetailMonevComponent},
      {path: "profile", component:ProfileComponent},
      {path: "setting", component:SettingComponent},
      {path: "list-user", component:ListUserComponent},
      {path:"list-user/1",component:DetailUsersComponent},
    ]
  },
  { path: 'page-404', component: PageNotFoundComponent },
  { path: '**', redirectTo: 'page-404' }
];
