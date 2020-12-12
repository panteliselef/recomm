import {Component, OnInit} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from '../../../global/models';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatsService, SocketsService, UsersService} from '../../../global/services';

@Component({
    selector: 'ami-fullstack-preview-image',
    templateUrl: './preview-image.component.html',
    styleUrls: ['./preview-image.component.scss']
})
export class PreviewImageComponent implements OnInit {

    readonly url: string = 'http://localhost:8080/api/files/download/';

    chat: ChatModel;
    me: UserModel;
    imgMessages: MessageWithRepliesModel[];
    fileName: string;
    timestamp: Date;
    size: number;


    constructor(private route: ActivatedRoute,
                private chatService: ChatsService,
                private userService: UsersService,
                private socketService: SocketsService,
                private router: Router) {
        const chatId = this.route.snapshot.params.id;
        this.fileName = this.route.snapshot.params.imgFileName;
        this.fetchChatData(chatId);
    }

    private async fetchChatData(chatId: string) {
        this.chat = await this.chatService.getById(chatId).toPromise();
        this.me = await this.userService.getMe();

        // @ts-ignore
        this.imgMessages = this.chat.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): boolean => {
            return message.value.filename === this.fileName;
        });

        this.timestamp = this.imgMessages[0].timestamp;
        this.size = this.imgMessages[0].value.size;

        console.log(this.imgMessages);

    }

    ngOnInit() {
    }

}
