import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClosedAppealPopupComponent } from './view-closed-appeal-popup.component';

describe('ViewClosedAppealPopupComponent', () => {
  let component: ViewClosedAppealPopupComponent;
  let fixture: ComponentFixture<ViewClosedAppealPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewClosedAppealPopupComponent]
    });
    fixture = TestBed.createComponent(ViewClosedAppealPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
