import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'ami-fullstack-add-people',
    templateUrl: './add-people.component.html',
    styleUrls: ['./add-people.component.scss']
})
export class AddPeopleComponent implements OnInit {


    testArr = Array(10).fill(5)

    constructor() {
    }

    ngOnInit() {
    }

}
