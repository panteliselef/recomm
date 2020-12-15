import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ChatsService, SocketsService, UsersService} from "../../../global/services";
import {
    ChatModel,
    ParticipantWithPosNumber,
    UserModel,
    VideoOptions
} from "../../../global/models";
import {switchMap} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";

@Component({
    selector: 'ami-fullstack-smart-tv-during-call',
    templateUrl: './smart-tv-during-call.component.html',
    styleUrls: [
        './smart-tv-during-call.component.scss',
        '../../mobile/chat-call/chat-call.component.scss'
    ]
})
export class SmartTvDuringCallComponent implements OnInit, OnDestroy {
    private readonly chatId: string;
    private chat: ChatModel;
    showErrorMessage: boolean = false;
    errorMessage: string = '';
    private allSubs: Subscription;
    private me: UserModel;
    private newJoinedUser: Subscription;
    private updatedUser: Subscription;
    private getJoinedUsers: Subscription;
    private leaveUser: Subscription;

    userMapLayoutBig: Array<ParticipantWithPosNumber> = Array(2).fill({user: undefined});
    userMapLayoutSmall: Array<ParticipantWithPosNumber> = Array(5).fill({user: undefined});

    everyMember: Array<ParticipantWithPosNumber> = [];
    private options: VideoOptions;

    constructor(private usersService: UsersService, private route: ActivatedRoute, private chatsService: ChatsService, private socketService: SocketsService, private router: Router) {
        this.chatId = this.route.snapshot.params.id;
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe()
        try {
            this.chat = await this.chatsService.getById(this.chatId).toPromise()
            console.log(this.chat)
            this.subscribeToSocket()
            this.socketService.sendMessage('getUser', {
                member: this.me._id
            })
        } catch (err) {
            this.setErrorMessage('Cannot find chat')
            console.log(`chat with chatId: ${this.chatId} not exists`)
        }

    }


    private subscribeToSocket() {
        this.allSubs = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`)
            .subscribe(async (msg: { event: string, message: { chatId: string, device: string } }) => {

                console.log('Start',msg.message)

                // const message = await this.setUpUserFromOtherDevice(msg.message);
                // if (!message) return;

                setTimeout(() => {
                    this.socketService.sendMessage(`videocall/send-users`, {
                        chat: this.chat._id,
                    })
                }, 1000)
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
                if (msg.message) this.handleJoinedUser(msg.message)
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
                // if (msg.message) this.updateInCallParticipants(msg.message)
            });


        this.updatedUser = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/user-position-updated`)
                })
            ).subscribe((msg: { event: string, message: { member: string, position: [number,number]}}) => {
                console.log("NEW POS",msg.message)
                if (msg.message) this.handleNewPosition(msg.message)
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
                if (msg.message) this.handleLeave(msg.message)
            });


        this.getJoinedUsers = this.socketService
            .syncMessages(`${this.me._id}/videocall/user-in-chat`).pipe(
                switchMap((msg: { event: string, message: { chatId: string, device: string } }) => {
                    if (!msg.message) return new Observable(observer => {
                        observer.next('');
                    });
                    return this.socketService.syncMessages(`${msg.message.chatId}/videocall/get-users`)
                })
            ).subscribe(async  (msg: { event: string, message: { live_members: any } }) => {
                console.log('GEtting live users', msg.message)
                if (msg.message) {
                    const everyone: any = Object.entries(msg.message.live_members).map<{ member: string, videoOptions: VideoOptions, device: string }>((member: any) => ({
                        member: member[0],
                        ...member[1]
                    }))

                    this.everyMember = await Promise.all<ParticipantWithPosNumber>(everyone.map(async (member,i) => {
                        const u = await this.usersService.getById(member.member).toPromise()
                        return {
                            user: u,
                            pos: [-1,-1],
                            videoOptions: {isMuted: false, hasCamera: false},
                            device: ''
                        }
                    }))

                    this.populateBigLayout(this.everyMember)
                    this.populateSmallLayout(this.everyMember)
                    // this.userMapLayoutSmall = everyone.slice(2,7)



                    // if(i < 2) {
                    //     this.userMapLayoutBig[i] = {
                    //         user: u,
                    //         isInCall: false,
                    //         videoOptions: {isMuted: false, hasCamera: false},
                    //         device: ''
                    //     }
                    // }else {
                    //     this.userMapLayoutSmall[i-2] = {
                    //         user: u,
                    //         isInCall: false,
                    //         videoOptions: {isMuted: false, hasCamera: false},
                    //         device: ''
                    //     }
                    // }

                    console.log(everyone)
                }

            });
    }

    private populateBigLayout(arr: ParticipantWithPosNumber[]) {
        for (let i = 0; i < Math.min(2,arr.length); i++) {
            arr[i].pos = [0,i];
            this.userMapLayoutBig[i] = arr[i]
        }
        // if(arr.length < 2) {
        //     for (let i = arr.length; i < 7; i++) {
        //         this.userMapLayoutBig[i] = {device: "", isInCall: false, videoOptions: undefined, user:undefined}
        //     }
        // }
    }

    private populateSmallLayout(arr) {
        for (let i = 2; i < arr.length; i++) {
            arr[i].pos = [1,i-2];
            this.userMapLayoutSmall[i-2] = arr[i]
        }
        if(arr.length-2 < 5) {
            for (let i = arr.length; i < 7; i++) {
                this.userMapLayoutSmall[i-2] = {device: "", videoOptions: undefined, user:undefined, pos:[1,-1]}
            }
        }
    }

    private getEmptyCell(): ParticipantWithPosNumber {
        return  {device: "", videoOptions: undefined, user:undefined, pos:[1,-1]}
    }

    // private removeInCallParticipant(message: string) {
    //
    //
    //     console.log('TO LEAVE', message, this.me._id === message)
    //     if (this.me._id === message) {
    //         this.hangUpCall()
    //         return
    //     }
    //
    //     const l = this.inCallChatParties.find(member => member.user._id === message)
    //     l.isInCall = false;
    //
    //     this.inCallChatParties = [
    //         ...this.inCallChatParties.filter(member => member.user._id !== message),
    //         l
    //     ]
    // }

    hangUpCall() {

        this.newJoinedUser.unsubscribe()
        this.leaveUser.unsubscribe()
        this.updatedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.allSubs.unsubscribe()


        this.socketService.sendMessage(`videocall/leave`, {
            chat: this.chat._id,
            member: this.me._id
        })

        this.setErrorMessage('You left the call')


        setTimeout(()=> {

            this.router.navigate(['/tv'])
        },2000)


    }


    private setErrorMessage(msg: string) {
        this.showErrorMessage = true;
        this.errorMessage = msg;
    }

    ngOnDestroy() {
        this.newJoinedUser.unsubscribe()
        this.leaveUser.unsubscribe()
        this.updatedUser.unsubscribe()
        this.getJoinedUsers.unsubscribe()
        this.allSubs.unsubscribe()
    }

    // private updateInCallParticipants(message: { member: string; videoOptions: VideoOptions, device: string }) {
    //
    //     if (this.me._id === message.member) {
    //         this.options = message.videoOptions
    //     }
    //
    //     const l = this.inCallChatParties.find(member => member.user._id === message.member)
    //     l.isInCall = true
    //     l.videoOptions = message.videoOptions;
    //     l.device = message.device
    //
    //     this.inCallChatParties = [
    //         ...this.inCallChatParties.filter(member => member.user._id !== message.member),
    //         l
    //     ]
    // }

    // async setUpUserFromOtherDevice(message: { chatId: string, device: string }) {
    //     if (message) {
    //
    //         this.inCallChatParties = await Promise.all<ParticipantWithLiveStatus>(this.chat.participants.map(async (memberId) => {
    //             const u = await this.usersService.getById(memberId).toPromise()
    //             return {
    //                 user: u,
    //                 isInCall: false,
    //                 videoOptions: {isMuted: false, hasCamera: false},
    //                 device: ''
    //             }
    //         }));
    //     } else {
    //         this.userIsCurrentlyInChat = false;
    //     }
    //     return message
    // }
    private async handleJoinedUser(message: { member: string; videoOptions: VideoOptions; device: string }) {
        const user = await this.usersService.getById(message.member).toPromise()


        let pos;

        const l: ParticipantWithPosNumber = {
            user,
            videoOptions: message.videoOptions,
            device: message.device,
            pos: [-1,-1]
        }
        this.everyMember.push(l)


        console.log('length',this.everyMember.length)
        if(this.everyMember.length-1 > 7) {
          console.log('No room for you')
        } else if(this.everyMember.length-1 >= 2) {
            console.log(this.userMapLayoutSmall)
            console.log('your small pos is', this.userMapLayoutSmall.findIndex(member => typeof member.user === 'undefined' ))
            pos = this.userMapLayoutSmall.findIndex(member => typeof member.user === 'undefined' )

            this.userMapLayoutSmall[pos] = l
            l.pos = [1,pos]

        }else {
            console.log('your big pos is', this.userMapLayoutBig.findIndex(member => typeof member.user === 'undefined' ))

            pos = this.userMapLayoutBig.findIndex(member => typeof member.user === 'undefined' )

            this.userMapLayoutBig[pos] = l
            l.pos = [0,pos]
        }
        console.log('User joined', message)
    }

    private async handleNewPosition(message: { member: string; position: [number, number] }) {

        function updatePos(member: ParticipantWithPosNumber) {
            member.pos = message.position
            if(member.pos[0] == 0) {
                this.userMapLayoutBig[member.pos[1]] = member;
            }else {
                this.userMapLayoutSmall[member.pos[1]] = member;
            }
        }

        const u = this.everyMember.find(member=>member.user._id === message.member)


        const prevPos = u.pos;
        console.log('Pos',prevPos,message.position)
        if(prevPos[0] == 0) {
            this.userMapLayoutBig[prevPos[1]] = this.getEmptyCell()
        }else {
            this.userMapLayoutSmall[prevPos[1]] = this.getEmptyCell()
        }

        updatePos.apply(this,[u])
    }

    private handleLeave(message: string) {

        console.log('TO LEAVE', message, this.me._id === message)
        if (this.me._id === message) {
            this.hangUpCall()
            return
        }

        console.log()
        const i = this.everyMember.findIndex(member=> member.user._id === message)
        const leaver = this.everyMember[i];

        if(leaver.pos[0] == 0) {
            const l = this.userMapLayoutBig.find(member=> member.user._id === message)
            l.user = undefined;
            l.pos = [-1,-1];
            l.device = undefined;
            l.videoOptions = undefined;
        }
        else if(leaver.pos[0] == 1) {
            const l = this.userMapLayoutSmall.find(member=> member.user._id === message)
            l.user = undefined;
            l.pos = [-1,-1];
            l.device = undefined;
            l.videoOptions = undefined;
        }

        this.everyMember.splice(i, 1);

    }
}
