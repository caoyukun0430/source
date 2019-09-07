import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceClusterComponent } from './trace-cluster.component';

describe('TraceClusterComponent', () => {
  let component: TraceClusterComponent;
  let fixture: ComponentFixture<TraceClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraceClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
