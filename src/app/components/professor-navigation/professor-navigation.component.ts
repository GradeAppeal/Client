import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  @Input()
  customTitle: string;
  constructor(private router: Router, private supabase: SupabaseService) {}
  showChat: boolean = false;

  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'Appeal Inbox';
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateToPage(route: string) {
    this.router.navigate([route]);
  }

  async ngOnInit() {
    const students = await this.supabase.fetchStudents(1);
    console.log({ students });
  }

  onIsChat(customTitle: string) {
    // Do something with the customTitle received from app-chat
    if (customTitle == 'true') {
      console.log('Received customTitle:', customTitle);
      this.selectedTab = 'Chat';
    } else {
      this.selectedTab = 'Appeals Inbox';
    }
  }
}
