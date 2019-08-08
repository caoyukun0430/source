import {Component, OnInit, ViewEncapsulation, Input, ElementRef, ViewChild, OnChanges} from '@angular/core';
import { Pm4pyService } from 'app/pm4py-service.service';
import * as d3 from 'd3';
export * from 'd3-scale';
import {MatChip, MatDialog} from '@angular/material';
import {WaitingCircleComponentComponent} from "../../waiting-circle-component/waiting-circle-component.component";
import {HttpParams} from "@angular/common/http";
import { colorRange, eventsColorMap } from "../variants-explorer-model";

interface VariantsModel {
  caseDuration: any;
  count: number;
  variant: string;
  events: string[];
}

@Component({
  selector: 'app-graph-variant-traces',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './graph-variant-traces.component.html',
  styleUrls: ['./graph-variant-traces.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class GraphVariantTracesComponent implements OnChanges {
  // @ts-ignore
  @ViewChild('chart', {static: false})
  private chartContainer: ElementRef;

  @Input()
  variants: VariantsModel[];

  @Input('cdkDragFreeDragPosition')
  freeDragPosition: { x: number; y: number; };

  public isLoading: boolean;
  public variantsLoading: boolean;
  public casesLoading: boolean;

  categoryForVisibility = [
    { title: 'All', isSelected: 'true' },
    { title: 'Top 10', isSelected: 'false'},
    { title: 'Top 5', isSelected: 'false'}
  ];

  polygonDimensionWidth;
  polygonDimensionHeight;
  polygonDimensionSpacing;
  polygonDimensionTailWidth;

  private events: Set<string> = new Set();
  private eventsForColorMapToShow;

  private arrIsVariantsSelected: boolean[];
  private prevSelectedVariantIndex: number = null;
  private variantSelected: string;

  private pm4pyJsonCases;
  private allCases;
  private cases;

  dragPosition = {x: 0, y: 0};
  chipsSelectable: boolean = true;

  constructor(
      private pm4pyService: Pm4pyService,
      private dialog: MatDialog ) {
    this.isLoading = false;
    this.variantsLoading = false;
    this.casesLoading = false;
  }

  ngOnChanges(): void {
    console.log('graph-traces: onChanges');
    if (!this.variants) { return; }
    this.arrIsVariantsSelected = new Array(this.variants.length).fill(false);
    this.setColorMap();
    this.setPolygonDimension(25, 30, 3, 10);
    this.createChart();
    this.getAllCases();
  }

  private setColorMap(): void {
    for (let i = 0; i < this.variants.length; i++) {
      for ( let j = 0; j < this.variants[i].events.length; j++) {
        this.events.add(this.variants[i].events[j].split('+')[0]);
      }
    }

    const colors = d3.scaleOrdinal()
        .domain([0, this.events.size])
        .range(colorRange);

    let count = 0;
    this.events.forEach( (event) => {
      eventsColorMap.set(event, colors(count));
      count++;
    });
    this.eventsForColorMapToShow = eventsColorMap;
  }

  private createChart(): void {
    d3.select('svg').remove();
    const element = this.chartContainer.nativeElement;
    const data = this.variants;


    const chartDiv = d3.select(element).append('div').append('svg')
        .attr('width', element.offsetWidth)
        .attr('height', data.length * 50);
    const g = chartDiv.selectAll('g')
        .data(data)
        .enter()
        .append('svg:g')
        .attr('width', (d) => (this.polygonDimensionWidth + this.polygonDimensionTailWidth) * d.events.length)
        .attr('height', 50)
        .attr('transform', (d, i) => 'translate(0, ' + i * 50 + ')')
        .on('click', (d, i) => {
              if (i == this.prevSelectedVariantIndex) {
                if (this.arrIsVariantsSelected[i] == true) {
                  this.foldingTrace(d, i);
                  //this.variantSelected = null;
                  this.removeCases();
                }
                else {
                  this.expandingTrace(d, i);
                  this.prevSelectedVariantIndex = i;
                  //console.log("d: " + d.variant + ", i: " + i);
                  //this.variantSelected = d.variants;
                  this.getAllCases(this.variants[i]['variant']);
                }
              } else {
                this.foldingTrace(d, this.prevSelectedVariantIndex);
                this.removeCases();
                this.expandingTrace(d, i);
                //console.log("d: " + d.variant + ", i: " + i);
                //this.variantSelected = d.variants;
                //console.log("selected Variants: "+d);
                this.getAllCases(this.variants[i].variant);
                this.prevSelectedVariantIndex = i;
              }
            }
        );

    const polygon = g.selectAll('polygon')
        .data((d) => d.events)
        .enter()
        .append('svg:polygon')
        .attr('points', (d, i) => this.getTracePoints(i))
        .style('fill', (d, i) => eventsColorMap.get(d.split('+')[0]))
        .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)');
  }

  private setPolygonDimension(w, h, s, tw): void {
    this.polygonDimensionWidth = w;
    this.polygonDimensionHeight = h;
    this.polygonDimensionSpacing = s;
    this.polygonDimensionTailWidth = tw;
  }

  private getTracePoints(i) {
    const points = [];
    points.push('0,0');
    points.push(this.polygonDimensionWidth + ',0');
    points.push(this.polygonDimensionWidth + this.polygonDimensionTailWidth + ',' + (this.polygonDimensionHeight / 2));
    points.push(this.polygonDimensionWidth + ',' + this.polygonDimensionHeight);
    points.push('0,' + this.polygonDimensionHeight);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(this.polygonDimensionTailWidth + ',' + (this.polygonDimensionHeight / 2));
    }
    return points.join(' ');
  }

  private foldingTrace(d, i) {
    this.setPolygonDimension(25, 30, 3, 10);
    const prev_g = d3.selectAll('g').filter((d, j) => j === i);
    prev_g.selectAll('polygon').remove();
    prev_g.selectAll('polygon')
        .data((d) => d.events)
        .enter()
        .append('svg:polygon')
        .attr('points', (d, i) => this.getTracePoints(i))
        .style('fill', (d, i) => eventsColorMap.get(d.split('+')[0]))
        .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)');
    this.arrIsVariantsSelected[i] = false;
  }

  private expandingTrace(d, i) {
    this.setPolygonDimension(75, 30, 3, 10);
    const g = d3.selectAll('g').filter((d, j) => j === i);
    g.selectAll('polygon').remove();
    g.selectAll('polygon')
        .data((d) => d.events)
        .enter()
        .append('svg:polygon')
        .attr('points', (d, i) => this.getTracePoints(i))
        .style('fill', (d, i) => eventsColorMap.get(d.split('+')[0]))
        .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)');
    this.arrIsVariantsSelected[i] = true;
  }

  getAllCases(variant?: string) {
    this.dialog.open(WaitingCircleComponentComponent);

    //console.log("selected variants: " + variant);
    this.casesLoading = true;
    this.isLoading = this.variantsLoading || this.casesLoading;
    let params: HttpParams = new HttpParams();

    if (variant != null) {
      params = params.set('variant', variant);
    }

    this.pm4pyService.getAllCases(params).subscribe(data => {
      this.pm4pyJsonCases = data as JSON;
      this.cases = this.pm4pyJsonCases['cases'];
      this.casesLoading = false;
      this.isLoading = this.variantsLoading || this.casesLoading;

      if (variant == null) {
        this.allCases = this.cases;
      }
      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    })
  }


  private removeCases() {
    this.cases = this.allCases;
  }

  resetPosition() {
    this.dragPosition = {x: this.dragPosition.x, y: this.dragPosition.y};
  }

  showLegend(chipRef: MatChip) {
    var legendBox = document.getElementById('legendBox');
    chipRef.toggleSelected();
    if ( chipRef.selected ) {
      legendBox.style.visibility = 'visible';
    } else {
      legendBox.style.visibility = 'hidden';
    }
  }

  dragStarted(dragEvent) {
    dragEvent.source.getRootElement().style.zIndex = dragEvent.source.getRootElement().style.zIndex + 10;
  }

  onResize($event: any) {
    // resize event
  }
}

