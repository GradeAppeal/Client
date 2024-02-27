import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordConfirmComponent } from './reset-password-confirm.component';

describe('ResetPasswordConfirmComponent', () => {
  let component: ResetPasswordConfirmComponent;
  let fixture: ComponentFixture<ResetPasswordConfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordConfirmComponent]
    });
    fixture = TestBed.createComponent(ResetPasswordConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
