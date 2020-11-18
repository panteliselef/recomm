import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)},
    {
        path: 'socket-events',
        loadChildren: () => import('./pages/socket-events/socket-events.module').then(m => m.SocketEventsModule)
    },
    {path: 'tasks', loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksModule)},
    {path: 'mobile', pathMatch: 'prefix', loadChildren: () => import('./mobile.module').then(m => m.MobileModule)},
    {path: 'table', loadChildren: () => import('./pages/table/table.module').then(m => m.TableModule)},
    {path: 'tv', pathMatch: 'prefix', loadChildren: () => import('./pages/tv/tv.module').then(m => m.TvModule)},
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
