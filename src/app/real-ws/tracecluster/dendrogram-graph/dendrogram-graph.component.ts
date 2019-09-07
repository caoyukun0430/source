import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../../authentication-service.service';
import {WaitingCircleComponentComponent} from '../../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';
import * as d3 from 'd3';
import {json} from "ng2-validation/dist/json";


@Component({
  selector: 'app-dendrogram-graph',
  encapsulation:ViewEncapsulation.None,
  templateUrl: './dendrogram-graph.component.html',
  styleUrls: ['./dendrogram-graph.component.scss']
})
export class DendrogramGraphComponent implements OnInit {


  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private svg: any;
  private g: any;
  dendrogramData: JSON;

  constructor() {

  }


  getDendrogramGraph(){

  }

  ngOnInit() {
  }

}
