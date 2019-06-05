import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import { FilterServiceService } from '../../filter-service.service';

@Component({
  selector: 'app-start-activities-filter',
  templateUrl: './start-activities-filter.component.html',
  styleUrls: ['./start-activities-filter.component.scss']
})
export class StartActivitiesFilterComponent implements OnInit {

  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public startActivities : string[];
  public selectedStartActivities : string[];

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.selectedStartActivities = [];
    this.filterService = filterService;
    this.getStartActivities();
  }

  ngOnInit() {
  }

  getStartActivities() {
    let httpParams : HttpParams = new HttpParams();
    this.pm4pyService.getStartActivities(httpParams).subscribe(data => {
      let startActivitiesJson = data as JSON;
      this.startActivities = startActivitiesJson["startActivities"];
      console.log(this.startActivities);
    });
  }

  addRemoveSa(sa) {
    if (!this.selectedStartActivities.includes(sa)) {
      this.selectedStartActivities.push(sa);
    }
    else {
      let thisIndex : number = this.selectedStartActivities.indexOf(sa, 0);
      this.selectedStartActivities.splice(thisIndex, 1);
    }
  }

  applyFilter() {
    this.filterService.addFilter("start_activities", this.selectedStartActivities);
  }

}
