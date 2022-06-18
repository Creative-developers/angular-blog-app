import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { Subscription } from "rxjs";

import { AlertService } from "@app/_services";
import { Alert, AlertType } from "@app/_models";

@Component({
  selector: "alert",
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.css"],
})
export class AlertComponent implements OnInit {
  @Input() id = "default-alert";
  @Input() fade: boolean = true;

  alerts: Alert[] = [];
  alertSubscription: Subscription;
  routerSubscription: Subscription;

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit() {
    //subscribe to new alert notifications
    this.alertSubscription = this.alertService.onAlert().subscribe((alert) => {
      if (alert) {
        if (!alert.message) {
          this.alerts = this.alerts.filter((x) => x.keepAfterRouteChange);

          //remove 'keepAfterRouteChange' flag on reset
          this.alerts.forEach((x) => delete x.keepAfterRouteChange);
          return;
        }
        this.alerts.push(alert);

        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 3000);
        }
      }
    });

    //clear alerts on location change
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.alertService.clear();
      }
    });
  }

  ngOnDestroy() {
    //unsubscribe to avoid memory leaks
    if(this.alertSubscription !== undefined) {
      this.alertSubscription.unsubscribe();
      this.routerSubscription.unsubscribe();
    }
  }

  removeAlert(alert: Alert) {
    //check if already removed to prevent error on auto close
    if (!this.alerts.includes(alert)) return;

    if (this.fade) {
      alert.fade = true;

      //remove alert after fade out

      setTimeout(() => {
        this.alerts = this.alerts.filter((x) => x !== alert);
      }, 250);
    } else {
      //remove alert
      this.alerts = this.alerts.filter((x) => x !== alert);
    }
  }

  cssClass(alert: Alert) {
    if (!alert) return;

    const classes = ["alert", "alert-dismissable", "mt-4", "container"];

    const alertTypeClass = {
      [AlertType.Success]: "alert alert-success",
      [AlertType.Error]: "alert alert-danger",
      [AlertType.Info]: "alert alert-info",
      [AlertType.Warning]: "alert alert-warning",
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push("fade");
    }

    return classes.join(" ");
  }
}
