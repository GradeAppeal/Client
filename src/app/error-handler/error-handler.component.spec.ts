import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerComponent } from './error-handler.component';

describe('ErrorHandlerComponent', () => {
  let component: ErrorHandlerComponent;
  let fixture: ComponentFixture<ErrorHandlerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorHandlerComponent]
    });
    fixture = TestBed.createComponent(ErrorHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
