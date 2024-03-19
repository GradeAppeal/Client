import { Component, ViewChild } from '@angular/core';
import { ProfessorService } from 'src/app/services/professor.service';
import { MatDialog } from '@angular/material/dialog';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import {
  ParsedStudent,
  StudentCourseGraderInfo,
} from 'src/app/shared/interfaces/professor.interface';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AddStudentPopupComponent } from './add-student-popup/add-student-popup.component';
import { DeleteStudentPopupComponent } from './delete-student-popup/delete-student-popup.component';
import { ResetStudentPasswordPopupComponent } from './reset-student-password-popup/reset-student-password-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
})
export class RosterComponent {
  course: Course = {
    id: 0,
    prefix: '',
    code: 0,
    name: '',
    section: '',
    semester: 'FA',
    year: 0,
  };

  courseStudents!: StudentCourseGraderInfo[];
  studentIds: string[];
  fetchedStudents = false;
  fetchedCourse = false;
  addedStudents: string;
  addedStudentsCSV: string = '';
  currentCourse: Course;
  parsedStudentsToAdd: ParsedStudent[] = [];
  parsedStudent: ParsedStudent;
  splitStudent: string[];
  courseID: number;
  isNewStudent: boolean = false;
  ROSTER_DATA: {
    name: string;
    email: string;
    role: string;
    is_verified: boolean;
  }[] = [];
  rosterDataSource = this.ROSTER_DATA;
  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'is_verified',
    'options',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private professorService: ProfessorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe((params) => {
      this.courseID = +params['id']; // Convert the parameter to a number
    });
  }

  async ngOnInit() {
    try {
      this.course = await this.sharedService.getCourse(this.courseID);
      this.courseStudents = await this.professorService.fetchCourseStudents(
        this.courseID
      );
      this.studentIds = this.courseStudents.map(
        (student) => student.student_id
      );

      // sorts students by last name, then first name
      this.courseStudents.sort((a, b) =>
        this.compare(a.student_name, b.student_name, true)
      );

      // update material table
      this.setRoster();

      // update addedStudentCSV string
      this.addedStudentsCSV = '';
      this.addedStudentsCSV = this.addedStudentsCSV.concat(
        'First name\tLast name\tEmail address\n'
      );
      this.courseStudents.forEach((student) => {
        this.addedStudentsCSV = this.addedStudentsCSV.concat(
          student.student_name,
          ' ',
          student.email,
          '\n'
        );
      });
      this.addedStudentsCSV = this.addedStudentsCSV.trimRight();

      this.fetchedStudents = true;
      this.fetchedCourse = true;
      // listen for database changes
      this.handleStudentUpdates();
      this.handleStudentVerificationUpdates();
    } catch (err) {
      console.log(err);
    }
  }

  handleStudentUpdates(): void {
    this.sharedService
      .getTableChanges(
        'StudentCourse',
        'student-course-channel',
        `course_id=eq.${this.courseID}`
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
          console.log({ update });
          const { student_id, course_id } = record;

          // get student & course information
          const { id, first_name, last_name, email, is_verified } =
            await this.sharedService.getStudent(student_id);
          const course = await this.sharedService.getCourse(course_id);

          // if student is not already in course, add to course
          if (
            !this.courseStudents.some(
              (student) => student_id === student.student_id
            )
          ) {
            this.courseStudents.push({
              student_id: id,
              student_name: `${first_name} ${last_name}`,
              email: email,
              course_id: course.id,
              course: course.name,
              is_grader: false,
              is_verified,
            });
          }
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
        this.setRoster();
      });
  }

  handleStudentVerificationUpdates(): void {
    this.sharedService
      .getTableChanges(
        'Students',
        'student-verification-channel',
        `id=in.(${[...this.studentIds]})`
      )
      .subscribe(async (update: any) => {
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;
        if (!record) return;

        if (event === 'UPDATE') {
          const { id, is_verified } = record;
          const courseStudent = this.courseStudents.find(
            (courseStudent) => courseStudent.student_id === id
          ) as StudentCourseGraderInfo;

          courseStudent.is_verified = is_verified;
        }
        this.setRoster();
      });
  }

  private setRoster() {
    this.ROSTER_DATA = this.courseStudents.map((student) => {
      return {
        name: student.student_name,
        email: student.email,
        role: student.is_grader ? 'Grader' : 'Student',
        is_verified: student.is_verified,
        options: null,
      };
    });

    this.rosterDataSource = this.ROSTER_DATA;
  }

  sortTable(sort: Sort) {
    const data = this.ROSTER_DATA.slice();
    if (!sort.active || sort.direction === '') {
      this.rosterDataSource = data;
      return;
    }

    this.rosterDataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'role':
          return this.compare(a.role, b.role, isAsc);
        case 'is_verified':
          return this.compare(
            a.is_verified.toString(),
            b.is_verified.toString(),
            isAsc
          );

        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  async onAssignGrader(student: StudentCourseGraderInfo): Promise<void> {
    try {
      const { student_id, course_id } = student;
      await this.professorService.updateGrader(student_id, course_id);
    } catch (err) {
      throw new Error('makeGrader');
    }
  }

  async onVerifyAccount(student: StudentCourseGraderInfo): Promise<void> {
    try {
      const { student_id } = student;
      const isConfirmed = await this.professorService.getStudentInfo(
        student_id
      );
      if (isConfirmed) {
        this.snackBar.open('Student is already verified', '', {
          panelClass: ['blue-snackbar'],
          duration: 1500,
        });
      } else {
        await this.professorService.verifyStudent(student_id);
        this.snackBar.open('Student verified', '', {
          panelClass: ['green-snackbar'],
          duration: 1500,
        });
      }
      //await this.professorService.verifyStudent(student_id);
    } catch (err) {
      this.snackBar.open('Error verifying student', '', {
        panelClass: ['error-snackbar'],
        duration: 1500,
      });
    }
  }

  onResetPassword(student: StudentCourseGraderInfo): void {
    const dialogRef = this.dialog.open(ResetStudentPasswordPopupComponent, {
      data: { student },
    });
    dialogRef.afterClosed().subscribe((status) => {
      console.log(status);
      if (status === 'success') {
        this.snackBar.open('Success!', '', {
          panelClass: ['blue-snackbar'],
          duration: 2500,
        });
      } else if (status === 'cancel') {
        this.snackBar.open('Canceled', '', {
          panelClass: ['blue-snackbar'],
          duration: 2500,
        });
      } else if (status === 'error') {
        this.snackBar.open('Error. Try Again.', '', {
          panelClass: ['blue-snackbar'],
          duration: 2500,
        });
      }
    });
  }

  onDeleteStudent(student: StudentCourseGraderInfo): void {
    this.dialog.open(DeleteStudentPopupComponent, {
      data: { student },
    });
  }

  /**
   * Parse student informtion from textbox input
   * @returns paresed student from textbox input
   */
  parseStudents(addedStudentsCSV: string): ParsedStudent[] {
    console.log(addedStudentsCSV);
    const parsedStudentsToAdd: ParsedStudent[] = [];
    // make string have consistant formatting
    const formattedString = addedStudentsCSV
      .replace(/\r\r\n/g, '\n')
      .trimRight();
    console.log(formattedString);
    const studentsToAdd = formattedString.split('\n');
    console.log(studentsToAdd);
    studentsToAdd.shift(); // get rid of the column names

    studentsToAdd.forEach((student) => {
      // format spaces into tabs
      student = student.replace(/ /g, '\t').trimRight();
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

  getIsGrader(student: any): boolean {
    return student.is_grader;
  }

  /**
   * Reads file on file change
   */
  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log(file.type);
    if (file) {
      this.readFile(file);
    }
  }

  /**
   * Reads file and convert CSV content into string
   */
  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csvContent: string = e.target.result;
      // replace tabs with newlines
      const csvContentTabSeparated = csvContent
        .replace(/,/g, '\t')
        .replace(/\n/g, '\r\n');
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
    const cid = this.courseID;
    try {
      console.log({ parsedStudentsToAdd });
      // Whether a student is a registered user or not
      const userStatus = await this.professorService.fetchStudentUserStatus(
        parsedStudentsToAdd
      );
      console.log({ userStatus });
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

  onBackButton() {
    this.router.navigateByUrl('professor/courses');
  }

  addStudentPopUp() {
    const dialogRef = this.dialog.open(AddStudentPopupComponent, {
      width: '60%',
      height: '80%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      const newStudentString =
        result.student.first_name +
        ' ' +
        result.student.last_name +
        ' ' +
        result.student.email;

      // the studentsCSV file needs to be updated with the contents of the table
      this.addedStudentsCSV = this.addedStudentsCSV.concat(
        '\n',
        newStudentString
      );
      console.log(this.addedStudentsCSV);

      //addStudents(studentsCSV string with added student)
      this.isNewStudent = true;
      this.addStudents(this.addedStudentsCSV);
    });
  }
}
