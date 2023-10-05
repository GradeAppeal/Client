import { Component, Input } from '@angular/core';
import {Router} from '@angular/router';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss']
})
export class ProfessorNavigationComponent {
  @Input()
    customTitle: string;
  constructor(private router: Router) { }
  showChat: boolean = false;
  appeal_id: number;
  student_id: number;
  current_appeal: ProfessorAppeal;

  email = "victor.norman@calvin.edu";
  selectedTab: string = "Appeal Inbox";
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateToPage(route: string){
    this.router.navigate([route])
  }
  
  ngOnInit() {
  }

  onIsChat(payload: { professorAppeal: ProfessorAppeal }) {
    const appeal = payload.professorAppeal;
    if (appeal){
      this.appeal_id = appeal['appeal_id'];
      this.student_id = appeal['student_id'];
      this.current_appeal = appeal;
      this.selectedTab = "Chat";
    }
  }
  
}
