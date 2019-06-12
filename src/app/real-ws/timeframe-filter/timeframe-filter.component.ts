import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeframe-filter',
  templateUrl: './timeframe-filter.component.html',
  styleUrls: ['./timeframe-filter.component.scss']
})
export class TimeframeFilterComponent implements OnInit {
  public filteringMethod : string;

  constructor() {
    this.filteringMethod = "timestamp_trace_intersecting";
  }

  ngOnInit() {
  }

}
