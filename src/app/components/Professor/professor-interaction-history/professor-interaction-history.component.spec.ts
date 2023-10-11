import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorInteractionHistoryComponent } from './professor-interaction-history.component';

describe('ProfessorInteractionHistoryComponent', () => {
  let component: ProfessorInteractionHistoryComponent;
  let fixture: ComponentFixture<ProfessorInteractionHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfessorInteractionHistoryComponent]
    });
    fixture = TestBed.createComponent(ProfessorInteractionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
