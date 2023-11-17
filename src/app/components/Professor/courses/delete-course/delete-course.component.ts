import { Component, Inject, Optional, Input } from '@angular/core';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from '../../../../shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-delete-course',
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.scss'],
})
export class DeleteCourseComponent {
  cid: number;
  pid: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { cid: number; pid: string },
    private router: Router,
    private dialogRef: MatDialogRef<DeleteCourseComponent>,
    private professorService: ProfessorService
  ) {
    this.cid = data.cid;
    this.pid = data.pid;
  }

  async onDeleteCourse() {
    try {
      await this.professorService.deleteCourse(this.cid, this.pid);
    } catch (err) {
      console.log(err);
      throw new Error('insertCourse');
    }
    /*   close pop-up */
    this.dialogRef.close();
    this.router.navigateByUrl('/professor/courses');

    //TODO MAKE IT GO BACK TO MAIN PAGE
  }
}
