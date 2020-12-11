import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CalendarEventModel} from '../../models';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class CalendarEventService {

    private hostURl: string;

    constructor(private http: HttpClient) {
        this.hostURl = environment.host;
    }

    public getAll(): Observable<CalendarEventModel[]> {
        return this.http
            .get<CalendarEventModel[]>(`${this.hostURl}/api/calendarEvent`)
            .pipe(map(result => _.map(result, (t) => new CalendarEventModel(t))));
    }

    public getById(id: string): Observable<CalendarEventModel> {
        return this.http
            .get<CalendarEventModel>(`${this.hostURl}/api/calendarEvent/${id}`)
            .pipe(map(result => new CalendarEventModel(result)));
    }

    public create(resource: CalendarEventModel): Observable<CalendarEventModel> {
        return this.http
            .post<CalendarEventModel>(`${this.hostURl}/api/calendarEvent`, resource)
            .pipe(map(result => new CalendarEventModel(result)));
    }

    public update(resource: CalendarEventModel): Observable<CalendarEventModel> {
        return this.http
            .put<CalendarEventModel>(`${this.hostURl}/api/calendarEvent/${resource._id}`, resource)
            .pipe(map(result => new CalendarEventModel(result)));
    }

    public delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.hostURl}/api/calendarEvent/${id}`);
    }
}
