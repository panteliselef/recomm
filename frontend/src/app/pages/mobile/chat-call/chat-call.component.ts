import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ChatModel, UserModel} from "../../../global/models";
import {ActivatedRoute} from "@angular/router";
import {ChatsService, UsersService} from "../../../global/services";

@Component({
    selector: 'ami-fullstack-chat-call',
    templateUrl: './chat-call.component.html',
    styleUrls: [
        './chat-call.component.scss',
        '../../../components/app-chat-bar/app-chat-bar.component.scss',
    ]
})
export class ChatCallComponent implements OnInit {

    @Output() callHangUp = new EventEmitter<any>();

    private participant: UserModel;
    private participants: UserModel[];
    private participantsObj: any;
    private me: UserModel;
    chatName: string;
    chatPhoto: string;

    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,) {
        const chatId = this.route.snapshot.params.id;
        this.fetchChatData(chatId);
    }

    showVideoSetting: boolean = false;

    @ViewChild('settingsModal', {static: false}) settingsModal: ElementRef;
    @Input('chat') chat: ChatModel;


    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise()

        this.participants = await Promise.all<UserModel>(this.chat.participants.map(async (memberId) => {
            return await this.userService.getById(memberId).toPromise();
        }));

        this.participantsObj = this.participants.reduce((obj, item) => (obj[item._id] = item, obj), {});

        this.me = await this.userService.getMe();

        this.participant = this.participants.filter(member => member._id !== this.me._id)[0]

        this.chatName = this.chat.displayName || this.participant.getFullName()
        this.chatPhoto = this.chat.photoUrl || this.participant.getPhoto()

    }
    ngOnInit() {}

    toggleVideoSetting() {
        this.showVideoSetting = !this.showVideoSetting;
    }

    hangUpCall() {
        this.callHangUp.emit();
    }
}
