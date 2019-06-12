import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeframeFilterComponent } from './timeframe-filter.component';

describe('TimeframeFilterComponent', () => {
  let component: TimeframeFilterComponent;
  let fixture: ComponentFixture<TimeframeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeframeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeframeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
