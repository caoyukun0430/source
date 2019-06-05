import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatSort } from '@angular/material';
import {AuthenticationServiceService} from '../../authentication-service.service';

interface Variant {
  variant: string;
  count: number;
}

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class CasesComponent implements OnInit, AfterViewInit {

  public isLoading: boolean;
  public variantsLoading : boolean;
  public casesLoading : boolean;
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  pm4pyJsonVariants : JSON;
  pm4pyJsonCases : JSON;
  pm4pyJsonEvents : JSON;
  variants : any[];
  cases : any[];
  events : any[];
  displayedColumnsVariants : string[] = ["variant", "count", "caseDuration"];
  displayedColumnsCases : string[] = ["caseId", "caseDuration", "startTime", "endTime"];
  displayedColumnsEvents : string[] = ["concept:name", "org:resource", "time:timestamp", "lifecycle:transition"];

  dataSourceVariants = new MatTableDataSource<any>();
  dataSourceCases = new MatTableDataSource<any>();
  dataSourceEvents = new MatTableDataSource<any>();

  width : number = 1310;
  height : number = 170;
  caseIsSelected : boolean = false;
  caseSelected : string;
  variantSelected : string;

  logSummaryJson: JSON;
  public thisVariantsNumber = 0;
  public thisCasesNumber = 0;
  public thisEventsNumber = 0;
  public ancestorVariantsNumber = 0;
  public ancestorCasesNumber = 0;
  public ancestorEventsNumber = 0;
  public ratioVariantsNumber = 100;
  public ratioCasesNumber = 100;
  public ratioEventsNumber = 100;

  @ViewChild(MatSort) casesSort: MatSort;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService) {
    /**
     * Constructor
     */

    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.variantsLoading = false;
    this.casesLoading = false;
    this.isLoading = false;

    this.variantSelected = null;

    this.authService.checkAuthentication().subscribe(data => {
    });


    this.getAllVariants();
    this.getAllCases();
    this.getLogSummary();
  }

  public getLogSummary() {
    /**
     * Retrieves the log summary and updates the visualization
     */
    let params: HttpParams = new HttpParams();

    this.pm4pyService.getLogSummary(params).subscribe(data => {
      this.logSummaryJson = data as JSON;
      this.thisVariantsNumber = this.logSummaryJson["this_variants_number"];
      this.thisCasesNumber = this.logSummaryJson["this_cases_number"];
      this.thisEventsNumber = this.logSummaryJson["this_events_number"];
      this.ancestorVariantsNumber = this.logSummaryJson["ancestor_variants_number"];
      this.ancestorCasesNumber = this.logSummaryJson["ancestor_cases_number"];
      this.ancestorEventsNumber = this.logSummaryJson["ancestor_events_number"];
      if (this.ancestorVariantsNumber > 0) {
        this.ratioVariantsNumber = this.thisVariantsNumber / this.ancestorVariantsNumber * 100.0;
        this.ratioCasesNumber = this.thisCasesNumber / this.ancestorCasesNumber * 100.0;
        this.ratioEventsNumber = this.thisEventsNumber / this.ancestorEventsNumber * 100.0;
      }
      else {
        this.ratioVariantsNumber = 100;
        this.ratioCasesNumber = 100;
        this.ratioEventsNumber = 100;
      }
    });
  }

  ngOnInit() {
    /**
     * Manages the initialization of the component
     */
  }

  public secondsToString(seconds : number) {
    let numdays : number = Math.floor(seconds / 86400);
    let numhours : number = Math.floor((seconds % 86400) / 3600);
    let numminutes : number = Math.floor(((seconds % 86400) % 3600) / 60);
    let numseconds : number = Math.floor(((seconds % 86400) % 3600) % 60);

    if (numdays >= 1) {
      return numdays.toString() + " days " + numhours.toString() + " hours";
    }
    else if (numhours >= 1) {
      return  numhours.toString() + " hours " + numminutes.toString()+" minutes";
    }
    else if (numminutes >= 1) {
      return numminutes.toString() + " minutes " + numseconds.toString()+"seconds";
    }
    else if (numseconds >= 1) {
      return numseconds.toString()+" seconds";
    }
    return "0 seconds";
  }

  public get_repr_time(s : number) {
    return new Date(s * 1e3).toISOString();
  }

  getAllVariants() {
    this.variantsLoading = true;
    this.isLoading = this.variantsLoading || this.casesLoading;
    let params: HttpParams = new HttpParams();
    this.pm4pyService.getAllVariants(params).subscribe(data => {
      this.pm4pyJsonVariants = data as JSON;
      this.variants = this.pm4pyJsonVariants["variants"];
      let i : number = 0;
      while (i < this.variants.length) {
        let keys : string[] = Object.keys(this.variants[i]);
        this.variants[i] = {"variant": this.variants[i]["variant"], "count": this.variants[i]["count"], "caseDuration": this.variants[i]["caseDuration"]};
        i++;
      }
      this.variantsLoading = false;
      this.isLoading = this.variantsLoading || this.casesLoading;
      this.dataSourceVariants.data = this.variants;
      console.log(this.variants);
    })
  }

  getAllCases() {
    this.casesLoading = true;
    this.isLoading = this.variantsLoading || this.casesLoading;
    let params : HttpParams = new HttpParams();

    if (this.variantSelected != null) {
      params = params.set("variant", this.variantSelected);
    }

    this.pm4pyService.getAllCases(params).subscribe(data => {
      this.pm4pyJsonCases = data as JSON;
      this.cases = this.pm4pyJsonCases["cases"];
      this.casesLoading = false;
      this.isLoading = this.variantsLoading || this.casesLoading;
      this.dataSourceCases.data = this.cases;
      this.dataSourceCases.sort = this.casesSort;
      console.log(this.cases);
    })
  }

  setTableSize() {
    //this.height = Math.floor(0.25 * window.innerHeight);
    this.width = Math.floor(0.705 * window.innerWidth);

    console.log(this.width);
    //console.log(this.height);
  }

  onResize(event) {
    /**
     * Manages the resizing of a page
     */
    // sets the image size after the resizing
    this.setTableSize();
  }

  ngAfterViewInit() {
    this.setTableSize();
  }

  caseClicked(row) {
    this.caseSelected = row["caseId"];
    document.getElementById("tableEvents").style.display = '';

    let params : HttpParams = new HttpParams();
    params = params.set("caseid", this.caseSelected);
    this.pm4pyService.getEvents(params).subscribe(data => {
      this.pm4pyJsonEvents = data as JSON;
      this.events = this.pm4pyJsonEvents["events"];
      this.dataSourceEvents.data = this.events;
      this.caseIsSelected = true;
      console.log(this.events);
    })
  }

  variantClicked(row) {
    this.variantSelected = row["variant"];
    this.getAllCases();
  }


}
