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

    icons= [
        // {
        //     name: 'call',
        //     onClick: () => {
        //     }
        // },
        // {
        //     name: 'person_add',
        //     onClick: () => {
        //     }
        // },
        {
            name: 'more_vert',
            onClick: () => {
            }
        }
    ];

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


    ngOnInit() {}

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

        console.log(this.chat.displayName)

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
}
