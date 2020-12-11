import {Component, OnInit} from '@angular/core';
import {UsersService, AuthService} from '../../global/services';
import {UserModel} from '../../global/models';
import {Router} from '@angular/router';

@Component({
    selector: 'ami-fullstack-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

    allUsers: UserModel[];
    me: UserModel;

    constructor(private usersService: UsersService, private authService: AuthService, private router: Router) {


        this.fetchUsers();
    }


    ngOnInit() {
    }

    private async fetchUsers() {


        // this.me = this.authService.getRecommendedUser()
        // console.log(this.me)
        // this.me = await this.usersService.getById(this.me._id).toPromise()
        this.allUsers = await this.usersService.getAll().toPromise();

        // console.log(this.allUsers)
        this.me = this.allUsers.find<UserModel>((user): user is UserModel => {
            return user.fname === 'Pantelis' && user.lname === 'Elef';
        });
        this.allUsers = this.allUsers.slice(1, this.allUsers.length);
    }

    async selectUser(user: UserModel) {
        this.authService.setCurrentUser(user);

        console.log(this.authService.getCurrentUser());

        await this.router.navigate(['/home']);
    }
}
