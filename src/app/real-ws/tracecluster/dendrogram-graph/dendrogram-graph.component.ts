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
    encapsulation: ViewEncapsulation.None,
    templateUrl: './dendrogram-graph.component.html',
    styleUrls: ['./dendrogram-graph.component.scss']
})
export class DendrogramGraphComponent implements OnInit {


    dendrogramData: JSON;
    options: any;

    constructor() {

    }


    getDendrogramGraph() {

    }

    ngOnInit() {
        var data3 = {
            'children': [{
                'children': [{
                    'children': [{'children': [], 'name': '7'}, {
                        'children': [],
                        'name': '8'
                    }], 'name': '7-8'
                }, {'children': [{'children': [], 'name': '3'}, {'children': [], 'name': '4'}], 'name': '3-4'}],
                'name': '3-4-7-8'
            }, {
                'children': [{
                    'children': [{'children': [], 'name': '5'}, {'children': [], 'name': '6'}],
                    'name': '5-6'
                }, {'children': [{'children': [], 'name': '1'}, {'children': [], 'name': '2'}], 'name': '1-2'}],
                'name': '1-2-5-6'
            }], 'name': 'root'
        };


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
            name: 'tree1',
            icon: 'rectangle'
        } ,
        {
            name: 'tree2',
            icon: 'rectangle'
        }],
        borderColor: '#c23531'
    },
    series:[
        {
            type: 'tree',

            name: 'tree1',

            data: [data3],

            top: '5%',
            left: '7%',
            bottom: '2%',
            right: '10%',

            symbolSize: 10,

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
    }

}
