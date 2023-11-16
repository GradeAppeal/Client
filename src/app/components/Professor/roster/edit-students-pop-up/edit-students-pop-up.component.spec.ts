import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStudentsPopUpComponent } from './edit-students-pop-up.component';

describe('EditStudentsPopUpComponent', () => {
  let component: EditStudentsPopUpComponent;
  let fixture: ComponentFixture<EditStudentsPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditStudentsPopUpComponent]
    });
    fixture = TestBed.createComponent(EditStudentsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
