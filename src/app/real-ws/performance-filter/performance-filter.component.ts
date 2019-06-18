import { Component, OnInit } from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Pm4pyService} from "../../pm4py-service.service";
import {AuthenticationServiceService} from '../../authentication-service.service';
import { FilterServiceService } from '../../filter-service.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';


@Component({
  selector: 'app-performance-filter',
  templateUrl: './performance-filter.component.html',
  styleUrls: ['./performance-filter.component.scss']
})
export class PerformanceFilterComponent implements OnInit {

  points: any;
  min_performance : number;
  max_performance : number;
  loaded : boolean;
  caseDurationSvgOriginal: string;
  caseDurationSvgSanitized: SafeResourceUrl;
  public selected_min_performance : string;
  public selected_max_performance : string;

  constructor(private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public filterService : FilterServiceService, private _sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.min_performance = -1.0;
    this.max_performance = -1.0;
    this.loaded = false;

    this.selected_min_performance = String(this.min_performance);
    this.selected_max_performance = String(this.max_performance);

    this.authService.checkAuthentication().subscribe(data => {
    });

    this.getPerformanceGraph();
  }

  getPerformanceGraph() {
    let params: HttpParams = new HttpParams();

    let thisDialog = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyServ.getCaseDurationGraph(params).subscribe(data => {
      let caseDurationJson = data as JSON;
      this.points = caseDurationJson["points"];

      this.caseDurationSvgOriginal = caseDurationJson["base64"];
      this.caseDurationSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.caseDurationSvgOriginal);

      if (this.points.length > 0) {
        this.min_performance = Math.floor(this.points[0][0]);
        this.max_performance = Math.ceil(this.points[this.points.length - 1][0]);
        this.selected_min_performance = String(this.min_performance);
        this.selected_max_performance = String(this.max_performance);

        (<HTMLInputElement>document.getElementById("minimumPerformance")).value = this.selected_min_performance;
        (<HTMLInputElement>document.getElementById("maximumPerformance")).value = this.selected_max_performance;
      }

      this.loaded = true;
      thisDialog.close();
    });
  }

  ngOnInit() {
  }

  applyFilter() {
    this.selected_min_performance = (<HTMLInputElement>document.getElementById("minimumPerformance")).value;
    this.selected_max_performance = (<HTMLInputElement>document.getElementById("maximumPerformance")).value;

    this.min_performance = parseInt(this.selected_min_performance);
    this.max_performance = parseInt(this.selected_max_performance);

    this.filterService.addFilter("case_performance_filter", String(this.min_performance)+"@@@"+String(this.max_performance));

  }
}
