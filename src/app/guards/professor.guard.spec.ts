import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { professorGuard } from './professor.guard';

describe('professorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => professorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
