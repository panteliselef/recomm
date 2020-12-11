import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'progressive-image',
    templateUrl: './progressive-image.component.html',
    styleUrls: ['./progressive-image.component.scss',],
    encapsulation: ViewEncapsulation.None
})
export class ProgressiveImageComponent implements OnInit {

    loading: boolean = true
    @Input('src') source: string
    @Input('onClick') onImgClick: Function;
    @Input('width') myWidth: string | number;
    gif: Object;

    constructor(private http: HttpClient) {}


    async ngOnInit() {}

    onLoad() {this.loading = false;}

    onClickImage() {
        if(this.onImgClick) this.onImgClick.call(this);
    }

}
