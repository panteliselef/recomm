import {Component, OnInit} from '@angular/core';
import {SmartSpeakerService} from '../../../global/services';


@Component({
    selector: 'ami-fullstack-voice',
    templateUrl: './voice.component.html',
    styleUrls: ['./voice.component.scss']
})
export class VoiceComponent implements OnInit {

    constructor(private speaker: SmartSpeakerService) {
    }


    ngOnInit() {
    }

    startAction() {

        const videoCall = (index, word) => {
            // word is the name of videoCall
            // check if videoCall exist
            // if (!word) then
            this.speaker.speak('the videoCall with name ' + word + 'doesnt exist');
            // if (word)
            // if index == 0 then go to smartphone
            // if index == 1 then go to Tv
        };

        const searchFor = (index, word) => {
            // word is the name of contact
            // check if contact exist
            // if (!word) then
            this.speaker.speak('the contact with name ' + word + 'doesnt exist');
            // if (word)
        };

        const showImages = (index, word) => {
            // word is the name of chat
            // check if chat exist
            // if (!word) then
            this.speaker.speak('the chat with name ' + word + 'doesnt exist');
            // if (word)
        };

        this.speaker.addSmartCommand(['join videoCall * on smartphone', 'join videoCall * on Tv'], videoCall);
        this.speaker.addSmartCommand('search for *', searchFor);
        this.speaker.addSmartCommand('show images of *', showImages);
    }
}
