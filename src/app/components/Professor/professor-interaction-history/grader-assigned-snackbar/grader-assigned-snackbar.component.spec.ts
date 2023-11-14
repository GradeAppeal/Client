import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraderAssignedSnackbarComponent } from './grader-assigned-snackbar.component';

describe('GraderAssignedSnackbarComponent', () => {
  let component: GraderAssignedSnackbarComponent;
  let fixture: ComponentFixture<GraderAssignedSnackbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GraderAssignedSnackbarComponent]
    });
    fixture = TestBed.createComponent(GraderAssignedSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
