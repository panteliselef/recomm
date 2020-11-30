import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ChatModel, UserModel} from '../../models';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import {ChatsService} from "../chats/chats.service";
import {Router} from "@angular/router";


@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private hostURl: string;
    private me: UserModel = new UserModel({_id: '5fbf873b0e12200f6ed0a3c1'})

    constructor(private http: HttpClient, private chatService: ChatsService, private router: Router) {
        this.hostURl = environment.host;
    }

    public getAll(): Observable<UserModel[]> {
        return this.http
            .get<UserModel[]>(`${this.hostURl}/api/users`)
            .pipe(map(result => _.map(result, (t) => new UserModel(t))));
    }

    public getById(id: string): Observable<UserModel> {
        return this.http
            .get<UserModel>(`${this.hostURl}/api/users/${id}`)
            .pipe(map(result => new UserModel(result)));
    }

    public create(resource: UserModel): Observable<UserModel> {
        return this.http
            .post<UserModel>(`${this.hostURl}/api/users`, resource)
            .pipe(map(result => new UserModel(result)));
    }

    public update(resource: UserModel): Observable<UserModel> {
        return this.http
            .put<UserModel>(`${this.hostURl}/api/users/${resource._id}`, resource)
            .pipe(map(result => new UserModel(result)));
    }

    public delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.hostURl}/api/users/${id}`);
    }


    public async getMe() {
        return await this.getById(this.me._id).toPromise()
    }




    public async registerAsContact(contact_id: string) {

        let chatToRedirect: string;

        // Get me as User from DB
        const me = await this.getById(this.me._id).toPromise()
        this.me = new UserModel(me);

        // Is the user in my contacts ?
        const contactIndex = this.me.contacts.findIndex(item => item.contact_id === contact_id)


        if(contactIndex >= 0) {

            // Get the associated chat_id with that contact
            chatToRedirect = this.me.contacts[contactIndex].chat_id;
        }else {

            // Create a new ChatModel to create a chat between the users
            const newChat: ChatModel = new ChatModel({
                participants: [this.me._id,contact_id],
                isOnline: true,
            })

            //  Get the created Model from DB
            const createdChat: ChatModel = await this.chatService.create(newChat).toPromise()
            this.me.chat_ids = [
                ...this.me.chat_ids,
                createdChat._id
            ]
            this.me.contacts = [
                ...this.me.contacts,
                {
                    contact_id,
                    chat_id: createdChat._id
                }
            ]

            // Save changes to user
            await this.update(this.me).toPromise();

            // TODO: update the other user's contact list & chat list too

            chatToRedirect = createdChat._id;
        }


        // Redirect to chat
        await this.router.navigate(['/', 'mobile', 'chats', chatToRedirect])

        console.log(me);
    }


}