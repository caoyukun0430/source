import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../../authentication-service.service';
import {WaitingCircleComponentComponent} from '../../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';
import {AngularResizableDirective} from "angular2-draggable";
import * as d3 from 'd3';
declare var $: any;


@Component({
  selector: 'app-trace-cluster',
  encapsulation:ViewEncapsulation.None,
  templateUrl: './trace-cluster.component.html',
  styleUrls: ['./trace-cluster.component.scss']
})
export class TraceClusterComponent implements OnInit {


  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  dendrogramJson: JSON;
  dendrogramData: JSON;
  dendrogramSvgOriginal: string;
  dendrogramSvgSanitized: SafeResourceUrl;
  currentItem:string;
  public isLoading: boolean = true;
  public dendrogramLoading: boolean = true;

  title = 'Trace Clustering Dendrogram';

  // private margin = {top: 10};
  private width: number;
  private height: number;
  private svg: any;
  private g: any;


  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.authService.checkAuthentication().subscribe(data => {
    });

    // calls the construction of the dendrogram graph
  }

  getDendrogram(){
    this.currentItem = 'Television';
    let params: HttpParams = new HttpParams();
    this.dialog.open(WaitingCircleComponentComponent);
    this.pm4pyServ.getDendrogram(params).subscribe(data => {
      this.dendrogramJson = data as JSON;
      this.dendrogramData = this.dendrogramJson["d3Dendro"];
      console.log("all",this.dendrogramJson);
      console.log("dendro",this.dendrogramData);

      this.width = 800;
      this.height = 400;

      this.svg = d3.select("#my_dataviz")
              .append("svg")
              .attr("width", this.width)
              .attr("height", this.height)
              .append("g")
              .attr("transform", "translate(10,0)");
      var cluster = d3.cluster()
          .size([this.height, this.width - 50]);

      var root = d3.hierarchy(this.dendrogramData, function(d) {
      return d.children;
      });
      cluster(root);

      // give the allowed depth
      var allowedDepth=5;
      var fnodes = root.descendants().filter(Node => Node.depth <= allowedDepth);
      var fnodelinks = root.descendants().slice(1).filter(Node => Node.depth <= allowedDepth);

      var link = this.svg.selectAll('path')
           .data( fnodelinks )
           .enter().append('path')
           .attr("d", function(d) {
             return "M" + d.y + "," + d.x
                    + "C" + (d.parent.y + 50) + "," + d.x
                    + " " + (d.parent.y) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                    + " " + d.parent.y + "," + d.parent.x;
                  })
           .attr("class", "link");

      var node = this.svg.selectAll(".node")
            .data(fnodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
      node.append("circle")
            .attr("r", 6);
      node.append("text")
            .attr("dx", function(d) { return d.children ? 10: 20; })
            .attr("dy", 5)
            .style("text-anchor", function(d) { return d.children ? "start" : "end"; })
            .text(function(d) {
              return d.data.name;
              // if ((d.depth==0) || (d.depth==allowedDepth)){
              // return d.data.name;
              // }
             });



      this.dendrogramSvgOriginal = this.dendrogramJson["base64"];
      this.dendrogramSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.dendrogramSvgOriginal);
      this.dendrogramLoading = false;
      this.isLoading = this.dendrogramLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    }, err => {
      alert("Error loading dendrogram");
      this.isLoading = this.dendrogramLoading;

      if (this.isLoading === false) {
        this.dialog.closeAll();
      }
    });

  }

  ngOnInit() {
    this.getDendrogram();
  }

}
