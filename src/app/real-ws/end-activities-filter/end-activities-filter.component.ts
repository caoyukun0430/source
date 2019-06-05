import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import { FilterServiceService } from '../../filter-service.service';

@Component({
  selector: 'app-end-activities-filter',
  templateUrl: './end-activities-filter.component.html',
  styleUrls: ['./end-activities-filter.component.scss']
})
export class EndActivitiesFilterComponent implements OnInit {

  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public endActivities : string[];
  public selectedEndActivities : string[];

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.selectedEndActivities = [];
    this.filterService = filterService;
    this.getEndActivities();
  }

  ngOnInit() {
  }

  getEndActivities() {
    let httpParams : HttpParams = new HttpParams();
    this.pm4pyService.getEndActivities(httpParams).subscribe(data => {
      let endActivitiesJSON = data as JSON;
      this.endActivities = endActivitiesJSON["endActivities"];
      console.log(this.endActivities);
    });
  }

  addRemoveSa(sa) {
    if (!this.selectedEndActivities.includes(sa)) {
      this.selectedEndActivities.push(sa);
    }
    else {
      let thisIndex : number = this.selectedEndActivities.indexOf(sa, 0);
      this.selectedEndActivities.splice(thisIndex, 1);
    }
  }

  applyFilter() {
    this.filterService.addFilter("end_activities", this.selectedEndActivities);
  }

}
