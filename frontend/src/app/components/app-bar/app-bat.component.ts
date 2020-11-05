import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-bar',
    templateUrl: './app-bar.component.html',
    styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent implements OnInit {

    @Input('title') pageTitle: String;
    @Input('icon') iconName: String;
    @Input('img') imgSrc: String;

    constructor() { }

    ngOnInit() {




    }

}
