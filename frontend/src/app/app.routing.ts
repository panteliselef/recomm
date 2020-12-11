import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuardService} from './global/services/auth/auth-guard.service';

const routes: Routes = [
    {
        path: 'home',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
    },
    {path: 'signin', loadChildren: () => import('./pages/sign-in/sign-in.module').then(m => m.SignInModule)},
    {
        path: 'socket-events',
        loadChildren: () => import('./pages/socket-events/socket-events.module').then(m => m.SocketEventsModule)
    },
    {path: 'tasks', loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksModule)},
    {
        path: 'mobile',
        canActivate: [AuthGuardService],
        pathMatch: 'prefix',
        loadChildren: () => import('./mobile.module').then(m => m.MobileModule)
    },
    {
        path: 'table',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./pages/table/table.module').then(m => m.TableModule)
    },
    {
        path: 'tv',
        canActivate: [AuthGuardService],
        pathMatch: 'prefix',
        loadChildren: () => import('./pages/tv/tv.module').then(m => m.TvModule)
    },
    // { path: 'mobile/chats', loadChildren: () => import('./pages/chats-list/chats-list.module').then(m => m.ChatsListModule)},
    // { path: 'mobile/contacts', loadChildren: () => import('./pages/contacts/contacts.module').then(m => m.ContactsModule)},
    {path: '**', redirectTo: 'home', pathMatch: 'full'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
