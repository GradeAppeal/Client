import { ViewEncapsulation } from '@angular/compiler';
import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorAppeal } from 'src/app/shared/professor.interface';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  //inboxAppeals: AppealInbox[];
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
  };
  appeal2 = {
    name: 'Sam Hoogewind',
    course_name: 'Stats',
    section: 'A',
    assignment_id: 'Quiz1',
    grade_received: 'F',
  };
  appeal3 = {
    name: 'Justin Voss',
    course_name: 'CS112',
    section: 'C',
    assignment_id: 'Test4',
    grade_received: 'F',
  };
  professorAppeals!: ProfessorAppeal[];
  constructor(private supabase: SupabaseService) {
    this.appeals = [this.appeal1, this.appeal2, this.appeal3];
    this.appeal = {
      name: '',
      course_name: '',
      assignment_id: '',
      grade_received: '',
    };
    this.selectedAppeal = {
      name: null,
      course_name: null,
      assignment_id: null,
      grade_received: null,
    };
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
    this.selectedAppeal = appeal;
  }
  composeMessage() {}
}
