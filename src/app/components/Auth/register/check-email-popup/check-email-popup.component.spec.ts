import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckEmailPopupComponent } from './check-email-popup.component';

describe('CheckEmailPopupComponent', () => {
  let component: CheckEmailPopupComponent;
  let fixture: ComponentFixture<CheckEmailPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckEmailPopupComponent]
    });
    fixture = TestBed.createComponent(CheckEmailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
