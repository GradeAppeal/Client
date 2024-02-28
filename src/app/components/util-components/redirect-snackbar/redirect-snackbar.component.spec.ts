import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectSnackbarComponent } from './redirect-snackbar.component';

describe('RedirectSnackbarComponent', () => {
  let component: RedirectSnackbarComponent;
  let fixture: ComponentFixture<RedirectSnackbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RedirectSnackbarComponent]
    });
    fixture = TestBed.createComponent(RedirectSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
