import {Component, Input, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChatModel, ParticipantWithLiveStatus} from "../../../global/models";
import {SocketsService} from "../../../global/services";

@Component({
    selector: 'ami-fullstack-manage-tv-layout',
    templateUrl: './manage-tv-layout.component.html',
    styleUrls: ['./manage-tv-layout.component.scss']
})
export class ManageTvLayoutComponent implements OnInit {

    @Input('inCallChat') chat: ChatModel;
    positions0: Array<ParticipantWithLiveStatus> = []
    positions1: Array<ParticipantWithLiveStatus> = []
    positions2: Array<ParticipantWithLiveStatus> = []
    positions3: Array<ParticipantWithLiveStatus> = []
    positions4: Array<ParticipantWithLiveStatus> = []
    positions5: Array<ParticipantWithLiveStatus> = []
    positions6: Array<ParticipantWithLiveStatus> = []


    positions: Array<ParticipantWithLiveStatus[]> = [this.positions0,this.positions1,this.positions2,this.positions3,this.positions4,this.positions5,this.positions6]


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
            this.findAndRemoveFromLayout(event.container.data[0])

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

            this.findAndRemoveFromLayout(event.container.data[0])
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
        if(item.data) return !this.idsInside.has(item.data.user._id)
        return true
    }


    emitUserUpdate(data: ParticipantWithLiveStatus,position:number){

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
}
