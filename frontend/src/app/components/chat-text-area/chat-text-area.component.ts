import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ChatModel, MessageModel, MessageType, MessageWithRepliesModel, UserModel} from "../../global/models";
import {ChatsService} from "../../global/services/chats/chats.service";
import {FileUploader} from "ng2-file-upload";
import {HttpClient} from "@angular/common/http";
import {environment} from 'src/environments/environment';

@Component({
    selector: 'chat-text-area',
    templateUrl: './chat-text-area.component.html',
    styleUrls: ['./chat-text-area.component.scss','../../pages/mobile/search/search.component.scss']
})

export class ChatTextAreaComponent implements OnInit {

    @ViewChild('message', {static: false}) textarea: ElementRef;
    @Input('chatModel') chat: ChatModel;
    @Input('meModel') me: UserModel;
    @Input('messageModel') replyMessage: MessageWithRepliesModel;

    textareaValue: string;

    toggleableArr: boolean[];
    audioRecord: number = 0;
    stickers: number = 1;

    private  URL = 'http://localhost:8080/api/files/upload';
    private hostURl: string;
    public uploader: FileUploader = new FileUploader({
        url: this.URL,
        itemAlias: 'image',
        disableMultipart: false
    });
    emojis: Array<any>;
    gifType: string;
    searchStr: string;
    filteredEmojis: any[];

    showLoadingSpinner:boolean = true;

    constructor(private chatService: ChatsService, private http: HttpClient) {
        this.hostURl = environment.host;
    }

    ngOnInit() {
        this.gifType = 'emoji';

        this.textareaValue = "" // reset value
        this.http.get<Array<any>>('https://emoji-api.com/emojis?access_key=5e89eb3cb936e10074cc44fbde7f6b4a7422146d').toPromise().then(res=>{

            this.emojis = res.filter(emoji => {
                return emoji.group !== 'flags'
            })
            this.filteredEmojis = this.emojis

            this.showLoadingSpinner = false;
            // this.emojis = res
            // "group": "flags",
        });

        this.toggleableArr = [false,false];
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onCompleteItem = (item: any, status: any) => {
            console.log('Uploaded File Details:', item);
        };

        setTimeout(async ()=>{
            //
            // const response = await this.http.get(`${this.hostURl}/api/files/download/b6579f20-3727-11eb-8edf-75406f7f7f44-rsz_rsz_img_7700.jpg`, {
            //     responseType: 'arraybuffer'
            // }).toPromise<any>();
            //
            // let blob = new Blob([response], { type: 'text/csv'});
            // let url = window.URL.createObjectURL(blob);
            // let pwa = window.open(url);
            // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            //     alert( 'Please disable your Pop-up blocker and try again.');
            // }
            // console.log(new Blob(response).text())
        },1000)
    }
    async uploadFile(file: File) {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        const response = await this.http.post(`${this.hostURl}/api/files/upload`, formData).toPromise<any>();
        return response.filename;
    }

    handleFileInput(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            this.uploadFile(files.item(i)).then((d) => {
                console.log(d)
            });
        }
    }

    toggleChatAction(index: number) {
        let toBe: boolean;
        toBe = !this.toggleableArr[index];
        this.toggleableArr = this.toggleableArr.map(item => item = false);
        this.toggleableArr[index] = toBe;
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

    copyEmojiToMessage(emoji: any) {

        if (emoji.character)
            this.textareaValue += `${emoji.character}`
        console.log(emoji.character)

    }

    clearResults() {
        this.searchStr = '';
        this.filteredEmojis = this.emojis;
    }

    filterSearchResults(value) {this.filteredEmojis = this.emojis.filter(emoji => {
            return emoji.unicodeName.includes(value);
        })
    }
}
