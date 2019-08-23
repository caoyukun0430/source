import { Component, OnInit } from '@angular/core';
import {Pm4pyService} from '../../pm4py-service.service';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-dottedchart',
  templateUrl: './dottedchart.component.html',
  styleUrls: ['./dottedchart.component.scss']
})
export class DottedchartComponent implements OnInit {
  public attributesList: any[];
  public attribute_x : string;
  public attribute_y : string;
  public attribute_color : string;

  public graph : any;

  constructor(public pm4pyService : Pm4pyService) {
    this.attribute_x = "time:timestamp";
    this.attribute_y = "@@case_index";
    this.attribute_color = "concept:name";

    this.getAttributesList();
    this.getEventsForDotted();


  }

  ngOnInit() {
  }

  getAttributesList() {
    let httpParams : HttpParams = new HttpParams();

    this.pm4pyService.getAttributesList(httpParams).subscribe(data => {
      let attributesList = data as JSON;
      this.attributesList = attributesList["attributes_list"];
      console.log(this.attributesList);
    });
  }

  getEventsForDotted() {
    let httpParams : HttpParams = new HttpParams();

    httpParams = httpParams.set('attribute1', this.attribute_x);
    httpParams = httpParams.set('attribute2', this.attribute_y);
    httpParams = httpParams.set('attribute3', this.attribute_color);

    this.pm4pyService.getEventsForDotted(httpParams).subscribe(data => {
      let eventsForDotted = data as JSON;
      let data2 = [];

      let attributes = eventsForDotted['attributes'];
      let third_unique_values = eventsForDotted['third_unique_values'];

      let i = 0;
      while (i < eventsForDotted['traces'].length) {
        let color1 = Math.floor(Math.random() * 255);
        let color2 = Math.floor(Math.random() * 255);
        let color3 = Math.floor(Math.random() * 255);

        data2.push({
          type: 'scatter',
          x: eventsForDotted['traces'][i][attributes[1]],
          y: eventsForDotted['traces'][i][attributes[2]],
          mode: 'markers',
          name: third_unique_values[i],
          marker: {
            color: 'rgba('+color1+', '+color2+', '+color3+', 0.95)',
            symbol: 'circle',
            size: 6
          }
        });
        i++;
      }
      console.log(data2);

      this.graph = {};
      this.graph.data = data2;
      console.log("window.innerWidth"+window.innerWidth);
      console.log("window.innerHeight"+window.innerHeight);

      this.graph.layout = {title: 'Dotted Chart'};
    })
  }

  selectedAttributeXChanged(event: any) {
    this.attribute_x = event.value;
  }

  selectedAttributeYChanged(event: any) {
    this.attribute_y = event.value;
  }

  selectedAttributeColorChanged(event: any) {
    this.attribute_color = event.value;
  }
}
