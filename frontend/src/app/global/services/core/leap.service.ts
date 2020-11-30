import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as Leap from 'leapjs';

/***********************************************/

export interface CursorPos {
  xPos: number;
  yPos: number;
}

/***********************************************/

export enum Gestures {
  SWIPE_LEFT,
  SWIPE_UP,
  SWIPE_DOWN,
  SWIPE_RIGHT,
  CIRCLE_CLOCKWISE,
  CIRCLE_COUNTERCLOCKWISE
}

/***********************************************/

@Injectable({
  providedIn: 'root'
})
export class LeapService {


  /*****************************/

  private timeoutAfterRecognition = 1500; //ms 
  private framesForGesture = 3;

  /*****************************/

  private positionEvent: EventEmitter<CursorPos>;
  private gestureEvent: EventEmitter<Gestures>;

  /*****************************/



  constructor() {
    var controllerOptions = { enableGestures: true };

    this.initializeEmmiters();

    Leap.loop(controllerOptions, (frame) => {
      let cursor = this.leapLoop(frame);
      var gesture = this.findGesture(frame);

      if (gesture != null)
        this.gestureEvent.emit(gesture);

      if (cursor)
        this.positionEvent.emit(cursor);
    });

  }

  /*****************************/

  public cursorRecognizer(): Observable<CursorPos> {
    return this.positionEvent;
  }

  public gestureRecognizer(): Observable<Gestures> {
    return this.gestureEvent;
  }

  /*****************************/

  private leapLoop(frame): CursorPos {

    if (frame.pointables && frame.pointables.length == 0)
      return null;

    var normalizedPosition = frame.interactionBox.normalizePoint(frame.pointables[0].tipPosition, true);

    if (normalizedPosition[2] < 0.2 || normalizedPosition[2] > 0.8)
      return null;

    return {
      xPos: normalizedPosition[0] * window.innerWidth,
      yPos: window.innerHeight - normalizedPosition[1] * window.innerHeight
    };
  }

  /*****************************/

  private gestureCounter = 0;
  private currGesture: string;

  /**
   * This function can be edited in order to implement more advanced gesture handling features 
   * 
   */
  private findGesture(frame) {
    var gesture = this.getGesture(frame);
    if (!gesture) {
      this.currGesture = null;
      return null;
    }

    var foundGesture = null;
    switch (gesture.type) {
      case 'swipe':
        foundGesture = this.swipeHander(gesture);
        break;
      case 'circle':
        foundGesture = this.circleHander(frame, gesture);
        break;
      default:
        // you can add more basic gestures here
        return null;
    }
    return this.checkAndReturnGesture(foundGesture);
  }

  /*****************************/

  private checkAndReturnGesture(foundGesture) {
    if (this.gestureCounter == -1)
      return;

    if (this.currGesture == foundGesture) {
      this.gestureCounter++
    } else {
      this.currGesture = foundGesture;
      this.gestureCounter = 0;
    }

    if (this.gestureCounter == this.framesForGesture) {
      this.resetGestures();
      return foundGesture;
    }

    return null;
  }

  /*****************************/

  private resetGestures() {
    this.currGesture = null;
    this.gestureCounter = -1;

    setTimeout(() => {
      this.gestureCounter = 0;
    }, this.timeoutAfterRecognition);
  }

  /*****************************/

  private getGesture(frame) {
    if (!frame.valid || frame.gestures.length == 0)
      return null;

    var gestures = frame.gestures;

    var gesture = gestures[0];
    if (!gesture)
      return null;
    return gesture;
  }

  /*****************************/

  private swipeHander(gesture): Gestures {

    if (Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1])) {
      if (gesture.direction[0] > 0)
        return Gestures.SWIPE_RIGHT;
      return Gestures.SWIPE_LEFT;
    }
    if (gesture.direction[1] > 0)
      return Gestures.SWIPE_UP;
    return Gestures.SWIPE_DOWN;

  }

  /*****************************/

  private circleHander(frame, gesture): Gestures {
    if (!gesture || !gesture.pointableIds)
      return null;
    var pointableID = gesture.pointableIds[0];
    var direction = frame.pointable(pointableID).direction;
    var dotProduct = Leap.vec3.dot(direction, gesture.normal);

    if (dotProduct > 0)
      return Gestures.CIRCLE_CLOCKWISE;
    return Gestures.CIRCLE_COUNTERCLOCKWISE;
  }

  /*****************************/

  //#region Initializing

  private initializeEmmiters() {
    this.positionEvent = new EventEmitter<CursorPos>();
    this.gestureEvent = new EventEmitter<Gestures>();
  }

  //#endregion

  /*****************************/

}