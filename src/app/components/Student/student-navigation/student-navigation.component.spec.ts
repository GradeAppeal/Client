import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentNavigationComponent } from './student-navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

describe('StudentNavigationComponent', () => {
  let component: StudentNavigationComponent;
  let fixture: ComponentFixture<StudentNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentNavigationComponent],
      imports: [MatToolbarModule, MatSidenavModule],
    });
    fixture = TestBed.createComponent(StudentNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
