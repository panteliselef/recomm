import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
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
    contacts: { chatId: string; user: UserModel }[] = [];

    constructor(private zone: NgZone,
                private route: ActivatedRoute,
                private chatsService: ChatsService,
                private speaker: SmartSpeakerService,
                private router: Router,
                private usersService: UsersService) {
    }


    async chatsInfo() {

        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chat_id: string, index: number) => {
            return await this.chatsService.getById(chat_id).toPromise();
        }));

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
        this.contacts = await Promise.all(this.me.contacts.map(async (contact) => {
            return {
                user: await this.usersService.getById(contact.contact_id).toPromise(),
                chatId: contact.chat_id
            };
        }));
        console.log(this.contacts);
        this.speaker.addSmartCommand(['join videoCall * on smartphone', 'join videoCall * on Tv'], this.videoCall.bind(this));
        this.speaker.addSmartCommand('search for *', this.searchFor.bind(this));
        this.speaker.addSmartCommand('images of *', this.showImages.bind(this));
        this.allUsers = await this.usersService
            .getAll()
            .toPromise();
        this.allUsers = this.allUsers.filter<UserModel>((user: UserModel): user is UserModel => {
            return user._id !== this.me._id;
        });

    }

    async goToChatImages(filename: string) {
        await this.router.navigate(['/mobile/chats/' + filename + '/edit/browse-images']);
    }
    async videoCall(index, word) {
        // word is the name of videoCall
        // check if videoCall exist
        // if (!word) then
        this.speaker.speak('the videoCall with name ' + word + 'doesnt exist');
        // if (word)
        // if index == 0 then go to smartphone
        // if index == 1 then go to Tv
    }

    async searchFor(index, word) {
        // word is the name of contact
        // check if contact exist
        // if (!word) then

        this.speaker.speak('See search results', async () => {
            const redirect = (wordW: string) => {
                return async () => {
                    return await this.router.navigate(['/mobile', 'search'],{ queryParams: {q: wordW}});
                };
            };

            await this.zone.run(redirect(word));
        });





        // if (word)
    }

    async showImages(index, word) {
        const l = this.contacts.find(contact => {
            return contact.user.fname.toLowerCase() === word.toLowerCase();
        });

        const redirect = (chatId) => {
            return async () => {
                return await this.router.navigate(['/mobile', 'chats', chatId, 'edit', 'browse-images']);
            };
        };

        await this.zone.run(redirect(l.chatId));
    }
}
