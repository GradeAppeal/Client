import { Component } from '@angular/core';

@Component({
  selector: 'app-professor-dashboard',
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.scss']
})
export class ProfessorDashboardComponent {
  selectedTab = "";
  selectTab(tab: string){
    
  }
}
