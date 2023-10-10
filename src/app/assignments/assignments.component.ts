import { Component, Input, OnInit} from '@angular/core';
import { Course } from '../components/profile/profile.component';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { ProfessorCourse } from '../shared/interfaces/professor.interface';
import { ProfileComponent } from '../components/profile/profile.component';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from '../add-assignment/add-assignment.component';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent {
  @Input() course: ProfessorCourse; 
  courseId: number;
  isAssignmentsFetched = false;
  assignments: Assignment[];
  selectedAssignmentId: number;
  editMode = false;
  newAssignment : string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    private profile: ProfileComponent,
    private dialog: MatDialog,
  ) {}

  formatProfessorCourse(course : ProfessorCourse): string {
    return this.profile.formatProfessorCourse(course);
  }

  async ngOnInit() {
    try {
      // don't render form until course and assignment information has been fetched
      this.assignments  = await this.supabase.fetchAssignmentsForNewAppeal(1); // hardcoded professor id
      this.isAssignmentsFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

  deleteAssignment(index : number) {
    console.log(this.assignments[index]);

  }
  
/**
   * Add new assignment to database
   */
async addAssignment(assignments : Assignment[], course : ProfessorCourse): Promise<void> {
  const dialogRef = this.dialog.open(AddAssignmentComponent, {
    width: "75%",
    height: "75%",
    data: {assignments: assignments, course : course}
  });
}

toggleEditMode() {
  this.editMode = !this.editMode;
}



}
