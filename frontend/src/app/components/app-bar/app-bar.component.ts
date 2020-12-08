import {Component, Input, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Component({
    selector: 'app-bar',
    templateUrl: './app-bar.component.html',
    styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent implements OnInit {

    @Input('title') pageTitle: String;

    @Input('img') imgSrc: String;
    @Input('hasImage') hasImage: boolean;
    @Input('onImageClick') onImageClick: Function;

    @Input('leadingIcon') leadingIconName: String;

    @Input('trailingIcon') trailingIconName: String;
    @Input('onTrailingIconClick') onTrailingIconClick: Function;

    constructor(private location: Location, private router: Router) {
    }

    ngOnInit() {


    }

    goBack(): void {
        this.location.back()
    }


    onClickImage() {
        this.onImageClick.call(this);
    }

    onClickTrailingIcon() {
        this.onTrailingIconClick.call(this);
    }
}
