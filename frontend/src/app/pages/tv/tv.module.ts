import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {TvRoutingModule} from "./tv.routing";

import {SmartTvComponent} from "./smart-tv/smart-tv.component";
import {SmartTvDuringCallComponent} from "./smart-tv-during-call/smart-tv-during-call.component";

@NgModule({
    imports: [
        CommonModule,
        TvRoutingModule
    ],
    declarations: [
        SmartTvComponent,
        SmartTvDuringCallComponent
    ]
})
export class TvModule {
}
