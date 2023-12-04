import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSetPasswordComponent } from './student-set-password.component';

describe('StudentSetPasswordComponent', () => {
  let component: StudentSetPasswordComponent;
  let fixture: ComponentFixture<StudentSetPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentSetPasswordComponent]
    });
    fixture = TestBed.createComponent(StudentSetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
