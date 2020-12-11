import {Component, Input, OnInit} from '@angular/core';
import {UsersService} from "../../global/services";
import {ChatModel, UserModel} from "../../global/models";

@Component({
  selector: 'ami-fullstack-prep-call',
  templateUrl: './prep-call.component.html',
  styleUrls: ['./prep-call.component.scss']
})
export class PrepCallComponent implements OnInit {

    @Input('onReady') onReady: Function;
    @Input('chat') chat: ChatModel;
    isMicEnabled: boolean = true;
    isCameraEnabled: boolean = true;

    me: UserModel;


  constructor(private usersService: UsersService) { }

  async ngOnInit() {

     this.me =  await this.usersService.getMe();
  }


}
