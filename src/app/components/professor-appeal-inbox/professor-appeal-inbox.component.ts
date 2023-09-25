import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorAppeal } from 'src/app/shared/professor.interface';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  appeals: any[];

  appeal: any;
  selectedAppeal: any;
  appeal1 = {
    name: 'Bob',
    course_name: 'Math',
    assignment_id: 'Test1',
    grade_received: 'F',
  };
  appeal2 = {
    name: 'Sam',
    course_name: 'Stats',
    assignment_id: 'Quiz1',
    grade_received: 'F',
  };
  appeal3 = {
    name: 'Justin',
    course_name: 'CS112',
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
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
    console.log(this.professorAppeals);
  }
  // Function to select an appeal for editing
  selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.selectedAppeal = appeal;
  }
  composeMessage() {}
}
