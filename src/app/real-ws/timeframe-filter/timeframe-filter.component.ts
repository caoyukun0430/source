import { Component, OnInit } from '@angular/core';
import {Pm4pyService} from "../../pm4py-service.service";
import {AuthenticationServiceService} from '../../authentication-service.service';
import { FilterServiceService } from '../../filter-service.service';
import {HttpParams} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
declare var Plotly: any;
declare var $: any;

@Component({
  selector: 'app-timeframe-filter',
  templateUrl: './timeframe-filter.component.html',
  styleUrls: ['./timeframe-filter.component.scss']
})
export class TimeframeFilterComponent implements OnInit {
  public filteringMethod : string;
  points: any;
  points_x: any;
  points_y: any;
  points_x_date: any;
  min_timestamp : number;
  max_timestamp : number;
  loaded : boolean;
  eventsPerTimeSvgOriginal: string;
  eventsPerTimeSvgSanitized: SafeResourceUrl;
  public selected_min_timestamp : string;
  public selected_max_timestamp : string;

  constructor(private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public filterService : FilterServiceService, private _sanitizer: DomSanitizer, public dialog: MatDialog) {
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
    if (this.selected_min_timestamp.indexOf('.')>0){
        this.selected_min_timestamp = this.selected_min_timestamp.substring(0, this.selected_min_timestamp.indexOf('.'));
    }

    if (this.selected_max_timestamp.indexOf('.')>0){
        this.selected_max_timestamp = this.selected_max_timestamp.substring(0, this.selected_max_timestamp.indexOf('.'));
    }


    this.min_timestamp = this.dateConverter(this.selected_min_timestamp);
    this.max_timestamp = this.dateConverter(this.selected_max_timestamp);
    console.log("date",this.min_timestamp);

    let filterStri = String(this.min_timestamp)+"@@@"+String(this.max_timestamp);

    console.log("FILTERSTRI");
    console.log(filterStri);

    this.filterService.addFilter(this.filteringMethod, filterStri);
  }

  getTimeframeGraph() {
    let params: HttpParams = new HttpParams();

    let thisDialog = this.dialog.open(WaitingCircleComponentComponent);


    this.pm4pyServ.getEventsPerTime(params).subscribe(data => {
      let eventsPerTimeJson = data as JSON;
      this.points = eventsPerTimeJson["points"];
      this.points_x = eventsPerTimeJson["points_x"];
      this.points_y = eventsPerTimeJson["points_y"];
      var points_x_date = new Array();

      for (var i=0;i<this.points_x.length;i++){
        points_x_date[i] = this.timeConverter(this.points_x[i]);
      }


      var TIMEFRAME_PLOT = $('#timeframe_plot')[0];

      var plot_data = [{
      x: points_x_date,
      y: this.points_y}];

      var layout = {
      title: 'Events per Time Graph',
      margin: { t: 0 },
      xaxis: {
      title: 'Date',
      autorange: true,
      },
      yaxis: {
      title: 'Density',
      exponentformat: 'e',
      showexponent: 'all'
      }
      };

      Plotly.plot( TIMEFRAME_PLOT, plot_data, layout );
      TIMEFRAME_PLOT.on('plotly_relayout',function(plot_data){
        var min_range = plot_data["xaxis.range[0]"];
        var max_range = plot_data["xaxis.range[1]"];
        (<HTMLInputElement>document.getElementById("minimumTimestamp")).value = String(min_range);
        (<HTMLInputElement>document.getElementById("maximumTimestamp")).value = String(max_range);

    });


      // this.eventsPerTimeSvgOriginal = eventsPerTimeJson["base64"];
      // this.eventsPerTimeSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.eventsPerTimeSvgOriginal);

      if (this.points.length > 0) {
        this.min_timestamp = Math.floor(this.points[0][0]);
        this.max_timestamp = Math.ceil(this.points[this.points.length - 1][0]);
        this.selected_min_timestamp = this.timeConverter(this.min_timestamp);
        this.selected_max_timestamp = this.timeConverter(this.max_timestamp);
        (<HTMLInputElement>document.getElementById("minimumTimestamp")).value = this.selected_min_timestamp;
        (<HTMLInputElement>document.getElementById("maximumTimestamp")).value = this.selected_max_timestamp;
      }

      thisDialog.close();
    });
  }

  timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = String(a.getDate());
    var hour = String(a.getHours());
    var min = String(a.getMinutes());
    var sec = String(a.getSeconds());

    if (date.length < 2) {
      date = "0" + date;
    }
    if (hour.length < 2) {
      hour = "0" + hour;
    }
    if (min.length < 2) {
      min = "0" + min;
    }
    if (sec.length < 2) {
      sec = "0" + sec;
    }
    var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  dateConverter(date_string) {
    var unixTimeZero = Date.parse(date_string) / 1000;

    return unixTimeZero;
  }
}
