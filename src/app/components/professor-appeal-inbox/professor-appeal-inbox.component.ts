import { ViewEncapsulation } from '@angular/compiler';
import { Component, Output, EventEmitter } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import {
  ProfessorAppeal,
  ProfessorCourse,
} from 'src/app/shared/professor.interface';

interface CombinedData {
  code: number;
  id: number;
  name: string;
  prefix: string;
  section: string;
  semester: 'FA' | 'SP' | 'SU';
  year: number;
  appeal_id: number;
  appeal_text: string;
  assignment_id: number;
  created_at: Date;
  is_open: boolean;
  student_id: number;
  student_name: string;
}


@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat: EventEmitter<string> = new EventEmitter<string>();
  //inboxAppeals: AppealInbox[];
  appeals: any[];
  appeal: any;
  email = "abc123@gmail.com"
  showChat: boolean = false;
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
  professorCourse!: ProfessorCourse[];
  selectedAppeal : ProfessorAppeal;
  constructor(private supabase: SupabaseService) {
  }
  async ngOnInit(): Promise<void> {
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
    this.professorCourse = await this.supabase.fetchProfessorCourses(1);
    console.log(this.professorAppeals);
    this.selectedAppeal = this.professorAppeals[0];
    this.fixDate();
  }
  fixDate(){
  }
  // ProfessorCourse {
  //   code: number;  
  //   id: number;
  //   name: string;          // 
  //   prefix: string;
  //   section: string;          //
  //   semester: 'FA' | 'SP' | 'SU';
  //   year: number;
  // }

  // ProfessorAppeal {
  //   appeal_id: number;
  //   appeal_text: string;
  //   assignment_id: number;     //
  //   code: number;
  //   created_at: Date;
  //   is_open: boolean;
  //   prefix: string;
  //   student_id: number;
  //   student_name: string;    //
  // }

  // Function to select an appeal
  selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.selectedAppeal = appeal;
    console.log(this.selectedAppeal);
  }
  chat(appealID: number) {
    this.isChat.emit(appealID.toString());
   }
  
}
