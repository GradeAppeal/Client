import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGraderComponent } from './edit-grader.component';

describe('EditGraderComponent', () => {
  let component: EditGraderComponent;
  let fixture: ComponentFixture<EditGraderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditGraderComponent]
    });
    fixture = TestBed.createComponent(EditGraderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
