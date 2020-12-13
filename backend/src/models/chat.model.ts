import { Document, Schema, Model, Types, model } from 'mongoose';
import { DefaultSchemaOptions } from './shared';


// ------------------------------------------
// Interface declaration

export enum MessageType {
  TEXT,
  IMAGE_STATIC,
  IMAGE_GIF,
  FILE,
  STATUS,
}


export interface IMessage extends Document {
  senderId: Types.ObjectId;
  type: MessageType;
  value: String | Object;
  timestamp: Date;
}

export interface IMessageWithReplies extends IMessage{
  replies: IMessage[];
}

export interface IChat extends Document {
  participants: Types.ObjectId[];
  isOnline: boolean;
  displayName: string;
  photoUrl: string;
  messages: IMessageWithReplies[];
}


const messageSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.keys(MessageType).filter(value => isNaN(Number(value)) === true).map(item=>item),
      required: true
    },
    value: { type: Schema.Types.Mixed, required: true },
    // value: { type: String, required: true },
    timestamp : { type : Date, default: Date.now },
    senderId: {type: Types.ObjectId, required: true}
  },
  { ...DefaultSchemaOptions}

);

const messageSchemaWithReplies = new Schema(
  {
    ...messageSchema.obj,
      replies: [messageSchema]
  }
)
// ------------------------------------------
// Schema definition
const chatSchema = new Schema(
  {
    displayName: { type: String },
    isOnline: { type: Boolean },
    photoUrl: { type: String },
    participants: [Types.ObjectId],
    messages: [messageSchemaWithReplies]
  },
  { ...DefaultSchemaOptions }
);


// ------------------------------------------
// Schema model exports

export const ChatModel: Model<IChat> = model<IChat>(
  'Chat', chatSchema, 'Chat'
);


export const MessageModel: Model<IMessage> = model<IMessage>(
  'Message', messageSchema, 'Message'
);


export const MessageWithRepliesModel: Model<IMessageWithReplies> = model<IMessageWithReplies>(
  'MessageWithReplies', messageSchemaWithReplies, 'MessageWithReplies'
);