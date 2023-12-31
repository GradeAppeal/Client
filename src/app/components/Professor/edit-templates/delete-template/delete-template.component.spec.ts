import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTemplateComponent } from './delete-template.component';

describe('DeleteTemplateComponent', () => {
  let component: DeleteTemplateComponent;
  let fixture: ComponentFixture<DeleteTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteTemplateComponent]
    });
    fixture = TestBed.createComponent(DeleteTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
