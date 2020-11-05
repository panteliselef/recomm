import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContactsComponent} from './contacts.component';
import {ContactsRoutingModule} from './contacts.routing';
import {SharedComponentsModule} from "../../../components/shared-components.module";

@NgModule({
    imports: [
        CommonModule,
        ContactsRoutingModule,
        SharedComponentsModule
    ],
    declarations: [
        ContactsComponent,
        // AppBarComponent,
        // BottomNavMenuComponent
    ]
})
export class ContactsModule {
}
