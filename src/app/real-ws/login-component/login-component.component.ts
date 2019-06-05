import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Pm4pyService} from "../../pm4py-service.service";
import {Router} from "@angular/router";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss']
})
export class LoginComponentComponent implements OnInit {
  username : string;
  password : string;
  sanitizer: DomSanitizer;
  pm4pyService: Pm4pyService;
  router: Router;
  public loginTextHint : string;

  constructor(private _route: Router, private _sanitizer: DomSanitizer, private pm4pyServ: Pm4pyService) {
    this.pm4pyService = pm4pyServ;
    this.sanitizer = _sanitizer;
    this.router = _route;

    if (!environment.enableLogin) {
      this.router.navigateByUrl("/real-ws/plist");
    }

    this.username = "";
    this.password = "";
    this.loginTextHint = environment.loginTextHint;
  }

  ngOnInit() {
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      this.login();
      // rest of your code
    }
  }

  login() {
    this.pm4pyService.loginService(this.username, this.password).subscribe(data => {
      let resultJson : JSON = data as JSON;
      console.log(resultJson);

      if (resultJson["status"] == "OK") {
        localStorage.setItem("sessionId", resultJson["sessionId"]);
        localStorage.removeItem("filtersPerProcess");
        this.router.navigateByUrl('/real-ws/plist');
      }
      else {
        alert("Login failed! Try again");
      }
    });
  }

}
