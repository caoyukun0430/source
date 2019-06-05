import { Component, OnInit } from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {Pm4pyService} from "../../pm4py-service.service";
import {DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl} from "@angular/platform-browser";
import {AuthenticationServiceService} from '../../authentication-service.service';

@Component({
  selector: 'app-sna',
  templateUrl: './sna.component.html',
  styleUrls: ['./sna.component.scss']
})
export class SnaComponent implements OnInit {
  public snaContent : SafeResourceUrl;
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  arcsThreshold : number = 0.0;
  selectedArcsThreshold : number = 0.0;
  metric : string = "handover";

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService) {
    /**
     * Constructor
     */
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.authService.checkAuthentication().subscribe(data => {
    });

    // gets the SNA representation
    this.populateSNA();
  }

  public populateSNA() {
    /**
     * Gets the SNA representation and includes it as an IFrame object
     */
    let process : string = localStorage.getItem("process");
    let sessionId = localStorage.getItem("sessionId");

    let snaPlainUrl : string = this.pm4pyService.getServicePath() + "getSNA?process="+process+"&metric="+this.metric+"&threshold="+this.selectedArcsThreshold+"&session="+sessionId;

    this.snaContent = this.sanitizer.bypassSecurityTrustResourceUrl(snaPlainUrl);

    console.log(snaPlainUrl);

    //this.doResizing();
  }

  ngOnInit() {
  }

  changeSelectedArcValue(event) {
    /**
     * Manages the change on the selected arc value
     */
    this.selectedArcsThreshold = event.value;
    // calls again the SNA representation
    this.populateSNA();
  }

  metricChanged(event) {
    /**
     * Manages the change on the selected metric
     */
    this.metric = event.value;
    // calls again the SNA representation
    this.populateSNA();
  }

}
