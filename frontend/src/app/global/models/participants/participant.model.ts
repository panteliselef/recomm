export class ParticipantModel {

    public _id: Number;
    public firstName: string;
    public lastName: string;
    public photoURL: string;



    private uname: string;
    private lastActive: Date;
    private isActive: Boolean;

    constructor(model?: any) {
        // Object.assign(this, model);
    }


    public getDisplayName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

}
