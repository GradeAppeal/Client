import { Component, Input } from '@angular/core';
import {Router} from '@angular/router';

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
  appeal_id = "";

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

  onIsChat(appeal_id: string) {
    if (appeal_id){
      console.log('Received assignment:', appeal_id);
      this.appeal_id = appeal_id;
      this.selectedTab = "Chat";
    }
  }
  
}
