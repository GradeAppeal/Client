import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPasswordResetSnackbarComponent } from './request-password-reset-snackbar.component';

describe('RequestPasswordResetSnackbarComponent', () => {
  let component: RequestPasswordResetSnackbarComponent;
  let fixture: ComponentFixture<RequestPasswordResetSnackbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestPasswordResetSnackbarComponent]
    });
    fixture = TestBed.createComponent(RequestPasswordResetSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
