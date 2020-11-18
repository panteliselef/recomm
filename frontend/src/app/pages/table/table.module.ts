import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {TableRoutingModule} from "./table.routing";
import {HomeTableComponent} from "./home-table/home-table.component";
import {ViewImagesComponent} from "./view-images/view-images.component";
import {AddPeopleComponent} from "./add-people/add-people.component";


@NgModule({
    imports: [
        CommonModule,
        TableRoutingModule
    ],
    declarations: [
        HomeTableComponent,
        ViewImagesComponent,
        AddPeopleComponent
    ]
})
export class TableModule {
}
