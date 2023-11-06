import { MatSelect } from '@angular/material/select';
import { Component, Inject, Optional, Input, ViewChild  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { Course } from '../../../../shared/interfaces/psql.interface';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent {
  newCoursePrefix: string;
  newCourseCode: number;
  newCourseName: string;
  newCourseSemester: string = "FA";
  courseYear = new Date().getFullYear();
  courseNextYear = new Date().getFullYear() + 1;

  chosenYear: number;

  @ViewChild('mySelectSemester') mySelectSemester: MatSelect;
  @ViewChild('mySelectYear') mySelectYear: MatSelect;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<AddCourseComponent>,
    private supabase: SupabaseService,
  ) {
  }

  async ngOnInit() {
    
  }


  /* 
  * Add course to database
  */
  async onAddCourse(){

    this.newCourseSemester = this.mySelectSemester.value;
    console.log('Selected Value: ', this.newCourseSemester);
    
    if (this.mySelectYear.value == "courseYear"){
      this.chosenYear = this.courseYear;
    }
    else if (this.mySelectSemester.value == "courseNextYear"){
      this.chosenYear = this.courseNextYear;
    }

    console.log(this.courseYear);
    console.log(this.courseNextYear);

      try {
      // await this.supabase.insertCourse(
      //   this.newCoursePrefix,
      //   this.newCourseCode,
      //   this.newCourseName,
      //   this.newCourseSemester,
      //   this.chosenYear
      // );
      } catch (err) {
        console.log(err);
        throw new Error('insertCourse');
      }
    /*   close pop-up */
      this.dialogRef.close();
  }
}
