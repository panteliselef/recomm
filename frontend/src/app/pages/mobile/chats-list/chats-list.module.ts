import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChatsListComponent} from './chats-list.component';
import {ChatsListRoutingModule} from './chats-list.routing';
import {SharedComponentsModule} from "../../../components/shared-components.module";

@NgModule({
    imports: [
        CommonModule,
        ChatsListRoutingModule,
        SharedComponentsModule
    ],
    declarations: [
        ChatsListComponent,
        // AppBarComponent,
        // BottomNavMenuComponent
    ]
})
export class ChatsListModule {
}
