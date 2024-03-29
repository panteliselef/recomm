import {Component, OnInit} from '@angular/core';
import {UsersService} from '../../../global/services';
import {UserModel} from '../../../global/models';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'ami-fullstack-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    public allUsers: UserModel[];
    public usersToShow: UserModel[];
    public searchStr: string;
    private me: UserModel;
    query: string;

    constructor(private users: UsersService, private route: ActivatedRoute) {
        this.searchStr = '';
        this.allUsers = [];
        this.query = this.route.snapshot.queryParams.q;
    }

    ngOnInit() { this.getAllUsers(); }

    filterSearchResults(value) {
        this.usersToShow = this.allUsers.filter( (user: UserModel) => {
            return user.getFullName().toLowerCase().includes(value.toLowerCase());
        });
    }

    private async getAllUsers() {
        try {
            this.me = await this.users.getMe();
            this.allUsers = await this.users
                .getAll()
                .toPromise();
            this.allUsers = this.allUsers.filter<UserModel>((user: UserModel): user is UserModel => {
                return user._id !== this.me._id;
            });
            //Exclude myself
            this.usersToShow = Array.from(this.allUsers);
            if(!this.query) return
            this.searchStr = this.query;
            if(this.searchStr.trim() !== '')this.filterSearchResults(this.searchStr);
        } catch (e) {
            console.error(e);
        }
    }

    async goToChat(contact_id: string) {
        await this.users.registerAsContact(contact_id);
    }

    clearResults() {
        this.usersToShow = this.usersToShow = Array.from(this.allUsers);
        this.searchStr = '';
    }
}
