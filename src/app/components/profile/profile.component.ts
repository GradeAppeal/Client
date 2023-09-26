import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent {

  constructor(
    private router: Router
    )
    {}
  // pull courses from database
  courses = [{courseNumber: "CS336", courseName: "Web Development"},
  {courseNumber: "MATH251", courseName: "Discrete Math"},
  {courseNumber: "CS112", courseName: "Intro to Data Structures"},
  {courseNumber: "CS262", courseName: "Software Development"}]

  // pull students from selected class
  students = [{name: 'Sam Hoogewind', isGrader: false},
  {name: 'Ael Lee', isGrader: true},
  {name: 'Justin Voss', isGrader: false},
  {name: 'Tyler Voss', isGrader: false}]

  currentPage = "view"

  // let editStudents = dialog.open(EditStudentsComponent, {
  //   height: '400px',
  //   width: '600px',
  // });

  swapView(page: string) {
    this.currentPage = page;
  }
}
