import { Component, Input, OnInit } from '@angular/core';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfileComponent } from '../profile/profile.component';
import { MatDialog } from '@angular/material/dialog';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import {
  ParsedStudent,
  StudentCourseGraderInfo,
} from 'src/app/shared/interfaces/professor.interface';
import { EditStudentsPopUpComponent } from '../../Student/edit-students-pop-up/edit-students-pop-up.component';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss']
})
export class RosterComponent {
  @Input() course: Course;
  courseStudents!: StudentCourseGraderInfo[];
  fetchedStudents = false;
  addedStudents: string;
  studentsToAdd: string[];
  currentCourse: Course;
  parsedStudentsToAdd: ParsedStudent[] = [];
  parsedStudent: ParsedStudent;
  splitStudent: string[];

  constructor(
    private professorService: ProfessorService,
    private profile: ProfileComponent,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    try {
      this.courseStudents = await this.professorService.fetchCourseStudents(
        this.course.id
      );
      this.fetchedStudents = true;
      console.log(this.courseStudents);
    } catch (err) {
      console.log(err);
    }
  }

  editStudent(studentCourseGrader: StudentCourseGraderInfo) {
    console.log(studentCourseGrader);
    const dialogRef = this.dialog.open(EditStudentsPopUpComponent, {
      width: '250px',
      data: { studentCourseGrader },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log(result);
      if (result == 'grader') {
        await this.makeGrader(studentCourseGrader);
      } else if (result == 'remove') {
        await this.removeStudent(studentCourseGrader);
      }
    });
  }

  /**
   * toggle grader status
   * @param student student to change status
   */
  async makeGrader(studentCourseGrader: StudentCourseGraderInfo) {
    try {
      const { student_id, course_id } = studentCourseGrader;
      console.log(studentCourseGrader.student_id, this.course.id);
      await this.professorService.updateGrader(student_id, course_id);
      studentCourseGrader.is_grader = !studentCourseGrader.is_grader;
    } catch (err) {
      throw new Error('makeGrader');
    }
  }

  /**
   * Parse student informtion from textbox input
   * @returns paresed student from textbox input
   */
  parseStudents(): ParsedStudent[] {
    const parsedStudentsToAdd: ParsedStudent[] = [];
    // parse students added
    this.studentsToAdd = this.addedStudents.split('\n');
    this.addedStudents = '';
    this.studentsToAdd.shift(); // get rid of the column names
    this.studentsToAdd = this.studentsToAdd.filter((n) => n); // get rid of empty strings from copy pasting
    this.studentsToAdd.forEach((student) => {
      this.splitStudent = student.split('\t');
      this.parsedStudent = {
        first_name: this.splitStudent[0],
        last_name: this.splitStudent[1],
        email: this.splitStudent[2],
      };
      parsedStudentsToAdd.push(this.parsedStudent);
    });
    return parsedStudentsToAdd;
  }

  /**
   * Adds students to Course
   * separately handles registered & unregistered users
   */
  async addStudents(): Promise<void> {
    const parsedStudentsToAdd = this.parseStudents();
    const cid = this.course.id;
    try {
      // Whether a student is a registered user or not
      const userStatus = await this.professorService.fetchStudentUserStatus(
        parsedStudentsToAdd
      );

      // split into registered & unregistered students
      const existingUsers = parsedStudentsToAdd.filter((_, i) => userStatus[i]);
      const nonExistingUsers = parsedStudentsToAdd.filter(
        (_, i) => !userStatus[i]
      );

      // get student ids of registered students & store in array
      const existingUserIds = await this.professorService.fetchStudentIds(
        existingUsers
      );
      // invite new students to course and store their ids in an array
      const newUserIds = await this.professorService.inviteStudentsToCourse(
        nonExistingUsers
      );
      // get all student ids to add to course
      const studentUserIds = existingUserIds
        .concat([...newUserIds])
        .filter((id) => id !== null);

      // insert students to course
      await this.professorService.insertStudentsToCourse(studentUserIds, cid);
      // empty out
      this.parsedStudentsToAdd = [];
    } catch (error) {
      console.log({ error });
      throw new Error('addStudents');
    }
  }

    /**
   * Formats course name information like shown in Moodle
   * @param course Course object containing course information
   * @returns formatted string of course (moodle format)
   */
    formatCourse(course: Course): string {
      return course.section
        ? `${course.year - 2000}${course.semester} ${course.prefix}-${
            course.code
          }-${course.section} - ${course.name}`
        : `${course.year - 2000}${course.semester} ${course.prefix}-${
            course.code
          } - ${course.name}`;
    }

    /*
   * remove single student from course
   * @param student info of student to remove
   */
  async removeStudent(studentCourseGrader: StudentCourseGraderInfo) {
    try {
      const { student_id, course_id } = studentCourseGrader;
      const deletedStudent =
        await this.professorService.deleteStudentFromCourse(
          student_id,
          course_id
        );
      console.log({ deletedStudent });
      this.courseStudents = this.courseStudents.filter(
        (student) => student.student_id !== deletedStudent.student_id
      );
    } catch (error) {
      console.log({ error });
      throw new Error('removeStudent');
    }
  }

}
