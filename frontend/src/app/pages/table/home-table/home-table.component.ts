import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'ami-fullstack-home-table',
    templateUrl: './home-table.component.html',
    styleUrls: [
        '../view-images/view-images.component.scss',
        '../../mobile/chat-call/chat-call.component.scss',
        './home-table.component.scss'
    ],
})
export class HomeTableComponent implements OnInit {
    testArr = Array(23).fill(5)

    showOnlyParticipants: boolean = false;

    constructor(private activeRoute: ActivatedRoute) {

        if(this.activeRoute.snapshot['_routerState'].url.includes('edit-tv-layout'))
            this.showOnlyParticipants = true
    }

    ngOnInit() {
    }

}
