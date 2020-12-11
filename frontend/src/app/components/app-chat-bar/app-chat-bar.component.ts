import {Component, Input, OnInit} from '@angular/core';
import {Location} from '@angular/common'
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-chat-bar',
    templateUrl: './app-chat-bar.component.html',
    styleUrls: ['./app-chat-bar.component.scss']
})
export class AppChatBarComponent implements OnInit {
    @Input('chatName') chatName: string;
    @Input('icons') icons: { name: string, onClick: Function }[];

    chatStatus: string = 'online';

    chat_id: number;
    reply_id: number;

    constructor(private activatedRoute: ActivatedRoute, private location: Location) {
        this.chat_id = this.activatedRoute.snapshot.params['id'];
        this.reply_id = this.activatedRoute.snapshot.params['rid'];
    }

    ngOnInit() {
        console.log(this.icons);
    }

    goBack(): void {
        this.location.back();
    }
}
