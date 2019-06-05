import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import { FilterServiceService } from '../../filter-service.service';

@Component({
  selector: 'app-attributes-filter',
  templateUrl: './attributes-filter.component.html',
  styleUrls: ['./attributes-filter.component.scss']
})
export class AttributesFilterComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public attributesList : string[];
  public selectedAttribute : string;
  public attributeValues : string[];
  public selectedAttributeValues : string[];
  public filteringMethod : string;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.selectedAttributeValues = [];
    this.selectedAttribute = "concept:name";
    this.filteringMethod = "attributes_pos_trace";
    this.filterService = filterService;
    this.getAttributesList();
    this.getAttributeValues();
  }

  ngOnInit() {
  }

  selectedAttributeChanged(event: any) {
    this.selectedAttribute = event.value;
    this.getAttributeValues();
  }

  getAttributesList() {
    let httpParams : HttpParams = new HttpParams();
    this.pm4pyService.getAttributesList(httpParams).subscribe(data => {
      let attributesList = data as JSON;
      this.attributesList = attributesList["attributes_list"];
      console.log(this.attributesList);
      console.log(this.attributesList);
    })
  }

  getAttributeValues() {
    let httpParams : HttpParams = new HttpParams();
    this.pm4pyService.getAttributeValues(this.selectedAttribute, httpParams).subscribe(data => {
      let endActivitiesJSON = data as JSON;
      this.attributeValues = endActivitiesJSON["attributeValues"];
      console.log(this.attributeValues);
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
