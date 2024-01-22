import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAppealPopupComponent } from './close-appeal-popup.component';

describe('CloseAppealPopupComponent', () => {
  let component: CloseAppealPopupComponent;
  let fixture: ComponentFixture<CloseAppealPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CloseAppealPopupComponent]
    });
    fixture = TestBed.createComponent(CloseAppealPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
