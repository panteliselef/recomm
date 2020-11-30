import { Document, Schema, Model, Types, model } from 'mongoose';
import { DefaultSchemaOptions } from './shared';


// ------------------------------------------
// Interface declaration
export interface IUser extends Document {
  fname: string;
  lname: string;
  photoUrl: string;
  chat_ids: Types.ObjectId[];
  contacts: Array<{ contact_id: Types.ObjectId, chat_id: Types.ObjectId }>;
}

// ------------------------------------------
// Schema definition
const userSchema = new Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    photoUrl: { type: String, required: true},
    chat_ids: [Types.ObjectId],
    contacts: [
      { 
        contact_id: { type:Types.ObjectId },
        chat_id: { type:Types.ObjectId }
      } 
    ],
  },
  { ...DefaultSchemaOptions }
);

// ------------------------------------------
// Schema model exports
export const UserModel: Model<IUser> = model<IUser>(
  'User', userSchema, 'User'
);
