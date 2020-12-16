import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChatModel, ParticipantWithLiveStatus, ParticipantWithPosNumber} from "../../../global/models";
import {SocketsService} from "../../../global/services";

@Component({
    selector: 'ami-fullstack-manage-tv-layout',
    templateUrl: './manage-tv-layout.component.html',
    styleUrls: ['./manage-tv-layout.component.scss']
})
export class ManageTvLayoutComponent implements OnInit {
    @Output('onExit') onExit: EventEmitter<any> = new EventEmitter();
    @Input('inCallChat') chat: ChatModel;
    @Input('members') members: (ParticipantWithPosNumber | ParticipantWithLiveStatus) [];
    positions0: Array<ParticipantWithPosNumber | ParticipantWithLiveStatus> = []
    positions1: Array<ParticipantWithPosNumber| ParticipantWithLiveStatus> = []
    positions2: Array<ParticipantWithPosNumber| ParticipantWithLiveStatus> = []
    positions3: Array<ParticipantWithPosNumber| ParticipantWithLiveStatus> = []
    positions4: Array<ParticipantWithPosNumber| ParticipantWithLiveStatus> = []
    positions5: Array<ParticipantWithPosNumber | ParticipantWithLiveStatus> = []
    positions6: Array<ParticipantWithPosNumber| ParticipantWithLiveStatus> = []


    positions: Array<ParticipantWithPosNumber | ParticipantWithLiveStatus>[] = [this.positions0,this.positions1,this.positions2,this.positions3,this.positions4,this.positions5,this.positions6]


    idsInside: Set<string> = new Set<string>([]);

    allPosIds: string[] = Array(7).fill('').map((item,index )=>`pos${index}`)


    constructor(private socketService: SocketsService) {
        // console.log(this.positions)
        // this.idsInside = {'lol':'ad'};
        console.log(this.idsInside)
    }

    ngOnInit() {
    }

    drop(event: CdkDragDrop<ParticipantWithLiveStatus[], any>, pos: number) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else if(event.previousContainer.id === 'usersList') {
            if(this.positions[pos].length === 1) {
                this.positions[pos].length = 0
            }

            copyArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);

            this.emitUserUpdate(event.container.data[0],pos)
            this.idsInside.add(event.container.data[0].user._id)
        }else {
            if(this.positions[pos].length === 1) {
                this.positions[pos].length = 0
            }
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);

            this.emitUserUpdate(event.container.data[0],pos)
            this.idsInside.add(event.container.data[0].user._id)
        }
    }

    /** Predicate function that only allows even numbers to be dropped into a list. */
    evenPredicate = (item: CdkDrag<ParticipantWithLiveStatus>) => {
        // console.log(this.idsInside)
        if(item.data) return !this.idsInside.has(item.data.user._id) && item.data.isInCall
        return true
    }


    emitUserUpdate(data: ParticipantWithLiveStatus | ParticipantWithPosNumber,position:number){

        let pos: number[];
        if(position == 0) {
            pos = [0,0]
        }else if(position == 1) {
            pos = [0,1]
        }else {
            pos = [1,position-2]
        }
        console.log('user changed',data)
        console.log(this.chat._id)

        this.socketService.sendMessage(`videocall/update-position`, {
            chat: this.chat._id,
            member: data.user._id,
            position: pos
        })
    }


    getOtherIds(id: string) {
        return this.allPosIds.filter(_id=> _id !== id)
    }


    async randomizePositions() {
        let counter = 0;
        for(let i = 0; i<this.members.length; i++ ) {
            const l: any = this.members[i];
            if(!l.isInCall) {
                counter++;
                continue;
            }
            if( i-counter  < Math.min(7,this.members.length)) {
                console.log(i-counter)
                this.positions[i-counter][0] = this.members[i];
                this.emitUserUpdate(this.positions[i-counter][0],i-counter)
            }

        }
        // console.log(this.members);
    }
}
