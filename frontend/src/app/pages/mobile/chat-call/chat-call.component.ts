import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'ami-fullstack-chat-call',
    templateUrl: './chat-call.component.html',
    styleUrls: [
        './chat-call.component.scss',
        '../../../components/app-chat-bar/app-chat-bar.component.scss',
    ]
})
export class ChatCallComponent implements OnInit {

    constructor() {
    }

    showVideoSetting: boolean = false;

    @ViewChild('settingsModal', {static: false}) settingsModal: ElementRef;

    ngOnInit() {


    }

    toggleVideoSetting() {
        this.showVideoSetting = !this.showVideoSetting;

        // if (this.showVideoSetting) {
        //     this.settingsModal.nativeElement.classList.add('active')
        // }else{
        //     this.settingsModal.nativeElement.classList.remove('active')
        // }
    }

}
