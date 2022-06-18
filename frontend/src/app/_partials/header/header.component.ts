import {
  Component,
  OnInit,
  ElementRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { AuthService, DbService, ModalService } from "@app/_services";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { User, Category } from "@app/_models";
declare var window: any;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  openModal: Subject<void> = new Subject<void>();
  user: User;
  categories: Category[];
  routeSubscription: Subscription;

  constructor(
    private _elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private db: DbService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.user = this.authService.userData.userProfile.user || null;
      } else {
        this.user = null;
      }
    });

    this.db.getAll().subscribe(
      (data) => {
        this.categories = data.categories;
        console.log(this.categories);
      },
      (err) => {
        console.error(err);
      }
    );

    // this.routeSubscription = this.router.events.subscribe((event) => {
    //   console.log("yes");
    //   if (event instanceof NavigationStart) {
    //     console.log("yes it is");
    //     this.user = JSON.parse(localStorage.getItem("user"));
    //   }
    // });
  }
  openLoginModal(event) {
    event.preventDefault();
    this.modalService.openModal();
  }

  logout() {
    this.authService.logout();
  }
}
