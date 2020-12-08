import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {ChatsListComponent} from "./pages/mobile/chats-list/chats-list.component";
import {ContactsComponent} from "./pages/mobile/contacts/contacts.component";
import {SharedComponentsModule} from "./components/shared-components.module";
import {MobileRoutingModule} from "./mobile.routing";
import {ChatComponent} from "./pages/mobile/chat/chat.component";
import {EditProfileComponent} from "./pages/mobile/edit-profile/edit-profile.component";
import {NewChatComponent} from "./pages/mobile/new-chat/new-chat.component";
import {PrepCallComponent} from "./components/prep-call/prep-call.component";
import {EditChatComponent} from "./pages/mobile/edit-chat/edit-chat.component";

import {ChatReplyComponent} from "./pages/mobile/chat-reply/chat-reply.component";
import {ChatCallComponent} from "./pages/mobile/chat-call/chat-call.component";

import {PreviewImageComponent} from "./pages/mobile/preview-image/preview-image.component";
import {BrowseImagesComponent} from "./pages/mobile/browse-images/browse-images.component";
import {CalendarComponent} from "./pages/mobile/calendar/calendar.component";
import {SearchComponent} from "./pages/mobile/search/search.component";
import {FormsModule} from "@angular/forms";
import {VoiceComponent} from "./pages/mobile/voice/voice.component";


@NgModule({
    imports: [
        CommonModule,
        SharedComponentsModule,
        MobileRoutingModule,
        FormsModule,
    ],
    declarations: [
        ChatsListComponent,
        ContactsComponent,
        ChatComponent,
        EditProfileComponent,
        NewChatComponent,
        PrepCallComponent,

        EditChatComponent,
        ChatReplyComponent,
        ChatCallComponent,

        SearchComponent,
        VoiceComponent,

        PreviewImageComponent,
        BrowseImagesComponent,
        EditChatComponent,

        CalendarComponent

    ]
})
export class MobileModule {
}
