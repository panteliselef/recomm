import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SmartTvComponent} from "./smart-tv/smart-tv.component";
import {SmartTvDuringCallComponent} from "./smart-tv-during-call/smart-tv-during-call.component";

const routes: Routes = [

    { path: '' , component: SmartTvComponent},
    { path: 'call/:id' , component: SmartTvDuringCallComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TvRoutingModule {
}
