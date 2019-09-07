import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../authentication-service.service';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';
declare var Plotly: any;
declare var $: any;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  points_x: any;
  points_y: any;
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  eventsPerTimeJson: JSON;
  eventsPerTimeSvgOriginal: string;
  eventsPerTimeSvgSanitized: SafeResourceUrl;
  caseDurationJson: JSON;
  caseDurationSvgOriginal: string;
  caseDurationSvgSanitized: SafeResourceUrl;
  public isLoading: boolean = true;
  public eventsPerTimeLoading: boolean = true;
  public caseDurationLoading: boolean = true;


  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
    /**
     * Constructor
     */
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.authService.checkAuthentication().subscribe(data => {
    });

    // calls the construction of the events per time graph
    this.getEventsPerTime();
    // calls the construction of the case duration graph
    this.getCaseDuration();
  }

  getEventsPerTime() {
    /**
     * Gets the event per time graph from the service
     * and display it as part of the page
     */
    let params: HttpParams = new HttpParams();

    this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getEventsPerTime(params).subscribe(data => {
      this.eventsPerTimeJson = data as JSON;
      this.points_x = this.eventsPerTimeJson["points_x"];
      this.points_y = this.eventsPerTimeJson["points_y"];
      var points_x_date = new Array();

      for (var i=0;i<this.points_x.length;i++){
        points_x_date[i] = this.timeConverter(this.points_x[i]);
      }

      var TIMEFRAME_PLOT = $('#timeframe_plot')[0];

      var plot_data = [{
      x: points_x_date,
      y: this.points_y}];

      var layout = {
      title: {
         text:'Events per Time Graph'
      },
      plot_bgcolor:'rgba(0,0,0,0.1)',
      paper_bgcolor:'rgba(0,0,0,0.1)',
      xaxis: {
      title: 'Date',
      autorange: true,
      //range: [String(points_x_date[0]), String(points_x_date[-1])]
      },
      yaxis: {
      title: 'Density',
      exponentformat: 'e',
      showexponent: 'all'
      }
      };

      Plotly.plot( TIMEFRAME_PLOT, plot_data, layout );


      // this.eventsPerTimeSvgOriginal = this.eventsPerTimeJson["base64"];
      // this.eventsPerTimeSvgSanitized = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.eventsPerTimeSvgOriginal);
      this.eventsPerTimeLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    }, err => {
      alert("Error loading events per time statistic");
      this.eventsPerTimeLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
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

  getCaseDuration() {
    /**
     * Gets the case duration graph from the service
     * and display it as part of the page
     */
    let params: HttpParams = new HttpParams();

    this.pm4pyService.getCaseDurationGraph(params).subscribe(data => {
      this.caseDurationJson = data as JSON;
      this.points_x = this.caseDurationJson["points_x"];
      this.points_y = this.caseDurationJson["points_y"];

      var DURATION_PLOT = $('#duration_plot')[0];
      var plot_data = [{
      x: this.points_x,
      y: this.points_y}];


      var layout = {
      title: 'Case Duration Graph',
      plot_bgcolor:'rgba(0,0,0,0.1)',
      paper_bgcolor:'rgba(0,0,0,0.1)',
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


      // this.caseDurationSvgOriginal = this.caseDurationJson["base64"];
      // this.caseDurationSvgSanitized = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.caseDurationSvgOriginal);
      this.caseDurationLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    }, err => {
      alert("Error loading case duration statistic");
      this.caseDurationLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    });
  }

  ngOnInit() {
    /**
     * Method that is called at the initialization of the component
     */
  }

}
