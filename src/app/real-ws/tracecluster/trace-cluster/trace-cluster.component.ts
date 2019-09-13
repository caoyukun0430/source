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
  selected:string;
  options: any;
  //default selected method is variant_DMM_leven
  clusterMethod='variant_DMM_leven';
  public isLoading: boolean = true;
  public dendrogramLoading: boolean = true;

  title = 'Trace Clustering Dendrogram';

  // private margin = {top: 10};
  public width=800;
  public height=400;
  public svg: any;



  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    this.authService.checkAuthentication().subscribe(data => {
    });


    // calls the construction of the dendrogram graph
  }



  public getDendrogram(){

    let params: HttpParams = new HttpParams();

    params = params.set('clusterMethod', this.clusterMethod);
    localStorage.setItem('clusterMethod', this.clusterMethod);
    console.log("para",params);
    console.log("method",this.clusterMethod);

    this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyServ.getDendrogram(params).subscribe(data => {
      this.dendrogramJson = data as JSON;
      this.dendrogramData = this.dendrogramJson["d3Dendro"];
      console.log("all",this.dendrogramJson);
      console.log("dendro",this.dendrogramData);

     this.options = {
      tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
      },
      legend: {
          top: '2%',
          left: '3%',
          orient: 'vertical',
          data: [{
              name: 'Dendrogram (On/Off)',
              icon: 'rectangle'
          }
          ],
          borderColor: '#c23531'
      },
      series:[
          {
              type: 'tree',

              name: 'Dendrogram(On/Off)',

              data: [this.dendrogramData],

              top: '5%',
              left: '7%',
              bottom: '2%',
              right: '10%',

              symbolSize: 12,

              label: {
                  normal: {
                      position: 'left',
                      verticalAlign: 'middle',
                      align: 'right'
                  }
              },

              leaves: {
                  label: {
                      normal: {
                          position: 'right',
                          verticalAlign: 'middle',
                          align: 'left'
                      }
                  }
              },

              expandAndCollapse: true,
              //initialTreeDepth:-1,// determine the depth to show, -1 is all
              animationDuration: 550,
              animationDurationUpdate: 750

          }]};

      // this.svg = d3.select("#my_dataviz")
      //         .append("svg")
      //         .attr("width", this.width)
      //         .attr("height", this.height)
      //         .append("g")
      //         .attr("transform", "translate(10,0)");
      //
      //
      // var cluster = d3.cluster()
      //     .size([this.height, this.width - 50]);
      //
      // var root = d3.hierarchy(this.dendrogramData, function(d) {
      // return d.children;
      // });
      // cluster(root);
      //
      // // give the allowed depth
      // var allowedDepth=5;
      // var fnodes = root.descendants().filter(Node => Node.depth <= allowedDepth);
      // var fnodelinks = root.descendants().slice(1).filter(Node => Node.depth <= allowedDepth);
      //
      // var link = this.svg.selectAll('path')
      //      .data( fnodelinks )
      //      .enter().append('path')
      //      .attr("d", function(d) {
      //        return "M" + d.y + "," + d.x
      //               + "C" + (d.parent.y + 50) + "," + d.x
      //               + " " + (d.parent.y) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
      //               + " " + d.parent.y + "," + d.parent.x;
      //             })
      //      .attr("class", "link");
      //
      // var node = this.svg.selectAll(".node")
      //       .data(fnodes)
      //       .enter().append("g")
      //       .attr("class", "node")
      //       .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
      // node.append("circle")
      //       .attr("r", 6);
      // node.append("text")
      //       .attr("dx", function(d) { return d.children ? 10: 20; })
      //       .attr("dy", 5)
      //       .style("text-anchor", function(d) { return d.children ? "start" : "end"; })
      //       .text(function(d) {
      //         return d.data.name;
      //         // if ((d.depth==0) || (d.depth==allowedDepth)){
      //         // return d.data.name;
      //         // }
      //        });



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

  methodIsChanged(event: any) {
        /**
         * Manages the change on the type of the model (discovery algorithm)
         */
        this.clusterMethod = event.value;
        console.log("event",event);
        console.log("model",this.clusterMethod);
        // this.svg = d3.select("#my_dataviz")
        // d3.select("svg").remove();
        // calls the retrieval of the dendrogram from the service
        // this.svg = d3.select("#my_dataviz")
        //       .append("svg")
        //       .attr("width", this.width)
        //       .attr("height", this.height)
        //       .append("g")
        //       .attr("transform", "translate(10,0)");
        this.getDendrogram();
    }

  ngOnInit() {
    // this.svg = d3.select("#my_dataviz")
    //           .append("svg")
    //           .attr("width", this.width)
    //           .attr("height", this.height)
    //           .append("g")
    //           .attr("transform", "translate(10,0)");
    this.getDendrogram();
  }

}
