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


    this.authService.checkAuthentication().subscribe(data => {
      this.getUserLogVisibility();
    });


  }

  ngOnInit() {
  }

  getUserLogVisibility() {
    let httpParams : HttpParams = new HttpParams();

    let dia = this.dialog.open(WaitingCircleComponentComponent);

    this.pm4pyService.getUserLogVisibilities(httpParams).subscribe(data => {
      let pm4pyJson = data as JSON;

      this.sortedUsers = pm4pyJson["sorted_users"];
      this.sortedLogs = pm4pyJson["sorted_logs"];
      this.userLogVisibilities = pm4pyJson["user_log_visibility"];

      dia.close();
    })
  }

  changeVisibility(user, process) {
    let dia = this.dialog.open(WaitingCircleComponentComponent);

    if (this.userLogVisibilities[user][process]['visibility']) {
      this.userLogVisibilities[user][process]['visibility'] = false;
      console.log("changeVisibility 1");

      dia.close();
    }
    else {
      this.userLogVisibilities[user][process]['visibility'] = true;
      console.log("changeVisibility 2");

      dia.close();
    }
  }

  changeDownloadable(user, process) {
    let dia = this.dialog.open(WaitingCircleComponentComponent);

    if (this.userLogVisibilities[user][process]['downloadable']) {
      this.userLogVisibilities[user][process]['downloadable'] = false;
      console.log("changeDownloadable 1");

      dia.close();
    }
    else {
      this.userLogVisibilities[user][process]['downloadable'] = true;
      console.log("changeDownloadable 2");

      dia.close();
    }
  }

  changeRemovable(user, process) {
    let dia = this.dialog.open(WaitingCircleComponentComponent);

    if (this.userLogVisibilities[user][process]['removable']) {
      this.userLogVisibilities[user][process]['removable'] = false;
      console.log("changeRemovable 1");

      dia.close();
    }
    else {
      this.userLogVisibilities[user][process]['removable'] = true;
      console.log("changeRemovable 2");

      dia.close();
    }
  }

}
