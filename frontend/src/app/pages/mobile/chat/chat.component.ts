import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'ami-fullstack-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    chatId:Number;
    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.chatId = +this.route.snapshot.params.id;
    }

}
