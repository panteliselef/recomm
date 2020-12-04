/**
 * An angular service for smart speaker based on artyom.js
 *
 * In order to use it:
 *  - install artyom.js (npm i artyom.js)
 *  - add this file in src/app
 */
import { Injectable } from '@angular/core';
// import Artyom from "artyom.js"
import Artyom from '../../../../../node_modules/artyom.js/build/artyom';

@Injectable({
  providedIn: 'root'
})
export class SmartSpeakerService {

  private artyom: any;

  constructor() {
    this.artyom = new Artyom();
  }

  /**********************/

  public initializeArtyom() {
    this.artyom.fatality();

    setTimeout(() => {
      this.artyom.initialize({
        lang: 'en-GB',
        continuous: true,// Artyom will listen forever
        listen: true, // Start recognizing
        debug: false, // Show everything in the console
        speed: 1, // talk normally
        //name: 'Bot' //set a key phrase to say before each command
      }).then(function () {
        console.log('Smart Speaker is ready');
      });
    }, 250);

  }

  /**********************/

  /**
   * Speak the given text
   *
   * @param text
   * @param onSpeakEnded called when the speech ends
   */
  speak(text: string, onSpeakEnded?: () => any) {
    this.artyom.say(text, {
      onStart: () => {
        //in case you would like to run code when speak starts
      },
      onEnd: () => {
        if (onSpeakEnded)
          onSpeakEnded();
      }
    });
  }

  /**********************/

  /**
   * Set a command that you would like to be recognized
   *
   * @param text a phrase/word or multiple phrases/words to be recognized
   * @param onVoiceRecognition a callback that is triggered whenever the system recognizes the given text
   */
  addCommand(text: string | string[], onVoiceRecognition: () => any) {
    var command = typeof (text) === 'string' ? [text] : text;

    var newCommand = {
      indexes: command,
      action: () => {
        onVoiceRecognition();
      }
    };

    this.artyom.addCommands(newCommand);
    this.initializeArtyom();
  }

  /**********************/

}
