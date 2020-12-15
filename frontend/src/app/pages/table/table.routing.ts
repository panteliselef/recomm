import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeTableComponent} from './home-table/home-table.component';
import {AddPeopleComponent} from './add-people/add-people.component';
import {ViewImagesComponent} from './view-images/view-images.component';
import {ManageTvLayoutComponent} from './manage-tv-layout/manage-tv-layout.component';

const routes: Routes = [

    {
        path: '', component: HomeTableComponent, children: [
            // {path: '', redirectTo: 'view-images'},
            // {path: ':chatId/edit-tv-layout', component: ManageTvLayoutComponent,},
            // {path: ':chatId/add-people', component: AddPeopleComponent,},
            // {
            //     path: 'view-images', component: ViewImagesComponent, children: [
            //         {path: ':chatId', component: ViewImagesComponent}
            //     ]
            // },

        ]
    },
    {path: '**', redirectTo: '', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TableRoutingModule {
}
