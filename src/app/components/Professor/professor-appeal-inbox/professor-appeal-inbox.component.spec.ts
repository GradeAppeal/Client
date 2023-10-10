import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorAppealInboxComponent } from './professor-appeal-inbox.component';
import { MatListModule } from '@angular/material/list';

describe('ProfessorAppealInboxComponent', () => {
  let component: ProfessorAppealInboxComponent;
  let fixture: ComponentFixture<ProfessorAppealInboxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfessorAppealInboxComponent],
      imports: [MatListModule],
    });
    fixture = TestBed.createComponent(ProfessorAppealInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
