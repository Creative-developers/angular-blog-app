import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { environment } from "@environments/environment";

import { AlertService, AuthService, DbService } from "@app/_services";
import { Post, Category } from "@app/_models";

@Component({
  selector: "search",
  templateUrl: "./search.component.html",
})
export class SearchComponent implements OnInit {
  search: string = "";
  private uploadsUrl = environment.uploadsUrl;
  posts: Post[] = [];
  perPagePosts: Post[] = [];

  loading: boolean = true;
  currentPage: number = 1;
  perPage: number = 4;
  totalPosts: number = 1;

  constructor(
    private db: DbService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.search = params.keyword;
      if (this.search !== undefined && this.search !== "") this.searchInPosts();
      else {
        this.router.navigate(["/"]);
      }
    });
  }

  searchInPosts() {
    this.db.searchInPosts(this.search).subscribe(
      (response: any) => {
        this.loading = false;
        this.totalPosts = response.total;
        this.posts = response.posts;
        this.perPagePosts = response.posts.slice(
          (this.currentPage - 1) * this.perPage,
          this.currentPage * this.perPage
        );
        console.log(this.perPagePosts);
      },
      (error) => {
        this.loading = false;
        console.error(error);
      }
    );
  }

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
