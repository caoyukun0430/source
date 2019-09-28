import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {Pm4pyService} from '../../pm4py-service.service';
import {AuthenticationServiceService} from '../../authentication-service.service';
import {HttpParams} from '@angular/common/http';
import {Router, RoutesRecognized} from '@angular/router';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
import {MatDialog, MatMenuTrigger} from '@angular/material';
import {environment} from '../../../environments/environment';
import {PmtkBpmnVisualizerComponent} from '../pmtk-bpmn-visualizer/pmtk-bpmn-visualizer.component';
import {FilterServiceService} from '../../filter-service.service';
import {ActivityDashboardComponent} from '../activity-dashboard/activity-dashboard.component';
import {ECharts} from 'echarts';

import {graphviz} from 'd3-graphviz';
import * as G6 from '@antv/g6/build/g6';
import * as dagre from 'dagre';
import * as d3 from 'd3';

declare var $: any;

@Component({
    selector: 'app-pmodel',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pmodel.component.html',
    styleUrls: ['./pmodel.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class PmodelComponent implements OnInit {
    @ViewChild(MatMenuTrigger) appMenu: MatMenuTrigger;

    processModelBase64Original: string;
    processModelDecodedSVG: string;
    processModelBase64Sanitized: SafeResourceUrl;
    pm4pyJson: JSON;
    thisProcessModel: string;
    thisSecondProcessModel: string;
    thisHandler: string;
    simplicity = -1.45;
    selectedSimplicity = -1.45;
    logSummaryJson: JSON;
    public thisProcessName: string;
    public thisVariantsNumber = 0;
    public thisCasesNumber = 0;
    public thisEventsNumber = 0;
    public ancestorVariantsNumber = 0;
    public ancestorCasesNumber = 0;
    public ancestorEventsNumber = 0;
    public ratioVariantsNumber = 100;
    public ratioCasesNumber = 100;
    public ratioEventsNumber = 100;
    public enableProcessModelChoice: boolean = true;
    decoration = 'freq';
    typeOfModel = 'dfg';
    sanitizer: DomSanitizer;
    pm4pyService: Pm4pyService;
    authenticationService: AuthenticationServiceService;
    public isLoading: boolean;
    public enableDownloadModel: boolean = false;
    public enableConformanceChecking: boolean = false;
    public enableBpmnDownload: boolean = false;
    public dotProvided: boolean = false;
    public dotString: string;
    public activityKey: string;
    public targetClass: string;
    public startActivities: any;
    public endActivities: any;
    public isStartActivity: boolean;
    public isEndActivity: boolean;
    public overallEnableBPMN: boolean;
    public overallEnableAlignments: boolean;

    public myChart: any;
    options: any;

    graphdataold: any;

    constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private router: Router, private authService: AuthenticationServiceService, public dialog: MatDialog, private filterService: FilterServiceService) {
        /**
         * Constructor
         */

        this.sanitizer = _sanitizer;
        this.pm4pyService = pm4pyServ;
        this.authenticationService = authService;

        this.overallEnableBPMN = environment.overallEnableBPMN;
        this.overallEnableAlignments = environment.overallEnableAlignments;

        this.decoration = localStorage.getItem("preferred_decoration");
        if (this.decoration == null || typeof (this.decoration) == "undefined") {
            this.decoration = "freq";
        }

        this.typeOfModel = localStorage.getItem("preferred_type_of_model");
        if (this.typeOfModel == null || typeof (this.typeOfModel) == "undefined") {
            this.typeOfModel = "dfg";
        }

        if (localStorage.getItem("smartFiltering") === null) {
            localStorage.setItem("smartFiltering", "true");
        }

        if (localStorage.getItem("smartFiltering") === "false") {
            this.simplicity = -5.0;
            this.selectedSimplicity = -5.0;
        }

        // where the process schema is turned off
        //this.enableProcessModelChoice = environment.overallEnableDifferentProcessSchemas;
        this.enableProcessModelChoice = true;

        this.isStartActivity = false;
        this.isEndActivity = false;

        this.authenticationService.checkAuthentication().subscribe(data => {
            //console.log(data);
        });
        // calls the retrieval of the process schema from the service
        // this.populateProcessSchema();
        // this.getLogSummary();

        this.populateProcessSchema();
        this.getLogSummary();
        this.processschema();


        this.router.events.subscribe((next) => {
            if (next instanceof RoutesRecognized) {
                if (next.url.startsWith('/process')) {
                    this.populateProcessSchema();
                    this.getLogSummary();
                    this.processschema();
                }
            }
        });
    }

    public populateProcessSchema() {
        /**
         * Retrieves and shows the process schema
         */
        this.isLoading = true;
        this.thisProcessName = this.pm4pyService.getCurrentProcess();
        let params: HttpParams = new HttpParams();
        if (this.selectedSimplicity >= -4.99) {
            params = params.set('simplicity', Math.exp(this.selectedSimplicity).toString());
        } else {
            params = params.set('simplicity', "0.0");
        }

        params = params.set('decoration', this.decoration);
        params = params.set('typeOfModel', this.typeOfModel);
        console.log("para", params);

        localStorage.setItem('preferred_decoration', this.decoration);
        localStorage.setItem('preferred_type_of_model', this.typeOfModel);
        console.log("localstorage", localStorage);

        this.dialog.open(WaitingCircleComponentComponent);


        this.pm4pyService.getProcessSchema(params).subscribe(data => {
            this.pm4pyJson = data as JSON;
            console.log("data", this.pm4pyJson);
            this.processModelBase64Original = this.pm4pyJson['base64'];
            this.processModelBase64Sanitized = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.processModelBase64Original);
            this.thisProcessModel = this.pm4pyJson['model'];
            this.thisSecondProcessModel = this.pm4pyJson['second_model'];
            this.activityKey = this.pm4pyJson['activity_key'];
            this.startActivities = this.pm4pyJson['start_activities'];
            this.endActivities = this.pm4pyJson['end_activities'];
            this.processModelDecodedSVG = "";
            this.graphdataold = this.pm4pyJson['graph_rep'];

            // the d3 force drag graph
            // var width = window.innerWidth;
            // var height = window.innerHeight;
            // var linkDistance = 200;
            // var radius = 8;
            // var svg = d3.select("#dfg")
            //     .append("svg")
            //     .attr("width", width)
            //     .attr("height", height);
            // //add arrows
            // var g = svg.append("g");
            // g.append('defs').append('marker')
            //     .attr('id', 'arrow')
            //     .attr('viewBox', '-0 -5 10 10')
            //     .attr('refX', 40)
            //     .attr('refY', 0)
            //     .attr('orient', 'auto')
            //     .attr('markerWidth', 8)
            //     .attr('markerHeight', 8)
            //     .attr('xoverflow', 'auto')
            //     .append('svg:path')
            //     .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            //     .attr('fill', '#9b9b9b');
            // var simulation = d3.forceSimulation()
            //     .force("link", d3.forceLink().distance(linkDistance))
            //     .force("charge", d3.forceManyBody().strength(-400)) // here strength define the repel
            //     .force("center", d3.forceCenter(width / 2, height / 2))
            //     .force('collision', d3.forceCollide().radius(function (d) {
            //         return d.radius
            //     }));
            //
            //
            // var link = g.append("g")
            //     .attr("class", "links")
            //     .selectAll("line")
            //     .data(graphdata.edges)
            //     .enter()
            //     .append("line")
            //     .attr('marker-end', 'url(#arrow)');
            // //.style("stroke", "#aaa");
            //
            // var linksText = svg.append("g")
            //     .attr("class", "links")
            //     .selectAll("text")
            //     .data(graphdata.edges)
            //     .enter()
            //     .append("text");
            // // .text(function(d,i){
            // //     return i+1;
            // // });
            // var rects = g.selectAll("rect")
            //     .data(graphdata.nodes)
            //     .enter()
            //     .append("g")
            //     .attr("class", "nodes")
            //     .call(d3.drag()
            //         .on("start", dragstarted)
            //         .on("drag", dragged)
            //         .on("end", dragended));
            //
            // rects.append("circle")
            //     .attr('r', radius * 3)
            //     //rects.append("rect")
            //     // .attr("x",-max_str_len*radius/2)
            //     // .attr("y",-2*radius)
            //     // .attr( "width", radius*max_str_len)//decide by the max str length, one character is 10px
            //     // .attr( "height", radius*3)
            //     .style("fill", function (d) {
            //         if (d.start == true) {
            //             console.log("0", typeof d.index);
            //             return 'lime';
            //         } else if (d.end == true) {
            //             return 'orange';
            //         } else {
            //             return "white";
            //         }
            //     });
            //
            //
            // rects.append("text")
            //     .attr("text-anchor", "middle")
            //     .text(function (d) {
            //         return d.name;
            //     });
            //
            // simulation
            //     .nodes(graphdata.nodes)
            //     .on("tick", ticked);
            //
            // simulation.force("link")
            //     .links(graphdata.edges);
            //
            // var zoom_handler = d3.zoom()
            //     .on("zoom", zoom_actions);
            //
            // zoom_handler(svg);
            //
            // function zoom_actions() {
            //     g.attr("transform", d3.event.transform)
            // }
            //
            // function ticked() {
            //     link
            //         .attr("x1", function (d) {
            //             return d.source.x;
            //         })
            //         .attr("y1", function (d) {
            //             return d.source.y;
            //         })
            //         .attr("x2", function (d) {
            //             return d.target.x;
            //         })
            //         .attr("y2", function (d) {
            //             return d.target.y;
            //         });
            //
            //     linksText
            //     // .attr("x",function(d){return d.x-5;})
            //     // .attr("y",function(d){return d.y-5;});
            //
            //         .attr("x", function (d) {
            //             return (d.source.x + d.target.x) / 2;
            //         })
            //         .attr("y", function (d) {
            //             return (d.source.y + d.target.y) / 2;
            //         });
            //
            //
            //     //
            //     // rects
            //     // .attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            //
            //     rects
            //     // .attr("cx", function(d) { return d.x; })
            //     //     .attr("cy", function(d) { return d.y; });
            //         .attr("transform", function (d) {
            //             return "translate(" + d.x + "," + d.y + ")";
            //         });
            // }

            // function dragstarted(d) {
            //     if (!d3.event.active) simulation.alphaTarget(1).restart();
            //     d.fx = d.x;
            //     d.fy = d.y;
            // }
            //
            // function dragged(d) {
            //     d.fx = d3.event.x;
            //     d.fy = d3.event.y;
            // }
            //
            // function dragended(d) {
            //     // if (!d3.event.active) simulation.alphaTarget(0);
            //     // d.fx = null;
            //     // d.fy = null;
            // }


            localStorage.setItem("activityKey", this.activityKey);

            this.dotString = this.pm4pyJson['gviz_base64'];

            if (this.dotString == null || typeof (this.dotString) == "undefined") {
                this.dotString = "";
            }

            if (this.dotString.length > 0) {
                this.dotString = atob(this.dotString);
            }

            if (this.processModelBase64Original.length > 0) {
                this.processModelDecodedSVG = atob(this.processModelBase64Original);//decode base64
            }


            this.thisHandler = this.pm4pyJson['handler'];
            this.enableDownloadModel = this.typeOfModel === 'inductive' || this.typeOfModel === 'indbpmn';
            this.enableBpmnDownload = this.typeOfModel === 'indbpmn';
            this.enableConformanceChecking = this.typeOfModel === 'inductive' && this.thisVariantsNumber <= environment.maxNoVariantsForAlignments;

            if (this.enableDownloadModel) {
                localStorage.setItem('process_model', this.thisProcessModel);
            }
            if (this.enableBpmnDownload) {
                localStorage.setItem('bpmn_model', this.thisSecondProcessModel);
            }

            if (this.dotString.length > 0) {
                this.dotProvided = true;

                let targetInnerWidth = window.innerWidth * 0.9;
                let targetInnerHeight = window.innerHeight * 0.9;

                let targetWidth = window.innerWidth * 0.92;
                let targetHeight = window.innerHeight * 0.9;

                let currentWidth = parseInt(this.processModelDecodedSVG.split("width=\"")[1].split("pt\"")[0]);
                let currentHeight = parseInt(this.processModelDecodedSVG.split("height=\"")[1].split("pt\"")[0]);

                let ratioWidth: number = targetInnerWidth / currentWidth;
                let ratioHeight: number = targetInnerHeight / currentHeight;

                let ratio: number = Math.min(ratioWidth, ratioHeight);

                // let thisEl = graphviz('#dotProvidedDiv').width(targetWidth + 'px').height(targetHeight + 'px').renderDot(this.dotString);
                //
                // let dotProvidedDiv = document.getElementById("dotProvidedDiv");
                // let svgDoc = dotProvidedDiv.childNodes;
                //
                // console.log("svgDoc", svgDoc);
                //
                // (<SVGSVGElement>svgDoc[0]).currentScale = ratio;
                //
                // svgDoc[0].addEventListener("click", (e: Event) => this.manageClickOnSvg(e));
            } else {
                // this.dotProvided = false;
                //
                // document.getElementById("svgWithInnerHtml").innerHTML = this.processModelDecodedSVG;
                //
                // let svgWithInnerHtml = document.getElementById("svgWithInnerHtml");
                //
                // svgWithInnerHtml.addEventListener("click", (e: Event) => this.manageClickOnSvg(e));
            }

            this.isLoading = false;

            this.dialog.closeAll();
        });
    }

    public processschema() {
        this.isLoading = true;

        let params: HttpParams = new HttpParams();

        params = params.set('decoration', this.decoration);
        params = params.set('typeOfModel', this.typeOfModel);
        console.log("para", params);

        localStorage.setItem('preferred_decoration', this.decoration);
        localStorage.setItem('preferred_type_of_model', this.typeOfModel);
        console.log("localstorage", localStorage);


        this.dialog.open(WaitingCircleComponentComponent);

        this.pm4pyServ.getProcessSchema(params).subscribe(data => {
            this.pm4pyJson = data as JSON;
            this.graphdataold = this.pm4pyJson['graph_rep'];
            console.log("graphdata11", this.graphdataold);

            const nodearray = this.graphdataold[1];
            const linkarray = this.graphdataold[2];

            // modifcation of data structure for echarts
            const nodes = nodearray.map(item => {
                const container = {};

                container["name"] = item[0];
                container["type"] = item[1];
                container["start"] = item[2];
                container["end"] = item[3];
                return container;
            });
            var temp = nodes[0]["name"].length;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i]['start'] == true) {
                    nodes[i]['color'] = 'lime';
                } else if (nodes[i]['end'] == true) {
                    nodes[i]['color'] = 'orange';
                } else {
                    nodes[i]['color'] = 'white';
                }
                nodes[i]["id"] = i.toString();
                var str_len = nodes[i]["name"].length;
                if (str_len >= temp) {
                    temp = str_len
                }
            }
            ;
            var max_str_len = temp;
            const links = linkarray.map(item => {
                const container = {};

                container["source"] = item[0].toString();
                container["target"] = item[1].toString();
                return container;
            });
            console.log("nodes", nodes);
            console.log("links", links);
            const graphdata = {
                nodes: nodes,
                edges: links
            };

            // initialize dagre layout algorithm
            var gnew = new dagre.graphlib.Graph();
            gnew.setDefaultEdgeLabel(function () {
                return {};
            });
            gnew.setGraph({
                rankdir: 'TB'
            });
            graphdata.nodes.forEach(function (node) {
                node['label'] = node['name'];
                gnew.setNode(node['id'], {
                    width: 150,
                    height: 50
                });
            });
            graphdata.edges.forEach(function (edge) {
                gnew.setEdge(edge['source'], edge['target']);
            });
            dagre.layout(gnew);

            //assign the dagre algo to the data
            var coord = void 0;
            gnew.nodes().forEach(function (node, i) {
                coord = gnew.node(node);
                graphdata.nodes[i]['x'] = coord.x;
                graphdata.nodes[i]['y'] = coord.y;
            });
            gnew.edges().forEach(function (edge, i) {
                coord = gnew.edge(edge);
                graphdata.edges[i]['startPoint'] = coord.points[0];
                graphdata.edges[i]['endPoint'] = coord.points[coord.points.length - 1];
                graphdata.edges[i]['controlPoints'] = coord.points.slice(1, coord.points.length - 1);
            });
            console.log("newdata1", graphdata);

            // render with echarts
            this.myChart = echarts.init(<HTMLDivElement>document.getElementById('dfg'));
            this.options = {
                animationDurationUpdate: 150,
                animationEasingUpdate: 'quinticInOut',
                series: [
                    {
                        type: 'graph',
                        layout: 'none',
                        // progressiveThreshold: 700,
                        data: graphdata.nodes.map(function (node) {
                            return {
                                x: node['x'],
                                y: node['y'],
                                id: node['id'],
                                name: node['name'],
                                // symbol:'rect',
                                symbolSize: 40,
                                itemStyle: {
                                    normal: {
                                        borderColor: 'steelblue',
                                        borderWidth: 1.5,
                                        color: node['color']
                                    }
                                },
                                label: {
                                    textStyle: {
                                        fontSize: 11,
                                        color: 'black'
                                    },
                                    show: true,
                                    formatter: function (params) {
                                        params = params.data.name;
                                        var maxlength = 6;
                                        if (params.length > maxlength) {
                                            return params.substring(0, maxlength - 1) + '...';
                                        } else {
                                            return params;
                                        }
                                    }

                                }
                            };
                        }),
                        edgeSymbol: ['none', 'arrow'],
                        edges: graphdata.edges.map(function (edge) {
                            return {
                                source: edge['source'],
                                target: edge['target'],
                                label: {
                                    show: false
                                }
                            };
                        }),
                        label: {
                            emphasis: {
                                position: 'right',
                                show: true,
                                textStyle: {
                                    fontSize: 15,
                                    color: 'black'
                                },
                                formatter: function (params) {
                                    params = params.data.name;

                                    return params;
                                }
                            }
                        },
                        roam: true,
                        focusNodeAdjacency: true,
                        lineStyle: {
                            normal: {
                                color: '#828282',
                                width: 0.7,
                                curveness: 0.1,
                                opacity: 0.7
                            }
                        }
                    }
                ]
            };
            this.myChart.setOption(this.options, true);


            this.isLoading = false;

            this.dialog.closeAll();
        });
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
            this.ancestorVariantsNumber = this.logSummaryJson['ancestor_variants_number'];
            this.ancestorCasesNumber = this.logSummaryJson['ancestor_cases_number'];
            this.ancestorEventsNumber = this.logSummaryJson['ancestor_events_number'];
            if (this.ancestorVariantsNumber > 0) {
                this.ratioVariantsNumber = this.thisVariantsNumber / this.ancestorVariantsNumber * 100.0;
                this.ratioCasesNumber = this.thisCasesNumber / this.ancestorCasesNumber * 100.0;
                this.ratioEventsNumber = this.thisEventsNumber / this.ancestorEventsNumber * 100.0;
            } else {
                this.ratioVariantsNumber = 100;
                this.ratioCasesNumber = 100;
                this.ratioEventsNumber = 100;
            }
        });
    }


    manageClickOnSvg(event) {
        console.log("event.target.nodeName");
        console.log(event.target.nodeName);

        if (event.target.nodeName == "text") {
            let thisText = event.target.innerHTML;

            if (thisText.length > 0 && !(thisText == "@@S") && !(thisText == "@@E")) {
                this.targetClass = this.removeAfterLastSpace(event.target.innerHTML);

                console.log(event.target);

                localStorage.setItem("targetClass", this.targetClass);

                this.isStartActivity = this.startActivities.includes(this.targetClass);
                this.isEndActivity = this.endActivities.includes(this.targetClass);

                var menu = document.getElementById('openMenuButton');
                menu.style.display = '';
                menu.style.position = 'fixed';
                menu.style.left = Math.floor(event.pageX) + 'px';
                menu.style.top = Math.floor(event.pageY) + 'px';

                this.appMenu.openMenu();
            }
        } else if (event.target.nodeName == "path") {
            console.log(event.target);
        }
    }

    onMenuClosed(): void {
        var menu = document.getElementById('openMenuButton');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    removeAfterLastSpace(oldString: string) {
        let newString = "";

        let oldStringSplit = oldString.split(" ");

        if (oldStringSplit.length > 0 && oldStringSplit[oldStringSplit.length - 1].length > 0 && oldStringSplit[oldStringSplit.length - 1][0] == '(') {
            let i = 0;
            while (i < oldStringSplit.length - 1) {
                newString = newString + oldStringSplit[i];

                if (i < (oldStringSplit.length - 2)) {
                    newString = newString + " ";
                }
                i++;
            }

            return newString;
        }

        return oldString;
    }

    ngOnInit() {
        /**
         * Method that is called at the initialization of the component
         */
    }

    onResize(event) {
        /**
         * Manages the resizing of a page
         */
    }

    sliderIsChanged(event: any) {
        /**
         * Manages the change to the value selected in the slider
         */
        this.selectedSimplicity = event.value;
        console.log("selecsim", event.value);
        // calls the retrieval of the process schema from the service
        this.populateProcessSchema();
    }

    decorationIsChanged(event: any) {
        /**
         * Manages the change of the type of decoration (frequency/performance)
         */
        this.decoration = event.value;
        // calls the retrieval of the process schema from the service
        this.populateProcessSchema();
        this.processschema();
    }

    typeOfModelIsChanged(event: any) {
        /**
         * Manages the change on the type of the model (discovery algorithm)
         */
        this.typeOfModel = event.value;
        console.log("event", event);
        console.log("eventval", event.value);
        console.log("model", this.typeOfModel);
        // calls the retrieval of the process schema from the service
        this.populateProcessSchema();
        this.processschema();
    }

    mouseWheel(event: any) {
        if (event['deltaY'] < 0) {
            (<HTMLImageElement>document.getElementById('imageProcessModelImage')).height = (<HTMLImageElement>document.getElementById('imageProcessModelImage')).height * 1.1;
            (<HTMLImageElement>document.getElementById('imageProcessModelImage')).width = (<HTMLImageElement>document.getElementById('imageProcessModelImage')).width * 1.1;
        } else {
            (<HTMLImageElement>document.getElementById('imageProcessModelImage')).height = (<HTMLImageElement>document.getElementById('imageProcessModelImage')).height * 0.9;
            (<HTMLImageElement>document.getElementById('imageProcessModelImage')).width = (<HTMLImageElement>document.getElementById('imageProcessModelImage')).width * 0.9;
        }
    }

    uploadFile($event) {
        let reader = new FileReader();
        let filename: string = $event.target.files[0].name;
        let filetype: string = $event.target.files[0].type;

        reader.readAsDataURL($event.target.files[0]);
        reader.onload = () => {
            let processModel: string = atob(reader.result.toString().split("ctet-stream;base64,")[1]);
            localStorage.setItem("process_model", processModel);
            this.router.navigateByUrl("/real-ws/alignments");
        };
    }

    downloadModel($event) {
        this.downloadFile(this.thisProcessModel, "text/csv");
    }

    downloadBpmnModel($event) {
        this.downloadFile(this.thisSecondProcessModel, "text/csv");
    }

    downloadFile(data: string, type: string) {
        const blob = new Blob([data], {type: type});
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }

    visualizeBpmnModel($event) {
        this.dialog.open(PmtkBpmnVisualizerComponent);
    }

    applyTracesContaining() {
        console.log("applyTracesContaining " + this.targetClass);

        this.filterService.addFilter("attributes_pos_trace", [this.activityKey, [this.targetClass]]);
    }

    applyTracesNotContaining() {
        console.log("applyTracesNotContaining " + this.targetClass);

        this.filterService.addFilter("attributes_neg_trace", [this.activityKey, [this.targetClass]]);

    }

    applyTracesStartingWith() {
        console.log("applyTracesStartingWith " + this.targetClass);

        this.filterService.addFilter("start_activities", [this.targetClass]);
    }

    applyTracesEndingWith() {
        console.log("applyTracesEndingWith " + this.targetClass);

        this.filterService.addFilter("end_activities", [this.targetClass]);
    }

    openActivityDashboard() {
        console.log("openActivityDashboard " + this.targetClass);

        this.dialog.open(ActivityDashboardComponent);
    }

    filterLoop() {
        console.log("filterLoop " + this.targetClass);

        this.filterService.addFilter("paths_pos_trace", [this.activityKey, [this.targetClass + "@@" + this.targetClass]]);
    }
}
