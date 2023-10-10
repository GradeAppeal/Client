import { Component, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditStudentsPopUpComponent } from 'src/app/components/Student/edit-students-pop-up/edit-students-pop-up.component';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorCourse } from 'src/app/shared/interfaces/professor.interface';
import { Student } from 'src/app/shared/interfaces/psql.interface';
import { OnChanges } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnChanges {
  courseStudents!: Student[];
  professorCourses!: ProfessorCourse[];
  fetchedStudents = false;
  fetchedCourses = false;
  currentPage = 'view';
  currentCourse = -1;
  addedStudents: string;
  studentsToAdd: string[];

  constructor(private dialog: MatDialog, private supabase: SupabaseService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.professorCourses = await this.supabase.fetchProfessorCourses(1);
      this.fetchedCourses = true;
    } catch (err) {
      console.log(err);
    }
  }

  async retrieveRoster(courseID: number): Promise<void> {
    try {
      this.courseStudents = await this.supabase.fetchStudentsForClass(courseID);
      this.fetchedStudents = true;
      console.log(this.courseStudents);
    } catch (err) {
      console.log(err);
    }
  }

  async swapView(page: string, courseID: number) {
    this.currentPage = page;
    this.currentCourse = courseID;
    if (page == 'editRoster') {
      await this.retrieveRoster(courseID);
      //this.assignRoles();
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

  async makeGrader(student: Student) {
    try {
      console.log(student.id, this.currentCourse);
      await this.supabase.updateGrader(student.id, this.currentCourse);
      student.is_grader = !student.is_grader;
    } catch (err) {
      throw new Error('makeGrader');
    }
  }

  removeStudent(student: Student) {
    //this.currentCourse.students = this.currentCourse.students.filter(item => item != student);
  }

  async addStudents(): Promise<void> {
    // parse students added
    this.studentsToAdd = this.addedStudents.split('\n');
    try {
      // this.studentsToAdd.forEach(async student => {
      //   await this.supabase.insertUser(
      //     "student",
      //     student.first_name,
      //     student.last_name,
      //     student.email
      //   )
      // })
    } catch (err) {
      console.log(err);
      throw new Error('addStudents');
    }
  }
}
export { Student };
