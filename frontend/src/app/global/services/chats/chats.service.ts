import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatModel } from '../../models';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';


@Injectable({
    providedIn: 'root'
})
export class ChatsService {

    private hostURl: string;

    constructor(private http: HttpClient) {
        this.hostURl = environment.host;
    }

    public getAll(): Observable<ChatModel[]> {
        return this.http
            .get<ChatModel[]>(`${this.hostURl}/api/chats`)
            .pipe(map(result => _.map(result, (t) => new ChatModel(t))));
    }

    public getById(id: string): Observable<ChatModel> {
        return this.http
            .get<ChatModel>(`${this.hostURl}/api/chats/${id}`)
            .pipe(map(result => new ChatModel(result)));
    }

    public create(resource: ChatModel): Observable<ChatModel> {
        console.log("AD", resource)
        return this.http
            .post<ChatModel>(`${this.hostURl}/api/chats`, resource)
            .pipe(map(result => new ChatModel(result)));
    }

    public update(resource: ChatModel): Observable<ChatModel> {
        return this.http
            .put<ChatModel>(`${this.hostURl}/api/chats/${resource._id}`, resource)
            .pipe(map(result => new ChatModel(result)));
    }

    public delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.hostURl}/api/chats/${id}`);
    }

}
