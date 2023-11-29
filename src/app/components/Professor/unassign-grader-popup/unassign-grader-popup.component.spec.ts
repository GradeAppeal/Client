import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignGraderPopupComponent } from './unassign-grader-popup.component';

describe('UnassignGraderPopupComponent', () => {
  let component: UnassignGraderPopupComponent;
  let fixture: ComponentFixture<UnassignGraderPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnassignGraderPopupComponent]
    });
    fixture = TestBed.createComponent(UnassignGraderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
