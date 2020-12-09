import {Component, OnInit} from '@angular/core';
import {ChatsService} from "../../../global/services/chats/chats.service";
import {UsersService} from "../../../global/services/users/users.service";
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from "../../../global/models";
import {Router} from "@angular/router";

@Component({
    selector: 'ami-fullstack-chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit {

    message = {
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
        senderName: 'Emma Bailey',
        message: 'Hello, how are you ?',
        day: 'Tue',
    }
    messages: Object[];
    me: UserModel;
    chats: ChatModel[];
    showLoader: boolean = true;

    constructor(private chatsService: ChatsService, private usersService: UsersService, private router: Router) {
    }

    async ngOnInit() {

        this.messages = Array(20).fill(this.message);
        await this.fetchData();
        console.log(this.chats)

    }


    private async fetchData() {
        this.showLoader = true;
        this.me = await this.usersService.getMe();

        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

        this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {

            let member: UserModel;
            if (chat.participants.length === 2) {
                console.log(chat.participants)
                const partId = chat.participants.filter(id => id !== this.me._id)[0];
                member = await this.usersService.getById(partId).toPromise();

            }
            if (!chat.messages.length) // TODO: handle converstations without messages
                return new ChatModel({
                    ...chat,
                    more: {lastMsg: {value: 'Start talking', timestamp: Date.now()}},
                    displayName: member.getFullName(),
                    photoUrl: member.getPhoto()
                })
            else {

                const s = await this.chatsService.getMessages(chat._id).toPromise();

                const lastMsg:MessageWithRepliesModel = s[s.length - 1].messages[s[s.length - 1].messages.length - 1];
                console.log(lastMsg);

                if(lastMsg.type === MessageType.FILE) {
                    lastMsg.value = 'Sent a File'
                }else if(lastMsg.type === MessageType.IMAGE_GIF) {
                    lastMsg.value = 'Sent a Gif'
                }else if(lastMsg.type === MessageType.IMAGE_STATIC) {
                    lastMsg.value = 'Send a Image'
                }


                if(lastMsg.senderId === this.me._id){
                    lastMsg.value = `You: ${lastMsg.value}`
                }


                return new ChatModel({
                    ...chat,
                    more: {lastMsg},
                    displayName: member.getFullName(),
                    photoUrl: member.getPhoto()
                })
            }
        })).then(chats => {
            console.log(chats);
            chats.sort((a, b) => (new Date(a.more.lastMsg.timestamp).getTime() < new Date(b.more.lastMsg.timestamp).getTime()) ? 1 : -1);
            return chats;
        })

        this.showLoader = false;


        // console.log(this.chats)

    }

    async goToProfile() {
        await this.router.navigate(['/mobile', 'profile']);
    }

    async goToNewChat() {
        await this.router.navigate(['/mobile', 'new-chat']);
    }
}
