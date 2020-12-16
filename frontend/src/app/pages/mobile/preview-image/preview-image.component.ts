import {Component, OnInit} from '@angular/core';
import {ChatModel, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {ActivatedRoute} from '@angular/router';
import {ChatsService, UsersService} from '../../../global/services';
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'ami-fullstack-preview-image',
    templateUrl: './preview-image.component.html',
    styleUrls: ['./preview-image.component.scss']
})
export class PreviewImageComponent implements OnInit {

    readonly url: string = `${environment.host}/api/files/download/`;

    chat: ChatModel;
    me: UserModel;
    imgMessage: MessageWithRepliesModel;
    fileName: string;
    timestamp: Date;
    size: number;


    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService) {
        const chatId = this.route.snapshot.params.id;
        this.fileName = this.route.snapshot.params.imgFileName;
        this.fetchChatData(chatId);
    }

    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise();
        this.me = await this.userService.getMe();

        this.imgMessage = this.chat.messages.find<MessageWithRepliesModel>((message: MessageWithRepliesModel): message is MessageWithRepliesModel => {
            return message.value.filename === this.fileName;
        });

        this.timestamp = this.imgMessage.timestamp;
        this.size = this.imgMessage.value.size;

        console.log(this.imgMessage);

    }

    ngOnInit() {
    }

    downloadFileToDevice() {
        const file: { filename: string } = this.imgMessage.value;
        window.location.href = `${this.url}${file.filename}`;
    }

}
