import {Component, Input, OnInit, ViewEncapsulation, AfterViewInit, OnChanges} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationServiceService} from '../../../authentication-service.service';
import {WaitingCircleComponentComponent} from '../../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';
import * as d3 from 'd3';
import {json} from "ng2-validation/dist/json";
import * as G6 from '@antv/g6/build/g6';
import * as dagre from 'dagre';

@Component({
    selector: 'app-dendrogram-graph',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './dendrogram-graph.component.html',
    styleUrls: ['./dendrogram-graph.component.scss']
})



export class DendrogramGraphComponent implements OnInit,OnChanges{


    pm4pyJson: JSON;
    sanitizer: DomSanitizer;
    pm4pyService: Pm4pyService;
    dendrogramData: JSON;
    options: any;
    public svg: any;
    public myChart:any;
    public myChart1:any;
    graphdataold:any;

    constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
        this.sanitizer = _sanitizer;
        this.pm4pyService = pm4pyServ;

        this.authService.checkAuthentication().subscribe(data => {
        });


        // calls the construction of the dendrogram graph
    }


    public schema() {

        let params: HttpParams = new HttpParams();


        this.myChart = echarts.init(<HTMLDivElement>document.getElementById('container'));

        this.dialog.open(WaitingCircleComponentComponent);

        this.pm4pyServ.getProcessSchema(params).subscribe(data => {
            this.pm4pyJson = data as JSON;
            this.graphdataold = this.pm4pyJson['graph_rep'];
            console.log("graphdata", this.graphdataold);

            const nodearray = this.graphdataold[1];
            const linkarray = this.graphdataold[2];

            const nodes = nodearray.map(item => {
                const container = {};

                container["name"] = item[0];
                container["type"] = item[1];
                container["start"] = item[2];
                container["end"] = item[3];
                return container;
            });
            var i;
            var temp = nodes[0]["name"].length;
            for (i = 0; i < nodes.length; i++) {
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
            this.options = {
                title: {
                    text: 'NPM Dependencies'
                },
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
                                symbolSize: 30,
                                label: {
                                    normal: {
                                        textStyle: {
                                            fontSize: 12
                                        },
                                        show: true
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
                                show: true
                            }
                        },
                        roam: true,
                        focusNodeAdjacency: true,
                        lineStyle: {
                            normal: {
                                color: 'source',
                                width: 0.7,
                                curveness: 0.1,
                                opacity: 0.7
                            }
                        }
                    }
                ]
            };
            this.myChart.setOption(this.options);


        });
    }

    render() {
        var data1 = {
            nodes: [
                {id: 0, name: 'a', group: 0, count: 4},
                {id: 1, name: 'b', group: 0, count: 0},
                {id: 2, name: 'c', group: 0, count: 0},
                {id: 3, name: 'i', group: 0, count: 0},
                {id: 4, name: 'j', group: 0, count: 0},
                {id: 5, name: '^', group: 0, count: 0},

                {id: 6, name: 'x', group: 1},
                {id: 7, name: 'y', group: 1},
                {id: 8, name: 'z', group: 1},
                {id: 9, name: '!', group: 1}
            ],
            edges: [
                {source: 0, target: 9},
                {source: 9, target: 1},
                {source: 1, target: 6},
                {source: 6, target: 2},
                {source: 6, target: 3},
                {source: 2, target: 8},
                {source: 3, target: 7},
                {source: 7, target: 4},
                {source: 4, target: 8},
                {source: 8, target: 5}
            ]
        };

        const newnodes = data1.nodes.map(item => {
            const container = {};
            container['id'] = item.id.toString();
            container['name'] = item.name;

            return container;
        });

        const newedges = data1.edges.map(item => {
            const container = {};
            container['source'] = item.source.toString();
            container['target'] = item.target.toString();

            return container;
        });
        const graphdata = {
            nodes: newnodes,
            edges: newedges
        };
        console.log("newdata", graphdata);

//   var data = {
//     nodes: [{
//       id: '0'
//   }, {
//       id: '入 es 集群'
//   }, {
//       id: '入 hdfs'
//   }, {
//       id: 'hive 计算'
//   }, {
//       id: 'report'
//   }],
//     edges: [{
//       source: '0',
//       target: '入 es 集群'
//   }, {
//       source: '0',
//       target: '入 hdfs'
//   }, {
//       source: '入 hdfs',
//       target: 'hive 计算'
//   }, {
//       source: '入 es 集群',
//       target: 'hive 计算'
//   }, {
//       source: 'hive 计算',
//       target: 'report'
//   }]
//   };
        var g = new dagre.graphlib.Graph();
        g.setDefaultEdgeLabel(function () {
            return {};
        });
        g.setGraph({
            rankdir: 'TB'
        });
        graphdata.nodes.forEach(function (node) {
            node['label'] = node['id'];
            g.setNode(node['id'], {
                width: 150,
                height: 50
            });
        });
        graphdata.edges.forEach(function (edge) {
            g.setEdge(edge['source'], edge['target']);
        });
        dagre.layout(g);
        var coord = void 0;
        g.nodes().forEach(function (node, i) {
            coord = g.node(node);
            graphdata.nodes[i]['x'] = coord.x;
            graphdata.nodes[i]['y'] = coord.y;
        });
        g.edges().forEach(function (edge, i) {
            coord = g.edge(edge);
            graphdata.edges[i]['startPoint'] = coord.points[0];
            graphdata.edges[i]['endPoint'] = coord.points[coord.points.length - 1];
            graphdata.edges[i]['controlPoints'] = coord.points.slice(1, coord.points.length - 1);
        });

        this.myChart1 = echarts.init(<HTMLDivElement>document.getElementById('dfgnew'));


            this.options = {
                title: {
                    text: 'NPM Dependencies'
                },
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
                                symbolSize: 30,
                                label: {
                                    normal: {
                                        textStyle: {
                                            fontSize: 12
                                        },
                                        show: true
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
                                    show: true
                                }
                            };
                        }),
                        label: {
                            emphasis: {
                                position: 'right',
                                show: true
                            }
                        },
                        roam: true,
                        focusNodeAdjacency: true,
                        lineStyle: {
                            normal: {
                                color: 'source',
                                width: 0.7,
                                curveness: 0.1,
                                opacity: 0.7
                            }
                        }
                    }
                ]
            };
            this.myChart1.setOption(this.options);


        // this is where make the rect fansy
        // G6.registerNode('operation', {
        //     drawShape: function drawShape(cfg, group) {
        //         var rect = group.addShape('rect', {
        //             attrs: {
        //                 x: -75,
        //                 y: -25,
        //                 width: 150,
        //                 height: 50,
        //                 radius: 10,
        //                 stroke: '#00C0A5',
        //                 fill: '#92949F',
        //                 fillOpacity: 0.45,
        //                 lineWidth: 2
        //             }
        //         });
        //         return rect;
        //     }
        // }, 'single-shape');
        //
        // var graph = new G6.Graph({
        //     container: 'dfg',
        //     width: window.innerWidth,
        //     height: window.innerHeight,
        //     pixelRatio: 2,
        //     modes: {
        //         default: ['drag-canvas', 'zoom-canvas']
        //     },
        //     defaultNode: {
        //         shape: 'operation',
        //         labelCfg: {
        //             style: {
        //                 fill: '#666',
        //                 fontSize: 14,
        //                 fontWeight: 'bold'
        //             }
        //         }
        //     },
        //     defaultEdge: {
        //         shape: 'polyline'
        //     },
        //     edgeStyle: {
        //         default: {
        //             endArrow: true,
        //             lineWidth: 2,
        //             stroke: '#ccc'
        //         }
        //     }
        // });
        // graph.data(graphdata);
        // graph.render();
        // graph.fitView();
    };


// getDendrogramGraph() {
//         var width = 900;
//         var height = 450;
//         this.svg = d3.select("#dfg")
//             .append("svg")
//         .attr("width", width)
//         .attr("height",height);
//         // this.svg = d3.select("svg");
//         // var width = this.svg.attr("width");
//         // var height = this.svg.attr("height");
//
//         var simulation = d3.forceSimulation()
//     .force("link", d3.forceLink())
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(width / 2, height / 2));
//
//     var graph = {
//       "nodes": [
//         { id:0, name: 'a', group: 0, count: 4 },
//         { id:1, name: 'b', group: 0, count: 0 },
//         { id:2, name: 'c', group: 0, count: 0 },
//         { id:3, name: 'i', group: 0, count: 0 },
//         { id:4, name: 'j', group: 0, count: 0 },
//         { id:5, name: '^', group: 0, count: 0 },
//
//         { id:6, name: 'x', group: 1 },
//         { id:7, name: 'y', group: 1 },
//         { id:8, name: 'z', group: 1 },
//         { id:9, name: '!', group: 1 }
//       ],
//       "links": [
//         { source: 0, target: 9 },
//         { source: 9, target: 1 },
//         { source: 1, target: 6 },
//         { source: 6, target: 2 },
//         { source: 6, target: 3 },
//         { source: 2, target: 8 },
//         { source: 3, target: 7 },
//         { source: 7, target: 4 },
//         { source: 4, target: 8 },
//         { source: 8, target: 5 }
//       ]
//     };
//
//     var places = graph.nodes.filter(node=>node.group==0);
//     var trans = graph.nodes.filter(node=>node.group==1);
//     var radius=10;
//
//     console.log("places",places);
//     console.log("trans",trans);
//     console.log("links",graph.links);
//
//     var link = this.svg.append("g")
//                 .attr("class", "links")
//                 .selectAll("line")
//                 .data(graph.links)
//                 .enter()
//                 .append("line");
//                 //.style("stroke", "#aaa");
//
//                 var linksText = this.svg.append("g")
//                 .attr("class", "links")
//                 .selectAll("text")
//                 .data(graph.links)
//                 .enter()
//                 .append("text")
//                 .text(function(d,i){
//                     return i+1;
//                 });
//     var circles = this.svg.selectAll("circle")
//     		.data(places)
//     		.enter()
//     		.append("g")
//             .attr( "class", "nodes" )
//     		.call(d3.drag()
//           .on("start", dragstarted)
//           .on("drag", dragged)
//           .on("end", dragended));
//
//       circles.append("circle")
//         .attr('r', radius);
//
//         circles.append("text")
//     		.text(function(d){
//     			return d.name;
//     		});
//
//     var rects = this.svg.selectAll("rect")
//     		.data(trans)
//     		.enter()
//     		.append("g")
//             .attr( "class", "nodes" )
//     		.call(d3.drag()
//           .on("start", dragstarted)
//           .on("drag", dragged)
//           .on("end", dragended));
//
//       rects.append("rect")
//         .attr( "width", radius )
//         .attr( "height", radius );
//
//
//         rects.append("text")
//     		.text(function(d){
//     			return d.name;
//     		});
//
//         simulation
//       .nodes(graph.nodes)
//       .on("tick", ticked);
//
//   simulation.force("link")
//       .links(graph.links);
//
//   function ticked() {
//     link
//         .attr("x1", function(d) { return d.source.x; })
//         .attr("y1", function(d) { return d.source.y; })
//         .attr("x2", function(d) { return d.target.x; })
//         .attr("y2", function(d) { return d.target.y; });
//
//         linksText
//             // .attr("x",function(d){return d.x-5;})
//             // .attr("y",function(d){return d.y-5;});
//
//     			.attr("x",function(d){
//     			return (d.source.x+d.target.x)/2;
//     		})
//     		.attr("y",function(d){
//     			return (d.source.y+d.target.y)/2;
//     		});
//
//
//
//     rects
//     .attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
//
//     circles
//     // .attr("cx", function(d) { return d.x; })
//     //     .attr("cy", function(d) { return d.y; });
//     .attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
//   }
//
// function dragstarted(d) {
//   if (!d3.event.active) simulation.alphaTarget(1).restart();
//   d.fx = d.x;
//   d.fy = d.y;
// }
//
// function dragged(d) {
//   d.fx = d3.event.x;
//   d.fy = d3.event.y;
// }
//
// function dragended(d) {
//   if (!d3.event.active) simulation.alphaTarget(0);
//   d.fx = null;
//   d.fy = null;
// }
//
//     }

    ngOnInit() {
        // this.getDendrogramGraph()
        // // this.render();
        this.schema();

    }
    ngOnChanges(){
        // this.schema();
    }

}
