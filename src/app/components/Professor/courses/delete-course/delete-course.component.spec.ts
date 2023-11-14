import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCourseComponent } from './delete-course.component';

describe('DeleteCourseComponent', () => {
  let component: DeleteCourseComponent;
  let fixture: ComponentFixture<DeleteCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteCourseComponent]
    });
    fixture = TestBed.createComponent(DeleteCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
