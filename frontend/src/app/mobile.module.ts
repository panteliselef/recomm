import { NgModule } from '@angular/core';

import {CommonModule} from '@angular/common';
import {ChatsListComponent} from "./pages/mobile/chats-list/chats-list.component";
import {ContactsComponent} from "./pages/mobile/contacts/contacts.component";
import {SharedComponentsModule} from "./components/shared-components.module";
import {MobileRoutingModule} from "./mobile.routing";
import {ChatComponent} from "./pages/mobile/chat/chat.component";
import {EditProfileComponent} from "./pages/mobile/edit-profile/edit-profile.component";
import {NewChatComponent} from "./pages/mobile/new-chat/new-chat.component";

@NgModule({
    imports: [
        CommonModule,
        SharedComponentsModule,
        MobileRoutingModule,
    ],
    declarations: [
        ChatsListComponent,
        ContactsComponent,
        ChatComponent,
        EditProfileComponent,
        NewChatComponent
    ]
})
export class MobileModule {}
