import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../authentication-service.service';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

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

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService) {
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

    this.pm4pyService.getEventsPerTime(params).subscribe(data => {
      this.eventsPerTimeJson = data as JSON;
      this.eventsPerTimeSvgOriginal = this.eventsPerTimeJson["base64"];
      this.eventsPerTimeSvgSanitized = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.eventsPerTimeSvgOriginal);
      this.eventsPerTimeLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;
    }, err => {
      alert("Error loading events per time statistic");
      this.eventsPerTimeLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;
    });
  }

  getCaseDuration() {
    /**
     * Gets the case duration graph from the service
     * and display it as part of the page
     */
    let params: HttpParams = new HttpParams();

    this.pm4pyService.getCaseDurationGraph(params).subscribe(data => {
      this.caseDurationJson = data as JSON;
      this.caseDurationSvgOriginal = this.caseDurationJson["base64"];
      this.caseDurationSvgSanitized = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.caseDurationSvgOriginal);
      this.caseDurationLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;
    }, err => {
      alert("Error loading case duration statistic");
      this.caseDurationLoading = false;
      this.isLoading = this.eventsPerTimeLoading || this.caseDurationLoading;
    });
  }

  ngOnInit() {
    /**
     * Method that is called at the initialization of the component
     */
  }

}
