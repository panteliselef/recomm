import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ChatModel, UserModel} from "../../../global/models";
import {ActivatedRoute} from "@angular/router";
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";

@Component({
    selector: 'ami-fullstack-chat-call',
    templateUrl: './chat-call.component.html',
    styleUrls: [
        './chat-call.component.scss',
        '../../../components/app-chat-bar/app-chat-bar.component.scss',
    ]
})
export class ChatCallComponent implements OnInit, OnDestroy {

    @Output() callHangUp = new EventEmitter<any>();
    @Input('options') options: {isMuted: boolean, hasCamera: boolean} ;

    private participant: UserModel;
    private participants: UserModel[];
    private participantsObj: any;
    private me: UserModel;
    chatName: string;
    chatPhoto: string;
    private videoCallSub: Subscription;
    private getJoinedUsers: Subscription;
    private newJoinedUser: Subscription;
    private leaveUser: Subscription;

    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private socketService: SocketsService,
                private http: HttpClient
    ) {


    }

    showVideoSetting: boolean = false;

    @ViewChild('settingsModal', {static: false}) settingsModal: ElementRef;
    @Input('chat') chat: ChatModel;


    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise()

        this.me = await this.userService.getMe();


        // this.socketService.syncAllMessages().subscribe((msg)=> console.log(msg))

        setTimeout(() => {
            this.socketService.sendMessage(`videocall/join`, {
                chat: this.chat._id,
                member: this.me._id,
                videoOptions: this.options
            })
        }, 1000)


        // const l = await this.http.post(`${environment.host}/api/chats/${chatId}/videocall`, {user_id:this.me._id}).toPromise();
        // console.log(l)


        // In case of error connection hang up the call
        this.videoCallSub = this.socketService.syncMessages('connection_error')
            .subscribe(() => {
                this.hangUpCall()
            })

        this.newJoinedUser = this.socketService
            .syncMessages(`${chatId}/videocall/user-joined`)
            .subscribe((msg) => {
                console.log(msg.message)
            });

        this.leaveUser = this.socketService
            .syncMessages(`${chatId}/videocall/user-left`)
            .subscribe((msg) => {
                console.log(msg.message)
            });


        this.getJoinedUsers = this.socketService
            .syncMessages(`${chatId}/videocall/get-users`)
            .subscribe((msg) => {
                console.log(msg.message)
            });


        this.participants = await Promise.all<UserModel>(this.chat.participants.map(async (memberId): Promise<UserModel> => {
            return await this.userService.getById(memberId).toPromise();
        }));

        this.participantsObj = this.participants.reduce((obj, item) => (obj[item._id] = item, obj), {});


        this.participant = this.participants.filter(member => member._id !== this.me._id)[0]

        this.chatName = this.chat.displayName || this.participant.getFullName()
        this.chatPhoto = this.chat.photoUrl || this.participant.getPhoto()

    }

    async ngOnInit() {
        const chatId = this.route.snapshot.params.id;
        await this.fetchChatData(chatId);

    }

    toggleVideoSetting() {
        this.showVideoSetting = !this.showVideoSetting;
    }

    hangUpCall() {

        this.socketService.sendMessage(`videocall/leave`, {
            chat: this.chat._id,
            member: this.me._id
        })

        this.callHangUp.emit();
    }

    ngOnDestroy() {
        this.videoCallSub.unsubscribe()
        this.newJoinedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.leaveUser.unsubscribe()
    }
}
