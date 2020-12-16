import {Component, OnInit} from '@angular/core';
import {ChatModel, UserModel} from "../../../global/models";
import {ChatsService, UsersService} from "../../../global/services";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'ami-fullstack-add-people',
    templateUrl: './add-people.component.html',
    styleUrls: ['./add-people.component.scss', '../new-chat/new-chat.component.scss', '../search/search.component.scss']
})
export class AddPeopleMobileComponent implements OnInit {
    private me: UserModel;
    private chat: ChatModel;
    private allUsers: UserModel[] | any;

    constructor(private usersService: UsersService,
                private chatService: ChatsService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    async ngOnInit() {
        const chatId = this.route.snapshot.params.id;
        this.me = await this.usersService.getMe();
        this.me = await this.usersService.getById(this.me._id).toPromise();
        await this.getAllUsers(chatId);
    }

    private async getAllUsers(chatId: string) {

        this.chat = await this.chatService.getById(chatId).toPromise();

        this.allUsers = await Promise.all(this.me.contacts.filter((user) => {
            return !this.chat.participants.includes(user.contact_id)
        }).map(async user=> {
            return await this.usersService.getById(user.contact_id).toPromise()
        }))
        this.allUsers = this.allUsers.map(user => {
            return {
                user,
                isSelected: false
            }
        })

    }

    markAsSelected(_id: string) {

        const index = this.allUsers.findIndex(item => item.user._id === _id);

        this.allUsers[index].isSelected = !this.allUsers[index].isSelected

    }

    async addPeople() {

        const l: UserModel[] = this.allUsers.filter(member=> {
            return member.isSelected;
        }).map(member => member.user);

        for (const user of l) {
            user.chat_ids.push(this.chat._id);
            this.chat.participants.push(user._id);
            await this.usersService.update(user).toPromise();
        }

        await this.chatService.update(this.chat).toPromise();


        await this.router.navigate(['../'], {relativeTo: this.route})


        console.log(l)
    }


}
