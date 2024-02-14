import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraderDashboardComponent } from './grader-dashboard.component';

describe('GraderDashboardComponent', () => {
  let component: GraderDashboardComponent;
  let fixture: ComponentFixture<GraderDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GraderDashboardComponent]
    });
    fixture = TestBed.createComponent(GraderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
