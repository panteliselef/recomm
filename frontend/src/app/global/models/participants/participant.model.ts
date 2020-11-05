export class ParticipantModel {

    public _id: string;
    public firstName: string;
    public lastName: string;
    public photosURL: URL;



    private uname: string;
    private lastActive: Date;
    private isActive: Boolean;

    constructor(model?: any) {
        // Object.assign(this, model);
    }

}
