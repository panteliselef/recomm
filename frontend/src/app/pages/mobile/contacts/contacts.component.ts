import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'ami-fullstack-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

    private contactA = {
        photoURL: 'https://media.vanityfair.com/photos/560885bdc6c790934bfc03a7/1:1/w_960,h_960,c_limit/adam-sandler-hotel-transylvania-box-office.jpg',
        name: 'Adam Sandler'
    }

    private contactB = {
        photoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ben_Affleck_by_Gage_Skidmore_3.jpg/220px-Ben_Affleck_by_Gage_Skidmore_3.jpg',
        name: 'Ben Affleck'
    }

    private contactE = {
        photoURL: 'https://images.edexlive.com/uploads/user/imagelibrary/2020/6/11/original/gettyimages-485360238.jpg',
        name: 'Emma Watson'
    }

    contacts = [
        {
            firstLetter: 'A',
            people: Array(3).fill(this.contactA)
        }, {
            firstLetter: 'B',
            people: Array(4).fill(this.contactB)
        },
        {
            firstLetter: 'E',
            people: Array(2).fill(this.contactE)
        }

    ]

    totalContacts = this.contacts.reduce((accumulator, currentValue) => accumulator + currentValue.people.length,0);

    favContacts: Object[];

    constructor() {
    }

    ngOnInit() {

        this.favContacts = Array(10).fill(this.contactA);

    }

}
