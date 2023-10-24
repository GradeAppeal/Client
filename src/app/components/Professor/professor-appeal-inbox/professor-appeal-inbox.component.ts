import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat = new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  //inboxAppeals: AppealInbox[];
  appeals: any[];
  appeal: any;
  email = 'abc123@gmail.com';
  showChat: boolean = false;
  date = new Date();

  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  currentAppeal: ProfessorAppeal;
  fetchedAppeals = false;
  user: any;

  constructor(
    private router: Router,
    private authService: SupabaseService,
    private professorService: ProfessorService
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      const userId = (await this.authService.getUserId()) as string;
      this.professorAppeals = await this.professorService.fetchProfessorAppeals(
        userId
      );
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        userId
      );
      this.currentAppeal = this.professorAppeals[0];
      this.fetchedAppeals = true;
    } catch (err) {
      console.log(err);
    }
  }

  formatTimestamp(timestamp: Date): { date: string; time: string } {
    const d = new Date(timestamp);
    const date = d.toDateString();
    const time = d.toTimeString().split(' ')[0];
    return { date, time };
  }

  // Function to select an appeal
  selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.currentAppeal = appeal;
    console.log(this.currentAppeal);
  }

  composeMessage() {}
  chat(appeal: ProfessorAppeal) {
    this.isChat.emit({ professorAppeal: appeal });
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
