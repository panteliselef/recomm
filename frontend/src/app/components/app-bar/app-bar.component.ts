import {Component, Input, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Component({
    selector: 'app-bar',
    templateUrl: './app-bar.component.html',
    styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent implements OnInit {

    @Input('title') pageTitle: string;
    @Input('img') imgSrc: string;
    @Input('hasImage') hasImage: boolean;
    @Input('onImageClick') onImageClick: Function;
    @Input('leadingIcon') leadingIconName: string;
    @Input('trailingIcon') trailingIconName: string;
    @Input('onTrailingIconClick') onTrailingIconClick: Function;

    constructor(private location: Location, private router: Router) {
    }

    ngOnInit() {
    }

    goBack(): void {
        this.location.back();
    }


    onClickImage() {
        this.onImageClick.call(this);
    }

    onClickTrailingIcon() {
        this.onTrailingIconClick.call(this);
    }
}
