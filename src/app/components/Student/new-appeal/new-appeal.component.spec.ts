import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAppealComponent } from './new-appeal.component';
import { ActivatedRoute } from '@angular/router';

describe('NewAppealComponent', () => {
  let component: NewAppealComponent;
  let fixture: ComponentFixture<NewAppealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewAppealComponent],
      imports: [ActivatedRoute],
    });
    fixture = TestBed.createComponent(NewAppealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
