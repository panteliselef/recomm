import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'ami-fullstack-view-images',
    templateUrl: './view-images.component.html',
    styleUrls: [
        './view-images.component.scss',

    ]
})
export class ViewImagesComponent implements OnInit {

    testArr = Array(23).fill(5)

    constructor() {
    }

    ngOnInit() {
    }

}
