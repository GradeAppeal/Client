import { Component, Input } from '@angular/core';
import { ProfessorService } from 'src/app/services/professor.service';
import { MatDialog } from '@angular/material/dialog';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import {
  ParsedStudent,
  StudentCourseGraderInfo,
} from 'src/app/shared/interfaces/professor.interface';
import { EditStudentsPopUpComponent } from './edit-students-pop-up/edit-students-pop-up.component';
import { SharedService } from 'src/app/services/shared.service';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
})
export class RosterComponent {
  @Input() course: Course;
  courseStudents!: StudentCourseGraderInfo[];
  fetchedStudents = false;
  addedStudents: string;
  addedStudentsCSV: string;
  studentsToAdd: string[];
  currentCourse: Course;
  parsedStudentsToAdd: ParsedStudent[] = [];
  parsedStudent: ParsedStudent;
  splitStudent: string[];

  constructor(
    private sharedService: SharedService,
    private professorService: ProfessorService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    try {
      this.courseStudents = await this.professorService.fetchCourseStudents(
        this.course.id
      );
      this.fetchedStudents = true;
      // listen for database changes
      this.handleStudentUpdates();
    } catch (err) {
      console.log(err);
    }
  }

  handleStudentUpdates(): void {
    this.sharedService
      .getTableChanges(
        'StudentCourse',
        'student-course-channel',
        `course_id=eq.${this.course.id}`
      )
      .subscribe(async (update: any) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new student inserted
        if (event === 'INSERT') {
          // get new in
          const record = update.new;
          const { student_id, course_id } = record;

          // get student & course information
          const { id, first_name, last_name, email } =
            await this.sharedService.getStudent(student_id);
          const course = await this.sharedService.getCourse(course_id);

          // show new student
          this.courseStudents.push({
            student_id: id,
            student_name: `${first_name} ${last_name}`,
            email: email,
            course_id: course.id,
            course_name: course.name,
            is_grader: false,
          });
        }
        // if grader status updated
        else if (event === 'UPDATE') {
          const { student_id } = record;
          // change student to grader
          const courseStudent = this.courseStudents.find(
            (courseStudent) => courseStudent.student_id === student_id
          ) as StudentCourseGraderInfo;
          courseStudent.is_grader = !courseStudent.is_grader;
        }
        // if assignment deleted
        else if (event === 'DELETE') {
          const { student_id } = record;
          this.courseStudents = this.courseStudents.filter(
            (student) => student.student_id !== student_id
          );
        }
      });
  }

  async editStudentPopup(
    studentCourseGrader: StudentCourseGraderInfo
  ): Promise<void> {
    const dialogRef = this.dialog.open(EditStudentsPopUpComponent, {
      width: '20%',
      height: '20%',
      data: { studentCourseGrader },
    });
  }

  /**
   * Parse student informtion from textbox input
   * @returns paresed student from textbox input
   */
  parseStudents(addedStudentsCSV: string): ParsedStudent[] {
    const parsedStudentsToAdd: ParsedStudent[] = [];
    // parse students added
    console.log(addedStudentsCSV);
    this.studentsToAdd = addedStudentsCSV.split(/\r?\n/);
    console.log(this.studentsToAdd);
    // this.addedStudentsCSV = '';
    this.studentsToAdd.shift(); // get rid of the column names
    console.log(this.studentsToAdd);
    this.studentsToAdd = this.studentsToAdd.filter((n) => n); // get rid of empty strings from copy pasting
    this.studentsToAdd.forEach((student) => {
      this.splitStudent = student.split(',');
      console.log(this.splitStudent);
      console.log(this.splitStudent[2]);
      this.parsedStudent = {
        first_name: this.splitStudent[0],
        last_name: this.splitStudent[1],
        email: this.splitStudent[2],
      };
      parsedStudentsToAdd.push(this.parsedStudent);
    });
    return parsedStudentsToAdd;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.readFile(file);
    }
  }

  readFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const csvContent: string = e.target.result;
      const csvContentTabSeparated = csvContent.replace(/,/g, '\t').replace(/\n/g, '\r\n');
      this.addedStudentsCSV = csvContentTabSeparated;
      this.addStudents(this.addedStudentsCSV);
    };
    reader.readAsText(file);
    }

  /**
   * Adds students to Course
   * separately handles registered & unregistered users
   */
  async addStudents(addedStudentsCSV: string): Promise<void> {
    const parsedStudentsToAdd = this.parseStudents(addedStudentsCSV);
    console.log(parsedStudentsToAdd);
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
}
