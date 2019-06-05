import { Component, OnInit } from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {AuthenticationServiceService} from '../../authentication-service.service';

@Component({
  selector: 'app-alignments',
  templateUrl: './alignments.component.html',
  styleUrls: ['./alignments.component.scss']
})
export class AlignmentsComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public isLoading : boolean = true;
  pm4pyJson: JSON;
  projectionImage: SafeResourceUrl;
  tableImage: SafeResourceUrl;
  projectionString : string;
  tableString : string;

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, private authService: AuthenticationServiceService) {
    this.pm4pyService = pm4pyServ;
    this.sanitizer = _sanitizer;

    this.authService.checkAuthentication().subscribe(data => {
    });

    this.populateVisualizations();
  }

  ngOnInit() {
  }

  public populateVisualizations() {
    let model : string = localStorage.getItem("process_model");

    let params : HttpParams = new HttpParams();

    this.pm4pyService.getAlignmentsVisualizations(model, params).subscribe(data => {
      this.pm4pyJson = data as JSON;
      console.log(this.pm4pyJson);
      this.projectionString = this.pm4pyJson["petri"];
      this.tableString = this.pm4pyJson["table"];
      this.projectionImage = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.projectionString);
      this.tableImage = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/svg+xml;base64,' + this.tableString);
      this.isLoading = false;
      this.setImageCorrectSize();
    });
  }

  setImageCorrectSize() {
    /**
     * Sets the correct size of the image decribing the process schema
     */
    let targetWidth: number = (window.innerWidth * 0.65);

    (<HTMLImageElement>document.getElementById('projectionImageImg')).width = targetWidth;
  }

}
