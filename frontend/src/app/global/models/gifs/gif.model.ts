export class GifModel {

    public _id: string;
    public fname: string;
    public lname: string;
    private photoUrl: string;
    public chat_ids: string[];
    public contacts: Array<{contact_id:string, chat_id: string}>;

    constructor(model?: any) {
        Object.assign(this, model);
    }


    public getFullName() {
        return `${this.fname} ${this.lname}`
    }

    public getPhoto() {
        return `data:image/jpeg;base64,${this.photoUrl}`
    }
}
