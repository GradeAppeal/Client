import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditStudentsPopUpComponent } from 'src/app/components/Student/edit-students-pop-up/edit-students-pop-up.component';

export interface Student {
  studentName: string;
  isGrader: boolean;
}
export interface Course {
  courseNumber: string;
  courseName: string;
  students: Student[];
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  constructor(private router: Router, private dialog: MatDialog) {}
  // pull courses and students from database
  courses: Course[] = [
    {
      courseNumber: 'CS336',
      courseName: 'Web Development',
      students: [
        { studentName: 'Sam Hoogewind', isGrader: false },
        { studentName: 'Ael Lee', isGrader: true },
        { studentName: 'Justin Voss', isGrader: false },
        { studentName: 'Tyler Voss', isGrader: false },
      ],
    },
    {
      courseNumber: 'MATH251',
      courseName: 'Discrete Math',
      students: [
        { studentName: 'Joe Smith', isGrader: true },
        { studentName: 'John Rodgers', isGrader: true },
        { studentName: 'Adam Scott', isGrader: false },
      ],
    },
    {
      courseNumber: 'CS112',
      courseName: 'Intro to Data Structures',
      students: [],
    },
    {
      courseNumber: 'CS262',
      courseName: 'Software Development',
      students: [],
    },
  ];

  currentPage = 'view';
  currentCourse = this.courses[0];
  addedStudents: string;
  studentsToAdd: string[];

  swapView(page: string, course: Course) {
    this.currentPage = page;
    this.currentCourse = course;
  }

  editStudent(student: Student) {
    const dialogRef = this.dialog.open(EditStudentsPopUpComponent, {
      width: '250px',
      data: { student: student },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result == 'grader') {
        this.makeGrader(student);
      } else if (result == 'remove') {
        this.removeStudent(student);
      }
    });
  }

  makeGrader(student: Student) {
    student.isGrader = !student.isGrader;
  }

  removeStudent(student: Student) {
    this.currentCourse.students = this.currentCourse.students.filter(
      (item) => item != student
    );
  }

  addStudents() {
    this.studentsToAdd = this.addedStudents.split('\n');
    this.studentsToAdd.forEach((student) => {
      this.currentCourse.students.push({
        studentName: student,
        isGrader: false,
      });
    });
  }

  getCourses() {
    return this.courses;
  }
}
