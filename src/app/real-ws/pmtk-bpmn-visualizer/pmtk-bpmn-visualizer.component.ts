import {AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';

import * as BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.development.js';

@Component({
  selector: 'app-pmtk-bpmn-visualizer',
  templateUrl: './pmtk-bpmn-visualizer.component.html',
  styleUrls: ['./pmtk-bpmn-visualizer.component.scss']
})
export class PmtkBpmnVisualizerComponent implements OnInit, AfterContentInit, OnDestroy {

  private bpmnJS: BpmnJS;

  @ViewChild('ref') private el: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() private url: string;

  public bpmnModel : string;


  constructor() {
    this.bpmnJS = new BpmnJS();

    this.bpmnModel = localStorage.getItem('bpmn_model');

    this.bpmnJS.importXML(this.bpmnModel, function(err, warnings) {

    });

    this.bpmnJS.on('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });
  }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    // attach BpmnJS instance to DOM element
    this.bpmnJS.attachTo(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    // destroy BpmnJS instance
    this.bpmnJS.destroy();
  }

}
