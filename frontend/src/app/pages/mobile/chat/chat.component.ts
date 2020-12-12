import {
    AfterViewChecked,
    Component,
    ElementRef, OnDestroy,
    OnInit, Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatsService, UsersService, SocketsService} from '../../../global/services';
import {ChatModel, MessageModel, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {Subscription} from 'rxjs';

@Component({
    selector: 'ami-fullstack-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None // i need this, for styling in linkify to work
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('scroll', {static: false, read: ElementRef}) public scroll: ElementRef<any>;

    participant: UserModel;

    readonly url: string = 'http://localhost:8080/api/files/download/';


    showCallPage: boolean = false;
    showPrepCall: boolean = false;

    videoCallOptions: {isMuted: boolean, hasCamera: boolean} = {isMuted:false,hasCamera:false}

    // private URLRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");


    icons = [
        {
            name: 'call',
            onClick: this.goToChatPrepCallPage.bind(this)
        },
        {
            name: 'person_add',
            onClick: () => {
            }
        },
        {
            name: 'more_vert',
            onClick: () => {
                this.router.navigate(['edit'], {relativeTo: this.route});
            }
        }
    ];

    participants: UserModel[];
    participantsObj: Object;
    chat: ChatModel;
    me: UserModel;
    chatName: string;
    messages: Array<{
        _id: string,
        messages: MessageWithRepliesModel[]
    }>;

    selectedMsgForAction: MessageWithRepliesModel;
    showMenu: boolean;

    chatSubscription: Subscription;


    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private socketService: SocketsService,
                private router: Router) {
        const chatId = this.route.snapshot.params.id;
        this.fetchChatData(chatId);
    }


    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise();


        this.chatSubscription = this.socketService
            .syncMessages(`/${this.chat._id}/newMessage`)
            .subscribe((msg) => {
                this.onReceiveMessage(msg.message);
            });

        this.participants = await Promise.all<UserModel>(this.chat.participants.map(async (memberId) => {
            return await this.userService.getById(memberId).toPromise();
        }));

        this.participantsObj = this.participants.reduce((obj, item) => (obj[item._id] = item, obj), {});

        this.me = await this.userService.getMe();

        this.participant = this.participants.filter(member => member._id !== this.me._id)[0];

        this.chatName = this.chat.displayName || this.participant.getFullName();

        this.messages = await this.chatService.getMessages(chatId).toPromise();
    }

    trackByMethod(index: number, item: MessageModel): string {
        return item._id;
    }

    private onReceiveMessage(message: MessageWithRepliesModel) {

        if (this.messages.length === 0) {
            this.messages.push({
                _id: Date.now().toString(),
                messages: [
                    message
                ]
            });
        } else {

            this.messages[this.messages.length - 1].messages = [
                ...this.messages[this.messages.length - 1].messages,
                message
            ];

        }
    }

    ngOnInit() {
    }


    ngAfterViewChecked(): void {
        if (this.showMenu) {
            return;
        }
        this.scrollBottom();
    }

    scrollBottom() {
        if (this.scroll) {
            this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight - 200;
        }
    }

    showActionsMenu(msg: MessageWithRepliesModel) {
        if (this.showMenu) {
            this.closeMenu();
        }
        this.selectedMsgForAction = msg;
        this.showMenu = true;
    }

    closeMenu() {
        this.selectedMsgForAction = undefined;
        this.showMenu = false;
    }

    async redirectToReply() {
        await this.router.navigate(['reply/' + this.selectedMsgForAction._id], {relativeTo: this.route});
    }

    downloadFileToDevice() {
        const file: { filename: string } = this.selectedMsgForAction.value;
        window.location.href = `${this.url}${file.filename}`;
    }

    ngOnDestroy() {
        this.chatSubscription.unsubscribe();
    }

    goToChatCallPage() {
        this.showCallPage = true;
        this.showPrepCall = false;
    }

    goToChatPrepCallPage() {
        this.showPrepCall = true;
        this.showCallPage = false;
    }

    showChat() {
        this.showCallPage = this.showPrepCall = false;
    }

    handleVideoCallSetting(options: { isMicEnabled: boolean; isCameraEnabled: boolean }) {
        console.log(options)
    }
}
