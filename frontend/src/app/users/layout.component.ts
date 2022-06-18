import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AuthService } from "@app/_services";

import { User } from "@app/_models";

@Component({
  selector: "user-layout",
  templateUrl: "./layout.component.html",
})
export class LayoutComponent implements OnInit {
  public user;
  isUserAuthenteicated: boolean = false;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.user = this.authService.userData.userProfile;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const username = params.username;
      if (username === undefined || username !== this.user.user.username) {
        this.isUserAuthenteicated = false;
      } else {
        this.isUserAuthenteicated = true;
      }
    });
  }
}
