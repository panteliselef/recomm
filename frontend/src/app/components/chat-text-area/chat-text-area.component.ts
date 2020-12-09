import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ChatModel, MessageType, MessageWithRepliesModel, UserModel} from "../../global/models";
// import {FileUploader} from "ng2-file-upload";
import {HttpClient} from "@angular/common/http";
import {environment} from 'src/environments/environment';
import {GifsService, ChatsService} from "../../global/services";

interface FileReaderEventTarget extends EventTarget {
    result:string
}

interface FileReaderEvent<T> extends ProgressEvent {
    target: FileReaderEventTarget;
    getMessage():string;
}

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
    previewPhotoSrc: string | ArrayBuffer;
    previewFileSrc: string | ArrayBuffer;
    showUploadPreviewFile: boolean;
    toggleableArr: boolean[];
    audioRecord: number = 0;
    stickers: number = 1;

    private  URL = 'http://localhost:8080/api/files/upload';
    private hostURl: string;
    emojis: Array<any>;
    gifType: string;
    searchStr: string;
    filteredEmojis: any[] = [];
    trendingGifs: any[] = [];

    showLoadingSpinner:boolean = true;
    fileToUpload: File;

    constructor(private chatService: ChatsService, private http: HttpClient, private gifs: GifsService) {
        this.hostURl = environment.host;
    }

    ngOnInit() {
        this.gifType = 'gif';

        this.textareaValue = "" // reset value
        this.http.get<Array<any>>('https://emoji-api.com/categories/smileys-emotion?access_key=5e89eb3cb936e10074cc44fbde7f6b4a7422146d').toPromise().then(res=>{

            this.emojis = res.filter(emoji => {
                return emoji.group !== 'flags'
            })
            this.filteredEmojis = this.emojis;

            this.showLoadingSpinner = false;
        });


        this.toggleableArr = [false,false];

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

    private async loadTrendingGifs () {
        this.trendingGifs =  await this.gifs.getTrending({limit:20}).toPromise();
        this.trendingGifs = this.splitToTwoLists(this.trendingGifs);
    }

    splitToTwoLists (arr:Array<any>) {
        const items1: Array<any> = [];
        const items2: Array<any> = [];

        arr.forEach((item,i) => {
            if(i % 2 == 0){
                items1.push(item)
            }else {
                items2.push(item)
            }
        })

        return [items1,items2];


    }

    async uploadFile(file: File) {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        const response = await this.http.post(`${this.hostURl}/api/files/upload`, formData).toPromise<any>();
        return response;
    }

    handleFileInput(files: FileList) {
        this.showUploadPreviewFile = true;
        this.previewPhotoSrc = ''
        this.previewFileSrc = ''

        for (let i = 0; i < files.length; i++) {
            const fileExt:string = files[i].name.split('.').pop()
            // console.log(files[i])
            if(fileExt === 'png' || fileExt === 'jpg') {
                const reader = new FileReader();

                reader.onload = (e:FileReaderEvent<FileReader>) => {
                    this.previewPhotoSrc = e.target.result;
                    console.log(e.target.result);
                }

                reader.readAsDataURL(files[i]); // convert to base64 string
            }else {
                this.previewFileSrc = files[i].name
            }

            this.fileToUpload = files.item(i);
        }
    }

    toggleChatAction(index: number) {

        if(index === this.stickers && this.trendingGifs.length === 0) {
            this.loadTrendingGifs()
        }
        let toBe: boolean;
        toBe = !this.toggleableArr[index];
        this.toggleableArr = this.toggleableArr.map(item => item = false);
        this.toggleableArr[index] = toBe;
    }


    resize() {
        this.textarea.nativeElement.style.height = '22px';
        this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
    }

    async sendMessage() {

        function isEmptyOrSpaces(str){
            return str === null || str.match(/^[ \n\r\t\f\v]*$/) !== null;
        }

        let msg;

        if(this.fileToUpload) { // User wants to upload Photo
            const value: {encoding: string, fieldname: string, filename: string, mimetype: string, originalname: string, size: string} = await this.uploadFile(this.fileToUpload);

            let type: MessageType;
            if(value.mimetype.includes('image')) {
                type = MessageType.IMAGE_STATIC
            }else {
                type = MessageType.FILE
            }

            console.log('FIle',value);

            msg = new MessageWithRepliesModel({
                senderId: this.me._id,
                type,
                value,
            })

        }else {

            if(isEmptyOrSpaces(this.textarea.nativeElement.value)){
                return
            }
            msg = new MessageWithRepliesModel({
                senderId: this.me._id,
                type: MessageType.TEXT,
                value: this.textarea.nativeElement.value
            })
        }

        if(!this.replyMessage) {
            const res = await this.chatService.pushMessage(this.chat, msg).toPromise()
            console.log(res);
        }else {
            const res = await this.chatService.pushMessageAsReply(this.chat, this.replyMessage,msg).toPromise()
            console.log(res);
        }



        if(!this.fileToUpload) {
            this.textareaValue = "" // reset value
            this.textarea.nativeElement.style.height = '22px';
        }
        this.resetChatsActions()


    }

    resetChatsActions() {
        this.showUploadPreviewFile = false;
        this.previewPhotoSrc = ''
        this.previewFileSrc = ''
        this.fileToUpload = undefined;
        this.toggleableArr = [false,false];
    }

    copyEmojiToMessage(emoji: any) {

        if (emoji.character)
            this.textareaValue += `${emoji.character}`
        console.log(emoji.character)

        this.textarea.nativeElement.focus();

    }

    clearResults() {
        this.searchStr = '';
        this.filteredEmojis = this.emojis;
    }

    filterSearchResults(value) {
        const filterEmojis = () => {
            this.filteredEmojis = this.emojis.filter(emoji => {
                return emoji.unicodeName.includes(value);
            })
        }
        if(this.gifType === 'gif') { return; }
        filterEmojis()
    }



    removeSelectedFile() {
        this.showUploadPreviewFile = false;
        this.previewPhotoSrc = '';
        this.previewFileSrc = '';
        this.fileToUpload = undefined
    }

    async queryGifs() {
        console.log(this.searchStr)
        const gifs = await this.gifs.searchGif(this.searchStr,{limit:20}).toPromise()
        this.trendingGifs = this.splitToTwoLists(gifs)
    }

    async sendGif(url: string) {
        let msg = new MessageWithRepliesModel({
            senderId: this.me._id,
            type: MessageType.IMAGE_GIF,
            value: url,
        })

        if(!this.replyMessage) {
            const res = await this.chatService.pushMessage(this.chat, msg).toPromise()
            console.log(res);
        }else {
            const res = await this.chatService.pushMessageAsReply(this.chat, this.replyMessage,msg).toPromise()
            console.log(res);
        }
        this.resetChatsActions()
    }
}
