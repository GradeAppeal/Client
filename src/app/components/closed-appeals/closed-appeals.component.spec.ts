import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedAppealsComponent } from './closed-appeals.component';

describe('ClosedAppealsComponent', () => {
  let component: ClosedAppealsComponent;
  let fixture: ComponentFixture<ClosedAppealsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClosedAppealsComponent]
    });
    fixture = TestBed.createComponent(ClosedAppealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
