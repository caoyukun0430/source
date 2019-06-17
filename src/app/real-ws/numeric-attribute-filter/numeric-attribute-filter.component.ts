import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Pm4pyService} from '../../pm4py-service.service';
import {FilterServiceService} from '../../filter-service.service';
import {MatDialog} from '@angular/material';
import {HttpParams} from '@angular/common/http';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';

@Component({
  selector: 'app-numeric-attribute-filter',
  templateUrl: './numeric-attribute-filter.component.html',
  styleUrls: ['./numeric-attribute-filter.component.scss']
})
export class NumericAttributeFilterComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public attributesList : string[];
  public selectedAttribute : string;
  points : any;
  numericAttributeSvgOriginal : string;
  numericAttributeSvgSanitized : SafeResourceUrl;
  public filteringMethod : string;
  min_value : number;
  max_value : number;
  public selected_min_value : string;
  public selected_max_value : string;
  public is_numeric : boolean;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.filterService = filterService;

    this.filteringMethod = "numeric_attr_traces";
    this.min_value = -1.0;
    this.max_value = -1.0;
    this.is_numeric = false;

    this.getAttributesList();
  }

  selectedAttributeChanged(event: any) {
    this.selectedAttribute = event.value;
    this.getAttributeValues();
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

  getAttributeValues() {
    let httpParams : HttpParams = new HttpParams();

    httpParams = httpParams.set("attribute", this.selectedAttribute);

    let thisDialog = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getNumericAttributeGraph(httpParams).subscribe(data => {
      let numericAttributeJson = data as JSON;

      this.points = numericAttributeJson["points"];

      this.numericAttributeSvgOriginal = numericAttributeJson["base64"];
      this.numericAttributeSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.numericAttributeSvgOriginal);

      if (this.points.length > 0) {
        this.min_value = Math.floor(this.points[0][0]);
        this.max_value = Math.ceil(this.points[this.points.length - 1][0]);
        this.selected_min_value = String(this.min_value);
        this.selected_max_value = String(this.max_value);

        (<HTMLInputElement>document.getElementById("minimumValue")).value = this.selected_min_value;
        (<HTMLInputElement>document.getElementById("maximumValue")).value = this.selected_max_value;

        this.is_numeric = true;
      }
      else {
        this.is_numeric = false;
      }

      thisDialog.close();
    }, err => {
      this.is_numeric = false;
      thisDialog.close();
    });
  }

  ngOnInit() {
  }

  applyFilter() {
    this.selected_min_value = (<HTMLInputElement>document.getElementById("minimumValue")).value;
    this.selected_max_value = (<HTMLInputElement>document.getElementById("maximumValue")).value;

    this.min_value = parseInt(this.selected_min_value);
    this.max_value = parseInt(this.selected_max_value);

    this.filterService.addFilter(this.filteringMethod, [this.selectedAttribute, String(this.min_value)+"@@@"+String(this.max_value)]);
  }

}
