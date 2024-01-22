import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorNavigationComponent } from './professor-navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

describe('ProfessorNavigationComponent', () => {
  let component: ProfessorNavigationComponent;
  let fixture: ComponentFixture<ProfessorNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfessorNavigationComponent],
      imports: [MatToolbarModule, MatSidenavModule],
    });
    fixture = TestBed.createComponent(ProfessorNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
