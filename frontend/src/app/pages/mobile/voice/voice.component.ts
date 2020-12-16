import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ChatsService, SmartSpeakerService, SocketsService, UsersService} from '../../../global/services';
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
    chats: ChatModel[];
    contacts: { chatId: string; user: UserModel }[] = [];
    errorMsg = '';

    constructor(private zone: NgZone,
                private route: ActivatedRoute,
                private chatsService: ChatsService,
                private socketService: SocketsService,
                private speaker: SmartSpeakerService,
                private router: Router,
                private usersService: UsersService) {
    }


    async chatsInfo() {



        // this.chats = await Promise.all<ChatModel>(this.chats.map(async (chat: ChatModel) => {
        //
        //     let member: UserModel;
        //     if (chat.participants.length === 2) {
        //         console.log(chat.participants);
        //         const partId = chat.participants.filter(id => id !== this.me._id)[0];
        //         member = await this.usersService.getById(partId).toPromise();
        //     }
        //     return new ChatModel({
        //         ...chat, displayName: member.getFullName(), photoUrl: member.getPhoto()
        //     });
        // }));

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
        this.chats = await Promise.all<ChatModel>(this.me.chat_ids.map(async (chatId: string, index: number) => {
            return await this.chatsService.getById(chatId).toPromise();
        }));
        console.log(this.contacts);
        this.speaker.addSmartCommand(['call *'], this.videoCall.bind(this));
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
        const chat = this.chats.filter(chat => chat.displayName).find(chat => {
            return chat.displayName.toLowerCase() === word.toLowerCase();
        });

        const showError = (error) => {
            return () => {
                return this.errorMsg = error;
            };
        };


        if (chat) {
            this.socketService.sendMessage(`videocall/join`, {
                chat: chat._id,
                member: this.me._id,
                videoOptions: {hasCamera: false, isMuted: false},
                device: 'TV'
            });

            await this.zone.run(showError(`Calling ${word}`));
        } else {


            await this.zone.run(showError(`Unable to find ${word}`));
        }
    }

    async searchFor(index, word) {

        this.speaker.speak('See search results', async () => {
            const redirect = (wordW: string) => {
                return async () => {
                    return await this.router.navigate(['/mobile', 'search'], { queryParams: {q: wordW}});
                };
            };

            await this.zone.run(redirect(word));
        });
    }

    async showImages(index, word) {
        const l = this.contacts.find(contact => {
            return contact.user.fname.toLowerCase() === word.toLowerCase();
        });
        if (l) {
            this.errorMsg = `Cannot find contact with name ${word}`;
        }

        const redirect = (chatId) => {
            return async () => {
                return await this.router.navigate(['/mobile', 'chats', chatId, 'edit', 'browse-images']);
            };
        };

        await this.zone.run(redirect(l.chatId));
    }
}
