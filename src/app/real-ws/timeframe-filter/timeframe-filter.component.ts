import { Component, OnInit } from '@angular/core';
import {Pm4pyService} from "../../pm4py-service.service";
import {AuthenticationServiceService} from '../../authentication-service.service';
import { FilterServiceService } from '../../filter-service.service';
import {HttpParams} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-timeframe-filter',
  templateUrl: './timeframe-filter.component.html',
  styleUrls: ['./timeframe-filter.component.scss']
})
export class TimeframeFilterComponent implements OnInit {
  public filteringMethod : string;
  points: any;
  min_timestamp : number;
  max_timestamp : number;
  loaded : boolean;
  eventsPerTimeSvgOriginal: string;
  eventsPerTimeSvgSanitized: SafeResourceUrl;
  public selected_min_timestamp : string;
  public selected_max_timestamp : string;

  constructor(private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public filterService : FilterServiceService, private _sanitizer: DomSanitizer) {
    this.filteringMethod = "timestamp_trace_intersecting";

    this.min_timestamp = -1.0;
    this.max_timestamp = -1.0;
    this.loaded = false;

    this.selected_min_timestamp = String(this.min_timestamp);
    this.selected_max_timestamp = String(this.max_timestamp);

    this.authService.checkAuthentication().subscribe(data => {
    });

    this.getTimeframeGraph();
  }

  ngOnInit() {
  }

  applyFilter() {
    this.selected_min_timestamp = (<HTMLInputElement>document.getElementById("minimumTimestamp")).value;
    this.selected_max_timestamp = (<HTMLInputElement>document.getElementById("maximumTimestamp")).value;

    this.min_timestamp = parseInt(this.selected_min_timestamp);
    this.max_timestamp = parseInt(this.selected_max_timestamp);

    this.filterService.addFilter(this.filteringMethod, String(this.min_timestamp)+"@@@"+String(this.max_timestamp));
  }

  getTimeframeGraph() {
    let params: HttpParams = new HttpParams();

    this.pm4pyServ.getEventsPerTime(params).subscribe(data => {
      let eventsPerTimeJson = data as JSON;
      this.points = eventsPerTimeJson["points"];

      this.eventsPerTimeSvgOriginal = eventsPerTimeJson["base64"];
      this.eventsPerTimeSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.eventsPerTimeSvgOriginal);


      if (this.points.length > 0) {
        this.min_timestamp = Math.floor(this.points[0][0]);
        this.max_timestamp = Math.ceil(this.points[this.points.length - 1][0]);
        this.selected_min_timestamp = String(this.min_timestamp);
        this.selected_max_timestamp = String(this.max_timestamp);

        (<HTMLInputElement>document.getElementById("minimumTimestamp")).value = this.selected_min_timestamp;
        (<HTMLInputElement>document.getElementById("maximumTimestamp")).value = this.selected_max_timestamp;
      }
    });
  }
}
