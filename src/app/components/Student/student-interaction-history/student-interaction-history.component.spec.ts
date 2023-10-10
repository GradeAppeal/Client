import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentInteractionHistoryComponent } from './student-interaction-history.component';

describe('StudentInteractionHistoryComponent', () => {
  let component: StudentInteractionHistoryComponent;
  let fixture: ComponentFixture<StudentInteractionHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentInteractionHistoryComponent]
    });
    fixture = TestBed.createComponent(StudentInteractionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
