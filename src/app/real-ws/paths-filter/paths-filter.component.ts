import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Pm4pyService} from '../../pm4py-service.service';
import {FilterServiceService} from '../../filter-service.service';
import {MatDialog} from '@angular/material';
import {HttpParams} from '@angular/common/http';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';

@Component({
  selector: 'app-paths-filter',
  templateUrl: './paths-filter.component.html',
  styleUrls: ['./paths-filter.component.scss']
})
export class PathsFilterComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public attributesList : string[];
  public selectedAttribute : string;
  public attributeValues : string[];
  public selectedAttributeValues : string[];
  public filteringMethod : string;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.selectedAttributeValues = [];
    this.selectedAttribute = "concept:name";
    this.filteringMethod = "paths_pos_trace";
    this.filterService = filterService;
    this.getAttributesList();
    this.getPathsValues();
  }

  ngOnInit() {
  }

  selectedAttributeChanged(event: any) {
    this.selectedAttribute = event.value;
    this.getPathsValues();
  }

  getAttributesList() {
    let httpParams : HttpParams = new HttpParams();

    let thisDialog = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getAttributesList(httpParams).subscribe(data => {
      let attributesList = data as JSON;
      this.attributesList = attributesList["attributes_list"];
      console.log(this.attributesList);

      thisDialog.close();
    })
  }

  getPathsValues() {
    let httpParams : HttpParams = new HttpParams();

    let thisDialog = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getPaths(this.selectedAttribute, httpParams).subscribe(data => {
      let endActivitiesJSON = data as JSON;
      this.attributeValues = endActivitiesJSON["paths"];
      console.log(this.attributeValues);

      thisDialog.close();
    });
  }

  addRemoveValue(sa) {
    if (!this.selectedAttributeValues.includes(sa)) {
      this.selectedAttributeValues.push(sa);
    }
    else {
      let thisIndex : number = this.selectedAttributeValues.indexOf(sa, 0);
      this.selectedAttributeValues.splice(thisIndex, 1);
    }
  }

  applyFilter() {
    this.filterService.addFilter(this.filteringMethod, [this.selectedAttribute, this.selectedAttributeValues]);
  }

}
