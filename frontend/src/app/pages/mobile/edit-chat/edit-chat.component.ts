import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from "../../../global/models";
import {Subscription} from "rxjs";

@Component({
    selector: 'ami-fullstack-edit-chat',
    templateUrl: './edit-chat.component.html',
    styleUrls: ['./edit-chat.component.scss']
})
export class EditChatComponent implements OnInit {

    readonly url: string = 'http://localhost:8080/api/files/download/';


    chat: ChatModel;
    chats: ChatModel[];
    me: UserModel;
    chatName: string;
    chatId: string;


    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private socketService: SocketsService,
                private router: Router) {
    }

    async ngOnInit() {
        this.chatId = this.route.snapshot.params.id;
        this.me = await this.userService.getMe();
        this.chat = await this.chatService.getById(this.chatId).toPromise();
        await this.chatsInfo();
    }

    async goToBrowseImages() {
        await this.router.navigate(['browse-images'], {relativeTo: this.route});
    }

    async goToBrowseDocuments() {
        await this.router.navigate(['browse-documents'], {relativeTo: this.route});
    }

    async chatsInfo() {

        let member: UserModel;
        if (this.chat.participants.length === 2) {
            // console.log(chat.participants);
            const partId = this.chat.participants.filter(id => id !== this.me._id)[0];
            member = await this.userService.getById(partId).toPromise();
            this.chat = new ChatModel({
                ...this.chat, displayName: member.getFullName(), photoUrl: member.getPhoto()
            });
        }

    }


}
