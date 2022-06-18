import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { DbService, AlertService } from "@app/_services";
import { Subscription } from "rxjs";
import { environment } from "@environments/environment";
import { Post, Category } from "@app/_models";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"],
})
export class PostComponent implements OnInit {
  posts: Post[] = [];
  perPagePosts: Post[] = [];
  postSubscription: Subscription;
  featuredPost: Post;
  loading: boolean = true;
  private uploadsUrl = environment.uploadsUrl;

  currentPage: number = 1;
  perPage: number = 5;
  totalPosts: number = 0;

  constructor(
    private route: ActivatedRoute,
    private db: DbService,
    private alertService: AlertService
  ) {
    this.route.params.subscribe((params) => {
      if (params.category !== undefined) {
        console.log(params.category);
        this.db.getPostsByCategory(params.category).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.posts) {
              console.log(response.posts);
              this.totalPosts = response.posts.length;
              this.featuredPost = response.posts[0];
              this.posts = response.posts;
              this.perPagePosts = response.posts.slice(
                1,
                this.currentPage * this.perPage
              );
            }
          },
          error: (err: any) => {
            this.loading = false;
            //this.alertService.error(err.error.message || 'Something went wrong :( Please try again later!')
            console.error(err);
          },
        });
      } else {
        console.log("no route");
        this.db.getAllPosts().subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.posts) {
              this.totalPosts = response.posts.length;
              this.featuredPost = response.posts[0];
              this.posts = response.posts;
              this.perPagePosts = response.posts.slice(
                1,
                this.currentPage * this.perPage
              );
            }
          },
          error: (err: any) => {
            this.loading = false;
            this.alertService.error(
              err.error.message ||
                "Something went wrong :( Please try again later!"
            );
            console.error(err);
          },
        });
      }
    });
  }

  ngOnInit() {}

  /**
   *
   * @returns Get Catgories
   */

  getPostLink(post: Post) {
    return (
      "/posts/" + post.title.replace(/\s/g, "-").toLowerCase() + "/" + post._id
    );
  }

  getPostImage(post: Post) {
    if (post.featuredImage !== undefined && post.featuredImage !== null) {
      return `${this.uploadsUrl}/posts/${post.featuredImage}`;
    } else {
      return "https://dummyimage.com/850x350/dee2e6/6c757d.jpg&text=No+Image+Available";
    }
  }

  getCategories(categories: any[]) {
    return categories.map((category) => category.name).join(", ");
  }

  parsePostDate(date: string): string {
    return moment(date).format("MMMM Do, YYYY");
  }

  changePageNumber(pageNumber: number) {
    this.currentPage = pageNumber;
    this.perPagePosts = this.posts.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage - 1
    );
  }
}
