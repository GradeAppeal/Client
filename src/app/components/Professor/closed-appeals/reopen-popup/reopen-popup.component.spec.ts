import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReopenPopupComponent } from './reopen-popup.component';

describe('ReopenPopupComponent', () => {
  let component: ReopenPopupComponent;
  let fixture: ComponentFixture<ReopenPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReopenPopupComponent]
    });
    fixture = TestBed.createComponent(ReopenPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
