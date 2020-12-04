import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ChatModel, MessageModel, MessageType, MessageWithRepliesModel, UserModel} from "../../global/models";
import {ChatsService} from "../../global/services/chats/chats.service";

@Component({
    selector: 'chat-text-area',
    templateUrl: './chat-text-area.component.html',
    styleUrls: ['./chat-text-area.component.scss']
})
export class ChatTextAreaComponent implements OnInit {

    @ViewChild('message', {static: false}) textarea: ElementRef;
    @Input('chatModel') chat: ChatModel;
    @Input('meModel') me: UserModel;
    @Input('messageModel') replyMessage: MessageWithRepliesModel;

    textareaValue: string;
    isAudioRecordOpen: boolean = false;
    isStickersOpen: boolean = false;
    constructor(private chatService: ChatsService) {

    }

    ngOnInit() {
    }


    resize() {
        this.textarea.nativeElement.style.height = '22px';
        this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
    }


    onFileSelect($event: any) {
        let file = $event.target.files[0];

        console.log(file);

        let reader = new FileReader();

        reader.readAsArrayBuffer(file);

        reader.onload = async () => {
            console.log(reader.result);
            const fileStr = {
                originalname: file.name,
                buffer: reader.result
            }

            const l = await this.chatService.uploadFile(fileStr).toPromise()
            console.log(l)
        };
        reader.onerror = function() {
            console.log(reader.error);
        };
    }
    async sendMessage() {
        const msg = new MessageWithRepliesModel({
            senderId: this.me._id,
            type: MessageType.TEXT,
            value: this.textarea.nativeElement.value
        })
        if(!this.replyMessage) {
            const res = await this.chatService.pushMessage(this.chat, msg).toPromise()
            console.log(res);
        }else {
            const res = await this.chatService.pushMessageAsReply(this.chat, this.replyMessage,msg).toPromise()
            console.log(res);
        }


        this.textareaValue = "" // reset value
    }
}
