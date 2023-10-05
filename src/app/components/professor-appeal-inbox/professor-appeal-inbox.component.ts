import { HttpParams } from '@angular/common/http';
import { ViewEncapsulation } from '@angular/compiler';
import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import {
  ProfessorAppeal,
  ProfessorCourse,
} from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat= new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  //inboxAppeals: AppealInbox[];
  appeals: any[];
  appeal: any;
  email = 'abc123@gmail.com';
  showChat: boolean = false;
  date = new Date();

  professorAppeals!: ProfessorAppeal[];
  professorCourse!: ProfessorCourse[];
  selectedAppeal: ProfessorAppeal;
  fetchedAppeals = false;

  constructor(private supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    try {
      this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
      this.professorCourse = await this.supabase.fetchProfessorCourses(1);
      this.selectedAppeal = this.professorAppeals[0];
      this.fetchedAppeals = true;
      this.fixDate();
    } catch (err) {
      console.log(err);
    }
  }
  fixDate() {}

  // Function to select an appeal
  selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.selectedAppeal = appeal;
    console.log(this.selectedAppeal);
  }

  composeMessage() {}
  chat(appeal: ProfessorAppeal) {
    const changeToChat = 'true';
    this.isChat.emit({professorAppeal: appeal});
  }
}
