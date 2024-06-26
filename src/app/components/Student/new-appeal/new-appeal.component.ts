import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  Course,
  Assignment,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { StudentService } from 'src/app/services/student.service';
import { SharedService } from 'src/app/services/shared.service';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder } from '@angular/forms';
import { StudentAppeal } from 'src/app/shared/interfaces/student.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-appeal',
  templateUrl: './new-appeal.component.html',
  styleUrls: ['./new-appeal.component.scss'],
})
export class NewAppealComponent implements OnInit {
  user: User;
  student: Student;
  isCourseFetched = false;
  courseId: number;
  course: Course;
  isAssignmentsFetched = false;
  assignments: Assignment[];
  selectedAssignment: Assignment;
  selectedAssignmentID: string;
  appeal: string;
  studentAppeals: StudentAppeal[];
  errorMessage: string;
  imageFile: File | undefined;
  appealExistsForAssignment = false;

  onFilechange(event: any) {
    this.imageFile = event.target.files[0];
  }

  appealForm = this.formBuilder.group({
    selectedAssignmentId: '',
    appeal: '',
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private studentService: StudentService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private snackBar: MatSnackBar
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.student = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
          is_verified: this.user.email_confirmed_at ? true : false,
        };
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  async ngOnInit() {
    this.courseId = this.route.snapshot.params['courseId'];
    try {
      this.studentAppeals = await this.studentService.fetchStudentAppeals(
        this.student.id
      );
      // don't render form until course and assignment information has been fetched
      this.course = await this.studentService.fetchCourseForNewAppeal(
        this.courseId
      );
      this.isCourseFetched = true;
      this.assignments = await this.studentService.fetchAssignmentsForNewAppeal(
        this.courseId
      );

      this.isAssignmentsFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for new appeal');
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

  /**
   * Submit student appeal to database
   */
  async onSubmitAppeal(): Promise<void> {
    const now = getTimestampTz(new Date());
    try {
      const hasImage = this.imageFile === undefined ? false : true;
      const professorID = await this.studentService.getCourseProfessor(
        this.course.id
      );
      const assignmentIds = this.studentAppeals.map(
        (appeal) => appeal.assignment_id
      );

      if (assignmentIds.includes(this.selectedAssignment.id)) {
        this.appealExistsForAssignment = true;
        this.snackBar.open(
          'You Already submitted an appeal for this assignment',
          '',
          { panelClass: ['error-snackbar'], duration: 2000 }
        );
      } else {
        const { id, grader_id, grader_name } = this.selectedAssignment;
        const gid = grader_id ? grader_id : null;
        const gname = grader_name ? grader_name : null;
        console.log('before insert new appeal');
        const appealID = await this.studentService.insertNewAppeal(
          id,
          this.student.id,
          this.courseId,
          gid,
          gname,
          now,
          this.appeal,
          professorID,
          hasImage
        );
        console.log('insertAppeal success');
        const appealMessages = await this.sharedService.fetchMessages(appealID);
        const messageID = appealMessages[0].message_id;

        if (hasImage) {
          const imageID = await this.sharedService.uploadFile(
            appealID,
            this.imageFile!,
            messageID
          );
        }

        this.router.navigateByUrl(`student/interaction-history/${appealID}`);
      }
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
