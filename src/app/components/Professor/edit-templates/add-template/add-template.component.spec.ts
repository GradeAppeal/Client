import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemplateComponent } from './add-template.component';

describe('AddTemplateComponent', () => {
  let component: AddTemplateComponent;
  let fixture: ComponentFixture<AddTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTemplateComponent]
    });
    fixture = TestBed.createComponent(AddTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
