import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ChatModel, UserModel, VideoOptions} from "../../../global/models";
import {ActivatedRoute} from "@angular/router";
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {Subscription} from "rxjs";

// interface VCRTMessage {
//     // chat: string,
//     // member: string,
//     // videoOptions: {isMuted: boolean, hasCamera: boolean}
//     live_members: { memberId: string, videoOptions: { isMuted: boolean, hasCamera: boolean } }[]
// }



interface UserWithVideoSettings {
    user: UserModel,
    videoOptions: VideoOptions,
    isVideoReady: boolean
}

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
    @Input('options') options: VideoOptions;

    private participant: UserModel;
    private participants: UserModel[];
    private participantsObj: any;
    private me: UserModel;
    chatName: string;
    chatPhoto: string;
    private videoCallSub: Subscription;
    private getJoinedUsers: Subscription;
    private newJoinedUser: Subscription;
    private updatedUser: Subscription;
    private leaveUser: Subscription;


    inCallParticipants: UserWithVideoSettings[] = [];

    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private socketService: SocketsService
    ) {


    }

    showVideoSetting: boolean = false;

    @ViewChild('settingsModal', {static: false}) settingsModal: ElementRef;
    @Input('chat') chat: ChatModel;


    setVideoReady(obj: UserWithVideoSettings) {
        return setTimeout(() => {
            obj.isVideoReady = true
        }, 2000)
    }

    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise()

        this.me = await this.userService.getMe();


        const meAsParticipant: UserWithVideoSettings = {
            user: this.me,
            videoOptions: this.options,
            isVideoReady: false
        }
        this.inCallParticipants = [meAsParticipant]
        this.setVideoReady(meAsParticipant)
        setTimeout(() => {
            this.socketService.sendMessage(`videocall/join`, {
                chat: this.chat._id,
                member: this.me._id,
                videoOptions: this.options,
                device: 'MOBILE'
            })
        }, 1000)


        // In case of error connection hang up the call
        this.videoCallSub = this.socketService.syncMessages('connection_error')
            .subscribe(() => {
                this.hangUpCall()
            })

        this.updatedUser = this.socketService
            .syncMessages(`${chatId}/videocall/user-options-updated`)
            .subscribe((msg: { event: string, message: { member: string, videoOptions: VideoOptions } }) => {
                this.onUserUpdated(msg.message)
            });

        this.newJoinedUser = this.socketService
            .syncMessages(`${chatId}/videocall/user-joined`)
            .subscribe((msg: { event: string, message: { member: string, videoOptions: VideoOptions } }) => {
                this.onUserJoined(msg.message)
            });

        this.leaveUser = this.socketService
            .syncMessages(`${chatId}/videocall/user-left`)
            .subscribe((msg) => {
                this.onUserLeft(msg.message)
            });


        this.getJoinedUsers = this.socketService
            .syncMessages(`${chatId}/videocall/get-users`)
            .subscribe((msg) => {
                this.onGetCallUsers(msg.message[this.chat._id])
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

    toggleCamera() {
        this.options.hasCamera = !this.options.hasCamera
        this.socketService.sendMessage(`videocall/update`, {
            chat: this.chat._id,
            member: this.me._id,
            videoOptions: this.options
        })
    }

    toggleMic() {
        this.options.isMuted = !this.options.isMuted
        this.socketService.sendMessage(`videocall/update`, {
            chat: this.chat._id,
            member: this.me._id,
            videoOptions: this.options
        })
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
        this.updatedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.leaveUser.unsubscribe()
    }

    private onUserJoined(msg: { member: string, videoOptions: VideoOptions }) {
        const l = this.participants.find(party => party._id === msg.member)
        const o = {
            user: l,
            videoOptions: msg.videoOptions,
            isVideoReady: false
        }

        this.inCallParticipants = [
            ...this.inCallParticipants,
            o
        ]
        this.setVideoReady(o)
    }

    private onUserUpdated(msg: { member: string; videoOptions: VideoOptions }) {
        const o: UserWithVideoSettings = this.inCallParticipants.find(party => party.user._id === msg.member)
        o.videoOptions = msg.videoOptions
    }

    private onUserLeft(msg: string) {
        this.inCallParticipants = this.inCallParticipants.filter(party => party.user._id !== msg)
    }

    private onGetCallUsers(msg: {live_members:any}) {

        const members = Object.entries(msg.live_members).filter(user => user[0] !== this.me._id).map((user:[string, any]): UserWithVideoSettings => {
            const [k, v] = user
            return {
                user: this.participants.find(participant => participant._id === k),
                videoOptions: {...v.videoOptions},
                isVideoReady: false
            }
        })

        members.forEach(member => {
            this.setVideoReady(member)
        })
        this.inCallParticipants = [
            ...this.inCallParticipants,
            ...members
        ]
    }


}
