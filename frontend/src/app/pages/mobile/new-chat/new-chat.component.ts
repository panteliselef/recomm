import {Component, OnInit} from '@angular/core';
import {ChatsService, UsersService} from "../../../global/services";
import {ChatModel, UserModel} from "../../../global/models";
import {FileReaderEvent} from "../../../global/interfaces/file-reader-event.interface";
import {HttpClient} from "@angular/common/http";
import {environment} from 'src/environments/environment';
import {Router} from "@angular/router";

@Component({
    selector: 'ami-fullstack-new-chat',
    templateUrl: './new-chat.component.html',
    styleUrls: ['./new-chat.component.scss', '../search/search.component.scss']
})
export class NewChatComponent implements OnInit {
    me: UserModel;
    usersToShow: any;
    allUsers: Array<{ user: UserModel, isSelected: boolean }> = [];
    searchStr: string = '';


    usersSelected: number = 0;
    toCreateGroupChat: boolean = false;
    isFinalPageVisible: boolean = false;

    numbers = Array(10).fill(4); // [4,4,4,4,4]
    previewPhotoSrc: string;
    imgToUpload: File;

    groupName: string = '';
    private hostURl: string;

    constructor(private usersService: UsersService, private chatsServices: ChatsService,private http: HttpClient,private router: Router) {
        this.hostURl = environment.host;
    }

    async ngOnInit() {
        this.me = await this.usersService.getMe();
        await this.getAllUsers();
    }

    filterSearchResults(value) {
        this.usersToShow = this.allUsers.filter((item: { user: UserModel, isSelected: boolean }) => {
            return item.user.getFullName().toLowerCase().includes(value.toLowerCase());
        })
    }

    private async getAllUsers() {
        try {

            let l = await Promise.all<UserModel>(this.me.contacts.map(async (contact) => {
                return await this.usersService.getById(contact.contact_id).toPromise();
            }));

            // Exclude myself
            l = l.filter<UserModel>((user: UserModel): user is UserModel => {
                return user._id !== this.me._id
            })
            this.allUsers = l.map(user => {
                return {
                    user,
                    isSelected: false
                }
            })

            this.usersToShow = Array.from(this.allUsers);

        } catch (e) {
            console.error(e);
        }
    }

    clearResults() {
        this.usersToShow = Array.from(this.allUsers);
        this.searchStr = '';
    }

    markAsSelected(_id: string) {
        if (!this.createGroupChat) return

        const index = this.allUsers.findIndex(item => item.user._id === _id);

        this.allUsers[index].isSelected = !this.allUsers[index].isSelected
        if (this.allUsers[index].isSelected) this.usersSelected++
        else this.usersSelected--

    }

    showFinalPage() {
        this.isFinalPageVisible = true;
    }

    handleImageInput(file: File) {
        this.previewPhotoSrc = ''


        const fileExt:string = file.name.split('.').pop()
        // console.log(files[i])
        if(fileExt === 'png' || fileExt === 'jpg') {
            const reader = new FileReader();

            reader.onload = (e:FileReaderEvent<FileReader>) => {
                this.previewPhotoSrc = e.target.result;
                console.log(e.target.result);
            }

            reader.readAsDataURL(file); // convert to base64 string
        }

        this.imgToUpload = file

    }


    getSelectedUsers() {
        return this.allUsers.filter(item=> item.isSelected);
    }


    async uploadFile(file: File) {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        return await this.http.post(`${this.hostURl}/api/files/upload`, formData).toPromise<any>();
    }

    async createGroupChat() {

        const uploadedPhoto = await this.uploadFile(this.imgToUpload)


        const participants: UserModel[] = [
            ...this.getSelectedUsers().map(item=>item.user),
            this.me
        ]
        const newChat = new ChatModel({
            displayName: this.groupName,
            photoUrl: `${this.hostURl}/api/files/download/${uploadedPhoto.filename}`,
            participants: participants.map(user=>user._id)
        })
        const newChatCreated = await this.chatsServices.create(newChat).toPromise();



        let l = await Promise.all<UserModel>(participants.map(async (user: UserModel) => {
            user.chat_ids.push(newChatCreated._id)
            return await this.usersService.update(user).toPromise()
        }));

        console.log("Complete")
        await this.router.navigate(['/mobile/chats'])
    }
}
