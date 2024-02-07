import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStudentPopupComponent } from './add-student-popup.component';

describe('AddStudentPopupComponent', () => {
  let component: AddStudentPopupComponent;
  let fixture: ComponentFixture<AddStudentPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddStudentPopupComponent]
    });
    fixture = TestBed.createComponent(AddStudentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
