import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChatsService, SocketsService, UsersService} from '../../../global/services';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel, VideoOptions} from '../../../global/models';
import {Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
    selector: 'ami-fullstack-chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {

    message = {
        // tslint:disable-next-line:max-line-length
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
        senderName: 'Emma Bailey',
        message: 'Hello, how are you ?',
        day: 'Tue',
    };
    messages: {}[];
    me: UserModel;
    chats: ChatModel[] = [];
    showLoader = true;
    private subscriptions: Subscription[];
    private chatUpdates: Subscription;

    constructor(private chatsService: ChatsService,
                private usersService: UsersService,
                private router: Router,
                private socketService: SocketsService) {
    }

    async ngOnInit() {

        this.messages = Array(20).fill(this.message);
        await this.fetchData();
        console.log(this.chats);

    }

    private async fetchData() {
        this.showLoader = true;
        this.me = await this.usersService.getMe();

        this.me = await this.usersService.getById(this.me._id).toPromise();
        console.log('before', this.chats);
        console.log('ME', this.me);


        this.chatUpdates = this.socketService
            .syncMessages(`newChat`).pipe(
                switchMap((message: {event: string, message: ChatModel}) => {
                    const chatId = message.message._id;
                    // if (!msg.message) return new Observable(observer => {
                    //     observer.next('');
                    // });
                    return this.socketService.syncMessages(`/${chatId}/newMessage`);
                })
            ).subscribe(async (msg: {event: string, message: { message: MessageWithRepliesModel, chatId: string} }) => {

                const message = msg.message.message;
                const chatId = msg.message.chatId;
                console.log(chatId, message);
                if (message.type === MessageType.STATUS) {
                    const createdChat = await this.chatsService.getById(message.senderId).toPromise();
                    console.log('Created', createdChat);

                    let member: UserModel;
                    if (createdChat.participants.length === 2) {
                        const partId = createdChat.participants.filter(id => id !== this.me._id)[0];
                        member = await this.usersService.getById(partId).toPromise();
                    }

                    this.chats = [
                        ...this.chats,
                        createdChat
                    ];


                    this.onReceiveMessage(message.senderId, message, member);
                } else {
                    this.onReceiveMessage(chatId, message);
                }
            });

        // this.socketService
        //     .syncMessages(`newChat`)
        //     .subscribe((message: {event: string, message: ChatModel}) => {
        //         const chatId = message.message._id;
        //         this.socketService
        //             .syncMessages(`/${chatId}/newMessage`)
        //             .subscribe(async (msg: {event: string, message: MessageWithRepliesModel}) => {
        //
        //                 if (msg.message.type === MessageType.STATUS) {
        //                     const createdChat = await this.chatsService.getById(msg.message.senderId).toPromise();
        //                     console.log('Created', createdChat);
        //
        //                     let member: UserModel;
        //                     if (createdChat.participants.length === 2) {
        //                         const partId = createdChat.participants.filter(id => id !== this.me._id)[0];
        //                         member = await this.usersService.getById(partId).toPromise();
        //                     }
        //
        //                     this.chats = [
        //                         ...this.chats,
        //                         createdChat
        //                     ];
        //
        //
        //                     this.onReceiveMessage(msg.message.senderId, msg.message, member);
        //                 } else {
        //                     this.onReceiveMessage(chatId, msg.message);
        //                 }
        //
        //
        //             });
        //     });


        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chatId: string, index: number) => {
            return await this.chatsService.getById(chatId).toPromise();
        }));

        this.subscriptions = this.chats.map(chat => {
            return this.socketService
                .syncMessages(`/${chat._id}/newMessage`)
                .subscribe(async (msg: {event: string, message: { message: MessageWithRepliesModel, chatId: string} }) => {
                    this.onReceiveMessage(chat._id, msg.message.message);
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
                    displayName: member ? member.getFullName() : chat.displayName,
                    photoUrl: member ? member.getPhoto() : chat.photoUrl
                });
            } else {

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

    private onReceiveMessage(chatId: string, message: MessageWithRepliesModel, member?: UserModel) {

        console.log('message received', chatId, message);
        const selectedChatIndex = this.chats.findIndex((chat) => {
            return chat._id === chatId;
        });
        this.chats = [
            ...this.chats.filter<ChatModel>((chat: ChatModel): chat is ChatModel => {
                return chat._id !== chatId;
            }),
            this.getChatLastMessage(this.chats[selectedChatIndex], message, member)
        ];

        console.log('all new chats', this.chats);
        this.chats = this.chats
            .sort(
                (a, b) => (
                    new Date(a.more.lastMsg.timestamp).getTime() < new Date(b.more.lastMsg.timestamp).getTime()
                ) ? 1 : -1
            );
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
        this.chatUpdates.unsubscribe();
    }
}
