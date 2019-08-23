import { Component, OnInit } from '@angular/core';
import {Pm4pyService} from '../../pm4py-service.service';
import {HttpParams} from '@angular/common/http';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
import {AuthenticationServiceService} from '../../authentication-service.service';
import {MatDialog} from '@angular/material';

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
  public graph_defined : boolean;

  public graph : any;

  constructor(public pm4pyService : Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
    this.graph_defined = false;
    this.attribute_x = "time:timestamp";
    this.attribute_y = "@@case_index";
    this.attribute_color = "";

    this.authService.checkAuthentication().subscribe(data => {
      //console.log(data);
    });

    this.getAttributesList();
    //this.getEventsForDotted();


  }

  ngOnInit() {
  }

  getAttributesList() {
    let httpParams : HttpParams = new HttpParams();

    let dia = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getAttributesList(httpParams).subscribe(data => {
      let attributesList = data as JSON;
      this.attributesList = attributesList["attributes_list"];
      console.log(this.attributesList);

      dia.close();
    });
  }

  getEventsForDotted() {
    let httpParams : HttpParams = new HttpParams();

    httpParams = httpParams.set('attribute1', this.attribute_x);
    httpParams = httpParams.set('attribute2', this.attribute_y);

    if (this.attribute_color.length > 0) {
      httpParams = httpParams.set('attribute3', this.attribute_color);
    }

    let dia = this.dialog.open(WaitingCircleComponentComponent);

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

      this.graph_defined = true;

      dia.close();
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
