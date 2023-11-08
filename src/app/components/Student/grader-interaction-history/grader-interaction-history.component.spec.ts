import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraderInteractionHistoryComponent } from './grader-interaction-history.component';

describe('GraderInteractionHistoryComponent', () => {
  let component: GraderInteractionHistoryComponent;
  let fixture: ComponentFixture<GraderInteractionHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GraderInteractionHistoryComponent]
    });
    fixture = TestBed.createComponent(GraderInteractionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
