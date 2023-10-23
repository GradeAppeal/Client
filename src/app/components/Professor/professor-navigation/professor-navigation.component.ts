import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { setTitle } from 'src/app/shared/functions/general.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'Appeal Inbox';
  title: string = 'Appeal Inbox';
  constructor(private router: Router, private supabase: SupabaseService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.title = setTitle(event.url);
      }
    });
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async ngOnInit() {
    const students = await this.supabase.fetchStudents(1);
    console.log({ students });
  }

  //checks the url following either professor or student, sets the title of the Banner
  // setTitle(url: string) {
  //   const segments = url.split('/');
  //   let title = '';

  //   for (let i = 0; i < segments.length; i++) {
  //     if (segments[i] === 'professor' || segments[i] === 'student') {
  //       title = segments
  //         .slice(i + 1)
  //         .map((segment) => this.capitalizeWords(segment))
  //         .join(' ');
  //       break;
  //     }
  //   }
  //   this.title = title;
  // }

  // //fixes the formatting of the title
  // capitalizeWords(str: string): string {
  //   return str
  //     .split('-')
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');
  // }
}
