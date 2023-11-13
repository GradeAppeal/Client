import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignGraderPopupComponent } from './assign-grader-popup.component';

describe('AssignGraderPopupComponent', () => {
  let component: AssignGraderPopupComponent;
  let fixture: ComponentFixture<AssignGraderPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignGraderPopupComponent]
    });
    fixture = TestBed.createComponent(AssignGraderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
