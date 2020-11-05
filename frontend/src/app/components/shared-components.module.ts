import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppBarComponent } from 'src/app/components/app-bar/app-bat.component';
import { BottomNavMenuComponent } from 'src/app/components/bottom-nav-menu/bottom-nav-menu.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        AppBarComponent,
        BottomNavMenuComponent
    ],
    exports: [
        AppBarComponent,
        BottomNavMenuComponent,
    ]
})
export class SharedComponentsModule { }
