import { MatSelect } from '@angular/material/select';
import { Component, Inject, Optional, Input, ViewChild  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../services/auth.service';
import { Course } from '../../../../shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { Session, User } from '@supabase/supabase-js';
@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent {
  session: Session;
  user: User;
  courseYear = new Date().getFullYear();
  courseNextYear = new Date().getFullYear() + 1;
  codeString = '';
  /* initialized array with default values */
  course : Course = {
    id: 0,
    prefix: '',
    code: 0,
    name: '',
    section: '',
    semester: 'FA',
    year: this.courseYear,
  };

  @ViewChild('mySelectSemester') mySelectSemester: MatSelect;
  @ViewChild('mySelectYear') mySelectYear: MatSelect;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<AddCourseComponent>,
    private professorService: ProfessorService,
    private authService: SupabaseService
  ) {
  }

  async ngOnInit(): Promise<void> {
    try {
      this.session = (await this.authService.getSession()) as Session;
      this.user = this.session.user;
    } catch (err) {
      console.log(err);
    }
  }

  /* 
  * Add course to database
  */
  async onAddCourse(){
      try {
      await this.professorService.insertCourse(
        this.user.id,
        this.course.prefix,
        this.course.code,
        this.course.name,
        this.course.section,
        this.course.semester,
        this.course.year,
      );
      } catch (err) {
        console.log(err);
        throw new Error('insertCourse');
      }
    /*   close pop-up */
      this.dialogRef.close();
  }

  onEditCode(codeString: string) {
    this.course.code = parseInt(codeString, 10)
  }

  onSelectSemester(event: any) {
    this.course.semester = event.target.value;
  }

  onSelectYear(event: any) {
    if (event.target.value == "courseYear"){
      this.course.year = this.courseYear;
    }
    else if (event.target.value == "courseNextYear"){
      this.course.year = this.courseNextYear;
    }
  }
}
