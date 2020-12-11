import { Document, Schema, Model, Types, model } from 'mongoose';
import { DefaultSchemaOptions } from './shared';

// ------------------------------------------
// Interface declaration
export interface ICalendarEvent extends Document {
    name: string;
    startTime: Date;
    finishTime: Date;
    chat_id: Types.ObjectId;
    participants: Types.ObjectId[];
}

// ------------------------------------------
// Schema definition
const calendarEventSchema = new Schema(
    {
      name: { type: String, required: true },
      startTime: { type: Date, required: true },
      finishTime: { type: Date, required: true},
      chat_id: Types.ObjectId,
      participants: [Types.ObjectId],
    },
    { ...DefaultSchemaOptions }
);

// ------------------------------------------
// Schema model exports
export const CalendarEventModel: Model<ICalendarEvent> = model<ICalendarEvent>(
    'CalendarEvent', calendarEventSchema, 'CalendarEvent'
);