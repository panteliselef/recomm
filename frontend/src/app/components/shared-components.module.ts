import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppBarComponent } from 'src/app/components/app-bar/app-bar.component';
import { BottomNavMenuComponent } from 'src/app/components/bottom-nav-menu/bottom-nav-menu.component';
import { AppChatBarComponent } from './app-chat-bar/app-chat-bar.component';
import {LinkifyPipe} from "../global/pipes/linkify.pipe";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        AppBarComponent,
        BottomNavMenuComponent,
        AppChatBarComponent,
        LinkifyPipe
    ],
    exports: [
        AppBarComponent,
        BottomNavMenuComponent,
        AppChatBarComponent,
        LinkifyPipe
    ]
})
export class SharedComponentsModule { }
