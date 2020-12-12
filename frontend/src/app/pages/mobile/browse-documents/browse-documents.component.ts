import {Component, OnInit} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from "../../../global/models";
import {ActivatedRoute, Router} from "@angular/router";
import {ChatsService, SocketsService, UsersService} from "../../../global/services";

@Component({
    selector: 'ami-fullstack-browse-documents',
    templateUrl: './browse-documents.component.html',
    styleUrls: ['./browse-documents.component.scss']
})
export class BrowseDocumentsComponent implements OnInit {

    readonly url: string = 'http://localhost:8080/api/files/download/';

    chat: ChatModel;
    me: UserModel;
    imgMessages: MessageWithRepliesModel[];
    imgNum: string;

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
        this.me = await this.userService.getMe();

        // @ts-ignore
        this.imgMessages = this.chat.messages.filter<MessageWithRepliesModel>((message: MessageWithRepliesModel): boolean => {
            return message.type === MessageType.FILE;
        });

        console.log(this.imgMessages);
        if (this.imgMessages.length === 1) {
            this.imgNum = this.imgMessages.length + ' Document';
        } else {
            this.imgNum = this.imgMessages.length + ' Documents';
        }

    }

    async downloadDocument(file: { filename: string }) {
        window.location.href = `${this.url}${file.filename}`;
    }


    ngOnInit() {
    }


}
