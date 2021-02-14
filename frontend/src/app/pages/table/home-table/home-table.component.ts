import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {Observable, Subscription} from "rxjs";
import {ChatModel, ParticipantWithLiveStatus, UserModel, VideoOptions} from "../../../global/models";
import {filter, switchMap} from "rxjs/operators";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";


@Component({
    selector: 'ami-fullstack-home-table',
    templateUrl: './home-table.component.html',
    styleUrls: [
        '../view-images/view-images.component.scss',
        '../../mobile/chat-call/chat-call.component.scss',
        './home-table.component.scss'
    ],
})
export class HomeTableComponent implements OnInit, OnDestroy {

    private videoCallSub: Subscription;
    private getJoinedUsers: Subscription;
    private newJoinedUser: Subscription;
    private updatedUser: Subscription;
    private leaveUser: Subscription;

    showOnlyParticipants = false;
    private me: UserModel;
    inCallChat: ChatModel;
    inCallChatParties: ParticipantWithLiveStatus[] = [];

    allPosIds: string[] = Array(7).fill('').map((item,index )=>`pos${index}`)

    options: VideoOptions = {isMuted: false, hasCamera: false}

    userIsCurrentlyInChat: boolean = false;
    private allSubs: Subscription;

    currentChatIdFromBrowsing = '';
    showViewImages = true;
    showManageLayout = false;
    showAddPeople = false;

    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private chatsService: ChatsService,
        private userService: UsersService, private socketService: SocketsService) {

        if (this.activeRoute.snapshot['_routerState'].url.includes('edit-tv-layout')) {
            this.showOnlyParticipants = true;
        }
    }

    toggleView(images, layout, addPeople) {
        this.showViewImages = images;
        this.showManageLayout = layout;
        this.showAddPeople = addPeople;
        if(this.showManageLayout) {
            this.showOnlyParticipants = true;
        }
    }

    async ngOnInit() {

        const arr = this.router.url.split('/');

        this.currentChatIdFromBrowsing = arr[arr.length - 1];
        this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((e: NavigationStart) => {
            const arr = e.url.split('/');
            this.currentChatIdFromBrowsing = arr[arr.length - 1];
        })
        this.me = await this.userService.getMe();

        this.subscribeToSocket();


        this.socketService.sendMessage('getUser', {
            member: this.me._id
        });

    }


    private subscribeToSocket() {
        this.allSubs = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`)
            .subscribe(async (msg: { event: string, message: { chatId: string, device: string } }) => {
                const message = await this.setUpUserFromOtherDevice(msg.message);
                if (!message) { return; }

                setTimeout(() => {
                    this.socketService.sendMessage(`videocall/send-users`, {
                        chat: this.inCallChat._id,
                    });
                }, 1000);
            });

        this.newJoinedUser = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/user-joined`)
                })
            ).subscribe((msg: { event: string, message: { member: string, videoOptions: VideoOptions, device: string } }) => {
                console.log(msg.message);
                if (msg.message) this.updateInCallParticipants(msg.message)
            });

        this.updatedUser = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/user-options-updated`)
                })
            ).subscribe((msg: { event: string, message: { member: string, videoOptions: VideoOptions, device: string } }) => {
                console.log(msg.message)
                if (msg.message) this.updateInCallParticipants(msg.message)
            });


        this.leaveUser = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/user-left`)
                })
            ).subscribe((msg: { event: string, message: string }) => {
                console.log(msg.message)
                if (msg.message) this.removeInCallParticipant(msg.message)
            });


        this.getJoinedUsers = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/get-users`)
                })
            ).subscribe((msg: { event: string, message: { live_members: any } }) => {
                console.log('GEtting live users', msg.message)
                if (msg.message) {
                    Object.entries(msg.message.live_members).map<{ member: string, videoOptions: VideoOptions, device: string }>((member: any) => ({
                        member: member[0],
                        ...member[1]
                    })).forEach(msg => {
                        this.updateInCallParticipants(msg)
                    })
                }

            });
    }


    async setUpUserFromOtherDevice(message: { chatId: string, device: string }) {
        if (message) {
            this.userIsCurrentlyInChat = true;
            this.inCallChat = await this.chatsService.getById(message.chatId).toPromise()

            this.inCallChatParties = await Promise.all<ParticipantWithLiveStatus>(this.inCallChat.participants.map(async (memberId) => {
                const u = await this.userService.getById(memberId).toPromise()
                return {
                    user: u,
                    isInCall: false,
                    videoOptions: {isMuted: false, hasCamera: false},
                    device: ''
                }
            }));
        } else {
            this.userIsCurrentlyInChat = false;
        }
        return message
    }

    private updateInCallParticipants(message: { member: string; videoOptions: VideoOptions, device: string }) {

        if (this.me._id === message.member) {
            this.options = message.videoOptions
        }

        const l = this.inCallChatParties.find(member => member.user._id === message.member)
        l.isInCall = true
        l.videoOptions = message.videoOptions;
        l.device = message.device

        this.inCallChatParties = [
            ...this.inCallChatParties.filter(member => member.user._id !== message.member),
            l
        ]
    }

    private removeInCallParticipant(message: string) {


        console.log('TO LEAVE', message, this.me._id === message)
        if (this.me._id === message) {
            this.hangUpCall()
            return
        }

        const l = this.inCallChatParties.find(member => member.user._id === message)
        l.isInCall = false;

        this.inCallChatParties = [
            ...this.inCallChatParties.filter(member => member.user._id !== message),
            l
        ]
    }

    toggleCamera() {
        this.options.hasCamera = !this.options.hasCamera
        this.socketService.sendMessage(`videocall/update`, {
            chat: this.inCallChat._id,
            member: this.me._id,
            videoOptions: this.options
        })
    }

    toggleMic() {
        this.options.isMuted = !this.options.isMuted
        this.socketService.sendMessage(`videocall/update`, {
            chat: this.inCallChat._id,
            member: this.me._id,
            videoOptions: this.options
        })
    }

    hangUpCall() {

        this.newJoinedUser.unsubscribe()
        this.leaveUser.unsubscribe()
        this.updatedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.allSubs.unsubscribe()


        this.socketService.sendMessage(`videocall/leave`, {
            chat: this.inCallChat._id,
            member: this.me._id
        })


        this.userIsCurrentlyInChat = false;
        this.inCallChat = undefined;
        this.inCallChatParties = [];

        this.subscribeToSocket()
    }


    ngOnDestroy() {
        this.newJoinedUser.unsubscribe()
        this.leaveUser.unsubscribe()
        this.updatedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.allSubs.unsubscribe()
    }

    async callSelected(chatId) {
        // console.log(this.currentChatIdFromBrowsing);
        this.userIsCurrentlyInChat = true;

        this.subscribeToSocket()

        this.inCallChat = await this.chatsService.getById(chatId).toPromise()
        this.socketService.sendMessage(`videocall/join`, {
            chat: chatId,
            member: this.me._id,
            videoOptions: this.options,
            device: 'TV'
        })


        this.socketService.sendMessage('getUser', {
            member: this.me._id
        })
    }

    drop(event: CdkDragDrop<ParticipantWithLiveStatus[], any>) {
        // if (event.previousContainer === event.container) {
        //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        // } else {
        //     transferArrayItem(event.previousContainer.data,
        //         event.container.data,
        //         event.previousIndex,
        //         event.currentIndex);
        // }
    }

    closeTVLayout($event: any) {
        this.toggleView(true,false,false);
        this.showOnlyParticipants = false;
    }
}
