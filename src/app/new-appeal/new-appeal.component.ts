import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentCourse } from '../shared/student.interface';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-new-appeal',
  templateUrl: './new-appeal.component.html',
  styleUrls: ['./new-appeal.component.scss']
})
export class NewAppealComponent implements OnInit {
  email = "sth6@calvin.edu";
  course_name : string = "";
  selected_assignment : string;
  appeal : string;
  constructor(private router: Router, private route: ActivatedRoute) { }

  navigateToHome() {
    this.router.navigate(['/'])
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.course_name = params['course_name'];
    });
  }

  getSelectedAssignment () {
    return this.selected_assignment;
  }

  getAppeal () {
    return this.appeal;
  }
}
