import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fullstack-prep-call',
  templateUrl: './prep-call.component.html',
  styleUrls: ['./prep-call.component.scss']
})
export class PrepCallComponent implements OnInit {

    isMicEnabled: boolean = true;
    isCameraEnabled: boolean = true;


  constructor() { }

  ngOnInit() {
  }


}
