import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ChatsListComponent} from "./pages/mobile/chats-list/chats-list.component";
import {ContactsComponent} from "./pages/mobile/contacts/contacts.component";
import {ChatComponent} from "./pages/mobile/chat/chat.component";
import {EditProfileComponent} from "./pages/mobile/edit-profile/edit-profile.component";
import {NewChatComponent} from "./pages/mobile/new-chat/new-chat.component";
import {PrepCallComponent} from "./components/prep-call/prep-call.component";
import {EditChatComponent} from "./pages/mobile/edit-chat/edit-chat.component";

import {ChatReplyComponent} from "./pages/mobile/chat-reply/chat-reply.component";
import {ChatCallComponent} from "./pages/mobile/chat-call/chat-call.component";
import {PreviewImageComponent} from "./pages/mobile/preview-image/preview-image.component";
import {BrowseImagesComponent} from "./pages/mobile/browse-images/browse-images.component";

const routes: Routes = [
    // { path: '', redirectTo:'chats' },
    {path: 'chats', component: ChatsListComponent,},
    {path: 'chats/:id', component: ChatComponent,},
    {path: 'chats/:id/reply/:rid', component: ChatReplyComponent},
    {path: 'contacts', component: ContactsComponent,},
    {path: 'profile', component: EditProfileComponent},
    {path: 'new-chat', component: NewChatComponent,},
    {path: 'prep-call', component: PrepCallComponent,},
    {path: 'call', component: ChatCallComponent},
    {path: 'preview-image', component: PreviewImageComponent},
    {path: 'browse-images', component: BrowseImagesComponent},

    {path: 'edit-chat', component: EditChatComponent},

    {path: '**', redirectTo: 'chats', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MobileRoutingModule {
}
