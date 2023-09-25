import { ViewEncapsulation } from '@angular/compiler';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

export interface AppealInbox {
  prefix: string,            //course prefix
  code: number,              //course number
  student_id: number,         
  student_name: string,
  assignment_id: number,
  appeal_id: number,
  created_at: Date,
  appeal_text: string,
  is_open: boolean
}
export interface Courses {
  
}
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss']
})


export class ProfessorAppealInboxComponent {
  inboxAppeals: AppealInbox[];
  appeals: any[];
  appeal: any;
  selectedAppeal: any;
  date = new Date();
  appeal1 = {
    name: 'Bob Bubby',
    course_name: 'Math',
    section: 'B',
    assignment_id: 'Test1',
    grade_received: 'F',
    message_text: 'HELP I FAILED PLEASE DON:T FAIL ME',
    email: "bobbubby@gmail.com"
  }
  appeal2 = {
    name: 'Sam Hoogewind',
    course_name: 'Stats',
    section: 'A',
    assignment_id: 'Quiz1',
    grade_received: 'F',
    message_text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Consequat ac felis donec et odio pellentesque diam volutpat. At lectus urna duis convallis convallis. Sagittis purus sit amet volutpat consequat mauris nunc congue nisi. Et netus et malesuada fames ac turpis. Egestas pretium aenean pharetra magna ac placerat vestibulum. Pharetra convallis posuere morbi leo urna molestie at elementum. Pretium quam vulputate dignissim suspendisse. Adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum. Convallis convallis tellus id interdum velit laoreet. Natoque penatibus et magnis dis parturient montes.',
    email: "samhoogewind@gmail.com"
  }
  appeal3 = {
    name: 'Justin Voss',
    course_name: 'CS112',
    section: 'C',
    assignment_id: 'Test4',
    grade_received: 'F',
    message_text: 'I failed the test. Let me redo it. Now.',
    email: "jmanvoss1@gmail.com"
  }
  constructor(private readonly supabase: SupabaseService, private router: Router) {
    this.inboxAppeals = [];
    this.appeals = [this.appeal1, this.appeal2, this.appeal3];
    this.appeal = {
      name: '',
      course_name: '',
      assignment_id: '',
      grade_received: '',
    }
    this.selectedAppeal = {
      name: null,
      course_name: null,
      assignment_id: null,
      grade_received: null,
    }
  }
  async ngOnInit(): Promise<void> {
    //WAITING to add this until supabase is set up
    // this.inboxAppeals = await this.supabase.fetchInboxAppeals(1);
    // console.log(this.inboxAppeals);
    // encapsulation: ViewEncapsulation.None;
  }
  // Function to select an appeal
  selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.selectedAppeal = appeal
  }
}
