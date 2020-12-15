import {Component, OnInit} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {Router} from '@angular/router';
import {ChatsService, SocketsService, UsersService} from '../../../global/services';

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
    user: UserModel;
    senderName: string;
    chat: ChatModel;
    imgMessages: MessageWithRepliesModel[];
<<<<<<< Updated upstream

    inCallChatId: string;
=======
    imgNum: string;
    timeStamp: Date;
    imgSize: number;
>>>>>>> Stashed changes

    constructor(private router: Router,
                private usersService: UsersService,
                private chatsService: ChatsService,
                private socketService: SocketsService) {

    }

    async chooseChat(chatId: string) {
        this.chat = this.chats.find(chat => chat._id === chatId);

        this.imgMessages = this.chat.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): message is MessageWithRepliesModel => {
            return message.type === MessageType.IMAGE_STATIC;
        });
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe();

        this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`)
            .subscribe(async (msg: {event: string,message: {chatId: string,device: string}}) => {

                if(!msg.message) return
                console.log(msg.message.chatId)
                this.inCallChatId = msg.message.chatId


                this.socketService
                    .syncMessages(`${msg.message.chatId}/videocall/user-left`)
                    .subscribe((msg) => {

                        if(msg.message === this.me._id) this.inCallChatId = msg.message.chatId
                        console.log(msg.message)
                    });
            })


        this.socketService.sendMessage('getUser',{
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

    joinAnotherCall() {

        // Leave previous call
        if(this.inCallChatId) {
            this.socketService.sendMessage(`videocall/leave`, {
                chat: this.inCallChatId,
                member: this.me._id
            })
        }


    }

    async previewImage(photo: MessageWithRepliesModel) {
        console.log(photo);
        console.log(this.chats);
        this.user = await this.usersService.getById(photo.senderId).toPromise();
        this.senderName = this.user.getFullName();
        this.timeStamp = photo.timestamp;
        this.imgSize = photo.value.size;
        console.log(this.senderName);
        console.log(photo.timestamp);
        console.log(photo.value.size);
    }


    async getAllImages() {
        console.log(this.me);
        this.chatsInfo();
        console.log(this.chats);

        this.imgMessages = this.chats.map(value => {
            return value.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): message is MessageWithRepliesModel => {
                return message.type === MessageType.IMAGE_STATIC;
            });
        }).reduce((acc, value) => {
            return [ ...acc, ...value];
        }, []);


        console.log('message ', this.imgMessages);
    }
}
