import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {HttpParams} from "@angular/common/http";
import { FilterServiceService } from '../../filter-service.service';

@Component({
  selector: 'app-variants-filter',
  templateUrl: './variants-filter.component.html',
  styleUrls: ['./variants-filter.component.scss']
})
export class VariantsFilterComponent implements OnInit {
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  public  variants : any[];
  public selectedVariants : any[];

  constructor(private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService, public filterService : FilterServiceService) {
    this.sanitizer = _sanitizer;
    this.pm4pyService = pm4pyServ;
    this.selectedVariants = [];
    this.filterService = filterService;
    this.getVariants();
  }

  ngOnInit() {
  }

  getVariants() {
    let params: HttpParams = new HttpParams();
    this.pm4pyService.getAllVariants(params).subscribe(data => {
      let pm4pyJsonVariants : JSON = data as JSON;
      this.variants = pm4pyJsonVariants["variants"];
      /*let i : number = 0;
      while (i < this.variants.length) {
        let keys : string[] = Object.keys(this.variants[i]);
        this.variants[i] = {"variant": this.variants[i]["variant"], "count": this.variants[i]["variant"]};
        i++;
      }*/
      console.log(this.variants);
    });
  }

  addRemoveVariant(sa) {
    if (!this.selectedVariants.includes(sa)) {
      this.selectedVariants.push(sa);
    }
    else {
      let thisIndex : number = this.selectedVariants.indexOf(sa, 0);
      this.selectedVariants.splice(thisIndex, 1);
    }
  }

  applyFilter() {
    this.filterService.addFilter("variants", this.selectedVariants);
  }

}
