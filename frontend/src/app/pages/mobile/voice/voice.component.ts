import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChatsService, SmartSpeakerService, UsersService} from '../../../global/services';
import {ChatModel, UserModel} from '../../../global/models';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
    selector: 'ami-fullstack-voice',
    templateUrl: './voice.component.html',
    styleUrls: ['./voice.component.scss']
})
export class VoiceComponent implements OnInit {

    me: UserModel;
    public allUsers: UserModel[];
    public user: UserModel;
    phrase: string;
    chats: ChatModel[];

    constructor(private route: ActivatedRoute,
                private chatsService: ChatsService,
                private users: UsersService,
                private speaker: SmartSpeakerService,
                private router: Router,
                private usersService: UsersService) {
    }


    async chatsInfo() {

        // tslint:disable-next-line:variable-name
        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id: string, index: number) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

        // tslint:disable-next-line:variable-name
        this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {

            let member: UserModel;
            if (chat.participants.length === 2) {
                console.log(chat.participants);
                const partId = chat.participants.filter(id => id !== this.me._id)[0];
                member = await this.usersService.getById(partId).toPromise();
            }
            return new ChatModel({
                ...chat, displayName: member.getFullName(), photoUrl: member.getPhoto()
            });
        }));

        await this.goToChatImages(this.chats[0]._id);
    }

    private async getUser(word: string) {
        try {
            this.me = await this.users.getMe();
            this.allUsers = await this.users
                .getAll()
                .toPromise();
            this.allUsers = this.allUsers.filter<UserModel>((user: UserModel): user is UserModel => {
                return user._id !== this.me._id;
            });

            this.user = this.allUsers.find<UserModel>((user: UserModel): user is UserModel => {
                return user.fname.toLowerCase() === word;
            });
        } catch (e) {
            console.error(e);
        }
    }

    async goToProfile() {
        await this.router.navigate(['/mobile', 'profile']);
    }


    async ngOnInit() {
        this.me = await this.usersService.getMe();
    }

    async goToChatImages(filename: string) {
        await this.router.navigate(['/mobile/chats/' + filename + '/edit/browse-images']);
    }

    startAction() {

        const videoCall = (index, word) => {
            // word is the name of videoCall
            // check if videoCall exist
            // if (!word) then
            this.speaker.speak('the videoCall with name ' + word + 'doesnt exist');
            // if (word)
            // if index == 0 then go to smartphone
            // if index == 1 then go to Tv
        };

        const searchFor = (index, word) => {
            // word is the name of contact
            // check if contact exist
            // if (!word) then

            console.log(word);

            this.getUser(word).then(r =>
                this.phrase = 'search for ' + word
            );


            this.speaker.speak('the contact with name ' + word + 'doesnt exist');
            // if (word)
        };

        const showImages = (index, word) => {
            // word is the name of chat
            // check if chat exist
            // if (!word) then

            this.chatsInfo();

            // console.log(this.chats);

            // this.speaker.speak('the chat with name ' + word + 'doesnt exist');
            // if (word)
        };

        this.speaker.addSmartCommand(['join videoCall * on smartphone', 'join videoCall * on Tv'], videoCall);
        this.speaker.addSmartCommand('search for *', searchFor);
        this.speaker.addSmartCommand('show images of *', showImages);
    }
}
