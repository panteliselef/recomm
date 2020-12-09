import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ChatsService} from "../../../global/services/chats/chats.service";
import {UsersService} from "../../../global/services/users/users.service";
import {ChatModel, MessageModel, MessageWithRepliesModel, UserModel} from "../../../global/models";
import {SocketsService} from "../../../global/services";

@Component({
    selector: 'ami-fullstack-chat-reply',
    templateUrl: './chat-reply.component.html',
    styleUrls: ['./chat-reply.component.scss','../chat/chat.component.scss'],
    encapsulation: ViewEncapsulation.None // i need this, for styling in linkify to work
})
export class ChatReplyComponent implements OnInit {

    readonly url: string = 'http://localhost:8080/api/files/download/';
    reply_id: number;
    repliedMessage: {
        user: UserModel,
        message: MessageWithRepliesModel
    } = {
        user: undefined,
        message: undefined
    }
    users = {
        '2': {
            name: 'Emma Mailey',
            photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
        },
        '3': {
            name: 'Pantelis Eleftheriadis',
            photoURL: 'https://instagram.fath3-3.fna.fbcdn.net/v/t51.2885-19/s320x320/77156724_2493626787562045_5174981635111649280_n.jpg?_nc_ht=instagram.fath3-3.fna.fbcdn.net&_nc_ohc=VUj-Kd-Z9qwAX-TVYNb&oh=25a92e09d3744602d0f19658a6da542d&oe=5FCECC40'
        }
    }

    icons= [
        {
            name: 'call',
            onClick: () => {
            }
        },
        {
            name: 'person_add',
            onClick: () => {
            }
        },
        {
            name: 'more_vert',
            onClick: () => {
            }
        }
    ];

    yestMessages: { user_id: string, timestamp: string, msgs: Object[] }[] = [
        {
            user_id: '3',
            timestamp: '10:15',
            msgs: [
                {
                    type: 'text',
                    text: 'Hey Emma, the next workshop will be held in the conference room of hotel XXX.'
                }, {
                    type: 'text',
                    text:'See ya there at 19.00'
                }
            ]
        }, {
            user_id: '3',
            timestamp: '23:45',
            msgs: [
                {
                    type: 'text',
                    text: 'Here’ re the photos you asked ...'
                }, {
                    type: 'image',
                    assetPath: 'https://images.unsplash.com/photo-1604755940817-3a1ca36e13c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
                }, {
                    type: 'image',
                    assetPath: 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
                },{
                    type: 'text',
                    text: 'What about this ? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match'
                },{
                    type: 'text',
                    text: 'Some inspiration https://dribbble.com/shots/11859371-Time-Clock-Scheduling-App'
                }


            ]
        }
    ]
    me: UserModel;
    chat: ChatModel;

    constructor(private activeRoute: ActivatedRoute, private chatService: ChatsService, private usersServices: UsersService, private socketService: SocketsService) {

        this.reply_id = this.activeRoute.snapshot.params['rid'];
        const chatId = this.activeRoute.snapshot.params.id;
        const msgId = this.activeRoute.snapshot.params.rid;
        this.fetchChatData(chatId,msgId);
    }

    getReplyMessage(rid:number) {
        return {
            rid,
            msg: {
                type:'text',
                text: 'Pls answer ASAP 🔥'
            },
            _timestamp: 'Oct 14th, 2020 at 17:44',
            senderId: '2'
        }
    }


    ngOnInit() {
        setTimeout(()=> {
            console.log(this.repliedMessage.message.replies)
        }, 1000)

    }

    private async fetchChatData(chatId: string,msgId: string) {
        const res: MessageWithRepliesModel = await this.chatService.getMessage(chatId,msgId).toPromise()
        this.repliedMessage.message = res;

        this.me = await this.usersServices.getMe();

        if(this.me._id !== res.senderId) {
            this.repliedMessage.user = await this.usersServices.getById(res.senderId).toPromise();
        }else {
            this.repliedMessage.user = this.me;
        }
        this.chat = await this.chatService.getById(chatId).toPromise();

        this.socketService
            .syncMessages(`/${this.chat._id}/newMessageAsReply`)
            .subscribe(async (msg) => {
                let {message} = msg;

                const sender: UserModel = await this.usersServices.getById(message.senderId).toPromise()
                message = {
                    ...message,
                    sender
                }
                this.repliedMessage.message.replies = [
                    ...this.repliedMessage.message.replies,
                    message
                ]
                // this.socketEvents.push(msg);
                console.log(msg);
            });


        this.repliedMessage.message.replies = await Promise.all<MessageModel>(this.repliedMessage.message.replies.map(async (msg)=> {

            const sender: UserModel = await this.usersServices.getById(msg.senderId).toPromise()
            return new MessageModel({...msg, sender});
        }))


        //     this.participants = await Promise.all<UserModel>(this.chat.participants.map( async (memberId) => {
        //     return await this.userService.getById(memberId).toPromise();
        // }));
        //
        // this.participantsObj = this.participants.reduce((obj, item) => (obj[item._id] = item, obj) ,{});
    }

    trackByMethod(index:number, item:MessageModel): string {
        return item._id;
    }

    async getSenderInfo(id: string): Promise<UserModel> {
        return await this.usersServices.getById(id).toPromise();
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
