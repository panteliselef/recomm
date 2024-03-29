import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppBarComponent } from 'src/app/components/app-bar/app-bar.component';
import { BottomNavMenuComponent } from 'src/app/components/bottom-nav-menu/bottom-nav-menu.component';
import { AppChatBarComponent } from './app-chat-bar/app-chat-bar.component';
import {LinkifyPipe} from "../global/pipes/linkify.pipe";
import {ChatTextAreaComponent} from "./chat-text-area/chat-text-area.component";
import {FormsModule} from "@angular/forms";
import {VirtualComponent} from "./virtual/virtual.component";
import {ProgressiveImageComponent} from "./progressive-image/progressive-image.component";
import {ByteConvertionPipe} from "../global/pipes/byte-convertion.pipe";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
    ],
    declarations: [
        AppBarComponent,
        BottomNavMenuComponent,
        AppChatBarComponent,
        LinkifyPipe,
        ByteConvertionPipe,
        ChatTextAreaComponent,
        VirtualComponent,
        ProgressiveImageComponent
    ],
    exports: [
        AppBarComponent,
        BottomNavMenuComponent,
        AppChatBarComponent,
        LinkifyPipe,
        ByteConvertionPipe,
        ChatTextAreaComponent,
        VirtualComponent,
        ProgressiveImageComponent
    ]
})
export class SharedComponentsModule { }
