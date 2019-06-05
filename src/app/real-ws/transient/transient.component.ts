import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../authentication-service.service';

@Component({
  selector: 'app-transient',
  templateUrl: './transient.component.html',
  styleUrls: ['./transient.component.scss']
})
export class TransientComponent implements OnInit {
  public isLoading: boolean;
  processModelBase64Original: string;
  processModelBase64Sanitized: SafeResourceUrl;
  pm4pyJson: JSON;
  public delay: number = 11.36675;
  public selectedDelay : number = 11.36675;
  public expSelectedDelay : number = Math.exp(this.selectedDelay);
  public shownString : string = this.secondsToString(this.expSelectedDelay);
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.authService.checkAuthentication().subscribe(data => {
    });

    // calls the retrieval of the simulation from the service
    this.populateSimulation();
  }

  ngOnInit() {
  }

  secondsToString(seconds : number) {
    let numdays : number = Math.floor(seconds / 86400);
    let numhours : number = Math.floor((seconds % 86400) / 3600);
    let numminutes : number = Math.floor(((seconds % 86400) % 3600) / 60);
    let numseconds : number = Math.floor(((seconds % 86400) % 3600) % 60);

    if (numdays >= 1) {
      return numdays.toString() + "D " + numhours.toString() + "h";
    }
    else if (numhours >= 1) {
      return  numhours.toString() + "h " + numminutes.toString()+"m";
    }
    else if (numminutes >= 1) {
      return numminutes.toString() + "m " + numseconds.toString()+"s";
    }
    else if (numseconds >= 1) {
      return numseconds.toString()+"s";
    }
    return "0";
  }

  populateSimulation() {
    this.isLoading = true;
    let params: HttpParams = new HttpParams();
    params = params.set("delay", this.expSelectedDelay.toString());

    this.pm4pyService.transientAnalysis(params).subscribe(data => {
      this.pm4pyJson = data as JSON;
      this.processModelBase64Original = this.pm4pyJson["base64"];
      this.processModelBase64Sanitized = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.processModelBase64Original);
      this.isLoading = false;
    });
  }

  sliderIsChanged(event: any) {
    /**
     * Manages the change to the value selected in the slider
     */
    this.selectedDelay = event.value;
    this.expSelectedDelay  = Math.exp(this.selectedDelay);
    this.shownString = this.secondsToString(this.expSelectedDelay);
    // calls the retrieval of the process schema from the service
    this.populateSimulation();
  }

  manualInputManagement(event) {
    console.log("INPUTCHANGE");
    console.log(event);
    let noDays : number = parseFloat((<HTMLInputElement> document.getElementById("numberDays")).value);
    console.log(noDays);
    let noSeconds : number = noDays * 86400.0;
    this.delay = Math.log(noSeconds);
    this.selectedDelay = Math.log(noSeconds);
    this.expSelectedDelay = noSeconds;
    this.shownString = this.secondsToString(this.expSelectedDelay);
    this.populateSimulation();
  }

}
