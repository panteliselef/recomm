export class CalendarEventModel {

    public _id: string;

    public name: string;
    public startTime: Date;
    public finishTime: Date;
    public chat_id: string;
    public participants: string[];

    constructor(model?: any) {
        Object.assign(this, model);
    }

}
