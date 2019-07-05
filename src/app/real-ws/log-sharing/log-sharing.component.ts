import {AuthenticationServiceService} from '../../authentication-service.service';
import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Pm4pyService} from '../../pm4py-service.service';
import {HttpParams} from '@angular/common/http';
import {WaitingCircleComponentComponent} from '../waiting-circle-component/waiting-circle-component.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-log-sharing',
  templateUrl: './log-sharing.component.html',
  styleUrls: ['./log-sharing.component.scss']
})
export class LogSharingComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public sortedUsers : any;
  public sortedLogs : any;
  public userLogVisibilities : any;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService, public dialog: MatDialog) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;

    let dia = this.dialog.open(WaitingCircleComponentComponent);

    this.authService.checkAuthentication().subscribe(data => {
      this.getUserLogVisibility();
      dia.close();
    });


  }

  ngOnInit() {
  }

  getUserLogVisibility() {
    let httpParams : HttpParams = new HttpParams();

    this.pm4pyService.getUserLogVisibilities(httpParams).subscribe(data => {
      let pm4pyJson = data as JSON;

      this.sortedUsers = pm4pyJson["sorted_users"];
      this.sortedLogs = pm4pyJson["sorted_logs"];
      this.userLogVisibilities = pm4pyJson["user_log_visibility"];

      console.log("SORTEDUSERS");
      console.log(this.sortedUsers);
      console.log("SORTEDLOGS");
      console.log(this.sortedLogs);
      console.log("USERLOGVISIBILITIES");
      console.log(this.userLogVisibilities);
    })
  }

}
