import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-chat-bar',
    templateUrl: './app-chat-bar.component.html',
    styleUrls: ['./app-chat-bar.component.scss']
})
export class AppChatBarComponent implements OnInit {
    @Input('chatName') chatName: String;
    @Input('icons') icons: { name:String, onClick: Function }[];
    @Input('img') imgSrc: String;

    chatStatus: String = 'online';

    constructor() {
    }

    ngOnInit() {
        console.log(this.icons)
    }

}
