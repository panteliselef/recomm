import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {Subscription} from "rxjs";
import {ChatModel, UserModel} from "../../../global/models";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'ami-fullstack-smart-tv',
    templateUrl: './smart-tv.component.html',
    styleUrls: ['./smart-tv.component.scss']
})
export class SmartTvComponent implements OnInit, OnDestroy {
    private me: UserModel;
    private onTVCallSub: Subscription;

    simpleChats: UserModel[];
    groupChats: ChatModel[];

    constructor(private socketsService: SocketsService,
                private usersService: UsersService,
                private chatsService: ChatsService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe();
        this.onTVCallSub = this.socketsService
            .syncMessages(`${this.me._id}/on-tv-call`)
            .subscribe(async (msg: { event: string, message: { chatId: string, device: string } }) => {
                await this.router.navigate(['call', msg.message.chatId], {relativeTo: this.route });
            });



        this.simpleChats = await Promise.all(this.me.contacts.map(async contact=> {
           return await this.usersService.getById(contact.contact_id).toPromise()
        }))

        console.log(this.simpleChats)

        const l =  await Promise.all(this.me.chat_ids.map(async chatId => {
            return await this.chatsService.getById(chatId).toPromise();
        }));

        this.groupChats = l.filter((chat: ChatModel)=> {
            return chat.participants.length > 2;
        })
        console.log(this.groupChats)
    }


    ngOnDestroy() {

        this.onTVCallSub.unsubscribe();
    }

}
