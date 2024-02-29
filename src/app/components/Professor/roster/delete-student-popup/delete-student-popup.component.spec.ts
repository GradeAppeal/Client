import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteStudentPopupComponent } from './delete-student-popup.component';

describe('DeleteStudentPopupComponent', () => {
  let component: DeleteStudentPopupComponent;
  let fixture: ComponentFixture<DeleteStudentPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteStudentPopupComponent]
    });
    fixture = TestBed.createComponent(DeleteStudentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
