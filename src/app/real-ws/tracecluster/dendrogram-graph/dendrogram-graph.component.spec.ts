import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DendrogramGraphComponent } from './dendrogram-graph.component';

describe('DendrogramGraphComponent', () => {
  let component: DendrogramGraphComponent;
  let fixture: ComponentFixture<DendrogramGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DendrogramGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DendrogramGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
