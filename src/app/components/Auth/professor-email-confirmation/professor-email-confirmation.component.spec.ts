import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorEmailConfirmationComponent } from './professor-email-confirmation.component';

describe('ProfessorEmailConfirmationComponent', () => {
  let component: ProfessorEmailConfirmationComponent;
  let fixture: ComponentFixture<ProfessorEmailConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfessorEmailConfirmationComponent]
    });
    fixture = TestBed.createComponent(ProfessorEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
