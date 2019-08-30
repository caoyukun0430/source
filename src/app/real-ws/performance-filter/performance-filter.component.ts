import { Component, OnInit } from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Pm4pyService} from "../../pm4py-service.service";
import {AuthenticationServiceService} from '../../authentication-service.service';
import { FilterServiceService } from '../../filter-service.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
import Plotly from 'plotly.js-dist';
import * as d3 from "d3";
declare var Plotly: any;
declare var $: any;


@Component({
  selector: 'app-performance-filter',
  templateUrl: './performance-filter.component.html',
  styleUrls: ['./performance-filter.component.scss']
})
export class PerformanceFilterComponent implements OnInit {

  points: any;
  points_x: any;
  points_y: any;
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
      this.points_x = caseDurationJson["points_x"];
      this.points_y = caseDurationJson["points_y"];

      //console.log('x',this.points);

    //var DURA_PLOT = document.getElementById('dura_plot');
    var DURATION_PLOT = $('#duration_plot')[0];
    var plot_data = [{
      x: this.points_x,
      y: this.points_y}];

    var layout = {
      title: 'Case Duration Graph',
      margin: { t: 0 },
      xaxis: {
      title: 'Case Duration',
      exponentformat: 'e',
      showexponent: 'all'
      },
      yaxis: {
      title: 'Density',
      exponentformat: 'e',
      showexponent: 'all'
      }
    };

    Plotly.plot( DURATION_PLOT, plot_data, layout );


    DURATION_PLOT.on('plotly_relayout',function(plot_data){
        (<HTMLInputElement>document.getElementById("minimumPerformance")).value = String(Math.floor(plot_data["xaxis.range[0]"]));
        (<HTMLInputElement>document.getElementById("maximumPerformance")).value = String(Math.ceil(plot_data["xaxis.range[1]"]));

    });


      //this.caseDurationSvgOriginal = caseDurationJson["base64"];
      //this.caseDurationSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.caseDurationSvgOriginal);

      if (this.points.length > 0) {
        this.min_performance = Math.floor(this.points[0][0]);
        this.max_performance = Math.ceil(this.points[this.points.length - 1][0]);
        this.selected_min_performance = String(this.min_performance);
        this.selected_max_performance = String(this.max_performance);
        //console.log('selectmax',this.selected_max_performance);
        //console.log('selectmin',this.selected_min_performance);


        (<HTMLInputElement>document.getElementById("minimumPerformance")).value = this.selected_min_performance;
        (<HTMLInputElement>document.getElementById("maximumPerformance")).value = this.selected_max_performance;
      }





      this.loaded = true;
      thisDialog.close();
    });
  }

  public ngOnInit()
  {

  }

  applyFilter() {
    this.selected_min_performance = (<HTMLInputElement>document.getElementById("minimumPerformance")).value;
    this.selected_max_performance = (<HTMLInputElement>document.getElementById("maximumPerformance")).value;

    //console.log('filmax',this.selected_max_performance);
    //console.log('filmin',this.selected_min_performance);

    this.min_performance = parseInt(this.selected_min_performance);
    this.max_performance = parseInt(this.selected_max_performance);

    this.filterService.addFilter("case_performance_filter", String(this.min_performance)+"@@@"+String(this.max_performance));

  }
}
