import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TaskModel} from '../../models';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash';


@Injectable({
    providedIn: 'root'
})
export class GifsService {

    private readonly apiKey: string;

    constructor(private http: HttpClient) {
        this.apiKey = environment.giphyApiKey
    }

    public getTrending(options?: { limit: number}): Observable<any[]> {
        return this.http
            .get<any>(`${this.getHost('trending')}${Object.entries(options).map(option=> `&${option[0]}=${option[1]}`)}`)
            .pipe(map(result => _.map(result.data,
                (t:{images: {fixed_height_small: string}}) => {
                    return t.images.fixed_height_small;
                }))
            );
    }

    public searchGif(q: string,options?: { limit: number}): Observable<any[]> {
        console.log(q)
        return this.http
            .get<any>(`${this.getHost('search')}&q=${q}${options ? Object.entries(options).map(option=> `&${option[0]}=${option[1]}`): ''}`)
            .pipe(map(result => _.map(result.data,
                (t:{images: {fixed_height_small: string}}) => {
                    return t.images.fixed_height_small;
                }))
            );
    }

    // public getById(id: string): Observable<TaskModel> {
    //     return this.http
    //         .get<TaskModel>(`${this.hostURl}/api/tasks/${id}`)
    //         .pipe(map(result => new TaskModel(result)));
    // }
    //
    // public create(resource: TaskModel): Observable<TaskModel> {
    //     return this.http
    //         .post<TaskModel>(`${this.hostURl}/api/tasks`, resource)
    //         .pipe(map(result => new TaskModel(result)));
    // }
    //
    // public update(resource: TaskModel): Observable<TaskModel> {
    //     return this.http
    //         .put<TaskModel>(`${this.hostURl}/api/tasks/${resource._id}`, resource)
    //         .pipe(map(result => new TaskModel(result)));
    // }
    //
    // public delete(id: string): Observable<void> {
    //     return this.http.delete<void>(`${this.hostURl}/api/tasks/${id}`);
    // }

    private getHost(endpoint: string) {
        return `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${this.apiKey}&rating=pg-13`;

    }

}
