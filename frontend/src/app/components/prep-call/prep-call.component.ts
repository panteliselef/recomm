import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
    @Output('onToggle') onToggle: EventEmitter<{ isMicEnabled: boolean, isCameraEnabled: boolean }> = new EventEmitter<{ isMicEnabled: boolean, isCameraEnabled: boolean }>();
    @Input('options') options: {isMuted: boolean, hasCamera: boolean} ;

    me: UserModel;

    constructor(private usersService: UsersService) {
    }

    async ngOnInit() {

        this.me = await this.usersService.getMe();
    }

    toggleCamera() {
        this.options.hasCamera = !this.options.hasCamera
        this.onToggle.emit({
            isMicEnabled: this.options.isMuted,
            isCameraEnabled: this.options.hasCamera
        })
    }

    toggleMic() {
        this.options.isMuted = !this.options.isMuted
        this.onToggle.emit({
            isMicEnabled: this.options.isMuted,
            isCameraEnabled: this.options.hasCamera
        })
    }
}
