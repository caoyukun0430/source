import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../../authentication-service.service';
import {WaitingCircleComponentComponent} from '../../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';
import {AttributesFilterComponent} from "../../attributes-filter/attributes-filter.component";
import {NavbarComponent} from '../../../shared/navbar/navbar.component'
import {AngularResizableDirective} from "angular2-draggable";
import * as d3 from 'd3';


@Component({
    selector: 'app-trace-cluster',
    encapsulation: ViewEncapsulation.None,
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
    namelist: any[];
    name: String;
    dendrogramSvgOriginallist: string[];
    dendrogramSvgSanitizedlist: string[];
    public attributesList : string[];


    public selectednode: string;
    selected: string;
    options: any;
    public myChart: any;
    //default selected method is variant_DMM_leven
    clusterMethod = 'variant_DMM_leven';
    public isLoading: boolean = true;
    public dendrogramLoading: boolean = true;
    logSummaryJson: JSON;
    public thisProcessName: string;
    public thisVariantsNumber = 0;
    public thisCasesNumber = 0;
    public thisEventsNumber = 0;
    public namelistlen = 3;

    title = 'Trace Clustering Dendrogram';

    public width = window.innerWidth * 0.6;
    public height = window.innerHeight * 0.9;
    public svg: any;


    constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
        this.sanitizer = _sanitizer;
        this.pm4pyService = pm4pyServ;

        this.authService.checkAuthentication().subscribe(data => {
        });


        // calls the construction of the dendrogram graph
    }

    attributesFilter() {
        this.dialog.open(AttributesFilterComponent);
    }

    public getAttributesList() {
        let httpParams: HttpParams = new HttpParams();

        this.pm4pyService.getAttributesList(httpParams).subscribe(data => {
            let attributesList = data as JSON;
            this.attributesList = attributesList["attributes_list"];
            console.log("attributesList",this.attributesList);
        })
    }


    public getDendrogram() {

        let params: HttpParams = new HttpParams();

        params = params.set('clusterMethod', this.clusterMethod);
        localStorage.setItem('clusterMethod', this.clusterMethod);
        console.log("para", params);
        console.log("method", this.clusterMethod);
        this.thisProcessName = this.pm4pyService.getCurrentProcess();

        this.myChart = echarts.init(<HTMLDivElement>document.getElementById('container'));

        this.dialog.open(WaitingCircleComponentComponent);

        this.pm4pyServ.getDendrogram(params).subscribe(data => {
                this.dendrogramJson = data as JSON;
                this.dendrogramData = this.dendrogramJson["d3Dendro"];
                console.log("all", this.dendrogramJson);
                console.log("dendro", this.dendrogramData);


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
                            name: 'Cluster Dendrogram (On/Off)',
                            icon: 'rectangle'
                        }
                        ],
                        borderColor: '#c23531'
                    },
                    series: [
                        {
                            type: 'tree',

                            name: 'Cluster Dendrogram (On/Off)',

                            data: [this.dendrogramData],

                            top: '5%',
                            left: '7%',
                            bottom: '2%',
                            right: '18%',

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
                            // roam:true,
                            expandAndCollapse: true,
                            //initialTreeDepth:-1,// determine the depth to show, -1 is all
                            animationDuration: 550,
                            animationDurationUpdate: 750

                        }]
                };
                this.myChart.setOption(this.options);

                // draw dendrogram with d3
                // console.log("mychart1",this.myChart);
                // this.myChart.on('click',function(data){
                //       console.log("name1",data);
                //       // params = params.set('selectednode', data.name);
                //       // console.log("params",params);
                //   });


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


                // this.dendrogramSvgOriginal = this.dendrogramJson["base64"][0];
                // var array=[];
                // var i;
                // for (i=0;i<this.dendrogramSvgOriginal.length;i++){
                //
                // }
                // this.dendrogramSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.dendrogramSvgOriginal["base64"]);


                var nlist = new Array();
                nlist[0] = this.dendrogramData["name"];
                for (var i = 1; i < this.namelistlen; i++) {
                    nlist[i] = this.dendrogramData["children"][i - 1]["name"];
                }
                this.namelist = nlist;
                console.log("namelist", this.namelist);

                this.dendrogramSvgOriginallist = this.dendrogramJson["base64"];

                var list = new Array();
                for (var i = 0; i < this.dendrogramSvgOriginallist.length; i++) {
                    list[i] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.dendrogramSvgOriginallist[i]["base64"]);
                }
                this.dendrogramSvgSanitizedlist = list;

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
            }
        );

    }


    //update models when we click node
    public updateModel(params, clickparams) {

        // update model name
        var nlist = new Array();
        nlist[0] = clickparams["data"]["name"];
        for (var i = 1; i < this.namelistlen; i++) {
            nlist[i] = clickparams["data"]["children"][i - 1]["name"];
        }
        this.namelist = nlist;
        console.log("namelist", this.namelist);

        params = params.set('clusterMethod', this.clusterMethod);
        localStorage.setItem('clusterMethod', this.clusterMethod);
        console.log("para", params);
        console.log("method", this.clusterMethod);
        this.thisProcessName = this.pm4pyService.getCurrentProcess();

        // // we don't need to update the dendrogram
        // this.myChart = echarts.init($('#container')[0]);

        this.dialog.open(WaitingCircleComponentComponent);

        this.pm4pyServ.getDendrogram(params).subscribe(data => {
                this.dendrogramJson = data as JSON;

                // this.dendrogramData = this.dendrogramJson["d3Dendro"];
                // console.log("all", this.dendrogramJson);
                // console.log("dendro", this.dendrogramData);
                //
                // // var dom = $('#container')[0];
                // // var myChart = echarts.init(dom);
                //
                // this.options = {
                //     tooltip: {
                //         trigger: 'item',
                //         triggerOn: 'mousemove'
                //     },
                //     legend: {
                //         top: '2%',
                //         left: '3%',
                //         orient: 'vertical',
                //         data: [{
                //             name: 'Cluster Dendrogram (On/Off)',
                //             icon: 'rectangle'
                //         }
                //         ],
                //         borderColor: '#c23531'
                //     },
                //     series: [
                //         {
                //             type: 'tree',
                //
                //             name: 'Cluster Dendrogram (On/Off)',
                //
                //             data: [this.dendrogramData],
                //
                //             top: '5%',
                //             left: '7%',
                //             bottom: '2%',
                //             right: '18%',
                //
                //             symbolSize: 12,
                //
                //             label: {
                //                 normal: {
                //                     position: 'left',
                //                     verticalAlign: 'middle',
                //                     align: 'right'
                //                 }
                //             },
                //
                //             leaves: {
                //                 label: {
                //                     normal: {
                //                         position: 'right',
                //                         verticalAlign: 'middle',
                //                         align: 'left'
                //                     }
                //                 }
                //             },
                //
                //             expandAndCollapse: true,
                //             //initialTreeDepth:-1,// determine the depth to show, -1 is all
                //             animationDuration: 550,
                //             animationDurationUpdate: 750
                //
                //         }]
                // };
                // this.myChart.setOption(this.options);
                // console.log("mychart1",this.myChart);
                // this.myChart.on('click',function(data){
                //       console.log("name1",data);
                //       // params = params.set('selectednode', data.name);
                //       // console.log("params",params);
                //   });


                // this.dendrogramSvgOriginal = this.dendrogramJson["base64"][0];
                // var array=[];
                // var i;
                // for (i=0;i<this.dendrogramSvgOriginal.length;i++){
                //
                // }
                // this.dendrogramSvgSanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.dendrogramSvgOriginal["base64"]);


                // the method is loop over all dendrogramSvgOriginal and then get the array of dendrogramSvgSanitized here in for loop,
                // then we can directly use ngfor in html
                this.dendrogramSvgOriginallist = this.dendrogramJson["base64"];

                var list = new Array();
                for (var i = 0; i < this.dendrogramSvgOriginallist.length; i++) {
                    list[i] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.dendrogramSvgOriginallist[i]["base64"]);
                }
                this.dendrogramSvgSanitizedlist = list;


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
            }
        );

    }

    public getLogSummary() {
        /**
         * Retrieves the log summary and updates the visualization
         */
        let params: HttpParams = new HttpParams();

        this.pm4pyService.getLogSummary(params).subscribe(data => {
            this.logSummaryJson = data as JSON;
            this.thisVariantsNumber = this.logSummaryJson['this_variants_number'];
            this.thisCasesNumber = this.logSummaryJson['this_cases_number'];
            this.thisEventsNumber = this.logSummaryJson['this_events_number'];
        });
    }


    public clickondendrogram() {

        this.myChart.on('click', clickparams => {
            var isExpanded = clickparams.event.target.style.fill;
            console.log("isCollapsed", isExpanded);
            console.log("data", clickparams);
            let params: HttpParams = new HttpParams();
            params = params.set('selectedNode', clickparams.name);
            localStorage.setItem('selectedNode', clickparams.name);

            if ((clickparams.name.length > 1) && (isExpanded == 'rgba(255,255,255,1)')) {
                this.updateModel(params, clickparams);
            }
        });

    }

    methodIsChanged(event: any) {
        /**
         * Manages the change on the type of the model (discovery algorithm)
         */
        this.clusterMethod = event.value;
        console.log("event", event);
        console.log("model", this.clusterMethod);
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
        this.getDendrogram();
        this.getLogSummary();
        this.getAttributesList();
        this.clickondendrogram();
    }

}
