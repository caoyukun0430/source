import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Pm4pyService} from '../../pm4py-service.service';
import {FilterServiceService} from '../../filter-service.service';
import {MatDialog} from '@angular/material';
import {HttpParams} from '@angular/common/http';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.scss']
})
export class ActivityDashboardComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public attributeValues : string[];
  public startActivities : string[];
  public endActivities : string[];

  public attributeValuesDict : any;
  public startActivitiesDict : any;
  public endActivitiesDict : any;

  public isLoading : boolean;
  public activitiesLoading : boolean;
  public startActivitiesLoading : boolean;
  public endActivitiesLoading : boolean;

  public activityKey : string;
  public targetClass : string;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.activityKey = localStorage.getItem("activityKey");
    this.targetClass = localStorage.getItem("targetClass");

    this.isLoading = true;
    this.activitiesLoading = true;
    this.startActivitiesLoading = true;
    this.endActivitiesLoading = true;

    let params : HttpParams = new HttpParams();
    let dia = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getStartActivities(params).subscribe(data => {
      let startActivitiesJson = data as JSON;
      this.startActivities = startActivitiesJson["startActivities"];
      this.startActivitiesLoading = false;

      this.startActivitiesDict = {};
      this.startActivitiesDict[this.targetClass] = 0;

      let i = 0;
      while (i < this.startActivities.length) {
        this.startActivitiesDict[this.startActivities[i][0]] = this.startActivities[i][1];
        i++;
      }

      this.isLoading = this.startActivitiesLoading || this.endActivitiesLoading || this.activitiesLoading;
      if (!this.isLoading) {

        dia.close();
      }
    });
    this.pm4pyService.getEndActivities(params).subscribe(data => {
      let endActivitiesJSON = data as JSON;
      this.endActivities = endActivitiesJSON["endActivities"];
      this.endActivitiesLoading = false;

      this.endActivitiesDict = {};
      this.endActivitiesDict[this.targetClass] = 0;

      let i = 0;
      while (i < this.endActivities.length) {
        this.endActivitiesDict[this.endActivities[i][0]] = this.endActivities[i][1];
        i++;
      }

      this.isLoading = this.startActivitiesLoading || this.endActivitiesLoading || this.activitiesLoading;
      if (!this.isLoading) {

        dia.close();
      }
    });
    this.pm4pyService.getAttributeValues(localStorage.getItem("activityKey"), params).subscribe(data => {
      let endActivitiesJSON = data as JSON;
      this.attributeValues = endActivitiesJSON["attributeValues"];
      this.activitiesLoading = false;
      this.isLoading = this.startActivitiesLoading || this.endActivitiesLoading || this.activitiesLoading;

      this.attributeValuesDict = {};
      this.attributeValuesDict[this.targetClass] = 0;

      let i = 0;
      while (i < this.attributeValues.length) {
        this.attributeValuesDict[this.attributeValues[i][0]] = this.attributeValues[i][1];
        i++;
      }
      if (!this.isLoading) {

        dia.close();
      }
    });
  }

  ngOnInit() {
  }

}
