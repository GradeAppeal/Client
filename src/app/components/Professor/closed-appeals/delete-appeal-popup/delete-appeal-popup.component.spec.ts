import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAppealPopupComponent } from './delete-appeal-popup.component';

describe('DeleteAppealPopupComponent', () => {
  let component: DeleteAppealPopupComponent;
  let fixture: ComponentFixture<DeleteAppealPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteAppealPopupComponent]
    });
    fixture = TestBed.createComponent(DeleteAppealPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
