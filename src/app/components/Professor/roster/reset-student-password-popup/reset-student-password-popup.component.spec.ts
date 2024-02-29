import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetStudentPasswordPopupComponent } from './reset-student-password-popup.component';

describe('ResetStudentPasswordPopupComponent', () => {
  let component: ResetStudentPasswordPopupComponent;
  let fixture: ComponentFixture<ResetStudentPasswordPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResetStudentPasswordPopupComponent]
    });
    fixture = TestBed.createComponent(ResetStudentPasswordPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
