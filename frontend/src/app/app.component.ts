import { Component, OnDestroy } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService, AlertService } from "@app/_services";
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnDestroy {
  title = "blog-app";
  subscripton: Subscription;
  routerSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {

   /**
    * Check if token is expired
    */

    if (this.authService.isTokenExpired() && this.authService.token) {
      console.log("Token is expired");
      this.authService.logout();
    }

    /**
     * Check if user is logged in on every route change only if user is logged in
     */
    this.subscripton = router.events.subscribe((e) => {
      if (e instanceof NavigationStart && this.authService.token) {
        console.log("checking token...");
        this.authService.checkAuth();
      }
      if (e instanceof NavigationStart) {
        this.routerSubscription = this.router.events.subscribe((event) => {
          if (event instanceof NavigationStart) {
            //this.alertService.clear();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscripton.unsubscribe();
    this.routerSubscription.unsubscribe();
  }
}
