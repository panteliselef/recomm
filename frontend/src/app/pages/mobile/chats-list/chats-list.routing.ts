import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatsListComponent } from './chats-list.component';


const routes: Routes = [
  { path: '', component: ChatsListComponent, },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ChatsListRoutingModule { }
