import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'ami-fullstack-chat-reply',
    templateUrl: './chat-reply.component.html',
    styleUrls: ['./chat-reply.component.scss','../chat/chat.component.scss'],
    encapsulation: ViewEncapsulation.None // i need this, for styling in linkify to work
})
export class ChatReplyComponent implements OnInit {

    reply_id: number;
    users = {
        '2': {
            name: 'Emma Mailey',
            photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
        },
        '3': {
            name: 'Pantelis Eleftheriadis',
            photoURL: 'https://instagram.fath3-3.fna.fbcdn.net/v/t51.2885-19/s320x320/77156724_2493626787562045_5174981635111649280_n.jpg?_nc_ht=instagram.fath3-3.fna.fbcdn.net&_nc_ohc=VUj-Kd-Z9qwAX-TVYNb&oh=25a92e09d3744602d0f19658a6da542d&oe=5FCECC40'
        }
    }

    icons= [
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

    yestMessages: { user_id: string, timestamp: string, msgs: Object[] }[] = [
        {
            user_id: '3',
            timestamp: '10:15',
            msgs: [
                {
                    type: 'text',
                    text: 'Hey Emma, the next workshop will be held in the conference room of hotel XXX.'
                }, {
                    type: 'text',
                    text:'See ya there at 19.00'
                }
            ]
        }, {
            user_id: '3',
            timestamp: '23:45',
            msgs: [
                {
                    type: 'text',
                    text: 'Here’ re the photos you asked ...'
                }, {
                    type: 'image',
                    assetPath: 'https://images.unsplash.com/photo-1604755940817-3a1ca36e13c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
                }, {
                    type: 'image',
                    assetPath: 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
                },{
                    type: 'text',
                    text: 'What about this ? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match'
                },{
                    type: 'text',
                    text: 'Some inspiration https://dribbble.com/shots/11859371-Time-Clock-Scheduling-App'
                }


            ]
        }
    ]

    constructor(private activeRoute: ActivatedRoute) {

        this.reply_id = this.activeRoute.snapshot.params['rid'];


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


    ngOnInit() {


    }

}
