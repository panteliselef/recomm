import { Component, Input, OnInit } from '@angular/core';
import {Location} from "@angular/common";

@Component({
    selector: 'app-bar',
    templateUrl: './app-bar.component.html',
    styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent implements OnInit {

    @Input('title') pageTitle: String;
    @Input('img') imgSrc: String;

    @Input('hasImage') hasImage: boolean;

    @Input('leadingIcon') leadingIconName: String;
    @Input('trailingIcon') trailingIconName: String;

    constructor(private location: Location) { }

    ngOnInit() {




    }

    goBack(): void {
        this.location.back()
    }

}
