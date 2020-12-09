export class ChatModel {

    public _id: string;

    public participants: string[];
    public isOnline: boolean;
    public displayName: string;
    public photoUrl: string;
    public messages: MessageWithRepliesModel[];
    public more: any;

    constructor(model?: any) {
        Object.assign(this, model);
    }

}


export enum MessageType {
    TEXT = 'TEXT',
    IMAGE_STATIC = 'IMAGE_STATIC',
    IMAGE_GIF = 'IMAGE_GIF',
    FILE = 'FILE',
    STATUS = 'STATUS',
}



export class MessageModel {
    public _id: string;
    public senderId: string;
    public type: MessageType;
    public value: any;
    public timestamp: Date;


    constructor(model?: any) {
        Object.assign(this, model);
    }
}


export class MessageWithRepliesModel extends MessageModel{
    public replies: MessageModel[]
}
