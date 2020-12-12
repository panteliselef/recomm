import { Component, OnInit } from '@angular/core';
import {UserModel} from '../../../global/models';
import {SmartSpeakerService, UsersService} from '../../../global/services';
import {Router} from '@angular/router';

@Component({
  selector: 'ami-fullstack-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

    me: UserModel;

  constructor(private router: Router, private usersService: UsersService) { }

    async ngOnInit() {
        this.me = await this.usersService.getMe();
    }

}
