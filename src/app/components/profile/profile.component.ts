import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditStudentsPopUpComponent } from 'src/app/edit-students-pop-up/edit-students-pop-up.component';
import { ProfessorCourse } from 'src/app/shared/interfaces/professor.interface';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ActivatedRoute } from '@angular/router';
import { NewAppealComponent } from 'src/app/new-appeal/new-appeal.component';

export interface Student {
  studentName: string,
  isGrader: boolean,
}
export interface Course {
  courseNumber: string,
  courseName: string,
  students: Student[],
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent {
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private supabase: SupabaseService
    )
    {}
  // pull courses and students from database
    courses: Course[]= [
    {
      courseNumber: "CS336",
      courseName: "Web Development",
      students: [
        {studentName: 'Sam Hoogewind', isGrader: false},
        {studentName: 'Ael Lee', isGrader: true},
        {studentName: 'Justin Voss', isGrader: false},
        {studentName: 'Tyler Voss', isGrader: false}
      ]
    },
    {
      courseNumber: "MATH251",
      courseName: "Discrete Math",
      students: [
        {studentName: 'Joe Smith', isGrader: true},
        {studentName: 'John Rodgers', isGrader: true},
        {studentName: 'Adam Scott', isGrader: false}
      ]
    },
    {
      courseNumber: "CS112",
      courseName: "Intro to Data Structures",
      students: []
    },
    {
      courseNumber: "CS262",
      courseName: "Software Development",
      students: []
    }
  ]

  currentPage = "view";
  currentCourse : ProfessorCourse;
  addedStudents: string;
  studentsToAdd: string[];

  professorCourses : ProfessorCourse[];
  isCourseFetched = false;

  async ngOnInit() {
    try {
      // don't render form until course and assignment information has been fetched
      this.professorCourses = await this.supabase.fetchProfessorCourses(1); // hardcoded professor id
      this.isCourseFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

    /**
   * Formats course name information like shown in Moodle
   * @param course ProfessorCourse object containing course information
   * @returns formatted string of course (moodle format)
   */
  formatProfessorCourse(course: ProfessorCourse): string {
    return course.section
      ? `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        }-${course.section} - ${course.name}`
      : `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        } - ${course.name}`;
  }

  swapView(page: string, course: ProfessorCourse) {
    this.currentPage = page;
    this.currentCourse = course;
  }

  editStudent(student: Student) {
    const dialogRef = this.dialog.open(EditStudentsPopUpComponent, {
      width: '250px',
      data: {student: student}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == "grader") {
        this.makeGrader(student);
      }
      // else if (result == "remove") {
      //   this.removeStudent(student);
      // }
    });
  }

  makeGrader(student: Student) {
    student.isGrader = !student.isGrader;
  }

  // removeStudent(student: Student) {
  //   this.currentCourse.students = this.currentCourse.students.filter(item => item != student);
  // }

  // addStudents() {
  //   this.studentsToAdd = this.addedStudents.split("\n");
  //   this.studentsToAdd.forEach( (student) => {this.currentCourse.students.push({studentName: student, isGrader: false});});
  // }

  getCourses () {
    return this.courses;
  }
}
