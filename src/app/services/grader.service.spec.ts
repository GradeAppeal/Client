import { TestBed } from '@angular/core/testing';

import { GraderService } from './grader.service';

describe('GraderService', () => {
  let service: GraderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
