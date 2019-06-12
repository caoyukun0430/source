import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceFilterComponent } from './performance-filter.component';

describe('PerformanceFilterComponent', () => {
  let component: PerformanceFilterComponent;
  let fixture: ComponentFixture<PerformanceFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
