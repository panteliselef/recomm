import {Component, OnInit} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {Router} from '@angular/router';
import {ChatsService, UsersService} from '../../../global/services';
import {Subscription} from 'rxjs';

@Component({
    selector: 'ami-fullstack-view-images',
    templateUrl: './view-images.component.html',
    styleUrls: [
        './view-images.component.scss',

    ]
})
export class ViewImagesComponent implements OnInit {

    readonly url: string = 'http://localhost:8080/api/files/download/';

    me: UserModel;
    chats: ChatModel[];
    chat: ChatModel;
    imgMessages: MessageWithRepliesModel[];
    imgNum: string;

    testArr = Array(23).fill(5);

    constructor(private router: Router,
                private usersService: UsersService,
                private chatsService: ChatsService,
                private chatService: ChatsService) {
    }

    async chooseChat(chatId: string) {
        this.chat = this.chats.find(chat => chat._id === chatId);

        // @ts-ignore
        this.imgMessages = this.chat.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): boolean => {
            return message.type === MessageType.IMAGE_STATIC;
        });

        console.log(this.imgMessages);
        if (this.imgMessages.length === 1) {
            this.imgNum = this.imgMessages.length + ' Image';
        } else {
            this.imgNum = this.imgMessages.length + ' Images';
        }
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe();

        this.chatsInfo();
    }

    async chatsInfo() {

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

        console.log(this.chats);
    }
}
