import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient()] }));

  it('should be created', () => {
    const service = TestBed.inject(ApiService);
    expect(service).toBeTruthy();
  });
});
