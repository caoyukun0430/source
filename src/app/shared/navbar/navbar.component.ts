import { Component, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import {AuthenticationServiceService} from '../../authentication-service.service';
import {Router, RoutesRecognized} from '@angular/router';
import {HttpParams} from '@angular/common/http';
import {Pm4pyService} from '../../pm4py-service.service';
import {FilterServiceService} from '../../filter-service.service';

import {MatDialog} from '@angular/material';

import {StartActivitiesFilterComponent} from "../../real-ws/start-activities-filter/start-activities-filter.component";
import {EndActivitiesFilterComponent} from "../../real-ws/end-activities-filter/end-activities-filter.component";
import {VariantsFilterComponent} from "../../real-ws/variants-filter/variants-filter.component";
import {AttributesFilterComponent} from "../../real-ws/attributes-filter/attributes-filter.component";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentLang = "en";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  public isCollapsed = true;
  layoutSub: Subscription;
  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  public filters : any;

  public config: any = {};

  public sessionId : string;
  public userId : string;
  public isNotLogin : boolean;
  public enableDownload : boolean;
  public enableUpload : boolean;
  public thisProcess : string;

  public isProcessModelPage : boolean;
  public isPlistPage : boolean;

  public dialog : MatDialog;

  constructor(public translate: TranslateService, private layoutService: LayoutService, private configService:ConfigService, private authService: AuthenticationServiceService, private _route : Router, private pm4pyServ: Pm4pyService, public _dialog: MatDialog, private filterService: FilterServiceService) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : "en");

    this.layoutSub = layoutService.changeEmitted$.subscribe(
      direction => {
        const dir = direction.direction;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
      });

    this.dialog = _dialog;

    this.getFilters();
    _route.events.subscribe((val) => {
      this.getFilters();
    });

    this.sessionId = null;
    this.userId = null;
    this.isNotLogin = false;
    this.enableDownload = false;
    this.enableUpload = false;
    this.thisProcess = null;

    this.isProcessModelPage = false;
    this.isPlistPage = false;

    this._route.events.subscribe((next) => {
      if (next instanceof RoutesRecognized) {
        if (next.url.startsWith("/real-ws/pmodel") || next.url.startsWith("/real-ws/plist") || next.url.startsWith("/real-ws/login")) {
          this.authService.checkAuthentication().subscribe(data => {

            console.log("AAAAAA");
            console.log(data);

            this.sessionId = data.sessionId;
            this.userId = data.userId;
            this.isNotLogin = data.isNotLogin;
            this.enableDownload = data.enableDownload;
            this.enableUpload = data.enableUpload;
            this.thisProcess = localStorage.getItem("process");
          });
        }

        if (next.url.startsWith("/real-ws/pmodel")) {
          this.isProcessModelPage = true;
          this.isPlistPage = false;
        }
        else if (next.url.startsWith("/real-ws/plist")) {
          this.isProcessModelPage = false;
          this.isPlistPage = true;
        }
        else {
          this.isProcessModelPage = false;
          this.isPlistPage = false;
        }
      }
    });
  }

  ngOnInit() {
    this.config = this.configService.templateConf;
  }

  ngAfterViewInit() {
    if(this.config.layout.dir) {
      setTimeout(() => {
        const dir = this.config.layout.dir;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
      }, 0);
     
    }
  }

  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
  }

  public getFilters() {
    this.filters = this.filterService.getFilters();
  }

  ChangeLanguage(language: string) {
    this.translate.use(language);
  }

  ToggleClass() {
    if (this.toggleClass === "ft-maximize") {
      this.toggleClass = "ft-minimize";
    } else {
      this.toggleClass = "ft-maximize";
    }
  }

  toggleNotificationSidebar() {
    this.layoutService.emitNotiSidebarChange(true);
  }

  toggleSidebar() {
    const appSidebar = document.getElementsByClassName("app-sidebar")[0];
    if (appSidebar.classList.contains("hide-sidebar")) {
      this.toggleHideSidebar.emit(false);
    } else {
      this.toggleHideSidebar.emit(true);
    }
  }

  logout() {
    this.authService.doLogout();
  }

  goToHome() {
    this._route.navigateByUrl("/real-ws/plist");
  }

  downloadCSV() {
    let httpParams : HttpParams = new HttpParams();

    this.pm4pyServ.downloadCsvLog(httpParams).subscribe(data => {
      let csvJson : JSON = data as JSON;
      this.downloadFile(csvJson['content'], 'text/csv');
    });
  }

  downloadXES() {
    let httpParams : HttpParams = new HttpParams();

    this.pm4pyServ.downloadXesLog(httpParams).subscribe(data => {
      let xesJson : JSON = data as JSON;
      this.downloadFile(xesJson['content'], 'text/csv');
    });
  }

  downloadFile(data: string, type: string) {
    const blob = new Blob([data], { type: type });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
  }

  uploadFile($event) {
    let reader = new FileReader();
    let filename : string = $event.target.files[0].name;
    let filetype : string = $event.target.files[0].type;
    let extension : string = filename.split(".")[1];
    if (extension === "xes" || extension === "csv") {
      reader.readAsDataURL($event.target.files[0]);
      reader.onload = () => {
        let base64: string = reader.result.toString();
        let data : any = {"filename": filename, "base64": base64};
        this.pm4pyServ.uploadLog(data, new HttpParams()).subscribe(data => {
          let responseJson : JSON = data as JSON;
          if (responseJson["status"] === "OK") {
            if (this._route.url === "/real-ws/plist") {
              this._route.navigateByUrl("/real-ws/plist2");
            }
            else {
              this._route.navigateByUrl("/real-ws/plist");
            }
            //window.location.reload();
          }
          else {
            alert("Something has gone wrong in the upload!");
          }
        })
      }
    }
    else {
      alert("unsupported file type for direct upload!")
    }
  }

  startActivitiesFilter() {
    this.dialog.open(StartActivitiesFilterComponent);
  }

  endActivitiesFilter() {
    this.dialog.open(EndActivitiesFilterComponent);
  }

  variantsFilter() {
    this.dialog.open(VariantsFilterComponent);
  }

  attributesFilter() {
    this.dialog.open(AttributesFilterComponent);
  }
}
