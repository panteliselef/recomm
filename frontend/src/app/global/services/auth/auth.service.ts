import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ChatModel, MessageModel, MessageWithRepliesModel, UserModel} from '../../models';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash';
import {UsersService} from "../users/users.service";


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private currentUser: UserModel;
    private isLoggedIn: boolean = false;
    private recommendUser: UserModel;

    constructor(private http: HttpClient) {
        // this.recommendUser = new UserModel({_id: '5fca49c79a6e9e032a811154'})


        this.http
            .get<UserModel[]>(`${environment.host}/api/users`)
            .pipe(map(result => _.map(result, (t) => new UserModel(t)))).toPromise().then(array=> {
                this.recommendUser = array.find<UserModel>((user : UserModel): user is UserModel=> {
                    return user.fname === 'Pantelis' && user.lname === 'Elef';
                })
        })
        // this.http
        //     .get<UserModel>(`${environment.host}/api/users/${this.recommendUser._id}`)
        //     .pipe(map(result => new UserModel(result))).toPromise().then(user => {
        //         this.recommendUser = user;
        //     })

    }

    public isAuthenticated () {
        return new Promise<boolean>(((resolve, reject) => {
            setTimeout(()=> {
                resolve(this.isLoggedIn)
            },800)
        }))
    }

    public setCurrentUser(user: UserModel) {
        if(this.isLoggedIn) throw Error('User already initialized')
        this.currentUser = user;
        this.isLoggedIn = true;
    }

    public getCurrentUser(): UserModel {

        if(this.isLoggedIn) return this.currentUser;
        return  this.recommendUser;
    }

    public getRecommendedUser() {
        return this.recommendUser
    }
}
