import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmtkBpmnVisualizerComponent } from './pmtk-bpmn-visualizer.component';

describe('PmtkBpmnVisualizerComponent', () => {
  let component: PmtkBpmnVisualizerComponent;
  let fixture: ComponentFixture<PmtkBpmnVisualizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PmtkBpmnVisualizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmtkBpmnVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
