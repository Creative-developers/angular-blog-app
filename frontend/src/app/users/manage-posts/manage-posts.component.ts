import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Subscription } from "rxjs";
import { DbService, AlertService } from "@app/_services";
import { environment } from "@environments/environment";

import { Post, Alert } from "@app/_models";

@Component({
  selector: "app-manage-posts",
  templateUrl: "./manage-posts.component.html",
  styleUrls: ["./manage-posts.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class ManagePostsComponent implements OnInit {
  public pagePosts: Post[];
  public posts: Post[];
  uploadsUrl = environment.uploadsUrl;
  alertSubscription: Subscription;
  currentPage: number = 1;
  perPage: number = 5;
  totalPosts: number;

  alert: Alert;

  constructor(
    private dbService: DbService,
    private alertService: AlertService
  ) {
    this.dbService.getUserPosts().subscribe({
      next: (response: any) => {
        if (response.posts) {
          this.posts = response.posts;
          this.totalPosts = response.posts.length;
          this.pagePosts = response.posts.slice(
            (this.currentPage - 1) * this.perPage,
            this.currentPage * this.perPage
          );
        }
      },
      error: (err) => {
        console.log(err);
        this.alertService.error(
          err.error.message || "Something went wrong in Loading Posts..."
        );
      },
    });
  }

  ngOnInit() {
    // this.alertSubscription = this.alertService.onAlert().subscribe((alert) => {
    //   console.log("This is test 2...");
    //   if (alert) {
    //      this.alert = alert;
    //   }
    // });
  }

  ngOnDestroy() {
    console.log("manage post component destoryed");
    //  this.alertSubscription.unsubscribe();
    this.alertService.clear();
  }

  // get posts(): Array<any> {
  //   return this._posts;
  // }

  // set posts(posts: Array<Post[]>) {
  //   this.posts = .
  //   );
  // }

  getCategories(categories: any[]) {
    return categories.map((category) => category.name).join(", ");
  }

  changePageNumber(pageNumher: number) {
    this.currentPage = pageNumher;
    this.pagePosts = this.posts.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage
    );
  }

  deletePost(post: Post) {
    this.alertService.clear();
    if (confirm("Are you sure you want to delete")) {
      this.dbService.deletePost(post).subscribe({
        next: (response: any) => {
          this.alertService.success(response.message);
          this.posts = this.posts.filter((p) => p._id !== post._id);
        },
        error: (err) => {
          this.alertService.error(
            err.error.message || "Something went wrong in Deleting Post..."
          );
        },
      });
    }
  }
}
