import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fullstack-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit {

  message = {
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    senderName: 'Emma Bailey',
    message: 'Hello, how are you ?',
    day: 'Tue',
  }
  messages: Object[];

  constructor() { }

  ngOnInit() {

    this.messages = Array(20).fill(this.message);


  }

}
