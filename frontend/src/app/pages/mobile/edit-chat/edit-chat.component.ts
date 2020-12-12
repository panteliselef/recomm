import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'ami-fullstack-edit-chat',
    templateUrl: './edit-chat.component.html',
    styleUrls: ['./edit-chat.component.scss']
})
export class EditChatComponent implements OnInit {

    constructor(private router: Router, private route: ActivatedRoute) {
    }

    async goToBrowseImages() {
        await this.router.navigate(['browse-images'], {relativeTo: this.route});
    }

    async goToBrowseDocuments() {
        await this.router.navigate(['browse-documents'], {relativeTo: this.route});
    }

    ngOnInit() {
    }

}
