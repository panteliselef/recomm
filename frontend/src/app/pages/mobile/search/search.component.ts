import {Component, OnInit} from '@angular/core';
import {UsersService} from '../../../global/services';
import {UserModel} from '../../../global/models';

@Component({
    selector: 'ami-fullstack-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    public allUsers: UserModel[];
    public usersToShow: UserModel[];
    public searchStr: string;

    constructor(private users: UsersService) {
        this.searchStr = '';
        this.allUsers = [];
    }

    ngOnInit() { this.getAllUsers(); }

    filterSearchResults(value) {
        this.usersToShow = this.allUsers.filter( (user: UserModel) => {
            return user.getFullName().toLowerCase().includes(value.toLowerCase());
        });
    }

    private async getAllUsers() {
        try {
            this.allUsers = await this.users
                .getAll()
                .toPromise();
            this.usersToShow = Array.from(this.allUsers);
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
