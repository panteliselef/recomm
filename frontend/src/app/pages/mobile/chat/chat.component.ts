import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ParticipantModel} from "../../../global/models/participants/participant.model";
import {ChatsService} from "../../../global/services/chats/chats.service";
import {UsersService} from "../../../global/services/users/users.service";
import {ChatModel, MessageModel, MessageType, UserModel} from "../../../global/models";

@Component({
    selector: 'ami-fullstack-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None // i need this, for styling in linkify to work
})


export class ChatComponent implements OnInit, AfterViewInit, AfterViewChecked {

    @ViewChild('message', {static: false}) textarea: ElementRef;
    @ViewChild('scroll', {static:false, read: ElementRef }) public scroll: ElementRef<any>;
    chatId: Number;
    participant: UserModel;

    isAudioRecordOpen = false;
    private URLRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");


    icons = [
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

    // users = {
    //     '2': {
    //         name: 'Emma Mailey',
    //         photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
    //     },
    //     '3': {
    //         name: 'Pantelis Eleftheriadis',
    //         photoURL: 'https://instagram.fath3-3.fna.fbcdn.net/v/t51.2885-19/s320x320/77156724_2493626787562045_5174981635111649280_n.jpg?_nc_ht=instagram.fath3-3.fna.fbcdn.net&_nc_ohc=VUj-Kd-Z9qwAX-TVYNb&oh=25a92e09d3744602d0f19658a6da542d&oe=5FCECC40'
    //     }
    // }


    // dayOneMessages: { user_id: string, timestamp: string, msgs: string[] }[] = [
    //     {
    //         user_id: '2',
    //         timestamp: '16:04',
    //         msgs: [
    //             'Where the next  workshop will take \n place ?'
    //         ]
    //     }, {
    //         user_id: '3',
    //         timestamp: '16:05',
    //         msgs: [
    //             'We don’t know yet. I’ll keep u posted ☺️'
    //         ]
    //     }
    // ]


    // yestMessages: { user_id: string, timestamp: string, msgs: Object[] }[] = [
    //     {
    //         user_id: '3',
    //         timestamp: '10:15',
    //         msgs: [
    //             {
    //                 type: 'text',
    //                 text: 'Hey Emma, the next workshop will be held in the conference room of hotel XXX.'
    //             }, {
    //                 type: 'text',
    //                 text:'See ya there at 19.00'
    //             }
    //         ]
    //     }, {
    //         user_id: '3',
    //         timestamp: '23:45',
    //         msgs: [
    //             {
    //                 type: 'text',
    //                 text: 'Here’ re the photos you asked ...'
    //             }, {
    //                 type: 'image',
    //                 assetPath: 'https://images.unsplash.com/photo-1604755940817-3a1ca36e13c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
    //             }, {
    //                 type: 'image',
    //                 assetPath: 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
    //             },{
    //                 type: 'text',
    //                 text: 'What about this ? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match'
    //             },{
    //                 type: 'text',
    //                 text: 'Some inspiration https://dribbble.com/shots/11859371-Time-Clock-Scheduling-App'
    //             }
    //
    //
    //         ]
    //     }
    // ]


    participants: UserModel[];
    participantsObj: Object;
    chat: ChatModel;
    me: UserModel;
    chatName: string;
    messages: MessageModel[];


    constructor(private route: ActivatedRoute, private chatService: ChatsService, private userService: UsersService) {
        const chatId = this.route.snapshot.params.id;
        this.fetchChatData(chatId);
    }

    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise()

        const reducer = async (accumulator, currentValue: UserModel) => {
            accumulator[currentValue._id] = currentValue;
        }

        this.participants = await Promise.all<UserModel>(this.chat.participants.map( async (memberId) => {
            return await this.userService.getById(memberId).toPromise();
        }));

        this.participantsObj = this.participants.reduce((obj, item) => (obj[item._id] = item, obj) ,{});

        this.me = await this.userService.getMe();

        this.participant = this.participants.filter(member => member._id !== this.me._id)[0]

        this.chatName =  this.chat.displayName || this.participant.getFullName()

        this.messages = this.chat.messages;

        console.log(this.messages)
    }

    resize() {
        this.textarea.nativeElement.style.height = '22px';
        this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
    }

    getUserById = (id: Number): ParticipantModel => {
        const p = new ParticipantModel();
        p._id = id;
        p.firstName = "Emma";
        p.lastName = "Bailey";
        p.photoURL = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
        return p;
    }

    ngOnInit() {
        // this.chatId = +this.route.snapshot.params.id;
        // this.participant = this.getUserById(this.chatId);
    }

    ngAfterViewInit() {
        this.scrollBottom()
    }
    ngAfterViewChecked() {
        // this.scrollBottom()
    }

    scrollBottom() {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight - 200;
        console.log(this.scroll.nativeElement.scrollHeight)
    }


    parseUrl(textMsg: string) {


        const matches = textMsg.match(this.URLRegex);
        if(!matches) return textMsg;
        console.log(matches.input)

        return textMsg.replace(this.URLRegex, 'Link')
        // matches[]
        // this.URLRegex.match(textMsg);


    }

}
