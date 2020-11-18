import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'ami-fullstack-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

    date: Date;
    calendar: { current: { date: number; month: number; year: number }; relative: { date: number; month: number; year: number } } = {
        current: undefined,
        relative: undefined
    }

    weekDates = []


    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    private times: number = 0;



    constructor() {
        this.date = new Date();

        this.calendar = {
            current: {
                date: this.date.getDate(),
                month: this.date.getMonth(),
                year: this.date.getFullYear()
            },

            relative: {
                date: this.date.getDate(),
                month: this.date.getMonth(),
                year: this.date.getFullYear()
            }
        }


        this.calculateWeekCalendar(this.date)

    }





    events = [
        {
            startTime: '9:00AM',
            endTime: '10:00AM',
            chatName: 'Team Project Meeting',
            hasStarted: true,
        },
        {
            startTime: '12:00PM',
            endTime: '14:00PM',
            chatName: 'Meeting with Professor',
        },
        {
            startTime: '18:00PM',
            endTime: '19:00PM',
            chatName: 'Meeting with Professor',
        },
        {
            startTime: '19:00PM',
            endTime: '21:00PM',
            chatName: 'Meeting with Professor',
        },
        {
            startTime: '19:00PM',
            endTime: '21:00PM',
            chatName: 'Meeting with Professor',
        },
        {
            startTime: '19:00PM',
            endTime: '21:00PM',
            chatName: 'Meeting with Professor',
        },
        {
            startTime: '19:00PM',
            endTime: '21:00PM',
            chatName: 'Meeting with Professor',
        },
    ]

    ngOnInit() {

    }

    isEqualToDate(d1: Date, d2: Date) {
        return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear();
    }

    calculateWeekCalendar(date: Date) {

        const todayDate = new Date(date.getFullYear(),date.getMonth(),date.getDate()).getDate()
        const todayDay = new Date(date.getFullYear(),date.getMonth(),date.getDate()).getDay()

        this.weekDates.length = 0 ;

        for (let i = -todayDay; i<0 ; i++) {
            this.weekDates.push(new Date(date.getFullYear(),date.getMonth(),todayDate+i))
        }
        for (let i= 0; i< 7-todayDay; i++) {
            this.weekDates.push(new Date(date.getFullYear(),date.getMonth(),todayDate+i))
        }

        this.calendar.relative.date = todayDate;
        this.calendar.relative.month = date.getMonth();
        this.calendar.relative.year = date.getFullYear();
    }

    prevWeek() {
        this.times--;
        this.calculateWeekCalendar(new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate() + (this.times*7) ))
    }

    nextWeek() {
        this.times++;
        this.calculateWeekCalendar(new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate() + (this.times*7) ))
    }
}
