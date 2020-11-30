import { Document, Schema, Model, Types, model } from 'mongoose';
import { DefaultSchemaOptions } from './shared';


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
  value: string;
  timestamp: Date;
}

// ------------------------------------------
// Interface declaration
export interface IChat extends Document {
  participants: Types.ObjectId[];
  isOnline: boolean;
  displayName: string;
  photoUrl: string;
  messages: IMessage[];
}

// ------------------------------------------
// Schema definition
const chatSchema = new Schema(
  {
    display_name: { type: String, },
    isOnline: { type: Boolean },
    photoUrl: { type: String },
    participants: [Types.ObjectId],
    messages: [{
      type: {
        type: String,
        enum: Object.keys(MessageType).filter(value => isNaN(Number(value)) === true).map(item=>item),
        required: true
      },
      value: { type: String, required: true },
      timestamp : { type : Date, default: Date.now },
      senderId: {type: Types.ObjectId, required: true}
    }]
  },
  { ...DefaultSchemaOptions }
);

// ------------------------------------------
// Schema model exports
export const ChatModel: Model<IChat> = model<IChat>(
  'Chat', chatSchema, 'Chat'
);
