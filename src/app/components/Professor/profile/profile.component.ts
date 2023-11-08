import { Component, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditStudentsPopUpComponent } from 'src/app/components/Student/edit-students-pop-up/edit-students-pop-up.component';
import { Course, Student } from 'src/app/shared/interfaces/psql.interface';
import { ParsedStudent } from 'src/app/shared/interfaces/professor.interface';
import { OnChanges } from '@angular/core';
import { ProfessorService } from 'src/app/services/professor.service';
import { SupabaseService } from 'src/app/services/auth.service';
import { Session, User } from '@supabase/supabase-js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnChanges {
  session: Session;
  user: User;
  courseStudents!: Student[];
  professorCourses!: Course[];
  fetchedStudents = false;
  fetchedCourses = false;
  fetchedCourse = false;
  currentPage = 'view';
  currentCourseID = -1;
  addedStudents: string;
  studentsToAdd: string[];
  currentCourse: Course;
  parsedStudentsToAdd: ParsedStudent[] = [];
  parsedStudent: ParsedStudent;
  splitStudent: string[];
  constructor(
    private dialog: MatDialog,
    private professorService: ProfessorService,
    private authService: SupabaseService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.session = (await this.authService.getSession()) as Session;
      this.user = this.session.user;
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.user.id
      );
      this.fetchedCourses = true;
    } catch (err) {
      console.log(err);
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

  async retrieveRoster(courseID: number): Promise<void> {
    try {
      this.courseStudents = await this.professorService.fetchStudentsForClass(
        courseID
      );
      this.fetchedStudents = true;
      console.log(this.courseStudents);
    } catch (err) {
      console.log(err);
    }
  }

  async swapView(page: string, courseID: number, course: Course) {
    this.currentPage = page;
    this.currentCourseID = courseID;
    this.currentCourse = course;
    if (page == 'editRoster') {
      await this.retrieveRoster(courseID);
    } else {
      this.fetchedStudents = false;
      this.courseStudents = [];
    }
  }

  editStudent(student: Student) {
    console.log(student);
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

  /**
   * toggle grader status
   * @param student student to change status
   */
  async makeGrader(student: Student) {
    try {
      console.log(student.id, this.currentCourseID);
      await this.professorService.updateGrader(
        student.id,
        this.currentCourseID
      );
      student.is_grader = !student.is_grader;
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
    const cid = this.currentCourseID;
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
   * remove single student from course
   * @param student info of student to remove
   */
  async removeStudent(student: Student) {
    const sid = student.id;
    const cid = this.currentCourseID;
    try {
      const deletedStudent =
        await this.professorService.deleteStudentFromCourse(sid, cid);
      console.log(`deleted student: ${{ deletedStudent }}`);
      console.log(
        `${student.first_name} ${student.last_name} has been removed`
      );
    } catch (error) {
      console.log({ error });
      throw new Error('removeStudent');
    }
  }
}
