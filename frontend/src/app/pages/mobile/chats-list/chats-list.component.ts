import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChatsService} from '../../../global/services';
import {UsersService} from '../../../global/services';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {Router} from '@angular/router';
import {SocketsService} from '../../../global/services';
import {Subscription} from 'rxjs';

@Component({
    selector: 'ami-fullstack-chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {

    message = {
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
        senderName: 'Emma Bailey',
        message: 'Hello, how are you ?',
        day: 'Tue',
    };
    messages: Object[];
    me: UserModel;
    chats: ChatModel[];
    showLoader = true;
    private subscriptions: Subscription[];

    constructor(private chatsService: ChatsService, private usersService: UsersService, private router: Router, private socketService: SocketsService) {
    }

    async ngOnInit() {

        this.messages = Array(20).fill(this.message);
        await this.fetchData();
        console.log(this.chats);

    }


    private async fetchData() {
        this.showLoader = true;
        this.me = await this.usersService.getMe();


        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id: string, index: number) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

        this.subscriptions = this.chats.map(chat => {
            return this.socketService
                .syncMessages(`/${chat._id}/newMessage`)
                .subscribe((msg) => {
                    this.onReceiveMessage(chat._id, msg.message);
                });
        });

        this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {

            let member: UserModel;
            if (chat.participants.length === 2) {
                console.log(chat.participants);
                const partId = chat.participants.filter(id => id !== this.me._id)[0];
                member = await this.usersService.getById(partId).toPromise();
            }
            if (!chat.messages.length) {
                return new ChatModel({
                    ...chat,
                    more: {lastMsg: {value: 'Start talking', timestamp: Date.now()}},
                    displayName: member? member.getFullName(): chat.displayName,
                    photoUrl: member? member.getPhoto(): chat.photoUrl
                })
            }
            else {

                const s = await this.chatsService.getMessages(chat._id).toPromise();

                const lastMsg: MessageWithRepliesModel = s[s.length - 1].messages[s[s.length - 1].messages.length - 1];

                return this.getChatLastMessage(chat, lastMsg, member);
            }
        })).then(chats => {
            console.log(chats);
            chats.sort((a, b) => (new Date(a.more.lastMsg.timestamp).getTime() < new Date(b.more.lastMsg.timestamp).getTime()) ? 1 : -1);
            return chats;
        });

        this.showLoader = false;
    }

    async goToProfile() {
        await this.router.navigate(['/mobile', 'profile']);
    }

    async goToNewChat() {
        await this.router.navigate(['/mobile', 'new-chat']);
    }

    private onReceiveMessage(chat_id: string, message: MessageWithRepliesModel) {

        const selectedChatIndex = this.chats.findIndex((chat) => {
            return chat._id === chat_id;
        });
        this.chats = [
            ...this.chats.filter<ChatModel>((chat: ChatModel): chat is ChatModel => {
                return chat._id !== chat_id;
            }),
            this.getChatLastMessage(this.chats[selectedChatIndex], message)
        ];
    }

    private getChatLastMessage(chat: ChatModel, lastMsg: MessageWithRepliesModel, member?: UserModel) {
        if (lastMsg.type === MessageType.FILE) {
            lastMsg.value = 'Sent a File';
        } else if (lastMsg.type === MessageType.IMAGE_GIF) {
            lastMsg.value = 'Sent a Gif';
        } else if (lastMsg.type === MessageType.IMAGE_STATIC) {
            lastMsg.value = 'Send a Image';
        }

        if (lastMsg.senderId === this.me._id) {
            lastMsg.value = `You: ${lastMsg.value}`;
        }

        if (!member) {
            return new ChatModel({
                ...chat,
                more: {lastMsg},
            });
        }

        return new ChatModel({
            ...chat,
            more: {lastMsg},
            displayName: member.getFullName(),
            photoUrl: member.getPhoto()
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    }
}
