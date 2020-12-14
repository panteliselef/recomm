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

    @ViewChild('scroll', {static: false, read: ElementRef}) public scroll: ElementRef<any>;

    readonly url: string = 'http://localhost:8080/api/files/download/';


    chat: ChatModel;
    chats: ChatModel[];
    me: UserModel;
    chatName: string;
    chatId: string;


    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private usersService: UsersService,
                private socketService: SocketsService,
                private chatsService: ChatsService,
                private router: Router) {
    }

    async ngOnInit() {
        this.chatId = this.route.snapshot.params.id;
        this.me = await this.usersService.getMe();
        await this.chatsInfo();
        console.log(this.chatId);
    }

    async goToBrowseImages() {
        await this.router.navigate(['browse-images'], {relativeTo: this.route});
    }

    async goToBrowseDocuments() {
        await this.router.navigate(['browse-documents'], {relativeTo: this.route});
    }

    async chatsInfo() {

        // tslint:disable-next-line:variable-name
        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id: string, index: number) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

        // tslint:disable-next-line:variable-name
        this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {

            let member: UserModel;
            if (chat.participants.length === 2) {
                console.log(chat.participants);
                const partId = chat.participants.filter(id => id !== this.me._id)[0];
                member = await this.usersService.getById(partId).toPromise();
            }
            return new ChatModel({
                ...chat, displayName: member.getFullName(), photoUrl: member.getPhoto()
            });
        }));

        this.chat = this.chats.find(chat => chat._id === this.chatId);

        console.log(this.chat);
    }


}
