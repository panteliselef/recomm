import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketsService, UsersService} from "../../../global/services";
import {Subscription} from "rxjs";
import {UserModel} from "../../../global/models";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'ami-fullstack-smart-tv',
    templateUrl: './smart-tv.component.html',
    styleUrls: ['./smart-tv.component.scss']
})
export class SmartTvComponent implements OnInit, OnDestroy {
    private me: UserModel;
    private onTVCallSub: Subscription;

    constructor(private socketsService: SocketsService, private usersService: UsersService, private router: Router, private route: ActivatedRoute) {
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe()
        this.onTVCallSub = this.socketsService
            .syncMessages(`${this.me._id}/on-tv-call`)
            .subscribe(async (msg: { event: string, message: { chatId: string, device: string } }) => {
                await this.router.navigate(['call', msg.message.chatId], {relativeTo: this.route })
            })
    }


    ngOnDestroy() {

        this.onTVCallSub.unsubscribe()
    }

}
