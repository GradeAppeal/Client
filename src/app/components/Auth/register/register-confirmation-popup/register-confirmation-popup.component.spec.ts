import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterConfirmationPopupComponent } from './register-confirmation-popup.component';

describe('RegisterConfirmationPopupComponent', () => {
  let component: RegisterConfirmationPopupComponent;
  let fixture: ComponentFixture<RegisterConfirmationPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterConfirmationPopupComponent]
    });
    fixture = TestBed.createComponent(RegisterConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
