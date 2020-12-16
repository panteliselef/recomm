import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {Router} from '@angular/router';
import {ChatsService, SocketsService, UsersService} from '../../../global/services';

import {environment} from "../../../../environments/environment";


@Component({
    selector: 'ami-fullstack-view-images',
    templateUrl: './view-images.component.html',
    styleUrls: [
        './view-images.component.scss',

    ]
})
export class ViewImagesComponent implements OnInit {

    @Output('onCallChat') callChat: EventEmitter<string> = new EventEmitter<string>();
    readonly url: string = environment.host + '/api/files/download/';

    me: UserModel;
    chats: ChatModel[];
    user: UserModel;
    senderName: string;
    chat: ChatModel;
    imgMessages: MessageWithRepliesModel[];

    inCallChatId: string;
    timeStamp: Date;
    imgSize: number;
    showImagePreview: boolean;
    imgSrc: string;
    showAllImages: boolean = false;
    messages: MessageWithRepliesModel[];

    constructor(private router: Router,
                private usersService: UsersService,
                private chatsService: ChatsService,
                private socketService: SocketsService) {
    }

    async chooseChat(chatId: string) {
        this.showAllImages = false;
        this.chat = this.chats.find(chat => chat._id === chatId);


        await this.fetchPhotos(this.chat._id)
        this.imgMessages = this.messages;
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe();

        this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`)
            .subscribe(async (msg: { event: string, message: { chatId: string, device: string } }) => {

                if (!msg.message) return
                console.log(msg.message.chatId)
                this.inCallChatId = msg.message.chatId


                this.socketService
                    .syncMessages(`${msg.message.chatId}/videocall/user-left`)
                    .subscribe((msg) => {

                        if (msg.message === this.me._id) this.inCallChatId = ''
                        console.log(msg.message)
                    });
            })


        this.socketService.sendMessage('getUser', {
            member: this.me._id
        })

        await this.chatsInfo();
    }

    async chatsInfo() {
        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id: string, index: number) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

        this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {
            let member: UserModel;
            if (chat.participants.length === 2) {
                const partId = chat.participants.filter(id => id !== this.me._id)[0];
                member = await this.usersService.getById(partId).toPromise();
                return new ChatModel({
                    ...chat, displayName: member.getFullName(), photoUrl: member.getPhoto()
                });
            }
            return chat;
        }));
    }

    async fetchPhotos(chatid?: string) {
        let l;
        if(!chatid) {
            l = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {
                return await this.chatsService.getById(chat._id).toPromise();
            }));
        }else {
            l = [await this.chatsService.getById(chatid).toPromise()];
        }


        this.messages = l.map(value => {
            return value.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): message is MessageWithRepliesModel => {
                return message.type === MessageType.IMAGE_STATIC;
            });
        }).reduce((acc, value) => {
            return [...acc, ...value];
        }, []);
    }

    joinAnotherCall(newChatId: string) {

        // Leave previous call
        if (this.inCallChatId) {
            this.socketService.sendMessage(`videocall/leave`, {
                chat: this.inCallChatId,
                member: this.me._id
            })
        }

        this.inCallChatId = ''
        this.callChat.emit(newChatId)


    }

    async previewImage(photo: MessageWithRepliesModel) {

        this.showImagePreview = true;
        this.user = await this.usersService.getById(photo.senderId).toPromise();
        this.senderName = this.user.getFullName();
        this.timeStamp = photo.timestamp;
        this.imgSize = photo.value.size;
        this.imgSrc = this.url + photo.value.filename;
        console.log(photo.value)
    }


    async getAllImages() {

        this.chat = undefined;
        this.showAllImages = true;
        await this.fetchPhotos();
        this.imgMessages = this.messages;
    }


    downloadFileToDevice() {
        window.location.href = this.imgSrc;
    }
}
