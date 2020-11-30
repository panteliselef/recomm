import { Component, OnInit, Input } from '@angular/core';
import {LeapService} from "../../global/services/core/leap.service";


declare var $: any;

@Component({
  selector: 'ami-fullstack-virtual',
  templateUrl: './virtual.component.html',
  styleUrls: ['./virtual.component.scss']
})
export class VirtualComponent implements OnInit {

  /*****************************/

  @Input() elements2Check = ['button'];
  @Input() waitingTime = 100;
  @Input() size = 80;
  @Input() color = 'black';

  /*****************************/

  public cursorStyle;
  public cursorSize;

  public loading = {
    width: '0%'
  }

  /*****************************/

  private cursorCounter = 0;
  private onItemCounter = 0;
  private itemSelected;


  /*****************************/

  constructor(private _leap: LeapService) {
    setInterval(() => {
      this.cursorCounter++;
      if (this.cursorCounter == 5) {
        this.resetCursor();
        this.cursorStyle.display = 'none';
      }
    }, 200);
  }

  /*****************************/

  ngOnInit() {
    this._leap.cursorRecognizer().subscribe((leapPos) => {
      this.cursorStyle.left = leapPos.xPos + 'px';
      this.cursorStyle.top = leapPos.yPos + 'px';
      this.cursorStyle.display = 'block';

      this.cursorCounter = 0;

      this.checkCursorHovering();
    });

    this.updateCursorLook();
  }

  /*****************************/

  private updateCursorLook() {
    this.cursorSize = {
      width: this.size + 'px',
      height: this.size + 'px',
      "background-color": this.color
    };

    this.cursorStyle = {
      top: '0px',
      left: '0px',
      display: 'none',
      width: this.size + 'px',
      height: this.size + 'px'
    };

  }

  /*****************************/

  private checkCursorHovering() {

    if (this.elements2Check.length == 0)
      return;

    var isHovering = false;
    this.elements2Check.forEach(element => {
      var $touchedElem = $('#cursor').touching($(element));

      if ($touchedElem.length == 0)
        return;

      this.onItemCounter = this.itemSelected == $touchedElem[0] ? this.onItemCounter + 1 : 0;
      this.itemSelected = $touchedElem[0];

      isHovering = true;
      this.updateCursor();

    });

    if (!isHovering)
      this.resetCursor();

  }

  /*****************************/

  private updateCursor() {
    this.loading.width = (this.onItemCounter / this.waitingTime * 100) + '%';

    if (this.onItemCounter == this.waitingTime) {
      let event = new MouseEvent('click');
      this.itemSelected.dispatchEvent(event);
      this.resetCursor();
    }
  }

  /*****************************/

  private resetCursor() {
    this.onItemCounter = 0;
    this.itemSelected = null;
    this.loading.width = '0%';
  }

  /*****************************/

}
