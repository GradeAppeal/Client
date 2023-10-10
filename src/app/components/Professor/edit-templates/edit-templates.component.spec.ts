import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTemplatesComponent } from './edit-templates.component';

describe('EditTemplatesComponent', () => {
  let component: EditTemplatesComponent;
  let fixture: ComponentFixture<EditTemplatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditTemplatesComponent]
    });
    fixture = TestBed.createComponent(EditTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
