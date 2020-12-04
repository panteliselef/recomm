import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UsersService} from "../../../global/services/users/users.service";
import {UserModel} from "../../../global/models";
import {SmartSpeakerService} from "../../../global/services/core/smart-speaker.service";


@Component({
    selector: 'ami-fullstack-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    // @ViewChild('searchBar', {static: false}) searchBar: ElementRef;

    public allUsers: UserModel[];
    public usersToShow: UserModel[];
    public searchStr: string;

    constructor(private users: UsersService, private speaker: SmartSpeakerService) {
        this.searchStr = '';
        this.allUsers = [];
        speaker.initializeArtyom();


        // speaker.speak('Hello');

    }

    ngOnInit() { this.getAllUsers(); }

    filterSearchResults(value) {
        this.usersToShow = this.allUsers.filter( (user: UserModel) => {
            return user.getFullName().toLowerCase().includes(value.toLowerCase());
        })
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
        await this.users.registerAsContact(contact_id)
    }

    clearResults() {
        this.usersToShow = this.usersToShow = Array.from(this.allUsers);
        this.searchStr = '';
    }
}
