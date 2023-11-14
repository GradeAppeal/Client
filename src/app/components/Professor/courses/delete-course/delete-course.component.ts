import { Component, Inject, Optional, Input } from '@angular/core';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from '../../../../shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-delete-course',
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.scss']
})
export class DeleteCourseComponent {
  course : Course;
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<DeleteCourseComponent>,
    private professorService: ProfessorService
  ) {
    this.course = data.course;
  }

  async onDeleteCourse(){
    try {
      await this.professorService.deleteCourse(
        this.course.id,
      );
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
